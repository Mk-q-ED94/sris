import { DataSection } from "@/components/app/data-section";
import { PageHeader } from "@/components/app/page-header";

export default function ProgramsPage() {
  return (
    <>
      <PageHeader title="Programs" description="英文修士项目、申请要求、语言成绩、奖学金和 deadline 管理。" />
      <DataSection entity="programs" />
    </>
  );
}
