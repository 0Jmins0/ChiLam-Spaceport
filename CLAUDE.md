# Chilam Is Here - 张智霖全面资讯网站

## 项目概述
一个集合张智霖各平台、各阶段、各渠道资讯的综合性粉丝网站。

## 当前进度
- **阶段**: P6 用户反馈迭代进行中
- **已完成**: P0~P4 全部、UI 调整阶段一~五、P5.0 海报/封面填充、P6.1 体验修复、P6.8 演出详情页优化、P6.2 访谈详情页重做
- **下一步**: P6.3 瀑布流 → P6.4~P6.9
- **详细进度**: 查看 `/docs/PROGRESS.md`

## 技术栈
- **前端**: Next.js 16.2.6 (App Router) + TypeScript 5.9 + Tailwind CSS 4.3
- **后端**: Next.js API Routes + Prisma 7.8
- **数据库**: PostgreSQL (Supabase - 已配置, Session pooler)
- **存储**: Cloudflare R2 (图片/视频/文件 - 已配置, @aws-sdk/client-s3)
- **部署**: Vercel (前端) + Supabase (数据库) - 待配置
- **渲染策略**: 全站动态渲染 (SSR)，所有列表页 `force-dynamic`
- **包管理**: pnpm 11.5
- **代码规范**: ESLint 9 + Prettier 3.8

## 关键路径

### 项目目录
```
/Users/hihi/WorkSpace/ARIS/Chilam_Is_Here/          # 项目根目录
├── CLAUDE.md                                        # 本文件 - Claude 每次读取
├── docs/
│   ├── DEVELOPMENT_PLAN.md                          # 开发计划（阶段任务）
│   ├── PROGRESS.md                                  # 进度记录（完成情况）
│   ├── Database_Design_v1.md                        # 数据库设计文档（Schema 依据）
│   ├── BEGINNER_GUIDE.md                            # 零基础开发指南
│   └── chilam-website-design.md                     # 网站业务设计文档
├── src/
│   ├── app/                                         # Next.js App Router 页面
│   │   ├── page.tsx                                 # 首页（数据库驱动时间线）
│   │   ├── updates/                                 # 动态模块（列表 + 三种详情页）
│   │   ├── screens/                                 # 影视模块（列表 + 详情页）
│   │   ├── activities/                              # 活动模块（列表 + 代言详情 + 访谈详情 + 直播详情）
│   │   ├── archives/                                # 资料库模块（列表 + 专辑详情 + 杂志详情）
│   │   ├── messages/                                # 留言板（列表 + 详情页）
│   │   ├── announcements/                           # 公告（列表 + 详情页）
│   │   ├── profile/                                 # 用户个人中心（主页 + 留言管理 + 设置）
│   │   ├── search/                                  # 搜索结果页
│   │   ├── api/updates/                             # 动态 CRUD API
│   │   ├── api/screens/                             # 影视 CRUD API
│   │   ├── api/performances/                        # 演出 CRUD API
│   │   ├── api/activities/                          # 活动 CRUD API（代言+访谈+直播）
│   │   ├── api/archives/                            # 资料库 CRUD API（专辑+杂志）
│   │   ├── api/messages/                            # 留言板 CRUD + 点赞 + 评论 API
│   │   ├── api/announcements/                       # 公告 CRUD API
│   │   ├── api/auth/                                # 用户认证 API（注册+登录+me）
│   │   ├── api/user/                                # 用户个人 API（profile+password+messages）
│   │   ├── api/upload/                              # 文件上传 API（R2 直传+预签名）
│   │   ├── api/search/                              # 全站搜索 API
│   │   └── api/admin/                               # 管理后台 API（登录+审核）
│   ├── components/
│   │   ├── layout/                                  # 布局组件（Header, Footer, MobileNav 等）
│   │   ├── ui/                                      # 通用 UI 组件（Button, Card, Tag, Pagination 等）
│   │   ├── auth/                                    # 认证组件（AuthProvider, LoginModal, RegisterModal, UserMenu）
│   │   ├── search/                                  # 搜索组件（SearchModal, SearchResultCard）
│   │   ├── profile/                                 # 个人中心组件（ProfileHeader, MessageList, EditMessageModal, SettingsForm）
│   │   ├── updates/                                 # 动态组件（SocialPostCard, NewsArticleCard 等）
│   │   ├── screens/                                 # 影视组件（ProductionCard, ScreensFilterBar）
│   │   ├── performances/                            # 演出组件（PerformanceCard, PerformancesFilterBar）
│   │   ├── activities/                              # 活动组件（EndorsementCard, InterviewCard, LivestreamCard, ActivitiesFilterBar）
│   │   ├── archives/                                # 资料库组件（AlbumCard, MagazineCard, ArchivesFilterBar）
│   │   ├── guestbook/                               # 留言板组件（GuestbookCard, GuestbookGrid, Form, LikeButton, CommentSection, CardActions 等）
│   │   ├── announcements/                           # 公告组件（AnnouncementCard, FilterBar）
│   │   └── decorative/                              # 装饰组件（FilmGrain, YearMarquee）
│   ├── config/                                      # 站点配置（site.ts, navigation.ts）
│   ├── lib/                                         # 工具函数
│   │   ├── cn.ts, fonts.ts, db.ts, r2.ts            # 基础工具 + R2 存储
│   │   ├── auth.ts                                  # JWT 认证（管理员 + 用户双密钥）
│   │   ├── username-validator.ts                    # 用户名禁用词校验
│   │   ├── types.ts                                 # 数据类型定义
│   │   └── queries/                                 # 数据查询层（timeline.ts, updates.ts, productions.ts, performances.ts, activities.ts, archives.ts, guestbook.ts, announcements.ts, user.ts, search.ts）
│   └── generated/                                   # Prisma 生成的客户端代码
├── prisma/
│   ├── schema.prisma                                # 数据库 Schema（已完成，22 张表）
│   └── seed.ts                                      # 种子数据脚本
└── public/                                          # 静态资源
```

