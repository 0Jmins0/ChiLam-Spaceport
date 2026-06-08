# 开发进度记录

## 当前阶段: P5 前 - UI 调整与功能补充 (进行中)

---

## 进度总览

| 模块 | 状态 | 最后更新 |
|------|------|----------|
| 项目初始化 | ✅ 已完成 | 2026-06-06 |
| 数据库设计 | ✅ 已完成 | 2026-06-06 |
| 首页 | ✅ 已完成 | 2026-06-06 |
| 动态模块 | ✅ 已完成 | 2026-06-06 |
| 影视模块 | ✅ 已完成 | 2026-06-06 |
| 演出模块 | ✅ 已完成 | 2026-06-06 |
| 活动模块 | ✅ 已完成（含直播 tab） | 2026-06-08 |
| 资料库模块 | ✅ 已完成 | 2026-06-07 |
| 留言板 | ✅ 已完成（含故事 tag 筛选） | 2026-06-08 |
| 公告模块 | ✅ 已完成 | 2026-06-07 |
| 后台管理(API) | ✅ 已完成 | 2026-06-07 |
| R2 存储配置 | ✅ 已完成 | 2026-06-07 |
| 部署上线 | 未开始 | - |

---

## 详细记录

### 2026-06-08 - UI 调整阶段二（已完成，迁移待执行）

#### 修改 5：故事分享新增 tag 分类筛选
- GuestbookFilterBar 新增 `storyTagFilters` + `currentStoryTag` prop
- 故事分享 tab 下显示 tag 筛选：全部 | 追星经历 | 影视回忆 | 音乐记忆 | 冷知识 | 其他
- 查询层 `getGuestbookEntries` 支持 `storyTag` 过滤（`storyTags: { has }` 操作符）
- 页面读取 `searchParams.storyTag` 并传递给 FilterBar 和查询层

#### 修改 3 + 4：活动新增「直播」独立 tab + 访谈删除「直播」媒体类型
- 数据库：`Livestream` 模型（prisma/schema.prisma），含 Tag/Media 多对多关系
- 类型：`ActivityTab` 新增 `'livestream'`，`LivestreamItem`/`LivestreamDetail` 接口
- 查询层：`getLivestreams`、`getLivestreamBySlug`、`getActivityCounts` 含 livestream
- 新组件：`LivestreamCard.tsx` — 平台标签 + 标题 + 日期 + 时长 + 回放标识
- FilterBar：三 Tab（代言/访谈/直播），直播有平台子筛选（微博/抖音/Instagram）
- 访谈 `mediaTypeFilters` 删除「直播」项
- `InterviewMediaType` 枚举删除 `LIVE`
- API：`/api/activities/livestreams` GET/POST + `[slug]` GET/PUT/DELETE
- 详情页：`/activities/livestreams/[slug]`
- **数据库迁移待执行**：`npx prisma migrate dev --name add-livestream-model`

### 2026-06-07 - UI 调整阶段一（已完成）

- 导航栏新增「主页」入口，精确匹配 `/` 激活逻辑
- 综艺删除地区 tag 筛选
- 路透新增「其他」tag
- 筛选栏与内容卡片间距统一（mb-8）
- 移除内容审核机制：创建时默认 APPROVED，查询排除 REJECTED

### 2026-06-07 - Cloudflare R2 存储配置（已完成）

#### 基础设施
- 安装 @aws-sdk/client-s3 + @aws-sdk/s3-request-presigner
- R2 客户端工具（src/lib/r2.ts）：S3Client 初始化、上传/删除/预签名 URL
- 文件类型白名单（图片/视频/音频/PDF）+ 大小限制（10~100MB）
- 自动按 MIME 类型分文件夹（images/videos/audio/files）

#### API
- POST /api/upload — 服务端中转上传（FormData，适合小文件）
- POST /api/upload/presign — 预签名 URL（前端直传 R2，适合大文件）

