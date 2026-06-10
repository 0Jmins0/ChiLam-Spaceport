'use client';

import { useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { PageContainer } from '@/components/layout/PageContainer';
import { BackButton } from '@/components/ui/BackButton';
import { PageHeader } from '@/components/layout/PageHeader';
import { MessageList } from '@/components/profile/MessageList';

export default function ProfileMessagesPage() {
  const { user, loading, openLogin } = useAuth();

  useEffect(() => {
    document.title = '我的留言 - 太空留言板';
  }, []);

  // 未登录
  if (!loading && !user) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-24">
          <p className="mb-4 text-text-secondary">请先登录后查看留言</p>
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
  if (loading) {
    return (
      <PageContainer>
        <BackButton label="返回个人中心" className="inline-block text-sm text-accent hover:text-accent/80 transition-colors mb-4" />
        <PageHeader title="我的留言" titleEn="My Messages" />
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <BackButton label="返回个人中心" className="inline-block text-sm text-accent hover:text-accent/80 transition-colors mb-4" />
      <PageHeader title="我的留言" titleEn="My Messages" />
      <MessageList />
    </PageContainer>
  );
}
