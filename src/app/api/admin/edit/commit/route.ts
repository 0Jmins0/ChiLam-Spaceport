import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth';
import {
  AdminEditCommitError,
  type AdminEditCommitPayload,
  type PendingReplacement,
  commitAdminEdit,
} from '@/lib/admin-edit-commit';

export const dynamic = 'force-dynamic';

type EditOperation = {
  type: string;
  entityType?: string;
  entityId?: string;
  field?: string;
  value?: string | number | boolean | null;
  target?: string;
  targetId?: string;
  relation?: string;
  mediaId?: string | null;
  newMediaId?: string;
  tempKey?: string;
  filename?: string;
  mimeType?: string;
  size?: number;
  alt?: string | null;
  caption?: string | null;
  mediaTag?: string | null;
  thumbnailUrl?: string | null;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
};

type OperationsPayload = {
  sessionId: string;
  operations?: EditOperation[];
};

function normalizePayload(
  body: OperationsPayload | AdminEditCommitPayload,
): AdminEditCommitPayload {
  if (!('operations' in body)) return body;

  const pendingFields: AdminEditCommitPayload['pendingFields'] = [];
  const pendingUploads: AdminEditCommitPayload['pendingUploads'] = [];
  const pendingRemovals: AdminEditCommitPayload['pendingRemovals'] = [];
  const pendingReplacements: AdminEditCommitPayload['pendingReplacements'] = [];
  const pendingEntryDeletes: AdminEditCommitPayload['pendingEntryDeletes'] = [];

  for (const operation of body.operations ?? []) {
    if (operation.type === 'field_change') {
      if (!operation.entityType || !operation.entityId || !operation.field) {
        throw new AdminEditCommitError('field_change 参数不完整');
      }

      pendingFields.push({
        entityType: operation.entityType,
        entityId: operation.entityId,
        field: operation.field,
        value: operation.value ?? null,
      });
      continue;
    }

    if (operation.type === 'temp_upload') {
      if (
        !operation.target ||
        !operation.targetId ||
        !operation.relation ||
        !operation.tempKey ||
        !operation.filename ||
        !operation.mimeType ||
        typeof operation.size !== 'number'
      ) {
        throw new AdminEditCommitError('temp_upload 参数不完整');
      }

      pendingUploads.push({
        target: operation.target,
        targetId: operation.targetId,
        relation: operation.relation,
        tempKey: operation.tempKey,
        filename: operation.filename,
        mimeType: operation.mimeType,
        size: operation.size,
        alt: operation.alt,
        caption: operation.caption,
        mediaTag: operation.mediaTag,
        thumbnailUrl: operation.thumbnailUrl,
        width: operation.width,
        height: operation.height,
        duration: operation.duration,
      });
      continue;
    }

    if (operation.type === 'media_remove') {
      if (!operation.target || !operation.targetId || !operation.relation || !operation.mediaId) {
        throw new AdminEditCommitError('media_remove 参数不完整');
      }

      pendingRemovals.push({
        target: operation.target,
        targetId: operation.targetId,
        relation: operation.relation,
        mediaId: operation.mediaId,
      });
      continue;
    }

    if (operation.type === 'media_replace') {
      if (!operation.target || !operation.targetId || !operation.relation) {
        throw new AdminEditCommitError('media_replace 参数不完整');
      }

      const replacement: PendingReplacement = {
        target: operation.target,
        targetId: operation.targetId,
        relation: operation.relation,
        mediaId: operation.newMediaId,
      };

      if (operation.tempKey) {
        replacement.tempKey = operation.tempKey;
        replacement.filename = operation.filename;
        replacement.mimeType = operation.mimeType;
        replacement.size = operation.size;
        replacement.alt = operation.alt;
        replacement.caption = operation.caption;
        replacement.mediaTag = operation.mediaTag;
        replacement.thumbnailUrl = operation.thumbnailUrl;
        replacement.width = operation.width;
        replacement.height = operation.height;
        replacement.duration = operation.duration;
      }

      pendingReplacements.push(replacement);
      continue;
    }

    if (operation.type === 'entry_delete') {
      if (!operation.entityType || !operation.entityId) {
        throw new AdminEditCommitError('entry_delete 参数不完整');
      }

      pendingEntryDeletes.push({
        entityType: operation.entityType,
        entityId: operation.entityId,
      });
      continue;
    }

    throw new AdminEditCommitError(`不支持的编辑操作: ${operation.type}`);
  }

  return {
    sessionId: body.sessionId,
    pendingFields,
    pendingUploads,
    pendingRemovals,
    pendingReplacements,
    pendingEntryDeletes,
  };
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: '未授权访问' }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: '无效的提交 payload' }, { status: 400 });
    }

    const payload = normalizePayload(body as OperationsPayload | AdminEditCommitPayload);
    const summary = await commitAdminEdit(payload as AdminEditCommitPayload, admin);

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error) {
    if (error instanceof AdminEditCommitError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('[Admin Edit Commit] Error:', error);
    return NextResponse.json({ error: '提交编辑失败，请稍后重试' }, { status: 500 });
  }
}
