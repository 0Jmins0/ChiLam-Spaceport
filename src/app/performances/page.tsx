import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { UnderConstruction } from '@/components/ui/UnderConstruction';

export const metadata = { title: '演出' };

export default function PerformancesPage() {
  return (
    <PageContainer>
      <PageHeader title="演出" titleEn="Performances" description="演唱会 · 舞台 · 音乐剧" />
      <UnderConstruction />
    </PageContainer>
  );
}
