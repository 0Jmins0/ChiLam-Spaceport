# UI 调整 + 功能新增 修复计划

> 创建时间: 2026-06-07
> 状态: 待执行

---

## 修改总览

### A. UI 调整（7 项）

| # | 修改项 | 类型 | 复杂度 |
|---|--------|------|--------|
| 1 | 导航栏新增「主页」入口 | 功能新增 | 低 |
| 2 | 综艺删除地区 tag 筛选 | 功能删除 | 低 |
| 3 | 活动新增「直播」独立子分类 | 功能新增 | **高** |
| 4 | 访谈删除「直播」媒体类型 | 功能删除 | 低 |
| 5 | 故事分享新增 tag 分类筛选 | 功能新增 | 中 |
| 6 | 路透新增「其他」tag | 功能新增 | 低 |
| 7 | 筛选栏与内容间距统一 | 样式修复 | 低 |

### B. 新功能（4 项）

| # | 功能项 | 类型 | 复杂度 |
|---|--------|------|--------|
| 8 | 全站检索功能 | 功能新增 | **高** |
| 9 | 用户注册/登录系统 | 功能新增 | **高** |
| 10 | 用户个人页面 + 留言管理 | 功能新增 | **高** |
| 11 | 移除内容审核机制 | 流程变更 | 中 |

---

## 修改 1：导航栏新增「主页」入口

### 现状
- 当前导航项：动态 | 影视综 | 演出 | 活动 | 资料库 | 留言板 | 公告
- 只能通过左上角 Logo (`Chilam Is Here`) 回到首页，没有显式的「主页」导航
- 导航配置在 `src/config/navigation.ts` 的 `NAV_ITEMS` 数组

### 修改方案
在 `NAV_ITEMS` 数组**最前面**新增一项：

```typescript
// src/config/navigation.ts
export const NAV_ITEMS: NavItem[] = [
  { label: '主页', labelEn: 'Home', href: '/' },    // ← 新增
  { label: '动态', labelEn: 'Updates', href: '/updates' },
  // ...其余不变
];
```

### 需要注意
- Header 组件使用 `pathname.startsWith(item.href)` 判断激活状态
- `/` 是所有路径的前缀，需要对「主页」做精确匹配 `pathname === '/'`，否则所有页面都会高亮主页
- 移动端导航 `MobileNav` 也使用 `NAV_ITEMS`，需确认同样的激活逻辑

### 涉及文件
| 文件 | 修改内容 |
|------|----------|
| `src/config/navigation.ts` | 数组头部新增 `{ label: '主页', labelEn: 'Home', href: '/' }` |
| `src/components/layout/Header.tsx` | 修改激活判断：`href === '/' ? pathname === '/' : pathname.startsWith(item.href)` |
| `src/components/layout/MobileNav.tsx` | 同步检查激活逻辑，确保与 Header 一致 |

### 验收
- [ ] 导航栏显示：主页 | 动态 | 影视综 | 演出 | 活动 | 资料库 | 留言板 | 公告
- [ ] 点击「主页」跳转到 `/`
- [ ] 在首页时「主页」高亮，其他导航项不高亮
- [ ] 在 `/updates` 页面时，「动态」高亮，「主页」不高亮
- [ ] 移动端菜单同步显示「主页」且激活逻辑正确

---

## 修改 2：综艺删除地区 tag 筛选

### 现状
- `src/components/screens/ScreensFilterBar.tsx` 第 26-31 行定义了 `regionFilters`
- 仅在 `currentTab === 'variety_show'` 时显示（第 117-129 行）
- 组件接收 `currentRegion` prop
- 页面 `src/app/screens/page.tsx` 传入 `currentRegion` 参数

### 修改方案
1. 删除 `ScreensFilterBar` 中的 `regionFilters` 数组定义
2. 删除 `handleRegionChange` 回调函数
3. 删除 JSX 中综艺地区筛选的渲染块（第 116-129 行）
4. 从组件 props 接口中移除 `currentRegion`
5. 从页面组件中移除 `currentRegion` 的读取和传递

### 涉及文件
| 文件 | 修改内容 |
|------|----------|
| `src/components/screens/ScreensFilterBar.tsx` | 删除 `regionFilters`、`handleRegionChange`、地区渲染块、`currentRegion` prop |
| `src/app/screens/page.tsx` | 移除 `currentRegion` 参数的读取和传递 |

### 验收
- [ ] 综艺 tab 下只显示年代筛选，不再显示地区筛选
- [ ] 电影、电视剧 tab 不受影响
- [ ] URL 参数 `region` 不再生效（不影响功能）
- [ ] 构建通过，无 TypeScript 错误

---

## 修改 3：活动新增「直播」独立子分类

