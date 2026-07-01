'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import type {
  EditCleanupPayload,
  EditCommitPayload,
  EditPendingOperation,
  EditSaveStatus,
  EditTempUploadOperation,
  EditUploadStatus,
  RegisterEntryDeleteInput,
  RegisterFieldChangeInput,
  RegisterMediaRemoveInput,
  RegisterMediaReplaceInput,
  RegisterTempUploadInput,
} from './types';

interface EditModeContextType {
  isAdmin: boolean;
  adminToken: string | null;
  editMode: boolean;
  sessionId: string | null;
  hasChanges: boolean;
  saveStatus: EditSaveStatus;
  uploadStatus: EditUploadStatus;
  pendingOperations: EditPendingOperation[];
  errorMessage: string | null;
  toggleEditMode: () => Promise<void>;
  canShowEditButton: boolean;
  registerFieldChange: (input: RegisterFieldChangeInput) => void;
  registerTempUpload: (input: RegisterTempUploadInput) => void;
  registerMediaRemove: (input: RegisterMediaRemoveInput) => void;
  registerMediaReplace: (input: RegisterMediaReplaceInput) => void;
  registerEntryDelete: (input: RegisterEntryDeleteInput) => void;
  saveChanges: () => Promise<{ success: boolean; error?: string }>;
  discardChanges: () => Promise<{ success: boolean; error?: string }>;
}

const EditModeContext = createContext<EditModeContextType | null>(null);

export function useEditMode() {
  const context = useContext(EditModeContext);
  if (!context) throw new Error('useEditMode must be used within EditModeProvider');
  return context;
}

function createClientId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function createOperation<T extends EditPendingOperation['type']>(
  type: T,
  input: Omit<Extract<EditPendingOperation, { type: T }>, 'id' | 'createdAt' | 'type'>,
) {
  return {
    id: createClientId(type),
    createdAt: new Date().toISOString(),
    type,
    ...input,
  } as Extract<EditPendingOperation, { type: T }>;
}

function isTempUpload(operation: EditPendingOperation): operation is EditTempUploadOperation {
  return operation.type === 'temp_upload';
}

function hasTempKey(operation: EditPendingOperation): operation is (
  | EditTempUploadOperation
  | Extract<EditPendingOperation, { type: 'media_replace' }>
) & {
  tempKey: string;
} {
  return (
    (operation.type === 'temp_upload' || operation.type === 'media_replace') &&
    typeof operation.tempKey === 'string' &&
    operation.tempKey.length > 0
  );
}

