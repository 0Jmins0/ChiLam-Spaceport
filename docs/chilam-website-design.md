# 张智霖 (Chilam) 个人网站 — 设计架构文档

> 调研日期：2026-05-26
> 对齐 Obsidian 框架：01-网站框架.md + 详细设计/概览.md
> 最后讨论更新：2026-05-26

---

## 一、内容资产概览

> 完整的内容资产盘点（含全部专辑、演唱会、电视剧、电影、综艺的逐条明细）请参见 **[filmography-complete.md](./filmography-complete.md)**。

**张智霖 (Julian Cheung / Chilam)** — 1971年生于香港，1991年出道，从业 35 年。

### 1.1 作品资产

| 类别 | 数量 | 时间跨度 |
|------|------|----------|
| 音乐专辑 | 20+ 张 | 1991–2022 |
| 演唱会 | 5 场 | 2011–2022 |
| 电视剧 | ~35 部 | 1992–2025 |
| 电影 (含动画配音) | ~59 部 | 1993–2024 |
| 综艺 | 13+ 档 | 2014–2025 |
| **总计** | **~130+ 项** | **1991–2025** |

### 1.2 社交媒体资产

| 平台 | 账号 | 粉丝 | 内容量 | Phase 1 | Phase 2 |
|------|------|------|--------|---------|---------|
| **微博** | weibo.com/chilamcheung | ~2800万 | **2573 条** | 链接+概要（脚本批量抓） | 爬虫回填完整内容 |
| **Instagram** | @cheung_chi_lam | 74万 | 172 帖 | 链接+概要 | 手动补图片 |
| **抖音** | 官方认证号 | 待补充 | 44 个视频 | 链接+概要 | 手动补视频 |
| **小红书** | 官方认证号 | 待补充 | ~15 条 | 链接+概要 | 手动补图文 |
| **Facebook** | 0827chilam | 5.5K | 少 | 链接+概要 | 低优先级 |

> **渐进策略**：Phase 1 所有平台只录入链接+自动解析的概要，即可上线展示。Phase 2 再逐步回填完整内容（文字+图片+视频）。评论区更后续再补。

### 1.3 代言品牌（截至 2022，约 15 个）

| 品牌 | 身份 | 品类 | 起始 |
|------|------|------|------|
| 香港美心（西饼+月饼） | 代言人 | 餐饮 | 2013 |
| 香港信贷集团 | 代言人 | 金融 | 2014 |
| 香港身份证换领 | 换证大使 | 政府 | 2018 |
| 尊尼获加蓝牌 | 大中华区品牌大使 | 酒类 | 2019 |
| Jing Tea | 代言人 | 餐饮 | 2019 |
| 保良局 | 亲善大使 | 慈善 | 2020 |
| 露安适 | 代言人 | 母婴 | 2021 |
| 欧利时&欧品客 | 形象代言人 | 手表 | 2021 |
| 西大门 | 全球代言人 | 家居 | 2021 |
| 美赞臣 | 代言人 | 母婴 | 2021 |
| 雪花秀 | 品牌大使 | 护肤 | 2021 |
| 德芙 | 品牌大使 | 零食 | 2021 |
| 法国娇兰 | 彩妆挚友 | 彩妆 | 2021 |
| 良品铺子 | 品牌大使 | 零食 | 2021 |
| 凯迪拉克 | 品牌大使 | 汽车 | 2022 |

---

## 二、网站信息架构 (IA)

> 对齐 Obsidian 01-网站框架.md 的栏目体系

