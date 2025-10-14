# 🔍 检查构建慢的原因

## 🎯 还没用国内镜像的地方（已全部修复）

### ✅ 1. Debian APT 源（已修复）
```dockerfile
# 替换为阿里云镜像
sed -i 's/deb.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list.d/debian.sources
```

### ✅ 2. npm/yarn 包源（已配置）
```yaml
# .yarnrc
registry "https://registry.npmmirror.com"
```

### ✅ 3. Sharp 二进制文件（刚修复！）
```dockerfile
# Dockerfile.prod 中添加
ENV SHARP_DIST_BASE_URL="https://npmmirror.com/mirrors/sharp-libvips"
ENV npm_config_sharp_binary_host="https://npmmirror.com/mirrors/sharp"
```

```yaml
# .yarnrc 中添加
sharp_binary_host "https://npmmirror.com/mirrors/sharp"
sharp_libvips_binary_host "https://nppmirror.com/mirrors/sharp-libvips"
```

### ⚠️ 4. Docker Hub 镜像（可选优化）

**如果拉取 `node:20-slim` 镜像慢，需要配置 Docker 镜像加速：**

在服务器上创建 `/etc/docker/daemon.json`：
```json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://registry.docker-cn.com"
  ]
}
```

然后重启 Docker：
```bash
sudo systemctl daemon-reload
sudo systemctl restart docker
```

---

## 🔎 如何判断 Sharp 是否在编译

### 方法1: 查看构建日志

**正在编译（慢）：**
```bash
# 会看到这些关键词
Building from source...
node-gyp rebuild
Compiling C++ code...
make: Entering directory
```

**使用预编译包（快）：**
```bash
# 会看到这些关键词
Downloading sharp...
sharp: Downloading https://npmmirror.com/mirrors/sharp/...
sharp: Cached
```

### 方法2: 查看时间

```bash
# 在构建时观察 yarn install 的时间
[app 4/8] RUN yarn install...

⏱️ 如果超过 2 分钟 → 可能在编译
⚡ 如果 30-60 秒 → 使用预编译包
```

---

## 📊 完整构建时间分解

### 理想情况（全部国内镜像）

```bash
docker-compose build --no-cache

1. 拉取 node:20-slim         ⏱️ 30-90秒  (120MB)
2. 替换 apt 源                ⚡ 1-2秒
3. apt-get update            ⏱️ 10-20秒
4. apt-get install libvips   ⏱️ 15-30秒
5. COPY package files        ⚡ 1秒
6. yarn install (含Sharp)    ⏱️ 30-60秒  ← 关键！
7. COPY source code          ⚡ 2-5秒
8. yarn build                ⏱️ 30-60秒
9. yarn install --production ⏱️ 20-40秒

总时间：3-5 分钟 ✅
```

### 异常情况（Sharp 在编译）

```bash
6. yarn install (含Sharp)    ❌ 6-10分钟  ← 这里卡住！

总时间：10-15 分钟 ❌
```

---

## 🚀 立即测试

### 1. 清理并重新构建

```bash
# 停止并清理
docker-compose down
docker builder prune -f

# 重新构建（查看日志）
docker-compose build --no-cache --progress=plain 2>&1 | tee build.log

# 重点观察这一步
grep -i "sharp" build.log
```

### 2. 检查 Sharp 下载源

在日志中搜索：
```bash
# 如果看到这个 ✅
Downloading https://npmmirror.com/mirrors/sharp/

# 如果看到这个 ❌（说明没用国内镜像）
Downloading https://github.com/lovell/sharp-libvips/
```

### 3. 验证是否编译

```bash
# 如果日志中包含这些关键词 → 在编译 ❌
grep -i "node-gyp\|building\|compiling" build.log

# 如果没有 → 使用预编译包 ✅
```

---

## 🎯 终极优化：多阶段构建 + 缓存

如果还是慢，可以用这个方案：

```dockerfile
# ===== 阶段 1: 依赖安装 =====
FROM node:20-slim AS deps

# 配置所有镜像
RUN sed -i 's/deb.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list.d/debian.sources

WORKDIR /app
COPY package.json yarn.lock .yarnrc ./

ENV SHARP_DIST_BASE_URL="https://npmmirror.com/mirrors/sharp-libvips"
RUN yarn install --frozen-lockfile

# ===== 阶段 2: 构建 =====
FROM node:20-slim AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

# ===== 阶段 3: 生产 =====
FROM node:20-slim

RUN sed -i 's/deb.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list.d/debian.sources && \
    apt-get update && apt-get install -y libvips --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

CMD ["yarn", "start:prod"]
```

**优点：**
- 依赖层可以缓存
- 第二次构建只需 1-2 分钟
- 镜像更小

---

## 📝 当前配置总结

**已优化的镜像源：**
- ✅ Debian APT: mirrors.aliyun.com
- ✅ npm/yarn: registry.npmmirror.com
- ✅ Sharp: npmmirror.com/mirrors/sharp
- ⚠️ Docker Hub: 需要手动配置

**预期效果：**
- 首次构建：3-5 分钟
- Sharp 安装：30-60 秒（不编译）
- 后续构建：1-2 分钟（利用缓存）