### 现状
- 活动模块目前有 2 个 tab：代言 (`endorsement`) 和 访谈 (`interview`)
- 类型定义：`type ActivityTab = 'endorsement' | 'interview'`（`src/lib/types.ts`）
- 访谈 tab 下有 `mediaTypeFilters`：全部 | 视频 | 音频 | 图文 | 直播
- 数据库有 `Interview` 模型，`InterviewMediaType` 枚举含 `LIVE`

### 设计决策（已确认）
- 直播**不属于**访谈，与代言/访谈**并列**为独立 tab
- 直播需要**单独设计**卡片组件
- 直播需要 **tag 子筛选**（按平台）

### 修改方案

#### a) 数据库 — 新增 Livestream 模型

```prisma
// prisma/schema.prisma

model Livestream {
  id            String    @id @default(cuid())
  slug          String    @unique
  title         String                          // 直播标题
  platform      String                          // 直播平台（抖音/微博/B站/小红书/YouTube等）
  date          DateTime                        // 直播日期
  summary       String?                         // 内容摘要
  originalUrl   String?   @map("original_url")  // 直播原始链接
  replayUrl     String?   @map("replay_url")    // 回放链接
  duration      Int?                            // 时长（分钟）
  coverImageId  String?   @map("cover_image_id")
  coverImage    Media?    @relation("LivestreamCover", fields: [coverImageId], references: [id])
  media         Media[]   @relation("LivestreamMedia")  // 相关媒体（截图等）
  tags          Tag[]                           // 多对多标签
  isVisible     Boolean   @default(true)  @map("is_visible")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt      @map("updated_at")

  @@map("livestreams")
}
```

需要运行 `prisma migrate dev` 生成迁移。

#### b) 类型定义

```typescript
// src/lib/types.ts
export type ActivityTab = 'endorsement' | 'interview' | 'livestream';

export interface LivestreamItem {
  id: string;
  slug: string;
  title: string;
  platform: string;
  date: string;
  summary: string | null;
  originalUrl: string | null;
  replayUrl: string | null;
  duration: number | null;
  coverImageUrl: string | null;
  tags: { name: string; slug: string }[];
}

export interface LivestreamDetail extends LivestreamItem {
  media: { url: string; type: string }[];
}
```

#### c) 直播 tag 子筛选（按平台）

```typescript
// src/components/activities/ActivitiesFilterBar.tsx 新增
const livestreamPlatformFilters = [
  { label: '全部', value: '' },
  { label: '抖音', value: 'douyin' },
  { label: '微博', value: 'weibo' },
  { label: 'B站', value: 'bilibili' },
  { label: '小红书', value: 'xiaohongshu' },
  { label: 'YouTube', value: 'youtube' },
  { label: '其他', value: 'other' },
];
```

当 `currentTab === 'livestream'` 时显示平台筛选 tag。

#### d) FilterBar 修改

```typescript
const tabs = [
  { label: '代言', value: 'endorsement' },
  { label: '访谈', value: 'interview' },
  { label: '直播', value: 'livestream' },  // ← 新增
];
```

#### e) 新组件 — LivestreamCard

```
src/components/activities/LivestreamCard.tsx
```

独立设计，展示信息：
- 封面图（如有）
- 直播标题
- 平台标签（如"抖音"）
- 日期
- 时长（如有）
- 回放链接按钮（如有）
- tags

#### f) 查询层

```typescript
// src/lib/queries/activities.ts 新增
export async function getLivestreams(options: {
  platform?: string;
  page?: number;
  pageSize?: number;
}) { ... }

export async function getLivestreamBySlug(slug: string) { ... }

// 更新 getActivityCounts 新增 livestream 计数
```

#### g) API 层

```
src/app/api/activities/livestreams/route.ts        — GET (列表) / POST (创建)
src/app/api/activities/livestreams/[slug]/route.ts  — GET (详情) / PUT (更新) / DELETE (删除)
```

#### h) 页面

```
src/app/activities/page.tsx                        — 新增 livestream tab 渲染逻辑
src/app/activities/livestream/[slug]/page.tsx       — 直播详情页（新建）
```

### 涉及文件
| 文件 | 修改内容 |
|------|----------|
| `prisma/schema.prisma` | 新增 `Livestream` 模型，更新 `Tag`/`Media` 关系 |
| `src/lib/types.ts` | `ActivityTab` 加 `'livestream'`，新增 `LivestreamItem`/`LivestreamDetail` |
| `src/components/activities/ActivitiesFilterBar.tsx` | 新增直播 tab + 平台子筛选，删除访谈的直播 mediaType |
| `src/components/activities/LivestreamCard.tsx` | **新建** — 直播卡片组件 |
| `src/lib/queries/activities.ts` | 新增 `getLivestreams`、`getLivestreamBySlug`、更新 counts |
| `src/app/activities/page.tsx` | 处理 `livestream` tab 渲染 |
| `src/app/activities/livestream/[slug]/page.tsx` | **新建** — 直播详情页 |
| `src/app/api/activities/livestreams/route.ts` | **新建** — CRUD API |
| `src/app/api/activities/livestreams/[slug]/route.ts` | **新建** — 详情 API |

