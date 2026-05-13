import { DataSection } from "@/components/app/data-section";
import { PageHeader } from "@/components/app/page-header";

export default function UniversitiesPage() {
  return (
    <>
      <PageHeader title="Universities" description="目标院校数据库：位置、官网、学费备注和申请相关笔记。" />
      <DataSection entity="universities" />
    </>
  );
}
