# 开发进度记录

## 当前阶段: P6 用户反馈迭代（P6.1 + P6.2 + P6.3 + P6.4 + P6.5 + P6.6 + P6.8 + P6.10 + P6.11 + P6.12 + P6.13 + P6.15 + P6.16 + P6.17 + P6.19 + P6.20 + P6.21 + P6.22 + P6.23 + P6.24 + P6.25 + P6.26 + P6.27 + P6.28 已完成）

---

## 进度总览

| 模块 | 状态 | 最后更新 |
|------|------|----------|
| 项目初始化 | ✅ 已完成 | 2026-06-06 |
| 数据库设计 | ✅ 已完成 | 2026-06-06 |
| 首页 | ✅ 已完成 | 2026-06-06 |
| 动态模块 | ✅ 已完成（已重新开放 + 大标题/单条开关 + 媒体上传 + 跨栏目关联） | 2026-07-01 |
| 影视模块 | ✅ 已完成 | 2026-06-06 |
| 演出模块 | ✅ 已完成 | 2026-06-06 |
| 活动模块 | ✅ 已完成（代言+直播，封面+媒体上传，访谈已独立） | 2026-06-15 |
| 霖言霖语模块 | ✅ 已完成（独立栏目 + UI 精细化 + 封面上传） | 2026-06-16 |
| 资料库模块 | ✅ 已完成 | 2026-06-07 |
| 留言板 | ✅ 已完成（含故事 tag 筛选 + 登录权限 + 精选/图片上传 + 卡片布局优化） | 2026-06-16 |
| 用户系统 | ✅ 已完成（注册/登录/权限） | 2026-06-10 |
| 用户个人页面 | ✅ 已完成（个人中心/留言管理/设置/头像上传） | 2026-06-10 |
| 公告模块 | ✅ 已完成 | 2026-06-07 |
| 后台管理(API) | ✅ 已完成（管理员编辑会话 + 批量保存/删除 + 权限加固） | 2026-07-01 |
| R2 存储配置 | ✅ 已完成（正式/临时编辑上传路径分离） | 2026-07-01 |
| 相册模块 | ✅ 已完成（图片/视频/音频/合集 + Tag 筛选 + Lightbox + 相册集 + 瀑布流比例限制） | 2026-07-01 |
| 全站检索 | ✅ 已完成 | 2026-06-10 |
| 部署上线 | 未开始 | - |

---

## 详细记录

### 2026-07-01 - P6.28 管理员编辑会话与媒体删除保存（已完成）

#### 完成内容
- **编辑会话机制**：编辑模式从即时写库改为前端会话暂存，支持统一保存和退出丢弃
- **保存/退出状态栏**：编辑状态栏显示待保存项、上传中、保存中和错误状态，保存成功后刷新页面
- **临时上传转正式媒体**：管理员编辑上传先写入 `temp/admin-edits/{sessionId}/...`，保存时复制到正式 `images/videos/audio/files` 路径并创建 `Media` 记录
- **媒体删除支持**：图册图片/视频删除先标记，保存时批量断开关系；无其他引用时删除 `Media` 记录和 R2 文件
- **封面/海报替换**：直接 FK 媒体替换走编辑会话，保存时更新关系并清理不再引用的旧媒体
- **条目删除支持**：详情页编辑模式新增删除条目入口，保存时删除内容记录并清理不再引用的媒体
- **关联清理**：删除内容条目时同步删除 `content_relations` 中作为 source/target 的关联，避免相关内容残留 404 链接
- **批量删除修复**：保存时按 `target + targetId + relation` 分组去重断开媒体关系，避免重复删除导致提交失败
- **删除标记保持**：删除条目和删除媒体状态从全局 pending 操作派生，重新进入详情页仍显示已标记状态
- **后端权限加固**：主要内容详情 `PUT/DELETE` 接口补充管理员校验，避免非管理员直接调用编辑/删除 API
- **上传兼容修复**：管理员编辑 presign 接口兼容前端未传 `uploadId` 的场景，并同时返回 `tempKey/publicTempUrl` 与 `key/publicUrl`

#### 涉及文件
- `src/components/edit/EditModeProvider.tsx` — 编辑会话、pending 操作、保存/退出流程
- `src/components/edit/EditStatusBar.tsx` — 保存/退出和状态提示
- `src/components/edit/EditModeToggle.tsx` — 切换编辑模式走会话退出逻辑
- `src/components/edit/EditableText.tsx` — 文本编辑改为草稿注册
- `src/components/edit/EditableImage.tsx` — 封面/海报替换改为临时上传 + 保存提交
- `src/components/edit/EditableMediaGallery.tsx` — 图册上传/删除改为临时上传和 pending 状态
- `src/components/edit/DeleteEntryButton.tsx` — 详情页删除条目入口
- `src/components/edit/types.ts` — 编辑会话操作类型
- `src/app/api/admin/edit/commit/route.ts` — 管理员编辑批量提交 API
- `src/app/api/admin/edit/uploads/presign/route.ts` — 管理员临时上传预签名 API
- `src/app/api/admin/edit/uploads/cleanup/route.ts` — 退出编辑时清理临时上传
- `src/lib/admin-edit-commit.ts` — 批量保存、媒体转正、删除、关联清理逻辑
- `src/lib/admin-edit-config.ts` — 可编辑字段白名单和字段类型转换
- `src/lib/media-relations.ts` — 媒体直接 FK / 多对多关系配置
- `src/lib/media-cleanup.ts` — 媒体引用检查和 R2 清理
- `src/lib/r2.ts` — R2 copy、临时 key、正式 key、批量删除工具
- 多个详情页 — 接入 `DeleteEntryButton`
- 多个内容 API 路由 — 补充 `verifyAdmin` 写操作校验

#### 验证
- `pnpm exec tsc --noEmit` 通过
- `pnpm build` 通过（需要联网获取 Google Fonts；沙箱网络下会因字体拉取失败，授权联网后通过）
- 全量 `pnpm lint` 仍受既有 `scripts/*.ts` 中 `no-explicit-any` 问题阻塞，非本次改动引入

### 2026-07-01 - P6.27 相册瀑布流比例与详情适配（已完成）

#### 完成内容
- **瀑布流比例范围**：新增 `getClampedMediaAspectRatio`，相册卡片按 `9:16` 到 `16:9` 范围展示，避免超长图或超宽图撑破瀑布流
- **卡片自动裁剪**：相册图片/视频封面改为固定比例容器 + `object-cover`，超出比例范围的画面自动裁剪
- **默认比例优化**：无尺寸信息的图片默认使用 `3:4`，视频默认使用 `16:9`
- **详情页适配视口**：Lightbox 改为媒体区 + 底部信息区布局，图片/视频使用 `object-contain` 在视口内完整展示
- **信息区不遮挡媒体**：底部 caption/source/index 从覆盖层改为独立区域，长说明限制两行，避免遮挡长图

#### 涉及文件
- `src/lib/update-media.ts` — 新增媒体比例钳制工具
- `src/components/gallery/GalleryCard.tsx` — 相册卡片使用比例范围和裁剪预览
- `src/components/gallery/LightboxViewer.tsx` — 详情弹层改为视口内完整适配

#### 验证
- `pnpm exec eslint src/lib/update-media.ts src/components/gallery/GalleryCard.tsx src/components/gallery/LightboxViewer.tsx` 通过
- `pnpm exec prettier --check src/lib/update-media.ts src/components/gallery/GalleryCard.tsx src/components/gallery/LightboxViewer.tsx` 通过
- `pnpm exec tsc --noEmit --incremental false` 通过
- 全量 `pnpm lint` 仍受既有 `scripts/*.ts` 中 `no-explicit-any` 问题阻塞，非本次改动引入

