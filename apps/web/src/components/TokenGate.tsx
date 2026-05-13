import { ArrowRight, KeyRound, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export function TokenGate() {
  const { saveToken } = useAuth();
  const [token, setToken] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (token.trim()) saveToken(token.trim());
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f7fb] text-slate-950">
      <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_22%_24%,rgba(56,189,248,0.24),transparent_32%),radial-gradient(circle_at_76%_10%,rgba(99,102,241,0.18),transparent_28%)]" />
      <section className="relative mx-auto grid min-h-screen w-full max-w-6xl place-items-center px-6 py-12">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm backdrop-blur">
              <ShieldCheck className="h-4 w-4 text-cyan-600" />
              Cloudflare Worker + D1
            </div>
            <h1 className="max-w-xl text-5xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-6xl">
              SRIS Research Intelligence Console
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              面向 SGU / AI 修士申请的个人研究情报控制台。输入部署时设置的 API token 后进入总览。
            </p>
          </div>

          <form
            onSubmit={submit}
            className="rounded-[28px] border border-white/80 bg-white/80 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl"
          >
            <div className="rounded-[22px] border border-slate-200/70 bg-white p-8">
              <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <KeyRound className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-semibold tracking-[-0.02em]">Private access</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Token 只保存在当前浏览器 localStorage，不会写入数据库。
              </p>
              <label className="mt-7 block">
                <span className="mb-2 block text-sm font-medium text-slate-700">API_TOKEN</span>
                <input
                  value={token}
                  onChange={(event) => setToken(event.target.value)}
                  type="password"
                  autoComplete="current-password"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
                  placeholder="Paste your private token"
                />
              </label>
              <button className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800">
                Enter dashboard
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