export function EditModeProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, openLogin } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pendingOperations, setPendingOperations] = useState<EditPendingOperation[]>([]);
  const [saveStatus, setSaveStatus] = useState<EditSaveStatus>('idle');
  const [uploadStatus, setUploadStatus] = useState<EditUploadStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isAdmin = user?.role === 'ADMIN';
  // Use user_token for admin API calls
  const adminToken = isAdmin
    ? typeof window !== 'undefined'
      ? localStorage.getItem('user_token')
      : null
    : null;

  const ensureSessionId = useCallback(() => {
    if (sessionId) return sessionId;

    const nextSessionId = createClientId('edit_session');
    setSessionId(nextSessionId);
    return nextSessionId;
  }, [sessionId]);

  const resetSession = useCallback(() => {
    setSessionId(null);
    setPendingOperations([]);
    setUploadStatus('idle');
    setErrorMessage(null);
  }, []);

  const tempUploads = useMemo(() => pendingOperations.filter(isTempUpload), [pendingOperations]);
  const hasChanges = pendingOperations.length > 0;

  const registerFieldChange = useCallback(
    (input: RegisterFieldChangeInput) => {
      ensureSessionId();
      setSaveStatus('idle');
      setErrorMessage(null);
      setPendingOperations((current) => {
        const nextOperation = createOperation('field_change', input);
        const withoutPreviousFieldChange = current.filter(
          (operation) =>
            !(
              operation.type === 'field_change' &&
              operation.entityType === input.entityType &&
              operation.entityId === input.entityId &&
              operation.field === input.field
            ),
        );
        return [...withoutPreviousFieldChange, nextOperation];
      });
    },
    [ensureSessionId],
  );

  const registerTempUpload = useCallback(
    ({ uploadStatus: nextUploadStatus = 'uploaded', ...input }: RegisterTempUploadInput) => {
      ensureSessionId();
      setSaveStatus('idle');
      setUploadStatus(nextUploadStatus);
      setErrorMessage(null);
      setPendingOperations((current) => [...current, createOperation('temp_upload', input)]);
    },
    [ensureSessionId],
  );

  const registerMediaRemove = useCallback(
    (input: RegisterMediaRemoveInput) => {
      ensureSessionId();
      setSaveStatus('idle');
      setErrorMessage(null);
      setPendingOperations((current) => [...current, createOperation('media_remove', input)]);
    },
    [ensureSessionId],
  );

  const registerMediaReplace = useCallback(
    (input: RegisterMediaReplaceInput) => {
      ensureSessionId();
      setSaveStatus('idle');
      setErrorMessage(null);
      setPendingOperations((current) => {
        const nextOperation = createOperation('media_replace', input);
        const withoutPreviousReplacement = current.filter(
          (operation) =>
            !(
              operation.type === 'media_replace' &&
              operation.target === input.target &&
              operation.targetId === input.targetId &&
              operation.relation === input.relation
            ),
        );
        return [...withoutPreviousReplacement, nextOperation];
      });
    },
    [ensureSessionId],
  );

  const registerEntryDelete = useCallback(
    (input: RegisterEntryDeleteInput) => {
      ensureSessionId();
      setSaveStatus('idle');
      setErrorMessage(null);
      setPendingOperations((current) => {
        const nextOperation = createOperation('entry_delete', input);
        const withoutEntityOperations = current.filter(
          (operation) =>
            !(
              'entityType' in operation &&
              operation.entityType === input.entityType &&
              'entityId' in operation &&
              operation.entityId === input.entityId
            ),
        );
        return [...withoutEntityOperations, nextOperation];
      });
    },
    [ensureSessionId],
  );

  const saveChanges = useCallback(async () => {
    if (!pendingOperations.length) {
      setSaveStatus('saved');
      return { success: true };
    }

    if (!adminToken) {
      const error = '缺少管理员登录凭证';
      setSaveStatus('error');
      setErrorMessage(error);
      return { success: false, error };
    }

    if (uploadStatus === 'uploading') {
      const error = '仍有文件上传中，请稍后再保存';
      setSaveStatus('error');
      setErrorMessage(error);
      return { success: false, error };
    }

    const currentSessionId = sessionId ?? ensureSessionId();
    const payload: EditCommitPayload = {
      sessionId: currentSessionId,
      operations: pendingOperations,
      tempUploads,
    };

    setSaveStatus('saving');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/admin/edit/commit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error?.message || data?.error || `保存失败 (${response.status})`);
      }

      resetSession();
      setSaveStatus('saved');
      router.refresh();
      window.setTimeout(() => setSaveStatus('idle'), 2000);
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : '保存失败';
      setSaveStatus('error');
      setErrorMessage(message);
      return { success: false, error: message };
    }
  }, [
    adminToken,
    ensureSessionId,
    pendingOperations,
    resetSession,
    router,
    sessionId,
    tempUploads,
    uploadStatus,
  ]);

  const discardChanges = useCallback(async () => {
    const tempOperations = pendingOperations.filter(hasTempKey);
    const shouldCleanup = Boolean(sessionId) || tempOperations.length > 0;

    if (saveStatus === 'saving') {
      return { success: false, error: '正在保存，请稍后再退出' };
    }

    if (!shouldCleanup) {
      resetSession();
      setSaveStatus('idle');
      setEditMode(false);
      return { success: true };
    }

    if (!adminToken) {
      const error = '缺少管理员登录凭证';
      setSaveStatus('error');
      setErrorMessage(error);
      return { success: false, error };
    }

    const payload: EditCleanupPayload = {
      sessionId,
      tempUploads: tempOperations,
    };

    setErrorMessage(null);

    try {
      const response = await fetch('/api/admin/edit/uploads/cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error?.message || data?.error || `退出失败 (${response.status})`);
      }

      resetSession();
      setSaveStatus('idle');
      setEditMode(false);
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : '退出失败';
      setSaveStatus('error');
      setErrorMessage(message);
      return { success: false, error: message };
    }
  }, [adminToken, pendingOperations, resetSession, saveStatus, sessionId]);

  const toggleEditMode = useCallback(async () => {
    if (!isAdmin) {
      // 未登录或非管理员，提示登录
      openLogin();
      return;
    }

    if (editMode) {
      await discardChanges();
      return;
    }

    ensureSessionId();
    setSaveStatus('idle');
    setUploadStatus('idle');
    setErrorMessage(null);
    setEditMode(true);
  }, [discardChanges, editMode, ensureSessionId, isAdmin, openLogin]);

  const isPublic = process.env.NEXT_PUBLIC_EDIT_MODE_PUBLIC === 'true';
  const canShowEditButton = isPublic || isAdmin;

  return (
    <EditModeContext.Provider
      value={{
        isAdmin,
        adminToken,
        editMode,
        sessionId,
        hasChanges,
        saveStatus,
        uploadStatus,
        pendingOperations,
        errorMessage,
        toggleEditMode,
        canShowEditButton,
        registerFieldChange,
        registerTempUpload,
        registerMediaRemove,
        registerMediaReplace,
        registerEntryDelete,
        saveChanges,
        discardChanges,
      }}
    >
      {children}
    </EditModeContext.Provider>
  );
}