### 2026-07-01 - P6.26 动态模块重新开放与维护增强（已完成）

#### 完成内容
- **动态入口恢复**：主导航重新开放 `/updates`，并通过 `Category.isVisible` 控制普通前台是否展示动态整体入口
- **大标题开关**：编辑模式下可维护「动态整体 / 社交媒体 / 新闻 / 路透」四个栏目开关；普通模式只显示已开放栏目
- **单条内容开关**：`social_posts`、`news_articles`、`sightings` 新增 `isVisible` 字段，每条动态可单独控制前台展示
- **tag/filter 展示规则**：普通模式只显示有可见内容的筛选项；编辑模式显示全部平台/tag，便于提前维护
- **动态详情维护**：社交媒体、新闻、路透详情页接入 `EditableText` 和 `EditableMediaGallery`，支持编辑标题/正文/来源信息，上传图片、GIF 动图和视频
- **上传安全收紧**：带 `target/relation` 的媒体绑定接口需要管理员 token，避免直接调用 API 绑定内容
- **站内详情入口**：动态列表卡片跳转站内详情页，原文链接保留在详情页按钮中，便于进入编辑维护流程
- **跨栏目双向关联**：新增通用内容关联 API 和组件，动态详情页可关联影视/演出/活动/访谈/资料库；影视与演出详情页反向显示相关动态
- **隐藏内容防泄露**：普通查询、详情查询和全站搜索默认过滤 `isVisible=false` 的动态内容；隐藏内容管理走管理员 API

#### 涉及文件
- `prisma/schema.prisma` — SocialPost / NewsArticle / Sighting 新增 `isVisible`
- `prisma/migrations/20260701090000_add_update_visibility/migration.sql` — 新增可见性字段与索引
- `src/config/navigation.ts` — 恢复动态导航
- `src/lib/queries/updates.ts` — 可见性过滤、栏目状态、平台/tag 统计、媒体预览
- `src/lib/queries/search.ts` — 搜索过滤隐藏动态
- `src/app/updates/page.tsx` — 栏目开关面板、全量管理面板、新增入口、站内卡片跳转
- `src/components/updates/UpdateCategoryVisibilityPanel.tsx` — 动态整体与大标题开关
- `src/components/updates/UpdatesAdminPanel.tsx` — 当前 tab 全量内容维护列表
- `src/components/updates/UpdateItemVisibilityToggle.tsx` — 单条内容展示开关
- `src/components/updates/UpdatesFilterBar.tsx` — 普通/编辑模式下不同筛选展示规则
- `src/app/updates/social/[id]/page.tsx` — 社交动态详情编辑、媒体上传、内容关联
- `src/app/updates/news/[slug]/page.tsx` — 新闻详情编辑、媒体上传、内容关联
- `src/app/updates/sightings/[slug]/page.tsx` — 路透详情编辑、媒体上传、内容关联
- `src/components/relations/ContentRelationEditor.tsx` — 通用关联编辑器
- `src/components/relations/RelatedContentList.tsx` — 通用关联展示列表
- `src/app/api/admin/updates/categories/route.ts` — 动态栏目开关管理 API
- `src/app/api/admin/updates/items/route.ts` — 单条动态开关管理 API
- `src/app/api/admin/content-relations/route.ts` — 通用内容关联管理 API
- `src/app/api/admin/content-search/route.ts` — 管理端关联搜索 API
- `src/app/screens/[slug]/page.tsx` — 影视详情反向显示相关动态
- `src/app/performances/[slug]/page.tsx` — 演出详情反向显示相关动态

#### 验证
- `pnpm exec prisma generate` 通过
- 本次改动范围定向 ESLint 通过
- `pnpm build` 通过
- 全量 `pnpm lint` 仍受既有 `scripts/*.ts` 中 `no-explicit-any` 问题阻塞，非本次改动引入

---

### 2026-06-16 - P6.25 移动端编辑模式按钮（已完成）

#### 完成内容
- **问题修复**：编辑按钮在桌面端 Header 中被 `hidden md:flex` 包裹，移动端（<768px）完全不可见
- **MobileNav 添加编辑入口**：在认证区域下方添加编辑模式切换按钮，包含铅笔图标 + 文字
- **状态同步**：共享同一个 EditModeProvider Context，与桌面端行为完全一致
- **条件显示**：复用 `canShowEditButton` 控制按钮可见性，非管理员点击弹出登录框

#### 涉及文件
- `src/components/layout/MobileNav.tsx` — 导入 useEditMode，添加编辑模式切换按钮

---

### 2026-06-16 - P6.24 霖言霖语封面上传 + 卡片图片展示（已完成）

#### 完成内容
- **Schema 扩展**：Interview 模型新增 `coverImageId` + `coverImage` 关系（直接 FK 到 Media）
- **封面上传**：详情页 Sidebar 编辑模式下显示封面上传区（EditableImage），普通浏览不可见
- **列表卡片图片**：InterviewCard 有封面图时右侧 45% 融合背景展示（渐变蒙版），参考留言板风格
- **上传映射**：`interview:cover` 注册到 DIRECT_FK_MAP，支持前台编辑模式直传
- **编辑支持**：`coverImageId` 加入 admin/edit 可编辑字段

#### 涉及文件
- `prisma/schema.prisma` — Interview 新增 coverImageId + coverImage 关系
- `src/app/api/upload/confirm/route.ts` — DIRECT_FK_MAP 新增 interview:cover
- `src/app/api/admin/edit/route.ts` — interview 可编辑字段加入 coverImageId
- `src/lib/types.ts` — InterviewItem 新增 coverImageUrl
- `src/lib/queries/interviews.ts` — 列表+详情查询包含 coverImage
- `src/components/interviews/InterviewCard.tsx` — 融合背景图模式
- `src/components/interviews/InterviewDetail/InterviewSidebar.tsx` — 编辑模式封面上传区
- `src/app/interviews/page.tsx` — 传递 coverImageUrl
- `src/app/interviews/[slug]/page.tsx` — 传递 coverImageUrl 给 Sidebar

---

### 2026-06-16 - P6.23 留言板卡片布局优化（已完成）

#### 完成内容
- **时间位置调整**：从右上角移到昵称下方，字体缩小为 `text-[11px]`，降低视觉权重
- **文字不遮挡图片**：有背景图时内容区限制 `w-[55%]`，文字只在左侧显示
- **缩略图右移**：缩略图从文字左侧移到右侧，与背景图模式统一

#### 涉及文件
- `src/components/guestbook/GuestbookCard.tsx` — Header 布局重构 + 内容区宽度限制 + 缩略图位置调换

---

### 2026-06-16 - P6.22 影视详情页媒体上传（已完成）

#### 完成内容
- **图册可上传**：影视详情页图册区接入 `EditableMediaGallery` 组件，编辑模式下可直接上传剧照/视频
- **gallery 类型扩展**：`ProductionDetail.gallery` 补充 `id, type, width, height` 字段，支持灯箱预览
- **空图册可见**：移除 `gallery.length > 0` 条件，编辑模式下空图册也显示上传按钮

#### 涉及文件
- `src/app/screens/[slug]/page.tsx` — 静态图册网格 → EditableMediaGallery 组件
- `src/lib/queries/productions.ts` — gallery select 补充 id, type, width, height
- `src/lib/types.ts` — ProductionDetail.gallery 类型扩展

