import { HOME_BALANCE, HOME_USER } from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import "@/global.css";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { useState } from "react";
import { Image, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const [cardSize, setCardSize] = useState({ width: 0, height: 0 });

  return (
    <SafeAreaView className="flex-1 p-5 bg-background">
      <View className="home-header">
        <View className="home-user">
          <Image source={images.avatar} className="home-avatar" />
          <View className="flex-1 flex-col">
            <Text className="home-user-time">Good morning,</Text>
            <Text className="home-user-name">{HOME_USER.name}</Text>
          </View>

          <Image source={icons.add} className="home-add-icon" />
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
          {formatCurrency(HOME_BALANCE.amount)}
        </Text>
        <View className="items-end">
          <View className="items-start">
            <Text className="home-balance-date-lable">Next payment</Text>
            <Text className="home-balance-date">
              {dayjs(HOME_BALANCE.nextRenewalDate).format("DD/MM")}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
