# 开发计划

## 阶段总览

| 阶段 | 内容 | 状态 |
|------|------|------|
| P0 - 项目初始化 | 技术栈搭建、数据库设计、项目骨架 | ✅ 已完成 |
| P1 - 核心页面 | 首页 + 动态模块（最核心的内容展示） | ✅ 已完成 |
| P2 - 作品模块 | 影视 + 演出（作品信息与关联内容） | ✅ 已完成 |
| P3 - 活动与资料 | 活动 + 资料库（代言、访谈、杂志、专辑） | ✅ 已完成 |
| P4 - 互动与管理 | 留言板 + 公告 + 后台管理系统 | ✅ 已完成 |
| P5 - 优化上线 | SEO、性能优化、域名部署、上线 | 待开始 |

---

## P0 - 项目初始化 (详细)

### P0.1 技术环境搭建 ✅ (2026-06-02)
- [x] 初始化 Next.js 16 项目 (App Router + TypeScript + Tailwind CSS v4)
- [x] 配置 pnpm、ESLint、Prettier
- [x] 配置 Prisma + PostgreSQL 连接 (已初始化，Schema 待设计)
- [x] 创建 Git 仓库、.gitignore
- [x] 配置环境变量 (.env.local)

### P0.2 数据库设计 ✅ (2026-06-05)
- [x] 设计核心数据表 Schema (Prisma) — 基于 Database_Design_v1.md
  - 10 个枚举 + 20 张表，详见 `prisma/schema.prisma`
  - `Category` 栏目树、`Tag` 全站标签、`Media` 统一媒体
  - `Production` 影视、`Performance` 演出、`PerformanceMedia` 官摄、`FanShot` 饭拍
  - `Endorsement` 代言、`Interview` 访谈、`Album` 专辑、`Magazine` 杂志
  - `SocialPost` 社交媒体、`NewsArticle` 新闻、`Sighting` 路透
  - `TimelineEvent` 时间线、`Guestbook` 留言、`Comment` 评论
  - `Announcement` 公告、`Admin` 管理员
  - `ContentRelation` 跨内容关联（多态）
- [x] 配置 Supabase 连接 (Session pooler, ap-northeast-2)
- [x] 创建数据库迁移文件 `20260605164411_init` (20 张表已同步)
- [x] 生成 Prisma Client
- [ ] 编写 Seed 数据 (测试用)

### P0.3 项目骨架 ✅ (2026-06-06)
- [x] 创建基础布局 (Header/Footer/Navigation)
- [x] 创建各栏目空页面路由
- [x] 设计全局样式 (颜色、字体、间距)
- [x] 创建通用组件 (Card、Tag、ImageGallery、Timeline)

