export function formatDate(value: string | null | undefined, dateLocale: string, fallback: string): string {
  if (!value) return fallback;
  return new Intl.DateTimeFormat(dateLocale, {
    timeZone: "Asia/Shanghai",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function compactNumber(value: number): string {
  return new Intl.NumberFormat("en", { notation: "compact" }).format(value);
}
