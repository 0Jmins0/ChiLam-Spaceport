# AGENTS.md

本文件是 Codex 的项目级说明，由 `CLAUDE.md` 迁移而来。除非用户明确要求，否则不要删除或修改原 `CLAUDE.md`。

## 默认语言

- 与用户沟通、阶段计划、执行总结、代码审查意见、文档更新说明，默认使用中文。
- 代码、命令、路径、配置键、论文标题、模型名、数据集名保持原文。
- 只有在用户明确要求英文，或需要保留上游英文接口/论文表述时，才使用英文。

## 项目概述

Chilam Is Here 是一个中文粉丝资讯网站，用于聚合张智霖相关的动态、影视、演出、活动、访谈、相册、资料库、留言、公告和搜索内容。

当前阶段：
- P6 用户反馈迭代进行中。
- 详细进度见 `docs/PROGRESS.md`。
- 开发计划见 `docs/DEVELOPMENT_PLAN.md`。

## 技术栈

- 前端：Next.js 16 App Router、TypeScript、Tailwind CSS。
- 后端：Next.js API Routes。
- 数据库：Supabase PostgreSQL，通过 Prisma 访问。
- 存储：Cloudflare R2，通过 `@aws-sdk/client-s3` 访问。
- 包管理：`pnpm`。
- 代码质量：ESLint 和 Prettier。

## 仓库结构

- `src/app/`：App Router 页面和 API 路由。
- `src/components/`：通用组件和业务组件。
- `src/config/`：站点和导航配置。
- `src/lib/`：数据库、认证、R2、类型、校验、查询工具。
- `prisma/schema.prisma`：数据库 schema。
- `prisma/seed.ts`：仅作初始化参考，不要对已有数据环境执行。
- `docs/Database_Design_v1.md`：schema 设计依据。
- `docs/PROGRESS.md`：当前进度记录。
- `docs/DEVELOPMENT_PLAN.md`：阶段开发计划。
- `docs/BEGINNER_GUIDE.md`：零基础操作说明。
- `docs/chilam-website-design.md`：业务和交互需求。

Obsidian 规划文件只有在用户明确要求时才读取。

## 数据库安全红线

绝对不要运行：

```bash
prisma db seed
```

不要运行任何会调用 `deleteMany`、truncate 表、清空表或破坏已有生产数据的脚本。数据库中已有大量手动录入的数据、媒体链接和关联关系。

安全做法：
- 样本数据使用定向 `create` 或 `upsert`。
- Schema 变更使用保留数据的 `prisma db push` 或 migration。
- 批量更新必须写独立脚本，且只允许 create、update、upsert。

把 `prisma/seed.ts` 当参考材料，不当作已有环境的执行流程。

## 常用命令

安装依赖：

```bash
pnpm install
```

启动开发服务：

```bash
pnpm dev
```

运行检查：

```bash
pnpm lint
pnpm format
pnpm build
```

涉及数据库/schema 时，先检查现有 Prisma 配置，再决定命令。不要对生产类数据做破坏性操作。

## 开发规范

- 组件使用 PascalCase。
- 工具函数使用 camelCase。
- 每个主要栏目使用独立 App Router page 目录。
- API 路由放在 `src/app/api/`。
- 媒体文件存 R2，数据库只保存 URL 和元数据。
- 中文内容为主，部分内容可能需要粤语和国语版本。
- 数据库字段按需要使用 Prisma `@map("snake_case")`；Prisma model 使用 PascalCase。
- 依赖实时数据库状态的列表页保持动态渲染。

## 主要路由

- `/`：首页时间线。
- `/updates`：社交媒体、新闻、路透。
- `/screens`：电影、电视剧、综艺。
- `/performances`：演唱会、舞台、音乐剧。
- `/activities`：代言和直播。
- `/archives`：杂志和专辑。
- `/gallery`：图片、视频、音频、合集。
- `/interviews`：访谈内容。
- `/messages`：留言板。
- `/announcements`：站点公告。
- `/search`：全站搜索。
- `/profile`：用户主页和设置。

## 工作流程

改代码前：
1. 阅读相关文档和现有实现。
2. 判断是否影响数据库和存储。
3. 确认是否涉及 schema、认证、上传或用户生成数据。

改代码后：
1. 先运行最小必要检查。
2. 可行时运行 `pnpm lint` 和 `pnpm build`。
3. 只有当任务改变项目状态或计划时，才更新 `docs/PROGRESS.md` 或 `docs/DEVELOPMENT_PLAN.md`。

除非用户明确要求，否则不要提交。任何提交前先运行 `git status` 并检查 diff。不要 force push，不要重写历史。

## 不提交的文件

- `.env.local`
- `node_modules/`
- `.next/`
- 本地构建产物、日志、生成缓存

