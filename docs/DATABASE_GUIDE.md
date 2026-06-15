# 数据库使用指南

本文档覆盖项目用到的两个存储服务：**Supabase (PostgreSQL)** 和 **Cloudflare R2**。适合零基础开发者/维护者阅读，重点是"怎么操作"。

# 维护
1. 把用户添加为管理员 
```
UPDATE users SET role = 'ADMIN' WHERE
  username = 'HiHi';
```

2. 本地启动
```
pnpm dev --hostname 0.0.0.0 --port 3001


ipconfig getifaddr en0

# 网址：http://10.135.216.53:3001
```

3. 数据库更新
```
unset http_proxy https_proxy HTTP_PROXY HTTPS_PROXY ALL_PROXY && npx prisma db push
```


4. 手动部署

```bash
vercel              # 部署到预览环境（生成临时链接，可先检查效果）
vercel --prod       # 部署到生产环境
```

---

## 一、Supabase (PostgreSQL 数据库)

### 1.1 连接信息

所有数据库连接信息存放在项目根目录的 `.env.local` 文件中（不提交到 Git），包含两个关键变量：

| 变量 | 用途 | 端口 | 说明 |
|------|------|------|------|
| `DATABASE_URL` | 应用运行时查询 | 6543 | 通过 pgbouncer 连接池转发，性能好，但不支持 DDL 操作 |
| `DIRECT_URL` | Prisma migrate 迁移 | 5432 | 直连数据库，用于创建表、改字段等 Schema 变更 |

格式示例（不要直接复制，用自己的凭证）：

```
DATABASE_URL="postgresql://postgres.xxxxx:密码@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.xxxxx:密码@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres"
```

**Supabase 项目区域**：`ap-northeast-2`（首尔）

> 为什么有两个 URL？Prisma 在运行 `migrate` 时需要直连（创建表、加索引等 DDL 操作），但应用运行时用连接池更高效。`prisma.config.ts` 已配置好两者的映射。

### 1.2 Prisma 使用

#### 文件位置

| 文件 | 作用 |
|------|------|
| `prisma/schema.prisma` | 数据库 Schema 定义（所有表、字段、关联） |
| `prisma.config.ts` | Prisma 配置（数据源 URL、迁移路径、种子脚本） |
| `prisma/seed.ts` | 种子数据脚本（初始化测试数据） |
| `prisma/migrations/` | 迁移记录目录（每次 Schema 变更生成一个迁移文件） |
| `src/generated/prisma/` | Prisma 自动生成的客户端代码（不要手动编辑） |
| `src/lib/db.ts` | 封装的 Prisma 客户端实例，全项目统一使用 |

#### 常用命令

```bash
# 创建新迁移（修改 schema.prisma 后运行）
pnpm prisma migrate dev --name 迁移名称

# 部署迁移到生产环境
pnpm prisma migrate deploy

# 重新生成 Prisma 客户端（schema 变更后需要运行）
pnpm prisma generate

# 运行种子数据（初始化测试数据）
pnpm prisma db seed

# 打开可视化数据库管理界面（浏览器中操作数据）
pnpm prisma studio

# 查看迁移状态
pnpm prisma migrate status

# 重置数据库（危险！会清空所有数据）
pnpm prisma migrate reset
```

#### 日常开发流程

1. 修改 `prisma/schema.prisma`（加字段、加表等）
2. 运行 `pnpm prisma migrate dev --name 描述`（自动生成迁移 SQL + 重新生成客户端）
3. 如果只改了查询逻辑没改 schema，只需 `pnpm prisma generate`

#### 在代码中使用 Prisma 客户端

```typescript
// 从统一入口导入
import { prisma } from '@/lib/db';

// 然后就能用 prisma.xxx 做查询了
const productions = await prisma.production.findMany();
```

### 1.3 数据库表概览

项目共 20 张表 + 10 个枚举，按功能分组如下：

#### 基础设施表（4 张）

| 表名 | Model | 说明 |
|------|-------|------|
| `categories` | Category | 栏目树，支持多级分类 |
| `tags` | Tag | 全站标签，与 10 张内容表多对多关联 |
| `media` | Media | 统一媒体资源（图片/视频/音频/文件），存储 R2 的 URL |
| `content_relations` | ContentRelation | 跨内容关联（多态引用，比如"某影视作品相关的新闻"） |

