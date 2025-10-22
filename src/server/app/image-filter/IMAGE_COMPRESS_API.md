# 图片压缩 API - AI 识别优化

## 概述

新增了专门用于 AI 识别的图片压缩接口，通过降低质量和调整尺寸来显著减小图片体积，同时保持 AI 可识别的质量。

## API 端点

### POST `/api/image/compress-for-ai`

将图片压缩到适合 AI 识别的大小。

**特性：**
- ✅ 自动调整图片尺寸（默认最大 1024x1024）
- ✅ 优化 JPEG 质量（默认 75，适合 AI 识别）
- ✅ 使用 mozjpeg 引擎获得更好的压缩率
- ✅ 保持图片宽高比
- ✅ 返回详细的压缩统计信息

**请求体格式 1（推荐）：直接传递 base64 字符串**
```json
{
  "imageData": "base64编码的图片数据",
  "quality": 75,      // 可选，JPEG质量 (1-100)，默认75
  "maxWidth": 1024,   // 可选，最大宽度（像素），默认1024
  "maxHeight": 1024   // 可选，最大高度（像素），默认1024
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
  "quality": 75,
  "maxWidth": 1024,
  "maxHeight": 1024
}
```

**响应：**
```json
{
  "imageData": "压缩后的JPEG图片base64数据",
  "originalFormat": "image/png",
  "originalDimensions": {
    "width": 2048,
    "height": 1536
  },
  "compressedDimensions": {
    "width": 1024,
    "height": 768
  },
  "originalSize": 245678,
  "compressedSize": 45678,
  "compressionRatio": 81.4
}
```

## 使用场景

### 1. 优化 AI 视觉识别成本

**问题：** 大图片会增加 AI API 调用成本和处理时间。

**解决方案：** 
- 在发送给 AI 之前先压缩图片
- 减少 token 消耗（对于基于 token 计费的视觉 API）
- 加快 AI 响应速度

### 2. 批量图片处理

**问题：** 处理大量高分辨率图片时内存和带宽占用过高。

**解决方案：**
- 批量压缩图片到统一规格
- 显著减少存储和传输成本
- 保持 AI 识别质量

### 3. n8n 工作流集成

在 n8n 工作流中使用 HTTP Request 节点调用此接口。

#### 方式 1：使用默认参数（推荐）✅

```javascript
{
  "method": "POST",
  "url": "http://localhost:3000/api/image/compress-for-ai",
  "body": {
    "imageData": "{{ $binary.data }}"  // 直接传递二进制对象
  },
  "sendBody": true,
  "bodyContentType": "application/json",
  "responseFormat": "json"
}
```

#### 方式 2：自定义压缩参数

```javascript
{
  "method": "POST",
  "url": "http://localhost:3000/api/image/compress-for-ai",
  "body": {
    "imageData": "{{ $binary.data }}",
    "quality": 70,      // 更低的质量获得更小的文件
    "maxWidth": 512,    // 更小的尺寸适合某些 AI 模型
    "maxHeight": 512
  },
  "sendBody": true,
  "bodyContentType": "application/json",
  "responseFormat": "json"
}
```

#### 方式 3：超高压缩（极限压缩）

```javascript
{
  "method": "POST",
  "url": "http://localhost:3000/api/image/compress-for-ai",
  "body": {
    "imageData": "{{ $binary.data }}",
    "quality": 60,      // 最低可识别质量
    "maxWidth": 768,
    "maxHeight": 768
  },
  "sendBody": true,
  "bodyContentType": "application/json",
  "responseFormat": "json"
}
```

## 压缩策略说明

### 质量参数建议

| 质量值 | 适用场景 | 预期压缩率 |
|--------|---------|-----------|
| 90-100 | 高质量要求，细节重要 | 20-40% |
| 75-85  | **AI识别（推荐）** | 50-70% |
| 60-70  | 极限压缩，可接受质量损失 | 70-85% |
| 1-60   | 不推荐（质量损失明显） | 85%+ |

### 尺寸参数建议

| 最大尺寸 | 适用场景 | 内存占用 |
|---------|---------|---------|
| 2048px  | 高精度识别、OCR | 高 |
| **1024px**  | **通用AI识别（推荐）** | **中** |
| 768px   | 快速识别、对象检测 | 低 |
| 512px   | 简单分类、标签识别 | 很低 |

## 压缩效果示例

### 示例 1：高分辨率照片
```
输入: 4096x3072 PNG (3.2 MB)
输出: 1024x768 JPEG (85 KB)
压缩率: 97.3%
```

### 示例 2：中等分辨率截图
```
输入: 1920x1080 PNG (856 KB)
输出: 1024x576 JPEG (65 KB)
压缩率: 92.4%
```

### 示例 3：已压缩的 JPEG
```
输入: 2048x1536 JPEG (245 KB)
输出: 1024x768 JPEG (46 KB)
压缩率: 81.2%
```

## 与 convert-to-jpeg 接口的区别

| 特性 | convert-to-jpeg | compress-for-ai |
|-----|----------------|----------------|
| 主要功能 | 格式转换 | 压缩优化 |
| 默认质量 | 95（高质量） | 75（AI优化） |
| 尺寸调整 | ❌ 不调整 | ✅ 自动调整 |
| 压缩率 | 低（10-30%） | 高（70-90%） |
| 适用场景 | 格式兼容性 | AI识别、节省成本 |
| mozjpeg 优化 | ❌ | ✅ |
| 尺寸信息 | ❌ | ✅ 详细尺寸信息 |

## 技术实现

- 使用 **Sharp** 库进行高性能图片处理
- 支持所有主流图片格式：WebP、PNG、BMP、GIF、TIFF 等
- 自动计算最优缩放比例，保持宽高比
- 使用 **mozjpeg** 引擎获得更好的压缩率
- 返回详细的压缩统计信息

## 错误处理

如果图片数据无效或压缩失败，将返回 400 错误：

```json
{
  "statusCode": 400,
  "message": "图片压缩失败: Invalid image data",
  "error": "Bad Request"
}
```

## 性能考虑

### 处理速度

- 小图片（< 1MB）：通常 < 100ms
- 中等图片（1-5MB）：通常 100-300ms
- 大图片（5-10MB）：通常 300-800ms
- 超大图片（> 10MB）：可能超过 1s

### 内存使用

Sharp 使用流式处理，内存占用相对较低：
- 处理 10MB 图片约占用 50-100MB 内存
- 支持并发处理多个图片

## 最佳实践

1. **默认参数适合大多数场景**：质量 75、尺寸 1024x1024
2. **根据 AI 模型调整**：某些模型可能需要特定尺寸（如 512x512）
3. **批量处理时使用队列**：避免同时处理过多图片
4. **监控压缩率**：如果压缩率过低，考虑降低质量或尺寸
5. **保存原始图片**：压缩是有损的，根据需要保留原图

## Swagger 文档

启动服务后访问：`http://localhost:3000/api` 查看完整的 API 文档和在线测试。

## 相关接口

- `POST /api/image/convert-to-jpeg` - 简单格式转换（保持原尺寸和高质量）
- `POST /api/image/filter` - HTML 中的图片过滤