---

### 2026-06-16 - P6.21 舞台详情页改造 + 综艺关联（已完成）

#### 完成内容
- **STAGE 列表卡片 16:9**：舞台类型卡片使用 `aspect-video` 横版比例，演唱会/音乐剧保持 2:3 竖版
- **STAGE 详情页封面 16:9**：左栏封面 STAGE 类型用 16:9 + `object-cover`，其他类型保持 2:3
- **官摄素材媒体区**：接入 `EditableMediaGallery` 组件替代静态文字卡片，支持图片/视频上传+灯箱预览
- **饭拍区条件渲染**：无饭拍数据时不显示该区域
- **STAGE 无歌单**：舞台类型不渲染歌单区
- **关联综艺功能**：STAGE 可关联综艺节目（搜索选择 + 点击跳转 + 解除关联），通过 ContentRelation 多态表
- **综艺详情页舞台片段**：综艺详情页新增「舞台片段」区，展示关联 STAGE 的官摄媒体，按舞台分组
- **Performance gallery 多对多**：Schema 新增 `gallery Media[]` 隐式多对多，复用现有上传体系

#### 涉及文件
- `prisma/schema.prisma` — Performance 加 gallery 关系，Media 加反向关系
- `src/app/api/upload/confirm/route.ts` — 加 performance:gallery 映射
- `src/app/api/performances/[slug]/relation/route.ts` — 新增关联综艺 API
- `src/app/api/productions/search/route.ts` — 新增综艺搜索 API
- `src/lib/queries/performances.ts` — 查询附带 gallery + 关联综艺
- `src/lib/queries/productions.ts` — 综艺查询附带关联 STAGE 及媒体
- `src/lib/types.ts` — 新增 GalleryMediaItem、LinkedProduction、LinkedStage 类型
- `src/app/performances/[slug]/page.tsx` — STAGE 条件布局 + EditableMediaGallery + LinkedProduction
- `src/components/performances/PerformanceCard.tsx` — STAGE 卡片 16:9
- `src/components/performances/LinkedProduction.tsx` — 新增关联综艺客户端组件
- `src/app/screens/[slug]/page.tsx` — 综艺详情页新增舞台片段区

---

### 2026-06-16 - P6.20 霖言霖语详情页 UI 精细化（已完成）

#### 完成内容
- **语言切换 Toggle**：两个小按钮 → 滑动式胶囊 toggle，金色滑块动画，`max-w-md` 紧凑尺寸
- **对话时间线重做**：Drop-cap 首字下沉排版 — 左侧细时间线 + 发光圆点，大号衬线字母浮动，正文自然环绕
- **段落框线**：每段对话带左实线 + 上下渐隐框线，框与框紧挨，圆点在框左边缘居中
- **发光效果**：活跃段落文字白字金光（`drop-shadow` 金色光晕），非活跃段落暗淡
- **音频波形**：AudioPlayer 增加 CSS 模拟波形可视化（70 根竖条，已播放金色着色）
- **编者备注**：增加边框卡片 + Haster 手写签名（Cormorant Garamond 斜体）
- **分享按钮**：页面底部 "分享此頁 SHARE" 按钮，点击复制 URL
- **蜡封章移除**：删除不协调的 ProofreadBadge，校对状态保留在标题区标签
- **标题缩小**：`text-2xl/1.75rem/2rem`，与整体布局更协调

#### 涉及文件
- `src/components/interviews/InterviewDetail/InterviewTranscript.tsx` — Toggle + 时间线 + 标题
- `src/components/interviews/InterviewDetail/InterviewMediaPanel.tsx` — 移除蜡封章 + 编者备注
- `src/components/interviews/InterviewDetail/AudioPlayer.tsx` — 波形可视化
- `src/components/interviews/InterviewDetail/ShareButton.tsx` — 新建分享按钮
- `src/components/interviews/InterviewDetail/InterviewContentArea.tsx` — 移除 proofreadStatus prop
- `src/app/interviews/[slug]/page.tsx` — 集成分享按钮 + 清理 props

---

### 2026-06-15 - P6.19 霖言霖语文字-媒体联动（已完成）

#### 完成内容
- **播放高亮**：音频/视频播放时，对应的文字段落实时高亮（accent 左边框 + 浅色背景），切换段落时平滑过渡
- **点击跳转**：点击任意有时间戳的段落，播放器跳转到该时间点并自动播放，时间戳旁显示播放图标提示可点击
- **自动滚动**：高亮段落变化时自动平滑滚动到可视区域中央
- **状态桥接**：新建 InterviewContentArea 客户端组件，管理 Transcript 和 MediaPanel 之间的共享播放状态
- **AudioPlayer forwardRef**：改为 forwardRef 模式，暴露 audio 元素 ref 和 onExternalTimeUpdate 回调
- **智能启用**：仅原生 VIDEO/AUDIO 启用联动，iframe 嵌入和 TEXT 类型不受影响，移动端保持独立布局

#### 涉及文件
- `src/components/interviews/InterviewDetail/InterviewContentArea.tsx` — **新建**，客户端包装组件，管理 currentTime + mediaRef
- `src/components/interviews/InterviewDetail/InterviewTranscript.tsx` — 高亮逻辑、点击跳转、自动滚动
- `src/components/interviews/InterviewDetail/InterviewMediaPanel.tsx` — 暴露 onTimeUpdate + mediaRef props
- `src/components/interviews/InterviewDetail/AudioPlayer.tsx` — forwardRef + onExternalTimeUpdate
- `src/app/interviews/[slug]/page.tsx` — 用 InterviewContentArea 替换中栏+右栏

---

### 2026-06-15 - P6.18 媒体画廊视频交互修复（已完成）

#### 完成内容
- **视频播放不再误触灯箱**：视频卡片正常播放时不触发灯箱，只有图片保留整卡片点击打开灯箱
- **放大按钮可点击**：右上角放大图标从装饰性 `div` 改为可交互 `button`，视频和图片都可通过此按钮打开灯箱全屏查看
- **灯箱视频声音修复**：去掉视频 `autoPlay`，避免浏览器自动播放静音策略，用户手动播放即有声音

#### 涉及文件
- `src/components/edit/EditableMediaGallery.tsx` — 视频卡片 onClick 逻辑调整 + 放大按钮改为 button
- `src/components/gallery/LightboxViewer.tsx` — 去掉视频 autoPlay

---

### 2026-06-15 - P6.17 Markdown 富文本渲染 + 编辑自动刷新（已完成）

#### 完成内容
- **MarkdownContent 通用组件**：新建 `src/components/ui/MarkdownContent.tsx`，基于 `react-markdown` v10，支持段落、加粗、斜体、列表、链接、标题、引用等 Markdown 语法，暗色主题适配
- **EditableText 保存自动刷新**：保存成功后调用 `router.refresh()` 重新获取服务端数据，无需手动刷新页面
- **全站 11 个详情页统一升级**：描述/简介/内容字段从纯文本 `<p>` 替换为 `MarkdownContent` 渲染
  - 影视详情页（synopsis）、代言详情页（description）、直播详情页（summary）
  - 相册集详情页（description）、演出详情页（summary）、公告详情页（content）
  - 霖言霖语编者备注（summary）、新闻详情页（contentText）、社交媒体详情页（contentText）、路透详情页（content）
- **向后兼容**：纯文本内容正常换行显示，Markdown 语法可选使用