### 规划文档 (Obsidian - 仅在明确要求时读取)
```
/Users/hihi/Library/Mobile Documents/iCloud~md~obsidian/Documents/Obsidian Vault/01-IDEA孵化/01-Chilam is here网站开发/
├── 00-相关内容+进度.md        # 域名、数据库地址、服务器信息、TODO
├── 01-网站框架.md             # 栏目结构与内容规划
├── 02-数据库存储.md           # 数据库设计文档
└── 详细设计/                  # 各模块详细设计
```

## 数据库设计
- **Schema 文件**: `prisma/schema.prisma`（已完成）
- **设计文档**: `docs/Database_Design_v1.md`（Schema 的设计依据）
- **表数量**: 22 张表 + 10 个枚举
- **核心设计**:
  - `User` 用户表 + `Like` 点赞表：登录/注册、互动统计、星光积分
  - `Media` 统一媒体资源表：单引用用直接 FK，集合引用用 Prisma 隐式多对多
  - `Tag` 全站标签：与 9 张内容表多对多关联
  - `ContentRelation` 跨内容关联：多态引用（sourceType/Id → targetType/Id）
  - 渐进增强模式：链接优先 → 回填完整内容（social_posts / news_articles / sightings）

## 服务器与数据库
- **GitHub 仓库**: `git@github.com:0Jmins0/ChiLam-Spaceport.git`（origin）
- **域名**: 待定
- **Supabase 项目**: 已配置（Session pooler, ap-northeast-2, 迁移已完成）
- **Cloudflare R2**: 已配置（Bucket: chilam-media, r2.dev 公开访问）
- **Vercel 项目**: 待创建

## 栏目结构
| 栏目 | 路由 | 子分类 |
|------|------|--------|
| 首页 | `/` | 时间线、大图、一句话 |
| 动态 | `/updates` | 社交媒体、新闻报道、路透 |
| 影视 | `/screens` | 电影、电视剧、综艺 |
| 演出 | `/performances` | 演唱会、舞台、音乐剧 |
| 活动 | `/activities` | 广告代言、访谈、直播 |
| 资料库 | `/archives` | 杂志、专辑 |
| 留言 | `/messages` | 我想对你说、故事分享、冷知识、建议反馈 |
| 公告 | `/announcements` | 网站公告、规则、更新通知 |
| 搜索 | `/search` | 全站检索（11 类型筛选） |
| 个人中心 | `/profile` | 主页、留言管理(/messages)、设置(/settings) |

## 协作流程（每次开发的标准流程）

Claude 始终作为**主代理（PM）**，不直接写代码，负责规划、调度、验收和文档维护。

### 流程总览

```
用户提需求 → ① 计划 → ② 确认 → ③ 子代理执行 → ④ 验收 → ⑤ 收尾
```

### 各阶段详细说明

#### ① 计划阶段
- 读取 `CLAUDE.md`、`DEVELOPMENT_PLAN.md`、`PROGRESS.md` 了解当前状态
- 如涉及架构/Schema 变更，先输出**设计文档**（markdown 格式）供用户审阅
- 制定实施计划：拆分任务、明确每个子代理的职责和输入输出
- 列出需要创建/修改的文件清单

#### ② 确认阶段
- 将计划展示给用户，等待明确确认后再执行
- 用户可以调整优先级、修改方案、增减范围
- **未经确认不动手**

#### ③ 子代理执行阶段
- 按计划派出子代理（Agent tool）执行具体编码任务
- 每个子代理给出完整上下文：现有代码引用、接口签名、设计规范、文件路径
- 独立任务并行执行，有依赖的按顺序执行
- 主代理不直接写代码，只在必要时做微调修复

