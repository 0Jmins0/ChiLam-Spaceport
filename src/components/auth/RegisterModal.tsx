'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { Button } from '@/components/ui/Button';
import { isForbiddenUsername } from '@/lib/username-validator';

export function RegisterModal() {
  const { modalState, register, closeModal, openLogin } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [usernameHint, setUsernameHint] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (modalState !== 'register') return null;

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    if (value.trim().length > 0) {
      const check = isForbiddenUsername(value.trim());
      setUsernameHint(check.forbidden ? check.reason : '');
    } else {
      setUsernameHint('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password || !confirmPassword) return;

    if (username.trim().length < 2 || username.trim().length > 20) {
      setError('用户名长度需在 2-20 个字符之间');
      return;
    }

    const forbidden = isForbiddenUsername(username.trim());
    if (forbidden.forbidden) {
      setError(forbidden.reason);
      return;
    }

    if (password.length < 6) {
      setError('密码长度不能少于 6 个字符');
      return;
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setSubmitting(true);
    setError('');

    const result = await register(username.trim(), password);
    if (!result.success) {
      setError(result.error || '注册失败');
    }
    setSubmitting(false);
  };

  const switchToLogin = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setUsernameHint('');
    openLogin();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-bg-dark/80 backdrop-blur-sm" onClick={closeModal} />

      <div className="relative w-full max-w-sm mx-4 rounded-[var(--radius-card)] border border-border-gold bg-bg-darker p-6 shadow-2xl">
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

        <h2 className="font-heading text-xl text-text-primary mb-6">注册</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-text-muted mb-1">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              maxLength={20}
              className="w-full rounded-md border border-border-gold/50 bg-bg-dark px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent focus:outline-none"
              placeholder="2-20 个字符"
              autoFocus
            />
            {usernameHint && <p className="mt-1 text-xs text-red-400">{usernameHint}</p>}
          </div>

          <div>
            <label className="block text-xs text-text-muted mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-border-gold/50 bg-bg-dark px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent focus:outline-none"
              placeholder="至少 6 个字符"
            />
          </div>

          <div>
            <label className="block text-xs text-text-muted mb-1">确认密码</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-md border border-border-gold/50 bg-bg-dark px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent focus:outline-none"
              placeholder="再次输入密码"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? '注册中...' : '注册'}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-text-muted">
          已有账号？
          <button onClick={switchToLogin} className="ml-1 text-accent hover:underline">
            去登录
          </button>
        </p>
      </div>
    </div>
  );
}
