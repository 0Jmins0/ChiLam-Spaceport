# P6 - 用户反馈迭代计划

> 来源：留言板用户反馈（2026-06-10）
> 创建日期：2026-06-10
> 状态：P6.1 已完成，P6.2 待开始

---

## 阶段总览

| 阶段 | 内容 | 预估工作量 | 依赖 | 状态 |
|------|------|-----------|------|------|
| P6.1 | 体验修复（图片优化 + 返回导航 + 留言即时更新） | 小 | 无 | ✅ 已完成 |
| P6.2 | 访谈详情页重做（三栏布局 + 音视频播放器） | 中 | Schema 变更 | ✅ 已完成 |
| P6.3 | 瀑布流布局改版（全站列表页 CSS columns） | 中 | 无 | 待开始 |
| P6.4 | 留言板增强（精选权重 + 图片上传） | 中 | Schema 变更 | 待开始 |
| P6.5 | 相册模块（新栏目 `/gallery`，留言板左侧） | 大 | Schema 变更 | 待开始 |
| P6.6 | 前台编辑模式（管理员内联编辑系统） | 大 | 无 | 待开始 |
| P6.7 | 全局隐藏描述字段（搜索增强） | 中 | Schema 变更 | 待开始 |
| P6.8 | 演出详情页优化（新增简介 + 布局调整） | 小 | Schema 变更 | 待开始 |
| P6.9 | 用户收藏功能（收藏 Media/留言/内容） | 中 | Schema 变更 | 待开始 |
| 持续 | 数据填充（新闻爬取、舞台整理、关联绑定） | 持续 | P5.1 继续 | 持续 |

---

## P6.1 - 体验修复

> 最快见效的修复，直接提升用户体感

### 6.1.1 图片加载优化

**现状问题**：
- 所有卡片图片缺少 `priority` 属性，首屏图片被懒加载
- `next.config.ts` 未配置 `formats`（缺少 WebP/AVIF）
- 无 `quality` 参数优化，默认 75
- `sizes` 属性不够精确
- R2 图片无缓存策略

**修复方案**：
1. `next.config.ts` 添加 `images.formats: ['image/avif', 'image/webp']`
2. 所有列表页第一行卡片（前 3-4 个）添加 `priority={true}`
3. 统一各组件的 `sizes` 属性，按实际布局精确配置
4. 考虑添加 `quality={85}` 提升画质（可选）
5. R2 图片 URL 添加缓存控制头（待确认 R2 配置）

**涉及文件**：
- `next.config.ts`
- `src/components/screens/ProductionCard.tsx`
- `src/components/performances/PerformanceCard.tsx`
- `src/components/archives/AlbumCard.tsx`
- `src/components/archives/MagazineCard.tsx`
- `src/components/updates/SocialPostCard.tsx`
- `src/components/updates/NewsArticleCard.tsx`
- 各列表页（传递 index/priority 给卡片组件）

### 6.1.2 留言发布后即时更新

**现状问题**：
- `GuestbookForm` 提交成功后仅清空表单，不刷新列表
- 用户需要手动刷新页面才能看到新留言

**修复方案**：
- 提交成功后调用 `router.refresh()`（Next.js Server Component 刷新）
- 或改为乐观更新：本地插入新留言到列表顶部

**涉及文件**：
- `src/components/guestbook/GuestbookForm.tsx`
- `src/app/messages/page.tsx`（可能需要传 callback）

### 6.1.3 返回导航按钮

**现状问题**：
- `/messages/[id]` 留言详情页无返回按钮
- `/profile/settings` 个人设置页无返回按钮
- `/profile/messages` 留言管理页无返回按钮

**修复方案**：
- 留言详情页顶部添加「← 返回留言板」链接（`/messages`）
- 个人设置页顶部添加「← 返回个人中心」链接（`/profile`）
- 留言管理页顶部添加「← 返回个人中心」链接（`/profile`）
- 统一样式：金色文字 + 箭头图标，与全站视觉一致

**涉及文件**：
- `src/app/messages/[id]/page.tsx`
- `src/app/profile/settings/page.tsx`（或 SettingsForm）
- `src/app/profile/messages/page.tsx`（或 MessageList）

---

## P6.2 - 访谈详情页重做

> 参考图：三栏布局（源信息 | 文稿 | 媒体播放），风格延续全站深色+琥珀金主题

### 设计方案

**桌面端三栏布局**（参考提供的设计图）：

