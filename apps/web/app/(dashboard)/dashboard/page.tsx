import { PageHeader } from "@/components/app/page-header";
import { DashboardView } from "@/components/app/dashboard-view";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="近期论文、待确认情报、申请任务和核心数据库规模的总览。"
      />
      <DashboardView />
    </>
  );
}
