import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { UnderConstruction } from '@/components/ui/UnderConstruction';

export const metadata = { title: '活动' };

export default function ActivitiesPage() {
  return (
    <PageContainer>
      <PageHeader title="活动" titleEn="Activities" description="广告代言 · 访谈" />
      <UnderConstruction />
    </PageContainer>
  );
}