#### 涉及文件
- `src/components/ui/MarkdownContent.tsx` — 新建 Markdown 渲染组件
- `src/components/edit/EditableText.tsx` — 加 useRouter + router.refresh()
- `src/app/screens/[slug]/page.tsx` — synopsis 升级 MarkdownContent
- `src/app/activities/endorsements/[slug]/page.tsx` — description 升级
- `src/app/activities/livestreams/[slug]/page.tsx` — summary 升级
- `src/app/gallery/collections/[slug]/page.tsx` — description 升级
- `src/app/performances/[slug]/page.tsx` — summary 升级
- `src/app/announcements/[id]/page.tsx` — content 升级
- `src/components/interviews/InterviewDetail/InterviewMediaPanel.tsx` — summary 升级
- `src/app/updates/news/[slug]/page.tsx` — contentText 升级
- `src/app/updates/social/[id]/page.tsx` — contentText 升级
- `src/app/updates/sightings/[slug]/page.tsx` — content 升级
- `package.json` — 新增 react-markdown 依赖

---

### 2026-06-15 - P6.16 活动模块封面+媒体上传（已完成）

#### 完成内容
- **Schema 变更**：Endorsement 新增 `coverImageId` FK + `coverImage` 关系，与 Livestream 封面机制统一
- **通用组件 EditableMediaGallery**：新建 `src/components/edit/EditableMediaGallery.tsx`，支持图片+视频混排展示、编辑模式上传、移除关联，全站任何模块可复用
- **封面图上传**：代言和直播详情页封面区用 `EditableImage` 包裹，编辑模式可上传替换
- **媒体区上传**：代言和直播详情页新增「相关媒体」区域，编辑模式下可上传图片/视频并自动关联（多对多）
- **列表卡片封面**：LivestreamCard 新增封面图展示（16:9），EndorsementCard 优先使用 coverImage
- **Upload API**：新增 `endorsement:cover` 绑定配置
- **Admin Edit**：白名单新增 `endorsement.coverImageId`
- **双向关联**：上传到活动的媒体在相册模块也能查到来源

#### 涉及文件
- `prisma/schema.prisma` — Endorsement 加 coverImageId + Media 加反向关系
- `src/components/edit/EditableMediaGallery.tsx` — 新建通用媒体展示/上传组件
- `src/app/api/upload/route.ts` — 加 endorsement:cover 绑定
- `src/app/api/admin/edit/route.ts` — 白名单加 coverImageId
- `src/lib/types.ts` — media 类型补全
- `src/lib/queries/activities.ts` — 查询补全 coverImage + media 字段
- `src/components/activities/LivestreamCard.tsx` — 封面图展示
- `src/components/activities/EndorsementCard.tsx` — coverImage 优先
- `src/app/activities/page.tsx` — 传 coverImageUrl
- `src/app/activities/endorsements/[slug]/page.tsx` — EditableImage + EditableMediaGallery
- `src/app/activities/livestreams/[slug]/page.tsx` — EditableImage + EditableMediaGallery

---

### 2026-06-15 - P6.15 相册瀑布流布局（已完成）

#### 完成内容
- **WaterfallLayout 通用组件**：新建 `src/components/ui/WaterfallLayout.tsx`，CSS `columns` 真瀑布流，固定列宽、自适应高度
- **GalleryCard 自适应比例**：去掉 `aspect-[4/3]` 固定裁剪，改用 `width/height` 保持图片原始纵横比
- **双布局体系**：`MasonryLayout`（等高网格）+ `WaterfallLayout`（瀑布流），任何模块可按需切换
- **相册模块切换**：Gallery 列表和合集区域改用 WaterfallLayout，其他模块不受影响

#### 涉及文件
- `src/components/ui/WaterfallLayout.tsx` — 新建瀑布流布局组件
- `src/components/gallery/GalleryCard.tsx` — 图片自适应比例
- `src/components/gallery/GalleryGrid.tsx` — 引用 WaterfallLayout
- `src/app/gallery/GalleryPageClient.tsx` — 合集区域引用 WaterfallLayout

---

### 2026-06-15 - P6.5 相册模块（已完成）

#### 完成内容
- **相册模块**：新增 `/gallery` 路由，支持图片、视频、音频、合集四个分类 Tab
- **二级 Tag 筛选**：图片（海报/活动照/写真/剧照等）、视频（活动/幕后/路透）、音频（歌曲/访谈）
- **Tag 样式统一**：使用全站共享 `<Tag>` 组件，与其他模块风格一致
- **Lightbox 查看器**：点击图片全屏预览，支持左右切换
- **相册集功能**：支持创建、查看相册集，含封面和描述
- **来源反查**：自动关联媒体来源（影视/演出/专辑/杂志/代言/访谈）
- **Schema 扩展**：新增 `MediaCollection`、`MediaCollectionItem` 模型，Media 增加 `mediaTag` 字段

#### 涉及文件
- `prisma/schema.prisma` — 新增相册集模型 + Media 字段扩展
- `src/app/gallery/` — 相册页面（列表 + 相册集详情）
- `src/app/api/gallery/` — 相册 CRUD API
- `src/components/gallery/` — 6 个组件（FilterBar, Grid, Card, Lightbox, CollectionCard, CreateCollectionModal）
- `src/lib/queries/gallery.ts` — 查询层
- `src/lib/types.ts` — 类型定义
- `src/config/navigation.ts` — 导航栏新增相册入口
- `src/app/api/upload/route.ts` — 上传 API 适配
- `src/app/api/admin/edit/route.ts` — 编辑 API 适配

---

### 2026-06-15 - P6.13 详情页图片完整显示（已完成）

#### 完成内容
- **详情页图片不再裁剪**：所有详情页的主图和画廊图片从 `object-cover` 改为 `object-contain`，显示完整未裁剪的原图
- **列表页不受影响**：列表页/卡片仍保持标准比例裁剪

#### 涉及文件（6 个文件，9 处改动）
- `src/app/screens/[slug]/page.tsx` — 影视主海报 + 画廊
- `src/app/performances/[slug]/page.tsx` — 演出主海报
- `src/app/archives/albums/[slug]/page.tsx` — 专辑封面
- `src/app/archives/magazines/[slug]/page.tsx` — 杂志封面 + 扫描画廊
- `src/app/activities/endorsements/[slug]/page.tsx` — 代言主图 + 画廊
- `src/components/interviews/InterviewDetail/InterviewMediaPanel.tsx` — 访谈图片

---

### 2026-06-15 - P6.12 霖言霖语独立模块（已完成）

#### 完成内容
- **访谈模块独立**：将访谈从活动模块（`/activities`）的子 Tab 提升为独立顶级栏目「霖言霖语」
- **新路由**：`/interviews`（列表页）+ `/interviews/[slug]`（详情页）+ `/api/interviews`（API）
- **导航更新**：导航栏新增「霖言霖语」入口，位于「资料库」和「留言板」之间
- **活动模块瘦身**：活动页面只保留代言 + 直播两个 Tab

#### 技术变更
- `src/config/navigation.ts`：新增 `{ label: '霖言霖语', href: '/interviews' }` 导航项
- `src/lib/types.ts`：`ActivityTab` 删除 `'interview'`
- 新建 `src/lib/queries/interviews.ts`：从 `activities.ts` 拆出 `getInterviews`、`getInterviewBySlug`、`getInterviewCounts`
- `src/lib/queries/activities.ts`：删除访谈相关函数，`getActivityCounts` 只统计代言+直播
- `src/lib/queries/search.ts`：搜索结果 URL 从 `/activities/interviews/` 改为 `/interviews/`
- 新建 `src/app/interviews/`：列表页 + 详情页 + loading 骨架屏
- 新建 `src/app/api/interviews/`：GET/POST + [slug] GET/PUT/DELETE
- 新建 `src/components/interviews/`：InterviewCard、InterviewsFilterBar、InterviewDetail/（4 个子组件）
- `src/app/activities/page.tsx`：删除 interview Tab 和相关逻辑
- `src/components/activities/ActivitiesFilterBar.tsx`：删除 interview Tab 和 mediaType 筛选
- `src/components/edit/CreateEntryModal.tsx`：API 和详情路由指向新路径