```
chilamishere.com
│
├── 01 首页 (Home) ─────────────────────
│   ├── 重要节点时间线（最新动态在最上方，不重要的过后不展示）
│   │   └── 点击节点 → 链接到相关内容页
│   ├── 大图主视觉
│   └── 一句话（找本人要）
│
├── 02 动态 (Updates) ──────────────────
│   ├── 社交媒体 (social_media)
│   │   ├── 微博（2573条）
│   │   ├── 小红书（~15条）
│   │   ├── 抖音（44条视频）
│   │   ├── Instagram（172帖）
│   │   └── Facebook（低优先级）
│   │   └── tag 筛选：微博 / 小红书 / 抖音 / Facebook / Instagram
│   │
│   ├── 新闻报道 (news)
│   │   └── 条目...
│   │
│   └── 路透 / 踪迹 (sighting)
│       └── 粉丝投稿（支持链接投稿，自动解析标题+概要）
│       └── tag：机场 / 片场 / 偶遇
│
│   ★ 核心策略：链接优先，渐进增强
│   Phase 1：所有内容只存链接+自动解析的标题/概要/封面 → 卡片展示 + "查看原文"跳转
│   Phase 2：逐步回填完整内容（全文/图片/视频）→ 站内浮动弹窗展示
│   展示方式：瀑布流卡片（参考小红书），有完整内容则站内展开，否则跳原链接
│
├── 03 影视综 (Screens) ────────────────
│   ├── 电影 (movie)
│   ├── 电视剧 (tv_series)
│   └── 综艺 (variety_show)
│       └── tag：内地 / 香港 / 台湾 / 常驻 / 飞行
│   └── 全局 tag：粤语 / 普通话
│
│   每个作品包含：
│   ├── 作品信息（海报、年份、角色、简介）
│   ├── 播放平台链接
│   └── 相关资讯（链接回动态中的新闻、路透等）
│
├── 04 演出 (Performances) ─────────────
│   ├── 演唱会 (concert)
│   │   ├── 我是外星人 (2011)
│   │   ├── Crazy Hours (2014)
│   │   ├── Miniconcert
│   │   └── 其他
│   │
│   ├── 舞台 (stage)
│   │   └── tag：演唱会嘉宾 / 其他
│   │
│   └── 音乐剧 (musical)
│
│   每个演出分为：官摄 / 饭拍（投稿制，支持链接投稿）
│
├── 05 活动 (Activities) ───────────────
│   ├── 广告代言 (endorsement)
│   │   └── 搬运广告素材
│   │
│   └── 访谈 (interview)
│       ├── tag：图文 / 音频 / 视频
│       └── 不论原始形态，都整理为统一格式的文本
│           ├── AI 自动转录（Whisper 等）→ 生成初稿
│           ├── 人工校对入口（粤语尤其需要）
│           └── 粤语 + 国语翻译对照
│
├── 06 资料库 (Archives) ───────────────
│   ├── 杂志 (magazine)
│   │   └── 元信息 + 支持扫描件投稿
│   └── 专辑 (album)
│       └── 封面、曲目、歌词、流媒体链接
│
├── 07 留言板 (Guestbook) ──────────────
│   ├── 我想对你说（留言）
│   ├── 故事分享（投稿）
│   │   └── "冷知识" 作为故事的一个 tag
│   └── 建议反馈
│
├── 08 公告 (Announcements) ────────────
│   ├── 网站公告
│   ├── 规则说明
│   └── 更新通知
│
└── 页脚 (Footer)
    ├── 社交媒体链接
    ├── 联系 / 商务合作
    └── 隐私政策 & 使用条款
```

### 全站关键词索引

每个内容条目附带关键词 tag，跨栏目通过关键词实现**相关内容检索**：
- 影视综作品页 ↔ 动态中的相关新闻/路透
- 演出页 ↔ 动态中的相关报道
- 活动代言页 ↔ 动态中的官宣微博
- 访谈文本 → 全文检索 → 全站内容匹配

---

## 三、核心页面设计建议

### 3.1 首页 (Home)

```
┌─────────────────────────────────────────────────┐
│  [导航栏]  LOGO  动态  影视综  演出  活动  资料库  │
│                  留言  公告                       │
├─────────────────────────────────────────────────┤
│                                                 │
│          ██████████████████████████              │
│          ██                      ██              │
│          ██      大图主视觉       ██              │
│          ██                      ██              │
│          ██████████████████████████              │
│                                                 │
│          "一句话"（找本人要）                      │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  ── 重要节点时间线（最新在上）──                    │
│                                                 │
│  2025.08 ──●── 披荆斩棘 2025 开播                │
│              └→ [链接到影视综详情]                 │
│                                                 │
│  2025.09 ──●── 《赴山海》播出                     │
│              └→ [链接到影视综详情]                 │
│                                                 │
│  （过时/不重要的节点自动隐藏）                      │
│                                                 │
├─────────────────────────────────────────────────┤
│  ♫ [Spotify] [Apple Music] [QQ音乐] [网易云]     │
└─────────────────────────────────────────────────┘
```

**设计要点**:
- 时间线是首页核心，最新在最上方
- 节点可链接到站内任何栏目的内容
- 不重要/过时的节点可由后台控制隐藏
- 首页保持克制，不堆砌

### 3.2 动态 — 社交媒体搬运

