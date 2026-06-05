# 数据库设计方案

> 日期：2026-06-02
> 状态：设计讨论中，待确认后实施

---

## 一、架构决策：为什么不用 Sanity？

原设计文档建议 **Sanity CMS**（管理影视/演出/活动等结构化内容）+ **Supabase**（管理动态/留言等 UGC 内容）。

**我建议：全部用一个 PostgreSQL 数据库（通过 Supabase 托管），用 Prisma 统一管理。**

### 对比

| 维度 | Sanity + Supabase（双系统） | 纯 PostgreSQL + Prisma（单系统） |
|------|---------------------------|-------------------------------|
| **数据关联** | 跨系统关联极痛苦。影视在 Sanity，相关新闻在 Supabase，要关联只能通过字符串匹配关键词，不是真正的数据库关联 | 外键直接关联，一条 SQL JOIN 就能查出"某部电影的所有相关新闻" |
| **全站搜索** | 需要把两个数据源的数据同步到搜索引擎 | 单一数据源，PostgreSQL 自带全文搜索，或统一导出到 Meilisearch |
| **开发体验** | 两套查询 API（Sanity GROQ + Supabase JS），心智负担大 | Prisma 一套 API，TypeScript 类型安全 |
| **部署维护** | 两个服务要维护，两个控制台要登录 | 一个 Supabase 项目搞定 |
| **成本** | Sanity 免费额度：3 用户、500K API 请求/月，超出后 $99/月起 | Supabase 免费额度：500MB 数据库、50K 请求/月，完全够用 |
| **后台管理** | Sanity 自带内容编辑后台（这是它的优势） | 需要自己写一个简单的后台页面（但完全可控） |

### 结论

Sanity 的唯一优势是自带一个好用的编辑后台。但这个项目的内容编辑者只有你（管理员），不需要一个面向多人协作的 CMS。**用 Next.js 写一个 `/admin` 后台页面，配合 Prisma，比维护两个系统简单太多。**

---

## 二、搭建在哪里

### 推荐方案

```
┌─────────────┐     ┌──────────────────┐     ┌────────────────┐
│   Vercel     │────▶│   Supabase       │     │ Cloudflare R2  │
│   前端+API   │     │   PostgreSQL     │     │ 图片/视频存储   │
│   免费       │     │   免费(500MB)    │     │ 免费(10GB)     │
└─────────────┘     └──────────────────┘     └────────────────┘
```

| 服务 | 用途 | 免费额度 | Phase 1 够不够 |
|------|------|---------|--------------|
| **Supabase** | PostgreSQL 数据库 | 500MB 存储、无限读、50K 月请求 | ✅ Phase 1 纯链接+元信息约 10MB，绰绰有余 |
| **Cloudflare R2** | 图片/视频文件 | 10GB 存储、无出口费用 | ✅ Phase 1 缩略图缓存约 1-3GB |
| **Vercel** | 前端 + API Routes | 100GB 带宽、Serverless 函数 | ✅ 完全够 |

### 搭建步骤（后续实施时照做）