#### 环境变量
- R2_ACCOUNT_ID、R2_ACCESS_KEY_ID、R2_SECRET_ACCESS_KEY、R2_BUCKET_NAME、R2_PUBLIC_URL

### 2026-06-07 - P4 互动与管理模块开发（已完成）

#### P4.1 留言板模块
- 类型定义扩展（types.ts）：MessageTab, GuestbookItem, GuestbookDetail, CommentItem
- 查询层（queries/guestbook.ts）：getGuestbookEntries、getGuestbookById、getGuestbookCounts、getCommentsByTarget
- UI 组件 7 个：GuestbookCard、GuestbookForm、GuestbookFilterBar、LikeButton、FavoriteButton、CommentSection、GuestbookCardSkeleton
- 留言列表页（/messages）：三 Tab 切换 + 分页 + 留言提交表单
- 留言详情页（/messages/[id]）：完整内容 + 点赞/收藏 + 评论区
- API 路由：messages CRUD + like + comments
- 种子数据：13 条留言（5 MESSAGE + 5 STORY + 3 FEEDBACK）+ 5 条评论

#### P4.2 公告模块
- 类型定义扩展（types.ts）：AnnouncementTab, AnnouncementItem, AnnouncementDetail
- 查询层（queries/announcements.ts）：getAnnouncements、getAnnouncementById、getAnnouncementCounts
- UI 组件 3 个：AnnouncementCard、AnnouncementsFilterBar、AnnouncementCardSkeleton
- 公告列表页（/announcements）：三分类 Tab + 置顶优先 + 分页
- 公告详情页（/announcements/[id]）
- API 路由：announcements CRUD
- 种子数据：8 条公告（含 2 条置顶）

#### P4.3 后台管理 API
- 认证中间件（lib/auth.ts）：JWT 验证（jose 库）
- 管理员登录 API（/api/admin/login）：bcryptjs 密码验证 + JWT 签发
- 留言审核 API（/api/admin/messages）：批量/单条 approve/reject
- 管理员种子账号：admin@chilamishere.com
- 新增依赖：bcryptjs、jose

### 2026-06-07 - 全站渲染策略优化

- 所有数据库驱动的列表页添加 `export const dynamic = 'force-dynamic'`
- 涉及 6 个页面：首页、动态、影视综、演出、活动、资料库
- 解决 build 时因数据库不可达导致预渲染失败的问题
- `pnpm build` 现已通过，所有路由正确识别（14 静态 + 21 动态）

### 2026-06-07 - P3.2 资料库模块开发（已完成）

#### 数据层
- 类型定义扩展（types.ts）：ArchiveTab, AlbumItem, AlbumDetail, MagazineItem, MagazineDetail
- 查询层（queries/archives.ts）：getAlbums、getAlbumBySlug、getMagazines、getMagazineBySlug、getArchiveCounts
- 种子数据追加（seed.ts）：20 张真实专辑（1991-2022）+ 10 本杂志

#### UI 组件
- AlbumCard：正方形封面卡片（1:1 比例，语言 badge）
- MagazineCard：竖版封面卡片（2:3 比例，期号+日期）
- ArchivesFilterBar：筛选栏（专辑/杂志 Tab + 语言子筛选）
- ArchiveCardSkeleton：加载骨架

#### 页面
- 资料库列表页（/archives）：Grid 布局，双 Tab + 语言筛选 + 分页
- 专辑详情页（/archives/albums/[slug]）：封面 + 曲目列表 + 流媒体链接
- 杂志详情页（/archives/magazines/[slug]）：封面 + 内页浏览
- 加载骨架屏（loading.tsx）

#### API
- GET/POST /api/archives/albums — 列表查询 + 创建
- GET/PUT/DELETE /api/archives/albums/[slug] — 详情 + 更新 + 删除
- GET/POST /api/archives/magazines — 列表查询 + 创建
- GET/PUT/DELETE /api/archives/magazines/[slug] — 详情 + 更新 + 删除

