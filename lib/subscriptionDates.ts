export function getDaysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatRenewalLabel(dateStr: string): string {
  const days = getDaysUntil(dateStr);
  const date = new Date(dateStr);
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  const base = `${month} ${day}`;
  if (days <= 0) return base;
  if (days <= 7) return `${base} (In ${days} day${days === 1 ? "" : "s"})`;
  return base;
}

export function isUrgent(dateStr: string): boolean {
  return getDaysUntil(dateStr) <= 7 && getDaysUntil(dateStr) > 0;
}