```
┌──────────────┬──────────────────────────┬──────────────────┐
│  左栏 (固定)  │      中栏 (文稿滚动)       │   右栏 (固定)     │
│              │                          │                  │
│  来源 SOURCE  │  粤语原文 / 国语翻译 切换    │  人物照片/视频     │
│  张智霖访谈系列│                          │  （有视频→嵌入）   │
│              │  标题（大字）              │  （只有音频→图+播放）│
│  主持 HOST    │  副标题/英文翻译           │  （图文→放图片）   │
│  林 海        │                          │  （啥没有→默认图） │
│              │  日期   校对状态  EXCERPT  │                  │
│  地点 LOCATION│                          │  播放器控件        │
│  香港·九龙    │  J  对话内容...  00:02:14 │  进度条/播放/暂停  │
│              │  H  提问内容...  00:02:36 │  倍速/音质         │
│  日期 DATE    │  J  回答内容...  00:02:52 │                  │
│  2019.06.18  │  ...                     │  编者备注          │
│              │                          │  EDITOR'S NOTE    │
│  时长 DURATION│                          │                  │
│  01:24:37    │                          │                  │
│              │                          │                  │
│  ← 返回活动   │                          │                  │
└──────────────┴──────────────────────────┴──────────────────┘
```

**移动端**：单栏堆叠（媒体 → 源信息 → 文稿）

### 右栏媒体区域规则

| 条件 | 右栏展示 |
|------|---------|
| `mediaType=VIDEO` + `embedUrl` 有值 | iframe 嵌入视频（YouTube/Bilibili） |
| `mediaType=AUDIO` + `originalMediaUrl` 有值 | 人物图片 + 自定义音频播放器 |
| `mediaType=TEXT` + 有 gallery 图片 | 展示图文中的图片（轮播/网格） |
| 以上都没有 | 固定默认图（张智霖标志性照片） |

### 视频嵌入方案（已确认）

直接 iframe 嵌入，数据库存 `embedUrl`：
- YouTube：`https://www.youtube.com/embed/VIDEO_ID`
- Bilibili：`https://player.bilibili.com/player.html?bvid=BV...`
- 其他平台：直接存完整 embed URL
- 前端统一用 `<iframe src={embedUrl} />` 渲染，响应式 16:9 比例
- 无平台限制，无 API Key 要求，免费使用

### 文稿 JSON 格式（已确认）

文稿字段改为 JSON 结构化存储（`transcriptCantonese` / `transcriptMandarin` 字段类型改为 `Json?`）：

```json
{
  "segments": [
    {
      "speaker": "J",
      "speakerLabel": "张智霖",
      "timestamp": "00:02:14",
      "text": "其實我細個嘅時候，冇諗過自己會做呢行。"
    },
    {
      "speaker": "H",
      "speakerLabel": "林海",
      "timestamp": "00:02:36",
      "text": "你覺得表演對你嚟講，最吸引嘅地方係咩？"
    }
  ]
}
```

**说明**：
- `speaker`：说话人标识（J=嘉宾, H=主持, N=旁白）
- `speakerLabel`：说话人显示名（可选，首次出现时标注）
- `timestamp`：时间戳（可选，无音视频的图文访谈可省略）
- `text`：对话内容
- 前端渲染时按 speaker 区分样式（嘉宾左对齐，主持右对齐/不同颜色）

### 数据层变更

**Interview 模型新增字段**：
- `host: String?`（主持人）— `@map("host")`
- `location: String?`（地点）— `@map("location")`
- `duration: String?`（时长，如 "01:24:37"）— `@map("duration")`
- `embedUrl: String?`（视频嵌入链接）— `@map("embed_url")`
- `gallery: Media[]`（关联图片，多对多 `@relation("InterviewGallery")`）
- `transcriptCantonese` / `transcriptMandarin` 字段类型从 `String?` → `Json?`

### 涉及文件

**新建**：
- `src/components/activities/InterviewDetail/` — 访谈详情子组件目录
  - `InterviewSidebar.tsx` — 左栏源信息
  - `InterviewTranscript.tsx` — 中栏文稿（解析 JSON，渲染对话格式）
  - `InterviewMediaPanel.tsx` — 右栏媒体区域（视频/音频/图片/默认图）
  - `AudioPlayer.tsx` — 自定义音频播放器

**修改**：
- `prisma/schema.prisma` — Interview 模型扩展
- `src/app/activities/interviews/[slug]/page.tsx` — 三栏布局重做
- `src/lib/types.ts` — InterviewDetail 类型扩展
- `src/lib/queries/activities.ts` — 查询包含新字段 + gallery

---

## P6.3 - 瀑布流布局改版（已确认：CSS columns）

> 全站列表页支持不同尺寸的封面图/海报，卡片形状随图片比例变化

### 技术方案（已确认）

使用 **CSS `columns`** 方案：
- 零依赖，纯 CSS，最好维护
- 排列顺序为竖向（先填满第一列再第二列）
- 响应式：`columns: 2`（移动）→ `columns: 3`（平板）→ `columns: 4`（桌面）
- 每张卡片 `break-inside: avoid` 防止跨列断裂

