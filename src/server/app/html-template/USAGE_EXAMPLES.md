# HTML 模板服务使用示例

## 示例 1：使用蓝色主题模板生成简单文章

### JavaScript/TypeScript 代码

```typescript
// 使用 axios
import axios from 'axios';

const response = await axios.post('http://localhost:4000/html-template/populate', {
  templateId: 'blue-theme',
  htmlTemplate: `
    <div>
      <article_title>人工智能改变世界</article_title>
      <subtitle>科技创新</subtitle>
      <main_subject>AI技术</main_subject>
    </div>
  `
});

console.log(response.data.result);
```

### cURL 命令

```bash
curl -X POST http://localhost:4000/html-template/populate \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "blue-theme",
    "htmlTemplate": "<div><article_title>人工智能改变世界</article_title><subtitle>科技创新</subtitle></div>"
  }'
```

---

## 示例 2：使用摘要区块（summary）

摘要区块支持嵌套的 `title` 和 `content` 标签。

```typescript
const response = await axios.post('http://localhost:4000/html-template/populate', {
  templateId: 'blue-theme',
  htmlTemplate: `
    <div>
      <article_title>深度学习应用实践</article_title>
      <subtitle>技术分享</subtitle>
      <summary>
        <title>文章摘要</title>
        <content>本文介绍了深度学习在图像识别、自然语言处理等领域的实际应用案例。</content>
      </summary>
    </div>
  `
});
```

---

## 示例 3：使用高亮内容

```typescript
const htmlTemplate = `
  <div>
    <article_title>电商平台优化方案</article_title>
    <subtitle>性能提升</subtitle>
    <summary>
      <title>优化成果</title>
      <content>通过技术优化，我们实现了<highlight_content>页面加载速度提升3倍</highlight_content>的显著成果。</content>
    </summary>
  </div>
`;

const response = await axios.post('http://localhost:4000/html-template/populate', {
  templateId: 'blue-theme',
  htmlTemplate
});
```

---

## 示例 4：使用内容要点列表

可以使用多个 `<content_points>` 标签来创建多个要点。

```typescript
const htmlTemplate = `
  <div>
    <article_title>项目管理最佳实践</article_title>
    <subtitle>效率提升指南</subtitle>
    
    <summary>
      <title>核心观点</title>
      <content>本文总结了5个关键的项目管理技巧。</content>
    </summary>
    
    <content_points>
      <title>明确目标</title>
      <content>在项目启动时，确保所有团队成员都清楚项目的目标和预期成果。</content>
    </content_points>
    
    <content_points>
      <title>定期沟通</title>
      <content>建立每日站会制度，保持团队信息同步。</content>
    </content_points>
    
    <content_points>
      <title>风险管理</title>
      <content>提前识别潜在风险，制定应对预案。</content>
    </content_points>
  </div>
`;

const response = await axios.post('http://localhost:4000/html-template/populate', {
  templateId: 'blue-theme',
  htmlTemplate
});
```

---

## 示例 5：综合使用所有标签

```typescript
const htmlTemplate = `
  <div>
    <article_title>2024年AI技术发展趋势</article_title>
    <subtitle>行业洞察</subtitle>
    
    <summary>
      <title>前言</title>
      <content>
        随着<main_subject>人工智能</main_subject>技术的快速发展，
        2024年将迎来<highlight_content>AI应用的爆发式增长</highlight_content>。
      </content>
    </summary>
    
    <content_points>
      <title>大模型持续进化</title>
      <content>GPT、Claude等大语言模型将在更多领域落地应用。</content>
    </content_points>
    
    <content_points>
      <title>多模态AI崛起</title>
      <content>融合文本、图像、语音的多模态AI将成为主流。</content>
    </content_points>
    
    <content_points>
      <title>边缘AI普及</title>
      <content>AI计算将从云端延伸到边缘设备，实现更快的响应速度。</content>
    </content_points>
    
    <summary>
      <title>结论</title>
      <content>AI技术将继续深刻改变各行各业的运作模式。</content>
    </summary>
  </div>
`;

const response = await axios.post('http://localhost:4000/html-template/populate', {
  templateId: 'blue-theme',
  htmlTemplate
});

console.log(response.data.result);
```

---

## 示例 6：获取所有可用模板

