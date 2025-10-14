# 图片上下文提取功能

## 概述

在 `/api/image/filter` 接口中，所有保留的图片（`keptImages`）现在都会包含 `context` 和 `contextMeta` 字段，提取图片周围的文本内容，用于辅助AI分析图片。

## 功能特性

### 1. 智能边界检测
- **自动识别相邻图片**：提取上下文时，会自动检测前后相邻的图片位置
- **避免上下文混淆**：确保每张图片的上下文不会越过相邻图片的边界
- **动态范围调整**：当图片密集排列时，自动缩小提取范围；图片稀疏时，充分利用可用空间

### 2. 文本清理
- 移除所有HTML标签（包括 `<script>`、`<style>` 等）
- 转换HTML实体（`&nbsp;`、`&lt;`、`&quot;` 等）
- 清理多余的空白字符和换行
- 限制最大长度（1000字符）防止过长

### 3. 详细元数据
- 记录实际提取的字符数（前/后）
- 标记是否被相邻图片截断

## API 响应示例

### 请求
```json
{
  "content": "<div><h2>产品介绍</h2><p>这是一款优秀的智能手机，拥有强大的性能和优雅的设计。</p><img src=\"https://example.com/phone.jpg\" /><p>该手机配备了最新的处理器和高清显示屏。</p></div>",
  "blacklistUrls": [],
  "minSizeKB": 15
}
```

### 响应
```json
{
  "filteredHtml": "<div><h2>产品介绍</h2><p>这是一款优秀的智能手机，拥有强大的性能和优雅的设计。</p><img1/><p>该手机配备了最新的处理器和高清显示屏。</p></div>",
  "stats": {
    "total": 1,
    "removed": 0,
    "kept": 1,
    "reasons": {}
  },
  "removedImages": [],
  "keptImages": [
    {
      "src": "https://example.com/phone.jpg",
      "tag": "<img1/>",
      "context": {
        "before": "产品介绍 这是一款优秀的智能手机，拥有强大的性能和优雅的设计。",
        "after": "该手机配备了最新的处理器和高清显示屏。",
        "full": "产品介绍 这是一款优秀的智能手机，拥有强大的性能和优雅的设计。 该手机配备了最新的处理器和高清显示屏。"
      },
      "contextMeta": {
        "beforeChars": 285,
        "afterChars": 168,
        "truncatedBefore": false,
        "truncatedAfter": false
      }
    }
  ]
}
```

## 字段说明

### context 对象
| 字段 | 类型 | 说明 |
|------|------|------|
| `before` | string | 图片前面的上下文文本（已清理HTML标签） |
| `after` | string | 图片后面的上下文文本（已清理HTML标签） |
| `full` | string | 完整的上下文文本（before + after） |

### contextMeta 对象
| 字段 | 类型 | 说明 |
|------|------|------|
| `beforeChars` | number | 图片前实际提取的HTML字符数 |
| `afterChars` | number | 图片后实际提取的HTML字符数 |
| `truncatedBefore` | boolean | 前文是否因相邻图片而被截断 |
| `truncatedAfter` | boolean | 后文是否因相邻图片而被截断 |

## 使用场景

### 场景1：图片密集排列
当多张图片紧密排列时，系统会自动在相邻图片处截断上下文：

```html
<p>段落A</p>
<img src="1.jpg" />
<p>段落B（很短）</p>
<img src="2.jpg" />
<p>段落C</p>
```

- **图片1的context**: "段落A 段落B（很短）" ← 在图片2之前截断
- **图片2的context**: "段落B（很短）段落C" ← 在图片1之后开始
- **元数据显示**: `truncatedAfter: true` 和 `truncatedBefore: true`

### 场景2：图片稀疏排列
当图片之间间隔较远时，充分提取周围的上下文：

```html
<div>
  <h2>第一章</h2>
  <p>很长的文本内容...（500+字符）</p>
  <img src="1.jpg" />
  <p>很长的文本内容...（800+字符）</p>
</div>
```

- **图片1的context**: 包含前后各最多500字符的内容
- **元数据显示**: `truncatedBefore: false`, `truncatedAfter: false`

## 技术实现

### 提取算法
1. 定位当前图片在HTML中的索引位置
2. 查找前后相邻图片的位置
3. 计算安全的提取范围（默认前后各500字符）
4. 如果遇到相邻图片，在边界处截断
5. 提取HTML片段并清理标签
6. 返回纯文本和元数据

### 配置参数
在代码中可以修改以下常量：
```typescript
const CONTEXT_CHARS = 500;  // 默认前后各提取500字符
const MAX_LENGTH = 1000;    // 清理后文本的最大长度
```

## AI 分析建议

使用这些上下文信息可以帮助AI更好地理解图片：

1. **before 文本**：了解图片之前的内容，判断图片的引入语
2. **after 文本**：了解图片之后的内容，判断图片的说明文字
3. **full 文本**：完整的语义环境，用于理解图片在文档中的作用

示例AI提示词：
```
请根据以下信息分析图片：
- 图片URL: {src}
- 上下文: {context.full}
- 前文: {context.before}
- 后文: {context.after}

请判断这张图片的主题、作用和重要性。
```

## 注意事项

1. 上下文文本已去除所有HTML标签，只保留纯文本
2. 最终文本长度限制在1000字符以内
3. 如果原始HTML包含大量空白字符，会被自动清理
4. `contextMeta` 中的字符数指的是HTML字符数（清理前），不是纯文本字符数

