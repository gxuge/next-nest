import { Injectable } from '@nestjs/common';
import {
  FilterImagesDto,
  FilterImagesResponseDto,
  ImageStats,
  KeptImage,
} from './dto/filter-images.dto';
import * as http from 'http';
import * as https from 'https';

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
    const keptOperations = replacementOperations.filter(op => op.isKept);
    keptOperations.forEach((operation, index) => {
      const placeholderTag = `<img${index + 1}/>`;
      operation.replacement = placeholderTag;
      
      // 添加到keptImages数组
      keptImages.push({
        src: operation.imgTag.src,
        tag: placeholderTag,
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
}
