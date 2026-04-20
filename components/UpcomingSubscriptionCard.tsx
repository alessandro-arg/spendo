import { formatCurrency } from "@/lib/utils";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export function getDaysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatRenewalDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString("en-US", { month: "short", day: "numeric" });
}

type DaysBadgeVariant = "blue" | "amber" | "red";

export function getDaysBadge(days: number): {
  label: string;
  variant: DaysBadgeVariant;
} {
  if (days === 0) return { label: "Today", variant: "red" };
  if (days === 1) return { label: "Tomorrow", variant: "red" };
  if (days < 3) return { label: `In ${days} days`, variant: "red" };
  if (days <= 5) return { label: `In ${days} days`, variant: "amber" };
  return { label: `In ${days} days`, variant: "blue" };
}

const BADGE_STYLES: Record<
  DaysBadgeVariant,
  { bg: string; border: string; text: string }
> = {
  blue: {
    bg: "rgba(74,144,226,0.12)",
    border: "rgba(74,144,226,0.3)",
    text: "#60a5fa",
  },
  amber: {
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.3)",
    text: "#f59e0b",
  },
  red: {
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.3)",
    text: "#ef4444",
  },
};

const UpcomingSubscriptionCard = ({
  name,
  price,
  icon,
  currency,
  color,
  category,
  billing,
  renewalDate,
  onPress,
}: Subscription & { onPress?: () => void }) => {
  const days = getDaysUntil(renewalDate ?? "");
  const { label, variant } = getDaysBadge(days);
  const badge = BADGE_STYLES[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="usc-container"
    >
      {/* Icon + badge */}
      <View className="usc-header">
        <View
          style={{ backgroundColor: color ?? "#2a2a2a" }}
          className="usc-icon-wrapper"
        >
          {icon ? (
            <Image
              source={icon}
              className="usc-icon-image"
              resizeMode="contain"
            />
          ) : (
            <MaterialCommunityIcons
              name="progress-question"
              size={20}
              className="sub-icon-fallback"
            />
          )}
        </View>

        <View
          style={{
            backgroundColor: badge.bg,
            borderColor: badge.border,
            borderWidth: 1,
          }}
          className="usc-badge"
        >
          <Text style={{ color: badge.text }} className="usc-badge-text">
            {label}
          </Text>
        </View>
      </View>

      {/* Name + category */}
      <View>
        <Text className="usc-name" numberOfLines={1}>
          {name}
        </Text>
        <Text className="usc-category" numberOfLines={1}>
          {category}
        </Text>
      </View>

      {/* Price + billing */}
      <View>
        <Text className="usc-price">{formatCurrency(price, currency)}</Text>
        <Text className="usc-billing">{billing.toLowerCase()}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default UpcomingSubscriptionCard;
