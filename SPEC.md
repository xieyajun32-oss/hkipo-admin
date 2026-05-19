# 港股账号管理系统 - 技术规格

## 概述
一个部署在 Cloudflare Pages + Workers + D1 的私人港股账号管理后台。

## 技术栈
- Frontend: React + Vite + TailwindCSS
- Backend: Cloudflare Workers (Hono framework)
- Database: Cloudflare D1 (SQLite)
- Auth: 自建邮箱+密码登录（bcrypt hash + JWT token）
- 部署: Cloudflare Pages（前端）+ Workers（API）

## 项目结构
```
/
├── frontend/          # React Vite app
│   ├── src/
│   │   ├── pages/     # 各管理页面
│   │   ├── components/ # 共用组件
│   │   ├── api/       # API调用封装
│   │   └── App.jsx
│   └── vite.config.js
├── worker/            # Cloudflare Worker API
│   ├── src/
│   │   ├── index.js   # Hono app entry
│   │   ├── routes/    # API routes
│   │   ├── middleware/ # auth middleware
│   │   └── db/        # D1 schema & queries
│   └── wrangler.toml
└── schema.sql         # D1 database schema
```

## 数据库设计 (D1 SQLite)

### users 表
- id INTEGER PRIMARY KEY
- email TEXT UNIQUE NOT NULL
- password_hash TEXT NOT NULL
- name TEXT
- role TEXT DEFAULT 'viewer' -- admin/editor/viewer
- created_at DATETIME DEFAULT CURRENT_TIMESTAMP

### persons 表 (人员)
- id INTEGER PRIMARY KEY
- name TEXT NOT NULL
- relationship TEXT -- 自己/朋友/合作
- notes TEXT
- created_at DATETIME

### bank_cards 表 (银行卡)
- id INTEGER PRIMARY KEY
- person_id INTEGER REFERENCES persons(id)
- bank_name TEXT NOT NULL
- card_last4 TEXT
- balance REAL DEFAULT 0
- last_transaction_date DATE
- status TEXT DEFAULT 'active' -- active/frozen/inactive
- notes TEXT

### brokers 表 (券商账号)
- id INTEGER PRIMARY KEY
- person_id INTEGER REFERENCES persons(id)
- bank_card_id INTEGER REFERENCES bank_cards(id)
- broker_name TEXT NOT NULL -- 辉立/富途/长桥...
- account_id_display TEXT -- 账号显示名(如A001)
- balance REAL DEFAULT 0
- last_operation_date DATE
- sim_card_id INTEGER REFERENCES sim_cards(id)
- status TEXT DEFAULT 'active' -- active/dormant/frozen
- notes TEXT

### sim_cards 表 (手机卡)
- id INTEGER PRIMARY KEY
- person_id INTEGER REFERENCES persons(id)
- phone_number TEXT NOT NULL
- carrier TEXT -- 运营商
- plan_name TEXT -- 套餐名称
- monthly_cost REAL
- plan_expiry_date DATE
- balance REAL DEFAULT 0
- usage TEXT -- 券商绑定/银行绑定/备用
- linked_broker_id INTEGER
- status TEXT DEFAULT 'active' -- active/overdue/cancelled
- notes TEXT

### ipos 表 (新股)
- id INTEGER PRIMARY KEY
- stock_name TEXT NOT NULL
- stock_code TEXT
- offer_price REAL
- listing_date DATE
- subscription_start DATE
- subscription_end DATE
- notes TEXT
- created_at DATETIME

### ipo_subscriptions 表 (打新记录)
- id INTEGER PRIMARY KEY
- ipo_id INTEGER REFERENCES ipos(id)
- broker_id INTEGER REFERENCES brokers(id)
- lots_applied INTEGER DEFAULT 0
- amount REAL DEFAULT 0
- is_won BOOLEAN DEFAULT FALSE
- shares_won INTEGER DEFAULT 0
- sell_price REAL
- sell_date DATE
- profit REAL -- 自动计算: (sell_price * shares_won) - amount
- status TEXT DEFAULT 'pending' -- pending/won/lost/sold
- notes TEXT

## API 路由

### Auth
- POST /api/auth/login - 登录(email+password)返回JWT
- POST /api/auth/register - 注册(仅admin可操作)
- GET /api/auth/me - 当前用户信息

### Persons
- GET /api/persons - 列表(含统计)
- POST /api/persons - 新建
- PUT /api/persons/:id - 更新
- DELETE /api/persons/:id - 删除

### Bank Cards
- GET /api/bank-cards?person_id=X - 列表
- POST /api/bank-cards - 新建
- PUT /api/bank-cards/:id - 更新
- DELETE /api/bank-cards/:id - 删除

### Brokers
- GET /api/brokers - 列表(支持筛选)
- POST /api/brokers - 新建
- PUT /api/brokers/:id - 更新
- DELETE /api/brokers/:id - 删除
- GET /api/brokers/alerts - 预警(长期未操作等)

### SIM Cards
- GET /api/sim-cards - 列表
- POST /api/sim-cards - 新建
- PUT /api/sim-cards/:id - 更新
- DELETE /api/sim-cards/:id - 删除
- GET /api/sim-cards/alerts - 到期预警

### IPOs
- GET /api/ipos - 列表
- POST /api/ipos - 新建IPO
- PUT /api/ipos/:id - 更新
- DELETE /api/ipos/:id - 删除
- POST /api/ipos/:id/batch-subscribe - 批量申购(传入broker_ids数组+lots)
- PUT /api/ipos/:id/batch-result - 批量更新中签结果
- PUT /api/ipos/:id/batch-sell - 批量更新卖出

### Dashboard
- GET /api/dashboard/summary - 总览(总资金/总收益/账号数等)
- GET /api/dashboard/alerts - 所有预警汇总

## 前端页面

### 登录页 /login
- 邮箱+密码表单

### 仪表盘 /admin/dashboard
- 总资金、总收益、本月收益
- 账号数、活跃账号数
- 预警卡片(银行卡未动账/SIM到期/券商休眠)

### 人员管理 /admin/persons
- 表格列表，点击进入详情看关联的银行卡/券商/手机卡

### 银行卡管理 /admin/bank-cards
- 表格 + 筛选(按人/按银行/按状态)
- 最后动账日期超过90天标红预警

### 券商管理 /admin/brokers
- 表格 + 筛选
- 显示余额、最后操作日期
- 超过30天未操作标黄

### 手机卡管理 /admin/sim-cards
- 表格 + 筛选
- 套餐到期日<30天标红

### IPO管理 /admin/ipos
- IPO列表
- 点击进入详情：显示所有参与账号+状态
- 批量操作按钮：批量申购、批量录入结果、批量卖出

### IPO批量操作流程
1. 创建IPO(填基本信息)
2. 勾选参与账号(支持全选/按资金筛选)
3. 填入申购手数(可统一填或逐个填)
4. 提交 → 生成所有subscription记录
5. 后续更新：批量标记中签 → 批量填卖出价

## UI要求
- 中文界面
- 简洁干净，类似Notion/Linear的风格
- 响应式，手机上也能用
- 表格支持排序和搜索
- 用TailwindCSS

## 构建输出
- frontend build → dist/
- worker → Cloudflare Worker格式
- 提供 wrangler.toml 配置
- 提供 schema.sql 供创建D1数据库

## 重要
- 密码用bcrypt或sha256+salt hash存储
- JWT token过期时间7天
- 所有API需要auth middleware验证(除了login)
- Admin角色可以管理用户
- Editor角色可以CRUD所有业务数据
- Viewer角色只能看不能改
