/**
 * 为 R2 Bucket 配置 CORS 规则，允许浏览器直传（预签名上传）
 *
 * 用法: npx tsx scripts/setup-r2-cors.ts
 */

import { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`环境变量 ${key} 未配置`);
  return value;
}

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${getEnv('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: getEnv('R2_ACCESS_KEY_ID'),
    secretAccessKey: getEnv('R2_SECRET_ACCESS_KEY'),
  },
});

const BUCKET = getEnv('R2_BUCKET_NAME');

async function setupCors() {
  console.log(`正在为 Bucket "${BUCKET}" 配置 CORS...`);

  await client.send(
    new PutBucketCorsCommand({
      Bucket: BUCKET,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedOrigins: ['http://localhost:3000', 'https://*.vercel.app'],
            AllowedMethods: ['GET', 'PUT', 'HEAD'],
            AllowedHeaders: ['Content-Type'],
            MaxAgeSeconds: 3600,
          },
        ],
      },
    }),
  );

  console.log('CORS 配置成功！');

  // 验证
  const result = await client.send(new GetBucketCorsCommand({ Bucket: BUCKET }));
  console.log('当前 CORS 规则:', JSON.stringify(result.CORSRules, null, 2));
}

setupCors().catch((err) => {
  console.error('配置失败:', err.message);
  process.exit(1);
});