#### 删除文件
- `src/app/activities/interviews/`（旧页面路由）
- `src/app/api/activities/interviews/`（旧 API 路由）
- `src/components/activities/InterviewCard.tsx`（旧组件）
- `src/components/activities/InterviewDetail/`（旧详情组件目录）

---

### 2026-06-14 - P6.11 网格布局统一（已完成）

#### 完成内容
- **瀑布流改网格布局**：MasonryLayout/MasonryGrid 从 CSS columns 改为 CSS Grid，修复阅读顺序（从左到右、从上到下）
- **海报比例标准化**：去掉动态宽高比，统一使用标准比例 — 影视/演出 `2:3`、专辑 `1:1`、杂志 `3:4`、代言 `4:3`、社交/路透 `4:5`
- **清理冗余 props**：去掉各卡片不再需要的 posterWidth/posterHeight 等动态尺寸属性

#### 技术变更
- `src/components/ui/MasonryLayout.tsx`：`columns-*` → `grid grid-cols-*`
- `src/components/updates/MasonryGrid.tsx`：同步改为 grid
- 7 个卡片组件：去掉 `break-inside-avoid`，固定 aspect-ratio
- 4 个列表页：清理不再传递的宽高 props

---

### 2026-06-14 - P6.10 全站时间排序优化（已完成）

#### 完成内容
- **Schema 新增 3 个日期字段**：Production.releaseDate、Album.releaseDate、Endorsement.startDate
- **回填精确日期数据**：76 条 Production + 27 条 Album + 15 条 Endorsement 的精确日期已写入数据库
- **排序逻辑统一优化**：修改 5 个查询文件（productions/performances/archives/activities/search）的排序逻辑，统一为日期优先排序
- **前台编辑模式适配**：编辑白名单、CreateEntryModal、单资源 PUT API 全部支持新日期字段

#### 技术变更
- `prisma/schema.prisma`：Production 新增 `releaseDate DateTime?`，Album 新增 `releaseDate DateTime?`，Endorsement 新增 `startDate DateTime?`
- `src/lib/queries/productions.ts`：排序改为 releaseDate 优先
- `src/lib/queries/performances.ts`：排序改为日期优先
- `src/lib/queries/archives.ts`：排序改为 releaseDate 优先
- `src/lib/queries/activities.ts`：排序改为 startDate / date 优先
- `src/lib/queries/search.ts`：搜索结果排序适配新日期字段
- `src/app/api/admin/edit/route.ts`：编辑白名单新增 releaseDate、startDate
- `src/components/edit/CreateEntryModal.tsx`：新增条目表单支持日期字段
- 各实体 PUT API：支持新日期字段的更新

### 2026-06-14 - P6.6 前台编辑模式 — 认证统一 + 元信息可编辑（已完成）

#### 完成内容
- **合并管理员认证到 User 表**：User 表新增 `role` 字段（枚举 `USER` / `ADMIN`），取消独立的 Admin 认证体系
- **统一 Token 验证**：`verifyAdmin()` 改用 `USER_JWT_SECRET` 验证用户 token + 检查 `role === ADMIN`，不再使用单独的 `ADMIN_JWT_SECRET`
- **EditModeProvider 重写**：从 `useAuth()` 获取用户角色，`admin_token` 替换为 `user_token`，管理员登录后自动获得编辑权限
- **未登录保护**：非管理员点编辑按钮弹出登录弹窗，不进入编辑模式
- **修复 login/register API**：返回 `role` 字段，确保登录后即可识别管理员身份
- **6 个详情页元信息字段全部可编辑**：
  - 影视：年份、角色、语言
  - 演出：年份、场馆、城市、系列
  - 专辑：发行年份、语言
  - 杂志：期号
  - 代言：分类、角色、开始年份、结束年份
  - 直播：平台、时长、原始链接、回放链接
- **空字段处理**：编辑模式显示浅色占位提示，非编辑模式隐藏并自动处理分隔符排版
- **访谈详情页完整编辑支持**：标题、英文标题、来源、主持人、地点、时长、日期、视频地址、编辑笔记、校对状态
- **视频编辑 UX**：编辑模式下 iframe 上覆盖透明遮罩，点击可编辑嵌入地址
- **修复 Hydration 错误**：解决 `<h1>`/`<p>` 标签嵌套导致的水合警告

#### 技术变更
- `prisma/schema.prisma`: 新增 `UserRole` 枚举，User 表加 `role` 字段
- `src/lib/auth.ts`: `verifyAdmin` 改用 user token + role 检查
- `src/components/edit/EditModeProvider.tsx`: 重写，依赖 AuthProvider 的 user.role，未登录弹登录框
- `src/components/auth/AuthProvider.tsx`: User 接口加 `role` 字段
- `src/app/api/auth/login/route.ts`: 返回 `role`
- `src/app/api/auth/register/route.ts`: 返回 `role`
- `src/app/api/auth/me/route.ts`: 返回 `role`
- 6 个详情页：screens、performances、albums、magazines、endorsements、livestreams 元信息字段包裹 EditableText
- 访谈详情页 3 个子组件：InterviewSidebar、InterviewTranscript、InterviewMediaPanel 全部添加编辑支持
- `src/app/api/admin/edit/route.ts`: interview 白名单新增 `proofreadStatus`、`date`；DATE_FIELDS 新增 `date`

### 2026-06-13 - P6.6 前台编辑模式（已完成）

#### 变更内容
- `prisma/schema.prisma`：新增 `EditHistory` 模型（entityType/entityId/field/oldValue/newValue/editedBy，支持一次撤销）
- 新建 `src/components/edit/` 目录，包含 6 个组件：
  - `EditModeProvider.tsx`：全局 Context（isAdmin/editMode/toggleEditMode/canShowEditButton），读取 `NEXT_PUBLIC_EDIT_MODE_PUBLIC` 环境变量控制可见性
  - `EditModeToggle.tsx`：Header 右上角编辑模式开关按钮
  - `EditStatusBar.tsx`：编辑模式顶部状态条
  - `EditableText.tsx`：可编辑文字组件（单行/多行，保存/取消/错误处理）
  - `EditableImage.tsx`：可编辑图片组件（预签名上传→R2→替换→刷新页面）
  - `EditableTag.tsx`：标签编辑骨架组件（UI 就绪，API 待后续接入）
- 新建 3 个 API 路由：
  - `src/app/api/admin/edit/route.ts`：PATCH 通用字段编辑（白名单校验 + EditHistory 记录）
  - `src/app/api/admin/edit/undo/route.ts`：POST 撤销最近一次编辑
  - `src/app/api/admin/edit/history/route.ts`：GET 查询撤销可用性
- `src/app/layout.tsx`：包裹 EditModeProvider + 添加 EditStatusBar
- `src/components/layout/Header.tsx`：嵌入 EditModeToggle
- 6 个详情页集成编辑模式：
  - `screens/[slug]`：标题、英文标题、简介、海报
  - `performances/[slug]`：标题、英文标题、简介、海报
  - `endorsements/[slug]`：品牌名、描述
  - `livestreams/[slug]`：标题、简介
  - `albums/[slug]`：标题、封面
  - `magazines/[slug]`：标题、封面