```
┌─────────────────────────────────────────────────┐
│  [全部] [微博] [小红书] [抖音] [Instagram] [FB]   │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ 预览卡片  │  │ 预览卡片  │  │ 预览卡片  │      │
│  │ [微博]   │  │ [抖音]   │  │ [小红书]  │      │
│  │ 概要文字  │  │ 视频封面  │  │ 图片预览  │      │
│  │ 2025.5.1 │  │ 2025.4.2 │  │ 2025.3.1 │      │
│  └──────────┘  └──────────┘  └──────────┘      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  ...     │  │  ...     │  │  ...     │      │
│  └──────────┘  └──────────┘  └──────────┘      │
│                                                 │
│  （瀑布流，参考小红书布局）                        │
│                                                 │
│  点击卡片 → 浮动弹窗展示完整内容                   │
│  （文字+图片+视频，不跳转新页面）                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

**交互要点**:
- 瀑布流卡片展示，预览+概要
- 点击卡片行为取决于内容完整度：
  - **有完整内容** → 站内浮动弹窗展开（文字+图片+视频）
  - **只有链接** → 跳转原平台（"查看原文"）
- 平台 tag 筛选
- 两种状态在卡片上无感切换，用户体验一致

### 3.3 影视综 — 作品列表

```
┌─────────────────────────────────────────────────┐
│  [电影]  [电视剧]  [综艺]  ← tab 切换             │
│                                                 │
│  筛选：全部 | 90年代 | 00年代 | 10年代 | 20年代    │
│  语言：全部 | 粤语 | 普通话                        │
│                                                 │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐ │
│  │ 海报图  │  │ 海报图  │  │ 海报图  │  │ 海报图  │ │
│  │射雕英雄 │  │十月初五 │  │冲上云霄 │  │家族荣耀 │ │
│  │传 1994 │  │的月光   │  │II 2013│  │  2022  │ │
│  │郭靖    │  │文初     │  │Cool魔  │  │        │ │
│  └────────┘  └────────┘  └────────┘  └────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

**每个作品详情页包含**:
- 作品信息（海报、年份、角色、简介）
- 播放平台链接
- **相关资讯区**：通过关键词自动关联动态中的新闻、路透

### 3.4 演出 — 官摄/饭拍分区

```
┌─────────────────────────────────────────────────┐
│  [演唱会]  [舞台]  [音乐剧]  ← tab 切换          │
├─────────────────────────────────────────────────┤
│                                                 │
│  Crazy Hours Live 2014 · 香港红磡                │
│                                                 │
│  [官摄]  [饭拍]  ← 子 tab                        │
│                                                 │
│  官摄：                                          │
│  ┌──────────────────────────────────────┐        │
│  │  ▶ 官方演唱会视频                      │        │
│  │  曲目单 / 海报 / 照片                  │        │
│  └──────────────────────────────────────┘        │
│                                                 │
│  饭拍（粉丝投稿）：                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ 投稿视频  │  │ 投稿视频  │  │ 投稿照片  │       │
│  │ @拍摄者  │  │ @拍摄者  │  │ @拍摄者  │       │
│  └──────────┘  └──────────┘  └──────────┘       │
│                                                 │
│  [我要投稿饭拍]                                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 3.5 活动 — 访谈统一文本化

```
┌─────────────────────────────────────────────────┐
│  [广告代言]  [访谈]  ← tab 切换                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  访谈详情页：                                     │
│                                                 │
│  标题：XXX 专访 · 2024                           │
│  原始形态：[视频] / [音频] / [图文]               │
│  来源：XXX 媒体                                  │
│                                                 │
│  ┌──────────────────────────────────────┐        │
│  │  ▶ 原始视频/音频播放器                  │        │
│  └──────────────────────────────────────┘        │
│                                                 │
│  ── 文字稿 ──                                    │
│  ┌──────────────────────────────────────┐        │
│  │  [粤语原文]  [国语翻译]  ← 切换        │        │
│  │                                      │        │
│  │  Q: .......                          │        │
│  │  A: .......                          │        │
│  │                                      │        │
│  │  ⚠ AI 转录，已人工校对 ✓              │        │
│  │  （或：⚠ AI 转录，待校对）             │        │
│  └──────────────────────────────────────┘        │
│                                                 │
└─────────────────────────────────────────────────┘
```

**访谈处理流程**:
```
粉丝投稿（视频/音频/文本）
    → AI 自动转录（Whisper）
    → 生成粤语初稿
    → 人工校对入口（标记校对状态）
    → 国语翻译
    → 发布（附校对状态标识）
```

### 3.6 留言板 (Guestbook)

```
┌─────────────────────────────────────────────────┐
│  [我想对你说]  [故事分享]  [建议反馈]  ← tab       │
├─────────────────────────────────────────────────┤
│                                                 │
│  ── 我想对你说 ──                                │
│  简单留言，低门槛                                  │
│                                                 │
│  ── 故事分享 ──                                  │
│  较长篇幅投稿，支持图片                             │
│  tag: 追星经历 / 影视回忆 / 音乐记忆 / 冷知识 / 其他│
│  时间轴展示（以 Chilam 职业生涯为主轴）              │
│                                                 │
│  ── 建议反馈 ──                                  │
│  网站功能建议、bug反馈等                            │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 四、内容导入技术方案

