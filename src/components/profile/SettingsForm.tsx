'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';

interface SettingsFormProps {
  user: {
    id: string;
    username: string;
    displayName: string | null;
    avatar: string | null;
  };
}

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB

export function SettingsForm({ user }: SettingsFormProps) {
  // 个人资料
  const [displayName, setDisplayName] = useState(user.displayName ?? '');
  const [avatarPreview, setAvatarPreview] = useState(user.avatar);
  const [uploading, setUploading] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 密码
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const initial = (user.displayName || user.username).charAt(0).toUpperCase();

  // 头像上传
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_AVATAR_SIZE) {
      setProfileError('图片大小不能超过 2MB');
      return;
    }

    // 本地预览
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setUploading(true);
    setProfileError('');

    try {
      const token = localStorage.getItem('user_token');

      // 上传文件
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error('上传失败');
      }

      const uploadData = await uploadRes.json();
      const avatarUrl = uploadData.url;

      // 更新个人资料
      const profileRes = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ avatar: avatarUrl }),
      });

      if (!profileRes.ok) {
        const data = await profileRes.json();
        throw new Error(data.error?.message || '更新头像失败');
      }

      // 刷新页面以更新全局 user 状态
      window.location.reload();
    } catch (err) {
      setAvatarPreview(user.avatar);
      setProfileError(err instanceof Error ? err.message : '上传失败，请稍后重试');
    } finally {
      setUploading(false);
      URL.revokeObjectURL(previewUrl);
    }
  }

  // 保存昵称
  async function handleSaveProfile() {
    const trimmed = displayName.trim();
    if (!trimmed) {
      setProfileError('昵称不能为空');
      return;
    }
    if (trimmed.length > 20) {
      setProfileError('昵称不能超过 20 字');
      return;
    }

    setSavingProfile(true);
    setProfileError('');
    setProfileMsg('');

    try {
      const token = localStorage.getItem('user_token');
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ displayName: trimmed }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || '保存失败');
      }

      setProfileMsg('昵称已更新');
      // 刷新以同步全局状态
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSavingProfile(false);
    }
  }

  // 修改密码
  async function handleChangePassword() {
    setPasswordError('');
    setPasswordMsg('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('请填写所有密码字段');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('新密码至少 6 个字符');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('两次输入的新密码不一致');
      return;
    }

    setSavingPassword(true);

    try {
      const token = localStorage.getItem('user_token');
      const res = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || '修改密码失败');
      }

      setPasswordMsg('密码已更新');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : '修改密码失败');
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* 区块 1：个人资料 */}
      <Card hover={false} className="p-6">
        <h3 className="mb-5 font-heading text-base font-semibold text-accent">个人资料</h3>

        {/* 头像上传 */}
        <div className="mb-5 flex items-center gap-5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-border-gold transition-opacity hover:opacity-80"
            disabled={uploading}
          >
            {avatarPreview ? (
              <Image
                src={avatarPreview}
                alt="头像"
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-accent/20 text-2xl font-bold text-accent">
                {initial}
              </div>
            )}

            {/* 上传中蒙版 */}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              </div>
            )}
          </button>

          <div className="text-sm text-text-muted">
            <p>点击头像更换</p>
            <p className="text-xs">支持 JPG/PNG/WebP/GIF，最大 2MB</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        {/* 显示名称 */}
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-xs text-text-secondary">显示名称</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={20}
              className="w-full rounded-lg border border-border-gold bg-bg-dark/50 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
              placeholder="设置你的显示名称"
            />
          </div>
          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={savingProfile}
            className="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg-dark transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {savingProfile ? '保存中...' : '保存'}
          </button>
        </div>

        {/* 资料消息 */}
        {profileMsg && <p className="mt-2 text-xs text-green-400">{profileMsg}</p>}
        {profileError && <p className="mt-2 text-xs text-red-400">{profileError}</p>}
      </Card>

      {/* 分隔线 */}
      <div className="gold-line w-full" />

      {/* 区块 2：修改密码 */}
      <Card hover={false} className="p-6">
        <h3 className="mb-5 font-heading text-base font-semibold text-accent">修改密码</h3>

        <div className="space-y-4 max-w-sm">
          <div>
            <label className="mb-1 block text-xs text-text-secondary">当前密码</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full rounded-lg border border-border-gold bg-bg-dark/50 px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-text-secondary">新密码</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-border-gold bg-bg-dark/50 px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-text-secondary">确认新密码</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-border-gold bg-bg-dark/50 px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleChangePassword}
            disabled={savingPassword}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg-dark transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {savingPassword ? '保存中...' : '修改密码'}
          </button>
        </div>

        {/* 密码消息 */}
        {passwordMsg && <p className="mt-3 text-xs text-green-400">{passwordMsg}</p>}
        {passwordError && <p className="mt-3 text-xs text-red-400">{passwordError}</p>}
      </Card>
    </div>
  );
}
