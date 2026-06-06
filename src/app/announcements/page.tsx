import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { UnderConstruction } from '@/components/ui/UnderConstruction';

export const metadata = { title: '公告' };

export default function AnnouncementsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="公告"
        titleEn="Announcements"
        description="网站公告 · 规则说明 · 更新通知"
      />
      <UnderConstruction />
    </PageContainer>
  );
}