### 验收
- [ ] 活动页 tab 显示：代言 | 访谈 | 直播
- [ ] 直播 tab 有平台子筛选 tag
- [ ] 点击「直播」tab 正确切换，URL 更新为 `?tab=livestream`
- [ ] 访谈 tab 下不再包含「直播」mediaType
- [ ] 直播列表空数据不报错
- [ ] 直播详情页可访问
- [ ] 数据库迁移成功
- [ ] 构建和 lint 通过

---

## 修改 4：访谈删除「直播」媒体类型标签

### 现状
- `ActivitiesFilterBar.tsx` 第 17-23 行 `mediaTypeFilters` 包含 `LIVE`
- `InterviewCard.tsx` 第 16-21 行 `mediaTypeLabels` 包含 `LIVE: '直播'`
- 数据库枚举 `InterviewMediaType` 包含 `LIVE`

### 修改方案
> 与修改 3 联动 — 直播已提升为独立 tab。

1. `ActivitiesFilterBar.tsx`：从 `mediaTypeFilters` 删除 `{ label: '直播', value: 'LIVE' }`
2. `InterviewCard.tsx`：保留 `LIVE` label 用于历史数据兼容显示（不删除）
3. 数据库枚举 `InterviewMediaType` 暂不删除 `LIVE`，避免已有数据出错

### 涉及文件
| 文件 | 修改内容 |
|------|----------|
| `src/components/activities/ActivitiesFilterBar.tsx` | 删除 `mediaTypeFilters` 中的直播项 |
| `src/components/activities/InterviewCard.tsx` | 保留 `LIVE` label（兼容） |

### 验收
- [ ] 访谈 tab 下媒体类型筛选显示：全部 | 视频 | 音频 | 图文（无直播）
- [ ] 如有历史 LIVE 数据的访谈卡片，标签正常显示不报错

---

## 修改 5：故事分享新增 tag 分类筛选

### 现状
- `GuestbookFilterBar.tsx` 只有主 tab 切换，没有 tag 子筛选
- `GuestbookForm.tsx` 定义了 `storyTagOptions = ['追星经历', '影视回忆', '音乐记忆', '冷知识', '其他']`
- 用户发帖时可以选 storyTag，但列表页没有按 tag 筛选

### 修改方案
在 `GuestbookFilterBar` 中，当 `currentTab === 'story'` 时显示 tag 子筛选（**不含**时间 tag）。

**a) FilterBar 修改**
```typescript
// src/components/guestbook/GuestbookFilterBar.tsx
const storyTagFilters = [
  { label: '全部', value: '' },
  { label: '追星经历', value: '追星经历' },
  { label: '影视回忆', value: '影视回忆' },
  { label: '音乐记忆', value: '音乐记忆' },
  { label: '冷知识', value: '冷知识' },
  { label: '其他', value: '其他' },
];

// TabBar 下方条件渲染 tag 筛选
```

**b) 新增 Props**: `currentStoryTag?: string`

**c) 页面**: 读取 `searchParams.storyTag`，传给 FilterBar 和查询层

**d) 查询层**: `storyTags: { has: storyTag }` 过滤

### 涉及文件
| 文件 | 修改内容 |
|------|----------|
| `src/components/guestbook/GuestbookFilterBar.tsx` | 新增 tag 筛选渲染 + `currentStoryTag` prop |
| `src/app/messages/page.tsx` | 读取 `storyTag` 参数 |
| `src/lib/queries/guestbook.ts` | 查询条件新增 `storyTag` 过滤 |

### 验收
- [ ] 故事分享 tab 下显示 tag 筛选：全部 | 追星经历 | 影视回忆 | 音乐记忆 | 冷知识 | 其他
- [ ] 点击 tag 正确过滤，URL 更新 `?tab=story&storyTag=追星经历`
- [ ] 切换到其他 tab 时 tag 筛选消失
- [ ] 不含时间/年份筛选

---

## 修改 6：路透新增「其他」tag

### 现状
```typescript
const sightingTypeFilters = [
  { label: '全部', value: '' },
  { label: '机场', value: 'airport' },
  { label: '片场', value: 'set' },
  { label: '偶遇', value: 'encounter' },
];
```

### 修改方案
数组末尾新增 `{ label: '其他', value: 'other' }`。
同步更新 `SightingType` 类型定义。

