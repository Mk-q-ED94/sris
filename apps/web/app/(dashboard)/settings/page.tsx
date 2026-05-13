import { DataSection } from "@/components/app/data-section";
import { PageHeader } from "@/components/app/page-header";

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings / Sources" description="arXiv RSS 查询源、关键词和自动化配置状态。" />
      <DataSection entity="sources" />
    </>
  );
}
