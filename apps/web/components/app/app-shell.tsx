import Link from "next/link";
import { BookOpen, CalendarDays, FlaskConical, GraduationCap, Home, Inbox, Radar, Settings, University } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/universities", label: "Universities", icon: University },
  { href: "/labs", label: "Labs & Professors", icon: FlaskConical },
  { href: "/programs", label: "Programs", icon: GraduationCap },
  { href: "/papers", label: "Paper Radar", icon: BookOpen },
  { href: "/review", label: "Review Queue", icon: Inbox },
  { href: "/timeline", label: "Timeline", icon: CalendarDays },
  { href: "/settings", label: "Settings / Sources", icon: Radar },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-surface lg:block">
        <div className="flex h-16 items-center border-b border-border px-5">
          <div>
            <div className="text-lg font-semibold">SRIS</div>
            <div className="text-xs text-muted-foreground">Research Intelligence</div>
          </div>
        </div>
        <nav className="space-y-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4 text-xs leading-5 text-muted-foreground">
          单人私用模式<br />
          Asia/Shanghai deadlines
        </div>
      </aside>
      <main className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background/95 px-5 backdrop-blur">
          <div className="text-sm font-medium text-muted-foreground">SGU / AI 修士申请情报控制台</div>
          <Link href="/settings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <Settings className="h-4 w-4" />
            Sources
          </Link>
        </header>
        <div className="mx-auto max-w-7xl px-5 py-6">{children}</div>
      </main>
    </div>
  );
}
