import type { ImageSourcePropType } from "react-native";

declare global {
  type SubscriptionStatus = "active" | "paused" | "cancelled" | "trial";

  interface StatusConfigItem {
    label: string;
    bg: string;
    border: string;
    text: string;
  }

  type StatusConfig = Record<SubscriptionStatus, StatusConfigItem>;

  interface AppTab {
    name: string;
    title: string;
    icon: ImageSourcePropType;
  }

  interface TabIconProps {
    focused: boolean;
    icon: ImageSourcePropType;
  }

  interface Subscription {
    id: string;
    icon?: ImageSourcePropType;
    name: string;
    plan?: string;
    category?: string;
    paymentMethod?: string;
    status?: SubscriptionStatus;
    startDate?: string;
    price: number;
    currency?: string;
    billing: string;
    frequency?: string;
    renewalDate?: string;
    color?: string;
  }

  interface SubscriptionCardProps extends Omit<Subscription, "id"> {
    expanded: boolean;
    onPress: () => void;
    onCancelPress?: () => void;
    isCancelling?: boolean;
  }

  interface UpcomingSubscription {
    id: string;
    icon: ImageSourcePropType;
    name: string;
    price: number;
    currency?: string;
    daysLeft: number;
  }

  interface UpcomingSubscriptionCardProps extends Omit<
    UpcomingSubscription,
    "id"
  > {}

  interface ListHeadingProps {
    title: string;
  }
}

export {};