#### 影视演出表（4 张）

| 表名 | Model | 说明 |
|------|-------|------|
| `productions` | Production | 影视综作品（电影/电视剧/综艺） |
| `performances` | Performance | 演出（演唱会/舞台/音乐剧） |
| `performance_media` | PerformanceMedia | 演出官摄素材 |
| `fan_shots` | FanShot | 演出饭拍投稿 |

#### 活动表（3 张）

| 表名 | Model | 说明 |
|------|-------|------|
| `endorsements` | Endorsement | 广告代言 |
| `interviews` | Interview | 访谈（支持粤语/国语双版本文字稿） |
| `livestreams` | Livestream | 直播 |

#### 资料库表（2 张）

| 表名 | Model | 说明 |
|------|-------|------|
| `albums` | Album | 专辑 |
| `magazines` | Magazine | 杂志（含扫描件多对多） |

#### 动态表（3 张）

| 表名 | Model | 说明 |
|------|-------|------|
| `social_posts` | SocialPost | 社交媒体动态（微博/IG 等） |
| `news_articles` | NewsArticle | 新闻报道 |
| `sightings` | Sighting | 路透/踪迹 |

#### 互动与管理表（4 张）

| 表名 | Model | 说明 |
|------|-------|------|
| `timeline_events` | TimelineEvent | 首页时间线事件 |
| `guestbook` | Guestbook | 留言板（我想对你说/故事分享/建议反馈） |
| `comments` | Comment | 评论（多态，可关联到任何内容） |
| `announcements` | Announcement | 公告（网站公告/规则/更新通知） |
| `admins` | Admin | 管理员账号 |

#### 枚举类型（10 个）

| 枚举 | 值 | 用于 |
|------|------|------|
| ProductionType | MOVIE, TV_SERIES, VARIETY_SHOW | 影视分类 |
| PerformanceType | CONCERT, STAGE, MUSICAL | 演出分类 |
| MediaType | IMAGE, VIDEO, AUDIO, FILE | 媒体文件类型 |
| InterviewMediaType | VIDEO, AUDIO, TEXT | 访谈原始媒体类型 |
| ImportMethod | LINK_PARSE, CRAWLER, MANUAL | 社交动态导入方式 |
| SubmitType | LINK, UPLOAD, MIXED | 用户投稿方式 |
| ModerationStatus | PENDING, APPROVED, REJECTED | 审核状态 |
| ProofreadStatus | PENDING, PROOFREAD | 文字稿校对状态 |
| AnnouncementType | NOTICE, RULE, UPDATE | 公告类型 |
| GuestbookTab | MESSAGE, STORY, FEEDBACK | 留言板分区 |

### 1.4 常用查询示例

以下用 Prisma 客户端演示增删改查操作。

#### 查询列表（含关联数据 + 分页）

```typescript
import { prisma } from '@/lib/db';

// 查询影视列表，包含海报和标签，分页
const page = 1;
const pageSize = 20;

const [items, total] = await Promise.all([
  prisma.production.findMany({
    where: { isVisible: true, type: 'MOVIE' },
    orderBy: [{ year: 'desc' }, { sortOrder: 'asc' }],
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      poster: { select: { url: true, alt: true } },  // 直接 FK 关联
      tags: { select: { name: true, slug: true } },   // 多对多关联
    },
  }),
  prisma.production.count({ where: { isVisible: true, type: 'MOVIE' } }),
]);

console.log(`共 ${total} 部电影，当前第 ${page} 页`);
```

#### 查询单条详情

```typescript
// 通过 slug 查影视详情，包含海报 + 图册 + 标签
const production = await prisma.production.findUnique({
  where: { slug: 'some-movie-slug' },
  include: {
    poster: { select: { url: true, alt: true } },
    gallery: { select: { url: true, alt: true } },  // 多对多图册
    tags: { select: { name: true, slug: true } },
  },
});
```

#### 创建新内容

```typescript
// 创建一部新电影
const newProduction = await prisma.production.create({
  data: {
    type: 'MOVIE',
    slug: 'new-movie-2024',
    title: '新电影名称',
    year: 2024,
    role: '主演',
    synopsis: '剧情简介...',
    // 关联已有的 Media 作为海报（直接 FK）
    poster: { connect: { id: 'media-id-xxx' } },
    // 关联已有的 Tag（多对多）
    tags: {
      connect: [
        { slug: 'action' },
        { slug: 'thriller' },
      ],
    },
  },
});
```