#### 2026-06-14 补充：列表页新增条目
- 新建 `src/components/edit/CreateEntryButton.tsx`：编辑模式下「+ 新增」按钮
- 新建 `src/components/edit/CreateEntryModal.tsx`：新增条目弹窗（7 种实体，动态表单，自动生成 slug，创建后跳转详情页）
- 新建 `src/components/edit/CreateEntryTrigger.tsx`：按钮+弹窗整合包裹器
- 4 个列表页嵌入新增按钮：screens、performances、activities（代言/访谈/直播）、archives（专辑/杂志）
- 按钮自动根据当前 tab 设置默认类型（如电影 tab → 新增电影）

#### 未改动（待后续）
- interviews 详情页：内容渲染在子组件中（InterviewSidebar/InterviewTranscript/InterviewMediaPanel），需单独改造
- EditableTag API 对接：标签多对多关系编辑逻辑较复杂，骨架 UI 已就绪

### 2026-06-11 - P6.4 留言板增强（已完成）

#### 变更内容
- `prisma/schema.prisma`：Guestbook 新增 `isFeatured`/`imageCropData`/`imageAsBackground` 字段 + 索引；Comment 新增 `imageId` + Media 关联（CommentImage）
- `src/lib/types.ts`：新增 `ImageCropData` 接口；GuestbookItem 新增 isFeatured/thumbnail/imageCropData/imageAsBackground；CommentItem 新增 image
- `src/lib/queries/guestbook.ts`：列表查询含首图+精选置顶排序；详情含新字段；评论含图片；新增 `getFeaturedCount()`
- `src/app/api/messages/route.ts`：POST 支持 imageId/imageCropData/imageAsBackground
- `src/app/api/messages/[id]/comments/route.ts`：POST 支持 imageId，返回图片
- 新建 `src/app/api/admin/messages/featured/route.ts`：管理员切换精选状态 API
- 新建 `src/components/guestbook/ImageUploader.tsx`：图片选择+直接上传组件（裁切功能暂关闭，后续开启）
- `src/components/guestbook/GuestbookCard.tsx`：两种图片展示模式（融合背景/缩略图）+ 精选金色标记
- `src/components/guestbook/GuestbookForm.tsx`：图片上传，默认融合背景显示
- `src/components/guestbook/CommentSection.tsx`：评论图片上传 + 评论图片展示
- `src/app/api/upload/route.ts`：无绑定上传也创建 Media 记录

### 2026-06-11 - P6.3 瀑布流布局改版（已完成）

#### 变更内容
- 新建 `src/components/ui/MasonryLayout.tsx`：通用瀑布流容器组件（CSS columns，2→3→4 列响应式）
- `src/lib/types.ts`：ProductionItem/PerformanceItem 新增 posterWidth/posterHeight，AlbumItem/MagazineItem 新增 coverWidth/coverHeight，EndorsementItem mediaUrls 新增 width/height
- 4 个查询文件（productions/performances/archives/activities）：列表+详情查询的 Media select 加入 width/height
- 5 个卡片组件改造：ProductionCard/PerformanceCard/AlbumCard/MagazineCard/EndorsementCard 移除固定 aspect-ratio，改为动态 style aspectRatio（有尺寸用实际比例，无尺寸用默认 fallback），添加 break-inside-avoid mb-4
- 5 个列表页（screens/performances/archives/activities/updates）：CSS Grid 替换为 MasonryLayout 组件，传递图片尺寸 props
- updates 页面：MasonryGrid 导入统一为 MasonryLayout（新闻 tab 保持 space-y-4 不变）

#### 未改动（按设计）
- InterviewCard / LivestreamCard：纯文字卡片，保持 grid 列表布局
- NewsArticleCard：横向排列布局，不适合瀑布流

### 2026-06-10 - P6.2 访谈详情页重做（已完成）

#### 变更内容
- `prisma/schema.prisma`：Interview 模型新增 `host`/`location`/`duration`/`embedUrl` 字段，`transcriptCantonese`/`transcriptMandarin` 改为 `Json?` 类型，新增 `gallery Media[]` 多对多关联
- `src/lib/types.ts`：`InterviewItem` 新增 host/location/duration，`InterviewDetail` 新增 embedUrl/galleryImages，transcript 类型改为 unknown
- `src/lib/queries/activities.ts`：查询包含新字段和 gallery 关联
- `src/app/api/activities/interviews/route.ts` + `[slug]/route.ts`：POST/PUT 支持新字段
- 新建 `src/components/activities/InterviewDetail/` 目录，包含 4 个组件：
  - `InterviewSidebar.tsx`：左栏元信息（来源/主持/地点/日期/时长，缺数据显示"暂无"）
  - `InterviewTranscript.tsx`：中栏文稿（粤语/国语切换 + JSON segments 对话渲染 + 旧数据兼容）
  - `InterviewMediaPanel.tsx`：右栏媒体面板（视频iframe/音频播放器/图片网格/默认占位 + 校对徽章 + 编者备注）
  - `AudioPlayer.tsx`：自定义音频播放器（进度条/倍速/播放控件）
- `src/app/activities/interviews/[slug]/page.tsx`：重写为三栏布局（桌面三栏sticky，移动端单栏堆叠）
- `prisma/seed.ts`：新增含完整字段+B站视频嵌入的样本访谈数据

#### 设计原则
- 方案B：所有区域始终展示，缺数据用占位文案（"暂无"/"文稿整理中"/"媒体资源整理中"等）
- 文稿支持 JSON 结构化存储（segments 数组）+ 纯字符串 fallback

---

### 2026-06-10 - P6.8 演出详情页优化（已完成）

#### 变更内容
- `prisma/schema.prisma`：Performance 模型新增 `summary String? @map("summary")` 字段
- `src/lib/types.ts`：`PerformanceDetail` 接口新增 `summary: string | null`
- `src/lib/queries/performances.ts`：`getPerformanceBySlug` 返回 `summary`
- `src/app/performances/[slug]/page.tsx`：右栏标签下方新增简介展示区（金线分隔 + 标题 + 正文，仅有内容时渲染）
- 数据库已同步（`prisma db push`）

### 2026-06-10 - UI 调整阶段四：用户个人页面 + 留言管理（已完成）

#### 功能 10a：后端 — 用户留言管理 + 个人设置 API
- `src/lib/queries/user.ts`：`getUserProfile()` + `getUserMessages()`（分页，排除 REJECTED）
- `GET /api/user/messages`：当前用户留言列表（分页）
- `PUT/DELETE /api/user/messages/[id]`：编辑/删除自己的留言（userId 权限校验，403 拒绝越权）
  - 删除使用 `$transaction`：清理关联 comments/likes + 回扣 postsCount/starlight
- `GET/PUT /api/user/profile`：获取/修改个人信息（displayName + avatar URL），修改 displayName 同步更新 Guestbook.nickname
- `PUT /api/user/password`：修改密码（bcrypt 验证旧密码 + 12 轮哈希新密码）

#### 功能 10b：前端 — 个人中心 + 留言管理 + 设置
- `/profile` 个人中心主页：ProfileHeader（头像/用户名/统计卡片）+ 快捷入口（我的留言/个人设置）
- `/profile/messages` 我的留言管理：MessageList（分页 + 编辑弹窗 + 删除确认）
- `/profile/settings` 个人设置：SettingsForm（头像上传到 R2 + 昵称修改 + 密码修改）
- 头像上传：点击头像 → 选择文件(2MB 限制) → POST /api/upload → PUT /api/user/profile
- 所有页面客户端组件，未登录显示提示 + 登录按钮

