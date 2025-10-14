# 图片格式转换 API

## 概述

新增了图片格式转换接口，可以将任意格式的图片（WebP、PNG、BMP等）转换为标准的JPEG格式。

## API 端点

### POST `/api/image/convert-to-jpeg`

将图片转换为JPEG格式。

**请求体格式 1（推荐）：直接传递 base64 字符串**
```json
{
  "imageData": "base64编码的图片数据",
  "quality": 95  // 可选，JPEG质量 (1-100)，默认95
}
```

**请求体格式 2（n8n 兼容）：传递对象**
```json
{
  "imageData": {
    "data": "base64编码的图片数据",
    "mimeType": "image/jpeg",
    "fileType": "image",
    "fileExtension": "jpg"
  },
  "quality": 95
}
```
> ⚠️ **注意**：接口会自动识别两种格式。如果传递对象，只需要 `data` 字段包含有效的 base64 数据即可。

**响应：**
```json
{
  "imageData": "转换后的JPEG图片base64数据",
  "originalFormat": "image/webp",
  "convertedFormat": "image/jpeg",
  "originalSize": 12345,
  "convertedSize": 10234
}
```

## 使用场景

### 1. 解决微信公众号素材上传问题

**问题：** 微信永久素材接口不支持WebP格式，上传时报错 `40113: unsupported file type`

**解决方案：** 
1. 下载原始图片（可能是WebP格式）
2. 调用此接口转换为JPEG
3. 上传转换后的JPEG到微信

### 2. n8n 工作流集成

在 n8n 工作流中使用 HTTP Request 节点调用此接口。

#### 方式 1：直接传递整个二进制对象（推荐）✅

```javascript
{
  "method": "POST",
  "url": "http://localhost:3000/api/image/convert-to-jpeg",
  "body": {
    "imageData": "{{ $binary.data }}",  // 直接传递整个二进制对象
    "quality": 95
  },
  "sendBody": true,
  "bodyContentType": "application/json",
  "responseFormat": "json"
}
```

#### 方式 2：只传递 base64 数据

```javascript
{
  "method": "POST",
  "url": "http://localhost:3000/api/image/convert-to-jpeg",
  "body": {
    "imageData": "{{ $binary.data.data }}",  // 只传递 data 字段
    "quality": 95
  },
  "sendBody": true,
  "bodyContentType": "application/json",
  "responseFormat": "json"
}
```

> 💡 **提示**：方式 1 更简单，接口会自动从对象中提取 `data` 字段。

## 技术实现

- 使用 **Sharp** 库进行图片格式转换
- 支持所有主流图片格式：WebP、PNG、BMP、GIF、TIFF等
- 可自定义JPEG压缩质量
- 返回转换前后的格式和文件大小信息

## 错误处理

如果图片数据无效或转换失败，将返回 400 错误：

```json
{
  "statusCode": 400,
  "message": "图片转换失败: Invalid image data",
  "error": "Bad Request"
}
```

## Swagger 文档

启动服务后访问：`http://localhost:3000/api` 查看完整的 API 文档。

