import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import images from "@/constants/images";
import { useUser } from "@clerk/expo";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const CATEGORIES = ["All", "Design", "Developer Tools", "AI Tools"] as const;
type Category = (typeof CATEGORIES)[number];

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  active: { label: "Active", bg: "#10b98122", text: "#10b981" },
  paused: { label: "Paused", bg: "#f59e0b22", text: "#f59e0b" },
  cancelled: { label: "Cancelled", bg: "#ef444422", text: "#ef4444" },
  trial: { label: "Trial", bg: "#4a90e222", text: "#4a90e2" },
};

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

export default function SubscriptionsScreen() {
  const { user } = useUser();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!showSearch) {
      setSearch("");
    }
  }, [showSearch]);

  const filtered = useMemo(() => {
    return HOME_SUBSCRIPTIONS.filter((sub) => {
      const matchSearch =
        search.trim() === "" ||
        sub.name.toLowerCase().includes(search.toLowerCase());
      const matchCat =
        activeCategory === "All" || sub.category === activeCategory;
      return matchSearch && matchCat;
    });
  }, [search, activeCategory]);

  const activeCount = HOME_SUBSCRIPTIONS.filter(
    (s) => s.status === "active",
  ).length;

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
                <View style={styles.searchRow}>
                  <Ionicons name="search" color="#9ca3af" size={18} />
                  <TextInput
                    ref={searchInputRef}
                    style={styles.searchInput}
                    placeholder="Search subscriptions..."
                    className="placeholder:text-muted-foreground"
                    value={search}
                    onChangeText={setSearch}
                  />
                </View>

                <View style={styles.tabsWrapper}>
                  <FlatList
                    horizontal
                    data={CATEGORIES as unknown as Category[]}
                    keyExtractor={(item) => item}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabsContent}
                    renderItem={({ item }) => {
                      const isActive = item === activeCategory;
                      return (
                        <TouchableOpacity
                          onPress={() => setActiveCategory(item)}
                          style={[styles.tab, isActive && styles.tabActive]}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.tabText,
                              isActive && styles.tabTextActive,
                            ]}
                          >
                            {item}
                          </Text>
                        </TouchableOpacity>
                      );
                    }}
                  />
                </View>

                <View style={styles.sortRow}>
                  <Text style={styles.sortLabel}>
                    <FontAwesome5
                      name="sort-amount-down-alt"
                      size={12}
                      color="#9ca3af"
                    />{" "}
                    Sort by: <Text style={styles.sortValue}>Next Charge</Text>
                  </Text>
                </View>
              </>
            )}
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No subscriptions found</Text>
          </View>
        }
        renderItem={({ item }) => {
          const statusKey = item.status ?? "active";
          const statusConf =
            STATUS_CONFIG[statusKey] ?? STATUS_CONFIG["active"];
          const renewalLabel = item.renewalDate
            ? formatRenewalLabel(item.renewalDate)
            : "—";
          const urgent = item.renewalDate ? isUrgent(item.renewalDate) : false;

          return (
            <TouchableOpacity activeOpacity={0.85} style={styles.card}>
              {/* Top row */}
              <View style={styles.cardTop}>
                {/* Icon */}
                <View
                  style={[
                    styles.iconWrapper,
                    { backgroundColor: item.color ?? "#2a2a2a" },
                  ]}
                >
                  {item.icon ? (
                    <Image
                      source={item.icon}
                      style={styles.subIcon}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text style={styles.iconFallback}>
                      {item.name.charAt(0)}
                    </Text>
                  )}
                </View>

                {/* Name & category */}
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardCategory}>{item.category}</Text>
                </View>

                {/* Price */}
                <View style={styles.priceBlock}>
                  <Text style={styles.priceAmount}>
                    ${item.price.toFixed(2)}
                  </Text>
                  <Text style={styles.pricePeriod}>
                    {item.billing.toLowerCase()}
                  </Text>
                </View>
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Bottom row */}
              <View style={styles.cardBottom}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusConf.bg },
                  ]}
                >
                  <Text style={[styles.statusText, { color: statusConf.text }]}>
                    {statusConf.label}
                  </Text>
                </View>

                <View style={styles.renewalBlock}>
                  <Text style={styles.renewalLabel}>Next charge</Text>
                  <Text
                    style={[styles.renewalDate, urgent && styles.renewalUrgent]}
                  >
                    {renewalLabel}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontFamily: "sans-bold",
    fontSize: 22,
    color: "#f8fafc",
    letterSpacing: -0.3,
  },
  headerSub: {
    fontFamily: "sans-regular",
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 2,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 200,
    backgroundColor: "#1f1f1f",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#353535",
  },
  iconBtnText: {
    color: "#f8fafc",
    fontSize: 18,
  },

  /* Search */
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    backgroundColor: "#1f1f1f",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#353535",
    paddingHorizontal: 14,
    height: 44,
  },
  searchIcon: {
    color: "#656970",
    fontSize: 16,
    marginRight: 16,
  },
  searchInput: {
    flex: 1,
    fontFamily: "sans-regular",
    fontSize: 14,
    color: "#f8fafc",
    marginLeft: 10,
  },

  /* Category tabs */
  tabsWrapper: {
    marginBottom: 10,
  },
  tabsContent: {
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#1f1f1f",
    borderWidth: 1,
    borderColor: "#353535",
  },
  tabActive: {
    backgroundColor: "#f8fafc",
    borderColor: "#f8fafc",
  },
  tabText: {
    fontFamily: "sans-medium",
    fontSize: 13,
    color: "#9ca3af",
  },
  tabTextActive: {
    color: "#121212",
  },

  /* Sort row */
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    marginLeft: 6,
  },
  sortLabel: {
    fontFamily: "sans-regular",
    fontSize: 13,
    color: "#9ca3af",
  },
  sortValue: {
    fontFamily: "sans-medium",
    color: "#f8fafc",
  },
  selectMultiple: {
    fontFamily: "sans-medium",
    fontSize: 13,
    color: "#4a90e2",
  },

  /* Card */
  card: {
    backgroundColor: "#1f1f1f",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#353535",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  subIcon: {
    width: 26,
    height: 26,
  },
  iconFallback: {
    color: "#f8fafc",
    fontSize: 18,
    fontFamily: "sans-bold",
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontFamily: "sans-semibold",
    fontSize: 15,
    color: "#f8fafc",
    marginBottom: 2,
  },
  cardCategory: {
    fontFamily: "sans-regular",
    fontSize: 12,
    color: "#9ca3af",
  },
  priceBlock: {
    alignItems: "flex-end",
  },
  priceAmount: {
    fontFamily: "sans-bold",
    fontSize: 16,
    color: "#f8fafc",
  },
  pricePeriod: {
    fontFamily: "sans-regular",
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 1,
    textTransform: "capitalize",
  },

  divider: {
    height: 1,
    backgroundColor: "#353535",
    marginBottom: 12,
  },

  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontFamily: "sans-medium",
    fontSize: 12,
  },
  renewalBlock: {
    alignItems: "flex-end",
  },
  renewalLabel: {
    fontFamily: "sans-regular",
    fontSize: 11,
    color: "#9ca3af",
    marginBottom: 2,
  },
  renewalDate: {
    fontFamily: "sans-medium",
    fontSize: 13,
    color: "#f8fafc",
  },
  renewalUrgent: {
    color: "#ef4444",
  },

  emptyContainer: {
    paddingTop: 60,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: "sans-regular",
    fontSize: 14,
    color: "#656970",
  },
});