### 4.1 核心策略：链接优先，渐进增强

```
┌─────────────────────────────────────────────────────────────┐
│                      渐进增强路线                             │
├─────────────────────────┬───────────────────────────────────┤
│                         │                                   │
│  Phase 1: 链接模式       │  Phase 2: 完整内容模式             │
│  (快速上线)              │  (逐步增强)                        │
│                         │                                   │
│  ┌───────────────────┐  │  ┌───────────────────────────┐    │
│  │ 粘贴/批量导入链接  │  │  │ 微博爬虫回填完整内容       │    │
│  │       ↓            │  │  │ 手动上传图片/视频          │    │
│  │ URL 解析服务       │  │  │       ↓                    │    │
│  │ 自动提取:          │  │  │ 填充 content_text         │    │
│  │  - 标题            │  │  │ 填充 images[]             │    │
│  │  - 概要/描述       │  │  │ 填充 videos[]             │    │
│  │  - 封面图          │  │  │ 标记 is_full_copy = true  │    │
│  │  - 发布日期        │  │  │                            │    │
│  │  - 平台识别        │  │  │ 前端自动切换展示模式：     │    │
│  │       ↓            │  │  │ 有内容→站内展开           │    │
│  │ 卡片展示           │  │  │ 只有链接→跳转原文         │    │
│  │ + "查看原文" 跳转  │  │  └───────────────────────────┘    │
│  └───────────────────┘  │                                   │
│                         │                                   │
└─────────────────────────┴───────────────────────────────────┘
```

### 4.2 URL 解析服务

所有栏目共用的基础能力 — 粘贴链接自动提取元信息：

```
GET /api/parse-url?url=https://weibo.com/xxx

返回:
{
  title: "张智霖：...",
  description: "今天在片场...",
  thumbnail: "https://...",
  publishedAt: "2025-05-20",
  platform: "weibo"        // 自动识别平台
}
```

| 解析方式 | 适用平台 | 说明 |
|----------|----------|------|
| Open Graph 标签 | 大部分网站 | 读取 og:title / og:description / og:image |
| oEmbed | YouTube / B站等 | 标准嵌入协议 |
| 页面抓取 | 微博等 | JS 渲染页需 headless browser |
| 手动填写降级 | 抖音/小红书等 | 解析失败时手动输入标题和概要 |

**复用场景**：

| 栏目 | 场景 | 粘贴链接来源 |
|------|------|-------------|
| 动态-社交媒体 | 运营录入/批量导入 | 微博/IG/抖音/小红书帖子 |
| 动态-新闻报道 | 运营录入 | 新闻网址 |
| 动态-路透 | 粉丝投稿 | 微博/小红书帖子链接 |
| 演出-饭拍 | 粉丝投稿 | B站/YouTube/微博视频链接 |
| 活动-访谈 | 运营/粉丝投稿 | 视频/文章链接 |
| 资料库-杂志 | 粉丝投稿 | 图文链接 |

### 4.3 各平台 Phase 1 导入方案

| 平台 | 内容量 | Phase 1 方式 | 说明 |
|------|--------|-------------|------|
| **微博** | 2573 条 | Python 脚本批量抓取列表页的链接+标题+日期 | 不进详情页，只抓列表信息，难度低 |
| **Instagram** | 172 帖 | 手动/半自动录入链接 | 量可控 |
| **抖音** | 44 条 | 手动录入链接 | 量小 |
| **小红书** | ~15 条 | 手动录入链接 | 量小 |
| **Facebook** | 少 | 暂缓 | 低优先级 |

### 4.4 微博 Phase 2 爬虫方案（回填完整内容）

| 环节 | 方案 | 说明 |
|------|------|------|
| 抓取工具 | Python + Playwright | 模拟浏览器绕过 JS 渲染 |
| 登录态 | Cookie 注入 | 微博需要登录才能看到完整内容 |
| 抓取内容 | 文字 + 图片URL + 视频URL | 只抓本体，不抓评论 |
| 图片下载 | 批量下载原图 | 保存原始分辨率 |
| 视频下载 | yt-dlp / 直链下载 | 完整视频文件 |
| 频率控制 | 2-3秒/条，随机延迟 | 防封号 |
| 回填方式 | UPDATE social_posts SET content_text=..., images=..., is_full_copy=true | 逐条回填，不影响已上线内容 |
| 增量更新 | 定时任务，只抓新发布 | 全量回填完成后切增量模式 |
| 降级方案 | 后台手动录入入口 | 爬虫挂了时的兜底 |

### 4.5 数据存储预估

**Phase 1（链接模式）**：