### 2026-06-07 - P3.1 活动模块开发（已完成）

#### 数据层
- 类型定义扩展（types.ts）：ActivityTab, InterviewMediaFilter, EndorsementItem, EndorsementDetail, InterviewItem, InterviewDetail
- 查询层（queries/activities.ts）：getEndorsements、getEndorsementBySlug、getInterviews、getInterviewBySlug、getActivityCounts
- 种子数据追加（seed.ts）：15 条真实代言品牌 + 8 条访谈数据

#### UI 组件
- EndorsementCard：品牌卡片（4:3 比例，品类 badge，年份范围）
- InterviewCard：文字卡片（无图片，媒体类型 badge）
- ActivitiesFilterBar：筛选栏（代言/访谈 Tab + 访谈媒体类型子筛选）
- ActivityCardSkeleton：加载骨架

#### 页面
- 活动列表页（/activities）：Grid 布局，双 Tab + 媒体类型筛选 + 分页
- 代言详情页（/activities/endorsements/[slug]）：品牌信息 + 素材展示
- 访谈详情页（/activities/interviews/[slug]）：原始媒体 + 粤语/国语文字稿 + 校对状态
- 加载骨架屏（loading.tsx）

#### API
- GET/POST /api/activities/endorsements — 列表查询 + 创建
- GET/PUT/DELETE /api/activities/endorsements/[slug] — 详情 + 更新 + 删除
- GET/POST /api/activities/interviews — 列表查询 + 创建
- GET/PUT/DELETE /api/activities/interviews/[slug] — 详情 + 更新 + 删除

### 2026-06-06 - P2.2 演出模块开发（已完成）

#### 数据层
- 类型定义扩展（types.ts）：PerformanceTab, PerformanceItem, OfficialMediaItem, FanShotItem, PerformanceDetail
- 查询层（queries/performances.ts）：getPerformances、getPerformanceBySlug、getPerformanceCounts
- 种子数据追加（seed.ts）：11 条演出数据（4 演唱会 + 5 舞台 + 2 音乐剧）+ 2 个新标签

#### UI 组件
- PerformanceCard：海报卡片（2:3 比例，类型 badge，场馆/城市信息）
- PerformancesFilterBar：筛选栏（类型 Tab + 演唱会系列筛选）
- PerformanceCardSkeleton：加载骨架

#### 页面
- 演出列表页（/performances）：Grid 布局，三 Tab + 系列筛选 + 分页
- 演出详情页（/performances/[slug]）：双栏布局（海报 + 信息），歌单，官摄区，饭拍区
- 加载骨架屏（loading.tsx）

#### API
- GET/POST /api/performances — 列表查询 + 创建演出
- GET/PUT/DELETE /api/performances/[slug] — 详情 + 更新 + 删除

### 2026-06-06 - P2.1 影视模块开发（已完成）

#### 数据层
- 类型定义扩展（types.ts）：ScreenTab, DecadeFilter, ProductionItem, ProductionDetail
- 查询层（queries/productions.ts）：getProductions、getProductionBySlug、getProductionCounts
- 种子数据追加（seed.ts）：38 条影视数据（15 电视剧 + 15 电影 + 8 综艺）+ 7 个新标签

#### UI 组件
- ProductionCard：海报卡片（2:3 比例，类型 badge，Link 跳转）
- ScreensFilterBar：三维筛选栏（类型 Tab + 年代 + 综艺地区）
- ProductionCardSkeleton：加载骨架

#### 页面
- 影视列表页（/screens）：Grid 布局，三 Tab + 年代筛选 + 综艺地区筛选 + 分页
- 影视详情页（/screens/[slug]）：双栏布局（海报 + 信息），播放平台链接，图册，相关资讯占位
- 加载骨架屏（loading.tsx）

#### API
- GET/POST /api/screens — 列表查询 + 创建作品
- GET/PUT/DELETE /api/screens/[slug] — 详情 + 更新 + 删除

### 2026-06-06 - P1 核心页面开发（已完成）