#### 功能 10c：留言板卡片内联编辑/删除
- `GuestbookCardActions`：客户端组件，编辑（EditMessageModal）+ 删除（confirm + API）
- `GuestbookGrid`：客户端包裹组件，useAuth() 获取 currentUserId 传给 GuestbookCard
- `GuestbookCard`：新增 currentUserId prop，自己的留言显示操作按钮
- 留言板页面 `messages/page.tsx` 改用 GuestbookGrid 渲染

#### 功能 10d：UserMenu 扩展
- 下拉菜单新增「个人中心」链接（/profile）
- 触发按钮支持显示头像图片（有 avatar 用 Image，无 avatar 用首字母）

### 2026-06-10 - UI 调整阶段五：全站检索（已完成）

#### 功能 8a：后端 — 搜索查询层 + API
- `src/lib/queries/search.ts`：10 个内容表并行模糊搜索（Prisma `contains` + `mode: insensitive`）
  - 搜索范围：SocialPost / NewsArticle / Sighting / Production / Performance / Endorsement / Interview / Livestream / Album / Magazine
  - 过滤条件：Sighting 排除 REJECTED，其余排除 isVisible=false
  - 两个导出函数：`searchPreview()`（每类前 3 条）、`searchFull()`（分页+类型筛选）
- `src/app/api/search/route.ts`：GET API
  - `?q=关键词&mode=preview` — 预览模式（SearchModal 调用）
  - `?q=关键词&type=all&page=1` — 完整模式（搜索结果页调用）
  - 校验：关键词最短 2 字符，类型参数白名单
- `src/lib/types.ts`：新增 `SearchResultType`、`SearchResultItem`、`SearchPreviewResult`

#### 功能 8b：前端 — 搜索弹窗 + 搜索结果页
- `SearchModal.tsx`：全屏 overlay 搜索弹窗
  - debounce 300ms 自动搜索，结果按类型分组预览
  - 关键词高亮（`<mark>` 标签 + accent 色）
  - ESC 关闭，点击背景关闭，点击结果跳转并关闭
  - 底部「查看全部 N 条结果」链接到 /search 页面
- `SearchResultCard.tsx`：搜索结果卡片（类型标签 + 标题高亮 + 摘要高亮 + 日期）
- `/search` 搜索结果页：服务端组件，force-dynamic
  - 11 个类型筛选 tab（全部 + 10 个内容类型）
  - 分页导航，骨架屏 loading 状态
  - 空结果/短关键词友好提示

#### 功能 8c：Header 嵌入搜索入口
- `Header.tsx`：桌面端导航右侧放大镜图标 + 移动端搜索图标（汉堡菜单旁）
- `Cmd/Ctrl + K` 全局快捷键打开搜索弹窗
- SearchModal 集成到 Header 组件树

### 2026-06-10 - UI 调整阶段三：用户系统（已完成）

#### 功能 9a：数据库 — User 模型 + Like 表
- 新增 `User` 模型：username/password/displayName/avatar/isActive + 互动统计（postsCount/receivedLikesCount/receivedCommentsCount/givenLikesCount/givenCommentsCount）+ starlight 激励积分
- 新增 `Like` 模型：userId + targetType + targetId 联合唯一约束，支持精确去重
- `Guestbook` / `Comment` 新增可空 `userId` 外键，兼容历史匿名数据
- 数据库已同步（`prisma db push`）

#### 功能 9b：后端 — 认证 API
- `src/lib/auth.ts` 扩展：`UserPayload` + `signUserToken()` + `verifyUser()`（独立 `USER_JWT_SECRET`）
- `src/lib/username-validator.ts`：禁止用户名包含张智霖/張智霖/Chilam/Julian Cheung
- `POST /api/auth/register`：校验(长度+禁用词+唯一性) → bcrypt(12轮) → 创建 → JWT
- `POST /api/auth/login`：查找 → isActive 检查 → bcrypt 验证 → JWT
- `GET /api/auth/me`：验证 token → 返回用户信息（含统计+星光）

#### 功能 9c：前端 — 认证组件
- `AuthProvider`：React Context 管理 user/loading/modalState，localStorage token 持久化
- `LoginModal` / `RegisterModal`：弹窗表单，注册时实时校验禁用词
- `UserMenu`：已登录下拉菜单（头像首字母 + 退出登录）
- `Header`：Desktop nav 右侧集成登录按钮 / UserMenu
- `MobileNav`：底部集成登录入口 / 用户信息
- `layout.tsx`：AuthProvider 包裹全站 + Modal 组件

#### 功能 9d：留言板权限改造
- 发布留言：需登录，自动关联 userId，nickname 从用户信息填充，+5 星光
- 点赞：需登录，Like 表 toggle（赞/取消赞），更新双方互动统计和星光
- 评论：需登录，自动关联 userId，更新双方统计和星光
- 前端：GuestbookForm 未登录显示登录提示，LikeButton 改为 toggle + GET 检查状态，CommentSection 移除 nickname 输入
- 浏览：无需登录

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
- [x] GuestbookCard 留言卡片（含 currentUserId prop + 内联操作按钮）
- [x] GuestbookGrid 客户端包裹组件（useAuth 获取 currentUserId）
- [x] GuestbookCardActions 编辑/删除按钮
- [x] GuestbookForm 留言提交表单（需登录）
- [x] GuestbookFilterBar 筛选栏（含故事 tag 子筛选）
- [x] LikeButton 点赞按钮（需登录，Like 表 toggle）
- [x] FavoriteButton 收藏按钮
- [x] CommentSection 评论区（需登录）
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

### 完成统计（2026-06-09）
| 类别 | 已上传 | 跳过 | 说明 |
|------|--------|------|------|
| 电影海报 | 51 | 8 | 跳过: 异兽围城(未上映)、爱情Amoeba、困兽、手足情深、夺魄勾魂、战虎、人在江湖、卧虎（TMDB无海报） |
| 电视剧海报 | 31 | 4 | 跳过: 璀璨之城(待播)、终结杉计划、草民县令、同一屋檐下（TMDB无收录） |
| 综艺海报 | 13 | 1 | 跳过: 壮志凌云（无海报资源） |
| 专辑封面 | 17 | 10 | 跳过: 10张早期精选辑/EP（90年代，网上无高清封面） |
| **合计** | **112** | **23** | 完成率 83% |

### 图片来源
- 主要来源: TMDB (The Movie Database) 高清原图
- 专辑封面: Apple Music 高清封面
- 存储: 全部上传到 Cloudflare R2，通过 `/api/upload` 绑定到对应记录

## UI 调整阶段三完成清单（2026-06-10）

### 数据库
- [x] User 模型（username/password/displayName/avatar/统计字段/starlight）
- [x] Like 模型（userId + targetType + targetId 联合唯一）
- [x] Guestbook / Comment 新增可空 userId 外键
- [x] prisma db push 同步（22 张表）

### 后端 API
- [x] src/lib/auth.ts 扩展（UserPayload + signUserToken + verifyUser，独立 USER_JWT_SECRET）
- [x] src/lib/username-validator.ts（禁用词校验）
- [x] POST /api/auth/register（校验+bcrypt+JWT）
- [x] POST /api/auth/login（bcrypt验证+JWT）
- [x] GET /api/auth/me（token→用户信息+统计+星光）

