"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { createClient, hasSupabaseConfig } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const configured = hasSupabaseConfig();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!configured) return;
    setLoading(true);
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase!.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    setLoading(false);
    setMessage(error ? error.message : "登录链接已发送，请查看邮箱。");
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">SRIS 登录</CardTitle>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            单人私用模式。使用 Supabase magic link 进入研究情报控制台。
          </p>
        </CardHeader>
        <CardContent>
          {configured ? (
            <form onSubmit={submit} className="space-y-4">
              <label>
                <span className="mb-1 block text-xs font-medium text-muted-foreground">Email</span>
                <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </label>
              <Button className="w-full" disabled={loading}>
                <Mail className="h-4 w-4" />
                {loading ? "Sending..." : "Send magic link"}
              </Button>
              {message && <div className="text-sm text-muted-foreground">{message}</div>}
            </form>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800">
                Supabase 环境变量未配置，当前可进入只读 demo 数据模式。
              </div>
              <Link
                href="/dashboard"
                className="inline-flex h-10 w-full items-center justify-center rounded-md border border-accent bg-accent px-4 text-sm font-medium text-accent-foreground hover:bg-accent/90"
              >
                Enter demo console
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