#### 更新内容

```typescript
// 更新影视信息
await prisma.production.update({
  where: { slug: 'some-movie-slug' },
  data: {
    synopsis: '更新后的简介',
    // 替换海报
    poster: { connect: { id: 'new-media-id' } },
    // 添加新标签（不会移除已有的）
    tags: { connect: { slug: 'new-tag' } },
  },
});
```

#### 关联 Media —— 两种方式

```typescript
// 方式一：直接 FK（一对一/多对一，设置封面/海报）
await prisma.production.update({
  where: { id: 'prod-id' },
  data: { poster: { connect: { id: 'media-id' } } },
});

// 方式二：多对多（添加到集合，如图册）
await prisma.production.update({
  where: { id: 'prod-id' },
  data: {
    gallery: {
      connect: [{ id: 'media-1' }, { id: 'media-2' }],
    },
  },
});

// 从多对多集合中移除
await prisma.production.update({
  where: { id: 'prod-id' },
  data: {
    gallery: { disconnect: [{ id: 'media-1' }] },
  },
});
```

#### 删除内容

```typescript
// 删除单条记录
await prisma.production.delete({
  where: { slug: 'some-movie-slug' },
});

// 批量删除
await prisma.production.deleteMany({
  where: { isVisible: false },
});
```

#### 创建 Media 记录

```typescript
// 先上传文件到 R2 得到 URL，再创建 Media 记录
const media = await prisma.media.create({
  data: {
    type: 'IMAGE',
    url: 'https://pub-xxx.r2.dev/images/1234567890-abc123.jpg',
    filename: 'poster.jpg',
    mimeType: 'image/jpeg',
    size: 204800,
    width: 1920,
    height: 1080,
    alt: '电影海报',
  },
});
```

---

## 二、Cloudflare R2 (文件存储)

### 2.1 连接信息

`.env.local` 中的 R2 相关变量：

| 变量 | 说明 |
|------|------|
| `R2_ACCOUNT_ID` | Cloudflare 账号 ID |
| `R2_ACCESS_KEY_ID` | R2 API Token 的 Access Key |
| `R2_SECRET_ACCESS_KEY` | R2 API Token 的 Secret Key |
| `R2_BUCKET_NAME` | 桶名称，固定为 `chilam-media` |
| `R2_PUBLIC_URL` | 公开访问的 URL（r2.dev 域名） |

格式示例：

```
R2_ACCOUNT_ID="你的AccountID"
R2_ACCESS_KEY_ID="你的AccessKeyID"
R2_SECRET_ACCESS_KEY="你的SecretAccessKey"
R2_BUCKET_NAME="chilam-media"
R2_PUBLIC_URL="https://pub-xxxxxxxx.r2.dev"
```

**公开访问**：已启用 r2.dev 公开访问域名。上传到桶里的文件可以通过 `R2_PUBLIC_URL/文件路径` 直接访问。

### 2.2 文件组织结构

```
chilam-media/
├── images/    ← jpg, png, webp, gif, avif（单文件 ≤ 10MB）
├── videos/    ← mp4, webm, mov（单文件 ≤ 100MB）
├── audio/     ← mp3, wav, ogg, aac（单文件 ≤ 50MB）
└── files/     ← pdf（单文件 ≤ 20MB）
```

**文件名格式**：`{类型文件夹}/{13位时间戳}-{6位随机字符}.{扩展名}`

例如：`images/1719388800000-a3b2c1.jpg`

文件夹和大小限制由上传时的 MIME 类型自动判定，不需要手动指定。

### 2.3 上传方式

#### 方式一：API 上传（服务器中转）

适合小文件（< 10MB 的图片等），文件经过 Next.js 服务器转发到 R2。

**纯上传（不绑定）**：只传 `file`，返回 URL，不创建 Media 记录。

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@photo.jpg"
```

返回示例：

```json
{
  "success": true,
  "key": "images/1719388800000-a3b2c1.jpg",
  "url": "https://pub-xxxxxxxx.r2.dev/images/1719388800000-a3b2c1.jpg"
}
```

**上传并绑定到内容**：额外传 `target`、`targetId`、`relation`，API 会自动完成三步——上传到 R2 + 创建 Media 记录 + 关联到指定内容。

```bash
# 给某部影视设置封面海报
curl -X POST http://localhost:3000/api/upload \
  -F "file=@poster.jpg" \
  -F "target=production" \
  -F "targetId=影视记录的ID" \
  -F "relation=poster"

