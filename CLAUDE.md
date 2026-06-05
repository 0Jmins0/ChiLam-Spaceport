# Chilam Is Here - 张智霖全面资讯网站

## 项目概述
一个集合张智霖各平台、各阶段、各渠道资讯的综合性粉丝网站。

## 当前进度
- **阶段**: P0 - 项目初始化（进行中）
- **已完成**: P0.1 技术环境搭建、P0.2 数据库 Schema 设计（20 张表 + 10 个枚举）
- **下一步**: P0.3 Supabase 配置 + 数据库迁移 → P0.4 项目骨架搭建
- **详细进度**: 查看 `/docs/PROGRESS.md`

## 技术栈
- **前端**: Next.js 16.2.6 (App Router) + TypeScript 5.9 + Tailwind CSS 4.3
- **后端**: Next.js API Routes + Prisma 7.8
- **数据库**: PostgreSQL (Supabase - 待配置)
- **存储**: Cloudflare R2 (图片/视频/文件 - 待配置)
- **部署**: Vercel (前端) + Supabase (数据库) - 待配置
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
│   ├── components/                                  # React 组件（待创建）
│   ├── lib/                                         # 工具函数、数据库客户端（待创建）
│   └── types/                                       # TypeScript 类型定义（待创建）
├── prisma/
│   └── schema.prisma                                # 数据库 Schema（已完成，20 张表）
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
- **表数量**: 20 张表 + 10 个枚举
- **核心设计**:
  - `Media` 统一媒体资源表：单引用用直接 FK，集合引用用 Prisma 隐式多对多
  - `Tag` 全站标签：与 9 张内容表多对多关联
  - `ContentRelation` 跨内容关联：多态引用（sourceType/Id → targetType/Id）
  - 渐进增强模式：链接优先 → 回填完整内容（social_posts / news_articles / sightings）

## 服务器与数据库 (待配置)
- **域名**: 待定
- **Supabase 项目**: 待创建
- **Cloudflare R2**: 待创建
- **Vercel 项目**: 待创建

## 栏目结构
| 栏目 | 路由 | 子分类 |
|------|------|--------|
| 首页 | `/` | 时间线、大图、一句话 |
| 动态 | `/updates` | 社交媒体、新闻报道、路透 |
| 影视 | `/screens` | 电影、电视剧、综艺 |
| 演出 | `/performances` | 演唱会、舞台、音乐剧 |
| 活动 | `/activities` | 广告代言、访谈 |
| 资料库 | `/archives` | 杂志、专辑 |
| 留言 | `/messages` | 我想对你说、故事分享、冷知识、建议反馈 |
| 公告 | `/announcements` | 网站公告、规则、更新通知 |

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
