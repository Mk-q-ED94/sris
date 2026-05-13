import type { PageKey } from "../components/AppShell";

const copy: Record<PageKey, { title: string; description: string }> = {
  dashboard: { title: "总览", description: "Dashboard" },
  universities: { title: "院校", description: "目标院校数据库会在下一轮迁移到 React 表格视图。" },
  professors: { title: "教授", description: "教授和研究方向视图会沿用新的 Apple/Stripe 组件系统。" },
  labs: { title: "实验室", description: "实验室、关键词和近期论文会在后续页面重构。" },
  programs: { title: "项目", description: "SGU 项目与 deadline 管理将接入同一套筛选交互。" },
  papers: { title: "论文雷达", description: "已确认论文库会改成高密度研究表格。" },
  review: { title: "待确认", description: "Review Queue 会保留接受/忽略流程，并升级成卡片队列。" },
  timeline: { title: "时间线", description: "申请任务会改成更清晰的时间轴和优先级视图。" },
  sources: { title: "数据源", description: "arXiv RSS 与关键词设置会迁移到配置页面。" },
};

export function PlaceholderPage({ page }: { page: PageKey }) {
  const item = copy[page];
  return (
    <section className="grid min-h-[70vh] place-items-center">
      <div className="max-w-2xl rounded-[34px] border border-white/80 bg-white/75 p-10 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="mx-auto mb-5 h-2 w-16 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400" />
        <h1 className="text-4xl font-semibold tracking-[-0.05em]">{item.title}</h1>
        <p className="mt-4 text-base leading-7 text-slate-500">{item.description}</p>
        <p className="mt-6 text-sm text-slate-400">当前大改先完成总览页，后续页面会逐个迁移。</p>
      </div>
    </section>
  );
}
