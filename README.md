# 港股账号管理系统

私人港股打新账号管理后台，部署在 Cloudflare Pages + Workers + D1。

## 部署步骤

### 1. 创建 D1 数据库

```bash
cd worker
npx wrangler d1 create hkipo-db
```

把返回的 `database_id` 填入 `worker/wrangler.toml`。

### 2. 初始化数据库

```bash
npx wrangler d1 execute hkipo-db --file=../schema.sql
```

### 3. 部署 Worker API

```bash
cd worker
npm install
npx wrangler deploy
```

记下 Worker 的 URL（如 `https://hkipo-api.xxx.workers.dev`）。

### 4. 构建前端

```bash
cd frontend
npm install
npm run build
```

### 5. 部署前端到 Cloudflare Pages

在 Cloudflare Pages 设置：
- Build command: `cd frontend && npm install && npm run build`
- Build output directory: `frontend/dist`
- 环境变量: `NODE_VERSION` = `18`

### 6. 配置前端 API 代理

在 Cloudflare Pages 的 `Functions` 或 `_redirects` 文件中添加：

在 `frontend/public/_redirects` 已配置：
```
/api/* https://hkipo-api.YOUR_SUBDOMAIN.workers.dev/api/:splat 200
```

部署后替换为实际 Worker URL。

### 7. 初始化管理员

首次部署后，调用初始化接口创建管理员：

```bash
curl -X POST https://your-site.pages.dev/api/auth/init \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"your_password","name":"管理员"}'
```

然后用该邮箱密码登录后台。

## 本地开发

```bash
# Terminal 1 - Worker
cd worker && npm install && npx wrangler dev

# Terminal 2 - Frontend
cd frontend && npm install && npm run dev
```

前端默认代理 `/api` 到 `localhost:8787`。
