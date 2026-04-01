export const colors = {
  background: "#121212",
  foreground: "#F8FAFC",
  card: "#1F1F1F",
  muted: "#656970",
  mutedForeground: "#9CA3AF",
  primary: "#F8FAFC",
  accent: "#4A90E2",
  border: "#353535",
  success: "#10B981",
  destructive: "#EF4444",
  subscription: "#60A5FA",
} as const;

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  18: 72,
  20: 80,
  24: 96,
  30: 120,
} as const;

export const components = {
  tabBar: {
    height: spacing[18],
    horizontalInset: spacing[5],
    radius: spacing[8],
    iconFrame: spacing[12],
    itemPaddingVertical: spacing[2],
  },
} as const;

export const theme = {
  colors,
  spacing,
  components,
} as const;
