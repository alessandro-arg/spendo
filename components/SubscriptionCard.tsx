import { STATUS_CONFIG } from "@/constants/sub-status";
import {
  formatCurrency,
  formatStatusLabel,
  formatSubscriptionDateTime,
} from "@/lib/utils";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import clsx from "clsx";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

function getDaysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatRenewalLabel(dateStr: string): string {
  const days = getDaysUntil(dateStr);
  const date = new Date(dateStr);
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  const base = `${month} ${day}`;
  if (days <= 0) return base;
  if (days <= 7) return `${base} (In ${days} day${days === 1 ? "" : "s"})`;
  return base;
}

function isUrgent(dateStr: string): boolean {
  return getDaysUntil(dateStr) <= 7 && getDaysUntil(dateStr) > 0;
}

const SubscriptionCard = ({
  name,
  price,
  icon,
  billing,
  color,
  renewalDate,
  category,
  plan,
  expanded,
  paymentMethod,
  startDate,
  status,
  onPress,
}: SubscriptionCardProps) => {
  const fallback: string = "Not Provided";
  const statusKey: SubscriptionStatus = status ?? "active";
  const isInactive = statusKey === "paused" || statusKey === "cancelled";
  const statusConf = STATUS_CONFIG[statusKey];
  const renewalLabel = renewalDate ? formatRenewalLabel(renewalDate) : "—";
  const urgent = renewalDate ? isUrgent(renewalDate) : false;

  return (
    <TouchableOpacity
      onPress={onPress}
      className={clsx("sub-card", isInactive ? "opacity-60" : "")}
      activeOpacity={0.85}
    >
      <View className="sub-card-top">
        <View
          style={[{ backgroundColor: color ?? "#2a2a2a" }]}
          className={`sub-card-icon-wrapper`}
        >
          {icon ? (
            <Image
              source={icon}
              className="sub-card-icon"
              resizeMode="contain"
            />
          ) : (
            <MaterialCommunityIcons
              name="progress-question"
              className="sub-icon-fallback"
              size={30}
            />
          )}
        </View>

        <View className="flex-1">
          <Text className="sub-card-name">{name}</Text>
          <Text className="sub-card-category">{category}</Text>
        </View>

        <View className="items-end ">
          <Text
            className="sub-card-price"
            style={{
              textDecorationLine: isInactive ? "line-through" : "none",
            }}
          >
            {formatCurrency(price)}
          </Text>
          <Text className="sub-card-period">{billing.toLowerCase()}</Text>
        </View>
      </View>

      {!expanded && (
        <>
          {/* Divider */}
          <View className="mb-3 bg-border h-0.5" />

          <View className="flex flex-row items-center justify-between">
            <View
              style={[
                {
                  backgroundColor: statusConf.bg,
                  borderColor: statusConf.border,
                  borderWidth: 1,
                },
              ]}
              className={`sub-card-status`}
            >
              <Text
                className={`text-[12px] font-sans-medium`}
                style={[{ color: statusConf.text }]}
              >
                {statusConf.label}
              </Text>
            </View>

            <View className="items-end">
              <Text className="sub-renewal-label">Next charge</Text>
              <Text
                className={`sub-renewal-date ${urgent && "text-destructive!"}`}
              >
                {renewalLabel}
              </Text>
            </View>
          </View>
        </>
      )}

      {expanded && (
        <View className="">
          <View className="sub-details">
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Payment:</Text>
                <Text className="sub-value" numberOfLines={1}>
                  {paymentMethod?.trim() || fallback}
                </Text>
              </View>
            </View>

            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Category:</Text>
                <Text className="sub-value" numberOfLines={1}>
                  {category?.trim() || plan?.trim() || fallback}
                </Text>
              </View>
            </View>

            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Started:</Text>
                <Text className="sub-value" numberOfLines={1}>
                  {startDate ? formatSubscriptionDateTime(startDate) : fallback}
                </Text>
              </View>
            </View>

            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Renewal date:</Text>
                <Text className="sub-value" numberOfLines={1}>
                  {renewalDate
                    ? formatSubscriptionDateTime(renewalDate)
                    : fallback}
                </Text>
              </View>
            </View>

            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Status:</Text>
                <View
                  style={[
                    {
                      backgroundColor: statusConf.bg,
                      borderColor: statusConf.border,
                      borderWidth: 1,
                    },
                  ]}
                  className={`sub-card-status`}
                >
                  <Text
                    className={`text-[12px] font-sans-medium`}
                    style={[{ color: statusConf.text }]}
                    numberOfLines={1}
                  >
                    {status ? formatStatusLabel(status) : fallback}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default SubscriptionCard;
