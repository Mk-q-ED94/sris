import { PageHeader } from "@/components/app/page-header";
import { ReviewQueue } from "@/components/app/review-queue";

export default function ReviewPage() {
  return (
    <>
      <PageHeader
        title="Review Queue"
        description="arXiv 自动采集结果先进入待确认队列，人工接受后才进入正式论文库。"
      />
      <ReviewQueue />
    </>
  );
}
