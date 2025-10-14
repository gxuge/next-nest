import { Injectable, BadRequestException } from '@nestjs/common';
import {
  FilterImagesDto,
  FilterImagesResponseDto,
  ImageStats,
  KeptImage,
} from './dto/filter-images.dto';
import {
  ConvertImageDto,
  ConvertImageResponseDto,
} from './dto/convert-image.dto';
import * as http from 'http';
import * as https from 'https';
import * as sharp from 'sharp';

@Injectable()
export class ImageFilterService {
  /**
   * 过滤HTML中的图片
   */
  async filterImages(
    filterDto: FilterImagesDto,
  ): Promise<FilterImagesResponseDto> {
    const { content, blacklistUrls = [], minSizeKB = 15 } = filterDto;

    if (!content) {
      return {
        filteredHtml: content,
        stats: { total: 0, removed: 0, kept: 0, reasons: {} },
        removedImages: [],
        keptImages: [],
      };
    }

    const removedImages: { src: string; reason: string }[] = [];
    const keptImages: KeptImage[] = [];

    // 统计信息
    const stats: ImageStats = {
      total: 0,
      removed: 0,
      kept: 0,
      reasons: {},
    };

    // 先处理HTML中的转义符
    let processedHtml = this.unescapeHtml(content);

    // 提取所有img标签
    const imgTags = this.extractImgTags(processedHtml);
    stats.total = imgTags.length;

    // 临时保存所有需要替换的操作，以便最后统一处理
    const replacementOperations: Array<{
      index: number;
      length: number;
      replacement: string;
      imgTag: { fullTag: string; src: string; index: number };
      isKept: boolean;
    }> = [];

    // 处理每个图片标签
    for (const imgTag of imgTags) {
      try {
        const src = imgTag.src;

        // 1. 检查是否在黑名单中
        if (this.isInBlacklist(src, blacklistUrls)) {
          replacementOperations.push({
            index: imgTag.index,
            length: imgTag.fullTag.length,
            replacement: '',
            imgTag,
            isKept: false,
          });
          stats.removed++;
          if (!stats.reasons.blacklist) stats.reasons.blacklist = 0;
          stats.reasons.blacklist++;
          removedImages.push({ src, reason: 'blacklist' });
          continue;
        }

        // 2. 检查是否为GIF
        if (this.isGifUrl(src)) {
          replacementOperations.push({
            index: imgTag.index,
            length: imgTag.fullTag.length,
            replacement: '',
            imgTag,
            isKept: false,
          });
          stats.removed++;
          if (!stats.reasons.gif) stats.reasons.gif = 0;
          stats.reasons.gif++;
          removedImages.push({ src, reason: 'gif' });
          continue;
        }

        // 3. 获取图片信息并检查大小
        const imageInfo = await this.getImageInfo(src);

        if (imageInfo.size <= minSizeKB * 1024) {
          replacementOperations.push({
            index: imgTag.index,
            length: imgTag.fullTag.length,
            replacement: '',
            imgTag,
            isKept: false,
          });
          stats.removed++;
          if (!stats.reasons.size) stats.reasons.size = 0;
          stats.reasons.size++;
          removedImages.push({ src, reason: 'size' });
        } else {
          // 保留的图片 - 先临时标记，稍后生成占位符
          replacementOperations.push({
            index: imgTag.index,
            length: imgTag.fullTag.length,
            replacement: '', // 稍后会被更新
            imgTag,
            isKept: true,
          });
          stats.kept++;
        }
      } catch (error) {
        // 处理错误（如网络错误、无效URL等）
        replacementOperations.push({
          index: imgTag.index,
          length: imgTag.fullTag.length,
          replacement: '',
          imgTag,
          isKept: false,
        });
        stats.removed++;
        if (!stats.reasons.error) stats.reasons.error = 0;
        stats.reasons.error++;
        removedImages.push({ src: imgTag.src, reason: 'error' });
        console.log(`Error processing image ${imgTag.src}: ${error.message}`);
      }
    }

    // 为保留的图片生成占位符和索引
    const keptOperations = replacementOperations.filter((op) => op.isKept);
    keptOperations.forEach((operation, index) => {
      const placeholderTag = `<img${index + 1}/>`;
      operation.replacement = placeholderTag;

      // 提取图片的上下文文本
      const contextInfo = this.extractImageContext(
        operation.imgTag,
        imgTags,
        processedHtml,
      );

      // 添加到keptImages数组
      keptImages.push({
        src: operation.imgTag.src,
        tag: placeholderTag,
        context: contextInfo.context,
        contextMeta: contextInfo.meta,
      });
    });

    // 按索引降序排序，从后向前替换，避免索引变化问题
    replacementOperations.sort((a, b) => b.index - a.index);

    // 执行所有替换操作
    for (const operation of replacementOperations) {
      processedHtml =
        processedHtml.substring(0, operation.index) +
        operation.replacement +
        processedHtml.substring(operation.index + operation.length);
    }

    return {
      filteredHtml: processedHtml,
      stats: stats,
      removedImages,
      keptImages,
    };
  }

