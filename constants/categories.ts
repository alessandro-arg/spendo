export const CATEGORIES = [
  "All",
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];
