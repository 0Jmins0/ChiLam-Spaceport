export type EditSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export type EditUploadStatus = 'idle' | 'uploading' | 'uploaded' | 'error';

interface EditOperationBase {
  id: string;
  createdAt: string;
}

export interface EditFieldChangeOperation extends EditOperationBase {
  type: 'field_change';
  entityType: string;
  entityId: string;
  field: string;
  value: unknown;
}

export interface EditTempUploadOperation extends EditOperationBase {
  type: 'temp_upload';
  tempUploadId?: string;
  target: string;
  targetId: string;
  relation: string;
  tempKey: string;
  tempUrl?: string;
  filename: string;
  mimeType: string;
  size: number;
  thumbnailTempKey?: string | null;
  thumbnailTempUrl?: string | null;
  thumbnailMimeType?: string | null;
  thumbnailFilename?: string | null;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
  alt?: string | null;
  caption?: string | null;
  mediaTag?: string | null;
}

export interface EditMediaRemoveOperation extends EditOperationBase {
  type: 'media_remove';
  target: string;
  targetId: string;
  relation: string;
  mediaId: string;
}

export interface EditMediaReplaceOperation extends EditOperationBase {
  type: 'media_replace';
  target: string;
  targetId: string;
  relation: string;
  oldMediaId?: string | null;
  newMediaId?: string;
  tempUploadId?: string;
  tempKey?: string;
  tempUrl?: string;
  filename?: string;
  mimeType?: string;
  size?: number;
  thumbnailTempKey?: string | null;
  thumbnailTempUrl?: string | null;
  thumbnailMimeType?: string | null;
  thumbnailFilename?: string | null;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
  alt?: string | null;
  caption?: string | null;
  mediaTag?: string | null;
}

export interface EditEntryDeleteOperation extends EditOperationBase {
  type: 'entry_delete';
  entityType: string;
  entityId: string;
}

export type EditPendingOperation =
  | EditFieldChangeOperation
  | EditTempUploadOperation
  | EditMediaRemoveOperation
  | EditMediaReplaceOperation
  | EditEntryDeleteOperation;

export type RegisterFieldChangeInput = Omit<EditFieldChangeOperation, 'id' | 'createdAt' | 'type'>;

export type RegisterTempUploadInput = Omit<EditTempUploadOperation, 'id' | 'createdAt' | 'type'> & {
  uploadStatus?: EditUploadStatus;
};

export type RegisterMediaRemoveInput = Omit<EditMediaRemoveOperation, 'id' | 'createdAt' | 'type'>;

export type RegisterMediaReplaceInput = Omit<
  EditMediaReplaceOperation,
  'id' | 'createdAt' | 'type'
>;

export type RegisterEntryDeleteInput = Omit<EditEntryDeleteOperation, 'id' | 'createdAt' | 'type'>;

export interface EditCommitPayload {
  sessionId: string;
  operations: EditPendingOperation[];
  tempUploads: EditTempUploadOperation[];
}

export interface EditCleanupPayload {
  sessionId: string | null;
  tempUploads: Array<{ tempKey?: string; key?: string }>;
}
