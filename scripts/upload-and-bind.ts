/**
 * 图片上传 + Media 记录创建 + 绑定到内容
 * 将 media/images/ 下的本地图片上传到 R2，创建 Media 记录，绑定 posterId/coverId
 */

import * as fs from 'fs';
import * as path from 'path';

// 手动读 .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
for (const line of envContent.split('\n')) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)="?([^"]*)"?$/);
  if (m) process.env[m[1]] = m[2];
}

import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// ── Prisma 初始化 ──
const rawUrl = process.env.DATABASE_URL;
if (!rawUrl) throw new Error('DATABASE_URL is not set');
const connectionString = rawUrl.replace(/^["']|["']$/g, '');
console.log('Connecting to:', connectionString.replace(/\/\/.*@/, '//***@'));

const adapter = new PrismaPg({ connectionString, max: 5 });
const prisma = new PrismaClient({ adapter });

// ── R2 (S3) 初始化 ──
const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const R2_BUCKET = process.env.R2_BUCKET_NAME!;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!;

// ── 统计 ──
let uploaded = 0;
let bound = 0;
let failed = 0;
let skipped = 0;

const BASE_DIR = path.resolve(__dirname, '../media/images');

// ── Performance 文件名 → slug 映射 ──
const PERF_MAP: Record<string, string> = {
  'chilam-in-concert-2011-poster': 'alien-concert-2011',
  'crazy-hours-live-2014-poster': 'crazy-hours-hk-2014',
};

// ── R2 上传 ──
async function uploadToR2(filePath: string, key: string): Promise<string> {
  const body = fs.readFileSync(filePath);
  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: body,
      ContentType: 'image/jpeg',
    }),
  );
  return `${R2_PUBLIC_URL}/${key}`;
}

// ── 上传 + 创建 Media ──
async function uploadAndCreateMedia(filePath: string, slug: string): Promise<string> {
  const stat = fs.statSync(filePath);
  const key = `images/${slug}.jpg`;
  const url = await uploadToR2(filePath, key);

  const media = await prisma.media.create({
    data: {
      type: 'IMAGE',
      url,
      filename: `${slug}.jpg`,
      mimeType: 'image/jpeg',
      size: stat.size,
    },
  });

  uploaded++;
  return media.id;
}

// ── 处理 Production 海报（movies / tv_series / variety_shows）──
async function processProductions() {
  const dirs = ['movies', 'tv_series', 'variety_shows'];
  for (const dir of dirs) {
    const dirPath = path.join(BASE_DIR, dir);
    if (!fs.existsSync(dirPath)) {
      console.log(`⚠ 目录不存在: ${dir}`);
      continue;
    }
    const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.jpg'));
    console.log(`\n── ${dir} (${files.length} 张) ──`);

    for (const file of files) {
      const slug = file.replace('.jpg', '');
      const filePath = path.join(dirPath, file);
      try {
        const production = await prisma.production.findUnique({ where: { slug } });
        if (!production) {
          console.log(`  SKIP ${slug} — 数据库无匹配 production`);
          skipped++;
          continue;
        }
        const mediaId = await uploadAndCreateMedia(filePath, slug);
        await prisma.production.update({
          where: { slug },
          data: { posterId: mediaId },
        });
        bound++;
        console.log(`  OK ${slug}`);
      } catch (err: any) {
        console.error(`  FAIL ${slug}: ${err.message}`);
        failed++;
      }
    }
  }
}

// ── 处理 Album 封面 ──
async function processAlbums() {
  const dirPath = path.join(BASE_DIR, 'albums');
  if (!fs.existsSync(dirPath)) {
    console.log('\n⚠ albums 目录不存在');
    return;
  }
  const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.jpg'));
  console.log(`\n── albums (${files.length} 张) ──`);

  for (const file of files) {
    const slug = file.replace('.jpg', '');
    const filePath = path.join(dirPath, file);
    try {
      const album = await prisma.album.findUnique({ where: { slug } });
      if (!album) {
        console.log(`  SKIP ${slug} — 数据库无匹配 album`);
        skipped++;
        continue;
      }
      const mediaId = await uploadAndCreateMedia(filePath, slug);
      await prisma.album.update({
        where: { slug },
        data: { coverId: mediaId },
      });
      bound++;
      console.log(`  OK ${slug}`);
    } catch (err: any) {
      console.error(`  FAIL ${slug}: ${err.message}`);
      failed++;
    }
  }
}

// ── 处理 Performance 海报 ──
async function processPerformances() {
  const dirPath = path.join(BASE_DIR, 'performances');
  if (!fs.existsSync(dirPath)) {
    console.log('\n⚠ performances 目录不存在');
    return;
  }
  const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.jpg'));
  console.log(`\n── performances (${files.length} 张) ──`);

  for (const file of files) {
    const fileBase = file.replace('.jpg', '');
    const slug = PERF_MAP[fileBase];
    if (!slug) {
      console.log(`  SKIP ${fileBase} — 无映射`);
      skipped++;
      continue;
    }
    const filePath = path.join(dirPath, file);
    try {
      const performance = await prisma.performance.findUnique({ where: { slug } });
      if (!performance) {
        console.log(`  SKIP ${slug} — 数据库无匹配 performance`);
        skipped++;
        continue;
      }
      const mediaId = await uploadAndCreateMedia(filePath, slug);
      await prisma.performance.update({
        where: { slug },
        data: { posterId: mediaId },
      });
      bound++;
      console.log(`  OK ${slug} (from ${fileBase})`);
    } catch (err: any) {
      console.error(`  FAIL ${slug}: ${err.message}`);
      failed++;
    }
  }
}

// ── Main ──
async function main() {
  console.log('=== 图片上传 + Media 绑定 ===');
  console.log(`R2 Bucket: ${R2_BUCKET}`);
  console.log(`R2 Public URL: ${R2_PUBLIC_URL}`);
  console.log(`本地目录: ${BASE_DIR}\n`);

  await processProductions();
  await processAlbums();
  await processPerformances();

  console.log('\n=== 完成 ===');
  console.log(`上传成功: ${uploaded}`);
  console.log(`绑定成功: ${bound}`);
  console.log(`跳过: ${skipped}`);
  console.log(`失败: ${failed}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
