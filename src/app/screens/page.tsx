import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { UnderConstruction } from '@/components/ui/UnderConstruction';

export const metadata = { title: '影视综' };

export default function ScreensPage() {
  return (
    <PageContainer>
      <PageHeader title="影视综" titleEn="Screens" description="电影 · 电视剧 · 综艺" />
      <UnderConstruction />
    </PageContainer>
  );
}
