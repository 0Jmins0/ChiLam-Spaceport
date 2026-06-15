'use client';

import { TabBar } from '@/components/ui/TabBar';
import { Tag } from '@/components/ui/Tag';

// 一级 Tab
const GALLERY_TABS = [
  { value: 'image', label: '图片' },
  { value: 'video', label: '视频' },
  { value: 'audio', label: '音频' },
  { value: 'collection', label: '合集' },
] as const;

// 二级 Tag 按 category
const IMAGE_TAGS = [
  { key: 'all', label: '全部' },
  { key: 'POSTER', label: '海报/封面' },
  { key: 'EVENT', label: '活动照' },
  { key: 'PORTRAIT', label: '写真' },
  { key: 'SCREENSHOT', label: '剧照' },
  { key: 'SOCIAL', label: '社交媒体图' },
  { key: 'MESSAGE', label: '留言图片' },
  { key: 'OTHER', label: '其他' },
];

const VIDEO_TAGS = [
  { key: 'all', label: '全部' },
  { key: 'EVENT', label: '活动' },
  { key: 'BEHIND', label: '幕后' },
  { key: 'SIGHTING', label: '路透' },
  { key: 'OTHER', label: '其他' },
];

const AUDIO_TAGS = [
  { key: 'all', label: '全部' },
  { key: 'SONG', label: '歌曲' },
  { key: 'INTERVIEW', label: '访谈' },
  { key: 'OTHER', label: '其他' },
];

interface GalleryFilterBarProps {
  currentTab: string;
  currentTag: string;
  counts: {
    image: number;
    video: number;
    audio: number;
    collection: number;
  };
  onTabChange: (tab: string) => void;
  onTagChange: (tag: string) => void;
}

export function GalleryFilterBar({
  currentTab,
  currentTag,
  counts,
  onTabChange,
  onTagChange,
}: GalleryFilterBarProps) {
  const tabs = GALLERY_TABS.map((t) => ({
    value: t.value,
    label: `${t.label} (${counts[t.value as keyof typeof counts] ?? 0})`,
  }));

  // 获取二级 tag
  const getSecondaryTags = () => {
    switch (currentTab) {
      case 'image':
        return IMAGE_TAGS;
      case 'video':
        return VIDEO_TAGS;
      case 'audio':
        return AUDIO_TAGS;
      default:
        return null;
    }
  };

  const secondaryTags = getSecondaryTags();

  return (
    <div className="space-y-4">
      {/* 一级 Tab */}
      <TabBar
        tabs={tabs}
        activeTab={currentTab}
        onTabChange={(value) => {
          onTabChange(value);
        }}
      />

      {/* 二级 Tag */}
      {secondaryTags && (
        <div className="flex flex-wrap gap-2">
          {secondaryTags.map((tag) => (
            <Tag
              key={tag.key}
              active={currentTag === tag.key}
              onClick={() => onTagChange(tag.key)}
            >
              {tag.label}
            </Tag>
          ))}
        </div>
      )}
    </div>
  );
}