  /**
   * 处理转义符和反斜杠
   */
  private unescapeHtml(html: string): string {
    if (!html) return '';

    return html
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      .replace(/\\\//g, '/')
      .replace(/\\\\/g, '\\')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');
  }

  /**
   * 检查URL是否在黑名单中
   */
  private isInBlacklist(url: string, blacklist: string[]): boolean {
    const cleanUrl = this.unescapeHtml(url).toLowerCase();
    return blacklist.some((blackItem) =>
      cleanUrl.includes(this.unescapeHtml(blackItem).toLowerCase()),
    );
  }

  /**
   * 检查URL是否指向GIF
   */
  private isGifUrl(url: string): boolean {
    const cleanUrl = this.unescapeHtml(url).toLowerCase();

    // 检查文件扩展名
    if (cleanUrl.endsWith('.gif')) return true;

    // 检查URL参数
    if (
      cleanUrl.includes('wx_fmt=gif') ||
      cleanUrl.includes('format=gif') ||
      cleanUrl.includes('type=gif')
    ) {
      return true;
    }

    // 检查URL路径中的关键词
    const gifKeywords = ['gif', 'animated', 'animation', '动态图'];
    if (gifKeywords.some((keyword) => cleanUrl.includes(keyword))) {
      return true;
    }

    return false;
  }

  /**
   * 获取图片信息（大小和类型）
   */
  private getImageInfo(
    url: string,
  ): Promise<{ size: number; type: string; url: string }> {
    return new Promise((resolve, reject) => {
      // 处理转义符
      const cleanUrl = this.unescapeHtml(url);

      if (!cleanUrl.startsWith('http')) {
        reject(new Error('Invalid URL'));
        return;
      }

      // 选择正确的协议模块
      const httpModule = cleanUrl.startsWith('https') ? https : http;

      // 设置请求头，特别是User-Agent，模拟浏览器访问
      const options = {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
          Referer: 'https://mp.weixin.qq.com/',
        },
      };

      const req = httpModule.get(cleanUrl, options, (res) => {
        // 处理重定向
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          // 递归处理重定向
          this.getImageInfo(res.headers.location).then(resolve).catch(reject);
          return;
        }

        if (res.statusCode !== 200) {
          // 如果状态码不是200，也认为是错误
          req.destroy();
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }

        const contentLength = parseInt(res.headers['content-length'], 10);
        const contentType = res.headers['content-type'] || '';

        resolve({
          size: isNaN(contentLength) ? 0 : contentLength,
          type: contentType,
          url: cleanUrl,
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  /**
   * 使用正则表达式提取所有img标签
   */
  private extractImgTags(
    html: string,
  ): Array<{ fullTag: string; src: string; index: number }> {
    const imgRegex = /<img[^>]+src="([^">]+)"[^>]*>/g;
    const matches = [];
    let match;

    while ((match = imgRegex.exec(html)) !== null) {
      matches.push({
        fullTag: match[0],
        src: match[1],
        index: match.index,
      });
    }

    return matches;
  }

  /**
   * 提取图片的上下文文本
   * 使用相邻图片边界检测，避免不同图片的上下文混淆
   */
  private extractImageContext(
    currentImg: { fullTag: string; src: string; index: number },
    allImgTags: Array<{ fullTag: string; src: string; index: number }>,
    html: string,
  ): {
    context: { before: string; after: string; full: string };
    meta: {
      beforeChars: number;
      afterChars: number;
      truncatedBefore: boolean;
      truncatedAfter: boolean;
    };
  } {
    const CONTEXT_CHARS = 500; // 默认前后各提取500字符

    // 找到前一张和后一张图片
    const prevImg = allImgTags
      .filter((img) => img.index < currentImg.index)
      .sort((a, b) => b.index - a.index)[0]; // 最近的前一张

    const nextImg = allImgTags
      .filter((img) => img.index > currentImg.index)
      .sort((a, b) => a.index - b.index)[0]; // 最近的后一张

    // 计算安全的提取起始位置（图片之前）
    const idealStartIndex = currentImg.index - CONTEXT_CHARS;
    let actualStartIndex = Math.max(0, idealStartIndex);

    // 如果前面有图片，不能越过那张图片的结束位置
    if (prevImg) {
      const prevImgEnd = prevImg.index + prevImg.fullTag.length;
      actualStartIndex = Math.max(actualStartIndex, prevImgEnd);
    }

    // 计算安全的提取结束位置（图片之后）
    const currentImgEnd = currentImg.index + currentImg.fullTag.length;
    const idealEndIndex = currentImgEnd + CONTEXT_CHARS;
    let actualEndIndex = Math.min(html.length, idealEndIndex);

    // 如果后面有图片，不能越过那张图片的开始位置
    if (nextImg) {
      actualEndIndex = Math.min(actualEndIndex, nextImg.index);
    }

    // 提取before和after的HTML片段
    const beforeHtml = html.substring(actualStartIndex, currentImg.index);
    const afterHtml = html.substring(currentImgEnd, actualEndIndex);

    // 清理HTML标签，提取纯文本
    const beforeText = this.cleanHtmlToText(beforeHtml);
    const afterText = this.cleanHtmlToText(afterHtml);

    // 计算实际提取的字符数
    const actualBeforeChars = currentImg.index - actualStartIndex;
    const actualAfterChars = actualEndIndex - currentImgEnd;

    // 判断是否被截断
    const truncatedBefore = !!prevImg && actualStartIndex > idealStartIndex;
    const truncatedAfter = !!nextImg && actualEndIndex < idealEndIndex;

    return {
      context: {
        before: beforeText,
        after: afterText,
        full: beforeText + (beforeText && afterText ? ' ' : '') + afterText,
      },
      meta: {
        beforeChars: actualBeforeChars,
        afterChars: actualAfterChars,
        truncatedBefore,
        truncatedAfter,
      },
    };
  }

  /**
   * 清理HTML标签，提取纯文本
   */
  private cleanHtmlToText(html: string): string {
    if (!html) return '';

    let text = html;

    // 1. 移除 script 和 style 标签及其内容
    text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

    // 2. 移除所有HTML标签
    text = text.replace(/<[^>]+>/g, ' ');

    // 3. 转换HTML实体
    text = text
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&ldquo;/g, '"')
      .replace(/&rdquo;/g, '"')
      .replace(/&lsquo;/g, "'")
      .replace(/&rsquo;/g, "'")
      .replace(/&mdash;/g, '—')
      .replace(/&ndash;/g, '–');

    // 4. 清理多余的空白字符
    text = text
      .replace(/\s+/g, ' ') // 多个空白字符替换为单个空格
      .replace(/\n\s*\n/g, '\n') // 多个换行替换为单个换行
      .trim(); // 去除首尾空白

    // 5. 限制最大长度（可选，防止过长）
    const MAX_LENGTH = 1000;
    if (text.length > MAX_LENGTH) {
      text = text.substring(0, MAX_LENGTH) + '...';
    }

    return text;
  }

  /**
   * 转换图片为JPEG格式
   */
  async convertToJpeg(
    convertDto: ConvertImageDto,
  ): Promise<ConvertImageResponseDto> {
    const { imageData, quality = 95 } = convertDto;

    // 验证 imageData 是否存在
    if (!imageData) {
      throw new BadRequestException('图片转换失败: imageData 参数不能为空');
    }

    // 处理 n8n 传递的对象格式（包含 data、mimeType 等字段）
    let base64Data: string;
    if (typeof imageData === 'object' && imageData !== null) {
      // 如果是对象，尝试提取 data 字段
      const imageObj = imageData as any;
      if ('data' in imageObj && typeof imageObj.data === 'string') {
        base64Data = imageObj.data;
        console.log(
          `接收到对象格式的图片数据，已提取 data 字段 (${base64Data.length} 字符)`,
        );
      } else {
        throw new BadRequestException(
          '图片转换失败: imageData 对象中缺少有效的 data 字段',
        );
      }
    } else if (typeof imageData === 'string') {
      // 如果是字符串，直接使用
      base64Data = imageData;
    } else {
      throw new BadRequestException(
        '图片转换失败: imageData 必须是字符串或包含 data 字段的对象',
      );
    }

    // 验证 base64Data 是否为有效的字符串
    if (!base64Data || !base64Data.trim()) {
      throw new BadRequestException('图片转换失败: base64 数据不能为空');
    }

    try {
      // 解码base64数据
      const inputBuffer = Buffer.from(base64Data, 'base64');
      const originalSize = inputBuffer.length;

      // 获取原始图片元数据
      const metadata = await sharp(inputBuffer).metadata();
      const originalFormat = `image/${metadata.format || 'unknown'}`;

      // 转换为JPEG
      const jpegBuffer = await sharp(inputBuffer).jpeg({ quality }).toBuffer();

      const convertedSize = jpegBuffer.length;

      return {
        imageData: jpegBuffer.toString('base64'),
        originalFormat,
        convertedFormat: 'image/jpeg',
        originalSize,
        convertedSize,
      };
    } catch (error) {
      throw new BadRequestException(`图片转换失败: ${error.message}`);
    }
  }
}