### 前端组件
- [x] AuthProvider（React Context，localStorage token 持久化）
- [x] LoginModal / RegisterModal（弹窗表单，禁用词实时校验）
- [x] UserMenu（下拉菜单：头像首字母 + 退出登录）
- [x] Header / MobileNav 集成登录入口

### 留言板权限改造
- [x] 发布需登录，自动关联 userId，+5 星光
- [x] 点赞需登录，Like 表 toggle，更新双方统计和星光
- [x] 评论需登录，自动关联 userId，更新双方统计和星光
- [x] 浏览无需登录
- [x] GuestbookForm 未登录显示登录提示
- [x] LikeButton 改为 toggle + GET 检查状态
- [x] CommentSection 移除 nickname 输入

## UI 调整阶段四完成清单（2026-06-10）

### 后端 API
- [x] src/lib/queries/user.ts（getUserProfile + getUserMessages 分页查询）
- [x] GET /api/user/messages（当前用户留言列表，分页）
- [x] PUT/DELETE /api/user/messages/[id]（编辑/删除自己的留言，userId 权限校验）
- [x] GET/PUT /api/user/profile（获取/修改个人信息，displayName 同步 Guestbook.nickname）
- [x] PUT /api/user/password（修改密码，bcrypt 验证旧密码 + 12轮哈希新密码）

### 前端页面
- [x] /profile 个人中心主页（ProfileHeader + 快捷入口）
- [x] /profile/messages 我的留言管理（MessageList + EditMessageModal + 删除确认）
- [x] /profile/settings 个人设置（头像上传到 R2 + 昵称修改 + 密码修改）

### 前端组件
- [x] ProfileHeader（头像/用户名/加入日期/4 统计卡片）
- [x] MessageList（分页 + 编辑弹窗 + 删除确认）
- [x] EditMessageModal（编辑内容/storyTags/relatedYear）
- [x] SettingsForm（头像上传 2MB 限制 + 昵称 + 密码）
- [x] GuestbookCardActions（客户端编辑/删除按钮，stopPropagation）
- [x] GuestbookGrid（客户端包裹组件，useAuth 获取 currentUserId）
- [x] GuestbookCard 新增 currentUserId prop
- [x] UserMenu 新增「个人中心」链接 + 头像图片显示

### Bug 修复
- [x] r2.ts 环境变量改为懒加载（修复 Turbopack 模块初始化时序问题）
- [x] SettingsForm 上传错误改为读取 API 响应体具体错误信息

## UI 调整阶段五完成清单（2026-06-10）

### 功能 8：全站检索
- [x] 搜索查询层 (queries/search.ts)：10 表并行模糊搜索
- [x] 搜索 API (GET /api/search)：preview + full 两种模式
- [x] SearchModal 全屏搜索弹窗（debounce + 关键词高亮 + 分组预览）
- [x] SearchResultCard 搜索结果卡片
- [x] /search 搜索结果页（11 类型筛选 + 分页 + 骨架屏）
- [x] Header 嵌入搜索入口（桌面端 + 移动端 + Cmd/Ctrl+K 快捷键）
- [x] SearchResult 等类型定义
- [x] pnpm build 通过

## P6.1 体验修复完成清单（2026-06-10）

### 6.1.1 图片加载优化
- [x] next.config.ts 添加 `formats: ['image/avif', 'image/webp']`
- [x] 6 个卡片组件新增 `priority` prop（ProductionCard, PerformanceCard, AlbumCard, MagazineCard, SocialPostCard, NewsArticleCard）
- [x] 4 个列表页首屏卡片传 `priority={true}`（screens, performances, archives, updates）

### 6.1.2 留言发布后即时更新
- [x] GuestbookForm 提交成功后调用 `router.refresh()` 刷新列表

### 6.1.3 返回导航按钮
- [x] `/messages/[id]` 添加「← 返回留言板」链接
- [x] `/profile/settings` 添加「← 返回个人中心」链接
- [x] `/profile/messages` 添加「← 返回个人中心」链接
- [x] 统一样式：金色文字 + hover 过渡

### 验收
- [x] pnpm lint 通过（0 errors）
- [x] pnpm build 通过（27 静态 + 动态页面）

## P6.6 前台编辑模式完成清单（2026-06-13）

### Schema 变更
- [x] EditHistory 模型（entityType/entityId/field/oldValue/newValue/editedBy）

### 编辑模式基础设施
- [x] EditModeProvider 全局 Context
- [x] EditModeToggle Header 开关按钮
- [x] EditStatusBar 编辑模式状态条
- [x] EditableText 可编辑文字组件
- [x] EditableImage 可编辑图片组件
- [x] EditableTag 标签编辑骨架组件

### API 路由
- [x] PATCH /api/admin/edit（通用字段编辑 + 白名单校验）
- [x] POST /api/admin/edit/undo（撤销最近一次编辑）
- [x] GET /api/admin/edit/history（查询撤销可用性）

### 详情页集成
- [x] screens/[slug] — 标题、英文标题、简介、海报
- [x] performances/[slug] — 标题、英文标题、简介、海报
- [x] endorsements/[slug] — 品牌名、描述
- [x] livestreams/[slug] — 标题、简介
- [x] albums/[slug] — 标题、封面
- [x] magazines/[slug] — 标题、封面

### 布局集成
- [x] layout.tsx 包裹 EditModeProvider + EditStatusBar
- [x] Header.tsx 嵌入 EditModeToggle

### 验收
- [x] pnpm build 通过
- [x] pnpm lint 通过（无新 error）
- [x] prisma db push（已完成）

### 列表页新增条目
- [x] CreateEntryButton 新增按钮组件
- [x] CreateEntryModal 新增弹窗组件（7 种实体类型）
- [x] CreateEntryTrigger 整合包裹器
- [x] screens 列表页 — 新增作品
- [x] performances 列表页 — 新增演出
- [x] activities 列表页 — 新增代言/访谈/直播
- [x] archives 列表页 — 新增专辑/杂志

## P6.10 全站时间排序优化完成清单（2026-06-14）

### Schema 变更
- [x] Production 新增 releaseDate DateTime? 字段
- [x] Album 新增 releaseDate DateTime? 字段
- [x] Endorsement 新增 startDate DateTime? 字段
- [x] prisma db push 同步

### 数据回填
- [x] 76 条 Production 精确日期回填
- [x] 27 条 Album 精确日期回填
- [x] 15 条 Endorsement 精确日期回填

### 排序逻辑优化
- [x] queries/productions.ts — releaseDate 优先排序
- [x] queries/performances.ts — 日期优先排序
- [x] queries/archives.ts — releaseDate 优先排序
- [x] queries/activities.ts — startDate / date 优先排序
- [x] queries/search.ts — 搜索结果排序适配

### 前台编辑模式适配
- [x] /api/admin/edit 编辑白名单新增日期字段
- [x] CreateEntryModal 新增条目表单支持日期字段
- [x] 各实体 PUT API 支持新日期字段更新

## 下一步: P6.5 相册模块 → P6.7 → P6.9（详见 docs/P6_USER_FEEDBACK_PLAN.md）

---

## 待决事项
- [x] 数据库方案最终确认 → Supabase (PostgreSQL, ap-northeast-2)
- [x] 存储方案最终确认 → Cloudflare R2 (chilam-media, r2.dev 公开访问)
- [x] 是否需要用户登录系统 → 已实现（阶段三）
- [x] 留言板是否需要登录才能留言 → 是，浏览无需登录，发布/点赞/评论需登录
- [ ] 域名选择
