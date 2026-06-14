'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { useAuth } from '@/components/auth/AuthProvider';

interface EditModeContextType {
  isAdmin: boolean;
  adminToken: string | null;
  editMode: boolean;
  toggleEditMode: () => void;
  canShowEditButton: boolean;
}

const EditModeContext = createContext<EditModeContextType | null>(null);

export function useEditMode() {
  const context = useContext(EditModeContext);
  if (!context) throw new Error('useEditMode must be used within EditModeProvider');
  return context;
}

export function EditModeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [editMode, setEditMode] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  // Use user_token for admin API calls
  const adminToken = isAdmin ? (typeof window !== 'undefined' ? localStorage.getItem('user_token') : null) : null;

  const toggleEditMode = useCallback(() => {
    setEditMode((prev) => !prev);
  }, []);

  const isPublic = process.env.NEXT_PUBLIC_EDIT_MODE_PUBLIC === 'true';
  const canShowEditButton = isPublic || isAdmin;

  return (
    <EditModeContext.Provider
      value={{
        isAdmin,
        adminToken,
        editMode,
        toggleEditMode,
        canShowEditButton,
      }}
    >
      {children}
    </EditModeContext.Provider>
  );
}
