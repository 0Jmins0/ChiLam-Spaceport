'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { Button } from '@/components/ui/Button';

export function LoginModal() {
  const { modalState, login, closeModal, openRegister } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (modalState !== 'login') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;

    setSubmitting(true);
    setError('');

    const result = await login(username.trim(), password);
    if (!result.success) {
      setError(result.error || '登录失败');
    }
    setSubmitting(false);
  };

  const switchToRegister = () => {
    setUsername('');
    setPassword('');
    setError('');
    openRegister();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-bg-dark/80 backdrop-blur-sm" onClick={closeModal} />

      {/* Modal */}
      <div className="relative w-full max-w-sm mx-4 rounded-[var(--radius-card)] border border-border-gold bg-bg-darker p-6 shadow-2xl">
        {/* Close */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-text-muted hover:text-accent transition-colors"
          aria-label="关闭"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <h2 className="font-heading text-xl text-text-primary mb-6">登录</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-text-muted mb-1">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-md border border-border-gold/50 bg-bg-dark px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent focus:outline-none"
              placeholder="请输入用户名"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs text-text-muted mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-border-gold/50 bg-bg-dark px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent focus:outline-none"
              placeholder="请输入密码"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? '登录中...' : '登录'}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-text-muted">
          还没有账号？
          <button onClick={switchToRegister} className="ml-1 text-accent hover:underline">
            去注册
          </button>
        </p>
      </div>
    </div>
  );
}