# 给某本杂志添加扫描页（可以多次调用添加多张）
curl -X POST http://localhost:3000/api/upload \
  -F "file=@scan-01.jpg" \
  -F "target=magazine" \
  -F "targetId=杂志记录的ID" \
  -F "relation=scans"
```

可选参数：`alt`（图片替代文字）、`caption`（图片说明）。

返回示例：

```json
{
  "success": true,
  "key": "images/1719388800000-a3b2c1.jpg",
  "url": "https://pub-xxxxxxxx.r2.dev/images/1719388800000-a3b2c1.jpg",
  "media": {
    "id": "clxxx...",
    "type": "IMAGE",
    "url": "https://pub-xxxxxxxx.r2.dev/images/1719388800000-a3b2c1.jpg",
    "filename": "poster.jpg",
    "mimeType": "image/jpeg",
    "size": 204800
  }
}
```

> 支持的 target + relation 组合见下方 2.4 节的完整表格。

#### 方式二：预签名直传（大文件/批量推荐）

适合大文件（视频等），文件从客户端直接上传到 R2，不经过服务器。

**第一步：获取预签名 URL**

```bash
curl -X POST http://localhost:3000/api/upload/presign \
  -H "Content-Type: application/json" \
  -d '{"filename":"concert.mp4","mimeType":"video/mp4","fileSize":52428800}'
```

返回示例：

```json
{
  "success": true,
  "key": "videos/1719388800000-x7y8z9.mp4",
  "uploadUrl": "https://xxx.r2.cloudflarestorage.com/chilam-media/videos/...?X-Amz-Signature=...",
  "publicUrl": "https://pub-xxxxxxxx.r2.dev/videos/1719388800000-x7y8z9.mp4"
}
```

**第二步：用返回的 uploadUrl 直传文件到 R2**

```bash
curl -X PUT "上一步返回的uploadUrl" \
  -H "Content-Type: video/mp4" \
  --data-binary @concert.mp4
```

> 预签名 URL 有效期为 1 小时（3600 秒），过期需要重新获取。

#### 方式三：AWS CLI 直传（批量导入推荐）

适合一次性导入大量文件。先安装并配置 AWS CLI：

```bash
# 安装 AWS CLI（macOS）
brew install awscli

# 配置 R2 专用 profile
aws configure --profile r2
# Access Key ID: 你的 R2_ACCESS_KEY_ID
# Secret Access Key: 你的 R2_SECRET_ACCESS_KEY
# Default region: auto
# Default output format: json
```

常用命令：

```bash
# 查看桶内文件
aws s3 ls s3://chilam-media/ \
  --endpoint-url https://<ACCOUNT_ID>.r2.cloudflarestorage.com \
  --profile r2

# 查看某个目录
aws s3 ls s3://chilam-media/images/ \
  --endpoint-url https://<ACCOUNT_ID>.r2.cloudflarestorage.com \
  --profile r2

# 上传单个文件
aws s3 cp ./poster.jpg s3://chilam-media/images/poster.jpg \
  --endpoint-url https://<ACCOUNT_ID>.r2.cloudflarestorage.com \
  --profile r2

# 批量同步整个目录
aws s3 sync ./photos/ s3://chilam-media/images/ \
  --endpoint-url https://<ACCOUNT_ID>.r2.cloudflarestorage.com \
  --profile r2

# 删除文件
aws s3 rm s3://chilam-media/images/old-photo.jpg \
  --endpoint-url https://<ACCOUNT_ID>.r2.cloudflarestorage.com \
  --profile r2
