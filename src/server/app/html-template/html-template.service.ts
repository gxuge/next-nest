import { Injectable, NotFoundException } from '@nestjs/common';
import { JSDOM } from 'jsdom';
import {
  getTemplateById,
  getAllTemplates,
  TemplateConfig,
} from './templates';

@Injectable()
export class HtmlTemplateService {
  /**
   * 根据模板ID获取模板配置
   * @param templateId 模板ID
   * @returns 模板配置
   * @throws NotFoundException 如果模板不存在
   */
  getTemplateById(templateId: string): TemplateConfig {
    const template = getTemplateById(templateId);
    if (!template) {
      throw new NotFoundException(`模板 '${templateId}' 不存在`);
    }
    return template;
  }

  /**
   * 获取所有可用的模板列表
   * @returns 模板配置数组
   */
  getAllTemplates(): TemplateConfig[] {
    return getAllTemplates();
  }

  /**
   * 从JSON数据填充HTML模板（支持templateId或自定义jsonData）
   * @param htmlTemplate HTML模板字符串
   * @param jsonData JSON数据对象（可选，如果提供templateId则从预设模板加载）
   * @param templateId 预设模板ID（可选）
   * @returns 填充后的HTML字符串
   */
  populateHTMLFromJSON(
    htmlTemplate: string,
    jsonData?: Record<string, any>,
    templateId?: string,
  ): string {
    // 如果提供了templateId，使用预设模板
    let finalJsonData: Record<string, any>;
    if (templateId) {
      const template = this.getTemplateById(templateId);
      finalJsonData = template.data;
    } else if (jsonData) {
      finalJsonData = jsonData;
    } else {
      throw new Error('必须提供 templateId 或 jsonData 参数之一');
    }
    // 预处理jsonData，修复可能存在的HTML实体编码问题
    const preprocessedJsonData = this.preprocessJsonData(finalJsonData);

    // 创建一个JSDOM实例来操作HTML
    const dom = new JSDOM(`<!DOCTYPE html><body><div id="root"></div></body>`);
    const document = dom.window.document;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlTemplate;

    // 存储原始标签内容的映射
    const originalContents: Record<string, string> = {};

    // 首先收集所有原始标签的内容
    const collectOriginalContents = (element: Element, prefix = '') => {
      const children = element.children;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const tagName = child.tagName.toLowerCase();
        const fullPath = prefix ? `${prefix}.${tagName}` : tagName;

        // 存储原始内容
        originalContents[fullPath] = child.innerHTML;
        originalContents[tagName] = child.innerHTML; // 同时存储简化的路径

        // 如果有子元素，递归收集
        if (child.children.length > 0) {
          collectOriginalContents(child, fullPath);
        }
      }
    };

