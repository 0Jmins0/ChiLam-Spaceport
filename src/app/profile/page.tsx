'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProfileHeader, type UserProfile } from '@/components/profile/ProfileHeader';
import { Card } from '@/components/ui/Card';

export default function ProfilePage() {
  const { user, loading: authLoading, openLogin } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = '个人中心 - 太空留言板';
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      // Use microtask to avoid synchronous setState in effect body
      Promise.resolve().then(() => setLoading(false));
      return;
    }

    async function fetchProfile() {
      try {
        const token = localStorage.getItem('user_token');
        const res = await fetch('/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error?.message || '获取个人信息失败');
        }
        const json = await res.json();
        setProfile(json.data.user);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取个人信息失败');
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user, authLoading]);

  // 未登录
  if (!authLoading && !user) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-24">
          <p className="mb-4 text-text-secondary">请先登录后查看个人中心</p>
          <button
            onClick={openLogin}
            className="rounded-lg bg-accent px-6 py-2 text-sm font-medium text-bg-dark transition-opacity hover:opacity-90"
          >
            登录
          </button>
        </div>
      </PageContainer>
    );
  }

  // 加载中
  if (authLoading || loading) {
    return (
      <PageContainer>
        <PageHeader title="个人中心" titleEn="Profile" />
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      </PageContainer>
    );
  }

  // 错误
  if (error) {
    return (
      <PageContainer>
        <PageHeader title="个人中心" titleEn="Profile" />
        <div className="py-12 text-center">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="个人中心" titleEn="Profile" />

      {profile && <ProfileHeader profile={profile} />}

      {/* 快捷入口 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link href="/profile/messages">
          <Card className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent/10">
              <MessageIcon />
            </div>
            <div>
              <h3 className="font-heading text-sm font-semibold text-text-primary">我的留言</h3>
              <p className="text-xs text-text-muted">管理你发布的留言</p>
            </div>
          </Card>
        </Link>

        <Link href="/profile/settings">
          <Card className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent/10">
              <SettingsIcon />
            </div>
            <div>
              <h3 className="font-heading text-sm font-semibold text-text-primary">个人设置</h3>
              <p className="text-xs text-text-muted">修改头像、昵称、密码</p>
            </div>
          </Card>
        </Link>
      </div>
    </PageContainer>
  );
}

function MessageIcon() {
  return (
    <svg
      className="h-5 w-5 text-accent"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      className="h-5 w-5 text-accent"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7 7 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a7 7 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a7 7 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a7 7 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}
