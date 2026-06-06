# 零基础开发指南

> 写给第一次做网站开发的你。本文档基于当前项目进度，一步步告诉你接下来该做什么、怎么做。
>
> 最后更新：2026-06-06 | 当前进度：P2 作品模块已完成（影视+演出），准备进入 P3.1

---

## 目录

1. [你的项目现在长什么样](#1-你的项目现在长什么样)
2. [核心概念速查](#2-核心概念速查)
3. [日常开发命令](#3-日常开发命令)
4. [已完成：Supabase 数据库配置](#4-已完成supabase-数据库配置)
5. [已完成：项目骨架搭建](#5-已完成项目骨架搭建)
6. [下一步：基础服务配置（可选）](#6-下一步基础服务配置可选)
7. [进入 P1：首页与动态模块](#7-进入-p1首页与动态模块)
8. [常见问题与排错](#8-常见问题与排错)
9. [学习资源推荐](#9-学习资源推荐)

---

## 1. 你的项目现在长什么样

### 已完成的事

| 步骤                            | 状态 | 说明                                                 |
| ------------------------------- | ---- | ---------------------------------------------------- |
| P0.1 技术环境搭建               | ✅   | Next.js 16 + TypeScript + Tailwind CSS v4 + Prisma 7 |
| P0.2 数据库设计 + Supabase 配置 | ✅   | 20 张表 Schema + Supabase 迁移完成                   |
| P0.3 项目骨架搭建               | ✅   | 深色主题设计系统 + 16 个页面路由 + 14 个组件         |
| P1.1 首页开发                   | ✅   | 数据库驱动的时间线 + Hero 大图 + 一句话              |
| P1.2 动态模块                   | ✅   | 动态列表页 + 三种详情页 + 筛选/分页                  |
| P1.3 API 开发                   | ✅   | CRUD API + 分页筛选 + 统一响应格式                   |
| P2.1 影视模块                   | ✅   | 影视列表页 + 详情页 + API + 38 条种子数据            |
| P2.2 演出模块                   | ✅   | 演出列表页 + 详情页 + API + 11 条种子数据            |

### 当前项目文件结构

```
Chilam_Is_Here/
├── docs/                          # 文档目录
│   ├── DEVELOPMENT_PLAN.md        # 开发计划
│   ├── PROGRESS.md                # 进度记录
│   ├── Database_Design_v1.md      # 数据库设计文档
│   ├── chilam-website-design.md   # 网站设计文档
│   ├── BEGINNER_GUIDE.md          # 本文件
│   ├── 参考图/                     # UI 参考图
│   └── draft_bak/                 # 设计草稿
│
├── prisma/
│   ├── schema.prisma              # 数据库表结构（20 张表）
│   ├── seed.ts                    # 种子数据脚本（P1 新增）
│   └── migrations/                # 数据库迁移记录
│
├── src/
│   ├── app/                       # 页面路由
│   │   ├── layout.tsx             # 全局布局（Header + Footer + FilmGrain）
│   │   ├── page.tsx               # 首页（Hero + 时间线 + 栏目入口，数据库驱动）
│   │   ├── not-found.tsx          # 404 页面
│   │   ├── globals.css            # 全局样式 + 设计令牌
│   │   ├── updates/               # 动态栏目（P1 完成）
│   │   │   ├── page.tsx           # 动态列表页（三 Tab + 筛选 + 分页）
│   │   │   ├── loading.tsx        # 加载骨架屏
│   │   │   ├── social/[id]/       # 社交帖详情页
│   │   │   ├── news/[slug]/       # 新闻详情页
│   │   │   └── sightings/[slug]/  # 路透详情页
│   │   ├── api/                   # API 路由（P1 新增）
│   │   │   └── updates/           # 动态 CRUD API
│   │   │       ├── social/        # GET/POST 社交帖
│   │   │       ├── news/          # GET/POST 新闻
│   │   │       ├── sightings/     # GET/POST 路透
│   │   │       └── [id]/          # GET/PUT/DELETE 通用详情
│   │   ├── screens/               # 影视综栏目
│   │   ├── performances/          # 演出栏目
│   │   ├── activities/            # 活动栏目
│   │   ├── archives/              # 资料库栏目
│   │   ├── messages/              # 留言板栏目
│   │   └── announcements/         # 公告栏目
│   │
│   ├── components/                # 可复用组件
│   │   ├── layout/                # 布局（Header, Footer, MobileNav, PageContainer, PageHeader）
│   │   ├── ui/                    # 通用 UI（Button, Card, Tag, TabBar, GoldDivider, GlassOverlay, UnderConstruction,
│   │   │                          #   Pagination, SocialPostCard, NewsArticleCard, SightingCard,
│   │   │                          #   UpdateCardSkeleton, MasonryGrid, UpdatesFilterBar）
│   │   └── decorative/            # 装饰（FilmGrain, YearMarquee）
│   │
│   ├── config/                    # 配置文件
│   │   ├── site.ts                # 站点信息（名称、社交链接等）
│   │   └── navigation.ts          # 导航栏目配置
│   │
│   ├── lib/                       # 工具函数
│   │   ├── cn.ts                  # 样式类名合并工具
│   │   ├── fonts.ts               # 字体配置（5 款 Google Fonts）
│   │   ├── db.ts                  # 数据库连接（Prisma 单例 + adapter-pg）
│   │   ├── types.ts               # 数据类型定义（P1 新增）
│   │   └── queries/               # 数据查询层（P1 新增）
│   │       ├── timeline.ts        # 时间线查询
│   │       └── updates.ts         # 动态查询（社交帖/新闻/路透）
│   │
│   └── generated/                 # Prisma 生成的代码（自动生成，不要手动修改）
│
├── public/                        # 静态资源
├── package.json                   # 项目依赖
├── .env.local                     # 环境变量（不提交 Git）
└── CLAUDE.md                      # Claude 项目说明
```

### 你需要理解的关键文件

| 文件                       | 作用                                   | 什么时候看           |
| -------------------------- | -------------------------------------- | -------------------- |
| `src/app/layout.tsx`       | 网站"外壳"——导航栏、页脚、胶片颗粒效果 | 改网站整体布局时     |
| `src/app/page.tsx`         | 首页（Hero + 时间线 + 栏目入口）       | 改首页时             |
| `src/app/globals.css`      | 设计令牌（配色、字体、特效）           | 改全站视觉风格时     |
| `src/config/navigation.ts` | 导航栏栏目配置                         | 添加/修改/删除栏目时 |
| `src/config/site.ts`       | 站点名称、社交链接等                   | 改站点基本信息时     |
| `src/components/`          | 各种可复用组件                         | 修改组件样式或行为时 |
| `prisma/schema.prisma`     | 数据库表结构                           | 改数据库时           |
| `.env.local`               | 密码、API 密钥                         | 配置数据库/存储时    |

---

## 2. 核心概念速查

> 不需要全部理解，遇到不懂的回来查就行。

### Next.js App Router（网站框架）

```
核心概念：文件 = 页面

src/app/page.tsx           →  网址: /            (首页)
src/app/updates/page.tsx   →  网址: /updates     (动态页)
src/app/screens/page.tsx   →  网址: /screens     (影视页)

你创建一个文件夹 + page.tsx，就自动有了一个网页。
```

**layout.tsx** = 页面的外壳（导航栏 + 页脚），所有子页面自动继承。

```
layout.tsx 定义了:
┌─────────────────────┐
│    导航栏 (Header)    │
├─────────────────────┤
│                     │
│    page.tsx 内容     │  ← 每个页面不同的部分
│                     │
├─────────────────────┤
│    页脚 (Footer)     │
└─────────────────────┘
```

### React + TypeScript（写页面）

```tsx
// 一个最简单的页面长这样：
export default function UpdatesPage() {
  return (
    <div>
      <h1>动态</h1>
      <p>这里展示张智霖的最新动态。</p>
    </div>
  );
}

// 看起来像 HTML，但其实是 JSX（JavaScript + HTML 的混合写法）
// TypeScript = JavaScript + 类型检查（帮你少犯错）
```

### Tailwind CSS（写样式）

```tsx
// 不需要写单独的 CSS 文件，直接在 HTML 标签上写样式类名：
<h1 className="text-2xl font-bold text-gray-900">动态</h1>

// 常用类名速查：
// text-2xl     → 字号大
// font-bold    → 加粗
// text-gray-900 → 深灰色字
// p-4          → 内边距 16px
// m-4          → 外边距 16px
// flex         → 弹性布局
// grid         → 网格布局
// rounded-lg   → 圆角
// shadow       → 阴影
// bg-white     → 白色背景
```

### Prisma（数据库工具）

```
你写的 schema.prisma   →  告诉 Prisma "我要什么表、什么字段"
prisma migrate         →  Prisma 帮你在数据库里真正创建这些表
prisma generate        →  Prisma 生成 TypeScript 代码，让你在代码里操作数据库
prisma studio          →  打开一个网页，让你可视化查看/编辑数据库里的数据
```

### 数据流动方式

```
用户访问网页
    ↓
Next.js 页面 (src/app/xxx/page.tsx)
    ↓
调用 API 或直接查数据库 (通过 Prisma)
    ↓
Prisma 从 PostgreSQL 数据库取数据
    ↓
数据返回给页面，渲染成 HTML 展示给用户
```

---

## 3. 日常开发命令

打开终端（Terminal），确保在项目根目录 `Chilam_Is_Here/` 下运行：

### 最常用的 3 个命令

```bash
# 1. 启动开发服务器（每次开始写代码前运行）
pnpm dev
# 然后打开浏览器访问 http://localhost:3000 看效果
# 修改代码后页面会自动刷新
# 按 Ctrl+C 停止

# 2. 检查代码是否有语法错误
pnpm lint

# 3. 格式化代码（让代码整齐好看）
pnpm format
```

### 数据库相关命令

```bash
# 查看数据库里的数据（图形界面）
npx prisma studio

# 根据 schema.prisma 创建/更新数据库表
npx prisma migrate dev --name 描述这次改了什么

# 重新生成 Prisma 客户端代码（改了 schema 后需要运行）
npx prisma generate

# 用种子数据填充数据库（写好 seed 脚本后）
npx prisma db seed
```

### Git 版本管理（保存你的工作）

```bash
# 查看改了哪些文件
git status

# 把改动加入暂存区
git add 文件名           # 加单个文件
git add .               # 加所有改动

# 提交（保存一个版本）
git commit -m "简短描述你做了什么"

# 查看提交历史
git log --oneline
```

### 安装新工具包

```bash
# 安装运行时依赖（网站运行需要的）
pnpm add 包名

# 安装开发依赖（只在开发时需要的）
pnpm add -D 包名
```

---

## 4. 已完成：Supabase 数据库配置

> ✅ 此步骤已完成。以下内容保留作为参考，帮助你理解数据库是如何配置的。
>
> 目标：让你的数据库 Schema 真正变成可用的数据库表。

### 4.1 注册 Supabase

1. 打开 https://supabase.com
2. 点击 "Start your project"，用 GitHub 账号登录
3. 点击 "New Project"
4. 填写：
   - **Project name**: `chilam-is-here`
   - **Database Password**: 设一个强密码（**记下来！后面要用**）
   - **Region**: 选 `Northeast Asia (Tokyo)` 或 `Southeast Asia (Singapore)`（离你近的）
5. 等待项目创建完成（约 1-2 分钟）

### 4.2 获取数据库连接地址

1. 进入 Supabase 项目面板
2. 左侧菜单点击 **Project Settings**（齿轮图标）
3. 点击 **Database**
4. 找到 **Connection string** 区域
5. 选择 **URI** 标签
6. 复制连接字符串，它长这样：
   ```
   postgresql://postgres.[项目ID]:[你的密码]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
   ```

### 4.3 配置本地环境变量

用编辑器打开项目根目录的 `.env.local` 文件，把数据库地址填进去：

```env
# 把下面的内容替换成你自己的 Supabase 连接字符串
DATABASE_URL="postgresql://postgres.[项目ID]:[密码]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres"
```

> **注意**：`.env.local` 文件包含密码，**绝对不要**提交到 Git！（.gitignore 已经配好了，不用担心）

### 4.4 运行数据库迁移

```bash
# 这一步会把 prisma/schema.prisma 里定义的 20 张表真正创建到数据库中
npx prisma migrate dev --name init
```

运行后你应该看到类似输出：

```
Applying migration `20260605_init`
The following migration(s) have been applied:
  20260605_init

Your database is now in sync with your schema.
✔ Generated Prisma Client
```

### 4.5 验证数据库

```bash
# 打开 Prisma Studio 查看数据库
npx prisma studio
```

浏览器会自动打开 http://localhost:5555，你应该能看到所有 20 张表（虽然里面还没有数据）。

### 4.6 回 Supabase 面板确认

回到 Supabase 网页，左侧菜单点击 **Table Editor**，你应该能看到所有创建好的表。

---

## 5. 已完成：项目骨架搭建

> ✅ 此步骤已完成。以下内容描述了骨架的设计思路和文件结构。

### 5.1 设计系统

项目采用 **全站深色主题**（时光电影感），核心视觉元素：

| 元素                   | 说明                 | 修改位置                          |
| ---------------------- | -------------------- | --------------------------------- |
| 深靛蓝背景 `#1A1A2E`   | 全站默认背景         | `globals.css` → `--color-bg-dark` |
| 琥珀金强调色 `#C49B63` | 按钮、高亮、时间线   | `globals.css` → `--color-accent`  |
| 胶片颗粒效果           | 3% 透明度噪点覆盖    | `FilmGrain` 组件                  |
| 毛玻璃导航栏           | 滚动时激活 blur 效果 | `Header` 组件                     |
| 琥珀金细线             | 0.5px 渐变分隔线     | `.gold-line` class                |

### 5.2 组件体系

| 分类 | 组件              | 作用                              |
| ---- | ----------------- | --------------------------------- |
| 布局 | Header            | 顶部导航（透明→毛玻璃）           |
| 布局 | MobileNav         | 移动端侧边抽屉菜单                |
| 布局 | Footer            | 三栏页脚 + 年份暗纹               |
| 布局 | PageContainer     | 页面内容容器                      |
| 布局 | PageHeader        | 页面标题（中文 + 英文 + 金线）    |
| UI   | Button            | 三种变体：primary/secondary/ghost |
| UI   | Card              | 深色卡片，hover 金边框            |
| UI   | Tag               | 琥珀金标签                        |
| UI   | TabBar            | 分类切换（底部金线指示器）        |
| UI   | GoldDivider       | 琥珀金细线分隔                    |
| UI   | GlassOverlay      | 毛玻璃弹窗遮罩                    |
| UI   | UnderConstruction | "建设中"占位                      |
| 装饰 | FilmGrain         | 胶片颗粒噪声                      |
| 装饰 | YearMarquee       | 年份泛金动画                      |

### 5.3 路由页面

所有 8 个栏目已创建路由，目前显示"建设中"占位内容：

| 页面   | 地址             | 文件                             |
| ------ | ---------------- | -------------------------------- |
| 首页   | `/`              | `src/app/page.tsx`               |
| 动态   | `/updates`       | `src/app/updates/page.tsx`       |
| 影视综 | `/screens`       | `src/app/screens/page.tsx`       |
| 演出   | `/performances`  | `src/app/performances/page.tsx`  |
| 活动   | `/activities`    | `src/app/activities/page.tsx`    |
| 资料库 | `/archives`      | `src/app/archives/page.tsx`      |
| 留言板 | `/messages`      | `src/app/messages/page.tsx`      |
| 公告   | `/announcements` | `src/app/announcements/page.tsx` |
| 404    | 任意不存在的路径 | `src/app/not-found.tsx`          |

### 5.4 如何修改全站风格

想改全站配色？只需修改 `src/app/globals.css` 中的 `@theme inline` 区块：

```css
@theme inline {
  --color-bg-dark: #1a1a2e; /* 改这里换主背景色 */
  --color-accent: #c49b63; /* 改这里换强调色 */
  /* ... */
}
```

想改导航栏目？修改 `src/config/navigation.ts`：

```typescript
export const NAV_ITEMS = [
  { label: '动态', labelEn: 'Updates', href: '/updates' },
  // 增删改这里的条目即可
];
```

---

## 6. 下一步：基础服务配置（可选）

> 此步骤可选，可以等到 P1 需要时再配置。Supabase 数据库已配好，R2 和 Vercel 待配。
>
> 目标：配置图片存储（Cloudflare R2）和部署平台（Vercel）。

### 6.1 Cloudflare R2（图片/视频存储）

**什么时候需要？** 当你开始上传图片、视频时（P1 阶段）。

1. 注册 https://dash.cloudflare.com
2. 左侧菜单 → **R2 Object Storage** → **Create bucket**
3. Bucket 名称：`chilam-media`
4. 获取 API 密钥，填入 `.env.local`

### 6.2 Vercel（网站部署）

**什么时候需要？** 当你想让别人能访问你的网站时（P5 阶段，但建议早点配好方便预览）。

1. 注册 https://vercel.com  （用 GitHub 账号）
2. 导入你的 Git 仓库
3. Vercel 会自动检测 Next.js 项目并部署
4. 每次你 `git push`，Vercel 会自动更新网站

---

## 7. 已完成：P1 首页与动态模块

> ✅ 此步骤已完成。以下内容描述了 P1 创建的文件、关键概念和实现细节。

### 7.1 P1 创建的新文件

| 文件 | 作用 |
|------|------|
| `prisma/seed.ts` | 种子数据脚本：8 标签 + 30 社交帖 + 15 新闻 + 10 路透 + 20 时间线事件 |
| `src/lib/types.ts` | 数据类型定义（TimelineEvent, SocialPost, NewsArticle, Sighting 等） |
| `src/lib/queries/timeline.ts` | 时间线数据查询（按年份分组、排序） |
| `src/lib/queries/updates.ts` | 动态数据查询（分页、筛选、搜索） |
| `src/components/ui/SocialPostCard.tsx` | 社交帖卡片组件 |
| `src/components/ui/NewsArticleCard.tsx` | 新闻卡片组件 |
| `src/components/ui/SightingCard.tsx` | 路透卡片组件 |
| `src/components/ui/UpdateCardSkeleton.tsx` | 加载骨架屏组件 |
| `src/components/ui/MasonryGrid.tsx` | 瀑布流布局组件 |
| `src/components/ui/UpdatesFilterBar.tsx` | 筛选栏组件 |
| `src/components/ui/Pagination.tsx` | 分页组件 |
| `src/app/updates/page.tsx` | 动态列表页（三 Tab + 筛选 + 分页） |
| `src/app/updates/loading.tsx` | 动态页加载骨架屏 |
| `src/app/updates/social/[id]/page.tsx` | 社交帖详情页 |
| `src/app/updates/news/[slug]/page.tsx` | 新闻详情页 |
| `src/app/updates/sightings/[slug]/page.tsx` | 路透详情页 |
| `src/app/api/updates/social/route.ts` | 社交帖 CRUD API |
| `src/app/api/updates/news/route.ts` | 新闻 CRUD API |
| `src/app/api/updates/sightings/route.ts` | 路透 CRUD API |
| `src/app/api/updates/[id]/route.ts` | 通用详情 API（GET/PUT/DELETE） |

### 7.2 关键概念：Server Components 数据获取

P1 的页面使用了 Next.js Server Components 直接在服务端获取数据，不需要写单独的 API 调用：

```typescript
// src/app/page.tsx（首页）— 这是一个 Server Component
// 可以直接 await 查询数据库，不需要 useEffect 或 fetch
import { getTimelineEvents } from '@/lib/queries/timeline';

export default async function HomePage() {
  const events = await getTimelineEvents(); // 直接在服务端查数据库
  return <Timeline events={events} />;
}
```

**Server Component vs Client Component 的区别**：

| 特性 | Server Component（默认） | Client Component（加 'use client'） |
|------|--------------------------|--------------------------------------|
| 运行位置 | 服务器上 | 浏览器中 |
| 可以直接查数据库 | 是 | 否 |
| 可以用 useState/useEffect | 否 | 是 |
| 可以处理用户交互（点击等） | 否 | 是 |
| 何时使用 | 展示数据、页面内容 | 表单、筛选器、交互功能 |

### 7.3 关键概念：URL 分页

动态列表页使用 URL 参数进行分页和筛选，而不是组件内部状态：

```
/updates?tab=social&platform=weibo&page=2
```

好处是：
- 用户可以分享带筛选条件的链接
- 浏览器后退按钮可以正常工作
- 搜索引擎可以索引不同页面

### 7.4 关键概念：瀑布流布局

动态页面使用 MasonryGrid 组件实现瀑布流布局（类似小红书/Pinterest），让不同高度的卡片紧凑排列，避免出现大量空白。

### 7.5 API 路由结构

```
src/app/api/updates/
├── social/route.ts       → GET（列表+分页）/ POST（创建）
├── news/route.ts         → GET（列表+分页）/ POST（创建）
├── sightings/route.ts    → GET（列表+分页）/ POST（创建）
└── [id]/route.ts         → GET（详情）/ PUT（更新）/ DELETE（删除）
```

所有 API 返回统一格式：
```json
{
  "data": [...],
  "pagination": { "page": 1, "pageSize": 20, "total": 100, "totalPages": 5 }
}
```

### 7.6 P2.1 影视模块（已完成）

影视模块已实现，包含：
- 列表页 `/screens`：电影/电视剧/综艺三 Tab + 年代筛选 + 综艺地区筛选
- 详情页 `/screens/[slug]`：海报 + 信息双栏布局
- API：`/api/screens`（GET/POST）、`/api/screens/[slug]`（GET/PUT/DELETE）
- 种子数据：38 条（15 电视剧 + 15 电影 + 8 综艺）

### 7.7 P2.2 演出模块（已完成）

演出模块已实现，文件结构与影视模块类似：

```
src/
├── app/
│   ├── performances/
│   │   ├── page.tsx           # 演出列表页（演唱会/舞台/音乐剧三 Tab + 系列筛选）
│   │   ├── loading.tsx        # 加载骨架屏
│   │   └── [slug]/
│   │       └── page.tsx       # 演出详情页（海报+信息双栏，歌单，官摄区，饭拍区）
│   └── api/performances/
│       ├── route.ts           # GET（列表+分页）/ POST（创建）
│       └── [slug]/
│           └── route.ts       # GET（详情）/ PUT（更新）/ DELETE（删除）
├── components/ui/
│   ├── PerformanceCard.tsx    # 演出海报卡片（2:3 比例，类型 badge，场馆/城市）
│   └── PerformancesFilterBar.tsx  # 筛选栏（类型 Tab + 演唱会系列筛选）
└── lib/
    └── queries/
        └── performances.ts   # 演出查询（getPerformances, getPerformanceBySlug, getPerformanceCounts）
```

- 种子数据：11 条（4 演唱会 + 5 舞台 + 2 音乐剧）+ 2 个新标签
- 列表页：Grid 布局海报卡片，支持类型 Tab 切换和演唱会系列筛选，含分页
- 详情页：海报+信息双栏布局，歌单展示，官摄视频区，饭拍视频区

**如何添加新的演出数据：**
1. 在 `prisma/seed.ts` 的演出数据数组中添加新条目
2. 运行 `npx prisma db seed` 重新填充数据
3. 或通过 API `POST /api/performances` 以 JSON 方式创建

### 7.8 下一步：P3.1 活动模块

P3.1 将开发活动（`/activities`）模块：广告代言/访谈列表 + 详情页

---

## 8. 常见问题与排错

### 启动失败

```bash
# 问题：pnpm dev 报错
# 解决：先安装依赖
pnpm install

# 问题：数据库连接失败
# 解决：检查 .env.local 里的 DATABASE_URL 是否正确
cat .env.local
```

### Prisma 相关

```bash
# 问题：改了 schema.prisma 但代码里没有新的类型
# 解决：重新生成客户端
npx prisma generate

# 问题：数据库和 schema 不同步
# 解决：运行迁移
npx prisma migrate dev --name describe-your-change

# 问题：想重置数据库（删除所有数据重来）
# 解决：
npx prisma migrate reset
# ⚠️ 这会删除所有数据！
```

### Git 相关

```bash
# 问题：不小心改坏了文件，想恢复
git checkout -- 文件名     # 恢复单个文件
git stash                  # 暂存所有未提交的改动（可以之后恢复）

# 问题：想看某个文件之前的版本
git log --oneline 文件名   # 查看文件历史
git show 提交ID:文件名     # 查看某个版本的内容
```

### 页面空白或报错

```
打开浏览器开发者工具查看错误：
- Mac: Cmd + Option + I
- Windows: F12

看 Console（控制台）标签里的红色错误信息，
把错误信息给 Claude，它可以帮你排查。
```

---

## 9. 学习资源推荐

> 不需要全部学完再开始做。边做边查是最有效的学习方式。

### 必读（遇到不懂再看）

| 主题         | 资源                                       | 说明                         |
| ------------ | ------------------------------------------ | ---------------------------- |
| Next.js 基础 | https://nextjs.org/learn                   | 官方教程，中文也有           |
| Tailwind CSS | https://tailwindcss.com/docs               | 样式类名查手册就行，不需要背 |
| Prisma 基础  | https://www.prisma.io/docs/getting-started | 数据库操作查这个             |

### 选读（想深入了解）

| 主题       | 资源                                          | 说明             |
| ---------- | --------------------------------------------- | ---------------- |
| TypeScript | https://www.typescriptlang.org/docs/handbook/ | 类型系统基础     |
| React 基础 | https://react.dev/learn                       | 组件、状态、事件 |

### 最有效的学习方式

1. **不要试图先学完再做**——直接让 Claude 帮你写代码，看它怎么写的
2. **看不懂的代码**——选中那段代码问 Claude "这段代码是什么意思"
3. **出了 bug**——把错误信息贴给 Claude，让它帮你修
4. **想改某个效果**——描述你想要的效果，让 Claude 改，然后看它改了什么
5. **每天花 15 分钟**看 Next.js 官方教程，慢慢就懂了

---

## 快速参考：怎么跟 Claude 协作

### 让 Claude 帮你开发

```
好的指令示例：

"请帮我完成 P0.4 项目骨架，创建 Header、Footer、Navigation 组件和所有栏目空页面"

"帮我写 seed 数据，包含张智霖的 10 部代表电影和 5 张专辑"

"动态列表页需要支持按平台筛选（微博/Instagram/抖音），请帮我实现"

"这个报错是什么意思？[贴上错误信息]"

"帮我把这个页面改成手机端也好看的响应式布局"
```

### 让 Claude 检查工作

```
"请检查当前代码有没有问题"

"请运行 lint 和 build 看看有没有错误"

"帮我看看 schema.prisma 和 Database_Design_v1.md 是否一致"
```

### 让 Claude 记录进度

```
"帮我更新 PROGRESS.md，记录今天完成了什么"

"请提交代码，commit message 用中文"
```

---

## 阶段完成检查清单

### P0 完成标志 ✅

- [x] P0.1 技术环境搭建
- [x] P0.2 数据库 Schema 设计 + Supabase 配置 + 迁移
- [x] P0.3 项目骨架（深色主题 + 组件库 + 路由）
- [ ] 基础服务配置（R2、Vercel）— 可选，P1 时再配

### P1 完成标志 ✅

- [x] 首页有时间线、大图、一句话
- [x] /updates 能看到动态列表
- [x] 能按平台/类型筛选动态
- [x] 有测试数据可以看效果

### P2.1 完成标志 ✅

- [x] /screens 能看到影视列表，可按电影/电视剧/综艺筛选
- [x] 年代筛选（90/00/10/20年代）生效
- [x] 详情页能看到完整作品信息
- [x] 有 38 条测试数据可以看效果

### P2.2 完成标志 ✅

- [x] /performances 能看到演出列表，可按演唱会/舞台/音乐剧筛选
- [x] 演唱会系列筛选（我是外星人/Crazy Hour/Miniconcert/在）生效
- [x] 详情页有歌单、官摄区、饭拍区
- [x] 有 11 条测试数据可以看效果

### P3.1 完成标志 ← 你的下一步

- [ ] /activities 能看到活动列表
- [ ] 代言和访谈详情页完成

---

> 有任何疑问，直接问 Claude。它读过所有项目文档，了解你的项目结构和设计。