### 涉及文件
| 文件 | 修改内容 |
|------|----------|
| `src/components/updates/UpdatesFilterBar.tsx` | 新增 `other` 筛选项 |
| `src/lib/types.ts` | `SightingType` 新增 `'其他'` |

### 验收
- [ ] 路透 tab 显示：全部 | 机场 | 片场 | 偶遇 | 其他
- [ ] 点击「其他」正确过滤

---

## 修改 7：筛选栏与内容卡片间距统一

### 现状
| 页面 | FilterBar 间距 | 状态 |
|------|---------------|------|
| 动态 `/updates` | `mb-8`（32px） | 正常 |
| 影视综 `/screens` | 无 | **需修复** |
| 活动 `/activities` | 无 | **需修复** |
| 留言板 `/messages` | 无 | **需修复** |

### 修改方案
各页面的 FilterBar 组件传入 `className="mb-8"`，与 Updates 页面统一。

### 涉及文件
| 文件 | 修改内容 |
|------|----------|
| `src/app/screens/page.tsx` | ScreensFilterBar 添加 `className="mb-8"` |
| `src/app/activities/page.tsx` | ActivitiesFilterBar 添加 `className="mb-8"` |
| `src/app/messages/page.tsx` | GuestbookFilterBar 添加 `className="mb-8"` |

### 验收
- [ ] 所有带筛选 tag 的页面间距统一（32px）
- [ ] 响应式下表现一致

---

## 功能 8：全站检索

### 现状
- 当前无任何搜索功能
- 数据分布在多张表：`SocialPost`、`NewsArticle`、`Sighting`、`Production`、`Performance`、`Endorsement`、`Interview`、`Livestream`（新增）、`Album`、`Magazine`、`Guestbook`、`Announcement`
- PostgreSQL 支持全文搜索（`@@` 运算符 + `tsvector`）

### 实现评估
**可以实现，方案分两级：**

#### 方案 A：简单搜索（推荐先做）
使用 Prisma 的 `contains` 模糊搜索，对多张表并行查询。

**优点**：实现简单、无需 Schema 变更
**缺点**：性能一般（大数据量时慢）、不支持分词

#### 方案 B：PostgreSQL 全文搜索（后续优化）
使用 `tsvector` + `tsquery`，需要为搜索字段建立全文索引。

**优点**：性能好、支持中文分词（需安装 `zhparser` 扩展）
**缺点**：需要数据库迁移、Supabase 需确认扩展支持

### 推荐方案 A 实现细节

#### a) 搜索 API

```
src/app/api/search/route.ts  — GET ?q=关键词&type=all|updates|screens|...&page=1
```

```typescript
// 伪代码
export async function GET(request: Request) {
  const q = searchParams.get('q');
  if (!q || q.length < 2) return error;

  // 并行查询多张表
  const [socialPosts, newsArticles, sightings, productions,
         performances, endorsements, interviews, livestreams,
         albums, magazines, announcements] = await Promise.all([
    db.socialPost.findMany({ where: { OR: [
      { content: { contains: q, mode: 'insensitive' } },
    ]}, take: 5 }),
    // ... 其他表类似
  ]);

  // 统一格式化为搜索结果
  return results.map(item => ({
    type: 'social_post' | 'news' | 'production' | ...,
    title: item.title || item.content?.slice(0, 50),
    url: buildUrl(item),   // 生成对应详情页链接
    date: item.date,
    snippet: highlight(item.content, q),  // 关键词高亮摘要
  }));
}
```

#### b) 搜索 UI

```
src/components/layout/SearchBar.tsx       — 搜索输入框（嵌入 Header）
src/components/layout/SearchModal.tsx     — 搜索弹窗/下拉面板
src/app/search/page.tsx                   — 搜索结果页（完整结果+分页）
```

**交互流程**：
1. Header 右侧显示搜索图标
2. 点击打开搜索弹窗/overlay
3. 输入关键词 → 实时请求 API → 显示下拉结果（最多显示每类前 3 条）
4. 点击「查看全部结果」跳转 `/search?q=关键词`
5. 搜索结果页支持按类型筛选 + 分页

#### c) 搜索结果项组件

每条搜索结果显示：
- 类型标签（动态/影视/演出/活动/…）
- 标题/内容摘要（关键词高亮）
- 日期
- 可点击跳转到详情页

### 涉及文件
| 文件 | 修改内容 |
|------|----------|
| `src/app/api/search/route.ts` | **新建** — 搜索 API |
| `src/components/layout/SearchBar.tsx` | **新建** — 搜索触发按钮 |
| `src/components/layout/SearchModal.tsx` | **新建** — 搜索弹窗 |
| `src/app/search/page.tsx` | **新建** — 搜索结果页 |
| `src/components/layout/Header.tsx` | 嵌入搜索按钮 |
| `src/lib/queries/search.ts` | **新建** — 搜索查询层 |
| `src/lib/types.ts` | 新增 `SearchResult` 等类型 |