### 影响范围

| 页面 | 当前卡片 | 改造内容 |
|------|---------|---------|
| `/screens` 影视 | ProductionCard (2:3) | 支持不同比例封面 |
| `/performances` 演出 | PerformanceCard (2:3) | 支持不同比例封面 |
| `/archives` 专辑 | AlbumCard (1:1) | 支持不同比例封面 |
| `/archives` 杂志 | MagazineCard (2:3) | 支持不同比例封面 |
| `/activities` 代言 | EndorsementCard (4:3) | 支持不同比例封面 |
| `/updates` 动态 | 已有 MasonryGrid | 统一为 CSS columns |

### 卡片组件改造要点

1. **移除固定 `aspect-ratio`**：改为根据图片实际尺寸渲染
2. **图片尺寸信息**：Media 表已有 `width`/`height` 字段，需要在查询中返回
3. **无图片兜底**：没有封面的卡片使用固定高度占位
4. **通用瀑布流容器**：提取 `MasonryLayout` 通用组件（CSS columns wrapper）

### 涉及文件

**新建/修改**：
- `src/components/ui/MasonryLayout.tsx` — 通用瀑布流容器组件（CSS columns）
- 各卡片组件 — 移除固定 aspect-ratio，接受图片尺寸 props
- 各列表页 — 使用 MasonryLayout 替代 Grid
- 各查询层 — 返回图片尺寸信息（width/height）

---

## P6.4 - 留言板增强

### 6.4.1 精选留言（权重系统）

**方案框架**（细节后续确认）：
- Guestbook 模型新增 `isFeatured: Boolean @default(false)` 字段
- 管理员通过后台 API 标记精选
- 前端展示方式（待确认）：精选 tab / 置顶区 / 标记样式

**涉及变更**：
- `prisma/schema.prisma` — Guestbook 新增 `isFeatured`
- `src/app/api/admin/messages/` — 新增精选操作
- `src/lib/queries/guestbook.ts` — 支持精选筛选
- 前端组件 — 精选标记样式

### 6.4.2 留言/评论图片上传

**规则**：
- 留言：限 1 张图片
- 评论：限 1 张图片

**方案**：
- 复用现有 R2 上传流程（`/api/upload`）
- Guestbook 模型已有 `images` 多对多关系（`GuestbookImages`），可直接使用
- Comment 模型需新增图片关联字段

**涉及变更**：
- `prisma/schema.prisma` — Comment 新增 `image` 关联（可选）
- `src/components/guestbook/GuestbookForm.tsx` — 添加图片上传 UI
- `src/components/guestbook/CommentSection.tsx` — 添加图片上传 UI
- `src/components/guestbook/GuestbookCard.tsx` — 展示留言图片
- `src/app/api/messages/route.ts` — 创建时关联图片
- `src/app/api/messages/[id]/comments/route.ts` — 创建时关联图片

---

## P6.5 - 相册模块（Media 统一媒体库 + 可视化浏览）

> **核心理念**：不新建 Gallery 模型，Media 表就是全站唯一媒体库。Gallery 页面 = Media 表的可视化浏览界面。一张图只存一次，所有页面引用同一条 Media 记录。

### 架构设计

```
┌─────────────────────────────────────────────────────────┐
│                    Media 表（唯一存储）                    │
│  每条记录 = 一个文件（图片/视频/音频）                      │
│  字段：url, type, category, caption, searchNote, tags    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  引用方式（已有的 16 个关联关系不变）：                     │
│  ├─ Production.poster → Media (FK)                      │
│  ├─ Performance.poster → Media (FK)                     │
│  ├─ Album.cover → Media (FK)                            │
│  ├─ Magazine.cover → Media (FK)                         │
│  ├─ Interview.originalMedia → Media (FK)                │
│  ├─ Livestream.cover → Media (FK)                       │
│  ├─ Production.gallery → Media[] (多对多)                │
│  ├─ SocialPost.media → Media[] (多对多)                  │
│  ├─ Endorsement.media → Media[] (多对多)                 │
│  ├─ Guestbook.images → Media[] (多对多)                  │
│  └─ ... 等共 16 个关联                                   │
│                                                         │
│  Gallery 页面 = 对 Media 表的分类浏览视图                  │
│  上传到任何页面 → 创建 Media 记录 → Gallery 自动出现        │
└─────────────────────────────────────────────────────────┘
```

**与之前设计的区别**：
- ❌ 之前：独立 Gallery 模型，通过多对多引用 Media → 两层结构，有冗余
- ✅ 现在：**不建 Gallery 模型**，Media 表本身就是相册。Gallery 页面直接查 Media 表

### Media 模型增强

现有 Media 字段不变，新增以下字段：

