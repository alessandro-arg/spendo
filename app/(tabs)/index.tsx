import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import {
  HOME_BALANCE,
  HOME_SUBSCRIPTIONS,
  UPCOMING_SUBSCRIPTIONS,
} from "@/constants/data";
import images from "@/constants/images";
import "@/global.css";
import { formatCurrency } from "@/lib/utils";
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
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const { user } = useUser();
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const [cardSize, setCardSize] = useState({ width: 0, height: 0 });
  const [subscriptions, setSubscriptions] =
    useState<Subscription[]>(HOME_SUBSCRIPTIONS);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  const handleCreateSubscription = (subscription: Subscription) => {
    setSubscriptions((current) => [subscription, ...current]);
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

            <View
              className="home-balance-card"
              onLayout={(e) => {
                const { width, height } = e.nativeEvent.layout;
                setCardSize({ width, height });
              }}
            >
              <Svg
                pointerEvents="none"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: cardSize.width,
                  height: cardSize.height,
                }}
                width={cardSize.width}
                height={cardSize.height}
              >
                <Defs>
                  <RadialGradient
                    id="glow"
                    gradientUnits="userSpaceOnUse"
                    cx={cardSize.width * 1}
                    cy={cardSize.height * 0.0}
                    r={cardSize.width * 0.4}
                  >
                    <Stop offset="0%" stopColor="#60A5FA" stopOpacity="0.12" />
                    <Stop offset="35%" stopColor="#60A5FA" stopOpacity="0.08" />
                    <Stop offset="50%" stopColor="#60A5FA" stopOpacity="0.05" />
                    <Stop offset="70%" stopColor="#60A5FA" stopOpacity="0.03" />
                    <Stop offset="100%" stopColor="#60A5FA" stopOpacity="0" />
                  </RadialGradient>
                </Defs>

                <Rect
                  x="0"
                  y="0"
                  width={cardSize.width}
                  height={cardSize.height}
                  fill="url(#glow)"
                />
              </Svg>
              <Text className="home-balance-label">Balance</Text>
              <Text className="home-balance-amount">
                {formatCurrency(HOME_BALANCE.amount, HOME_BALANCE.currency)}
              </Text>
              <View className="items-end">
                <View className="items-start">
                  <Text className="home-balance-date-label">Next payment</Text>
                  <Text className="home-balance-date">
                    {dayjs(HOME_BALANCE.nextRenewalDate).format("DD/MM")}
                  </Text>
                </View>
              </View>
            </View>

            <View className="mb-5">
              <ListHeading title="Upcoming" />

              <FlatList
                data={UPCOMING_SUBSCRIPTIONS}
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
