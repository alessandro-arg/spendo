import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import { create } from "zustand";

interface SubscriptionStore {
  subscriptions: Subscription[];
  addSubscription: (subscription: Subscription) => void;
  updateSubscription: (id: string, subscription: Partial<Subscription>) => void;
  deleteSubscription: (id: string) => void;
}

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  subscriptions: HOME_SUBSCRIPTIONS,
  addSubscription: (subscription: Subscription) =>
    set((state) => ({
      subscriptions: [subscription, ...state.subscriptions],
    })),
  updateSubscription: (id: string, updates: Partial<Subscription>) =>
    set((state) => ({
      subscriptions: state.subscriptions.map((sub) =>
        sub.id === id ? { ...sub, ...updates } : sub
      ),
    })),
  deleteSubscription: (id: string) =>
    set((state) => ({
      subscriptions: state.subscriptions.filter((sub) => sub.id !== id),
    })),
}));
