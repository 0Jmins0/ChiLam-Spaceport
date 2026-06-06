import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { UnderConstruction } from '@/components/ui/UnderConstruction';

export const metadata = { title: '动态' };

export default function UpdatesPage() {
  return (
    <PageContainer>
      <PageHeader title="动态" titleEn="Updates" description="社交媒体 · 新闻报道 · 路透" />
      <UnderConstruction />
    </PageContainer>
  );
}
