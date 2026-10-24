# WALLINE 沃澜 · 双语建材商城

面向 **国内 + 海外** 销售建筑装饰线条与背景墙板的完整电商站点：中英双语、多币种、购物车、在线支付（Stripe / PayPal / 支付宝 / 微信 / 电汇）、会员中心与后台管理，全部自托管、零外部服务依赖。

> A self-hosted, bilingual (中文 / English) storefront for architectural aluminium trims, wood-fiber profiles and wall panels — product catalog, cart, checkout with multiple payment routes, customer accounts and an admin console.

---

## 功能总览

| 模块 | 能力 |
| --- | --- |
| 商品展示 | 4 大分类、22 个产品（变体 / 规格 / 起订量 / 库存）、搜索、分类筛选、4 种排序、分页、相关推荐、样品册商品 |
| 购物车 | 数据库持久化购物车（cookie 只存购物车 ID）、变体级合并、库存与起订量约束、优惠码 |
| 结算 | 30 个国家/地区（国内 / 亚洲 / 全球三档运费）、按重量实时计算运费、满额包邮、优惠券抵扣、服务端重算金额 |
| 支付 | Stripe Checkout（信用卡）、PayPal（国际钱包）、支付宝 / 微信（国内，演示流程）、银行电汇（线下）、一键演示支付（默认开启） |
| 会员 | 注册 / 登录（scrypt 密码哈希 + 30 天会话）、个人资料、我的订单 |
| 订单 | 订单快照（商品名 / 变体 / 单价 / 汇率固化）、状态流转、物流单号、支付状态、退款标记 |
| 后台 | 数据概览（销售额 / 订单 / 待处理 / 低库存）、产品增删改、订单状态与物流更新、优惠券管理 |
| 国际化 | 中英双语 URL 前缀（`/zh`、`/en`）、10 种货币换算展示、语言与币种 cookie |
| 内容页 | 关于、联系我们、配送政策、退换货政策、隐私政策、销售条款（双语） |
| 样式 | Tailwind CSS v4，米白 + 墨黑 + 黄铜品牌视觉，移动端自适应 |

## 技术栈

- **Next.js 16.4**（App Router、Server Actions、Turbopack、`proxy.ts` 中间件）+ **React 19** + **TypeScript 5.9**
- **Tailwind CSS 4**（`@tailwindcss/postcss`）
- **SQLite**（Node 内置 `node:sqlite`，无需原生编译）
- 零支付 SDK：Stripe / PayPal 均通过 `fetch` 调用 REST API

## 快速开始

要求 **Node.js ≥ 22**（内置 `node:sqlite`，24 版本测试通过）与 **pnpm**。

```bash
pnpm install
copy .env.example .env     # macOS/Linux: cp .env.example .env
pnpm seed                  # 建表 + 写入演示数据（商品/优惠券/运费/示例订单）
pnpm dev                   # http://localhost:3000 → 自动跳转 /zh 或 /en
```

### 演示账号

| 角色 | 入口 | 账号 |
| --- | --- | --- |
| 客户 | `/zh/account/login` | `demo@walline.com` / `demo1234` |
| 管理员 | `/zh/admin/login` | 密码 `walline-admin`（用 `ADMIN_PASSWORD` 覆盖） |

### 常用命令

```bash
pnpm dev          # 开发服务器（3000 端口）
pnpm build        # 生产构建
pnpm start        # 生产服务（3000 端口）
pnpm typecheck    # TypeScript 类型检查
pnpm seed         # 初始化数据库（表已存在则跳过写入）
pnpm db:reset     # 删除数据库并重建演示数据
pnpm images       # 按产品数据重新生成 SVG 占位图
pnpm standalone   # 把 public / .next/static / data 复制进 .next/standalone
```

## 环境变量

见 `.env.example`。生产环境至少设置：

| 变量 | 说明 |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | 站点对外地址，用于支付回跳与 metadata，如 `https://shop.example.com` |
| `DEMO_PAYMENT` | `false` 关闭演示支付，启用真实支付渠道 |
| `STRIPE_SECRET_KEY` | Stripe 密钥，配置后支持海外信用卡 |
| `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` | PayPal 应用凭据 |
| `PAYPAL_ENV` | `sandbox`（默认）或 `live` |
| `ADMIN_PASSWORD` | 后台登录密码，上线前务必修改 |
| `ADMIN_SECRET` | 可选的会话签名附加密钥 |
| `DATABASE_PATH` | SQLite 文件路径，默认 `./data/walline.db` |

**支付路由规则**：国内（中国大陆）可选微信 / 支付宝 / 电汇；海外可选信用卡 / PayPal / 电汇。配置了真实密钥且 `DEMO_PAYMENT=false` 时走真实渠道，否则回退到演示支付。

## 目录结构

```
app/
  [locale]/            中英文页面（首页、商品、购物车、结算、订单、账户、信息页）
  [locale]/admin/      后台（概览、产品、订单、优惠券）
  actions/             Server Actions（购物车 / 结算 / 认证 / 后台）
  layout.tsx           根布局（<html lang> 由中间件注入的 x-locale 决定）
components/            头部、底部、商品卡、画廊、后台外壳等
lib/
  config.ts            品牌、语言、币种、国家、运费分组、支付方式
  db.ts                SQLite 连接与建表
  seed.ts              演示数据（产品 / 变体 / 优惠券 / 运费 / 示例订单）
  data.ts              商品查询
  cart.ts / orders.ts  购物车与订单
  payments.ts          Stripe / PayPal REST 调用
  auth.ts              会员会话与后台鉴权
  dictionaries.ts      中英文界面文案
  content.ts           信息页长文
scripts/               seed、占位图生成、standalone 打包辅助
data/walline.db        SQLite 数据库（首次运行自动创建）
proxy.ts               语言自动跳转与 x-locale 注入
```

## 定制

- **改文案**：`lib/dictionaries.ts`（中文 / 英文两套）。
- **改信息页**：`lib/content.ts`。
- **改品牌与币种汇率**：`lib/config.ts`（汇率变动时同步更新，订单按下单时汇率固化）。
- **改商品库**：直接在后台增删改；批量导入可编辑 `lib/seed.ts` 后执行 `pnpm db:reset`。
- **换商品图**：把实拍图放进 `public/images/products/`，在后台产品表单填写图片路径，如 `/images/products/my-panel.jpg`。
- **改运费模板**：后台未开放，编辑 `lib/seed.ts` 或数据库 `shipping_methods` 表（基础运费 + 每公斤 + 满额包邮）。

## 部署

### 方式一：Node 常驻（推荐）

```bash
pnpm install && pnpm build
pnpm standalone
# 将 .next/standalone、.next/static、public、data、.env 上传到服务器同一目录
cd /var/www/walline && node server.js
```

用 systemd 或 pm2 守护进程；Nginx / Caddy 反代 3000 端口并配置 HTTPS。SQLite 为单文件数据库，定时备份 `data/walline.db` 即可。

### 方式二：容器 / PaaS

设置 `DATABASE_PATH` 指向持久化挂载目录，构建命令 `pnpm build`，启动命令 `pnpm start`，并配好上表环境变量。注意：文件系统若为只读或临时存储，数据库会丢失。

## 已知限制

- 后台管理未做多角色权限，只有一个管理员密码。
- 支付宝 / 微信为内置演示流程，正式收款需接入官方商户接口。
- 邮件通知、物流接口、真实的图片上传（目前填写路径）尚未接入。