**Step 1：创建 Supabase 项目**
1. 去 [supabase.com](https://supabase.com) 注册/登录
2. 点 "New Project"，选 Region（推荐 Southeast Asia - Singapore，对大陆访问延迟最低）
3. 设置数据库密码（保存好）
4. 创建后，在 Settings → Database → Connection string 里找到连接字符串

**Step 2：配置本地项目**
```bash
# .env.local 里填入
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

> 为什么有两个 URL？
> - `DATABASE_URL`：走 PgBouncer 连接池（6543 端口），适合 Serverless 环境（Vercel），避免连接数爆炸
> - `DIRECT_URL`：直连数据库（5432 端口），Prisma 迁移时需要直连

**Step 3：同步 Schema**
```bash
pnpm prisma db push    # 开发阶段用 push，快速同步
# 或
pnpm prisma migrate dev --name init   # 正式阶段用 migrate，生成迁移文件
```

**Step 4（Phase 2 再做）：配置 Cloudflare R2**
- Phase 1 的缩略图可以先用 Supabase Storage（自带 1GB 免费）
- Phase 2 媒体量上来后再迁移到 R2

---

## 三、整体数据模型概览

### 3.1 表清单

| 模块 | 表名 | 用途 | 预估数据量 |
|------|------|------|-----------|
| **通用** | `tags` | 全站标签 | ~500 条 |
| **通用** | `media` | 媒体资源（图片/视频/文件 URL） | Phase 1 ~3K，Phase 2 ~15K |
| **影视综** | `productions` | 电影/电视剧/综艺 | ~130 条 |
| **演出** | `performances` | 演唱会/舞台/音乐剧 | ~20 条 |
| **演出** | `performance_media` | 演出官摄素材 | ~100 条 |
| **演出** | `fan_shots` | 饭拍投稿 | 持续增长 |
| **活动** | `endorsements` | 广告代言 | ~20 条 |
| **活动** | `interviews` | 访谈 | ~50 条 |
| **资料库** | `albums` | 专辑 | ~25 条 |
| **资料库** | `magazines` | 杂志 | ~50 条 |
| **动态** | `social_posts` | 社交媒体搬运 | ~3000 条 |
| **动态** | `news_articles` | 新闻报道 | ~200 条 |
| **动态** | `sightings` | 路透/踪迹 | 持续增长 |
| **首页** | `timeline_events` | 时间线节点 | ~50 条 |
| **留言** | `guestbook` | 留言板 | 持续增长 |
| **留言** | `comments` | 评论 | 持续增长 |
| **公告** | `announcements` | 网站公告 | ~20 条 |
| **系统** | `admins` | 管理员 | 1-3 条 |

### 3.2 关系总图

```
                        ┌─────────┐
                        │  tags   │ ← 全站共享标签系统
                        └────┬────┘
                             │ 多对多（中间表自动生成）
            ┌────────────────┼────────────────────────────────┐
            │                │                                │
     ┌──────▼──────┐  ┌─────▼──────┐  ┌──────▼──────┐  ┌─────▼──────┐
     │ productions │  │performances│  │ social_posts │  │  其他所有表  │
     │ 影视综作品   │  │ 演出       │  │ 社交媒体动态  │  │  都可关联   │
     └──────┬──────┘  └─────┬──────┘  └─────────────┘  └────────────┘
            │               │
            │          ┌────▼─────┐
            │          │fan_shots │ ← 外键直接关联演出
            │          │饭拍投稿   │
            │          └──────────┘
            │
     ┌──────▼──────────────────────────────────┐
     │           timeline_events               │
     │  linkedType = "production"               │
     │  linkedId = "clxx..."                    │
     │  ← 多态引用：可链接到任意内容表的记录      │
     └─────────────────────────────────────────┘

     ┌──────────┐
     │  media   │ ← 统一媒体资源表
     │ 图片/视频 │
     └────┬─────┘
          │ 被多个表通过外键或中间表引用
          ├── productions.poster（一对一）
          ├── productions.gallery（一对多）
          ├── albums.cover（一对一）
          ├── social_posts.mediaItems（一对多）
          ├── fan_shots.mediaItems（一对多）
          └── ...其他表类似
```

---

## 四、各表详细设计

### 4.1 `tags` — 全站标签

**用途**：跨栏目内容关联的核心机制。一条新闻可以关联"射雕英雄传"标签，一部电视剧也关联同一个标签，就实现了自动的"相关内容"。

```
tags
├── id          字符串主键 (cuid)
├── name        标签名（唯一）   例："射雕英雄传"、"粤语"、"2024"、"机场"
├── slug        URL 友好标识（唯一）  例："the-legend-of-the-condor-heroes"
└── createdAt   创建时间
```

**关联方式**：与所有内容表都是**多对多关系**。Prisma 会自动生成中间表（如 `_ProductionTags`、`_SocialPostTags`），不需要手动建。

**使用场景举例**：
```
用户点进电视剧《射雕英雄传》的详情页
 → 查出这部剧关联的标签：["射雕英雄传", "郭靖", "TVB", "1994"]
 → 用这些标签去 social_posts、news_articles、sightings 里搜索
 → 在详情页底部展示"相关资讯"
```

### 4.2 `media` — 统一媒体资源

**用途**：所有图片/视频/音频/文件的元信息都记录在此表，实际文件存在 R2/OSS，这里只存 URL。

```
media
├── id          字符串主键
├── type        枚举：IMAGE / VIDEO / AUDIO / FILE
├── url         存储 URL（R2/OSS 地址）
├── filename    原始文件名
├── mimeType    MIME 类型（image/jpeg, video/mp4 等）
├── size        文件大小（字节）
├── width       图片/视频宽度（像素）
├── height      图片/视频高度（像素）
├── duration    音视频时长（秒）
├── alt         替代文本（无障碍 + SEO）
├── caption     图片说明
└── createdAt   创建时间
```

**为什么要独立一个表？**
- 同一张图片可能被多处引用（比如海报同时出现在作品页和时间线）
- 统一管理方便后续做图片优化（CDN、缩略图生成、WebP 转换）
- 方便后台做"媒体库"功能

**关联方式**：
| 场景 | 关联类型 | 例子 |
|------|---------|------|
| 作品海报 | 一对一 | `productions.posterId → media.id` |
| 作品图册 | 一对多 | 一部电影有多张剧照 |
| 社交媒体回填图片 | 一对多 | 一条微博有 9 张图 |
| 专辑封面 | 一对一 | `albums.coverId → media.id` |

---

### 4.3 `productions` — 影视综作品

**用途**：存储电影、电视剧、综艺的结构化信息。

```
productions
├── id            字符串主键
├── type          枚举：MOVIE / TV_SERIES / VARIETY_SHOW
├── slug          URL 标识（唯一）    例："the-legend-of-the-condor-heroes-1994"
├── title         中文名              例："射雕英雄传"
├── titleEn       英文名（可选）      例："The Legend of the Condor Heroes"
├── year          年份                例：1994
├── role          饰演角色（可选）    例："郭靖"
├── synopsis      简介（可选）
│
├── posterId      → media.id（一对一，海报图）
├── gallery       → media[]（一对多，剧照/截图）
│
├── watchLinks    JSON 数组           例：[{"platform":"腾讯视频","url":"..."},{"platform":"TVB","url":"..."}]
│
├── varietyRegion  综艺地区（可选）    例："内地" / "香港"
├── varietyRole    综艺角色（可选）    例："常驻" / "飞行"
├── language       语言（可选）        例："粤语" / "普通话"
│
├── tags          → tags[]（多对多）  例：["粤语", "TVB", "武侠"]
├── sortOrder     排序权重（数字越小越靠前）
├── isVisible     是否在前端展示
├── createdAt     创建时间
└── updatedAt     更新时间
```

**设计说明**：
- `type` 用枚举区分三类，一张表即可，避免三张表重复字段
- `watchLinks` 用 JSON 而非独立表，因为播放链接结构简单、数量少、不需要查询
- `varietyRegion` / `varietyRole` 只有综艺会用到，其他类型留空即可
- `sortOrder` 用于手动控制展示顺序（例如让经典作品排前面）

**索引**：
- `type` 索引：按类型筛选（列表页 tab 切换）
- `year` 索引：按年代筛选

---

### 4.4 `performances` — 演出

```
performances
├── id          字符串主键
├── type        枚举：CONCERT / STAGE / MUSICAL
├── slug        URL 标识（唯一）
├── title       演出名          例："Crazy Hours Live"
├── titleEn     英文名（可选）
├── year        年份
├── venue       场馆（可选）    例："香港红磡体育馆"
├── city        城市（可选）    例："香港"
├── series      系列名（可选）  例："Crazy Hours"
│
├── posterId    → media.id（一对一，海报）
│
├── officialMedia → performance_media[]（一对多，官摄内容）
├── setlist       JSON 数组     例：["歌名1", "歌名2", ...]
│
├── fanShots    → fan_shots[]（一对多，饭拍投稿）
│
├── tags        → tags[]（多对多）
├── sortOrder   排序权重
├── isVisible   是否展示
├── createdAt   创建时间
└── updatedAt   更新时间
```

**关联子表 `performance_media`**（演出官摄素材）：
```
performance_media
├── id              字符串主键
├── performanceId   → performances.id（外键，级联删除）
├── title           标题（可选）  例："官方全场视频"
├── mediaId         → media.id（一对一）
├── sortOrder       排序
└── createdAt       创建时间
```

**关联子表 `fan_shots`**（饭拍投稿）：
```
fan_shots
├── id              字符串主键
├── performanceId   → performances.id（外键，级联删除）
│
├── originalUrl     投稿链接（可选）  例：B站/YouTube/微博链接
├── title           标题（可选）
├── summary         概要
├── thumbnailUrl    封面图
│
├── mediaItems      → media[]（一对多，上传的媒体）
├── isFullCopy      是否有完整内容
│
├── authorName      投稿人昵称
├── contactInfo     联系方式（仅后台可见）
├── submitType      枚举：LINK / UPLOAD / MIXED
├── status          枚举：PENDING / APPROVED / REJECTED
│
├── createdAt       创建时间
└── updatedAt       更新时间
```

**设计说明**：
- 演出和饭拍是**一对多**关系，通过外键直接关联
- 饭拍的投稿审核通过 `status` 字段控制，`PENDING` → 管理员审核 → `APPROVED` 才展示
- `submitType` 区分是纯链接投稿还是上传文件投稿

---

### 4.5 `endorsements` — 广告代言

```
endorsements
├── id          字符串主键
├── brand       品牌名          例："香港美心"
├── role        代言身份        例："代言人" / "品牌大使" / "彩妆挚友"
├── category    品类            例："餐饮" / "护肤" / "汽车"
├── startYear   开始年份        例：2013
├── endYear     结束年份（可选，为空表示仍在合作）
│
├── media       → media[]（一对多，广告素材）
├── tags        → tags[]（多对多）
│
├── isVisible   是否展示
├── createdAt   创建时间
└── updatedAt   更新时间
```

---

### 4.6 `interviews` — 访谈

```
interviews
├── id          字符串主键
├── slug        URL 标识（唯一）
│
├── title       访谈标题        例："XXX 专访·2024"
├── source      来源媒体        例："TVB 娱乐新闻"
├── date        访谈日期
├── mediaType   原始形态        例："video" / "audio" / "text"
│
├── originalUrl       原始链接（可选）
├── originalMediaId   → media.id（一对一，上传的原始音视频）
│
├── transcriptCantonese   粤语文字稿（可选，大文本）
├── transcriptMandarin    国语翻译（可选，大文本）
├── proofreadStatus       枚举：PENDING / PROOFREAD
│
├── tags        → tags[]（多对多）
├── isVisible   是否展示
├── createdAt   创建时间
└── updatedAt   更新时间
```

**设计说明**：
- 文字稿直接存 `TEXT` 类型，PostgreSQL 对大文本没有长度限制
- `proofreadStatus` 标记 AI 转录是否已经人工校对
- 后续可以在文字稿上做全文搜索（PostgreSQL `tsvector` 或导出到 Meilisearch）

---

### 4.7 `albums` — 专辑

```
albums
├── id            字符串主键
├── slug          URL 标识（唯一）
├── title         专辑名
├── releaseYear   发行年份
├── language      语言          例："粤语" / "国语" / "粤语+国语"
│
├── coverId       → media.id（一对一，封面图）
│
├── tracks        JSON 数组     例：[{"number":1,"title":"现代爱情故事","duration":"4:32","lyrics":"..."}]
├── streamingLinks JSON 对象    例：{"spotify":"...","appleMusic":"...","qqMusic":"...","neteaseMusic":"..."}
│
├── tags          → tags[]（多对多）
├── sortOrder     排序权重
├── isVisible     是否展示
├── createdAt     创建时间
└── updatedAt     更新时间
```

**设计说明**：
- `tracks` 用 JSON 数组，因为曲目列表不需要单独查询，总是跟着专辑一起读取
- `streamingLinks` 用 JSON 对象，因为平台种类有限且只需读取，不需要筛选

---

### 4.8 `magazines` — 杂志

```
magazines
├── id          字符串主键
├── title       杂志名          例："ELLE"
├── issue       期号（可选）    例："2021年3月刊"
├── date        出版日期
│
├── coverId     → media.id（一对一，封面图）
├── scans       → media[]（一对多，扫描件内页）
│
├── tags        → tags[]（多对多）
├── isVisible   是否展示
├── createdAt   创建时间
└── updatedAt   更新时间
```

---

### 4.9 `social_posts` — 社交媒体动态

**这是数据量最大的表**，设计核心是"渐进增强"模式。

```
social_posts
├── id            字符串主键
├── platform      枚举：WEIBO / INSTAGRAM / DOUYIN / XIAOHONGSHU / FACEBOOK
│
│  ── Phase 1 字段（链接优先）──
├── originalUrl   原始链接（必填）    例："https://weibo.com/1234567/xxx"
├── originalId    原平台帖子 ID（可选，去重用）
├── title         标题（自动解析或手动填写）
├── summary       概要
├── thumbnailUrl  封面图 URL
├── publishedAt   原始发布时间
│
│  ── Phase 2 字段（回填完整内容）──
├── contentText   完整文字内容
├── mediaItems    → media[]（一对多，站内存储的图片/视频）
├── isFullCopy    是否已回填完整内容（默认 false）
│
│  ── 通用字段 ──
├── tags          → tags[]（多对多）
├── importMethod  枚举：LINK_PARSE / CRAWLER / MANUAL
├── createdAt     创建时间
└── updatedAt     更新时间
```

**索引**：
- `(platform, originalId)` 联合唯一索引：防止同一条微博被重复导入
- `platform` 索引：按平台筛选
- `publishedAt DESC` 索引：按时间倒序排列

**渐进增强逻辑**：
```
Phase 1：
  originalUrl = "https://weibo.com/..."  ✅ 必填
  title = "张智霖：今天..."              ✅ 自动解析
  thumbnailUrl = "https://..."           ✅ 自动解析
  isFullCopy = false                     ← 前端展示"查看原文"跳转链接

Phase 2 回填后：
  contentText = "完整的微博文字..."       ✅ 爬虫回填
  mediaItems = [media1, media2, ...]     ✅ 图片下载到 R2 后关联
  isFullCopy = true                      ← 前端展示站内浮动弹窗
```

---

### 4.10 `news_articles` — 新闻报道

```
news_articles
├── id            字符串主键
├── originalUrl   新闻链接（必填）
├── title         标题
├── summary       概要（可选）
├── source        来源媒体（可选）  例："东方日报"
├── thumbnailUrl  封面图（可选）
├── publishedAt   发布时间（可选）
│
├── contentText   完整内容（可选，回填）
├── isFullCopy    是否有完整内容
│
├── tags          → tags[]（多对多）
├── createdAt     创建时间
└── updatedAt     更新时间
```

---

### 4.11 `sightings` — 路透/踪迹

```
sightings
├── id            字符串主键
│
├── originalUrl   投稿链接（可选）
├── title         标题
├── summary       概要（可选）
├── thumbnailUrl  封面图（可选）
├── locationTag   位置标签        例："机场" / "片场" / "偶遇"
│
├── content       完整描述（可选）
├── mediaItems    → media[]（一对多）
├── isFullCopy    是否有完整内容
│
├── authorName    投稿人昵称
├── submitType    枚举：LINK / UPLOAD / MIXED
├── status        枚举：PENDING / APPROVED / REJECTED
│
├── tags          → tags[]（多对多）
├── createdAt     创建时间
└── updatedAt     更新时间
```

---

### 4.12 `timeline_events` — 首页时间线

```
timeline_events
├── id            字符串主键
├── date          事件日期
├── title         标题            例："披荆斩棘 2025 开播"
├── description   描述（可选）
│
├── linkedType    关联内容类型    例："production" / "performance" / "socialPost"
├── linkedId      关联内容 ID     例："clxxx..."
│
├── isVisible     是否显示（控制隐藏过时节点）
├── sortOrder     排序权重
├── createdAt     创建时间
└── updatedAt     更新时间
```

**设计说明**：
- `linkedType` + `linkedId` 构成**多态引用**：一个时间线节点可以链接到任意内容表的任意记录
- 为什么不用外键？因为要链接到不同的表（production、performance、socialPost 等），多态引用比建 N 个外键更灵活
- 前端根据 `linkedType` 决定跳转到哪个页面

**示例**：
| date | title | linkedType | linkedId | 效果 |
|------|-------|-----------|---------|------|
| 2025-08 | 披荆斩棘 2025 开播 | production | clxxx1 | 点击跳到 `/screens/xxx` |
| 2025-09 | 《赴山海》播出 | production | clxxx2 | 点击跳到 `/screens/xxx` |
| 2022-12 | 演唱会「在」举办 | performance | clxxx3 | 点击跳到 `/performances/xxx` |

---

### 4.13 `guestbook` — 留言板

```
guestbook
├── id            字符串主键
├── tab           枚举：MESSAGE（我想对你说）/ STORY（故事分享）/ FEEDBACK（建议反馈）
│
├── nickname      昵称
├── content       留言内容
├── images        → media[]（一对多，附图）
│
├── storyTags     字符串数组      例：["追星经历", "冷知识"]（故事分享专用）
├── relatedYear   关联年份（可选）  例：2014（故事分享专用，用于时间轴展示）
│
├── likesCount    点赞数（默认 0）
├── status        枚举：PENDING / APPROVED / REJECTED
│
├── comments      → comments[]（一对多，回复）
├── createdAt     创建时间
```

---

### 4.14 `comments` — 评论

```
comments
├── id            字符串主键
├── guestbookId   → guestbook.id（外键，级联删除）
├── nickname      昵称
├── content       内容（最长 300 字）
└── createdAt     创建时间
```

**说明**：目前评论只挂在留言板下。如果后续路透、饭拍也需要评论，可以改成多态引用模式（类似 timeline_events 的 `linkedType` + `linkedId`）。但 Phase 1 先保持简单。

---

### 4.15 `announcements` — 公告

```
announcements
├── id            字符串主键
├── type          枚举：NOTICE（网站公告）/ RULE（规则说明）/ UPDATE（更新通知）
├── title         标题
├── content       内容（富文本）
├── isPinned      是否置顶
├── publishDate   发布日期
├── createdAt     创建时间
└── updatedAt     更新时间
```

---

### 4.16 `admins` — 管理员

```
admins
├── id            字符串主键
├── email         邮箱（唯一）
├── password      密码（bcrypt 哈希，绝不存明文）
├── name          显示名
└── createdAt     创建时间
```

---

## 五、跨栏目关联是怎么实现的

这是整个设计的核心价值。举几个具体场景：

### 场景 1：影视详情页展示相关新闻

```
用户访问：/screens/the-legend-of-the-condor-heroes-1994

1. 查出这部剧：
   SELECT * FROM productions WHERE slug = 'the-legend-of-the-condor-heroes-1994'

2. 查出它的标签：
   → ["射雕英雄传", "TVB", "郭靖"]

3. 用标签去查相关新闻：
   SELECT * FROM news_articles
   WHERE id IN (
     SELECT news_article_id FROM _NewsArticleTags
     WHERE tag_id IN (这些标签的 id)
   )
   ORDER BY publishedAt DESC
   LIMIT 5

4. 同样的标签去查相关微博：
   SELECT * FROM social_posts
   WHERE id IN (
     SELECT social_post_id FROM _SocialPostTags
     WHERE tag_id IN (这些标签的 id)
   )
   ORDER BY publishedAt DESC
   LIMIT 5

→ 在详情页底部展示"相关资讯"卡片
```

### 场景 2：首页时间线

```
SELECT * FROM timeline_events
WHERE isVisible = true
ORDER BY date DESC
LIMIT 20

→ 前端遍历每条记录：
   if (linkedType === 'production') → 链接到 /screens/{slug}
   if (linkedType === 'performance') → 链接到 /performances/{slug}
   ...
```

### 场景 3：全站搜索"射雕"

```
1. 先查标签：
   SELECT id FROM tags WHERE name LIKE '%射雕%'

2. 再查所有关联了该标签的内容：
   productions: 1 部电视剧
   social_posts: 3 条微博
   news_articles: 2 条新闻
   interviews: 1 条访谈

→ 整合结果返回给前端，按相关性/时间排序
```

---

## 六、JSON 字段 vs 独立表的选择标准

| 场景 | 选择 | 原因 |
|------|------|------|
| 专辑曲目 `tracks` | **JSON** | 总是跟专辑一起读取，不需要单独查询"哪些专辑有某首歌" |
| 播放链接 `watchLinks` | **JSON** | 结构简单，数量少，不需要按平台筛选 |
| 流媒体链接 `streamingLinks` | **JSON** | 同上 |
| 歌单 `setlist` | **JSON** | 总是跟演出一起读取 |
| 标签 `tags` | **独立表 + 多对多** | 需要反向查询（"查某个标签关联的所有内容"），这是跨栏目关联的基础 |
| 媒体资源 `media` | **独立表** | 需要统一管理、可被多处引用、后台需要媒体库功能 |
| 评论 `comments` | **独立表** | 需要分页查询、审核管理 |

---

## 七、后续可扩展的方向

以下是暂时不实现但设计上预留了扩展空间的功能：

| 功能 | 扩展方式 |
|------|---------|
| **评论挂在路透/饭拍下** | 把 `comments.guestbookId` 改成多态引用（`targetType` + `targetId`） |
| **用户系统** | 新增 `users` 表，`guestbook`/`comments`/`fan_shots` 加 `userId` 外键 |
| **多语言** | 内容字段加 `_zh` `_en` 后缀，或用独立的 `translations` 表 |
| **全文搜索** | PostgreSQL `tsvector` 索引，或导出到 Meilisearch |
| **内容版本历史** | 新增 `content_versions` 表，记录每次编辑 |
| **定时发布** | 加 `scheduledAt` 字段，前端根据当前时间过滤 |

---

## 八、总结

| 决策 | 方案 |
|------|------|
| 数据库 | PostgreSQL，托管在 Supabase |
| ORM | Prisma 7.8 |
| 表数量 | 18 张表 |
| 核心机制 | 统一标签系统（跨栏目关联）+ 统一媒体表（资源管理）+ 渐进增强（链接优先→回填内容）|
| Phase 1 成本 | 完全免费（Supabase 免费额度足够） |
| 不用 Sanity | 减少复杂度，单一数据源更利于关联查询和维护 |

---

> **下一步**：确认设计方案后，我将把以上设计转写为 Prisma schema 文件（`prisma/schema.prisma`）。

---
---
---

# 数据库设计 v2

> 日期：2026-06-05
> 状态：设计讨论中，待确认后实施
> 基于：v1 多表专用方案 + GPT 统一模型方案的优点合并

---

## 一、v1 → v2 变更摘要

| 变更 | 说明 |
|------|------|
| **新增 `categories`** | 栏目树表，存导航结构、路由、排序，前端导航栏/面包屑从这里读取 |
| **新增 `content_relations`** | 显式跨内容关联表，替代 v1 纯标签匹配 + timeline_events 多态引用 |
| **改造 `timeline_events`** | 去掉多态引用（`linkedType` + `linkedId`），改用 `content_relations` + `category_id` |
| **`tags` 增加 `tag_group`** | 标签分组，方便后台管理和前端按组展示筛选器 |
| **`media` 增加 `thumbnailUrl`** | 视频封面/图片缩略图地址 |
| **保留所有专用内容表** | productions、albums、interviews 等字段差异极大，不合并 |
| **不采用 content_blocks** | 内容结构固定，不需要 CMS 级积木拆分 |
| **不采用 content_cards** | 各表已有 summary/thumbnailUrl 等卡片字段 |
| **不采用 entities（Phase 1）** | productions/performances 本身即实体，Phase 2 按需加 |

---

## 二、整体数据模型概览

### 2.1 表清单

| 模块 | 表名 | 用途 | 预估数据量 |
|------|------|------|-----------|
| **导航** | `categories` | 栏目树（导航、路由、面包屑） | ~30 条 |
| **通用** | `tags` | 全站标签（带分组） | ~500 条 |
| **通用** | `media` | 媒体资源（图片/视频/文件 URL） | Phase 1 ~3K，Phase 2 ~15K |
| **通用** | `content_relations` | 跨内容显式关联 | 持续增长 |
| **影视综** | `productions` | 电影/电视剧/综艺 | ~130 条 |
| **演出** | `performances` | 演唱会/舞台/音乐剧 | ~20 条 |
| **演出** | `performance_media` | 演出官摄素材 | ~100 条 |
| **演出** | `fan_shots` | 饭拍投稿 | 持续增长 |
| **活动** | `endorsements` | 广告代言 | ~20 条 |
| **活动** | `interviews` | 访谈 | ~50 条 |
| **资料库** | `albums` | 专辑 | ~25 条 |
| **资料库** | `magazines` | 杂志 | ~50 条 |
| **动态** | `social_posts` | 社交媒体搬运 | ~3000 条 |
| **动态** | `news_articles` | 新闻报道 | ~200 条 |
| **动态** | `sightings` | 路透/踪迹 | 持续增长 |
| **首页** | `timeline_events` | 时间线节点 | ~50 条 |
| **留言** | `guestbook` | 留言板 | 持续增长 |
| **留言** | `comments` | 评论 | 持续增长 |
| **公告** | `announcements` | 网站公告 | ~20 条 |
| **系统** | `admins` | 管理员 | 1-3 条 |

共 20 张表（v1 的 18 张 + categories + content_relations）。

### 2.2 关系总图

```
┌────────────┐
│ categories │ ← 栏目树（导航/路由/面包屑）
│ 栏目导航    │    不做外键约束，通过 slug 对应前端路由
└────────────┘

┌─────────┐
│  tags   │ ← 全站共享标签系统（带 tag_group 分组）
└────┬────┘
     │ 多对多（Prisma 隐式中间表）
     ├── productions
     ├── performances
     ├── social_posts
     ├── news_articles
     ├── sightings
     ├── endorsements
     ├── interviews
     ├── albums
     └── magazines

┌──────────┐
│  media   │ ← 统一媒体资源表
└────┬─────┘
     │ 被多个表通过外键或一对多引用
     ├── productions.poster / gallery
     ├── performances.poster
     ├── albums.cover
     ├── magazines.cover / scans
     ├── social_posts.mediaItems
     ├── fan_shots.mediaItems
     ├── endorsements.media
     ├── sightings.mediaItems
     ├── guestbook.images
     └── performance_media.media

┌────────────────────┐
│ content_relations   │ ← 跨内容显式关联
│                    │
│ sourceType + sourceId ──→ 任意内容表
│ targetType + targetId ──→ 任意内容表
│                    │
│ 例：路透 → 关于某部电影
│ 例：新闻 → 关于某场演唱会
│ 例：微博 → 官宣某部电视剧
└────────────────────┘

┌──────────────────┐
│ timeline_events  │ ← 首页时间线
│                  │
│ relationType + relatedId ──→ 任意内容表
│ 例：指向某部 production
└──────────────────┘

┌──────────────┐     ┌──────────┐
│  guestbook   │────▶│ comments │
│  留言板       │     │ 评论      │
└──────────────┘     └──────────┘

┌──────────────┐     ┌──────────────────┐     ┌────────────┐
│ performances │────▶│ performance_media │     │ fan_shots  │
│ 演出          │     │ 官摄素材          │◀────│ 饭拍投稿    │
└──────────────┘     └──────────────────┘     └────────────┘
```

---

## 三、各表详细设计

### 3.1 `categories` — 栏目树（新增）

**用途**：存网站的树状栏目结构。前端导航栏、面包屑、栏目列表页从这里读取。不与内容表做外键，通过 `slug` 和前端路由对应。

```
categories
├── id            字符串主键 (cuid)
├── parentId      父栏目 ID（一级栏目为 null）  → categories.id
├── name          栏目中文名                    例："动态"、"社交媒体"、"电影"
├── slug          URL 标识（唯一）              例："updates"、"social-media"、"movie"
├── path          完整路径                      例："/updates/social-media"
├── level         层级（1 = 一级，2 = 二级）
├── sortOrder     排序权重
├── description   栏目描述（可选）
├── templateKey   默认列表模板（可选）           例："card_grid"、"timeline_list"
├── isVisible     是否在前台导航中显示
├── createdAt     创建时间
└── updatedAt     更新时间
```

**索引**：
- `slug` 唯一索引
- `parentId` 索引

**为什么 categories 不与内容表做外键？**

因为采用多表方案，每张表（productions、social_posts 等）本身就对应一个栏目。路由映射关系如下：

| categories.slug | 对应的内容表 | 前端路由 |
|----------------|------------|---------|
| `updates` | — | `/updates` |
| `social-media` | `social_posts` | `/updates/social-media` |
| `news` | `news_articles` | `/updates/news` |
| `sighting` | `sightings` | `/updates/sighting` |
| `screens` | — | `/screens` |
| `movie` | `productions` (type=MOVIE) | `/screens/movie` |
| `tv-series` | `productions` (type=TV_SERIES) | `/screens/tv-series` |
| `variety-show` | `productions` (type=VARIETY_SHOW) | `/screens/variety-show` |
| `performances` | — | `/performances` |
| `concert` | `performances` (type=CONCERT) | `/performances/concert` |
| `stage` | `performances` (type=STAGE) | `/performances/stage` |
| `musical` | `performances` (type=MUSICAL) | `/performances/musical` |
| `activities` | — | `/activities` |
| `endorsement` | `endorsements` | `/activities/endorsement` |
| `interview` | `interviews` | `/activities/interview` |
| `archives` | — | `/archives` |
| `album` | `albums` | `/archives/album` |
| `magazine` | `magazines` | `/archives/magazine` |
| `messages` | `guestbook` | `/messages` |
| `announcements` | `announcements` | `/announcements` |

前端代码根据 `categories` 表生成导航菜单，根据 `slug` 决定查哪张内容表。

**示例数据**：

```
id = "cat_01"  name = "动态"      slug = "updates"       path = "/updates"              level = 1  parentId = null
id = "cat_02"  name = "社交媒体"  slug = "social-media"  path = "/updates/social-media"  level = 2  parentId = "cat_01"
id = "cat_03"  name = "新闻报道"  slug = "news"          path = "/updates/news"          level = 2  parentId = "cat_01"
id = "cat_04"  name = "路透"      slug = "sighting"      path = "/updates/sighting"      level = 2  parentId = "cat_01"
id = "cat_05"  name = "影视"      slug = "screens"       path = "/screens"               level = 1  parentId = null
id = "cat_06"  name = "电影"      slug = "movie"         path = "/screens/movie"          level = 2  parentId = "cat_05"
id = "cat_07"  name = "电视剧"    slug = "tv-series"     path = "/screens/tv-series"      level = 2  parentId = "cat_05"
id = "cat_08"  name = "综艺"      slug = "variety-show"  path = "/screens/variety-show"   level = 2  parentId = "cat_05"
...
```

---

### 3.2 `tags` — 全站标签（增强）

**v2 变更**：新增 `tagGroup` 字段，支持标签分组。

```
tags
├── id          字符串主键 (cuid)
├── name        标签名（唯一）       例："射雕英雄传"、"粤语"、"机场"
├── slug        URL 友好标识（唯一）  例："the-legend-of-the-condor-heroes"
├── tagGroup    标签分组（可选）      例："platform"、"region"、"language"
└── createdAt   创建时间
```

**推荐 `tagGroup` 值**：

| tagGroup | 说明 | 标签举例 |
|----------|------|---------|
| `platform` | 平台 | 微博、小红书、抖音、Instagram |
| `region` | 地区 | 内地、香港、台湾、海外 |
| `language` | 语言 | 粤语、普通话、英语 |
| `sighting_scene` | 路透场景 | 机场、片场、偶遇、商场 |
| `capture_type` | 拍摄类型 | 官摄、饭拍、路透 |
| `concert_series` | 演唱会系列 | Crazy Hours、我是外星人 |
| `interview_format` | 访谈形式 | 图文、音频、视频 |
| `work` | 作品名 | 射雕英雄传、峰爆、披荆斩棘 |
| `person` | 人物 | （合作演员/导演等，Phase 2 可升级为 entities 表） |
| `general` | 通用 | 推荐、经典、待整理 |

**为什么用 `tagGroup` 而不是 `tag_type`**：

`tagGroup` 是展示分组，不是硬分类。同一个标签可能在不同场景下有不同理解，分组只是为了后台管理方便、前端筛选器按组展示。不需要太严格。

**索引**：
- `name` 唯一索引
- `slug` 唯一索引
- `tagGroup` 索引

**关联方式**：与所有内容表都是多对多关系，Prisma 隐式中间表自动生成。

---

### 3.3 `media` — 统一媒体资源（增强）

**v2 变更**：新增 `thumbnailUrl` 字段。

```
media
├── id            字符串主键 (cuid)
├── type          枚举：IMAGE / VIDEO / AUDIO / FILE
├── url           存储 URL（R2/OSS 地址）
├── thumbnailUrl  缩略图/视频封面 URL（可选）
├── filename      原始文件名
├── mimeType      MIME 类型（image/jpeg, video/mp4 等）
├── size          文件大小（字节）
├── width         图片/视频宽度（像素）
├── height        图片/视频高度（像素）
├── duration      音视频时长（秒）
├── alt           替代文本（无障碍 + SEO）
├── caption       图片说明
└── createdAt     创建时间
```

与 v1 完全一致，仅增加 `thumbnailUrl`。其余设计说明见 v1 第 4.2 节。

---

### 3.4 `content_relations` — 跨内容关联（新增）

**用途**：显式记录两个内容之间的关系。替代 v1 中纯靠标签匹配做"相关内容"的方式。

标签回答"这个内容有什么特征"，`content_relations` 回答"这个内容和另一个内容有什么关系"。

```
content_relations
├── id                字符串主键 (cuid)
├── sourceType        来源内容的表名        例："social_post"、"sighting"、"news_article"
├── sourceId          来源内容的 ID
├── targetType        目标内容的表名        例："production"、"performance"
├── targetId          目标内容的 ID
├── relationType      关系类型              例："about"、"sighting_of"、"official_of"
├── note              关系说明（可选）      例："该路透属于电影《xxx》拍摄现场"
├── sortOrder         排序权重
└── createdAt         创建时间
```

**设计说明**：

- 使用 `sourceType` + `sourceId` / `targetType` + `targetId` 多态引用，因为关联的两端可能是不同的表
- 不用外键约束（多态引用无法做外键），由应用层保证数据一致性
- 关联是有方向的：source → target。例如"路透 → 关于电影"，source 是路透，target 是电影
- 同一对内容可以有多种关系（如某条微博既是某电影的官宣，又提到了某位演员的作品）

**推荐 `relationType` 值**：

| relationType | 说明 | 典型场景 |
|-------------|------|---------|
| `about` | 关于 | 新闻关于某部电影 |
| `official_of` | 官方内容属于 | 官宣微博属于某部电视剧 |
| `sighting_of` | 路透关于 | 片场路透关于某部电影 |
| `fan_capture_of` | 饭拍属于 | 饭拍视频属于某场演唱会 |
| `interview_about` | 访谈关于 | 专访讨论某部作品 |
| `news_about` | 新闻关于 | 报道关于某场演出 |
| `endorsement_of` | 代言相关 | 微博代言内容关于某品牌 |
| `related_to` | 泛关联 | 兜底关系类型 |
| `follow_up_of` | 后续内容 | 后续报道关于之前的新闻 |

**推荐 `sourceType` / `targetType` 值**：

```
production        → productions 表
performance       → performances 表
social_post       → social_posts 表
news_article      → news_articles 表
sighting          → sightings 表
endorsement       → endorsements 表
interview         → interviews 表
album             → albums 表
magazine          → magazines 表
fan_shot          → fan_shots 表
```

**索引**：
- `(sourceType, sourceId)` 联合索引：查某个内容的所有关联
- `(targetType, targetId)` 联合索引：查某个内容被哪些内容引用
- `relationType` 索引

**使用场景**：

```
场景 1：电影详情页展示"相关资讯"

  查出所有 targetType = "production" AND targetId = "这部电影的id" 的记录
  → 得到关联的路透、微博、新闻、访谈
  → 按 relationType 分组展示

场景 2：一条路透的详情页，展示"相关作品"

  查出所有 sourceType = "sighting" AND sourceId = "这条路透的id" 的记录
  → 得到关联的电影/电视剧
  → 展示为"相关作品"卡片

场景 3：后台录入新路透时，选择"关于哪部作品"

  管理员从 productions 列表选择一部电影
  → 插入一条 content_relations 记录
  → sourceType = "sighting", sourceId = 路透id
  → targetType = "production", targetId = 电影id
  → relationType = "sighting_of"
```

**与标签系统的分工**：

| 需求 | 用标签 | 用 content_relations |
|------|--------|---------------------|
| "查所有粤语内容" | ✅ 标签 `粤语` | ❌ |
| "查所有 2024 年内容" | ✅ 标签 `2024` | ❌ |
| "查某部电影的所有路透" | ❌ 不够精确 | ✅ `sighting_of → production` |
| "查某场演唱会的所有饭拍" | ❌ 不够精确 | ✅ `fan_capture_of → performance` |
| "查某条微博官宣了哪部电视剧" | ❌ | ✅ `official_of → production` |
| "查相关内容（模糊推荐）" | ✅ 共同标签越多越相关 | ✅ 显式关联更精确 |

两者互补：标签做模糊筛选和推荐，content_relations 做精确关联。

---

### 3.5 `productions` — 影视综作品

与 v1 第 4.3 节完全一致，不做改动。

```
productions
├── id            字符串主键 (cuid)
├── type          枚举：MOVIE / TV_SERIES / VARIETY_SHOW
├── slug          URL 标识（唯一）
├── title         中文名
├── titleEn       英文名（可选）
├── year          年份
├── role          饰演角色（可选）
├── synopsis      简介（可选）
│
├── posterId      → media.id（一对一，海报图）
├── gallery       → media[]（一对多，剧照/截图）
│
├── watchLinks    JSON 数组  [{"platform":"腾讯视频","url":"..."}]
│
├── varietyRegion  综艺地区（可选）
├── varietyRole    综艺角色（可选）
├── language       语言（可选）
│
├── tags          → tags[]（多对多）
├── sortOrder     排序权重
├── isVisible     是否展示
├── createdAt     创建时间
└── updatedAt     更新时间
```

**v2 补充说明**：productions 在 `content_relations` 中作为 `targetType = "production"`，可以被路透、微博、新闻、访谈等关联。详情页的"相关资讯"优先从 `content_relations` 查，再用标签补充。

---

### 3.6 `performances` — 演出

与 v1 第 4.4 节完全一致，不做改动。

```
performances
├── id          字符串主键 (cuid)
├── type        枚举：CONCERT / STAGE / MUSICAL
├── slug        URL 标识（唯一）
├── title       演出名
├── titleEn     英文名（可选）
├── year        年份
├── venue       场馆（可选）
├── city        城市（可选）
├── series      系列名（可选）
│
├── posterId    → media.id（一对一，海报）
├── setlist     JSON 数组  ["歌名1", "歌名2"]
│
├── officialMedia → performance_media[]（一对多）
├── fanShots      → fan_shots[]（一对多）
│
├── tags        → tags[]（多对多）
├── sortOrder   排序权重
├── isVisible   是否展示
├── createdAt   创建时间
└── updatedAt   更新时间
```

**子表 `performance_media`**、**`fan_shots`** 与 v1 完全一致，见 v1 第 4.4 节。

---

### 3.7 `endorsements` — 广告代言

与 v1 第 4.5 节完全一致。

```
endorsements
├── id          字符串主键 (cuid)
├── brand       品牌名
├── role        代言身份
├── category    品类
├── startYear   开始年份
├── endYear     结束年份（可选）
│
├── media       → media[]（一对多）
├── tags        → tags[]（多对多）
│
├── isVisible   是否展示
├── createdAt   创建时间
└── updatedAt   更新时间
```

---

### 3.8 `interviews` — 访谈

与 v1 第 4.6 节完全一致。

```
interviews
├── id                    字符串主键 (cuid)
├── slug                  URL 标识（唯一）
├── title                 访谈标题
├── source                来源媒体
├── date                  访谈日期
├── mediaType             原始形态（video / audio / text）
│
├── originalUrl           原始链接（可选）
├── originalMediaId       → media.id（一对一）
│
├── transcriptCantonese   粤语文字稿（可选）
├── transcriptMandarin    国语翻译（可选）
├── proofreadStatus       枚举：PENDING / PROOFREAD
│
├── tags        → tags[]（多对多）
├── isVisible   是否展示
├── createdAt   创建时间
└── updatedAt   更新时间
```

---

### 3.9 `albums` — 专辑

与 v1 第 4.7 节完全一致。

```
albums
├── id              字符串主键 (cuid)
├── slug            URL 标识（唯一）
├── title           专辑名
├── releaseYear     发行年份
├── language        语言
│
├── coverId         → media.id（一对一，封面图）
│
├── tracks          JSON 数组  [{"number":1,"title":"歌名","duration":"4:32","lyrics":"..."}]
├── streamingLinks  JSON 对象  {"spotify":"...","appleMusic":"...","qqMusic":"..."}
│
├── tags          → tags[]（多对多）
├── sortOrder     排序权重
├── isVisible     是否展示
├── createdAt     创建时间
└── updatedAt     更新时间
```

---

### 3.10 `magazines` — 杂志

与 v1 第 4.8 节完全一致。

```
magazines
├── id          字符串主键 (cuid)
├── title       杂志名
├── issue       期号（可选）
├── date        出版日期
│
├── coverId     → media.id（一对一，封面图）
├── scans       → media[]（一对多，扫描件内页）
│
├── tags        → tags[]（多对多）
├── isVisible   是否展示
├── createdAt   创建时间
└── updatedAt   更新时间
```

---

### 3.11 `social_posts` — 社交媒体动态

与 v1 第 4.9 节完全一致。

```
social_posts
├── id            字符串主键 (cuid)
├── platform      枚举：WEIBO / INSTAGRAM / DOUYIN / XIAOHONGSHU / FACEBOOK
│
│  ── Phase 1（链接优先）──
├── originalUrl   原始链接（必填）
├── originalId    原平台帖子 ID（可选，去重用）
├── title         标题
├── summary       概要
├── thumbnailUrl  封面图 URL
├── publishedAt   原始发布时间
│
│  ── Phase 2（回填完整内容）──
├── contentText   完整文字内容
├── mediaItems    → media[]（一对多）
├── isFullCopy    是否已回填完整内容
│
├── tags          → tags[]（多对多）
├── importMethod  枚举：LINK_PARSE / CRAWLER / MANUAL
├── createdAt     创建时间
└── updatedAt     更新时间
```

**索引**：`(platform, originalId)` 联合唯一、`platform`、`publishedAt DESC`

---

### 3.12 `news_articles` — 新闻报道

与 v1 第 4.10 节完全一致。

```
news_articles
├── id            字符串主键 (cuid)
├── originalUrl   新闻链接（必填）
├── title         标题
├── summary       概要（可选）
├── source        来源媒体（可选）
├── thumbnailUrl  封面图（可选）
├── publishedAt   发布时间（可选）
│
├── contentText   完整内容（可选，回填）
├── isFullCopy    是否有完整内容
│
├── tags          → tags[]（多对多）
├── createdAt     创建时间
└── updatedAt     更新时间
```

---

### 3.13 `sightings` — 路透/踪迹

与 v1 第 4.11 节完全一致。

```
sightings
├── id            字符串主键 (cuid)
├── originalUrl   投稿链接（可选）
├── title         标题
├── summary       概要（可选）
├── thumbnailUrl  封面图（可选）
├── locationTag   位置标签
│
├── content       完整描述（可选）
├── mediaItems    → media[]（一对多）
├── isFullCopy    是否有完整内容
│
├── authorName    投稿人昵称
├── submitType    枚举：LINK / UPLOAD / MIXED
├── status        枚举：PENDING / APPROVED / REJECTED
│
├── tags          → tags[]（多对多）
├── createdAt     创建时间
└── updatedAt     更新时间
```

---

### 3.14 `timeline_events` — 首页时间线（改造）

**v2 变更**：去掉 `linkedType` + `linkedId` 多态引用，改用 `relatedType` + `relatedId`（命名更清晰），并与 `content_relations` 配合。

```
timeline_events
├── id            字符串主键 (cuid)
├── date          事件日期
├── title         标题                例："披荆斩棘 2025 开播"
├── description   描述（可选）
│
├── relatedType   关联内容类型（可选）  例："production"、"performance"
├── relatedId     关联内容 ID（可选）
│
├── isVisible     是否显示
├── sortOrder     排序权重
├── createdAt     创建时间
└── updatedAt     更新时间
```

**与 v1 的区别**：

仅改了字段命名（`linkedType` → `relatedType`，`linkedId` → `relatedId`），让语义更清晰。本质机制不变：多态引用，前端根据 `relatedType` 决定跳转目标。

**`relatedType` 取值**与 `content_relations` 的 `sourceType`/`targetType` 一致（见 3.4 节），保证全站多态引用用同一套类型名。

---

### 3.15 `guestbook` — 留言板

与 v1 第 4.13 节完全一致。

```
guestbook
├── id            字符串主键 (cuid)
├── tab           枚举：MESSAGE / STORY / FEEDBACK
├── nickname      昵称
├── content       留言内容
├── images        → media[]（一对多，附图）
│
├── storyTags     字符串数组（故事分享专用）
├── relatedYear   关联年份（可选）
│
├── likesCount    点赞数（默认 0）
├── status        枚举：PENDING / APPROVED / REJECTED
│
├── comments      → comments[]（一对多）
├── createdAt     创建时间
```

---

### 3.16 `comments` — 评论

与 v1 第 4.14 节完全一致。

```
comments
├── id            字符串主键 (cuid)
├── guestbookId   → guestbook.id（外键，级联删除）
├── nickname      昵称
├── content       内容（最长 300 字）
└── createdAt     创建时间
```

---

### 3.17 `announcements` — 公告

与 v1 第 4.15 节完全一致。

```
announcements
├── id            字符串主键 (cuid)
├── type          枚举：NOTICE / RULE / UPDATE
├── title         标题
├── content       内容（富文本）
├── isPinned      是否置顶
├── publishDate   发布日期
├── createdAt     创建时间
└── updatedAt     更新时间
```

---

### 3.18 `admins` — 管理员

与 v1 第 4.16 节完全一致。

```
admins
├── id            字符串主键 (cuid)
├── email         邮箱（唯一）
├── password      密码（bcrypt 哈希）
├── name          显示名
└── createdAt     创建时间
```

---

## 四、跨栏目关联机制（v2 增强）

v1 靠标签做跨栏目关联，v2 增加了 `content_relations` 做精确关联。两者互补。

### 场景 1：电影详情页 — 展示"相关资讯"

```
步骤 1（精确关联）：
  SELECT * FROM content_relations
  WHERE targetType = 'production' AND targetId = '这部电影的id'
  → 得到所有路透、微博、新闻、访谈的 sourceType + sourceId
  → 逐类型查出具体内容

步骤 2（标签补充）：
  查出这部电影的标签 → ["射雕英雄传", "TVB"]
  用标签去其他表查有相同标签的内容（排除步骤 1 已有的）
  → 作为"你可能还感兴趣"补充推荐

前端展示：
  ┌─ 相关资讯（精确关联）─────────────┐
  │  📰 路透：射雕片场路透 2026-05-02  │
  │  📱 微博：官宣海报发布              │
  │  📰 新闻：东方日报专访报道          │
  └──────────────────────────────────┘
  ┌─ 你可能还感兴趣（标签推荐）────────┐
  │  🎬 电视剧：射雕英雄传 1994        │
  │  🎤 访谈：TVB 粤语专访             │
  └──────────────────────────────────┘
```

### 场景 2：后台录入路透时建立关联

```
管理员操作：
  1. 填写路透基本信息（标题、图片、来源等）
  2. 在"关联作品"下拉框选择一部电影
  3. 保存

后端逻辑：
  1. INSERT INTO sightings (...)  → 得到 sightingId
  2. INSERT INTO content_relations (
       sourceType = 'sighting',
       sourceId = sightingId,
       targetType = 'production',
       targetId = 选中的电影id,
       relationType = 'sighting_of'
     )
```

### 场景 3：全站搜索"射雕"

```
步骤 1：搜标签
  SELECT id FROM tags WHERE name LIKE '%射雕%'

步骤 2：搜各表标题
  SELECT 'production' as type, id, title FROM productions WHERE title LIKE '%射雕%'
  UNION ALL
  SELECT 'social_post' as type, id, title FROM social_posts WHERE title LIKE '%射雕%'
  UNION ALL
  SELECT 'news_article' as type, id, title FROM news_articles WHERE title LIKE '%射雕%'
  ... （其他表类似）

步骤 3：合并去重，按相关性排序
```

---

## 五、JSON 字段 vs 独立表的选择标准

与 v1 第六节一致，补充 `content_relations` 的决策：

| 场景 | 选择 | 原因 |
|------|------|------|
| 专辑曲目 `tracks` | **JSON** | 总是跟专辑一起读取，不需要单独查询 |
| 播放链接 `watchLinks` | **JSON** | 结构简单，数量少 |
| 流媒体链接 `streamingLinks` | **JSON** | 同上 |
| 歌单 `setlist` | **JSON** | 总是跟演出一起读取 |
| 标签 `tags` | **独立表 + 多对多** | 需要反向查询，跨栏目筛选 |
| 媒体资源 `media` | **独立表** | 统一管理、可多处引用 |
| 评论 `comments` | **独立表** | 需要分页查询、审核管理 |
| 内容关联 `content_relations` | **独立表** | 需要双向查询、按关系类型筛选 |
| 栏目 `categories` | **独立表** | 需要层级查询、动态管理导航 |

---

## 六、与 GPT 统一模型方案的对比结论

| 维度 | v2（多表专用 + 增强） | GPT（统一 content_items） |
|------|---------------------|--------------------------|
| **类型安全** | ✅ Prisma 强类型，每张表字段明确 | ❌ 通用字段 + JSON metadata，需手动断言 |
| **查询复杂度** | ✅ `WHERE year = 2024 AND language = '粤语'` | ❌ JOIN content_blocks 解析 |
| **新增栏目** | 需加表 + 改 schema | ✅ 只需加 categories 行 |
| **跨栏目查询** | 需 UNION 多表（通过标签 + content_relations 缓解） | ✅ 单表 WHERE |
| **字段差异大的内容** | ✅ 各表专属字段，无空字段浪费 | ❌ 通用字段装不下，要塞 blocks/JSON |
| **后台管理** | 每种内容一套表单（但字段精确） | ✅ 统一 CRUD（但字段模糊） |
| **适合场景** | 内容类型固定、字段差异大、管理员少 | 内容类型多变、CMS 平台型产品 |

**结论**：本项目内容类型固定（影视/演出/专辑/访谈/代言各自字段差异极大）、管理员只有 1 人、不需要 CMS 级灵活性。v2 多表方案更合适。

---

## 七、后续可扩展方向

| 功能 | 扩展方式 |
|------|---------|
| **entities 实体表** | Phase 2 新增 `entities` + `content_entities` 表，把人物/品牌/地点升级为独立实体页面 |
| **评论挂在路透/饭拍下** | `comments` 加 `targetType` + `targetId` 多态引用 |
| **用户系统** | 新增 `users` 表，guestbook/comments/fan_shots 加 `userId` |
| **多语言** | 内容字段加 `_zh` `_en` 后缀，或独立 `translations` 表 |
| **全文搜索** | PostgreSQL `tsvector` 或 Meilisearch |
| **内容版本历史** | 新增 `content_versions` 表 |
| **定时发布** | 各表加 `scheduledAt` 字段 |

---

## 八、v2 总结

| 决策 | 方案 |
|------|------|
| 数据库 | PostgreSQL，托管在 Supabase |
| ORM | Prisma 7.8 |
| 表数量 | 20 张表（v1 的 18 张 + categories + content_relations） |
| 核心机制 | 统一标签（模糊筛选）+ content_relations（精确关联）+ 统一媒体表 + 栏目树（导航）+ 渐进增强（链接优先→回填内容） |
| 不采用 | content_items 统一表、content_blocks、content_cards、block_assets、entities（Phase 1） |
| Phase 1 成本 | 完全免费（Supabase 免费额度足够） |

---

> **下一步**：确认 v2 设计方案后，将更新 Prisma schema 文件（`prisma/schema.prisma`）。

---
---
---

# 数据库设计 v3

> 日期：2026-06-05
> 状态：设计讨论中，待确认后实施
> 基于：v2 方案的精炼与实现补全

---

## 一、v2 → v3 变更摘要

| # | 变更 | 原因 |
|---|------|------|
| 1 | **明确 Media 关联机制** | v2 写了"一对多"但未说明 Prisma 如何实现。v3 明确：单引用用直接 FK，集合用 Prisma 隐式多对多 |
| 2 | **`comments` 改为多态** | 从仅绑 guestbook → `targetType + targetId`，支持挂在路透/饭拍/留言下，无需后续改 schema |
| 3 | **去掉 `sightings.locationTag`** | 改用 tags 表 `tagGroup = 'sighting_scene'`，避免标签系统和独立字段的冗余 |
| 4 | **补齐缺失字段** | endorsements 加 `slug`/`description`；sightings 加 `slug`/`sightedAt`；news_articles 加 `slug`；interviews 加 `summary` |
| 5 | **统一 `updatedAt`** | 所有表统一加 `createdAt` + `updatedAt`（updatedAt 自动更新） |
| 6 | **明确所有 Prisma 枚举** | 列出所有 `enum` 定义，可直接写入 schema |
| 7 | **补充索引策略** | 每张表注明推荐索引 |
| 8 | **`categories` 精简** | 去掉 `templateKey`（前端路由代码控制模板，不需要存数据库） |

**未改动的部分**：tags（含 tagGroup）、content_relations、timeline_events、categories 核心结构、所有内容表的业务字段、JSON vs 独立表决策 — 这些在 v2 中已经设计到位。

---

## 二、枚举定义

在 Prisma schema 中预定义以下枚举。集中列出方便查阅：

```prisma
enum ProductionType {
  MOVIE
  TV_SERIES
  VARIETY_SHOW
}

enum PerformanceType {
  CONCERT
  STAGE
  MUSICAL
}

enum MediaType {
  IMAGE
  VIDEO
  AUDIO
  FILE
}

enum Platform {
  WEIBO
  INSTAGRAM
  DOUYIN
  XIAOHONGSHU
  FACEBOOK
}

enum ImportMethod {
  LINK_PARSE
  CRAWLER
  MANUAL
}

enum SubmitType {
  LINK
  UPLOAD
  MIXED
}

enum ModerationStatus {
  PENDING
  APPROVED
  REJECTED
}

enum ProofreadStatus {
  PENDING
  PROOFREAD
}

enum AnnouncementType {
  NOTICE
  RULE
  UPDATE
}

enum GuestbookTab {
  MESSAGE
  STORY
  FEEDBACK
}
```

**说明**：
- `ModerationStatus` 统一用于所有需要审核的表（fan_shots、sightings、guestbook），不再每张表单独声明枚举
- `SubmitType` 统一用于用户投稿类表（fan_shots、sightings）

---

## 三、整体数据模型

### 3.1 表清单（20 张）

| 模块 | 表名 | 用途 | v3 变更 |
|------|------|------|---------|
| 导航 | `categories` | 栏目树 | 去掉 templateKey |
| 通用 | `tags` | 全站标签 | 不变 |
| 通用 | `media` | 媒体资源 | 不变 |
| 通用 | `content_relations` | 跨内容关联 | 不变 |
| 影视 | `productions` | 电影/电视剧/综艺 | 不变 |
| 演出 | `performances` | 演唱会/舞台/音乐剧 | 不变 |
| 演出 | `performance_media` | 官摄素材 | 不变 |
| 演出 | `fan_shots` | 饭拍投稿 | 不变 |
| 活动 | `endorsements` | 广告代言 | 加 slug/description |
| 活动 | `interviews` | 访谈 | 加 summary |
| 资料 | `albums` | 专辑 | 不变 |
| 资料 | `magazines` | 杂志 | 不变 |
| 动态 | `social_posts` | 社交媒体 | 不变 |
| 动态 | `news_articles` | 新闻报道 | 加 slug |
| 动态 | `sightings` | 路透/踪迹 | 加 slug/sightedAt，去 locationTag |
| 首页 | `timeline_events` | 时间线 | 不变 |
| 留言 | `guestbook` | 留言板 | 不变 |
| 留言 | `comments` | 评论 | **改为多态** |
| 公告 | `announcements` | 公告 | 不变 |
| 系统 | `admins` | 管理员 | 不变 |

### 3.2 关系总图

```
┌────────────┐
│ categories │  栏目树（self-join: parentId → id）
└────────────┘

┌─────────┐
│  tags   │  全站标签（多对多连接 9 张内容表）
└────┬────┘
     │ Prisma 隐式多对多（自动生成 _XxxTags 中间表）
     ├── productions       ├── endorsements
     ├── performances      ├── interviews
     ├── social_posts      ├── albums
     ├── news_articles     └── magazines
     └── sightings

┌──────────┐
│  media   │  统一媒体资源
└────┬─────┘
     │
     ├─ 直接 FK（单引用）─────────────────────────────
     │   productions.posterId ──→ media.id
     │   performances.posterId ──→ media.id
     │   albums.coverId ──→ media.id
     │   magazines.coverId ──→ media.id
     │   interviews.originalMediaId ──→ media.id
     │   performance_media.mediaId ──→ media.id
     │
     └─ Prisma 隐式多对多（集合引用）──────────────────
         productions.gallery ↔ media[]       (_MediaToProduction)
         social_posts.mediaItems ↔ media[]   (_MediaToSocialPost)
         fan_shots.mediaItems ↔ media[]      (_FanShotToMedia)
         endorsements.media ↔ media[]        (_EndorsementToMedia)
         sightings.mediaItems ↔ media[]      (_MediaToSighting)
         guestbook.images ↔ media[]          (_GuestbookToMedia)
         magazines.scans ↔ media[]           (_MagazineScans)

┌────────────────────┐
│ content_relations  │  跨内容关联（多态：sourceType/Id → targetType/Id）
└────────────────────┘

┌──────────────────┐
│ timeline_events  │  首页时间线（多态：relatedType/Id）
└──────────────────┘

┌──────────┐      ┌──────────┐
│ comments │ ←──  │ guestbook│   comments 多态挂载（targetType + targetId）
│ 可挂在:  │      └──────────┘   也可挂在 sightings、fan_shots 下
│ guestbook│
│ sighting │
│ fan_shot │
└──────────┘

┌──────────────┐     ┌──────────────────┐     ┌────────────┐
│ performances │────▶│ performance_media │     │  fan_shots │
│              │     │ （外键直接关联）    │     │（外键直接） │
└──────────────┘     └──────────────────┘     └────────────┘
       │                                            │
       └──────────── performanceId ←────────────────┘
```

---

## 四、Media 关联策略（v3 核心补全）

这是 v2 最大的实现空白。v3 明确两种关联模式：

### 模式 A：直接 FK（单引用）

用于"一个实体有且仅有一个 media 引用"的场景。

```prisma
model Production {
  posterId  String? @map("poster_id")
  poster    Media?  @relation("ProductionPoster", fields: [posterId], references: [id])
}
```

| 场景 | 字段 | 关系名 |
|------|------|--------|
| 作品海报 | `productions.posterId` | `ProductionPoster` |
| 演出海报 | `performances.posterId` | `PerformancePoster` |
| 专辑封面 | `albums.coverId` | `AlbumCover` |
| 杂志封面 | `magazines.coverId` | `MagazineCover` |
| 访谈原始媒体 | `interviews.originalMediaId` | `InterviewOriginalMedia` |
| 官摄素材 | `performance_media.mediaId` | `PerformanceMediaFile` |

### 模式 B：Prisma 隐式多对多（集合引用）

用于"一个实体关联多个 media"的场景。Prisma 会自动生成中间表。

```prisma
model Production {
  gallery  Media[] @relation("ProductionGallery")
}

model Media {
  productionGalleries  Production[] @relation("ProductionGallery")
}
```

| 场景 | 关系名 | 自动生成中间表 |
|------|--------|--------------|
| 作品图册 | `ProductionGallery` | `_ProductionGallery` |
| 社交媒体图片/视频 | `SocialPostMedia` | `_SocialPostMedia` |
| 饭拍素材 | `FanShotMedia` | `_FanShotMedia` |
| 代言素材 | `EndorsementMedia` | `_EndorsementMedia` |
| 路透图片/视频 | `SightingMedia` | `_SightingMedia` |
| 留言附图 | `GuestbookImages` | `_GuestbookImages` |
| 杂志扫描件 | `MagazineScans` | `_MagazineScans` |

### 为什么用多对多而不是一对多？

一对多要求 media 表持有父表的 FK（如 `productionId`），但 media 的父表有 7 种以上 → 需要 7 个 nullable FK 列 → 难看且不可扩展。

多对多通过中间表解耦，且允许同一个 media 被多处引用（例如：一张海报既是 production 的 poster，又出现在某条微博的 mediaItems 中）。

### 同一 Media 上的多种关系

一个 Media 记录可以同时：
- 被 `productions.posterId` 直接 FK 引用（作为海报）
- 被 `_SocialPostMedia` 中间表引用（出现在某条微博中）

两种引用独立存在，互不冲突。Prisma 完全支持这种模式。

---

## 五、各表详细设计

以下用 Prisma 伪代码格式描述每张表。字段说明中标注 **[v3 新增]** 的是 v2 中没有的字段。

### 5.1 `categories` — 栏目树

```
categories
├── id            String     @id @default(cuid())
├── parentId      String?    → categories.id（自关联，一级栏目为 null）
├── name          String     栏目中文名         "动态"、"电影"
├── slug          String     @unique  URL 标识  "updates"、"movie"
├── path          String     完整路径（冗余）    "/updates/social-media"
├── level         Int        层级 1=一级 2=二级
├── sortOrder     Int        @default(0)
├── description   String?    栏目描述
├── isVisible     Boolean    @default(true)
├── createdAt     DateTime   @default(now())
└── updatedAt     DateTime   @updatedAt
```

**v3 变更**：去掉 `templateKey`。前端根据 `slug` 在代码中决定使用哪种模板（card_grid / timeline_list 等），不需要存数据库。

**索引**：`slug` 唯一，`parentId`

**栏目-内容表映射**与 v2 完全一致（见 v2 第 3.1 节的映射表）。

---

### 5.2 `tags` — 全站标签

```
tags
├── id          String     @id @default(cuid())
├── name        String     @unique   标签名     "射雕英雄传"、"粤语"
├── slug        String     @unique   URL 标识   "the-legend-of-the-condor-heroes"
├── tagGroup    String?    标签分组             "platform"、"language"、"work"
└── createdAt   DateTime   @default(now())
```

不变。`tagGroup` 推荐值见 v2 第 3.2 节。

**多对多关联**：与 productions、performances、social_posts、news_articles、sightings、endorsements、interviews、albums、magazines 共 9 张表，Prisma 自动生成 9 个中间表。

**索引**：`name` 唯一，`slug` 唯一，`tagGroup`

---

### 5.3 `media` — 统一媒体资源

```
media
├── id            String     @id @default(cuid())
├── type          MediaType  枚举：IMAGE / VIDEO / AUDIO / FILE
├── url           String     存储 URL（R2/Supabase Storage）
├── thumbnailUrl  String?    缩略图/视频封面 URL
├── filename      String?    原始文件名
├── mimeType      String?    MIME 类型
├── size          Int?       文件大小（字节）
├── width         Int?       宽度（像素）
├── height        Int?       高度（像素）
├── duration      Float?     音视频时长（秒）
├── alt           String?    替代文本
├── caption       String?    说明文字
├── createdAt     DateTime   @default(now())
│
│  ── 反向关系（Prisma 需要声明）──
├── posterOfProductions     Production[]       @relation("ProductionPoster")
├── posterOfPerformances    Performance[]      @relation("PerformancePoster")
├── coverOfAlbums           Album[]            @relation("AlbumCover")
├── coverOfMagazines        Magazine[]         @relation("MagazineCover")
├── originalOfInterviews    Interview[]        @relation("InterviewOriginalMedia")
├── performanceMediaFiles   PerformanceMedia[] @relation("PerformanceMediaFile")
│
├── productionGalleries     Production[]       @relation("ProductionGallery")
├── socialPosts             SocialPost[]       @relation("SocialPostMedia")
├── fanShots                FanShot[]          @relation("FanShotMedia")
├── endorsements            Endorsement[]      @relation("EndorsementMedia")
├── sightings               Sighting[]         @relation("SightingMedia")
├── guestbooks              Guestbook[]        @relation("GuestbookImages")
└── magazineScans           Magazine[]         @relation("MagazineScans")
```

**说明**：反向关系字段不产生数据库列，只是 Prisma 的类型系统需要。实际存储由 FK 和中间表完成。

---

### 5.4 `content_relations` — 跨内容关联

```
content_relations
├── id            String     @id @default(cuid())
├── sourceType    String     来源表标识    "social_post"、"sighting"
├── sourceId      String     来源记录 ID
├── targetType    String     目标表标识    "production"、"performance"
├── targetId      String     目标记录 ID
├── relationType  String     关系类型      "about"、"sighting_of"
├── note          String?    关系说明
├── sortOrder     Int        @default(0)
└── createdAt     DateTime   @default(now())
```

不变。多态引用，无 FK 约束，应用层保证一致性。

`relationType` 推荐值、`sourceType`/`targetType` 允许值、使用场景与 v2 第 3.4 节完全一致。

**索引**：`(sourceType, sourceId)` 联合，`(targetType, targetId)` 联合，`relationType`

---

### 5.5 `productions` — 影视综作品

```
productions
├── id            String          @id @default(cuid())
├── type          ProductionType  枚举：MOVIE / TV_SERIES / VARIETY_SHOW
├── slug          String          @unique  URL 标识
├── title         String          中文名              "射雕英雄传"
├── titleEn       String?         英文名              "The Legend of the Condor Heroes"
├── year          Int             年份                 1994
├── role          String?         饰演角色             "郭靖"
├── synopsis      String?         简介
│
├── posterId      String?         → media.id（海报，直接 FK）
├── gallery       Media[]         @relation("ProductionGallery")（多对多）
│
├── watchLinks    Json?           [{"platform":"腾讯视频","url":"..."}]
│
├── varietyRegion  String?        综艺地区    "内地" / "香港"
├── varietyRole    String?        综艺角色    "常驻" / "飞行"
├── language       String?        语言        "粤语" / "普通话"
│
├── tags          Tag[]           多对多
├── sortOrder     Int             @default(0)
├── isVisible     Boolean         @default(true)
├── createdAt     DateTime        @default(now())
└── updatedAt     DateTime        @updatedAt
```

不变。

**索引**：`slug` 唯一，`type`，`year`

---

### 5.6 `performances` — 演出

```
performances
├── id          String           @id @default(cuid())
├── type        PerformanceType  枚举：CONCERT / STAGE / MUSICAL
├── slug        String           @unique
├── title       String           "Crazy Hours Live"
├── titleEn     String?
├── year        Int
├── venue       String?          场馆    "香港红磡体育馆"
├── city        String?          城市    "香港"
├── series      String?          系列名  "Crazy Hours"
│
├── posterId    String?          → media.id（海报）
├── setlist     Json?            ["歌名1", "歌名2"]
│
├── officialMedia  PerformanceMedia[]   一对多
├── fanShots       FanShot[]            一对多
│
├── tags        Tag[]            多对多
├── sortOrder   Int              @default(0)
├── isVisible   Boolean          @default(true)
├── createdAt   DateTime         @default(now())
└── updatedAt   DateTime         @updatedAt
```

不变。

---

### 5.7 `performance_media` — 官摄素材

```
performance_media
├── id              String    @id @default(cuid())
├── performanceId   String    → performances.id（级联删除）
├── title           String?   "官方全场视频"
├── mediaId         String    → media.id（直接 FK）
├── sortOrder       Int       @default(0)
├── createdAt       DateTime  @default(now())
└── updatedAt       DateTime  @updatedAt
```

不变。

---

### 5.8 `fan_shots` — 饭拍投稿

```
fan_shots
├── id              String            @id @default(cuid())
├── performanceId   String            → performances.id（级联删除）
│
├── originalUrl     String?           投稿链接
├── title           String?
├── summary         String?
├── thumbnailUrl    String?           封面图
│
├── mediaItems      Media[]           @relation("FanShotMedia")（多对多）
├── isFullCopy      Boolean           @default(false)
│
├── authorName      String            投稿人昵称
├── contactInfo     String?           联系方式（仅后台）
├── submitType      SubmitType        @default(LINK)
├── status          ModerationStatus  @default(PENDING)
│
├── createdAt       DateTime          @default(now())
└── updatedAt       DateTime          @updatedAt
```

不变（仅枚举名改为共享的 `ModerationStatus` / `SubmitType`）。

---

### 5.9 `endorsements` — 广告代言

```
endorsements
├── id          String    @id @default(cuid())
├── slug        String    @unique  [v3 新增] URL 标识   "maxims-mooncake"
├── brand       String    品牌名                        "香港美心"
├── role        String?   代言身份                      "代言人"
├── category    String?   品类                          "餐饮"
├── description String?   [v3 新增] 简要描述
├── startYear   Int       开始年份
├── endYear     Int?      结束年份（null = 仍在合作）
│
├── media       Media[]   @relation("EndorsementMedia")（多对多）
├── tags        Tag[]     多对多
│
├── isVisible   Boolean   @default(true)
├── createdAt   DateTime  @default(now())
└── updatedAt   DateTime  @updatedAt
```

**v3 变更**：加 `slug`（URL 生成）、`description`（卡片展示）。

---

### 5.10 `interviews` — 访谈

```
interviews
├── id                    String          @id @default(cuid())
├── slug                  String          @unique
├── title                 String          "XXX 专访·2024"
├── summary               String?         [v3 新增] 概要（卡片展示用）
├── source                String?         来源媒体     "TVB 娱乐新闻"
├── date                  DateTime        访谈日期
├── mediaType             String          原始形态     "video" / "audio" / "text"
│
├── originalUrl           String?         原始链接
├── originalMediaId       String?         → media.id（上传的原始音视频）
│
├── transcriptCantonese   String?         粤语文字稿（TEXT）
├── transcriptMandarin    String?         国语翻译（TEXT）
├── proofreadStatus       ProofreadStatus @default(PENDING)
│
├── tags        Tag[]     多对多
├── isVisible   Boolean   @default(true)
├── createdAt   DateTime  @default(now())
└── updatedAt   DateTime  @updatedAt
```

**v3 变更**：加 `summary`。

---

### 5.11 `albums` — 专辑

```
albums
├── id            String    @id @default(cuid())
├── slug          String    @unique
├── title         String    专辑名
├── releaseYear   Int       发行年份
├── language      String?   "粤语" / "国语" / "粤语+国语"
│
├── coverId       String?   → media.id（封面图）
│
├── tracks        Json?     [{"number":1,"title":"现代爱情故事","duration":"4:32","lyrics":"..."}]
├── streamingLinks Json?    {"spotify":"...","appleMusic":"...","qqMusic":"..."}
│
├── tags          Tag[]     多对多
├── sortOrder     Int       @default(0)
├── isVisible     Boolean   @default(true)
├── createdAt     DateTime  @default(now())
└── updatedAt     DateTime  @updatedAt
```

不变。

---

### 5.12 `magazines` — 杂志

```
magazines
├── id          String    @id @default(cuid())
├── title       String    杂志名       "ELLE"
├── issue       String?   期号         "2021年3月刊"
├── date        DateTime  出版日期
│
├── coverId     String?   → media.id（封面图，直接 FK）
├── scans       Media[]   @relation("MagazineScans")（扫描件，多对多）
│
├── tags        Tag[]     多对多
├── isVisible   Boolean   @default(true)
├── createdAt   DateTime  @default(now())
└── updatedAt   DateTime  @updatedAt
```

不变。

---

### 5.13 `social_posts` — 社交媒体动态

```
social_posts
├── id            String        @id @default(cuid())
├── platform      Platform      枚举：WEIBO / INSTAGRAM / DOUYIN / XIAOHONGSHU / FACEBOOK
│
│  ── Phase 1（链接优先）──
├── originalUrl   String        原始链接（必填）
├── originalId    String?       原平台帖子 ID（去重用）
├── title         String?       标题
├── summary       String?       概要
├── thumbnailUrl  String?       封面图 URL（外链，非 media 表）
├── publishedAt   DateTime?     原始发布时间
│
│  ── Phase 2（回填完整内容）──
├── contentText   String?       完整文字内容
├── mediaItems    Media[]       @relation("SocialPostMedia")（多对多）
├── isFullCopy    Boolean       @default(false)
│
├── tags          Tag[]         多对多
├── importMethod  ImportMethod  @default(MANUAL)
├── createdAt     DateTime      @default(now())
└── updatedAt     DateTime      @updatedAt
```

不变。`thumbnailUrl` 保持为 String（Phase 1 自动解析的外链 URL），不走 media 表。Phase 2 回填后完整图片存入 media 表通过 `mediaItems` 关联。

**索引**：`(platform, originalId)` 联合唯一，`platform`，`publishedAt DESC`

---

### 5.14 `news_articles` — 新闻报道

```
news_articles
├── id            String    @id @default(cuid())
├── slug          String    @unique   [v3 新增] URL 标识
├── originalUrl   String    新闻链接（必填）
├── title         String    标题
├── summary       String?   概要
├── source        String?   来源媒体     "东方日报"
├── thumbnailUrl  String?   封面图（外链 URL）
├── publishedAt   DateTime? 发布时间
│
├── contentText   String?   完整内容（回填）
├── isFullCopy    Boolean   @default(false)
│
├── tags          Tag[]     多对多
├── createdAt     DateTime  @default(now())
└── updatedAt     DateTime  @updatedAt
```

**v3 变更**：加 `slug`（SEO 友好 URL，如 `/updates/news/tvb-interview-2025`）。

---

### 5.15 `sightings` — 路透/踪迹

```
sightings
├── id            String            @id @default(cuid())
├── slug          String            @unique  [v3 新增] URL 标识
│
├── originalUrl   String?           投稿链接
├── title         String            标题
├── summary       String?           概要
├── thumbnailUrl  String?           封面图
├── sightedAt     DateTime?         [v3 新增] 目击日期（实际发生时间）
│
├── content       String?           完整描述
├── mediaItems    Media[]           @relation("SightingMedia")（多对多）
├── isFullCopy    Boolean           @default(false)
│
├── authorName    String            投稿人昵称
├── submitType    SubmitType        @default(LINK)
├── status        ModerationStatus  @default(PENDING)
│
├── tags          Tag[]             多对多（用 tagGroup='sighting_scene' 的标签替代原 locationTag）
├── createdAt     DateTime          @default(now())
└── updatedAt     DateTime          @updatedAt
```

**v3 变更**：
- 加 `slug`、`sightedAt`
- **去掉 `locationTag`** → 改用 tags 表中 `tagGroup = 'sighting_scene'` 的标签（如"机场"、"片场"、"偶遇"）。好处：标签可以动态增加，前端筛选器直接读 tags 表，不需要维护枚举

---

### 5.16 `timeline_events` — 首页时间线

```
timeline_events
├── id            String    @id @default(cuid())
├── date          DateTime  事件日期
├── title         String    "披荆斩棘 2025 开播"
├── description   String?   描述
│
├── relatedType   String?   关联内容类型  "production" / "performance"
├── relatedId     String?   关联内容 ID
│
├── isVisible     Boolean   @default(true)
├── sortOrder     Int       @default(0)
├── createdAt     DateTime  @default(now())
└── updatedAt     DateTime  @updatedAt
```

不变。多态引用 `relatedType` + `relatedId`，前端根据 type 决定跳转。

---

### 5.17 `guestbook` — 留言板

```
guestbook
├── id            String            @id @default(cuid())
├── tab           GuestbookTab      枚举：MESSAGE / STORY / FEEDBACK
│
├── nickname      String
├── content       String            留言内容
├── images        Media[]           @relation("GuestbookImages")（多对多）
│
├── storyTags     String[]          故事分享专用标签  ["追星经历", "冷知识"]
├── relatedYear   Int?              关联年份（故事分享，时间轴展示）
│
├── likesCount    Int               @default(0)
├── status        ModerationStatus  @default(PENDING)
│
├── createdAt     DateTime          @default(now())
└── updatedAt     DateTime          @updatedAt
```

**说明**：`storyTags` 用 String[] 而不用 tags 表，因为：
- 这些标签是 UGC 展示分类（"追星经历"、"冷知识"），不是跨内容关联标签
- 不需要反向查询（不需要"查所有关联了'追星经历'标签的影视作品"）
- 保持留言板的简单性

---

### 5.18 `comments` — 评论（v3 改为多态）

```
comments
├── id            String    @id @default(cuid())
├── targetType    String    [v3 新增] 挂载目标类型  "guestbook" / "sighting" / "fan_shot"
├── targetId      String    [v3 新增] 挂载目标 ID
├── nickname      String
├── content       String    @db.VarChar(300)  内容（最长 300 字）
├── createdAt     DateTime  @default(now())
└── updatedAt     DateTime  @updatedAt
```

**v3 变更**：去掉 `guestbookId` 外键，改为 `targetType` + `targetId` 多态引用。

**好处**：
- 路透页面可以直接显示评论，不需要改 schema
- 饭拍页面也可以直接显示评论
- 新增评论目标只需在应用层添加 targetType 值
- Phase 1 只用 `targetType = 'guestbook'`，其他后续开放

**代价**：失去 FK 级联删除 → 需要应用层处理（删除留言时同步删除评论）

**索引**：`(targetType, targetId)` 联合索引

---

### 5.19 `announcements` — 公告

```
announcements
├── id            String             @id @default(cuid())
├── type          AnnouncementType   枚举：NOTICE / RULE / UPDATE
├── title         String
├── content       String             富文本
├── isPinned      Boolean            @default(false)
├── publishDate   DateTime
├── createdAt     DateTime           @default(now())
└── updatedAt     DateTime           @updatedAt
```

不变。

---

### 5.20 `admins` — 管理员

```
admins
├── id            String    @id @default(cuid())
├── email         String    @unique
├── password      String    bcrypt 哈希
├── name          String    显示名
├── createdAt     DateTime  @default(now())
└── updatedAt     DateTime  @updatedAt
```

不变。

---

## 六、索引策略汇总

| 表 | 索引 | 类型 |
|----|------|------|
| categories | `slug` | UNIQUE |
| categories | `parentId` | INDEX |
| tags | `name` | UNIQUE |
| tags | `slug` | UNIQUE |
| tags | `tagGroup` | INDEX |
| content_relations | `(sourceType, sourceId)` | INDEX |
| content_relations | `(targetType, targetId)` | INDEX |
| content_relations | `relationType` | INDEX |
| productions | `slug` | UNIQUE |
| productions | `type` | INDEX |
| productions | `year` | INDEX |
| performances | `slug` | UNIQUE |
| performances | `type` | INDEX |
| endorsements | `slug` | UNIQUE |
| interviews | `slug` | UNIQUE |
| albums | `slug` | UNIQUE |
| social_posts | `(platform, originalId)` | UNIQUE |
| social_posts | `platform` | INDEX |
| social_posts | `publishedAt` | INDEX (DESC) |
| news_articles | `slug` | UNIQUE |
| sightings | `slug` | UNIQUE |
| timeline_events | `date` | INDEX (DESC) |
| comments | `(targetType, targetId)` | INDEX |
| admins | `email` | UNIQUE |

---

## 七、跨栏目关联机制

与 v2 完全一致，两套互补：

| 机制 | 用途 | 场景 |
|------|------|------|
| **tags 标签匹配** | 模糊筛选 + 推荐 | "查所有粤语内容"、"相关推荐" |
| **content_relations** | 精确关联 | "这条路透属于哪部电影"、"这条微博官宣了哪部剧" |

详细场景见 v2 第四节。

---

## 八、JSON vs 独立表选择

与 v2 完全一致：

| 场景 | 选择 | 原因 |
|------|------|------|
| 专辑曲目 `tracks` | **JSON** | 总是跟专辑一起读取 |
| 播放链接 `watchLinks` | **JSON** | 结构简单，数量少 |
| 流媒体链接 `streamingLinks` | **JSON** | 同上 |
| 歌单 `setlist` | **JSON** | 总是跟演出一起读取 |
| 标签 `tags` | **独立表** | 需要反向查询 |
| 媒体 `media` | **独立表** | 统一管理，多处引用 |
| 评论 `comments` | **独立表** | 分页查询，审核管理 |
| 内容关联 `content_relations` | **独立表** | 双向查询，按类型筛选 |
| 栏目 `categories` | **独立表** | 层级查询，动态导航 |
| 故事标签 `storyTags` | **String[]** | UGC 分类，不跨表关联 |

---

## 九、Phase 分期实施建议

数据库设计一次到位，但实施可以分阶段：

### Phase 1 — 必须建的表

| 表 | 原因 |
|----|------|
| categories | 导航需要 |
| tags | 内容标签 |
| media | 海报/封面 |
| social_posts | 微博批量导入 |
| news_articles | 新闻录入 |
| sightings | 路透投稿 |
| timeline_events | 首页时间线 |
| announcements | 公告 |
| admins | 后台登录 |

### Phase 2 — 按模块开发时建

| 表 | 对应模块 |
|----|---------|
| productions | 影视综 |
| performances + performance_media + fan_shots | 演出 |
| content_relations | 跨内容关联 |

### Phase 3 — 活动 + 资料

| 表 | 对应模块 |
|----|---------|
| endorsements | 代言 |
| interviews | 访谈 |
| albums | 专辑 |
| magazines | 杂志 |

### Phase 4 — 社区

| 表 | 对应模块 |
|----|---------|
| guestbook | 留言板 |
| comments | 评论 |

**注意**：所有表的 Prisma model 可以在 P0 一次性写入 schema.prisma，但只在需要时才运行 `prisma migrate` 创建实际表。Prisma 支持渐进式迁移。

---

## 十、后续扩展方向

与 v2 一致，这些设计上已预留空间但暂不实施：

| 功能 | 扩展方式 |
|------|---------|
| **entities 实体表** | 新增 `entities` + `content_entities`，把人物/品牌升级为独立页面 |
| **用户系统** | 新增 `users` 表，guestbook/comments/fan_shots 加 `userId` |
| **多语言** | 内容字段加 `_zh`/`_en` 后缀，或独立 `translations` 表 |
| **全文搜索** | PostgreSQL `tsvector` 或 Meilisearch |
| **内容版本历史** | 新增 `content_versions` 表 |
| **定时发布** | 各表加 `scheduledAt` 字段 |
| **评论扩展到更多目标** | 只需在应用层添加新的 `targetType` 值 |

---

## 十一、v3 总结

| 决策 | 方案 |
|------|------|
| 数据库 | PostgreSQL（Supabase 托管） |
| ORM | Prisma 7.8 |
| 表数量 | 20 张（与 v2 相同） |
| 核心改进 | Media 关联机制明确化 + Comments 多态化 + 字段补全 |
| 核心机制 | 标签（模糊筛选）+ content_relations（精确关联）+ 媒体表（资源管理）+ 栏目树（导航）+ 渐进增强（链接优先→回填） |
| Media 策略 | 单引用用直接 FK，集合用 Prisma 隐式多对多 |
| 枚举 | 9 个共享枚举，集中定义 |

---

> **下一步**：确认 v3 设计后，将转写为 `prisma/schema.prisma` 文件。
