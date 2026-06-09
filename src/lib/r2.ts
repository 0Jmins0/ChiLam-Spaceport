import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`环境变量 ${key} 未配置`);
  return value;
}

function getR2Client() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${getEnv('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: getEnv('R2_ACCESS_KEY_ID'),
      secretAccessKey: getEnv('R2_SECRET_ACCESS_KEY'),
    },
  });
}

// 允许的文件类型
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac'];
const ALLOWED_FILE_TYPES = ['application/pdf'];

export const ALLOWED_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_VIDEO_TYPES,
  ...ALLOWED_AUDIO_TYPES,
  ...ALLOWED_FILE_TYPES,
];

// 文件大小限制（字节）
export const SIZE_LIMITS: Record<string, number> = {
  image: 10 * 1024 * 1024, // 10MB
  video: 100 * 1024 * 1024, // 100MB
  audio: 50 * 1024 * 1024, // 50MB
  file: 20 * 1024 * 1024, // 20MB
};

// 根据 MIME 类型判断文件夹
export function getFolderFromMimeType(mimeType: string): string {
  if (ALLOWED_IMAGE_TYPES.includes(mimeType)) return 'images';
  if (ALLOWED_VIDEO_TYPES.includes(mimeType)) return 'videos';
  if (ALLOWED_AUDIO_TYPES.includes(mimeType)) return 'audio';
  return 'files';
}

// 根据 MIME 类型获取大小限制类别
export function getSizeCategory(mimeType: string): string {
  if (ALLOWED_IMAGE_TYPES.includes(mimeType)) return 'image';
  if (ALLOWED_VIDEO_TYPES.includes(mimeType)) return 'video';
  if (ALLOWED_AUDIO_TYPES.includes(mimeType)) return 'audio';
  return 'file';
}

// 生成唯一文件名
function generateUniqueKey(folder: string, originalFilename: string): string {
  const ext = originalFilename.split('.').pop() || '';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${folder}/${timestamp}-${random}.${ext}`;
}

// 上传文件到 R2
export async function uploadFile(
  fileBuffer: Buffer,
  originalFilename: string,
  mimeType: string,
): Promise<{ key: string; url: string }> {
  const folder = getFolderFromMimeType(mimeType);
  const key = generateUniqueKey(folder, originalFilename);

  await getR2Client().send(
    new PutObjectCommand({
      Bucket: getEnv('R2_BUCKET_NAME'),
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
    }),
  );

  return {
    key,
    url: `${getEnv('R2_PUBLIC_URL')}/${key}`,
  };
}

// 删除文件
export async function deleteFile(key: string): Promise<void> {
  await getR2Client().send(
    new DeleteObjectCommand({
      Bucket: getEnv('R2_BUCKET_NAME'),
      Key: key,
    }),
  );
}

// 生成预签名上传 URL（前端直传用）
export async function getPresignedUploadUrl(
  originalFilename: string,
  mimeType: string,
): Promise<{ key: string; uploadUrl: string; publicUrl: string }> {
  const folder = getFolderFromMimeType(mimeType);
  const key = generateUniqueKey(folder, originalFilename);

  const command = new PutObjectCommand({
    Bucket: getEnv('R2_BUCKET_NAME'),
    Key: key,
    ContentType: mimeType,
  });

  const uploadUrl = await getSignedUrl(getR2Client(), command, { expiresIn: 3600 });

  return {
    key,
    uploadUrl,
    publicUrl: `${getEnv('R2_PUBLIC_URL')}/${key}`,
  };
}
