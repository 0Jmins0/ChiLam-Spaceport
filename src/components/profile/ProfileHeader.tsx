'use client';

import Image from 'next/image';
import { Card } from '@/components/ui/Card';

export interface UserProfile {
  id: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  postsCount: number;
  receivedLikesCount: number;
  receivedCommentsCount: number;
  givenLikesCount: number;
  givenCommentsCount: number;
  starlight: number;
  createdAt: string;
}

interface ProfileHeaderProps {
  profile: UserProfile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const initial = (profile.displayName || profile.username).charAt(0).toUpperCase();
  const showDisplayName = profile.displayName && profile.displayName !== profile.username;

  const joinDate = new Date(profile.createdAt).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const stats = [
    { label: '留言', value: profile.postsCount },
    { label: '获赞', value: profile.receivedLikesCount },
    { label: '获评论', value: profile.receivedCommentsCount },
    { label: '星光', value: profile.starlight, decoration: ' \u2726' },
  ];

  return (
    <div className="mb-8">
      {/* 用户信息 */}
      <div className="flex items-center gap-5 mb-6">
        {/* 头像 */}
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-border-gold">
          {profile.avatar ? (
            <Image
              src={profile.avatar}
              alt={profile.username}
              width={80}
              height={80}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-accent/20 text-2xl font-bold text-accent">
              {initial}
            </div>
          )}
        </div>

        {/* 文字信息 */}
        <div className="min-w-0">
          <h2 className="font-heading text-xl font-semibold text-accent truncate">
            {profile.username}
          </h2>
          {showDisplayName && (
            <p className="text-sm text-text-secondary truncate">{profile.displayName}</p>
          )}
          <p className="mt-1 text-xs text-text-muted">{joinDate} 加入</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} hover={false} className="flex flex-col items-center gap-1 py-3">
            <span className="text-lg font-semibold text-text-primary">
              {stat.value}
              {stat.decoration ?? ''}
            </span>
            <span className="text-xs text-text-muted">{stat.label}</span>
          </Card>
        ))}
      </div>
    </div>
  );
}