#### ④ 验收阶段
- 运行 `pnpm build` 确认构建通过
- 运行 `pnpm lint` 确认代码规范
- 检查关键文件是否符合预期（读取并审查子代理产出）
- 如有问题，定位原因后派子代理修复，再次验收

#### ⑤ 收尾阶段（按顺序执行）

| 步骤 | 内容 | 说明 |
|------|------|------|
| 5.1 数据库 | Schema 变更 → 迁移 → seed 更新 | 如有 Prisma 变更，运行 `prisma migrate dev` |
| 5.2 部署检查 | 确认 Vercel 构建兼容性 | `pnpm build` 通过即可 |
| 5.3 Git 维护 | `git status` → `git diff` → 确认后提交 | 用户明确要求时才提交 |
| 5.4 文档更新 | 更新 `PROGRESS.md`、`DEVELOPMENT_PLAN.md`、`CLAUDE.md` | 反映最新完成状态 |

### 子代理调度规范
- **给足上下文**：每个子代理 prompt 必须包含：任务目标、涉及文件路径、现有代码接口、设计约束
- **明确产出**：告诉子代理需要创建/修改哪些文件，遵循什么命名和代码风格
- **不重复劳动**：主代理已做的调研不让子代理重做，直接把结论传过去
- **隔离风险**：涉及 Schema 或关键配置的变更，单独派一个子代理处理

## 开发规范
- 组件使用 PascalCase，工具函数使用 camelCase
- 每个栏目一个独立的 page 目录
- API 路由统一放在 `src/app/api/` 下
- 图片统一通过 R2 存储，数据库只存 URL
- 所有内容支持关键词标签，用于相关内容索引
- 中文内容为主，部分内容需支持粤语/国语双版本
- 数据库字段使用 `@map("snake_case")` 映射，Prisma model 使用 PascalCase

## Git 维护规范

### 提交纪律
- **每完成一个独立功能/模块后必须提交**，不要积攒大量改动
- **提交前必须运行** `pnpm lint` 和 `pnpm format` 确保代码规范
- 提交信息使用中文，格式：`类型: 简短描述`
  - `feat: 新增动态列表页`
  - `fix: 修复导航栏响应式显示问题`
  - `docs: 更新开发进度记录`
  - `refactor: 重构 Media 组件`
  - `style: 调整首页布局样式`
  - `chore: 更新依赖版本`
  - `db: 新增数据库迁移 - 添加索引`

### 分支策略
- `main` 分支：稳定版本，随时可部署
- 大功能开发使用功能分支：`feat/模块名`（如 `feat/updates-page`、`feat/admin-panel`）
- 功能分支完成后合并回 `main`，删除功能分支

### 提交节奏建议
| 完成内容 | 是否提交 |
|---------|---------|
| 创建新页面/组件 | 是 |
| 完成一个 API 接口 | 是 |
| 修复一个 bug | 是 |
| 数据库 Schema 变更 + 迁移 | 是（含迁移文件） |
| 更新文档（PROGRESS.md 等） | 是，可与代码改动一起提交 |
| 还在调试中、代码不完整 | 否，等完成再提交 |

### 绝对不提交的文件
- `.env.local`（含数据库密码等敏感信息，已在 .gitignore 中）
- `node_modules/`（依赖目录，已在 .gitignore 中）
- `.next/`（构建产物，已在 .gitignore 中）

### Claude 操作 Git 的规则
- **不要自动提交**：除非用户明确要求提交代码
- **不要 force push**：任何情况下都不要使用 `git push --force`
- **不要修改已提交的历史**：不使用 `git rebase -i`、`git commit --amend`（除非用户明确要求）
- **提交前检查**：运行 `git status` 和 `git diff` 确认改动内容
- **迁移文件必须提交**：`prisma/migrations/` 目录下的文件是数据库变更记录，必须纳入版本管理

## 文档使用方式
| 文件 | 用途 | 更新时机 |
|------|------|----------|
| `CLAUDE.md` | Claude 每次对话开头读取，快速了解项目 | 技术栈/路径/配置/进度变更时 |
| `docs/DEVELOPMENT_PLAN.md` | 查看当前阶段任务和下一步计划 | 开始新阶段或计划调整时 |
| `docs/PROGRESS.md` | 记录已完成的工作和当前状态 | 每次开发完成一个模块后 |
| `docs/Database_Design_v1.md` | 数据库设计依据，Schema 的"为什么" | Schema 变更时对照检查 |
| `docs/BEGINNER_GUIDE.md` | 零基础开发者的操作指南 | 新阶段开始时更新对应章节 |
| `docs/chilam-website-design.md` | 网站业务需求和设计细节 | 需求变更或细化设计时 |
| Obsidian 规划文档 | 人工维护的概念设计 | 仅在明确要求时读取 |