### 验收
- [ ] Header 显示搜索图标
- [ ] 点击弹出搜索弹窗，可输入关键词
- [ ] 搜索结果按类型分组展示
- [ ] 每条结果可点击跳转到对应详情页
- [ ] 搜索结果页支持分页
- [ ] 空结果/短关键词有友好提示
- [ ] 搜索不影响页面性能（debounce 处理）

---

## 功能 9：用户注册/登录系统

### 现状
- 仅有管理员认证（`src/lib/auth.ts`，JWT + `jose`）
- 无用户模型，留言板通过 `nickname` 字符串标识作者
- 管理员 token 通过 `Authorization: Bearer` 传递

### 实现方案

#### a) 数据库 — 新增 User 模型

```prisma
// prisma/schema.prisma

model User {
  id           String     @id @default(cuid())
  username     String     @unique                    // 用户名（唯一）
  password     String                                // bcrypt 哈希后存储
  displayName  String?    @map("display_name")       // 显示名称（可选）
  avatar       String?                               // 头像 URL
  isActive     Boolean    @default(true) @map("is_active")
  guestbooks   Guestbook[]                           // 用户的留言
  comments     Comment[]                             // 用户的评论
  createdAt    DateTime   @default(now()) @map("created_at")
  updatedAt    DateTime   @updatedAt      @map("updated_at")

  @@map("users")
}
```

同时更新 `Guestbook` 和 `Comment` 模型，新增 `userId` 外键：
```prisma
model Guestbook {
  // ...现有字段...
  userId    String?   @map("user_id")        // 可空，兼容历史匿名数据
  user      User?     @relation(fields: [userId], references: [id])
}

model Comment {
  // ...现有字段...
  userId    String?   @map("user_id")
  user      User?     @relation(fields: [userId], references: [id])
}
```

#### b) 用户名校验规则

**禁止注册的用户名（服务端 + 前端双重校验）**：
```typescript
// src/lib/username-validator.ts

export function isForbiddenUsername(username: string): { forbidden: boolean; reason: string } {
  const normalized = username.toLowerCase().trim();

  // 1. 简体/繁体「张智霖」「張智霖」— 任意位置包含即拒绝
  const chilamChinese = ['张智霖', '張智霖'];
  for (const name of chilamChinese) {
    if (normalized.includes(name)) {
      return { forbidden: true, reason: '用户名不能包含艺人姓名' };
    }
  }

  // 2. Chilam — 任意位置、任意大小写包含即拒绝
  if (normalized.includes('chilam')) {
    return { forbidden: true, reason: '用户名不能包含 Chilam' };
  }

  // 3. Julian Cheung — 任意位置、任意大小写、有无空格/分隔符都拒绝
  //    去掉所有非字母数字字符后检查
  const alphanumOnly = normalized.replace(/[^a-z0-9\u4e00-\u9fff]/g, '');
  if (alphanumOnly.includes('juliancheung') || alphanumOnly.includes('cheungjulian')) {
    return { forbidden: true, reason: '用户名不能包含 Julian Cheung' };
  }
  // 分开出现也拒绝（如 "julian_loves_cheung"）
  if (normalized.includes('julian') && normalized.includes('cheung')) {
    return { forbidden: true, reason: '用户名不能包含 Julian Cheung' };
  }

  return { forbidden: false, reason: '' };
}
```

#### c) 认证流程

复用现有 JWT 体系（`jose` 库），新增用户 token 类型：

```typescript
// src/lib/auth.ts 扩展
interface UserPayload {
  userId: string;
  username: string;
}

// 新增环境变量: USER_JWT_SECRET（与管理员分开）
// Token 有效期: 7 天
// 签发函数: signUserToken(payload) → string
// 验证函数: verifyUserToken(token) → UserPayload | null
```

#### d) API 接口

```
src/app/api/auth/register/route.ts   — POST { username, password }
  → 校验用户名长度（2-20 字符）
  → 校验用户名禁用规则（isForbiddenUsername）
  → 检查用户名唯一性（数据库查询）
  → bcrypt 哈希密码（saltRounds=12）
  → 创建用户
  → 签发 JWT token
  → 返回 { token, user: { id, username } }

src/app/api/auth/login/route.ts      — POST { username, password }
  → 查找用户（username 精确匹配）
  → 检查 isActive 状态
  → bcrypt.compare 验证密码
  → 签发 JWT token
  → 返回 { token, user: { id, username, displayName, avatar } }

src/app/api/auth/me/route.ts         — GET (Bearer token)
  → 验证 token
  → 返回当前用户信息（不含 password）
```

#### e) 前端组件