| 数据类型 | 量级 | 存储 |
|----------|------|------|
| 全平台链接+元信息 | ~2800 条 | ~10 MB（纯数据库） |
| 缩略图缓存（可选） | ~2800 张 | ~1-3 GB |
| **合计** | — | **< 5 GB** |

> Phase 1 几乎无存储成本，数据库即可承载。

**Phase 2（完整内容回填后）**：

| 数据类型 | 量级 | 存储预估 |
|----------|------|----------|
| 微博图片 | ~5000-10000 张 | ~10-30 GB |
| 微博视频 | ~200-500 个 | ~50-200 GB |
| 抖音视频 | 44 个 | ~5-15 GB |
| IG 图片 | ~500 张 | ~2-5 GB |
| 小红书图文 | ~15 条 | < 1 GB |
| **合计** | — | **~70-250 GB** |

> Phase 2 建议使用对象存储（Cloudflare R2 / 阿里云 OSS），按量付费，月成本约 ¥50-200。

---

## 五、访谈转录技术方案

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  投稿上传     │ →  │  AI 转录      │ →  │  人工校对     │
│  视频/音频/   │    │  Whisper API  │    │  后台编辑器   │
│  文本         │    │  → 粤语文本   │    │  标记校对状态 │
└──────────────┘    └──────────────┘    └──────────────┘
                                              │
                                        ┌─────▼─────┐
                                        │  国语翻译  │
                                        │  (人工/AI) │
                                        └─────┬─────┘
                                              │
                                        ┌─────▼─────┐
                                        │  发布      │
                                        │  全文可检索 │
                                        └───────────┘
```

| 环节 | 工具 | 说明 |
|------|------|------|
| 语音转文字 | OpenAI Whisper API | 支持粤语，但准确率需要人工校对 |
| 校对 | 后台富文本编辑器 | 标记状态：待校对 / 已校对 |
| 翻译 | 人工为主，AI 辅助 | 粤语→国语，保留双语对照 |
| 检索 | 全文索引 | 访谈文本纳入全站关键词检索 |

---

## 六、内容模型设计

### 6.1 CMS 内容模型 (Sanity)

```typescript
// 影视综作品
Production {
  title: string
  slug: slug
  type: 'movie' | 'tv_series' | 'variety_show'
  posterImage: image
  year: number
  role: string
  tags: array<string>  // 粤语, 普通话, 内地, 香港, 常驻, 飞行...
  synopsis?: text
  gallery: array<image>
  watchLinks: array<{ platform, url }>
  relatedKeywords: array<string>  // 用于跨栏目关联
}

// 演出
Performance {
  title: string
  slug: slug
  type: 'concert' | 'stage' | 'musical'
  year: number
  venue: string
  city: string
  posterImage: image
  officialMedia: { videos: array, photos: array }  // 官摄
  setlist?: array<string>
  tags: array<string>  // 演唱会嘉宾, 其他...
  relatedKeywords: array<string>
}

// 专辑
Album {
  title: string
  slug: slug
  coverImage: image
  releaseYear: number
  language: '粤语' | '国语' | '粤语/国语'
  tracks: array<{ number, title, lyrics?, duration? }>
  streamingLinks: { spotify?, appleMusic?, qqMusic?, neteaseMusic? }
}

// 广告代言
Endorsement {
  brand: string
  role: string  // 代言人, 品牌大使, 彩妆挚友...
  category: string  // 餐饮, 金融, 护肤...
  startYear: number
  endYear?: number
  media: array<image | video>
  relatedKeywords: array<string>
}

// 访谈
Interview {
  title: string
  slug: slug
  source: string  // 来源媒体
  date: date
  mediaType: 'video' | 'audio' | 'text'
  originalMedia?: file  // 原始视频/音频
  transcriptCantonese?: text  // 粤语文本
  transcriptMandarin?: text  // 国语翻译
  proofreadStatus: 'pending' | 'proofread'  // 校对状态
  tags: array<string>
  relatedKeywords: array<string>
}

// 杂志
Magazine {
  title: string  // 杂志名
  issue: string  // 期号
  date: date
  coverImage?: image
  scans: array<image>  // 扫描件（投稿）
  relatedKeywords: array<string>
}

// 首页时间线节点
TimelineEvent {
  date: date
  title: string
  description?: text
  isVisible: boolean  // 控制是否显示
  linkedContent?: reference  // 链接到任意内容
}

