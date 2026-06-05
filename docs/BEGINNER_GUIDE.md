# 零基础开发指南

> 写给第一次做网站开发的你。本文档基于当前项目进度，一步步告诉你接下来该做什么、怎么做。
>
> 最后更新：2026-06-05 | 当前进度：P0.2 数据库设计已完成

---

## 目录

1. [你的项目现在长什么样](#1-你的项目现在长什么样)
2. [核心概念速查](#2-核心概念速查)
3. [日常开发命令](#3-日常开发命令)
4. [下一步：P0.3 配置 Supabase 数据库](#4-下一步p03-配置-supabase-数据库)
5. [下一步：P0.4 项目骨架搭建](#5-下一步p04-项目骨架搭建)
6. [下一步：P0.5 基础服务配置](#6-下一步p05-基础服务配置)
7. [进入 P1：首页与动态模块](#7-进入-p1首页与动态模块)
8. [常见问题与排错](#8-常见问题与排错)
9. [学习资源推荐](#9-学习资源推荐)

---

## 1. 你的项目现在长什么样

### 已完成的事

| 步骤 | 状态 | 说明 |
|------|------|------|
| P0.1 技术环境搭建 | ✅ | Next.js + TypeScript + Tailwind + Prisma 都装好了 |
| P0.2 数据库设计 | ✅ | 20 张表的 Schema 已写好在 `prisma/schema.prisma` |

### 当前项目文件结构

```
Chilam_Is_Here/
├── docs/                          # 文档目录
│   ├── DEVELOPMENT_PLAN.md        # 开发计划（看阶段任务）
│   ├── PROGRESS.md                # 进度记录（看做了什么）
│   ├── Database_Design_v1.md      # 数据库设计文档
│   └── BEGINNER_GUIDE.md          # 本文件
│
├── prisma/
│   └── schema.prisma              # 数据库表结构定义（已完成）
│
├── src/
│   └── app/                       # 网站页面代码
│       ├── layout.tsx             # 全局布局（每个页面都会用到）
│       ├── page.tsx               # 首页（目前是 Next.js 默认页面）
│       └── globals.css            # 全局样式
│
├── public/                        # 静态资源（图片、图标等）
├── package.json                   # 项目依赖配置
├── .env.local                     # 环境变量（数据库密码等，不提交到 Git）
├── tsconfig.json                  # TypeScript 配置
├── next.config.ts                 # Next.js 配置
├── eslint.config.mjs              # 代码检查配置
├── .prettierrc                    # 代码格式化配置
└── CLAUDE.md                      # Claude 读取的项目说明
```

### 你需要理解的关键文件

| 文件 | 作用 | 什么时候看 |
|------|------|-----------|
| `src/app/layout.tsx` | 网站的"外壳"——导航栏、页脚在这里定义，所有页面共享 | 改网站整体布局时 |
| `src/app/page.tsx` | 首页内容 | 改首页时 |
| `src/app/xxx/page.tsx` | 某个栏目的页面（还没创建） | 开发各栏目时 |
| `prisma/schema.prisma` | 数据库表结构 | 改数据库时 |
| `.env.local` | 存放密码、API 密钥等敏感信息 | 配置数据库/存储时 |
| `package.json` | 项目用了哪些工具包 | 安装新工具时 |

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

## 4. 下一步：P0.3 配置 Supabase 数据库

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

## 5. 下一步：P0.4 项目骨架搭建

> 目标：搭好网站的基本框架——导航栏、页脚、各栏目空页面。完成后你将拥有一个可以点击导航的空网站。

### 5.1 创建文件夹结构

你需要创建以下目录和文件（可以让 Claude 帮你做）：

```
src/
├── app/
│   ├── layout.tsx              # 修改：加入导航栏和页脚
│   ├── page.tsx                # 修改：首页内容
│   ├── globals.css             # 修改：全局样式
│   │
│   ├── updates/                # 动态
│   │   └── page.tsx
│   ├── screens/                # 影视
│   │   └── page.tsx
│   ├── performances/           # 演出
│   │   └── page.tsx
│   ├── activities/             # 活动
│   │   └── page.tsx
│   ├── archives/               # 资料库
│   │   └── page.tsx
│   ├── messages/               # 留言
│   │   └── page.tsx
│   └── announcements/          # 公告
│       └── page.tsx
│
├── components/                 # 可复用的组件
│   ├── layout/
│   │   ├── Header.tsx          # 导航栏
│   │   ├── Footer.tsx          # 页脚
│   │   └── Navigation.tsx      # 导航菜单
│   └── ui/                     # 通用 UI 组件（后面逐步添加）
│       └── (暂时空)
│
├── lib/                        # 工具函数
│   └── prisma.ts               # Prisma 客户端实例
│
└── types/                      # TypeScript 类型定义
    └── (暂时空)
```

### 5.2 创建 Prisma 客户端实例

文件 `src/lib/prisma.ts`——整个项目共用一个数据库连接：

```typescript
import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

> **为什么这么写？** Next.js 开发模式下会频繁重新加载代码，如果每次都创建新连接会导致数据库连接用完。这段代码确保只创建一个连接。

### 5.3 搭建布局：导航栏 + 页脚

**Header.tsx** 需要包含：

```
┌─────────────────────────────────────────────────────────┐
│  LOGO/站名    首页  动态  影视  演出  活动  资料库  留言  公告  │
└─────────────────────────────────────────────────────────┘
```

导航栏对应的路由：

| 栏目名 | 路由 |
|--------|------|
| 首页 | `/` |
| 动态 | `/updates` |
| 影视 | `/screens` |
| 演出 | `/performances` |
| 活动 | `/activities` |
| 资料库 | `/archives` |
| 留言 | `/messages` |
| 公告 | `/announcements` |

### 5.4 创建各栏目空页面

每个栏目先创建一个最简单的占位页面，例如 `src/app/updates/page.tsx`：

```tsx
export default function UpdatesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">动态</h1>
      <p className="mt-4 text-gray-500">内容开发中...</p>
    </div>
  );
}
```

### 5.5 怎么让 Claude 帮你做

你可以直接对 Claude 说：

> "请帮我完成 P0.4 项目骨架：创建 Header/Footer/Navigation 组件，创建所有栏目的空页面路由，修改 layout.tsx 使用新组件。风格简洁现代，中文为主。"

Claude 会帮你创建所有文件。完成后运行 `pnpm dev` 查看效果。

### 5.6 验收标准

完成后你应该能：
- [ ] 打开 http://localhost:3000 看到有导航栏和页脚的首页
- [ ] 点击导航栏上的每个栏目，能跳转到对应的空页面
- [ ] 每个页面都有导航栏和页脚（layout.tsx 的作用）
- [ ] 手机宽度下导航栏能正常显示（响应式）

---

## 6. 下一步：P0.5 基础服务配置

> 目标：配置图片存储（Cloudflare R2）和部署平台（Vercel）。
> 这一步可以先跳过，等到 P1 需要上传图片时再配。

### 6.1 Cloudflare R2（图片/视频存储）

**什么时候需要？** 当你开始上传图片、视频时（P1 阶段）。

1. 注册 https://dash.cloudflare.com
2. 左侧菜单 → **R2 Object Storage** → **Create bucket**
3. Bucket 名称：`chilam-media`
4. 获取 API 密钥，填入 `.env.local`

### 6.2 Vercel（网站部署）

**什么时候需要？** 当你想让别人能访问你的网站时（P5 阶段，但建议早点配好方便预览）。

1. 注册 https://vercel.com（用 GitHub 账号）
2. 导入你的 Git 仓库
3. Vercel 会自动检测 Next.js 项目并部署
4. 每次你 `git push`，Vercel 会自动更新网站

---

## 7. 进入 P1：首页与动态模块

> 这是真正开始做"看得见"的东西了。

### 7.1 Seed 数据（填充测试数据）

在开发页面之前，数据库里需要有一些测试数据，否则页面是空的。

创建 `prisma/seed.ts`，填入一些张智霖的真实数据，例如：

```typescript
// 示例：添加一些标签
await prisma.tag.createMany({
  data: [
    { name: "粤语", slug: "cantonese", tagGroup: "language" },
    { name: "普通话", slug: "mandarin", tagGroup: "language" },
    { name: "香港", slug: "hong-kong", tagGroup: "region" },
    { name: "射雕英雄传", slug: "legend-of-condor-heroes", tagGroup: "work" },
  ],
});

// 示例：添加栏目
await prisma.category.createMany({
  data: [
    { name: "动态", slug: "updates", path: "/updates", level: 1, sortOrder: 1 },
    { name: "影视", slug: "screens", path: "/screens", level: 1, sortOrder: 2 },
    // ...
  ],
});

// 示例：添加一条时间线事件
await prisma.timelineEvent.create({
  data: {
    date: new Date("2025-01-01"),
    title: "披荆斩棘 2025 开播",
    description: "张智霖参加芒果TV综艺《披荆斩棘》第四季",
  },
});
```

运行：`npx prisma db seed`

> 你可以让 Claude 帮你写完整的 seed 文件："请帮我写 prisma/seed.ts，填入张智霖的基本数据，包括栏目、标签、几条时间线事件、几部代表作品。"

### 7.2 首页开发

首页三大区域：

```
┌─────────────────────────────────────┐
│           导航栏 (Header)            │
├─────────────────────────────────────┤
│                                     │
│  📸 大图展示区                       │
│  （张智霖精选照片轮播）                │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  💬 一句话展示                       │
│  "做人最紧要开心"                    │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  📅 时间线                           │
│  ├ 2025.06 - 新综艺开播              │
│  ├ 2025.03 - 演唱会香港站            │
│  ├ 2024.12 - 新歌发布                │
│  └ ...                              │
│                                     │
├─────────────────────────────────────┤
│           页脚 (Footer)              │
└─────────────────────────────────────┘
```

开发顺序建议：
1. 先做静态版本（写死数据，确认布局效果）
2. 再改成从数据库读取（接入 Prisma）

### 7.3 动态模块开发

路由结构：

```
/updates                → 动态总览页
/updates/social         → 社交媒体子页
/updates/news           → 新闻报道子页
/updates/sightings      → 路透子页
```

对应文件：

```
src/app/updates/
├── page.tsx            → /updates
├── social/
│   └── page.tsx        → /updates/social
├── news/
│   └── page.tsx        → /updates/news
└── sightings/
    └── page.tsx        → /updates/sightings
```

### 7.4 API 开发

API 文件放在 `src/app/api/` 下：

```
src/app/api/
├── social-posts/
│   └── route.ts        → GET /api/social-posts (获取列表)
├── news/
│   └── route.ts        → GET /api/news
└── sightings/
    └── route.ts        → GET /api/sightings
```

一个最简单的 API 长这样：

```typescript
// src/app/api/social-posts/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const posts = await prisma.socialPost.findMany({
    orderBy: { publishedAt: "desc" },
    take: 20,
  });
  return NextResponse.json(posts);
}
```

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

| 主题 | 资源 | 说明 |
|------|------|------|
| Next.js 基础 | https://nextjs.org/learn | 官方教程，中文也有 |
| Tailwind CSS | https://tailwindcss.com/docs | 样式类名查手册就行，不需要背 |
| Prisma 基础 | https://www.prisma.io/docs/getting-started | 数据库操作查这个 |

### 选读（想深入了解）

| 主题 | 资源 | 说明 |
|------|------|------|
| TypeScript | https://www.typescriptlang.org/docs/handbook/ | 类型系统基础 |
| React 基础 | https://react.dev/learn | 组件、状态、事件 |

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

### P0 完成标志（你现在在这里）
- [x] P0.1 技术环境搭建
- [x] P0.2 数据库 Schema 设计
- [ ] P0.3 Supabase 数据库配置 + 迁移 ← **你的下一步**
- [ ] P0.4 项目骨架（导航栏、页脚、空页面）
- [ ] P0.5 基础服务配置（R2、Vercel）

### P1 完成标志
- [ ] 首页有时间线、大图、一句话
- [ ] /updates 能看到动态列表
- [ ] 能按平台/类型筛选动态
- [ ] 有测试数据可以看效果

### P2 完成标志
- [ ] /screens 能看到影视列表，可按电影/电视剧/综艺筛选
- [ ] /performances 能看到演出列表
- [ ] 详情页能看到完整信息

---

> 有任何疑问，直接问 Claude。它读过所有项目文档，了解你的项目结构和设计。