```prisma
model Media {
  // ... 现有字段保持不变 ...

  // 新增字段
  category    MediaCategory              // 一级分类（IMAGE/VIDEO/AUDIO，从 MIME 自动设置）
  mediaTag    String?       @map("media_tag")    // 二级标签（ImageTag/VideoTag/AudioTag 的值，默认 OTHER）
  searchNote  String?       @map("search_note")  // 隐藏搜索备注（P6.7 合并）
  uploadedBy  String?       @map("uploaded_by")  // 上传者（User ID 或 admin 标识）

  @@map("media")
}

// 一级分类（Tab）— 按文件类型，从 MIME 自动识别
enum MediaCategory {
  IMAGE       // 图片
  VIDEO       // 视频
  AUDIO       // 音频
}

// 二级标签 — 按内容用途，上传时手动选（默认 OTHER）
// 三套独立 Tag，按 category 决定显示哪套
enum ImageTag {
  POSTER      // 海报/封面
  EVENT       // 活动照
  PORTRAIT    // 写真
  SCREENSHOT  // 剧照/截图
  SOCIAL      // 社交媒体图（本人发的）
  MESSAGE     // 留言/评论图片
  OTHER       // 其他（默认）
}

enum VideoTag {
  EVENT       // 活动
  BEHIND      // 幕后
  SIGHTING    // 路透
  OTHER       // 其他（默认）
}

enum AudioTag {
  SONG        // 歌曲
  INTERVIEW   // 访谈
  OTHER       // 其他（默认）
}
```

### 上传流程（统一）

```
用户在任何页面上传文件
      │
      ▼
  选择分类（默认"其他"）+ 可选打标签
      │
      ▼
  POST /api/upload → 上传到 R2 → 创建 Media 记录（含 category + tags）
      │
      ▼
  返回 Media ID → 当前页面绑定关联关系（如 Production.posterId = mediaId）
      │
      ▼
  Gallery 页面自动可见（因为 Gallery 就是 Media 表的视图）
```

**关键点**：
- 上传时就打标签和分类，后续不需要二次操作
- 从影视详情页上传海报 → category 自动设为 `POSTER`
- 从留言表单上传图片 → category 自动设为 `MESSAGE`
- 编辑模式下可以修改 category 和 tags

### Gallery 页面设计

**路由**: `/gallery`
**导航位置**: 资料库 → **相册** → 留言 → 公告

**列表页**：

```
一级 Tab:  [全部]  [图片]  [视频]  [音频]  [合集]
                     │                       │
                     ▼ 选了「图片」            ▼ 选了「合集」
二级 Tag:  全部 | 海报/封面 | 活动照 |     展示 MediaCollection 卡片列表
           写真 | 剧照 | 社交媒体图 | 其他  点击某个合集 → 混合内容页（图片+视频）

选了「视频」:
二级 Tag:  全部 | 活动 | 幕后 | 路透 | 其他

选了「音频」:
二级 Tag:  全部 | 歌曲 | 访谈 | 其他
```

- 瀑布流布局（CSS columns，复用 P6.3）
- 每张卡片显示：缩略图 + caption（如有）
- 视频卡片带播放图标，音频卡片带波形图标

**图片浏览（悬浮灯箱）**：
- 点击图片 → 悬浮放大（lightbox），背景变暗
- 点击外部任意位置 → 关闭灯箱，回到列表
- 灯箱内左右箭头切换上一张/下一张
- ESC 键关闭
- 灯箱底部显示：caption、关联内容链接（如"来自《忘不了》"可点击跳转）

**关联反查**：
- 每张 Media 通过现有关联关系反查它属于哪个内容
- Gallery 页面可按关联内容筛选（如"查看《忘不了》的所有媒体"）

### 删除逻辑

- 从 Gallery 删除一条 Media → R2 文件删除 + 所有引用此 Media 的关联自动解除
- 一处删除，处处生效

### 涉及变更

**新建**：
- `src/app/gallery/page.tsx` — 相册列表页（Media 表浏览视图）
- `src/components/gallery/GalleryGrid.tsx` — 瀑布流图片网格
- `src/components/gallery/GalleryFilterBar.tsx` — 分类筛选栏
- `src/components/gallery/LightboxViewer.tsx` — 悬浮灯箱组件
- `src/lib/queries/gallery.ts` — Media 表查询（分类/标签/关联/分页）
- `src/lib/types.ts` — GalleryItem 类型
- `src/app/api/gallery/` — Gallery 查询 API（本质是 Media 查询）

**修改**：
- `prisma/schema.prisma` — Media 新增 category + searchNote + tags
- `src/config/navigation.ts` — 新增「相册」导航项（留言板左侧）
- `src/app/api/upload/route.ts` — 上传时支持传入 category 和 tags
- `src/components/guestbook/GuestbookForm.tsx` — 图片上传自动设 category=MESSAGE
- `src/components/profile/SettingsForm.tsx` — 头像上传自动设 category=OTHER

