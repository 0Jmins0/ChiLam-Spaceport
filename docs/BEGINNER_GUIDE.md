# 零基础操作指南

> 写给第一次做网站开发的你。本文档告诉你怎么修改内容、怎么更新数据库、怎么部署上线。
>
> 最后更新：2026-06-06 | 当前进度：P2 已完成，准备进入 P3.1

---

## 目录

1. [环境准备](#1-环境准备)
2. [日常开发流程](#2-日常开发流程)
3. [修改网站内容](#3-修改网站内容)
4. [更新数据库数据](#4-更新数据库数据)
5. [Git 提交与推送](#5-git-提交与推送)
6. [部署到 Vercel](#6-部署到-vercel)
7. [常见问题与排错](#7-常见问题与排错)

---

## 1. 环境准备

### 首次使用（只需做一次）

```bash
# 1. 安装项目依赖
pnpm install

# 2. 确认 .env.local 文件存在且包含数据库地址
#    文件已在项目中，内容类似：
#    DATABASE_URL="postgresql://postgres.xxx:密码@xxx.pooler.supabase.com:6543/postgres"
#    ⚠️ 这个文件包含密码，绝对不要提交到 Git

# 3. 生成 Prisma 客户端
npx prisma generate

# 4. 安装 Vercel CLI（部署用）
npm i -g vercel
```

### 项目关键信息

| 项目 | 信息 |
|------|------|
| GitHub 仓库 | `git@github.com:0Jmins0/ChiLam-Spaceport.git` |
| 数据库 | Supabase PostgreSQL (ap-northeast-2) |
| 部署平台 | Vercel (`chi-lam-spaceport`) |
| 线上地址 | https://chilam-spaceport.vercel.app |
| 包管理器 | pnpm |
| 开发地址 | http://localhost:3000 |

---

## 2. 日常开发流程

每次打开项目写代码，按这个顺序来：

```bash
# 1. 启动开发服务器
pnpm dev
# 浏览器打开 http://localhost:3000 看效果
# 改代码后页面自动刷新，Ctrl+C 停止

# 2. 写完代码后检查
pnpm lint          # 检查语法错误
pnpm format        # 格式化代码

# 3. 确认没问题后提交
git add 文件名
git commit -m "feat: 描述你做了什么"
git push
```

---

## 3. 修改网站内容

### 改全站配色/视觉风格

编辑 `src/app/globals.css` 中的 `@theme inline` 区块：

```css
@theme inline {
  --color-bg-dark: #1a1a2e;   /* 主背景色 */
  --color-accent: #c49b63;    /* 琥珀金强调色 */
}
```

### 改导航栏栏目

编辑 `src/config/navigation.ts`：

```typescript
export const NAV_ITEMS = [
  { label: '动态', labelEn: 'Updates', href: '/updates' },
  // 增删改条目即可
];
```

### 改站点信息（名称、社交链接等）

编辑 `src/config/site.ts`

### 改某个页面

页面文件在 `src/app/` 下，文件夹名就是网址：

| 页面 | 文件位置 |
|------|----------|
| 首页 | `src/app/page.tsx` |
| 动态 | `src/app/updates/page.tsx` |
| 影视 | `src/app/screens/page.tsx` |
| 演出 | `src/app/performances/page.tsx` |
| 活动 | `src/app/activities/page.tsx` |
| 资料库 | `src/app/archives/page.tsx` |
| 留言板 | `src/app/messages/page.tsx` |
| 公告 | `src/app/announcements/page.tsx` |

### 改组件样式

组件在 `src/components/` 下，分三类：
- `layout/` — 布局（Header, Footer, MobileNav）
- `ui/` — 通用 UI（Button, Card, Tag, Pagination 等）
- `decorative/` — 装饰（FilmGrain, YearMarquee）

---

## 4. 更新数据库数据

### 方式一：通过 Prisma Studio（可视化界面，适合少量修改）

```bash
npx prisma studio
# 浏览器自动打开 http://localhost:5555
# 可以直接在界面上查看、新增、编辑、删除数据
```

### 方式二：通过种子数据脚本（适合批量导入）

1. 编辑 `prisma/seed.ts`，在对应的数据数组中添加新条目
2. 运行：

```bash
npx prisma db seed
```

> ⚠️ seed 脚本会先清空再重新导入，适合初始化。如果只想添加数据不想清空，用 Prisma Studio 或 API。

### 方式三：通过 API（适合程序化操作）

```bash
# 添加影视作品
curl -X POST http://localhost:3000/api/screens \
  -H "Content-Type: application/json" \
  -d '{"title": "作品名", "type": "MOVIE", ...}'

# 添加演出
curl -X POST http://localhost:3000/api/performances \
  -H "Content-Type: application/json" \
  -d '{"title": "演出名", "type": "CONCERT", ...}'

# 添加动态
curl -X POST http://localhost:3000/api/updates/social \
  -H "Content-Type: application/json" \
  -d '{"platform": "WEIBO", "content": "内容", ...}'
```

已有的 API 路由：

| API | 方法 | 说明 |
|-----|------|------|
| `/api/updates/social` | GET/POST | 社交帖列表/创建 |
| `/api/updates/news` | GET/POST | 新闻列表/创建 |
| `/api/updates/sightings` | GET/POST | 路透列表/创建 |
| `/api/updates/[id]` | GET/PUT/DELETE | 动态详情/更新/删除 |
| `/api/screens` | GET/POST | 影视列表/创建 |
| `/api/screens/[slug]` | GET/PUT/DELETE | 影视详情/更新/删除 |
| `/api/performances` | GET/POST | 演出列表/创建 |
| `/api/performances/[slug]` | GET/PUT/DELETE | 演出详情/更新/删除 |

### 修改数据库表结构

如果需要改表结构（加字段、改字段等）：

```bash
# 1. 编辑 prisma/schema.prisma
# 2. 运行迁移
npx prisma migrate dev --name 描述改了什么
# 3. 重新生成客户端
npx prisma generate
```

---

## 5. Git 提交与推送

### 日常提交

```bash
# 查看改了哪些文件
git status

# 查看具体改动内容
git diff

# 添加文件到暂存区
git add src/app/page.tsx          # 加单个文件
git add src/components/           # 加整个目录
git add .                         # 加所有改动

# 提交
git commit -m "feat: 新增活动列表页"

# 推送到 GitHub
git push
```

### 提交信息格式

```
feat: 新增XX功能
fix: 修复XX问题
style: 调整XX样式
docs: 更新XX文档
db: 数据库迁移 - XX
refactor: 重构XX
chore: 更新依赖
```

### 提交节奏

| 做完这些事 | 提交吗？ |
|-----------|---------|
| 完成一个页面/组件 | 是 |
| 完成一个 API | 是 |
| 修复一个 bug | 是 |
| 数据库迁移 | 是（含 migrations 文件夹） |
| 还在调试、没写完 | 否 |

### 查看历史

```bash
git log --oneline          # 查看提交历史
git log --oneline 文件名   # 查看某个文件的历史
```

---

## 6. 部署到 Vercel

### 已完成的配置

Vercel 项目已关联，环境变量已配好。以下命令供参考（不需要再做）：

```bash
npm i -g vercel          # 安装 CLI
vercel login             # 登录
vercel link              # 关联项目
vercel env add DATABASE_URL   # 配置环境变量
```

### 日常部署

有两种方式：

**方式一：自动部署（推荐）**

关联 GitHub 仓库后，每次 `git push` Vercel 会自动部署：

```bash
git add .
git commit -m "feat: 新功能"
git push                    # 推送后 Vercel 自动构建部署
```

**方式二：手动部署**

```bash
vercel              # 部署到预览环境（生成临时链接，可先检查效果）
vercel --prod       # 部署到生产环境
```

### 查看部署状态

```bash
vercel ls           # 查看最近的部署列表
vercel logs         # 查看部署日志
```

或直接访问 https://vercel.com 面板查看。

### 拉取线上环境变量到本地

```bash
vercel env pull .env.local
```

---

## 7. 常见问题与排错

### 启动失败

```bash
# 缺少依赖
pnpm install

# 数据库连接失败 → 检查 .env.local 中的 DATABASE_URL
# Prisma 类型报错 → 重新生成客户端
npx prisma generate
```

### 数据库问题

```bash
# 改了 schema 但代码里没新类型
npx prisma generate

# 数据库和 schema 不同步
npx prisma migrate dev --name describe-change

# 想重置数据库（删除所有数据重来）
npx prisma migrate reset
# ⚠️ 会删除所有数据！
```

### 部署失败

```bash
# 先在本地确认能构建成功
pnpm build

# 常见原因：
# 1. 环境变量没配 → vercel env add DATABASE_URL
# 2. 类型错误 → pnpm lint 检查
# 3. Prisma 未生成 → build 脚本已包含 prisma generate，正常不会有问题
```

### Git 问题

```bash
# 不小心改坏了文件
git checkout -- 文件名     # 恢复单个文件
git stash                  # 暂存所有未提交的改动

# 想看某个文件之前的版本
git show 提交ID:文件名
```

### 打开浏览器开发者工具看错误

- Mac: `Cmd + Option + I`
- Windows: `F12`
- 看 Console（控制台）里的红色错误信息

---

> 有任何疑问，直接问 Claude。它读过所有项目文档，了解你的项目结构和设计。