在使用模板之前，可以先获取系统中所有可用的模板列表。

```typescript
// 获取模板列表
const templatesResponse = await axios.get('http://localhost:4000/html-template/templates');

console.log(templatesResponse.data);
// 输出：
// {
//   "templates": [
//     {
//       "id": "blue-theme",
//       "name": "蓝色主题",
//       "description": "现代化蓝色渐变主题，适用于公众号文章排版"
//     }
//   ]
// }

// 然后使用选中的模板
const selectedTemplateId = templatesResponse.data.templates[0].id;

const response = await axios.post('http://localhost:4000/html-template/populate', {
  templateId: selectedTemplateId,
  htmlTemplate: '<div><article_title>我的文章</article_title></div>'
});
```

---

## 示例 7：React 组件中使用

```tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Template {
  id: string;
  name: string;
  description: string;
}

const ArticleEditor: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('blue-theme');
  const [htmlContent, setHtmlContent] = useState('');
  const [result, setResult] = useState('');

  useEffect(() => {
    // 加载可用模板
    axios.get('http://localhost:4000/html-template/templates')
      .then(res => setTemplates(res.data.templates));
  }, []);

  const handleGenerate = async () => {
    try {
      const response = await axios.post('http://localhost:4000/html-template/populate', {
        templateId: selectedTemplate,
        htmlTemplate: htmlContent
      });
      setResult(response.data.result);
    } catch (error) {
      console.error('生成失败:', error);
    }
  };

  return (
    <div>
      <select 
        value={selectedTemplate} 
        onChange={(e) => setSelectedTemplate(e.target.value)}
      >
        {templates.map(t => (
          <option key={t.id} value={t.id}>
            {t.name} - {t.description}
          </option>
        ))}
      </select>

      <textarea
        value={htmlContent}
        onChange={(e) => setHtmlContent(e.target.value)}
        placeholder="输入HTML模板..."
        rows={10}
      />

      <button onClick={handleGenerate}>生成</button>

      <div dangerouslySetInnerHTML={{ __html: result }} />
    </div>
  );
};

export default ArticleEditor;
```

---

## 示例 8：自定义模板配置（不使用预设）

如果需要完全自定义样式，可以不使用 `templateId`，而是传入自定义的 `jsonData`。

```typescript
const response = await axios.post('http://localhost:4000/html-template/populate', {
  htmlTemplate: `
    <div>
      <article_title>我的标题</article_title>
      <custom_tag>自定义内容</custom_tag>
    </div>
  `,
  jsonData: {
    article_title: '<h1 style="color: purple; font-size: 30px;">{{article_title}}</h1>',
    custom_tag: '<div class="custom-class">{{custom_tag}}</div>'
  }
});
```

**注意：** 使用自定义 `jsonData` 时，需要完全自己定义所有的样式配置。推荐使用预设的 `templateId` 以获得更好的体验。

---

## 错误处理示例

```typescript
try {
  const response = await axios.post('http://localhost:4000/html-template/populate', {
    templateId: 'non-existent-template',
    htmlTemplate: '<div>test</div>'
  });
} catch (error) {
  if (error.response?.status === 404) {
    console.error('模板不存在:', error.response.data.message);
  } else if (error.response?.status === 400) {
    console.error('请求参数错误:', error.response.data.message);
  } else {
    console.error('未知错误:', error);
  }
}
```

---

## 提示和最佳实践

1. **先获取模板列表**：在实际应用中，建议先调用 `/templates` 接口获取可用模板，让用户选择。

2. **使用预设模板**：优先使用 `templateId` 而不是自定义 `jsonData`，这样更容易维护和升级。

3. **标签命名规范**：HTML 模板中的标签名应该语义化，使用下划线分隔单词（如 `article_title`）。

4. **内容转义**：如果内容中包含特殊字符，确保正确转义（服务端会自动处理大部分情况）。

5. **嵌套结构**：对于复杂的布局（如 `summary`），使用嵌套标签来组织内容。

6. **批量生成**：如果需要批量生成多篇文章，可以使用并发请求提高效率：

```typescript
const articles = [/* ... */];

const results = await Promise.all(
  articles.map(article => 
    axios.post('http://localhost:4000/html-template/populate', {
      templateId: 'blue-theme',
      htmlTemplate: article.htmlTemplate
    })
  )
);
```