### 相册集（已确认：需要）

**概念**：把多张 Media 组成一个命名集合（如"2024忘不了宣传活动"、"Crazy Hour 巡演精选"）

**数据模型**：

```prisma
model MediaCollection {
  id          Int       @id @default(autoincrement())
  slug        String    @unique
  title       String    // 相册集标题
  description String?   // 描述
  date        DateTime? // 日期

  // 包含的 Media
  items       Media[]   @relation("CollectionMedia")

  // 内容关联（可选）
  relatedType String?   // "production" | "performance" | ...
  relatedId   Int?

  // 封面（取集合内第一张或指定）
  coverId     Int?
  cover       Media?    @relation("CollectionCover", fields: [coverId], references: [id])

  isVisible   Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@map("media_collections")
}
```

**Gallery 页面交互**：

```
Gallery 页面 Tab:
  全部 | 海报 | 封面 | 宣传照 | ... | 📁 相册集

点击「相册集」Tab：
  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
  │  封面图       │  │  封面图       │  │  封面图       │
  │              │  │              │  │              │
  │ 2024忘不了    │  │ Crazy Hour   │  │ 杂志拍摄合集  │
  │ 宣传活动      │  │ 巡演精选      │  │              │
  │ 12张照片      │  │ 28张照片      │  │ 45张照片      │
  └──────────────┘  └──────────────┘  └──────────────┘

点击某个相册集 → /gallery/collections/[slug]：
  瀑布流展示该集合内的所有照片，灯箱浏览
```

**涉及变更**：
- `prisma/schema.prisma` — MediaCollection 模型 + Media 新增 collections 关联
- `src/app/gallery/collections/[slug]/page.tsx` — 相册集详情页
- `src/components/gallery/CollectionCard.tsx` — 相册集封面卡片
- `src/lib/queries/gallery.ts` — 相册集查询
- `src/app/api/gallery/collections/` — 相册集 CRUD API

---

## P6.6 - 前台编辑模式（管理员内联编辑系统）

> 在网站前台直接编辑内容，无需进入独立后台

### 设计方案

**交互流程**：
1. 右上角显示「编辑模式」开关按钮（仅管理员登录后可见）
2. 点击开启 → 页面进入编辑模式，可编辑区域高亮显示
3. 点击文字 → 变为可编辑输入框，修改后自动保存（或点击保存）
4. 点击图片 → 弹出替换图片上传框（复用 R2 上传）
5. 再次点击按钮 → 关闭编辑模式，恢复正常浏览

### 技术方案

