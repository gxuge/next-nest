# Docker 部署 Sharp 库问题解决方案

## 问题描述

在 Linux 云服务器上使用 Docker Compose 部署时，Sharp 库安装失败：
```
error https://registry.npmmirror.com/@img/sharp-libvips-linux-arm64/-/sharp-libvips-linux-arm64-1.2.3.tgz: write EPIPE
```

## 根本原因

1. **Sharp 库依赖系统库**：需要 libvips 等图像处理库
2. **Alpine Linux 缺少依赖**：轻量级镜像缺少必要的构建工具
3. **网络超时**：国内访问 npm 镜像可能不稳定

## 解决方案

### 方案一：修复 Alpine 镜像（推荐，镜像更小）

已更新 `Dockerfile.prod`，添加了必要的系统依赖：

```dockerfile
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    vips-dev \
    # ... 其他依赖
```

**优点：**
- 镜像体积小（约 200-300MB）
- 启动快

**缺点：**
- 在某些 ARM 架构上可能仍有兼容性问题

### 方案二：使用 Debian 镜像（备选）

如果方案一失败，使用 `Dockerfile.prod.debian`：

```bash
# 在 docker-compose.yml 中修改
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.prod.debian  # 改用 Debian 版本
```

**优点：**
- 更好的兼容性
- 更稳定

**缺点：**
- 镜像稍大（约 400-500MB）

### 方案三：使用国内镜像源

创建 `.yarnrc` 文件（已包含在修复中）：

```yaml
registry "https://registry.npmmirror.com"
network-timeout 600000
```

## 部署步骤

### 1. 清理旧构建

```bash
docker-compose down
docker system prune -a --volumes  # 清理所有镜像和缓存
```

### 2. 重新构建

```bash
# 使用 Alpine 方案（默认）
docker-compose build --no-cache

# 或使用 Debian 方案
# 先修改 docker-compose.yml 中的 dockerfile 字段
docker-compose build --no-cache
```

### 3. 启动服务

```bash
docker-compose up -d
```

### 4. 查看日志

```bash
docker-compose logs -f app
```

## 额外优化

### 添加 .yarnrc（可选）

在项目根目录创建 `.yarnrc`：

```yaml
registry "https://registry.npmmirror.com"
network-timeout 600000
sass_binary_site "https://npmmirror.com/mirrors/node-sass"
```

### 使用多阶段构建（进一步优化）

如果需要更小的生产镜像，可以使用多阶段构建：

```dockerfile
# 构建阶段
FROM node:20-alpine AS builder
# ... 安装依赖和构建

# 生产阶段
FROM node:20-alpine
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
```

## 故障排查

### 如果仍然失败

1. **检查服务器架构**：
```bash
uname -m  # 查看是 x86_64 还是 aarch64(ARM)
```

2. **手动测试 Sharp 安装**：
```bash
docker run --rm -it node:20-alpine sh
apk add vips-dev
yarn add sharp
```

3. **查看详细错误**：
```bash
docker-compose build --progress=plain --no-cache
```

4. **使用预构建的 Sharp**：
在 `package.json` 中指定平台：
```json
{
  "optionalDependencies": {
    "@img/sharp-linux-x64": "0.34.4",
    "@img/sharp-linuxmusl-x64": "0.34.4"
  }
}
```

## 推荐配置

对于生产环境，推荐：
- ✅ 使用 **Alpine + vips-dev**（已配置）
- ✅ 设置**网络超时 600 秒**（已配置）
- ✅ 添加**重试机制**（已配置）
- ✅ 清理开发依赖（已配置）

## 测试验证

构建成功后，验证 Sharp 是否正常工作：

```bash
docker-compose exec app node -e "const sharp = require('sharp'); console.log('Sharp version:', sharp.versions)"
```

应该输出 Sharp 的版本信息而不报错。

