# 测试新的 templateId 功能

## 测试步骤

### 1. 启动应用

```bash
yarn start:dev
```

### 2. 测试获取模板列表

```bash
curl http://localhost:3000/html-template/templates
```

**预期结果：**
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

### 3. 使用 templateId 生成 HTML（推荐方式）

创建测试文件 `test-request.json`:

```json
{
  "templateId": "blue-theme",
  "htmlTemplate": "<div>\n  <article_title>2026深圳初三学年规划全景图：从预备到冲刺的制胜之路</article_title>\n  <subtitle>科学规划+高效执行=中考成功</subtitle>\n  <summary>\n    <title>核心要点</title>\n    <content>本文将深入探讨...</content>\n  </summary>\n  <main_subject>深圳初三学生</main_subject>\n  <highlight_content>科学的学年规划是中考成功的重要保障</highlight_content>\n  <content_points>\n    <title>一轮基础复习</title>\n    <content>紧跟学校进度，系统梳理知识点</content>\n  </content_points>\n</div>"
}
```

然后执行：

```bash
curl -X POST http://localhost:3000/html-template/populate \
  -H "Content-Type: application/json" \
  -d @test-request.json
```

**检查结果：**
- ✅ 返回的 HTML 中应该包含完整的 `style="..."` 属性
- ✅ 不应该出现 `\"` 转义字符
- ✅ 样式应该正确应用

### 4. 将结果保存到文件查看

```bash
curl -X POST http://localhost:3000/html-template/populate \
  -H "Content-Type: application/json" \
  -d @test-request.json \
  | jq -r '.result' > output.html
```

然后在浏览器中打开 `output.html` 查看效果。

## 常见问题排查

### 如果仍然出现 `\"` 转义字符

1. **检查请求方式**：确保使用的是 `templateId` 而不是 `jsonData`
   
2. **检查响应头**：确保 Content-Type 正确
   
3. **检查模板配置**：
   ```bash
   # 查看模板配置文件
   cat src/server/app/html-template/templates/index.ts
   ```
   确保里面没有 `\\"` 这样的转义

4. **重启应用**：
   ```bash
   # 停止应用
   # 重新启动
   yarn start:dev
   ```

### 对比测试：旧方式 vs 新方式

**旧方式（可能有转义问题）：**
```json
{
  "htmlTemplate": "...",
  "jsonData": {
    "article_title": "<h1 style=\\"color: red\\">{{article_title}}</h1>"
  }
}
```
❌ 注意这里有 `\\"` 转义

**新方式（不会有转义问题）：**
```json
{
  "htmlTemplate": "...",
  "templateId": "blue-theme"
}
```
✅ 模板配置已内置，不需要传入 jsonData

## 完整示例

### 简单示例

```bash
curl -X POST http://localhost:3000/html-template/populate \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "blue-theme",
    "htmlTemplate": "<div><article_title>我的标题</article_title></div>"
  }'
```

### 复杂示例

```bash
curl -X POST http://localhost:3000/html-template/populate \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "blue-theme",
    "htmlTemplate": "<div>\n  <article_title>AI技术革新</article_title>\n  <subtitle>科技创新</subtitle>\n  <summary>\n    <title>摘要</title>\n    <content>这是内容</content>\n  </summary>\n  <main_subject>人工智能</main_subject>\n  <highlight_content>重点内容</highlight_content>\n  <content_points>\n    <title>第一点</title>\n    <content>详细说明</content>\n  </content_points>\n</div>"
  }' | jq -r '.result' > result.html
```

## 期望输出格式

生成的 HTML 应该类似这样（注意双引号是正常的，没有反斜杠）：

```html
<h1 style="text-align: center; font-size: 22px; color: rgba(0, 0, 0, 0.9); margin: 20px 0; line-height: 1.4;">我的标题</h1>
<div style="margin: 20px 0; box-sizing: border-box;">...</div>
```

**而不是：**

```html
<h1 style=\"text-align: center; font-size: 22px;\">我的标题</h1>
```

如果出现反斜杠，说明还有问题需要进一步调试。