// 公告
Announcement {
  title: string
  type: 'notice' | 'rule' | 'update'
  content: text
  publishDate: date
}
```

### 6.2 动态数据模型 (Supabase)

```sql
-- 社交媒体动态（统一格式，支持链接优先+渐进增强）
CREATE TABLE social_posts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform       TEXT NOT NULL,  -- weibo | instagram | douyin | xiaohongshu | facebook

  -- Phase 1 必填：链接 + 自动解析的元信息
  original_url   TEXT NOT NULL,  -- 原始链接（核心字段）
  original_id    TEXT,           -- 原平台帖子ID（去重用）
  title          TEXT,           -- 自动解析或手动填写的标题
  summary        TEXT,           -- 自动解析或手动填写的概要
  thumbnail_url  TEXT,           -- 自动解析的封面图/缩略图
  published_at   TIMESTAMPTZ,   -- 原始发布时间

  -- Phase 2 回填：完整内容（初始为空）
  content_text   TEXT,           -- 完整文字内容
  images         JSONB DEFAULT '[]',  -- 图片URL数组（站内存储）
  videos         JSONB DEFAULT '[]',  -- 视频URL数组（站内存储）
  is_full_copy   BOOLEAN DEFAULT FALSE,  -- 是否已回填完整内容

  -- 通用
  keywords       TEXT[],         -- 关键词tag（跨栏目关联用）
  import_method  TEXT DEFAULT 'manual',  -- link_parse | crawler | manual
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_social_posts_platform ON social_posts(platform);
CREATE INDEX idx_social_posts_published ON social_posts(published_at DESC);
CREATE UNIQUE INDEX idx_social_posts_dedup ON social_posts(platform, original_id);

