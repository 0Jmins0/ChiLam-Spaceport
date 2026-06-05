# 数据库设计 v1

> 日期：2026-06-05
> 状态：设计确认版，基于 DATABASE_DESIGN.md v3 精炼 + 修补
> 本文件为独立交付文档，可直接用于编写 `prisma/schema.prisma`

---

## 一、枚举定义

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

enum InterviewMediaType {
  VIDEO
  AUDIO
  TEXT
  LIVE
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
- `ModerationStatus` 统一用于所有需要审核的表（fan_shots、sightings、guestbook）
- `SubmitType` 统一用于用户投稿类表（fan_shots、sightings）
- `Platform` 枚举已移除 — `social_posts.platform` 改为 String，由应用层校验合法值，便于新增平台时无需数据库迁移
- `InterviewMediaType` 新增，含 LIVE（直播）格式

---

## 二、整体数据模型

### 2.1 表清单（20 张）

| 模块 | 表名 | 用途 |
|------|------|------|
| 导航 | `categories` | 栏目树 |
| 通用 | `tags` | 全站标签 |
| 通用 | `media` | 媒体资源 |
| 通用 | `content_relations` | 跨内容关联 |
| 影视 | `productions` | 电影/电视剧/综艺 |
| 演出 | `performances` | 演唱会/舞台/音乐剧 |
| 演出 | `performance_media` | 官摄素材 |
| 演出 | `fan_shots` | 饭拍投稿 |
| 活动 | `endorsements` | 广告代言 |
| 活动 | `interviews` | 访谈 |
| 资料 | `albums` | 专辑 |
| 资料 | `magazines` | 杂志 |
| 动态 | `social_posts` | 社交媒体 |
| 动态 | `news_articles` | 新闻报道 |
| 动态 | `sightings` | 路透/踪迹 |
| 首页 | `timeline_events` | 时间线 |
| 留言 | `guestbook` | 留言板 |
| 留言 | `comments` | 评论 |
| 公告 | `announcements` | 公告 |
| 系统 | `admins` | 管理员 |

### 2.2 关系总图

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
         productions.gallery ↔ media[]       (_ProductionGallery)
         social_posts.mediaItems ↔ media[]   (_SocialPostMedia)
         fan_shots.mediaItems ↔ media[]      (_FanShotMedia)
         endorsements.media ↔ media[]        (_EndorsementMedia)
         sightings.mediaItems ↔ media[]      (_SightingMedia)
         guestbook.images ↔ media[]          (_GuestbookImages)
         magazines.scans ↔ media[]           (_MagazineScans)
         news_articles.mediaItems ↔ media[]  (_NewsArticleMedia)

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

## 三、Media 关联策略

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

用于"一个实体关联多个 media"的场景。Prisma 自动生成中间表。

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
| 新闻报道图片/视频 | `NewsArticleMedia` | `_NewsArticleMedia` |

### 为什么用多对多而不是一对多？

一对多要求 media 表持有父表的 FK（如 `productionId`），但 media 的父表有 8 种以上 → 需要 8 个 nullable FK 列 → 难看且不可扩展。

多对多通过中间表解耦，且允许同一个 media 被多处引用（例如：一张海报既是 production 的 poster，又出现在某条微博的 mediaItems 中）。

### 同一 Media 上的多种关系

一个 Media 记录可以同时：
- 被 `productions.posterId` 直接 FK 引用（作为海报）
- 被 `_SocialPostMedia` 中间表引用（出现在某条微博中）

两种引用独立存在，互不冲突。

---

## 四、各表详细设计

### 4.1 `categories` — 栏目树

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

前端根据 `slug` 在代码中决定使用哪种模板（card_grid / timeline_list 等），不需要存数据库。

**索引**：`slug` UNIQUE，`parentId`

---

### 4.2 `tags` — 全站标签

```
tags
├── id          String     @id @default(cuid())
├── name        String     @unique   标签名     "射雕英雄传"、"粤语"
├── slug        String     @unique   URL 标识   "the-legend-of-the-condor-heroes"
├── tagGroup    String?    标签分组             "platform"、"language"、"work"
└── createdAt   DateTime   @default(now())
```

**tagGroup 推荐值**：

| tagGroup | 用途 | 示例标签 |
|----------|------|---------|
| `language` | 语言筛选 | 粤语、普通话 |
| `region` | 地区筛选 | 内地、香港、台湾 |
| `work` | 作品名关联 | 射雕英雄传、冲上云霄 |
| `person` | 人物关联 | 袁咏仪、古天乐 |
| `brand` | 品牌关联 | 美心、雪花秀 |
| `sighting_scene` | 路透场景（替代原 locationTag） | 机场、片场、偶遇 |
| `variety_role` | 综艺角色 | 常驻、飞行 |
| `general` | 通用标签 | 幕后花絮、红毯 |

**多对多关联**：与 productions、performances、social_posts、news_articles、sightings、endorsements、interviews、albums、magazines 共 9 张表。

**索引**：`name` UNIQUE，`slug` UNIQUE，`tagGroup`

---

### 4.3 `media` — 统一媒体资源

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
│  ── 反向关系（Prisma 需要声明，不产生数据库列）──
│
│  直接 FK 反向
├── posterOfProductions     Production[]       @relation("ProductionPoster")
├── posterOfPerformances    Performance[]      @relation("PerformancePoster")
├── coverOfAlbums           Album[]            @relation("AlbumCover")
├── coverOfMagazines        Magazine[]         @relation("MagazineCover")
├── originalOfInterviews    Interview[]        @relation("InterviewOriginalMedia")
├── performanceMediaFiles   PerformanceMedia[] @relation("PerformanceMediaFile")
│
│  多对多反向
├── productionGalleries     Production[]       @relation("ProductionGallery")
├── socialPosts             SocialPost[]       @relation("SocialPostMedia")
├── fanShots                FanShot[]          @relation("FanShotMedia")
├── endorsements            Endorsement[]      @relation("EndorsementMedia")
├── sightings               Sighting[]         @relation("SightingMedia")
├── guestbooks              Guestbook[]        @relation("GuestbookImages")
├── magazineScans           Magazine[]         @relation("MagazineScans")
└── newsArticles            NewsArticle[]      @relation("NewsArticleMedia")
```

---

### 4.4 `content_relations` — 跨内容关联

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

多态引用，无 FK 约束，应用层保证一致性。

**sourceType / targetType 允许值**：

| 值 | 对应表 |
|----|--------|
| `production` | productions |
| `performance` | performances |
| `social_post` | social_posts |
| `news_article` | news_articles |
| `sighting` | sightings |
| `endorsement` | endorsements |
| `interview` | interviews |
| `album` | albums |
| `magazine` | magazines |

**relationType 推荐值**：

| 值 | 含义 | 典型用法 |
|----|------|---------|
| `about` | 关于 | 微博提到某部电影 |
| `sighting_of` | 路透属于 | 路透属于某部电影的拍摄 |
| `promotion_of` | 宣传 | 访谈宣传某部新剧 |
| `related` | 相关 | 通用关联 |

**索引**：`(sourceType, sourceId)` 联合，`(targetType, targetId)` 联合，`relationType`

---

### 4.5 `productions` — 影视综作品

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

**索引**：`slug` UNIQUE，`type`，`year`

---

### 4.6 `performances` — 演出

```
performances
├── id          String           @id @default(cuid())
├── type        PerformanceType  枚举：CONCERT / STAGE / MUSICAL
├── slug        String           @unique
├── title       String           "Crazy Hours Live"
├── titleEn     String?
├── year        Int              年份（列表按年代筛选用）
├── startDate   DateTime?        开始日期（精确展示/排序用）
├── endDate     DateTime?        结束日期（多场演出）
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

**说明**：`startDate` / `endDate` 用于时间线精确展示和详情页日期显示。`year` 保留用于列表页按年代快速筛选。

**索引**：`slug` UNIQUE，`type`，`startDate DESC`

---

### 4.7 `performance_media` — 官摄素材

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

**索引**：`performanceId`

---

### 4.8 `fan_shots` — 饭拍投稿

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

**索引**：`performanceId`，`status`

---

### 4.9 `endorsements` — 广告代言

```
endorsements
├── id          String    @id @default(cuid())
├── slug        String    @unique  URL 标识   "maxims-mooncake"
├── brand       String    品牌名              "香港美心"
├── role        String?   代言身份            "代言人"
├── category    String?   品类                "餐饮"
├── description String?   简要描述
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

**索引**：`slug` UNIQUE

---

### 4.10 `interviews` — 访谈

```
interviews
├── id                    String              @id @default(cuid())
├── slug                  String              @unique
├── title                 String              "XXX 专访·2024"
├── summary               String?             概要（卡片展示用）
├── source                String?             来源媒体     "TVB 娱乐新闻"
├── date                  DateTime            访谈日期
├── mediaType             InterviewMediaType  枚举：VIDEO / AUDIO / TEXT / LIVE
│
├── originalUrl           String?             原始链接
├── originalMediaId       String?             → media.id（上传的原始音视频）
│
├── transcriptCantonese   String?             粤语文字稿（TEXT）
├── transcriptMandarin    String?             国语翻译（TEXT）
├── proofreadStatus       ProofreadStatus     @default(PENDING)
│
├── tags        Tag[]     多对多
├── isVisible   Boolean   @default(true)
├── createdAt   DateTime  @default(now())
└── updatedAt   DateTime  @updatedAt
```

**索引**：`slug` UNIQUE，`date DESC`

---

### 4.11 `albums` — 专辑

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

**索引**：`slug` UNIQUE，`releaseYear`

---

### 4.12 `magazines` — 杂志

```
magazines
├── id          String    @id @default(cuid())
├── slug        String    @unique   URL 标识   "elle-2021-march"
├── title       String    杂志名              "ELLE"
├── issue       String?   期号                "2021年3月刊"
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

**索引**：`slug` UNIQUE，`date DESC`

---

### 4.13 `social_posts` — 社交媒体动态

```
social_posts
├── id            String        @id @default(cuid())
├── platform      String        平台标识："weibo" / "instagram" / "douyin" / "xiaohongshu" / "facebook" / ...
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

`platform` 为 String 类型，应用层通过常量或配置校验合法值。前端筛选器从配置动态读取，新增平台无需数据库迁移。

`thumbnailUrl` 保持为 String（Phase 1 自动解析的外链 URL），不走 media 表。Phase 2 回填后完整图片存入 media 表通过 `mediaItems` 关联。

**合法 platform 值**（应用层维护）：

| 值 | 平台 |
|----|------|
| `weibo` | 微博 |
| `instagram` | Instagram |
| `douyin` | 抖音 |
| `xiaohongshu` | 小红书 |
| `facebook` | Facebook |

后续可直接新增（如 `threads`、`youtube`、`bilibili`），无需迁移。

**索引**：`(platform, originalId)` 联合唯一，`platform`，`publishedAt DESC`

---

### 4.14 `news_articles` — 新闻报道

```
news_articles
├── id            String    @id @default(cuid())
├── slug          String    @unique   URL 标识
├── originalUrl   String    新闻链接（必填）
├── title         String    标题
├── summary       String?   概要
├── source        String?   来源媒体     "东方日报"
├── thumbnailUrl  String?   封面图（外链 URL）
├── publishedAt   DateTime? 发布时间
│
├── contentText   String?   完整内容（回填）
├── mediaItems    Media[]   @relation("NewsArticleMedia")（多对多）
├── isFullCopy    Boolean   @default(false)
│
├── tags          Tag[]     多对多
├── createdAt     DateTime  @default(now())
└── updatedAt     DateTime  @updatedAt
```

`mediaItems` 用于 Phase 2 回填新闻图片/视频到站内统一管理，与 social_posts 保持一致的渐进增强模式。

**索引**：`slug` UNIQUE，`publishedAt DESC`

---

### 4.15 `sightings` — 路透/踪迹

```
sightings
├── id            String            @id @default(cuid())
├── slug          String            @unique  URL 标识
│
├── originalUrl   String?           投稿链接
├── title         String            标题
├── summary       String?           概要
├── thumbnailUrl  String?           封面图
├── sightedAt     DateTime?         目击日期（实际发生时间）
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

路透场景标签（机场、片场、偶遇等）通过 tags 表 `tagGroup = 'sighting_scene'` 管理，可动态增加，前端筛选器直接读 tags 表。

**索引**：`slug` UNIQUE，`status`，`sightedAt DESC`

---

### 4.16 `timeline_events` — 首页时间线

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

多态引用 `relatedType` + `relatedId`，前端根据 type 决定跳转目标。

**索引**：`date DESC`，`isVisible`

---

### 4.17 `guestbook` — 留言板

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

`storyTags` 用 String[] 而不用 tags 表，因为：
- 这些标签是 UGC 展示分类（"追星经历"、"冷知识"），不是跨内容关联标签
- 不需要反向查询
- 应用层维护合法值常量列表，避免拼写不一致

**storyTags 合法值**（应用层常量）：追星经历 / 影视回忆 / 音乐记忆 / 冷知识 / 其他

**索引**：`tab`，`status`，`createdAt DESC`

---

### 4.18 `comments` — 评论（多态）

```
comments
├── id            String    @id @default(cuid())
├── targetType    String    挂载目标类型  "guestbook" / "sighting" / "fan_shot"
├── targetId      String    挂载目标 ID
├── nickname      String
├── content       String    @db.VarChar(300)  内容（最长 300 字）
├── createdAt     DateTime  @default(now())
└── updatedAt     DateTime  @updatedAt
```

多态引用，无 FK 约束。

**好处**：
- 路透/饭拍页面可直接显示评论，不需改 schema
- 新增评论目标只需在应用层添加 targetType 值
- Phase 1 只用 `targetType = 'guestbook'`，其他后续开放

**代价**：失去 FK 级联删除 → 需要应用层处理（删除内容时同步删除评论）

**索引**：`(targetType, targetId)` 联合

---

### 4.19 `announcements` — 公告

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

**索引**：`type`，`publishDate DESC`，`isPinned`

---

### 4.20 `admins` — 管理员

```
admins
├── id            String    @id @default(cuid())
├── email         String    @unique
├── password      String    bcrypt 哈希
├── name          String    显示名
├── createdAt     DateTime  @default(now())
└── updatedAt     DateTime  @updatedAt
```

**索引**：`email` UNIQUE

---

## 五、索引策略汇总

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
| performances | `startDate` | INDEX (DESC) |
| endorsements | `slug` | UNIQUE |
| interviews | `slug` | UNIQUE |
| interviews | `date` | INDEX (DESC) |
| albums | `slug` | UNIQUE |
| albums | `releaseYear` | INDEX |
| magazines | `slug` | UNIQUE |
| magazines | `date` | INDEX (DESC) |
| social_posts | `(platform, originalId)` | UNIQUE |
| social_posts | `platform` | INDEX |
| social_posts | `publishedAt` | INDEX (DESC) |
| news_articles | `slug` | UNIQUE |
| news_articles | `publishedAt` | INDEX (DESC) |
| sightings | `slug` | UNIQUE |
| sightings | `status` | INDEX |
| sightings | `sightedAt` | INDEX (DESC) |
| timeline_events | `date` | INDEX (DESC) |
| timeline_events | `isVisible` | INDEX |
| guestbook | `tab` | INDEX |
| guestbook | `status` | INDEX |
| guestbook | `createdAt` | INDEX (DESC) |
| comments | `(targetType, targetId)` | INDEX |
| announcements | `type` | INDEX |
| announcements | `publishDate` | INDEX (DESC) |
| admins | `email` | UNIQUE |

---

## 六、跨栏目关联机制

两套互补：

| 机制 | 用途 | 场景 |
|------|------|------|
| **tags 标签匹配** | 模糊筛选 + 推荐 | "查所有粤语内容"、"相关推荐" |
| **content_relations** | 精确关联 | "这条路透属于哪部电影"、"这条微博官宣了哪部剧" |

### 场景 1：电影详情页 — 展示「相关资讯」

```
前端请求：GET /api/productions/射雕英雄传/related

后端逻辑：
1. 在 content_relations 中查 targetType='production' AND targetId=该电影ID
   → 找到精确关联的微博、路透、新闻
2. 同时用该电影的 tags 在 social_posts / news_articles 中模糊匹配
   → 找到标签相关的内容
3. 合并去重，按时间排序
```

### 场景 2：后台录入路透时建立关联

```
运营后台操作：
1. 创建一条 sighting 记录
2. 选择关联的 production / performance
3. 系统创建 content_relations 记录：
   sourceType='sighting', sourceId=路透ID
   targetType='production', targetId=电影ID
   relationType='sighting_of'
```

### 场景 3：全站搜索「射雕」

```
1. tags 表查 name LIKE '%射雕%' → 获取 tagId
2. 通过 9 个中间表查关联了该 tag 的所有内容
3. 合并为统一搜索结果
```

---

## 七、JSON vs 独立表选择

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

## 八、Phase 分期实施建议

所有表的 Prisma model 可在 P0 一次性写入 schema.prisma，但只在需要时才运行 `prisma migrate` 创建实际表。

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

---

## 九、后续扩展方向

设计上已预留空间但暂不实施：

| 功能 | 扩展方式 |
|------|---------|
| **entities 实体表** | 新增 `entities` + `content_entities`，把人物/品牌升级为独立页面 |
| **用户系统** | 新增 `users` 表，guestbook/comments/fan_shots 加 `userId` |
| **多语言** | 内容字段加 `_zh`/`_en` 后缀，或独立 `translations` 表 |
| **全文搜索** | PostgreSQL `tsvector` 或 Meilisearch |
| **内容版本历史** | 新增 `content_versions` 表 |
| **定时发布** | 各表加 `scheduledAt` 字段 |
| **评论扩展到更多目标** | 只需在应用层添加新的 `targetType` 值 |
| **首页配置** | 待首页设计确定后新增 `site_settings` 或 `homepage_config` 表 |

---

## 十、总结

| 决策 | 方案 |
|------|------|
| 数据库 | PostgreSQL（Supabase 托管） |
| ORM | Prisma 7.8 |
| 表数量 | 20 张 |
| 枚举数量 | 9 个（删除 Platform，新增 InterviewMediaType） |
| Media 策略 | 单引用用直接 FK，集合用 Prisma 隐式多对多 |
| 跨栏目关联 | 标签（模糊筛选）+ content_relations（精确关联） |
| 渐进增强 | 链接优先 → 回填完整内容（social_posts / news_articles / sightings） |
| 平台扩展 | String + 应用层校验（非枚举），新增平台无需迁移 |
| 多态引用 | comments / content_relations / timeline_events，应用层保证一致性 |

---

### 相对 v3 的变更记录

| # | 变更 | 原因 |
|---|------|------|
| 1 | `magazines` 加 `slug` 字段 + UNIQUE 索引 | 杂志详情页需要 SEO 友好 URL |
| 2 | 删除 `Platform` 枚举，`social_posts.platform` 改为 String | 新平台可能出现，避免每次迁移 |
| 3 | 新增 `InterviewMediaType` 枚举（VIDEO/AUDIO/TEXT/LIVE），`interviews.mediaType` 从 String 改为枚举 | 类型安全一致性 + 支持直播格式 |
| 4 | `news_articles` 加 `mediaItems Media[]` 多对多关联 | Phase 2 回填新闻图片需统一管理 |
| 5 | `performances` 加 `startDate DateTime?` / `endDate DateTime?` | 时间线精确展示 + 多场演出日期范围 |

> **下一步**：确认后将转写为 `prisma/schema.prisma` 文件。