```
┌─────────────────────────────────────────────────┐
│  Header                         [🔧 编辑模式]   │
├─────────────────────────────────────────────────┤
│                                                 │
│  编辑模式开启时：                                 │
│  - 可编辑文字区域显示虚线边框 + hover 高亮         │
│  - 点击文字 → inline 编辑（contentEditable 或弹窗）│
│  - 图片区域显示「替换」overlay 按钮               │
│  - 点击图片 → 弹出文件选择 → 上传 R2 → 替换 URL  │
│  - 页面顶部显示「编辑模式」状态条                  │
│                                                 │
│  编辑模式关闭时：                                 │
│  - 一切恢复正常，无任何编辑 UI 痕迹               │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 权限与可见性（已确认）

**两阶段策略**：
- **开发阶段**：编辑模式按钮对所有人可见（方便测试和数据填充）
- **正式上线后**：通过环境变量 `NEXT_PUBLIC_EDIT_MODE_PUBLIC=false` 关闭公开可见
  - 关闭后，仅管理员通过特殊路径（如 `/admin/login`）登录后才能看到编辑按钮
  - 一个开关即可切换，无需改代码

**实现方式**：
- 环境变量 `NEXT_PUBLIC_EDIT_MODE_PUBLIC`：`true`（开发）/ `false`（上线）
- `false` 时：检查 admin JWT token，有效才显示编辑按钮
- `true` 时：所有人都能看到编辑按钮（开发阶段便捷使用）

### 架构设计

**全局状态**：
- `EditModeProvider`（React Context）：管理编辑模式开关状态 + 权限检查
- 读取 `NEXT_PUBLIC_EDIT_MODE_PUBLIC` 决定可见性策略

**可编辑组件封装**：
- `EditableText`：包裹文字内容，编辑模式下可点击修改
  - props：`value`, `field`, `entityType`, `entityId`, `onSave`
  - 点击 → 变为 `<input>` 或 `<textarea>` → blur/Enter 保存 → 调用 PATCH API
- `EditableImage`：包裹图片内容，编辑模式下显示替换按钮
  - props：`src`, `field`, `entityType`, `entityId`
  - 点击 → 文件选择 → 上传 R2 → PATCH 更新 URL
- `EditableTag`：标签编辑（添加/删除标签）

**通用 PATCH API**：
```
PATCH /api/admin/edit
Body: { entityType: "production", entityId: 123, field: "title", value: "新标题" }
```
- 管理员 JWT 验证
- 白名单字段校验（防止恶意修改敏感字段）
- 支持的 entityType：production, performance, endorsement, interview, album, magazine, gallery, ...

### 适用页面（已确认：详情页 + 列表页都可编辑）

**详情页编辑**：

| 页面类型 | 可编辑字段 |
|---------|----------|
| 影视详情 | 标题、简介、海报、年份、导演、标签 |
| 演出详情 | 标题、简介、海报、日期、场馆、城市、歌单 |
| 代言详情 | 标题、品牌、品类、图片 |
| 访谈详情 | 标题、来源、主持、地点、文稿、视频链接 |
| 专辑详情 | 标题、封面、曲目、发行日期 |
| 杂志详情 | 标题、封面、期号、日期 |
| 相册详情 | 标题、描述、封面、图片集合 |
| 首页时间线 | 事件标题、描述、日期 |

**列表页与详情页绑定**（已确认）：
- 列表页卡片的标题、海报/封面均来自数据库同一条记录
- 在详情页编辑标题/海报后，列表页自动更新（数据绑定，无需单独编辑列表）
- **不需要在列表页做独立编辑功能**，所有编辑在详情页完成即可

### 涉及变更

**新建**：
- `src/components/edit/EditModeProvider.tsx` — 编辑模式全局 Context
- `src/components/edit/EditModeToggle.tsx` — 右上角开关按钮
- `src/components/edit/EditableText.tsx` — 可编辑文字组件
- `src/components/edit/EditableImage.tsx` — 可编辑图片组件
- `src/components/edit/EditableTag.tsx` — 可编辑标签组件
- `src/components/edit/EditStatusBar.tsx` — 编辑模式状态条
- `src/app/api/admin/edit/route.ts` — 通用 PATCH API

**修改**：
- `src/app/layout.tsx` — 包裹 EditModeProvider
- `src/components/layout/Header.tsx` — 嵌入 EditModeToggle
- 各详情页 — 文字/图片区域包裹 EditableText/EditableImage 组件

### 编辑历史（已确认：支持一次撤销）

**方案**：每次保存时，将修改前的值存入 `EditHistory` 表，只保留最近一条记录。

```prisma
model EditHistory {
  id         String   @id @default(cuid())
  entityType String   // "production" | "performance" | ...
  entityId   Int
  field      String   // 被修改的字段名
  oldValue   String?  // 修改前的值（JSON 序列化）
  newValue   String?  // 修改后的值
  editedBy   String?  // 操作人（admin ID 或 user ID）
  createdAt  DateTime @default(now())

  @@map("edit_history")
}
```

**交互**：
- 编辑模式下，每个已编辑过的字段旁显示「↩ 撤销」按钮
- 点击撤销 → 恢复为 `oldValue` → 删除该条 EditHistory
- 只保留最近一次修改（新的保存会覆盖旧的历史）
- 非编辑模式下不显示任何撤销 UI

**涉及文件**：
- `prisma/schema.prisma` — EditHistory 模型
- `src/app/api/admin/edit/route.ts` — 保存时写入历史
- `src/app/api/admin/edit/undo/route.ts` — 撤销 API
- `src/components/edit/EditableText.tsx` — 撤销按钮

---

## P6.7 - 全局隐藏描述字段（搜索增强）

> 给所有内容元素加一个隐藏的描述字段，前端不展示，但搜索可以命中

### 设计方案

**核心思路**：为每个内容实体添加 `searchNote` 字段（`String?`），用于存放额外的搜索关键词、背景说明、备注等信息。前端不渲染此字段，但全站搜索会检索它。

### 需要新增 `searchNote` 的模型

| 模型 | 现有搜索字段 | 新增 `searchNote` |
|------|------------|------------------|
| Production | title, titleEn, synopsis | ✅ 新增 |
| Performance | title, titleEn | ✅ 新增 |
| Endorsement | title, brand, description | ✅ 新增 |
| Interview | title, summary | ✅ 新增 |
| Livestream | title, summary | ✅ 新增 |
| Album | title, titleEn | ✅ 新增 |
| Magazine | title | ✅ 新增 |
| SocialPost | content, summary | ✅ 新增 |
| NewsArticle | title, summary | ✅ 新增 |
| Sighting | location, summary | ✅ 新增 |
| Gallery（新） | title, description | ✅ 新增 |
| Media | alt, caption | ✅ 新增 |
| TimelineEvent | title, description | ✅ 新增 |

### Media 的隐藏描述（已与 P6.5 合并）

Media 表的 `searchNote` 字段已在 P6.5 相册模块中一并新增。每张图片、视频、音频都可以有独立的搜索备注，在 Gallery 页面的编辑模式下可维护。

### 搜索查询改造

`src/lib/queries/search.ts` 中所有搜索查询需要扩展 `OR` 条件，加入 `searchNote: { contains: keyword }`。

### 涉及变更

**修改**：
- `prisma/schema.prisma` — 13 个模型各新增 `searchNote String? @map("search_note")`
- `src/lib/queries/search.ts` — 搜索条件扩展
- `src/app/api/admin/edit/route.ts` — 编辑模式支持编辑 searchNote

### 编辑模式集成

在编辑模式下，每个内容区域旁显示一个小图标（如 🔍 或 📝），点击可编辑该元素的 `searchNote`。这样管理员可以为任何内容添加搜索备注。

---

## P6.8 - 演出详情页优化

> 右侧元信息下方添加简介区域

### 现状问题

演出详情页右侧只有元信息（类型、年份、场馆、城市、系列、标签），下面是空的。Performance 模型缺少 `summary`/`description` 字段。

### 改造方案

**数据层**：
- Performance 模型新增 `summary: String?`（简介）— `@map("summary")`
- 用于存放演出的背景故事、亮点、历史意义等

**页面布局调整**：
```
┌──────────────┬──────────────────────────────┐
│              │  类型 tag                     │
│   演出海报    │  标题（大字）                  │
│   (2:3)      │  英文标题                     │
│              │  年份 · 场馆 · 城市 · 系列     │
│              │  ──────────────────           │
│              │  标签                         │
│              │  ──────────────────           │
│              │  📖 简介                      │  ← 新增
│              │  这场演唱会是张智霖"我是外星人"   │
│              │  系列巡演的第三站，首次引入...    │
└──────────────┴──────────────────────────────┘
│  🎵 歌单                                     │
│  🎬 官摄素材                                  │
│  📷 饭拍                                     │
│  📰 相关资讯                                  │
└─────────────────────────────────────────────┘
```

### 涉及变更

**修改**：
- `prisma/schema.prisma` — Performance 新增 `summary`
- `src/app/performances/[slug]/page.tsx` — 右栏新增简介展示区
- `src/lib/types.ts` — PerformanceDetail 类型包含 summary
- `src/lib/queries/performances.ts` — 查询包含 summary

---

## P6.9 - 用户收藏功能

> 用户可以收藏站内任何内容（Media、留言、影视、演出等），在个人中心查看

### 现状问题

- 当前 `FavoriteButton` 仅用 localStorage 存储，刷新/换设备就丢失
- `Like` 模型已有多态设计（userId + targetType + targetId），可复用模式

### 数据模型

```prisma
model Favorite {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation("UserFavorites", fields: [userId], references: [id], onDelete: Cascade)
  targetType String   // "media" | "guestbook" | "production" | "performance" | ...
  targetId   String   // 目标 ID
  createdAt  DateTime @default(now())

  @@unique([userId, targetType, targetId])  // 防重复收藏
  @@map("favorites")
}
```

**支持收藏的内容类型**：

| targetType | 说明 | 收藏入口 |
|-----------|------|---------|
| `media` | 图片/视频/音频 | Gallery 灯箱、各详情页图片 |
| `guestbook` | 留言 | 留言卡片的收藏按钮 |
| `production` | 影视作品 | 影视详情页 |
| `performance` | 演出 | 演出详情页 |
| `album` | 专辑 | 专辑详情页 |
| `interview` | 访谈 | 访谈详情页 |

### 用户个人中心

`/profile/favorites` — 我的收藏页面：
- Tab 分类：全部 / 图片 / 留言 / 影视 / 演出 / 专辑 / 访谈
- 每个 tab 显示对应类型的收藏内容
- 支持取消收藏

### API

- `POST /api/user/favorites` — 收藏/取消收藏（toggle）
- `GET /api/user/favorites?type=media&page=1` — 获取收藏列表
- `GET /api/user/favorites/check?targetType=media&targetId=123` — 检查是否已收藏

### 涉及变更

**新建**：
- `prisma/schema.prisma` — Favorite 模型
- `src/app/profile/favorites/page.tsx` — 我的收藏页面
- `src/components/ui/FavoriteButton.tsx` — 通用收藏按钮（替换现有 localStorage 版本）
- `src/app/api/user/favorites/` — 收藏 API
- `src/lib/queries/favorites.ts` — 收藏查询层

**修改**：
- `prisma/schema.prisma` — User 新增 `favorites` 关联
- `src/components/guestbook/FavoriteButton.tsx` — 改为数据库存储
- `src/app/profile/page.tsx` — 个人中心新增「我的收藏」入口
- Gallery 灯箱 — 添加收藏按钮
- 各详情页 — 添加收藏按钮

---

## 数据填充（持续进行，与 P5.1 合并）

| 内容 | 说明 | 优先级 |
|------|------|--------|
| 新闻爬取 | 先爬取新闻，关联到各作品 | 高 |
| 抖音/小红书 | 社交媒体内容同步 | 中 |
| 舞台整理 | 演出/舞台数据填充 | 高 |
| 访谈内容 | 配合 P6.2 界面重做，填充真实访谈数据 | 高 |

> 数据填充依赖人工整理 + 脚本辅助，与功能开发并行推进

---

## 执行顺序建议

```
第一批（Schema 批量变更 + 体验修复）：
  P6.1 体验修复 + P6.7 隐藏描述 + P6.8 演出简介
  → 一次 prisma migrate 搞定所有 Schema 新增字段

