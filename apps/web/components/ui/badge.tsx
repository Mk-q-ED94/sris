import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: "default" | "success" | "warning" | "muted" }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-sm border px-2 text-xs font-medium",
        tone === "default" && "border-accent/20 bg-accent/10 text-accent",
        tone === "success" && "border-green-200 bg-green-50 text-green-700",
        tone === "warning" && "border-amber-200 bg-amber-50 text-amber-700",
        tone === "muted" && "border-border bg-muted text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