```

> 通过 AWS CLI 上传的文件不会自动创建 Media 记录，需要手动到数据库中创建（见 2.5 批量操作示例）。

### 2.4 支持的绑定关系

上传文件到 R2 后，需要在数据库中创建 `Media` 记录，然后关联到对应的内容表。关联方式分两种：

- **FK（直接外键）**：一对一关系，设置封面/海报，新设置会替换旧的
- **多对多**：集合关系，添加到图册/素材集，可以添加多个

| target (内容表) | relation (关系) | 类型 | 效果 |
|-----------------|-----------------|------|------|
| production | poster | FK | 设为影视封面海报 |
| production | gallery | 多对多 | 添加到影视图册 |
| performance | poster | FK | 设为演出封面海报 |
| album | cover | FK | 设为专辑封面 |
| magazine | cover | FK | 设为杂志封面 |
| magazine | scans | 多对多 | 添加到杂志扫描件 |
| interview | media | FK | 设为访谈原始媒体 |
| livestream | cover | FK | 设为直播封面 |
| livestream | media | 多对多 | 添加到直播媒体集 |
| socialPost | media | 多对多 | 添加到社交动态媒体 |
| endorsement | media | 多对多 | 添加到代言素材集 |
| sighting | media | 多对多 | 添加到路透媒体集 |
| guestbook | images | 多对多 | 添加到留言图片集 |
| newsArticle | media | 多对多 | 添加到新闻媒体集 |

### 2.5 批量操作示例

#### Shell 循环上传并绑定到内容

适合有一批图片需要上传并绑定到某个影视作品图册的场景：

```bash
#!/bin/bash
# 批量上传图片到影视作品图册（一步完成：上传 + 创建 Media + 关联）

TARGET_ID="影视记录的ID"  # 替换为实际 ID