#### P1 基础设施
- Prisma Client 单例配置（db.ts + @prisma/adapter-pg）
- next/image 外部图片域配置（sinaimg.cn, picsum.photos, supabase.co, unsplash）
- 种子数据脚本（prisma/seed.ts）：8 标签 + 30 社交帖 + 15 新闻 + 10 路透 + 20 时间线事件
- 数据类型定义（src/lib/types.ts）+ 查询层（src/lib/queries/）

#### P1.1 首页
- Timeline 组件：Server Component，按年份分组，桌面端左右交替布局
- TimelineNode 组件：金色圆点 + 卡片，支持关联内容链接
- 首页数据化升级：硬编码时间线替换为数据库驱动

#### P1.2 动态模块
- 6 个 UI 组件：SocialPostCard、NewsArticleCard、SightingCard、UpdateCardSkeleton、MasonryGrid、UpdatesFilterBar
- 动态列表页（/updates）：三 Tab 切换 + 平台/类型标签筛选 + URL 分页
- 分页组件（Pagination）+ 加载骨架屏（loading.tsx）
- 三个详情页路由：/updates/social/[id]、/updates/news/[slug]、/updates/sightings/[slug]

#### P1.3 API
- CRUD API 路由：/api/updates/social、/api/updates/news、/api/updates/sightings
- 通用详情 API：/api/updates/[id]（GET/PUT/DELETE）
- 统一响应格式 + 输入验证 + 错误处理

### 2026-06-06 - P0.3 项目骨架搭建 (已完成)
- 设计令牌系统：基于参考图建立全站深色主题（深靛蓝 #1A1A2E + 琥珀金 #C49B63）
- 字体加载：5 款 Google Fonts（Playfair Display、Noto Serif/Sans SC、Inter、Cormorant Garamond）
- 配置文件：site.ts（站点信息）、navigation.ts（7 个栏目导航）
- 工具函数：cn.ts（tailwind-merge）、db.ts（Prisma 预留）
- 布局组件：Header（毛玻璃导航栏）、MobileNav（抽屉菜单）、Footer（三栏 + 年份暗纹）、PageContainer、PageHeader
- UI 组件：Button（3 变体）、Card（深色卡片）、Tag（金边标签）、TabBar（金线指示器）、GoldDivider、GlassOverlay、UnderConstruction
- 装饰组件：FilmGrain（胶片颗粒）、YearMarquee（年份泛金动画）
- 路由页面：8 个栏目列表页 + 6 个详情页 + 首页骨架 + 404 页面（共 16 个）
- 全局样式：胶片颗粒噪声、琥珀金细线、毛玻璃效果、自定义滚动条
- 构建验证通过：pnpm build + lint + format 全部通过

### 2026-06-06 - P0.2 Supabase 数据库配置 + 迁移 (已完成)
- 连接 Supabase 项目（Session pooler 模式，ap-northeast-2 区域）
- 配置 `prisma.config.ts` 加载 `.env.local` 环境变量
- 执行首次数据库迁移 `20260605164411_init`，20 张表 + 10 个枚举已同步到 Supabase
- 生成 Prisma Client 到 `src/generated/prisma`

### 2026-06-05 - P0.2 数据库 Schema 设计 (已完成)
- 基于 `docs/Database_Design_v1.md` 编写完整 `prisma/schema.prisma`
- 10 个枚举：ProductionType, PerformanceType, MediaType, InterviewMediaType, ImportMethod, SubmitType, ModerationStatus, ProofreadStatus, AnnouncementType, GuestbookTab
- 20 张表：categories, tags, media, content_relations, productions, performances, performance_media, fan_shots, endorsements, interviews, albums, magazines, social_posts, news_articles, sightings, timeline_events, guestbook, comments, announcements, admins
- Media 关联策略：6 个直接 FK（海报/封面/原始媒体）+ 8 个隐式多对多（图册/素材集合）
- 跨内容关联：tags 多对多（9 张表）+ content_relations 多态表
- 所有索引按设计文档配置（含 DESC 排序索引、联合唯一约束）
- `prisma validate` 验证通过

