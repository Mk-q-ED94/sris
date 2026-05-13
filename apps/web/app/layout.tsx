import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SRIS",
  description: "SGU Research Intelligence System",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