第二批（功能开发）：
  P6.2 访谈重做 → P6.3 瀑布流 → P6.4 留言增强

第三批（大模块）：
  P6.5 相册（Media 增强）→ P6.9 用户收藏 → P6.6 编辑模式

数据填充 ──────────────────── 持续并行 ──────────────────────
```

- **第一批**合并做：Schema 变更集中一次迁移，体验修复见效快
- **P6.6 编辑模式**可以提前到任意位置（加速数据填充）
- **P6.5 → P6.9**：收藏功能依赖 Gallery 灯箱，所以排在相册后面

---

## 已确认决策

| 项目 | 决策 | 确认时间 |
|------|------|---------|
| 访谈文稿格式 | JSON 结构化存储（segments 数组，含 speaker/timestamp/text） | 2026-06-10 |
| 视频播放方式 | iframe 嵌入（YouTube/Bilibili），数据库存 embedUrl | 2026-06-10 |
| 瀑布流技术 | CSS columns（零依赖，最好维护） | 2026-06-10 |
| 相册导航位置 | 留言板左侧（资料库 → 相册 → 留言） | 2026-06-10 |
| 留言图片限制 | 留言 1 张 + 评论 1 张 | 2026-06-10 |
| Interview 新字段 | host/location/duration/embedUrl，暂定这些字段名 | 2026-06-10 |
| 音频播放器 | 自定义 UI，参考设计图样式尽量还原（排版、设计、颜色） | 2026-06-10 |
| 编辑模式权限 | 开发阶段所有人可见；上线后通过开关关闭，仅管理员登录到特殊路径可见 | 2026-06-10 |
| 编辑模式保存 | 手动保存（点击保存按钮） | 2026-06-10 |
| 编辑模式范围 | 详情页编辑，列表页自动同步（数据绑定） | 2026-06-10 |
| 相册图片浏览 | 悬浮灯箱（lightbox），点击外部关闭 | 2026-06-10 |
| 相册架构 | 不建独立 Gallery 模型，Media 表 = 唯一媒体库，Gallery 页面 = Media 浏览视图 | 2026-06-10 |
| 媒体唯一存储 | 所有图片/视频/音频只存一条 Media 记录，各页面引用同一记录，删除一处处处生效 | 2026-06-10 |
| 上传即入库 | 任何页面上传 → 创建 Media（带 category + tags）→ Gallery 自动可见 | 2026-06-10 |
| 全局隐藏描述 | 所有内容模型+Media 新增 searchNote，搜索可命中但前端不展示 | 2026-06-10 |
| 演出简介 | Performance 新增 summary 字段，详情页右栏元信息下方展示 | 2026-06-10 |
| 用户收藏 | Favorite 模型（多态），替换 localStorage，支持收藏 Media/留言/影视/演出等 | 2026-06-10 |
| 编辑历史 | EditHistory 模型，支持一次撤销（保留最近一条修改记录） | 2026-06-10 |
| Gallery 分类 | 一级Tab按文件类型（全部/图片/视频/音频），二级Tag按内容用途（三套独立枚举） | 2026-06-10 |
| 图片Tag | 海报封面/活动照/写真/剧照/社交媒体图/留言图/其他（7个） | 2026-06-10 |
| 视频Tag | 活动/幕后/路透/其他 | 2026-06-10 |
| 音频Tag | 歌曲/访谈/其他 | 2026-06-10 |
| 合集入口 | 一级Tab（与图片/视频/音频并列），因为合集可包含图片+视频混合内容 | 2026-06-10 |
| Media 归属 | 新增 uploadedBy 字段，记录上传者（User ID 或 admin） | 2026-06-10 |
| 相册集 | 需要 MediaCollection 模型，Gallery 页面有「相册集」Tab，点进去看系列照片 | 2026-06-10 |

## 待确认汇总

（当前无阻塞性待确认项，可以开始执行）