### 2026-06-02 - P0.1 技术环境搭建 (已完成)
- 初始化 Next.js 16 项目 (App Router + TypeScript + Tailwind CSS v4)
- 配置 pnpm 包管理器 (v11.5)
- 配置 ESLint 9 + Prettier (含 eslint-config-prettier 集成)
- 安装 Prisma 7 + @prisma/client (已初始化，Schema 待设计)
- 创建 Git 仓库
- 创建 .env.local 环境变量模板 (DATABASE_URL, R2, NEXT_PUBLIC_SITE_URL)
- 创建 .gitignore (含 .env、node_modules、.next、prisma generated 等)
- Dev 服务器验证通过 (localhost:3000 返回 200)

**已安装依赖:**
- next 16.2.6, react 19.2.4, tailwindcss 4.3.0
- prisma 7.8.0, @prisma/client 7.8.0
- typescript 5.9.3, eslint 9.39.4, prettier 3.8.3

**项目结构:**
```
├── src/app/          # Next.js App Router (layout.tsx, page.tsx, globals.css)
├── prisma/           # Prisma schema (待设计)
├── public/           # 静态资源
├── .env.local        # 环境变量模板
├── .prettierrc       # Prettier 配置
├── eslint.config.mjs # ESLint 配置
├── next.config.ts    # Next.js 配置
├── tsconfig.json     # TypeScript 配置
└── postcss.config.mjs# PostCSS (Tailwind)
```

### 2026-05-26 - 项目规划
- 创建 CLAUDE.md、DEVELOPMENT_PLAN.md、PROGRESS.md 三个核心文件
- 确定技术栈: Next.js 14 + TypeScript + Tailwind CSS + Prisma + PostgreSQL + R2
- 分阶段规划: P0~P5 共 6 个阶段
- 整理 Obsidian 规划文档

---

## P0.1 完成清单

- [x] 初始化 Next.js 项目 (App Router + TypeScript + Tailwind CSS)
- [x] 配置 pnpm、ESLint、Prettier
- [x] 配置 Prisma + PostgreSQL 连接 (初始化完成，Schema 待设计)
- [x] 创建 Git 仓库、.gitignore
- [x] 配置环境变量 (.env.local)

## P0.2 完成清单

- [x] 设计核心数据表 Schema (Prisma) — 基于 Database_Design_v1.md
- [x] 配置 Supabase 连接（Session pooler）
- [x] 创建数据库迁移文件 `20260605164411_init`
- [x] 生成 Prisma Client
- [x] 编写 Seed 数据 (测试用) — 在 P1 阶段完成

## P0.3 完成清单

- [x] 创建基础布局 (Header/Footer/Navigation)
- [x] 创建各栏目空页面路由
- [x] 设计全局样式 (颜色、字体、间距)
- [x] 创建通用组件 (Card、Tag、ImageGallery、Timeline)

## P1 完成清单

### 基础设施
- [x] Prisma Client 单例配置 (db.ts)
- [x] 种子数据脚本 (seed.ts)
- [x] 数据类型定义 (types.ts)
- [x] 数据查询层 (queries/timeline.ts, queries/updates.ts)
- [x] next/image 外部图片域配置

### P1.1 首页
- [x] Timeline 时间线组件（数据库驱动）
- [x] TimelineNode 节点组件
- [x] 首页 page.tsx 数据化升级

### P1.2 动态模块
- [x] SocialPostCard 社交帖卡片
- [x] NewsArticleCard 新闻卡片
- [x] SightingCard 路透卡片
- [x] UpdateCardSkeleton 骨架屏
- [x] MasonryGrid 瀑布流布局
- [x] UpdatesFilterBar 筛选栏
- [x] Pagination 分页组件
- [x] 动态列表页 (/updates)
- [x] 加载状态 (loading.tsx)
- [x] 社交帖详情页 (/updates/social/[id])
- [x] 新闻详情页 (/updates/news/[slug])
- [x] 路透详情页 (/updates/sightings/[slug])

