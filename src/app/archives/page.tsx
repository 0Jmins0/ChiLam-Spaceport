import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { UnderConstruction } from '@/components/ui/UnderConstruction';

export const metadata = { title: '资料库' };

export default function ArchivesPage() {
  return (
    <PageContainer>
      <PageHeader title="资料库" titleEn="Archives" description="杂志 · 专辑" />
      <UnderConstruction />
    </PageContainer>
  );
}