-- 路透/踪迹（粉丝投稿，支持链接投稿）
CREATE TABLE sightings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Phase 1：链接投稿 + 自动解析
  original_url   TEXT,              -- 粉丝提交的链接（微博/小红书/抖音等）
  title          TEXT NOT NULL,
  summary        TEXT,              -- 自动解析或手动填写的概要
  thumbnail_url  TEXT,              -- 自动解析的封面图
  -- Phase 2：完整内容（回填或直接上传）
  content      TEXT,
  location_tag TEXT,  -- 机场 | 片场 | 偶遇
  images       JSONB DEFAULT '[]',
  videos       JSONB DEFAULT '[]',
  is_full_copy BOOLEAN DEFAULT FALSE,
  -- 通用
  author_name  TEXT NOT NULL,
  status       TEXT DEFAULT 'pending',  -- pending | approved | rejected
  submit_type  TEXT DEFAULT 'link',     -- link | upload | mixed
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- 饭拍投稿（支持链接投稿）
CREATE TABLE fan_shots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  performance_id  TEXT NOT NULL,     -- 关联的演出（CMS中的ID）
  -- Phase 1：链接投稿 + 自动解析
  original_url    TEXT,              -- 粉丝提交的链接（B站/微博/YouTube等）
  title           TEXT,
  summary         TEXT,              -- 自动解析的概要
  thumbnail_url   TEXT,              -- 自动解析的封面图
  -- Phase 2：完整内容（回填或直接上传）
  media_type      TEXT,              -- photo | video
  media_urls      JSONB DEFAULT '[]',
  is_full_copy    BOOLEAN DEFAULT FALSE,
  -- 通用
  author_name     TEXT NOT NULL,
  contact_info    TEXT,              -- 仅后台可见
  submit_type     TEXT DEFAULT 'link',  -- link | upload | mixed
  status          TEXT DEFAULT 'pending',
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- 留言板
CREATE TABLE guestbook (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tab         TEXT NOT NULL,  -- message | story | feedback
  nickname    TEXT NOT NULL,
  content     TEXT NOT NULL,
  images      JSONB DEFAULT '[]',
  tags        TEXT[],         -- 追星经历, 影视回忆, 音乐记忆, 冷知识, 其他
  related_year INTEGER,       -- 故事关联年份（故事分享用）
  likes_count INTEGER DEFAULT 0,
  status      TEXT DEFAULT 'pending',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 留言/故事回复
CREATE TABLE comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type TEXT NOT NULL,  -- guestbook | sighting | fan_shot
  target_id   UUID NOT NULL,
  nickname    TEXT NOT NULL,
  content     TEXT NOT NULL CHECK (char_length(content) <= 300),
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

---

## 七、技术架构

### 7.1 整体架构

```
                         ┌──────────────┐
                         │  Vercel CDN   │
                         └──────┬───────┘
                                │
                         ┌──────▼───────┐
                         │  Next.js 14+  │
                         │  (App Router) │
                         └──────┬───────┘
                                │
         ┌──────────────────────┼──────────────────────┐
         │                      │                      │
  ┌──────▼──────┐       ┌──────▼──────┐       ┌───────▼──────┐
  │  Sanity CMS  │       │  Supabase   │       │  R2 / OSS    │
  │  影视综/演出  │       │  动态/留言   │       │  图片/视频    │
  │  活动/资料库  │       │  投稿/饭拍   │       │  P1<5GB      │
  │  时间线/公告  │       │             │       │  P2~70-250GB │
  └─────────────┘       └──────┬──────┘       └──────────────┘
                               │
                 ┌─────────────┼─────────────┐
                 │                           │
          ┌──────▼──────┐            ┌───────▼──────┐
          │  微博爬虫    │            │  URL 解析服务  │
          │  Python     │            │  /api/parse-url│
          │  定时任务    │            │  OG/oEmbed    │
          └─────────────┘            └──────────────┘
```

### 7.2 技术选型

| 层级 | 选型 | 理由 |
|------|------|------|
| **框架** | Next.js 14+ (App Router) | SSG 作品页 + SSR 动态内容 |
| **语言** | TypeScript | 类型安全 |
| **样式** | Tailwind CSS | 快速构建响应式布局 |
| **UI** | shadcn/ui + Radix UI | 可定制，无障碍友好 |
| **动画** | Framer Motion | 时间线、瀑布流、浮动弹窗 |
| **CMS** | Sanity | 结构化内容（影视综/演出/活动/资料库/时间线/公告） |
| **数据库** | Supabase (PostgreSQL) | UGC内容（动态/留言/投稿/饭拍） |
| **文件存储** | Cloudflare R2 / 阿里云 OSS | 大量图片视频，按量付费 |
| **图片优化** | Next.js Image + Sharp | 自动格式转换、响应式 |
| **搜索** | Meilisearch | 全站关键词检索（含访谈全文） |
| **URL 解析** | `/api/parse-url` (OG/oEmbed/Playwright) | 链接投稿自动解析标题/概要/封面 |
| **爬虫** | Python + Playwright | 微博全量抓取 + 增量更新 |
| **转录** | OpenAI Whisper API | 访谈音视频转文字 |
| **部署** | Vercel | Next.js 深度集成，全球 CDN |

---

## 八、视觉设计建议

### 8.1 设计调性

```
关键词：时光电影感 · 深邃舞台感 · 琥珀金奢华 · 港风质感 · 成熟绅士
```

- 全站以深色为主基调，营造电影胶片与舞台光影的沉浸感
- 琥珀金作为唯一强调色，贯穿所有交互元素
- 胶片颗粒噪声叠加，增添复古质感
- 超细金线(0.5px)分隔，精致而不喧宾夺主

### 8.2 配色方案

| 用途 | 色值 | CSS 变量 | 说明 |
|------|------|----------|------|
| 主背景（深） | `#1A1A2E` | `--color-bg-dark` | 深海靛蓝 — 全站默认背景，电影胶片感 |
| 深层背景 | `#12121F` | `--color-bg-darker` | 更深层区域（页脚等） |
| 辅助背景（浅） | `#F5F0EB` | `--color-bg-light` | 暖灰燕麦色 — 长文阅读区，少量使用 |
| 核心强调色 | `#C49B63` | `--color-accent` | 哑光琥珀金 — 按钮、高亮、时间线 |
| 强调色 Hover | `#D4AB73` | `--color-accent-hover` | 琥珀金悬停态 |
| 半透明金 | `rgba(196,155,99,0.3)` | `--color-accent-dim` | 金线、滚动条 |
| 主文字 | `#FFFFFF` | `--color-text-primary` | 深色背景上的白色文字 |
| 次要文字 | `rgba(255,255,255,0.6)` | `--color-text-secondary` | 辅助说明文字 |
| 淡化文字 | `rgba(255,255,255,0.4)` | `--color-text-muted` | 最弱层级文字 |
| 深色区文字 | `#2D2D2D` | `--color-text-dark` | 浅色背景上的正文 |
| 精细分隔线 | `#D1C7BC` | `--color-border` | 浅香槟灰 |
| 金色边框 | `rgba(196,155,99,0.3)` | `--color-border-gold` | 卡片、模块边框 |
| 毛玻璃 | `rgba(26,26,46,0.85)` | `--color-glass` | 导航栏滚动态、弹窗背景 |

### 8.3 字体系统

| 层级 | 中文字体 | 英文字体 | CSS 变量 | 用途 |
|------|---------|---------|----------|------|
| H1/H2 情感大标题 | Noto Serif SC (Medium/Bold) | Playfair Display | `--font-heading` | 页面标题、LOGO |
| 正文/标签 | Noto Sans SC | Inter | `--font-body` | 正文、卡片、导航 |
| 时间/年份 | — | Cormorant Garamond (Italic) | `--font-display` | 时间线年份、装饰数字 |

**加载方式**：通过 `next/font/google` 按需加载，自动优化，零 FOIT。

### 8.4 关键视觉元素

| 元素 | 实现方式 | CSS class |
|------|---------|-----------|
| 胶片颗粒噪声 | SVG feTurbulence 滤镜，3% 不透明度全局覆盖 | `.film-grain` |
| 琥珀金细线 | 渐变 0.5px 线条（两端透明渐隐） | `.gold-line` / `.gold-line-vertical` |
| 毛玻璃效果 | backdrop-filter: blur(12px) + 半透明深靛蓝 | `.glass` |
| 自定义滚动条 | 6px 宽，深色轨道 + 金色滑块 | 全局 webkit-scrollbar |
| 选中文字 | 琥珀金半透明背景 | `::selection` |
| 年份暗纹 | 底部 1991-2026 年份排列，5%透明度，随机泛金动画 | `YearMarquee` 组件 |

---

## 九、响应式布局策略

| 断点 | 宽度 | 布局策略 |
|------|------|----------|
| Mobile | < 768px | 单列，汉堡菜单，卡片堆叠 |
| Tablet | 768–1024px | 双列网格 |
| Desktop | 1024–1440px | 三/四列网格，顶部导航 |
| Wide | > 1440px | 1440px 居中 |

---

## 十、项目分期建议

> **核心原则**：Phase 1 全站采用**链接优先**模式，所有内容只录入链接+自动解析的元信息（标题/概要/封面），即可上线展示。后续 Phase 逐步回填完整内容。
>
> **Phase 1 存储预估 < 5GB**（纯链接+元信息），**Phase 2+ 回填完整内容后 ~70–250GB**。

### Phase 1 — 骨架 + 链接优先上线（4–6 周）

- [ ] 首页（时间线 + 大图 + 一句话）
- [ ] 影视综（电影/电视剧/综艺列表 + 详情页）— Sanity CMS 录入
- [ ] 资料库（专辑列表 + 详情页）— Sanity CMS 录入
- [ ] 公告页
- [ ] **URL 解析服务** `/api/parse-url`（OG / oEmbed / Playwright fallback）
- [ ] **动态页**：微博 2573 条链接批量导入（Python 脚本抓列表页链接+标题），IG/抖音/小红书手动贴链接
- [ ] 动态瀑布流展示（卡片 = 标题+概要+封面+平台标签，点击跳原链接）
- [ ] **路透/饭拍投稿**：链接投稿表单 → 自动解析 → 审核后展示
- [ ] Supabase 数据库搭建（social_posts / sightings / fan_shots / guestbook）
- [ ] 后台手动录入兜底入口
- [ ] 响应式适配 + 部署

### Phase 2 — 内容回填 + 站内展示（3–4 周）

- [ ] 微博爬虫全量回填完整内容（文字+图片+视频）→ `is_full_copy = true`
- [ ] 手动回填抖音/小红书/IG 的图片视频
- [ ] 动态页升级：有完整内容的卡片支持站内浮动弹窗展示
- [ ] 新闻报道录入

### Phase 3 — 演出 + 活动（3–4 周）

- [ ] 演出板块（演唱会/舞台/音乐剧，官摄/饭拍分区）
- [ ] 饭拍投稿支持直接上传（link + upload 双模式）
- [ ] 活动板块（代言 + 访谈）
- [ ] 访谈转录流程（Whisper + 校对后台）
- [ ] 路透投稿支持直接上传

### Phase 4 — 社区 + 检索（2–3 周）

- [ ] 留言板三个 tab（我想对你说 / 故事分享 / 建议反馈）
- [ ] 全站关键词检索（Meilisearch）
- [ ] 跨栏目内容关联
- [ ] 杂志扫描件投稿

### Phase 5 — 增强（持续）

- [ ] 微博增量爬虫定时任务
- [ ] 评论区爬取（微博/抖音/小红书）
- [ ] 多语言（简体/繁体/English）
- [ ] 数据分析看板
- [ ] 性能优化

---

## 参考来源

- [张智霖 — 百度百科](https://baike.baidu.com/item/%E5%BC%A0%E6%99%BA%E9%9C%96/396238)
- [张智霖 — 维基百科](https://zh.wikipedia.org/zh-hans/%E5%BC%B5%E6%99%BA%E9%9C%96)
- [张智霖全部作品 — 豆瓣](https://movie.douban.com/celebrity/1050979/movies?sortby=time&format=pic)
- [张智霖代言品牌统计 — 豆瓣](https://www.douban.com/group/topic/258547218/)
- [Essential Pages for a Musician Website — InClassics](https://inclassics.com/blog/essential-pages-for-a-musician-website-what-you-need-why)
- [15 Best Celebrity Website Design Examples — Fireart](https://fireart.studio/blog/15-great-celebrity-website-examples/)