### P1.3 API
- [x] GET/POST /api/updates/social
- [x] GET/POST /api/updates/news
- [x] GET/POST /api/updates/sightings
- [x] GET/PUT/DELETE /api/updates/[id]
- [x] 图片上传接口 (R2 存储，POST /api/upload + /api/upload/presign)

## P2.2 完成清单

### 数据层
- [x] PerformanceTab, PerformanceItem, PerformanceDetail 类型定义
- [x] 查询层 (queries/performances.ts)
- [x] 种子数据 (11 条演出 + 2 个新标签)

### UI 组件
- [x] PerformanceCard 演出卡片
- [x] PerformancesFilterBar 筛选栏
- [x] PerformanceCardSkeleton 骨架屏

### 页面
- [x] 演出列表页 (/performances)
- [x] 演出详情页 (/performances/[slug])
- [x] 加载状态 (loading.tsx)

### API
- [x] GET/POST /api/performances
- [x] GET/PUT/DELETE /api/performances/[slug]

## P3.1 完成清单

### 数据层
- [x] ActivityTab, EndorsementItem, EndorsementDetail 类型定义
- [x] InterviewItem, InterviewDetail 类型定义
- [x] 查询层 (queries/activities.ts)
- [x] 种子数据 (15 条代言 + 8 条访谈)

### UI 组件
- [x] EndorsementCard 代言卡片
- [x] InterviewCard 访谈卡片
- [x] ActivitiesFilterBar 筛选栏
- [x] ActivityCardSkeleton 骨架屏

### 页面
- [x] 活动列表页 (/activities)
- [x] 代言详情页 (/activities/endorsements/[slug])
- [x] 访谈详情页 (/activities/interviews/[slug])
- [x] 加载状态 (loading.tsx)

### API
- [x] GET/POST /api/activities/endorsements
- [x] GET/PUT/DELETE /api/activities/endorsements/[slug]
- [x] GET/POST /api/activities/interviews
- [x] GET/PUT/DELETE /api/activities/interviews/[slug]

## P3.2 完成清单

### 数据层
- [x] ArchiveTab, AlbumItem, AlbumDetail 类型定义
- [x] MagazineItem, MagazineDetail 类型定义
- [x] 查询层 (queries/archives.ts)
- [x] 种子数据 (20 张专辑 + 10 本杂志)

### UI 组件
- [x] AlbumCard 专辑卡片
- [x] MagazineCard 杂志卡片
- [x] ArchivesFilterBar 筛选栏
- [x] ArchiveCardSkeleton 骨架屏

### 页面
- [x] 资料库列表页 (/archives)
- [x] 专辑详情页 (/archives/albums/[slug])
- [x] 杂志详情页 (/archives/magazines/[slug])
- [x] 加载状态 (loading.tsx)

### API
- [x] GET/POST /api/archives/albums
- [x] GET/PUT/DELETE /api/archives/albums/[slug]
- [x] GET/POST /api/archives/magazines
- [x] GET/PUT/DELETE /api/archives/magazines/[slug]

## P4.1 完成清单

### 数据层
- [x] MessageTab, GuestbookItem, GuestbookDetail, CommentItem 类型定义
- [x] 查询层 (queries/guestbook.ts)
- [x] 种子数据 (13 条留言 + 5 条评论)

### UI 组件
- [x] GuestbookCard 留言卡片
- [x] GuestbookForm 留言提交表单
- [x] GuestbookFilterBar 筛选栏
- [x] LikeButton 点赞按钮
- [x] FavoriteButton 收藏按钮
- [x] CommentSection 评论区
- [x] GuestbookCardSkeleton 骨架屏

### 页面
- [x] 留言板列表页 (/messages)
- [x] 留言详情页 (/messages/[id])
- [x] 加载状态 (loading.tsx)