### P0.4 基础服务配置
- [x] 注册 Supabase 项目 (已配置, ap-northeast-2)
- [x] 配置 Cloudflare R2 (Bucket: chilam-media, r2.dev 公开访问, AWS SDK v3)
- [ ] 配置 Vercel 部署 (https://chilam-spaceport.vercel.app/)

---

## P1 - 核心页面 ✅ (2026-06-06)

### P1.1 首页 ✅
- [x] 重要节点时间线组件 (最新动态在最上方)
- [x] 大图展示区（保持 Hero 区域）
- [x] 一句话展示（tagline 显示）
- [x] 时间线节点点击跳转到关联内容

### P1.2 动态模块 ✅
- [x] 动态列表页 (`/updates`)
  - 分类筛选 (社交媒体/新闻/路透)
  - 瀑布流/信息流布局
- [x] 社交媒体子页
  - 标签筛选 (微博/小红书/抖音/Instagram/Facebook)
  - 卡片预览 + 链接跳转原文
- [x] 新闻报道子页
- [x] 路透子页
  - 标签筛选 (机场/片场/偶遇)
- [x] 动态详情页（三种类型各自独立路由）

### P1.3 API 开发 (动态模块) ✅
- [x] CRUD API: 动态的增删改查
- [x] 分页、筛选、搜索接口
- [x] 图片上传接口 (对接 R2) — POST /api/upload + /api/upload/presign

### P1 补充完成项（P0 遗留 + P1 新增）
- [x] Prisma Client 配置 (db.ts 单例 + adapter-pg)
- [x] 种子数据脚本 (seed.ts: 8 标签 + 30 社交帖 + 15 新闻 + 10 路透 + 20 时间线事件)
- [x] 数据查询层 (types.ts + queries/timeline.ts + queries/updates.ts)
- [x] next/image 外部图片域配置

---

## P2 - 作品模块 (框架)

### P2.1 影视 ✅ (2026-06-06)
- [x] 影视列表页 (`/screens`) - 电影/电视剧/综艺分类
- [x] 作品详情页 (作品信息 + 播放平台 + 相关资讯链接)
- [x] 标签: 粤语/普通话
- [x] 综艺特殊标签: 内地/香港/台湾/常驻/飞行

### P2.2 演出 ✅ (2026-06-06)
- [x] 演出列表页 (`/performances`) - 演唱会/舞台/音乐剧分类
- [x] 演唱会详情页 (官摄/饭拍分区)
- [x] 演唱会系列: 我是外星人/Crazy Hour/Miniconcert/在
- [x] 舞台标签: 演唱会嘉宾/其他

---

## P3 - 活动与资料 (框架)

### P3.1 活动 ✅ (2026-06-07)
- [x] 活动列表页 (`/activities`) - 代言/访谈分类
- [x] 代言详情页 (`/activities/endorsements/[slug]`)
- [x] 访谈详情页 (`/activities/interviews/[slug]`) - 视频/音频/文字统一格式
- [x] 访谈标签: 图文/音频/视频/直播
- [x] 访谈文本整理: 粤语原文 + 国语翻译展示
- [x] CRUD API: 代言 + 访谈
- [x] 种子数据: 15 条代言 + 8 条访谈

### P3.2 资料库 ✅ (2026-06-07)
- [x] 资料列表页 (`/archives`) - 专辑/杂志分类
- [x] 专辑详情页 (`/archives/albums/[slug]`) - 封面 + 曲目列表 + 流媒体链接
- [x] 杂志详情页 (`/archives/magazines/[slug]`) - 封面 + 内页图片浏览
- [x] CRUD API: 专辑 + 杂志
- [x] 种子数据: 20 张专辑 + 10 本杂志

---

## P4 - 互动与管理 ✅ (2026-06-07)

### P4.1 留言板 ✅
- [x] 留言板页面 (`/messages`) — 三 Tab: 我想对你说/故事分享/建议反馈
- [x] 留言详情页 (`/messages/[id]`) — 完整内容 + 评论区
- [x] 留言提交表单（无需登录，填昵称即可，提交后待审核）
- [x] 点赞功能（localStorage 防重复）
- [x] 收藏功能（纯前端 localStorage）
- [x] 评论功能（多态 Comment 表，昵称+内容≤300字）
- [x] CRUD API + 点赞 API + 评论 API
- [x] 种子数据: 13 条留言 + 5 条评论

### P4.2 公告 ✅
- [x] 公告列表页 (`/announcements`) — 三分类: 网站公告/规则说明/更新通知
- [x] 公告详情页 (`/announcements/[id]`)
- [x] 置顶功能（isPinned 优先排序）
- [x] CRUD API
- [x] 种子数据: 8 条公告（含 2 条置顶）

### P4.3 后台管理（API 层）✅
- [x] 管理员登录 API（bcryptjs + jose JWT）
- [x] 留言审核 API（批量/单条 approve/reject）
- [x] 管理员种子账号
- [ ] 后台管理 UI（推迟到 P5）
- [ ] 媒体资源管理（推迟到 P5）

---

## P5 - 数据填充与优化上线

> P5 分两大块：先填充真实数据（P5.1），再优化部署上线（P5.2）

### P5.1 数据爬取与填充

#### P5.1.1 影视作品（优先级最高，结构化数据）
- [ ] 爬取数据源：豆瓣/维基百科/IMDb
- [ ] 目标数据：电视剧 ~60 部、电影 ~30 部、综艺 ~20 部
- [ ] 字段：标题、年份、类型、角色、导演、简介、海报URL、播放平台链接
- [ ] 脚本：`scripts/crawlers/productions.ts`
- [ ] 产出：JSON → 通过 `/api/screens` POST 入库
- [ ] 海报图片：下载后通过 `/api/upload` 上传到 R2

#### P5.1.2 专辑数据
- [ ] 爬取数据源：QQ音乐/网易云音乐/Apple Music
- [ ] 目标数据：~30 张专辑 + 每张的曲目列表
- [ ] 字段：专辑名、发行日期、语言、曲目列表、封面URL、流媒体链接
- [ ] 脚本：`scripts/crawlers/albums.ts`
- [ ] 产出：JSON → 通过 `/api/archives/albums` POST 入库
- [ ] 封面图片：下载后上传到 R2

#### P5.1.3 演出数据
- [ ] 数据源：维基百科/粉丝站/人工整理
- [ ] 目标数据：演唱会 ~30 场、舞台/音乐剧 ~20 场
- [ ] 字段：标题、类型、日期、场馆、城市、歌单、海报URL
- [ ] 方式：以人工整理为主（数据量不大，且信息分散）
- [ ] 脚本：`scripts/import/performances.ts`（JSON 导入脚本）

#### P5.1.4 社交媒体动态
- [ ] 数据源：微博（主阵地）、小红书、Instagram
- [ ] 目标数据：近 2-3 年精选帖文 ~200 条
- [ ] 字段：平台、发布时间、文字内容、图片URL列表、原文链接
- [ ] 脚本：`scripts/crawlers/social.ts`
- [ ] 图片处理：下载图片 → 上传 R2 → 替换 URL
- [ ] 后续：可设置定期同步机制

#### P5.1.5 代言与访谈
- [ ] 数据源：品牌官方/媒体报道/人工整理
- [ ] 目标数据：代言 ~20 条、访谈 ~15 条
- [ ] 方式：人工整理 JSON → 批量导入
- [ ] 脚本：`scripts/import/activities.ts`

#### P5.1.6 杂志资料
- [ ] 数据源：实物扫描 + 网络收集
- [ ] 目标数据：~20 本杂志封面 + 信息
- [ ] 方式：人工录入 + 封面图片上传 R2
- [ ] 脚本：`scripts/import/magazines.ts`

#### P5.1.7 时间线事件
- [ ] 数据源：百科/年表/粉丝整理
- [ ] 目标数据：~80-100 个人生关键节点
- [ ] 字段：日期、标题、描述、关联内容类型+ID
- [ ] 方式：人工整理 JSON → 批量导入
- [ ] 脚本：`scripts/import/timeline.ts`

#### P5.1.8 新闻报道
- [ ] 数据源：各媒体网站
- [ ] 目标数据：精选报道 ~50 条
- [ ] 方式：人工录入为主，按需添加

#### 爬虫基础设施
- [ ] 创建 `scripts/` 目录结构
- [ ] 通用爬虫工具：HTTP 请求、HTML 解析、频率控制
- [ ] 通用导入工具：JSON 读取 → API 调用 → 结果报告
- [ ] 图片处理流程：下载 → 上传 R2 → 获取公开 URL → 写入数据库
- [ ] 数据校验：导入前校验必填字段、去重检查

#### scripts 目录规划
```
scripts/
├── crawlers/              # 爬虫脚本（从网站抓取数据）
│   ├── productions.ts     # 影视作品爬虫
│   ├── albums.ts          # 专辑爬虫
│   └── social.ts          # 社交媒体爬虫
├── import/                # 导入脚本（从 JSON 文件导入）
│   ├── performances.ts    # 演出导入
│   ├── activities.ts      # 代言/访谈导入
│   ├── magazines.ts       # 杂志导入
│   └── timeline.ts        # 时间线导入
├── utils/                 # 通用工具
│   ├── http.ts            # HTTP 请求封装（频率控制）
│   ├── parser.ts          # HTML 解析工具
│   ├── uploader.ts        # R2 图片上传工具
│   └── importer.ts        # API 批量导入工具
└── data/                  # 人工整理的 JSON 数据文件
    ├── performances.json
    ├── endorsements.json
    ├── interviews.json
    ├── magazines.json
    └── timeline.json
```

### P5.2 优化与部署

#### P5.2.1 SEO 优化
- [ ] 各页面 metadata（title, description, og:image）
- [ ] sitemap.xml 自动生成
- [ ] robots.txt 配置
- [ ] JSON-LD 结构化数据（Person, Movie, MusicAlbum 等）

#### P5.2.2 性能优化
- [ ] 图片懒加载 + next/image 优化
- [ ] 关键 CSS 内联
- [ ] 字体加载优化（display: swap）
- [ ] 列表页分页性能

#### P5.2.3 响应式与体验
- [ ] 移动端布局适配检查
- [ ] 触控交互优化
- [ ] 加载状态与骨架屏完善

#### P5.2.4 部署上线
- [ ] 配置 Vercel 项目
- [ ] 环境变量同步（DATABASE_URL, R2 密钥, JWT 密钥）
- [ ] 域名绑定与 SSL
- [ ] R2 自定义域名绑定（media.域名.com）
- [ ] 上线测试与验收

---

## 设计决策记录

### 为什么选 Next.js?
- SSR/SSG 支持好，SEO 友好 (粉丝网站需要搜索引擎收录)
- API Routes 可以前后端一体，减少部署复杂度
- App Router 提供更好的布局嵌套能力

### 渲染策略：全站动态渲染 (SSR)
- 所有数据库驱动的列表页均使用 `export const dynamic = 'force-dynamic'`
- 原因：内容管理型网站，后台随时增删数据，动态渲染确保数据实时生效
- 详情页（`[slug]`）Next.js 自动识别为动态路由，无需额外配置
- 静态页面（404、空占位页）保持 SSG 预渲染
- 涉及页面：首页、动态、影视综、演出、活动、资料库（共 6 个列表页）
- 性能保障：Vercel Fluid Compute + Supabase Session pooler，响应 < 200ms

### 为什么用标签系统而非硬分类?
- 内容之间有大量交叉关联 (一条新闻可能关联某部电影、某个活动)
- 关键词标签可以实现灵活的 "相关内容" 推荐
- 未来可以扩展为更智能的内容关联

### 内容存储策略
- 文本内容存数据库
- 图片/视频存 R2，数据库只存 URL
- 社交媒体内容直接搬运文本+图片 (不做 embed)

### 为什么选全站深色主题？
- 基于参考图确立"时光电影感"(Cinematic Timeless) 设计调性
- 深靛蓝 #1A1A2E 替代纯黑，更有舞台感和胶片质感
- 琥珀金 #C49B63 作为唯一强调色，奢华但不刺眼
- 胶片颗粒噪声 + 超细金线 + 毛玻璃效果，三层视觉质感叠加
- 字体系统：宋体（情感标题）+ 黑体（正文）+ Garamond Italic（年份装饰）

### 组件架构设计
- 配置驱动：导航项(navigation.ts)、站点信息(site.ts) 集中管理，一处修改全站生效
- 设计令牌：所有颜色/字体/间距定义在 globals.css 的 @theme inline 中
- 组件分层：layout（布局）/ ui（通用）/ decorative（装饰），职责清晰
