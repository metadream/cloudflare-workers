# Cloudflare Workers

本项目包含一组基于 Cloudflare Workers 运行的无服务器脚本，用于实现 API 代理、Google Drive 文件索引、通用 HTTP 代理以及 R2 图片处理等功能。

## api-proxy

**多上游 API 代理**

将不同 API 请求路由到对应的上游服务，支持路径前缀匹配。

- `/google/` → `https://www.googleapis.com`
- `/github/` → `https://api.github.com`
- `/osm/` → `https://nominatim.openstreetmap.org`

#### 使用方法

1. 在 `api-proxy.js` 中修改 `upstreams` 对象，添加或替换上游地址；
2. 将代码粘贴到 Cloudflare Workers 编辑器中保存发布；
3. 访问 `https://你的域名/google/...` 即可代理对应的 API 请求。

## google-drive

**Google Drive 文件索引页**

一个轻量级的 Google Drive 文件浏览器，未使用任何第三方库。GET 请求返回 HTML 文件列表页面，POST 请求返回 JSON 格式数据。示例：https://gd.force.workers.dev

#### 使用方法

1. 打开 `google-drive.js`，修改 `config` 对象中的 `root_id`、`client_id`、`client_secret`、`refresh_token`（可通过 [rclone](https://rclone.org) 工具获取）；
2. 将代码粘贴到 Cloudflare Workers 编辑器中保存发布。

## js-proxy

**通用 HTTP/HTTPS 代理**

基于 [jsproxy](https://github.com/EtherDream/jsproxy) 项目，通过 Worker 作为代理转发 HTTP/HTTPS 请求。示例：https://proxy.force.workers.dev

#### 使用方法

1. 将代码粘贴到 Cloudflare Workers 编辑器中保存发布；
2. 访问 `https://你的域名/-----https://google.com` 即可代理访问目标网站。

## r2-image

**R2 对象存储图片处理服务**

基于 Cloudflare R2 的图片存储与实时变换服务，支持通过 URL 参数动态调整图片尺寸、质量等。

#### 使用方法

1. 在 Cloudflare Workers 中绑定 R2 存储桶（Bucket）；
2. 代码中的 `env` 参数需要包含与 Bucket 名称一致的属性；
3. 访问格式：`https://你的域名/{bucketName}/{objectKey}`；
4. 支持以下 URL 查询参数进行图片处理：

| 参数    | 说明                     | 示例                     |
| ------- | ------------------------ | ------------------------ |
| `size`  | 等比例缩放宽高           | `?size=200`              |
| `width` | 指定宽度                 | `?width=300`             |
| `height`| 指定高度                 | `?height=200`            |
| `quality`| 图片质量（1-100）       | `?quality=80`            |
| `fit`   | 缩放模式（如 `scale-down`）| `?fit=cover`           |
