# 零基础操作指南

> 写给第一次做网站开发的你。本文档告诉你怎么修改内容、怎么管理留言、怎么导入数据、怎么部署上线。
>
> 最后更新：2026-06-07 | 当前进度：P4 已完成，准备进入 P5

---

## 目录

1. [环境准备](#1-环境准备)
2. [日常开发流程](#2-日常开发流程)
3. [修改网站内容](#3-修改网站内容)
4. [更新数据库数据](#4-更新数据库数据)
5. [留言管理教程](#5-留言管理教程)
6. [公告管理教程](#6-公告管理教程)
7. [文件上传与图片管理](#7-文件上传与图片管理)
8. [爬取数据的导入流程](#8-爬取数据的导入流程)
9. [Git 提交与推送](#9-git-提交与推送)
10. [部署到 Vercel](#10-部署到-vercel)
11. [常见问题与排错](#11-常见问题与排错)

---

## 1. 环境准备

### 首次使用（只需做一次）

```bash
# 1. 安装项目依赖
pnpm install

# 2. 确认 .env.local 文件存在且包含以下变量：
#    DATABASE_URL="postgresql://..."       数据库地址
#    R2_ACCOUNT_ID="..."                   R2 存储账号ID
#    R2_ACCESS_KEY_ID="..."                R2 访问密钥
#    R2_SECRET_ACCESS_KEY="..."            R2 机密密钥
#    R2_BUCKET_NAME="chilam-media"         R2 存储桶名
#    R2_PUBLIC_URL="https://pub-xxx.r2.dev" R2 公开访问地址
#    ADMIN_JWT_SECRET="..."                管理员密钥
#    ⚠️ 这个文件包含密码，绝对不要提交到 Git

# 3. 生成 Prisma 客户端
npx prisma generate
```

### 项目关键信息

| 项目 | 信息 |
|------|------|
| GitHub 仓库 | `git@github.com:0Jmins0/ChiLam-Spaceport.git` |
| 数据库 | Supabase PostgreSQL (ap-northeast-2) |
| 文件存储 | Cloudflare R2 (chilam-media) |
| 部署平台 | Vercel |
| 包管理器 | pnpm |
| 本地开发地址 | http://localhost:3000 |

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

组件在 `src/components/` 下，分类：
- `layout/` — 布局（Header, Footer, MobileNav）
- `ui/` — 通用 UI（Button, Card, Tag, Pagination 等）
- `updates/` — 动态相关组件
- `screens/` — 影视相关组件
- `performances/` — 演出相关组件
- `activities/` — 活动相关组件
- `archives/` — 资料库相关组件
- `guestbook/` — 留言板相关组件
- `announcements/` — 公告相关组件
- `decorative/` — 装饰（FilmGrain, YearMarquee）

---

## 4. 更新数据库数据

### 方式一：通过 Prisma Studio（可视化界面，适合少量修改）

```bash
npx prisma studio
# 浏览器自动打开 http://localhost:5555
# 可以直接在界面上查看、新增、编辑、删除数据
```

### 方式二：通过种子数据脚本（适合重置/初始化）

```bash
npx prisma db seed
```

> ⚠️ seed 脚本会先清空再重新导入，**只适合初始化**。日常添加数据用 API 或 Prisma Studio。

### 方式三：通过 API（适合程序化操作、批量导入）

所有内容模块都有完整的 CRUD API，下面分模块详细说明。

#### API 总览

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
| `/api/activities/endorsements` | GET/POST | 代言列表/创建 |
| `/api/activities/endorsements/[slug]` | GET/PUT/DELETE | 代言详情/更新/删除 |
| `/api/activities/interviews` | GET/POST | 访谈列表/创建 |
| `/api/activities/interviews/[slug]` | GET/PUT/DELETE | 访谈详情/更新/删除 |
| `/api/archives/albums` | GET/POST | 专辑列表/创建 |
| `/api/archives/albums/[slug]` | GET/PUT/DELETE | 专辑详情/更新/删除 |
| `/api/archives/magazines` | GET/POST | 杂志列表/创建 |
| `/api/archives/magazines/[slug]` | GET/PUT/DELETE | 杂志详情/更新/删除 |
| `/api/messages` | GET/POST | 留言列表/提交留言 |
| `/api/messages/[id]` | GET/PUT/DELETE | 留言详情/更新/删除 |
| `/api/messages/[id]/like` | POST | 点赞 |
| `/api/messages/[id]/comments` | GET/POST | 评论列表/发评论 |
| `/api/announcements` | GET/POST | 公告列表/创建 |
| `/api/announcements/[id]` | GET/PUT/DELETE | 公告详情/更新/删除 |
| `/api/upload` | POST | 上传文件到 R2 |
| `/api/upload/presign` | POST | 获取预签名上传链接 |

#### 数据操作示例

```bash
# 添加一部电影
curl -X POST http://localhost:3000/api/screens \
  -H "Content-Type: application/json" \
  -d '{
    "title": "冲上云霄",
    "titleEn": "Triumph in the Skies",
    "type": "TV_SERIES",
    "year": 2003,
    "role": "唐亦琛（Sam）",
    "synopsis": "一个关于飞机师的故事...",
    "posterUrl": "https://pub-xxx.r2.dev/images/xxx.jpg"
  }'

# 查询所有电影（分页）
curl "http://localhost:3000/api/screens?type=MOVIE&page=1&pageSize=10"

# 更新一部作品
curl -X PUT http://localhost:3000/api/screens/chong-shang-yun-xiao \
  -H "Content-Type: application/json" \
  -d '{"synopsis": "更新后的简介..."}'

# 删除一部作品
curl -X DELETE http://localhost:3000/api/screens/chong-shang-yun-xiao
```

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

## 5. 留言管理教程

网站的留言板（`/messages`）允许访客匿名留言，所有留言**提交后需要管理员审核**才会显示。

### 留言流程

```
访客填写昵称+内容 → 提交到数据库（状态: PENDING）
      → 管理员审核 → APPROVED（显示）/ REJECTED（隐藏）
```

### 第一步：管理员登录获取 Token

```bash
# 登录（测试账号）
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@chilamishere.com","password":"admin123456"}'

# 返回类似：
# {"token":"eyJhbGciOiJIUzI1NiIs..."}
# 复制这个 token，后面每个管理操作都要带上
```

> 💡 Token 有效期 24 小时，过期后需要重新登录。

### 第二步：查看待审核留言

```bash
curl http://localhost:3000/api/admin/messages \
  -H "Authorization: Bearer 你的token"

# 返回待审核留言列表，每条留言有 id、nickname、content、tab 等信息
```

### 第三步：审核留言

**批量审核（推荐）：**

```bash
# 批量通过
curl -X PUT http://localhost:3000/api/admin/messages \
  -H "Authorization: Bearer 你的token" \
  -H "Content-Type: application/json" \
  -d '{"ids":["留言ID1","留言ID2","留言ID3"],"action":"approve"}'

# 批量拒绝
curl -X PUT http://localhost:3000/api/admin/messages \
  -H "Authorization: Bearer 你的token" \
  -H "Content-Type: application/json" \
  -d '{"ids":["留言ID1"],"action":"reject"}'
```

**单条审核：**

```bash
# 通过单条留言
curl -X PUT http://localhost:3000/api/admin/messages/留言ID \
  -H "Authorization: Bearer 你的token" \
  -H "Content-Type: application/json" \
  -d '{"action":"approve"}'

# 拒绝单条留言
curl -X PUT http://localhost:3000/api/admin/messages/留言ID \
  -H "Authorization: Bearer 你的token" \
  -H "Content-Type: application/json" \
  -d '{"action":"reject"}'
```

### 第四步：删除不当留言

```bash
curl -X DELETE http://localhost:3000/api/admin/messages/留言ID \
  -H "Authorization: Bearer 你的token"
```

### 留言分类说明

| Tab 值 | 含义 | 说明 |
|--------|------|------|
| MESSAGE | 我想对你说 | 粉丝想对智霖说的话 |
| STORY | 故事分享 | 与智霖相关的个人故事 |
| FEEDBACK | 建议反馈 | 对网站的建议 |

### 管理评论

留言下面的评论也可以管理：

```bash
# 查看某条留言的所有评论
curl http://localhost:3000/api/messages/留言ID/comments

# 删除不当评论（直接通过留言管理 API）
curl -X DELETE http://localhost:3000/api/messages/留言ID \
  -H "Authorization: Bearer 你的token"
```

---

## 6. 公告管理教程

公告是管理员发布的网站通知，直接通过 API 创建即可（无需审核流程）。

### 创建公告

```bash
curl -X POST http://localhost:3000/api/announcements \
  -H "Content-Type: application/json" \
  -d '{
    "title": "网站正式上线通知",
    "content": "欢迎来到 Chilam Is Here！这是一个集合张智霖各平台资讯的综合性网站...",
    "type": "SITE_NOTICE",
    "isPinned": true
  }'
```

### 公告类型

| type 值 | 含义 |
|---------|------|
| SITE_NOTICE | 网站公告 |
| RULE | 规则说明 |
| UPDATE_NOTICE | 更新通知 |

### 置顶公告

创建时设 `"isPinned": true`，该公告会在列表页顶部显示。

### 更新公告

```bash
curl -X PUT http://localhost:3000/api/announcements/公告ID \
  -H "Content-Type: application/json" \
  -d '{"content": "更新后的内容...", "isPinned": false}'
```

### 删除公告

```bash
curl -X DELETE http://localhost:3000/api/announcements/公告ID
```

---

## 7. 文件上传与图片管理

所有图片/视频/文件都存储在 Cloudflare R2（云存储），数据库只保存文件的访问 URL。

### 上传方式一：服务端上传（推荐，适合图片等小文件）

```bash
# 上传一张图片
curl -X POST http://localhost:3000/api/upload \
  -F "file=@/path/to/photo.jpg"

# 返回：
# {
#   "success": true,
#   "key": "images/1717750000-abc123.jpg",
#   "url": "https://pub-xxx.r2.dev/images/1717750000-abc123.jpg"
# }
#
# 把返回的 url 填入数据库对应字段（如 posterUrl、coverUrl 等）
```

### 上传方式二：预签名上传（适合视频等大文件）

```bash
# 第一步：获取预签名上传链接
curl -X POST http://localhost:3000/api/upload/presign \
  -H "Content-Type: application/json" \
  -d '{"filename": "concert.mp4", "mimeType": "video/mp4", "fileSize": 52428800}'

# 返回：
# {
#   "success": true,
#   "key": "videos/1717750000-xyz789.mp4",
#   "uploadUrl": "https://xxx.r2.cloudflarestorage.com/...(预签名URL)",
#   "publicUrl": "https://pub-xxx.r2.dev/videos/1717750000-xyz789.mp4"
# }

# 第二步：用预签名 URL 直接上传文件到 R2
curl -X PUT "上面返回的uploadUrl" \
  -H "Content-Type: video/mp4" \
  --data-binary @/path/to/concert.mp4
```

### 支持的文件类型和大小限制

| 类型 | 允许的格式 | 最大大小 |
|------|-----------|---------|
| 图片 | JPEG, PNG, WebP, GIF, AVIF | 10 MB |
| 视频 | MP4, WebM, QuickTime | 100 MB |
| 音频 | MP3, WAV, OGG, AAC | 50 MB |
| 文件 | PDF | 20 MB |

### R2 文件夹结构

文件会自动按类型分文件夹存放：

```
chilam-media/          （R2 Bucket）
├── images/            ← 图片自动放这里
├── videos/            ← 视频自动放这里
├── audio/             ← 音频自动放这里
└── files/             ← PDF等文件放这里
```

### 完整示例：上传海报并创建影视作品

```bash
# 1. 先上传海报图片
curl -X POST http://localhost:3000/api/upload \
  -F "file=@poster.jpg"
# 记下返回的 url，例如: https://pub-xxx.r2.dev/images/1717750000-abc123.jpg

# 2. 用返回的 URL 创建影视作品
curl -X POST http://localhost:3000/api/screens \
  -H "Content-Type: application/json" \
  -d '{
    "title": "冲上云霄",
    "type": "TV_SERIES",
    "year": 2003,
    "posterUrl": "https://pub-xxx.r2.dev/images/1717750000-abc123.jpg",
    "role": "唐亦琛"
  }'
```

---

## 8. 爬取数据的导入流程

当你通过爬虫或人工收集了大量数据后，按以下流程导入到网站：

### 整体流程

```
收集数据 → 整理成 JSON → 处理图片（上传 R2）→ 调用 API 入库 → 网站自动显示
```

### 第一步：准备 JSON 数据文件

将数据整理成 JSON 格式，保存在 `scripts/data/` 目录下。

**示例：影视作品数据** (`scripts/data/productions.json`)

```json
[
  {
    "title": "冲上云霄",
    "titleEn": "Triumph in the Skies",
    "type": "TV_SERIES",
    "year": 2003,
    "role": "唐亦琛（Sam）",
    "director": "潘嘉德",
    "synopsis": "唐亦琛是一名民航机机长...",
    "posterLocal": "./posters/triumph-in-the-skies.jpg",
    "platforms": ["TVB", "YouTube"]
  },
  {
    "title": "陀枪师姐III",
    "type": "TV_SERIES",
    "year": 2001,
    "role": "程峰",
    "posterLocal": "./posters/armed-reaction-3.jpg"
  }
]
```

**示例：专辑数据** (`scripts/data/albums.json`)

```json
[
  {
    "title": "I Am Chilam",
    "releaseDate": "2008-12-05",
    "language": "CANTONESE",
    "trackList": ["岁月如歌", "你太善良", "天梯", "..."],
    "coverLocal": "./covers/i-am-chilam.jpg",
    "streamingLinks": {
      "qqMusic": "https://...",
      "appleMusic": "https://..."
    }
  }
]
```

### 第二步：处理图片

对于 JSON 中包含本地图片路径（如 `posterLocal`）的数据：

```bash
# 上传单张图片
curl -X POST http://localhost:3000/api/upload -F "file=@scripts/data/posters/triumph.jpg"
# 记下返回的 url

# 批量上传（用 shell 循环）
for img in scripts/data/posters/*.jpg; do
  echo "上传: $img"
  curl -s -X POST http://localhost:3000/api/upload -F "file=@$img"
  echo ""
done
```

### 第三步：调用 API 入库

将图片 URL 替换到数据中，然后调用对应的 API：

```bash
# 单条导入
curl -X POST http://localhost:3000/api/screens \
  -H "Content-Type: application/json" \
  -d '{
    "title": "冲上云霄",
    "type": "TV_SERIES",
    "year": 2003,
    "posterUrl": "https://pub-xxx.r2.dev/images/1717750000-abc123.jpg"
  }'

# 批量导入（用 jq + shell 循环，从 JSON 文件逐条导入）
cat scripts/data/productions.json | jq -c '.[]' | while read item; do
  curl -s -X POST http://localhost:3000/api/screens \
    -H "Content-Type: application/json" \
    -d "$item"
  sleep 0.5    # 间隔 0.5 秒，避免太快
done
```

### 第四步：验证

```bash
# 查看已导入的数据
curl http://localhost:3000/api/screens | jq '.total'

# 或者直接打开网站看
open http://localhost:3000/screens
```

### 各模块导入 API 对照表

| 数据类型 | 导入 API | 图片字段 |
|---------|---------|---------|
| 电视剧/电影/综艺 | POST `/api/screens` | posterUrl |
| 演出 | POST `/api/performances` | posterUrl |
| 代言 | POST `/api/activities/endorsements` | — |
| 访谈 | POST `/api/activities/interviews` | — |
| 专辑 | POST `/api/archives/albums` | coverUrl |
| 杂志 | POST `/api/archives/magazines` | coverUrl |
| 社交帖 | POST `/api/updates/social` | imageUrls |
| 新闻 | POST `/api/updates/news` | coverUrl |
| 路透 | POST `/api/updates/sightings` | imageUrls |

### 导入后数据如何显示

**不需要任何额外操作！** 数据通过 API 写入数据库后，网站页面会自动读取并显示：

- 网站使用**动态渲染 (SSR)**，每次访问页面都会从数据库读取最新数据
- 不需要重新部署、不需要刷新缓存
- 新数据立即出现在对应的列表页和详情页

```
导入一部电影到数据库
    ↓
访问 /screens 页面 → 自动显示在列表中
    ↓
点击进入 → 自动生成详情页 /screens/chong-shang-yun-xiao
```

---

## 9. Git 提交与推送

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

## 10. 部署到 Vercel

### 前提准备

```bash
npm i -g vercel          # 安装 CLI（只需一次）
vercel login             # 登录（只需一次）
vercel link              # 关联项目（只需一次）
```

### 配置环境变量

在 Vercel 上需要配置以下环境变量（在 Vercel 面板 → Settings → Environment Variables）：

| 变量名 | 说明 |
|--------|------|
| DATABASE_URL | Supabase 数据库地址 |
| R2_ACCOUNT_ID | Cloudflare R2 账号 ID |
| R2_ACCESS_KEY_ID | R2 访问密钥 ID |
| R2_SECRET_ACCESS_KEY | R2 机密密钥 |
| R2_BUCKET_NAME | R2 存储桶名（chilam-media） |
| R2_PUBLIC_URL | R2 公开访问地址 |
| ADMIN_JWT_SECRET | 管理员 JWT 密钥 |

或用 CLI 批量添加：

```bash
vercel env add DATABASE_URL
vercel env add R2_ACCOUNT_ID
# ... 逐个添加
```

### 日常部署

**方式一：自动部署（推荐）**

关联 GitHub 仓库后，每次 `git push` Vercel 会自动部署：

```bash
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

### 拉取线上环境变量到本地

```bash
vercel env pull .env.local
```

---

## 11. 常见问题与排错

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

### 上传文件失败

```bash
# 检查 .env.local 中 R2 相关变量是否都填了
# 检查文件类型是否在白名单中（图片、视频、音频、PDF）
# 检查文件大小是否超限（图片 10MB、视频 100MB）
# 检查 R2 Bucket 公开访问是否已启用
```

### 部署失败

```bash
# 先在本地确认能构建成功
pnpm build

# 常见原因：
# 1. 环境变量没配 → Vercel 面板检查
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
