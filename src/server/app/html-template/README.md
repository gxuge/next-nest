# HTML 模板服务 API 文档

## 概述

HTML 模板服务提供了一个强大的模板填充系统，支持使用预设模板或自定义模板配置来动态生成 HTML 内容。

## API 接口

### 1. 获取可用模板列表

**接口地址：** `GET /html-template/templates`

**功能说明：** 获取系统中所有预设的模板配置列表。

**请求示例：**

```bash
curl -X GET http://localhost:4000/html-template/templates
```

**响应示例：**

```json
{
  "templates": [
    {
      "id": "blue-theme",
      "name": "蓝色主题",
      "description": "现代化蓝色渐变主题，适用于公众号文章排版"
    }
  ]
}
```

---

### 2. 填充 HTML 模板

**接口地址：** `POST /html-template/populate`

**功能说明：** 将数据填充到 HTML 模板中，支持两种使用方式：

- **方式一（推荐）：** 使用内置预设模板（通过 `templateId`）
- **方式二：** 使用自定义模板配置（通过 `jsonData`）

---

#### 方式一：使用预设模板（推荐）

这是新的、更简洁的使用方式。只需要传入 `templateId` 和 `htmlTemplate`。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| htmlTemplate | string | 是 | HTML模板字符串，使用自定义标签作为占位符 |
| templateId | string | 是* | 预设模板ID（如：`blue-theme`） |

\* `templateId` 和 `jsonData` 二选一，推荐使用 `templateId`

**请求示例：**

```json
{
  "htmlTemplate": "<div>\n  <article_title>AI技术革新传统行业</article_title>\n  <subtitle>探索AI的无限可能</subtitle>\n  <summary>\n    <title>核心要点</title>\n    <content>本文将深入探讨人工智能如何改变我们的工作和生活方式。</content>\n  </summary>\n  <main_subject>人工智能</main_subject>\n  <highlight_content>提升效率200%</highlight_content>\n  <content_points>\n    <title>应用场景一</title>\n    <content>智能客服系统可以7×24小时不间断服务</content>\n  </content_points>\n</div>",
  "templateId": "blue-theme"
}
```

**完整的 cURL 请求：**

```bash
curl -X POST http://localhost:4000/html-template/populate \
  -H "Content-Type: application/json" \
  -d '{
    "htmlTemplate": "<div>\n  <article_title>AI技术革新传统行业</article_title>\n  <subtitle>探索AI的无限可能</subtitle>\n  <summary>\n    <title>核心要点</title>\n    <content>本文将深入探讨人工智能如何改变我们的工作和生活方式。</content>\n  </summary>\n</div>",
    "templateId": "blue-theme"
  }'
```

---

#### 方式二：使用自定义模板配置

如果需要完全自定义样式，可以使用这种方式。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| htmlTemplate | string | 是 | HTML模板字符串 |
| jsonData | object | 是* | JSON数据对象，定义模板样式 |

\* `templateId` 和 `jsonData` 二选一

**请求示例：**

```json
{
  "htmlTemplate": "<div>\n  <article_title>我的标题</article_title>\n  <subtitle>我的副标题</subtitle>\n</div>",
  "jsonData": {
    "article_title": "<h1 style=\"color: red;\">{{article_title}}</h1>",
    "subtitle": "<h2 style=\"color: blue;\">{{subtitle}}</h2>"
  }
}
```

---

#### 响应格式

**成功响应（200）：**

```json
{
  "result": "<div><h1 style=\"text-align: center; font-size: 22px; color: rgba(0, 0, 0, 0.9); margin: 20px 0; line-height: 1.4;\">AI技术革新传统行业</h1>...</div>"
}
```

**错误响应（404）：**

```json
{
  "statusCode": 404,
  "message": "模板 'invalid-id' 不存在",
  "error": "Not Found"
}
```

---

## 模板系统说明

### 内置模板

目前系统提供以下预设模板：

| 模板ID | 名称 | 说明 |
|--------|------|------|
| `blue-theme` | 蓝色主题 | 现代化蓝色渐变主题，适用于公众号文章排版 |

### 支持的标签

蓝色主题模板支持以下 HTML 标签：

- `<article_title>` - 文章主标题
- `<subtitle>` - 副标题（带蓝色渐变装饰）
- `<summary>` - 摘要区块（包含内部的 `<title>` 和 `<content>`）
- `<main_subject>` - 主题关键词（加粗）
- `<highlight_content>` - 高亮内容（蓝色加粗）
- `<content_points>` - 内容要点（包含内部的 `<title>` 和 `<content>`）

### 占位符机制

模板使用 `{{字段名}}` 作为占位符，系统会自动将 HTML 模板中对应标签的原始内容填充到样式模板中。

**示例：**

输入 HTML：
```html
<article_title>这是我的标题</article_title>
```

使用蓝色主题模板后：
```html
<h1 style="text-align: center; font-size: 22px; ...">这是我的标题</h1>
```

---

## 添加新模板

如果需要添加新的预设模板：

1. 打开 `src/server/app/html-template/templates/index.ts`
2. 创建新的模板配置对象（参考 `BLUE_THEME_TEMPLATE`）
3. 将新模板添加到 `TEMPLATE_REGISTRY` 中
4. 更新 DTO 中的 enum 列表（`populate-html.dto.ts`）

**示例：**

```typescript
export const GREEN_THEME_TEMPLATE: TemplateConfig = {
  id: 'green-theme',
  name: '绿色主题',
  description: '清新自然的绿色主题',
  data: {
    article_title: '<h1 style="color: green;">{{article_title}}</h1>',
    // ... 更多配置
  },
};

// 添加到注册表
export const TEMPLATE_REGISTRY: Record<string, TemplateConfig> = {
  [BLUE_THEME_TEMPLATE.id]: BLUE_THEME_TEMPLATE,
  [GREEN_THEME_TEMPLATE.id]: GREEN_THEME_TEMPLATE, // 新增
};
```

---

## 使用场景

1. **公众号文章排版** - 使用预设模板快速生成美观的文章内容
2. **邮件模板生成** - 动态生成格式化的 HTML 邮件
3. **内容管理系统** - 提供统一的内容样式管理
4. **动态页面生成** - 根据用户数据生成个性化页面

---

## 注意事项

1. `templateId` 和 `jsonData` 参数二选一，如果都不提供会返回错误
2. 推荐使用 `templateId` 方式，更简洁且易于维护
3. 自定义 `jsonData` 方式适合需要完全自定义样式的场景
4. HTML 模板中的标签名要与模板配置中的字段名对应
5. 支持嵌套结构（如 `summary` 的 `outer/inner` 结构）
