'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      // Use microtask to avoid synchronous setState in effect body
      Promise.resolve().then(() => {
        setIsAdmin(true);
        setAdminToken(token);
      });
    }
  }, []);

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