```
src/components/auth/LoginModal.tsx     — 登录弹窗
src/components/auth/RegisterModal.tsx  — 注册弹窗
src/components/auth/AuthProvider.tsx   — React Context，管理登录状态
src/components/auth/UserMenu.tsx       — 已登录用户下拉菜单（头像+用户名）
```

**交互流程**：
1. 未登录：Header 右侧显示「登录」按钮
2. 点击弹出登录弹窗（含「去注册」链接）
3. 注册时实时校验用户名（禁用词 + debounce 查重）
4. 登录成功：Header 显示用户名 + 头像，下拉菜单有「个人中心」「退出」
5. Token 存储在 `localStorage`，刷新时自动调 `/api/auth/me` 恢复状态

#### f) 留言板权限变更
- 浏览留言：**不需要**登录
- 发布留言：**需要**登录（发布后直接可见，无需审核）
- 点赞：**需要**登录
- 评论：**需要**登录
- `GuestbookForm` 在未登录时显示「请先登录后发言」提示 + 登录按钮

### 涉及文件
| 文件 | 修改内容 |
|------|----------|
| `prisma/schema.prisma` | 新增 `User` 模型，更新 `Guestbook`/`Comment` 加 `userId` |
| `src/lib/auth.ts` | 扩展 `UserPayload`，新增用户 token 签发/验证 |
| `src/lib/username-validator.ts` | **新建** — 用户名禁用词校验 |
| `src/app/api/auth/register/route.ts` | **新建** — 注册 API |
| `src/app/api/auth/login/route.ts` | **新建** — 登录 API |
| `src/app/api/auth/me/route.ts` | **新建** — 获取当前用户 |
| `src/components/auth/LoginModal.tsx` | **新建** — 登录弹窗 |
| `src/components/auth/RegisterModal.tsx` | **新建** — 注册弹窗 |
| `src/components/auth/AuthProvider.tsx` | **新建** — 全局认证 Context |
| `src/components/auth/UserMenu.tsx` | **新建** — 用户菜单 |
| `src/components/layout/Header.tsx` | 嵌入登录按钮 / 用户菜单 |
| `src/components/guestbook/GuestbookForm.tsx` | 改造：需登录才能发言，去掉 nickname 手动输入 |
| `src/app/api/messages/route.ts` | POST 验证用户 token，自动关联 userId |
| `src/app/api/messages/[id]/like/route.ts` | 验证用户 token |
| `src/app/api/messages/[id]/comments/route.ts` | 验证用户 token |

### 验收
- [ ] 注册成功 → 自动登录 → Header 显示用户名
- [ ] 用户名 `张智霖`、`張智霖` 注册被拒（含包含情况，如 `我是张智霖`）
- [ ] 用户名 `Chilam`、`chilam`、`MyChilam123` 注册被拒
- [ ] 用户名 `JulianCheung`、`julian_cheung`、`I_am_Julian_and_Cheung` 注册被拒
- [ ] 重复用户名注册被拒
- [ ] 登录成功 → JWT 正确签发
- [ ] 未登录不能发留言/评论/点赞，但可以浏览
- [ ] Token 过期后提示重新登录
- [ ] 刷新页面后登录状态保持

---

## 功能 10：用户个人页面 + 留言管理

### 现状
- 无用户页面
- 留言无法按用户筛选
- 留言编辑/删除只有管理员能操作

### 实现方案

#### a) 用户个人中心页面

```
src/app/profile/page.tsx            — 个人中心主页
src/app/profile/messages/page.tsx   — 我的留言列表
src/app/profile/settings/page.tsx   — 个人设置（改密码、改显示名）
```

**个人中心主页显示**：
- 用户名 + 头像
- 统计：留言数、评论数、获赞数
- 最近留言预览（前 5 条）
- 快捷入口：我的留言、个人设置

#### b) 我的留言管理

**功能**：
- 查看自己发布的所有留言（分页）
- 编辑自己的留言内容
- 删除自己的留言（软删除或硬删除）

**API**：
```
src/app/api/user/messages/route.ts       — GET 我的留言列表
src/app/api/user/messages/[id]/route.ts  — PUT (编辑) / DELETE (删除)
```

权限校验：只能操作 `userId === 当前登录用户` 的留言。

#### c) 个人设置

```
src/app/api/user/profile/route.ts   — GET / PUT（修改显示名、头像）
src/app/api/user/password/route.ts  — PUT（修改密码，需验证旧密码）
```

#### d) 组件

```
src/components/profile/ProfileHeader.tsx    — 个人信息展示
src/components/profile/MessageList.tsx      — 我的留言列表（含编辑/删除按钮）
src/components/profile/EditMessageModal.tsx — 编辑留言弹窗
src/components/profile/SettingsForm.tsx     — 设置表单
```

#### e) 留言板内联操作

