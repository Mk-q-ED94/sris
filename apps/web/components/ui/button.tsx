import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
};

export function Button({ className, variant = "primary", size = "md", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md border font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:pointer-events-none disabled:opacity-50",
        size === "sm" ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm",
        variant === "primary" && "border-accent bg-accent text-accent-foreground hover:bg-accent/90",
        variant === "secondary" && "border-border bg-surface text-foreground hover:bg-muted",
        variant === "ghost" && "border-transparent bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
        variant === "danger" && "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
        className,
      )}
      {...props}
    />
  );
}