    // 递归函数来处理嵌套结构
    const populateElement = (
      element: Element,
      data: Record<string, any>,
      path = '',
    ) => {
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const value = data[key];
          const currentPath = path ? `${path}.${key}` : key;

          // 查找对应的标签
          const targetElement = element.querySelector(key);

          if (targetElement) {
            if (typeof value === 'string') {
              // 替换占位符并设置HTML内容
              const processedValue = replacePlaceholders(value, currentPath);
              replaceElementWithContent(targetElement, processedValue);
            } else if (typeof value === 'object' && value !== null) {
              if (key === 'summary') {
                // 特殊处理summary字段
                handleSummary(targetElement, value, currentPath);
              } else {
                // 递归处理嵌套对象
                populateElement(targetElement, value, currentPath);
              }
            }
          }
        }
      }
    };

    // 替换占位符
    const replacePlaceholders = (
      htmlString: string,
      fieldPath: string,
    ): string => {
      // 获取原始内容
      const originalContent = originalContents[fieldPath] || '';

      // 替换所有占位符（字段名）
      const fieldName = fieldPath.split('.').pop() || '';
      return htmlString.replace(
        new RegExp(`{{${fieldName}}}`, 'g'),
        originalContent,
      );
    };

    // 替换整个元素，只保留内容
    const replaceElementWithContent = (element: Element, content: string) => {
      const parent = element.parentNode;
      if (parent) {
        // 创建临时容器来解析HTML内容
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = content;

        // 将解析后的内容插入到元素之前
        while (tempContainer.firstChild) {
          parent.insertBefore(tempContainer.firstChild, element);
        }

        // 移除原始元素
        parent.removeChild(element);
      }
    };

    // 特殊处理summary字段
    const handleSummary = (
      summaryElement: Element,
      summaryData: Record<string, any>,
      path: string,
    ) => {
      const parent = summaryElement.parentNode;

      if (summaryData.outer) {
        // 替换outer中的占位符
        const processedOuter = replacePlaceholders(summaryData.outer, path);

        // 创建临时容器来解析outer HTML
        const outerContainer = document.createElement('div');
        outerContainer.innerHTML = processedOuter;

        // 处理inner替换 - 在outer内容中查找{{inner}}占位符
        if (summaryData.inner && typeof summaryData.inner === 'object') {
          // 查找所有包含"{{inner}}"占位符的文本节点
          const walker = document.createTreeWalker(
            outerContainer,
            4, // NodeFilter.SHOW_TEXT
            null,
          );

          const textNodes: Node[] = [];
          let node: Node | null;
          while ((node = walker.nextNode())) {
            if (node.nodeValue && node.nodeValue.includes('{{inner}}')) {
              textNodes.push(node);
            }
          }

          // 替换包含"{{inner}}"的文本节点
          textNodes.forEach((textNode) => {
            const textParent = textNode.parentNode;
            if (textParent && textParent.nodeType === 1) {
              // Node.ELEMENT_NODE
              // 创建inner容器
              const innerContainer = document.createElement('div');
              innerContainer.className = 'inner-container';
              textParent.replaceChild(innerContainer, textNode);

              // 在inner容器中创建inner标签结构
              innerContainer.innerHTML = '<inner></inner>';
              const innerElement = innerContainer.querySelector('inner');

              if (innerElement) {
                // 将原始summary中的内容复制到innerElement中
                innerElement.innerHTML = summaryElement.innerHTML;

                // 递归填充inner内容
                populateElement(
                  innerElement,
                  summaryData.inner,
                  `${path}.inner`,
                );

                // 将inner容器的内容直接插入，移除容器本身
                while (innerContainer.firstChild) {
                  textParent.insertBefore(
                    innerContainer.firstChild,
                    innerContainer,
                  );
                }
                textParent.removeChild(innerContainer);
              }
            }
          });
        }

        // 将处理后的outer内容插入到summary之前，然后移除summary元素
        if (parent) {
          while (outerContainer.firstChild) {
            parent.insertBefore(outerContainer.firstChild, summaryElement);
          }
          parent.removeChild(summaryElement);
        }
      }
    };

    // 首先收集所有原始内容
    collectOriginalContents(tempDiv);

    // 开始填充数据
    populateElement(tempDiv, preprocessedJsonData);

    return tempDiv.innerHTML;
  }

  /**
   * 预处理JSON数据，修复HTML实体编码问题
   * @param data JSON数据对象
   * @returns 处理后的JSON数据对象
   */
  private preprocessJsonData(data: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const value = data[key];

        if (typeof value === 'string') {
          // 解码HTML实体，特别是引号
          result[key] = this.decodeHTMLEntities(value);
        } else if (typeof value === 'object' && value !== null) {
          // 递归处理嵌套对象
          result[key] = this.preprocessJsonData(value);
        } else {
          result[key] = value;
        }
      }
    }

    return result;
  }

  /**
   * 解码HTML实体和转义字符
   * @param html 包含HTML实体的字符串
   * @returns 解码后的字符串
   */
  private decodeHTMLEntities(html: string): string {
    // 创建一个临时DOM来解码HTML实体
    const dom = new JSDOM(`<!DOCTYPE html><body></body>`);
    const textarea = dom.window.document.createElement('textarea');
    textarea.innerHTML = html;
    let decoded = textarea.value;

    // 处理转义字符（注意顺序很重要）
    // 先用占位符替换双反斜杠，防止被后续替换影响
    const doublBackslashPlaceholder = '___DOUBLE_BACKSLASH___';
    decoded = decoded.replace(/\\\\/g, doublBackslashPlaceholder);

    // 移除 JSON 转义的引号和大括号
    decoded = decoded.replace(/\\"/g, '"');  // \" -> "
    decoded = decoded.replace(/\\'/g, "'");  // \' -> '
    decoded = decoded.replace(/\\{/g, '{');  // \{ -> {
    decoded = decoded.replace(/\\}/g, '}');  // \} -> }

    // 最后恢复反斜杠
    decoded = decoded.replace(new RegExp(doublBackslashPlaceholder, 'g'), '\\');

    return decoded;
  }
}
