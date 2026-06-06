import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { UnderConstruction } from '@/components/ui/UnderConstruction';

export const metadata = { title: '留言板' };

export default function MessagesPage() {
  return (
    <PageContainer>
      <PageHeader
        title="留言板"
        titleEn="Guestbook"
        description="我想对你说 · 故事分享 · 建议反馈"
      />
      <UnderConstruction />
    </PageContainer>
  );
}