在公开留言板页面，登录用户查看**自己的**留言时，卡片上显示「编辑」「删除」操作按钮（他人留言不显示）。

### 涉及文件
| 文件 | 修改内容 |
|------|----------|
| `src/app/profile/page.tsx` | **新建** — 个人中心主页 |
| `src/app/profile/messages/page.tsx` | **新建** — 我的留言列表 |
| `src/app/profile/settings/page.tsx` | **新建** — 个人设置 |
| `src/app/api/user/messages/route.ts` | **新建** — 我的留言 API |
| `src/app/api/user/messages/[id]/route.ts` | **新建** — 留言编辑/删除 |
| `src/app/api/user/profile/route.ts` | **新建** — 个人信息 API |
| `src/app/api/user/password/route.ts` | **新建** — 修改密码 API |
| `src/components/profile/ProfileHeader.tsx` | **新建** |
| `src/components/profile/MessageList.tsx` | **新建** |
| `src/components/profile/EditMessageModal.tsx` | **新建** |
| `src/components/profile/SettingsForm.tsx` | **新建** |
| `src/lib/queries/user.ts` | **新建** — 用户相关查询 |
| `src/components/guestbook/GuestbookCard.tsx` | 登录用户查看自己留言时显示编辑/删除按钮 |

### 验收
- [ ] 登录后可访问 `/profile`，显示个人统计
- [ ] `/profile/messages` 显示自己的留言列表
- [ ] 可编辑自己的留言
- [ ] 可删除自己的留言
- [ ] 不能编辑/删除他人留言（API 返回 403）
- [ ] 留言板页面自己的留言卡片有编辑/删除按钮
- [ ] 未登录访问 `/profile` 重定向到首页或弹出登录
- [ ] 修改密码功能正常

---

## 功能 11：移除内容审核机制

### 背景
现阶段所有用户生成内容（留言、路透、粉丝拍摄等）**不需要审核**，发布后直接可见。用户可以自行编辑/删除自己的内容。管理员保留后台删除权限作为兜底。

### 现状分析

当前有 3 处使用了 `ModerationStatus`（PENDING → APPROVED/REJECTED）审核流程：

| 模型 | 字段 | 创建时默认值 | 查询过滤 |
|------|------|-------------|----------|
| `Guestbook`（留言） | `status` | `PENDING` | 只返回 `APPROVED` |
| `Sighting`（路透） | `status` | `PENDING` | 只返回 `APPROVED` |
| `FanShot`（粉丝拍摄） | `status` | `PENDING` | 只返回 `APPROVED` |

**受影响的代码位置**：

**a) 创建时设为 PENDING（需改为 APPROVED）**
| 文件 | 位置 | 当前值 |
|------|------|--------|
| `src/app/api/messages/route.ts` | POST handler ~L74 | `status: 'PENDING'` |
| `src/app/api/updates/sightings/route.ts` | POST handler ~L63 | `status: 'PENDING'` |

**b) 查询时过滤 APPROVED（需移除过滤）**
| 文件 | 位置 | 当前逻辑 |
|------|------|----------|
| `src/lib/queries/guestbook.ts` | ~L36 | `where: { status: 'APPROVED' }` |
| `src/lib/queries/guestbook.ts` | ~L84 | `if (raw.status !== 'APPROVED') return null` |
| `src/lib/queries/guestbook.ts` | ~L107-109 | 计数 `status: 'APPROVED'` |
| `src/lib/queries/updates.ts` | ~L87 | `where: { status: ModerationStatus.APPROVED }` |
| `src/lib/queries/updates.ts` | ~L120 | 计数 `status: ModerationStatus.APPROVED` |
| `src/lib/queries/performances.ts` | ~L87 | FanShot `where: { status: 'APPROVED' }` |

**c) 管理员审核 API（保留但降级为"删除/管理"功能）**
| 文件 | 用途 |
|------|------|
| `src/app/api/admin/messages/route.ts` | 管理员列表/批量审核 |
| `src/app/api/admin/messages/[id]/route.ts` | 管理员单条审核 |

### 修改方案

**策略：保留 `status` 字段但改变默认行为**

不删除 `ModerationStatus` 枚举和 `status` 字段（保持数据库兼容性，方便未来重新启用审核），只改变运行时行为：

#### 步骤 1：创建时默认 APPROVED

```typescript
// src/app/api/messages/route.ts — POST
status: 'APPROVED',  // 改：之前是 'PENDING'

// src/app/api/updates/sightings/route.ts — POST
status: 'APPROVED',  // 改：之前是 'PENDING'
```

#### 步骤 2：查询时不再过滤状态

