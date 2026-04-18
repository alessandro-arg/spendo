import { tabs } from "@/constants/data";
import { colors, components } from "@/constants/theme";
import { useAuth } from "@clerk/expo";
import { clsx } from "clsx";
import { Redirect, Tabs } from "expo-router";
import { Image, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const tabBar = components.tabBar;

const TabLayout = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const insets = useSafeAreaInsets();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  const bottomOffset = Math.max(insets.bottom, tabBar.horizontalInset);

  const TabIcon = ({ focused, icon }: TabIconProps) => (
    <View className="tabs-icon">
      <View className={clsx("tabs-pill", focused && "tabs-active")}>
        <Image source={icon} resizeMode="contain" className="tabs-glyph" />
      </View>
    </View>
  );

  return (
    <>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: tabBar.height + bottomOffset - 30,
          backgroundColor: colors.background,
          zIndex: 1,
        }}
      />

      <Tabs
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: "#121212" },
          tabBarShowLabel: false,
          tabBarStyle: {
            position: "absolute",
            bottom: bottomOffset,
            height: tabBar.height,
            marginHorizontal: tabBar.horizontalInset,
            borderRadius: tabBar.radius,
            borderColor: colors.border,
            borderTopColor: colors.border,
            borderTopWidth: 2,
            borderWidth: 2,
            backgroundColor: colors.card,
            elevation: 0,
            zIndex: 2,
          },
          tabBarItemStyle: {
            paddingVertical: tabBar.height / 2 - tabBar.iconFrame / 1.6,
          },
          tabBarIconStyle: {
            width: tabBar.iconFrame,
            height: tabBar.iconFrame,
            alignItems: "center",
          },
        }}
      >
        {tabs.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
              tabBarIcon: ({ focused }) => (
                <TabIcon focused={focused} icon={tab.icon} />
              ),
            }}
          />
        ))}
      </Tabs>
    </>
  );
};

export default TabLayout;