for file in ./gallery/*.jpg; do
  echo "上传 $file ..."
  RESULT=$(curl -s -X POST http://localhost:3000/api/upload \
    -F "file=@$file" \
    -F "target=production" \
    -F "targetId=$TARGET_ID" \
    -F "relation=gallery")
  URL=$(echo $RESULT | jq -r '.url')
  echo "  → $URL"
done

echo "全部上传完成并已关联到影视图册"
```

#### AWS CLI sync 后手动创建 Media 记录

当你用 `aws s3 sync` 批量上传了文件，还需要在数据库中创建对应的 Media 记录：

```bash
# 第一步：批量上传
aws s3 sync ./magazine-scans/ s3://chilam-media/images/ \
  --endpoint-url https://<ACCOUNT_ID>.r2.cloudflarestorage.com \
  --profile r2
```

```typescript
// 第二步：在代码或脚本中批量创建 Media 记录
import { prisma } from '@/lib/db';

const files = [
  { name: 'scan-001.jpg', size: 1024000 },
  { name: 'scan-002.jpg', size: 980000 },
  // ...更多文件
];

const PUBLIC_URL = 'https://pub-xxxxxxxx.r2.dev';

for (const file of files) {
  const media = await prisma.media.create({
    data: {
      type: 'IMAGE',
      url: `${PUBLIC_URL}/images/${file.name}`,
      filename: file.name,
      mimeType: 'image/jpeg',
      size: file.size,
    },
  });

  // 关联到杂志的扫描件（多对多）
  await prisma.magazine.update({
    where: { slug: 'magazine-slug' },
    data: {
      scans: { connect: { id: media.id } },
    },
  });

  console.log(`已创建并关联: ${file.name}`);
}
```

也可以打开 `pnpm prisma studio`，在浏览器中手动创建 Media 记录和关联。

---

## 三、数据流向图

```
用户/脚本
    │
    ├─── 上传文件 ──→  Cloudflare R2 桶 (chilam-media)
    │                        │
    │                   文件存储在 images/ videos/ audio/ files/
    │                        │
    │                   得到公开访问 URL
    │                   (https://pub-xxx.r2.dev/images/xxx.jpg)
    │                        │
    │                        ▼
    ├─── 创建记录 ──→  Media 表
    │                   ┌──────────────────────────┐
    │                   │ id: cuid                  │
    │                   │ type: IMAGE               │
    │                   │ url: R2 公开 URL           │
    │                   │ filename, mimeType, size  │
    │                   └──────────┬───────────────┘
    │                              │
    │                              ▼
    └─── 关联内容 ──→  内容表（Production / Album / Magazine / ...）
                        通过 FK（封面/海报）或多对多（图册/素材集）
                        引用 Media 记录
```

简单来说：**文件存 R2，URL 存 Media 表，内容表引用 Media 表**。

---

## 四、常见问题 FAQ

### Q: 数据库连不上怎么办？

**检查清单**：

1. 确认 `.env.local` 文件存在且包含 `DATABASE_URL` 和 `DIRECT_URL`
2. 检查 URL 中的密码是否正确（注意特殊字符需要 URL 编码）
3. 确认 Supabase 项目没有被暂停（免费计划 7 天不活跃会暂停，去 Dashboard 点恢复）
4. 确认网络能访问 `aws-0-ap-northeast-2.pooler.supabase.com`
5. 如果是 `prisma migrate` 失败，确认 `DIRECT_URL` 用的是 5432 端口

```bash
# 测试数据库连接
pnpm prisma db pull
# 如果能成功拉取 schema，说明连接正常
```

### Q: 上传失败常见原因？

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| `不支持的文件类型` | MIME 类型不在允许列表中 | 只支持 jpg/png/webp/gif/avif/mp4/webm/mov/mp3/wav/ogg/aac/pdf |
| `文件大小超出限制` | 超过对应类型的大小上限 | 图片 ≤10MB，视频 ≤100MB，音频 ≤50MB，PDF ≤20MB |
| `上传失败` (500) | R2 连接问题 | 检查 `.env.local` 中 R2 相关变量是否正确 |
| `生成上传链接失败` | 预签名接口出错 | 检查 R2_ACCOUNT_ID 和 API Token 是否有效 |

### Q: 如何删除已上传的文件？

**方法一：AWS CLI**

```bash
aws s3 rm s3://chilam-media/images/要删除的文件名.jpg \
  --endpoint-url https://<ACCOUNT_ID>.r2.cloudflarestorage.com \
  --profile r2
```

**方法二：Cloudflare Dashboard**

登录 Cloudflare Dashboard → R2 → chilam-media → 找到文件 → 删除

**方法三：代码调用**

```typescript
import { deleteFile } from '@/lib/r2';

// key 是文件在桶里的路径（不含域名）
await deleteFile('images/1719388800000-a3b2c1.jpg');
```

> 删除 R2 文件后，记得也删除数据库中对应的 Media 记录，否则内容页会显示失效的图片链接。

### Q: 如何查看 R2 桶里的文件？

**方法一：AWS CLI**

```bash
# 列出所有文件
aws s3 ls s3://chilam-media/ --recursive \
  --endpoint-url https://<ACCOUNT_ID>.r2.cloudflarestorage.com \
  --profile r2

# 列出 images 目录
aws s3 ls s3://chilam-media/images/ \
  --endpoint-url https://<ACCOUNT_ID>.r2.cloudflarestorage.com \
  --profile r2
```

**方法二：Cloudflare Dashboard**

登录 Cloudflare Dashboard → R2 → 点击 `chilam-media` 桶 → 可视化浏览文件

**方法三：直接访问公开 URL**

如果你知道文件路径，直接在浏览器打开：

```
https://pub-xxxxxxxx.r2.dev/images/文件名.jpg
```

### Q: Prisma Studio 怎么用？

```bash
# 启动 Prisma Studio（会自动打开浏览器）
pnpm prisma studio
```

Prisma Studio 是一个可视化数据库管理界面，运行后会在浏览器中打开 `http://localhost:5555`。你可以：

- **浏览数据**：左侧选择表名，右侧显示所有记录
- **新增记录**：点击 "Add record" 按钮
- **编辑记录**：直接点击字段值进行修改
- **删除记录**：选中记录后点击删除
- **筛选数据**：使用顶部的 Filter 功能
- **查看关联**：点击关联字段可以跳转到关联的记录

这是最简单的数据库操作方式，不需要写任何代码。

### Q: 如何手动操作数据库（SQL）？

如果需要执行原始 SQL，可以通过 Supabase Dashboard：

1. 登录 [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. 选择项目
3. 左侧菜单点击 "SQL Editor"
4. 写 SQL 并执行

```sql
-- 查看所有表
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- 查看影视作品数量
SELECT type, COUNT(*) FROM productions GROUP BY type;

-- 查看最近的留言
SELECT * FROM guestbook ORDER BY created_at DESC LIMIT 10;
```

### Q: 迁移冲突怎么办？

如果 `prisma migrate dev` 报错说迁移历史不一致：

```bash
# 查看迁移状态
pnpm prisma migrate status

# 如果是开发环境，可以重置（会清空数据！）
pnpm prisma migrate reset

# 重置后重新运行种子数据
pnpm prisma db seed
```

> 生产环境绝对不要用 `migrate reset`，应该手动修复迁移文件或联系项目管理者。