```typescript
// src/lib/queries/guestbook.ts
// 删除或注释掉 status: 'APPROVED' 过滤条件
// 改为只排除 REJECTED（管理员主动删除的）
where: { status: { not: 'REJECTED' } }

// src/lib/queries/updates.ts — Sighting 查询
where: { status: { not: 'REJECTED' } }

// src/lib/queries/performances.ts — FanShot 查询
where: { status: { not: 'REJECTED' } }
```

> 用 `not: 'REJECTED'` 而非完全移除过滤，是为了让管理员仍能通过将 status 设为 REJECTED 来隐藏违规内容。

#### 步骤 3：管理员 API 保留，调整用途

- 管理员仍可查看所有内容（含 REJECTED）
- 管理员可将内容标记为 REJECTED（相当于删除/隐藏）
- 不再需要 PENDING → APPROVED 的审批流程

#### 步骤 4：Seed 数据更新

`prisma/seed.ts` 中已有数据都是 `status: 'APPROVED'`，无需改动。

### 涉及文件
| 文件 | 修改内容 |
|------|----------|
| `src/app/api/messages/route.ts` | POST: `status: 'PENDING'` → `status: 'APPROVED'` |
| `src/app/api/updates/sightings/route.ts` | POST: `status: 'PENDING'` → `status: 'APPROVED'` |
| `src/lib/queries/guestbook.ts` | 查询/计数：`status: 'APPROVED'` → `status: { not: 'REJECTED' }` |
| `src/lib/queries/updates.ts` | Sighting 查询/计数：同上 |
| `src/lib/queries/performances.ts` | FanShot 查询：同上 |
| `prisma/schema.prisma` | **不改** — 保留 `ModerationStatus` 枚举和 `status` 字段 |
| `src/app/api/admin/messages/` | **不删** — 保留管理员管理能力 |

### 验收
- [ ] 新发布的留言**立即可见**（无需等待审核）
- [ ] 新提交的路透**立即可见**
- [ ] 新提交的粉丝拍摄**立即可见**
- [ ] 管理员仍可将违规内容标记为 REJECTED 使其不可见
- [ ] 被 REJECTED 的内容在前台不可见
- [ ] 留言计数正确（包含所有非 REJECTED 内容）
- [ ] 数据库 Schema 未改动，无需迁移

---

## 执行顺序建议

```
阶段一：简单 UI 调整 + 审核移除（可并行，无依赖）
  ├── 修改 1  — 导航加主页
  ├── 修改 2  — 综艺删地区
  ├── 修改 6  — 路透加其他
  ├── 修改 7  — 间距统一
  └── 功能 11 — 移除审核机制

阶段二：中等 UI 调整（可并行）
  ├── 修改 5     — 故事分享 tag 筛选
  └── 修改 3 + 4 — 直播独立 tab（联动）

阶段三：用户系统（有依赖关系，串行执行）
  ├── 功能 9a — 数据库：User 模型 + 迁移
  ├── 功能 9b — 后端：注册/登录 API + 用户名校验
  ├── 功能 9c — 前端：登录/注册弹窗 + AuthProvider
  └── 功能 9d — 留言板权限改造（发布需登录，无需审核）

阶段四：用户个人页面（依赖阶段三）
  ├── 功能 10a — 后端：用户留言管理 API（编辑/删除自己的）
  ├── 功能 10b — 前端：个人中心 + 留言管理页
  ├── 功能 10c — 前端：留言板卡片内联编辑/删除（仅自己的）
  └── 功能 10d — 前端：个人设置

阶段五：全站检索（可独立）
  ├── 功能 8a — 后端：搜索 API
  ├── 功能 8b — 前端：搜索弹窗 + 结果页
  └── 功能 8c — Header 嵌入搜索入口
```

---

## 数据库迁移计划

本次需要 **2 次迁移**：

| 迁移 | 内容 | 对应功能 |
|------|------|----------|
| 迁移 1 | 新增 `Livestream` 模型 | 修改 3 |
| 迁移 2 | 新增 `User` 模型 + `Guestbook`/`Comment` 加 `userId` 外键 | 功能 9 |

> 功能 11（移除审核）**不需要迁移**，只改运行时逻辑。

---

## 总验收清单

- [ ] `pnpm lint` 通过
- [ ] `pnpm build` 通过
- [ ] `prisma migrate dev` 迁移成功（2 次）
- [ ] 所有页面导航正常，无 404
- [ ] 所有筛选功能正确工作
- [ ] 间距统一美观
- [ ] 内容发布后**立即可见**，无审核等待
- [ ] 管理员仍可隐藏违规内容
- [ ] 搜索功能正常
- [ ] 注册/登录流程完整
- [ ] 用户名禁用规则生效（张智霖/Chilam/Julian Cheung）
- [ ] 留言权限正确（浏览无需登录，发布需登录，发布后直接可见）
- [ ] 用户可编辑/删除自己的留言
- [ ] 不能操作他人留言
- [ ] 响应式布局无异常