### API
- [x] GET/POST /api/messages
- [x] GET/PUT/DELETE /api/messages/[id]
- [x] POST /api/messages/[id]/like
- [x] GET/POST /api/messages/[id]/comments

## P4.2 完成清单

### 数据层
- [x] AnnouncementTab, AnnouncementItem, AnnouncementDetail 类型定义
- [x] 查询层 (queries/announcements.ts)
- [x] 种子数据 (8 条公告)

### UI 组件
- [x] AnnouncementCard 公告卡片
- [x] AnnouncementsFilterBar 筛选栏
- [x] AnnouncementCardSkeleton 骨架屏

### 页面
- [x] 公告列表页 (/announcements)
- [x] 公告详情页 (/announcements/[id])
- [x] 加载状态 (loading.tsx)

### API
- [x] GET/POST /api/announcements
- [x] GET/PUT/DELETE /api/announcements/[id]

## P4.3 完成清单

### 后台管理 API
- [x] 认证中间件 (lib/auth.ts)
- [x] POST /api/admin/login
- [x] GET/PUT /api/admin/messages (批量审核)
- [x] PUT/DELETE /api/admin/messages/[id] (单条审核)
- [x] 管理员种子账号

## UI 调整阶段一完成清单（2026-06-07）

- [x] 导航栏新增「主页」入口
- [x] 综艺删除地区 tag 筛选
- [x] 路透新增「其他」tag
- [x] 筛选栏与内容卡片间距统一
- [x] 移除内容审核机制

## UI 调整阶段二完成清单（2026-06-08）

### 修改 5：故事分享 tag 筛选
- [x] GuestbookFilterBar 新增 storyTagFilters + currentStoryTag
- [x] 页面读取 storyTag 参数
- [x] 查询层 storyTag 过滤
- [x] pnpm build 通过

### 修改 3 + 4：直播独立 tab
- [x] Livestream 模型（Schema）
- [x] LivestreamItem / LivestreamDetail 类型
- [x] getLivestreams / getLivestreamBySlug 查询
- [x] LivestreamCard 组件
- [x] ActivitiesFilterBar 三 Tab + 平台筛选
- [x] 访谈删除「直播」mediaType
- [x] 活动列表页三分支渲染
- [x] 直播详情页 /activities/livestreams/[slug]
- [x] API GET/POST + [slug] GET/PUT/DELETE
- [x] pnpm lint 通过
- [x] pnpm build 通过
- [ ] 数据库迁移（Supabase 连接超时，待网络恢复）

## P5.0 海报与封面图片填充（2026-06-08 开始）

### 任务概况
- 总量：135 张（108 影视综海报 + 27 专辑封面）
- 方式：网络搜索高清图 → 下载到 media/images/ → curl 上传绑定
- 找不到的跳过，综艺用节目海报代替个人海报

### 批次进度
| 批次 | 内容 | 数量 | 状态 |
|------|------|------|------|
| 第1批 | 近年热门电影（2015+） | ~15 | 进行中 |
| 第2批 | 热门电视剧 | ~10 | 待执行 |
| 第3批 | 综艺节目 | 14 | 待执行 |
| 第4批 | 专辑封面 | 27 | 待执行 |
| 第5批 | 中期电影（2000-2014） | ~25 | 待执行 |
| 第6批 | 早期电影（90年代） | ~16 | 待执行 |
| 第7批 | 剩余电视剧 | ~25 | 待执行 |

## 下一步: P5.0 海报填充（进行中）→ UI 调整阶段三（用户系统）→ P5 优化上线

---

## 待决事项
- [x] 数据库方案最终确认 → Supabase (PostgreSQL, ap-northeast-2)
- [x] 存储方案最终确认 → Cloudflare R2 (chilam-media, r2.dev 公开访问)
- [ ] 域名选择
- [ ] 是否需要用户登录系统
- [ ] 留言板是否需要登录才能留言
