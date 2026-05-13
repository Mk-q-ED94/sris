import { DataSection } from "@/components/app/data-section";
import { PageHeader } from "@/components/app/page-header";

export default function PapersPage() {
  return (
    <>
      <PageHeader title="Paper Radar" description="已确认入库的论文列表，支持按 venue、年份、关键词等结构化检索。" />
      <DataSection entity="papers" />
    </>
  );
}
