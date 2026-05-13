import { DataSection } from "@/components/app/data-section";
import { PageHeader } from "@/components/app/page-header";

export default function TimelinePage() {
  return (
    <>
      <PageHeader title="Timeline" description="TOEFL、JLPT、SOP、推荐信、申请 DDL 等长期任务线。" />
      <DataSection entity="timeline" />
    </>
  );
}
