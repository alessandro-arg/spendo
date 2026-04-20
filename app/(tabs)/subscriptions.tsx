import SubscriptionCard from "@/components/SubscriptionCard";
import { CATEGORIES, Category } from "@/constants/categories";
import images from "@/constants/images";
import { useSubscriptionStore } from "@/lib/SubscriptionContext";
import { useUser } from "@clerk/expo";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import clsx from "clsx";
import { styled } from "nativewind";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView as RNSafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function SubscriptionsScreen() {
  const { user } = useUser();
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef<TextInput>(null);
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);

  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!showSearch) {
      setSearch("");
    }
  }, [showSearch]);

  const filtered = useMemo(() => {
    return subscriptions.filter((sub) => {
      const matchSearch =
        search.trim() === "" ||
        sub.name.toLowerCase().includes(search.toLowerCase());
      const matchCat =
        activeCategory === "All" || sub.category === activeCategory;
      return matchSearch && matchCat;
    });
  }, [search, activeCategory, subscriptions]);

  const activeCount = subscriptions.filter((s) => s.status === "active").length;

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: tabBarHeight + insets.bottom - 20,
        }}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListHeaderComponent={
          <>
            <View className="home-header">
              <View className="flex-row items-center py-5 pb-2">
                <Image
                  source={
                    user?.imageUrl ? { uri: user.imageUrl } : images.avatar
                  }
                  className="home-avatar"
                />

                <View className="flex-1">
                  <Text className="home-user-name">All Subscriptions</Text>
                  <Text className="home-user-time">{activeCount} Active</Text>
                </View>

                <TouchableOpacity
                  onPress={() => setShowSearch(!showSearch)}
                  className="search-button-icon"
                >
                  <Ionicons name="search" color="white" size={18} />
                </TouchableOpacity>
              </View>
            </View>

            {showSearch && (
              <>
                <View className="search-row">
                  <Ionicons name="search" color="#9ca3af" size={18} />
                  <TextInput
                    ref={searchInputRef}
                    placeholder="Search subscriptions..."
                    className="search-input"
                    value={search}
                    onChangeText={setSearch}
                  />
                </View>

                <View className="tabs-wrapper">
                  <FlatList
                    horizontal
                    data={CATEGORIES as unknown as Category[]}
                    keyExtractor={(item) => item}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 8 }}
                    renderItem={({ item }) => {
                      const isActive = item === activeCategory;
                      return (
                        <TouchableOpacity
                          onPress={() => setActiveCategory(item)}
                          className={clsx(
                            "search-tab",
                            isActive && "search-tab-active",
                          )}
                          activeOpacity={0.8}
                        >
                          <Text
                            className={clsx(
                              "search-tab-text",
                              isActive && "search-tab-text-active",
                            )}
                          >
                            {item}
                          </Text>
                        </TouchableOpacity>
                      );
                    }}
                  />
                </View>

                <View className="sort-row">
                  <Text className="sort-label">
                    <FontAwesome5
                      name="sort-amount-down-alt"
                      size={12}
                      color="#9ca3af"
                    />{" "}
                    Sort by: <Text className="sort-value">Next Charge</Text>
                  </Text>
                </View>
              </>
            )}
          </>
        }
        ListEmptyComponent={
          <View className="empty-state">
            <Text className="empty-text">No subscriptions found</Text>
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
      />
    </SafeAreaView>
  );
}
