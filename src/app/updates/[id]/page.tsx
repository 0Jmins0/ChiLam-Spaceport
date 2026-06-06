import Link from 'next/link';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';

export const metadata = { title: '动态详情' };

export default function UpdateDetailPage() {
  return (
    <PageContainer>
      <div className="mx-auto max-w-md py-20 text-center">
        <h1 className="font-heading text-2xl font-semibold text-text-primary">
          请通过动态列表页访问详情
        </h1>
        <p className="mt-4 text-text-secondary">
          动态详情页已迁移至新路径，请返回列表页选择具体内容。
        </p>
        <div className="mt-8">
          <Link href="/updates">
            <Button variant="primary">&larr; 返回动态列表</Button>
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
