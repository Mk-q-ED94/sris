import { DataSection } from "@/components/app/data-section";
import { PageHeader } from "@/components/app/page-header";

export default function LabsPage() {
  return (
    <>
      <PageHeader title="Labs & Professors" description="教授、实验室、研究方向关键词与近期论文的长期跟踪。" />
      <div className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Professors</h2>
        <DataSection entity="professors" />
      </div>
      <h2 className="mb-3 text-lg font-semibold">Labs</h2>
      <DataSection entity="labs" />
    </>
  );
}
