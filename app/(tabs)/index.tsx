import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard, {
  getDaysUntil,
} from "@/components/UpcomingSubscriptionCard";
import { HOME_BALANCE, HOME_SUBSCRIPTIONS } from "@/constants/data";
import images from "@/constants/images";
import "@/global.css";
import { formatCurrency } from "@/lib/utils";
import { useSubscriptionStore } from "@/lib/SubscriptionContext";
import { useUser } from "@clerk/expo";
import { FontAwesome6 } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import {
  SafeAreaView as RNSafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const { user } = useUser();
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);
  const addSubscription = useSubscriptionStore(
    (state) => state.addSubscription
  );
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const [cardSize, setCardSize] = useState({ width: 0, height: 0 });
  const [isModalVisible, setIsModalVisible] = useState(false);

  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  const handleCreateSubscription = (subscription: Subscription) => {
    addSubscription(subscription);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <CreateSubscriptionModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onCreate={handleCreateSubscription}
      />
      <FlatList
        data={subscriptions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: tabBarHeight + insets.bottom - 20,
        }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListHeaderComponent={() => (
          <>
            <View className="home-header">
              <View className="home-user">
                <Image
                  source={
                    user?.imageUrl ? { uri: user.imageUrl } : images.avatar
                  }
                  className="home-avatar"
                />
                <View className="flex-1">
                  <Text className="home-user-time">Good morning,</Text>
                  <Text className="home-user-name">
                    {user?.firstName || user?.username || "User"}
                  </Text>
                </View>

                <Pressable
                  className="home-add-icon"
                  onPress={() => setIsModalVisible(true)}
                >
                  <FontAwesome6 name="add" size={18} />
                </Pressable>
              </View>
            </View>

            <View className="home-balance-card">
              {/* Decorative rings */}
              <Svg
                pointerEvents="none"
                style={{ position: "absolute", top: 0, right: 0 }}
                width={200}
                height={170}
              >
                <Circle
                  cx={180}
                  cy={20}
                  r={80}
                  stroke="#60A5FA"
                  strokeOpacity={0.07}
                  strokeWidth={1}
                  fill="none"
                />
                <Circle
                  cx={180}
                  cy={20}
                  r={55}
                  stroke="#60A5FA"
                  strokeOpacity={0.09}
                  strokeWidth={1}
                  fill="none"
                />
                <Circle
                  cx={180}
                  cy={20}
                  r={32}
                  stroke="#60A5FA"
                  strokeOpacity={0.12}
                  strokeWidth={0.5}
                  fill="none"
                />
                <Circle
                  cx={180}
                  cy={20}
                  r={6}
                  fill="#60A5FA"
                  fillOpacity={0.18}
                />
              </Svg>

              {/* Top: label + amount */}
              <View className="gap-1">
                <Text className="home-balance-label">Monthly spend</Text>
                <View className="flex-row items-baseline gap-1">
                  <Text className="text-sm font-sans-medium text-muted-foreground mb-0.5">
                    €
                  </Text>
                  <Text className="text-4xl font-sans-extrabold text-primary leading-none">
                    {Math.floor(HOME_BALANCE.amount)}
                  </Text>
                  <Text className="text-lg font-sans-semibold text-muted-foreground mb-0.5">
                    ,
                    {String(
                      Math.round((HOME_BALANCE.amount % 1) * 100),
                    ).padStart(2, "0")}
                  </Text>
                </View>
              </View>

              {/* Bottom: stats + next payment */}
              <View className="flex-row items-end justify-between">
                {/* Left stats */}
                <View className="flex-row gap-4">
                  <View className="gap-0.5">
                    <Text className="text-[11px] font-sans-medium text-muted">
                      Active subs
                    </Text>
                    <Text className="text-base font-sans-bold text-primary">
                      12
                    </Text>
                  </View>
                  <View className="w-px bg-border self-stretch" />
                  <View className="gap-0.5">
                    <Text className="text-[11px] font-sans-medium text-muted">
                      Yearly
                    </Text>
                    <Text className="text-base font-sans-bold text-primary">
                      {formatCurrency(
                        HOME_BALANCE.amount * 12,
                        HOME_BALANCE.currency,
                      )}
                    </Text>
                  </View>
                </View>

                {/* Right: next payment badge */}
                <View className="items-end gap-0.5">
                  <Text className="text-[11px] font-sans-medium text-muted">
                    Next payment
                  </Text>
                  <View
                    className="flex-row items-center gap-1.5 rounded-xl px-2.5 py-1 mt-1"
                    style={{
                      backgroundColor: "rgba(96,165,250,0.09)",
                      borderWidth: 0.5,
                      borderColor: "rgba(96,165,250,0.25)",
                    }}
                  >
                    <FontAwesome6
                      name="calendar-minus"
                      size={11}
                      color="#60A5FA"
                    />
                    <Text className="text-sm font-sans-bold text-accent">
                      {dayjs(HOME_BALANCE.nextRenewalDate).format("DD/MM")}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View className="mb-2">
              <ListHeading title="Upcoming" />

              <FlatList
                data={HOME_SUBSCRIPTIONS.filter((sub) => {
                  const days = getDaysUntil(sub.renewalDate ?? "");
                  return days >= 0 && days <= 10;
                }).sort(
                  (a, b) =>
                    getDaysUntil(a.renewalDate ?? "") -
                    getDaysUntil(b.renewalDate ?? ""),
                )}
                renderItem={({ item }) => (
                  <UpcomingSubscriptionCard {...item} />
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={
                  <Text className="home-empty-state">
                    No upcoming renewals yet.
                  </Text>
                }
              />
            </View>

            <ListHeading title="All Subscriptions" />
          </>
        )}
        ListEmptyComponent={
          <View className="empty-state">
            <Text className="empty-text">No subscriptions yet</Text>
          </View>
        }
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() =>
              setExpandedSubscriptionId((currentId) =>
                currentId === item.id ? null : item.id,
              )
            }
          />
        )}
        extraData={expandedSubscriptionId}
      />
    </SafeAreaView>
  );
}
