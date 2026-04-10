import "@/global.css";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "sans-regular": require("../assets/fonts/JetBrainsMono-Regular.ttf"),
    "sans-bold": require("../assets/fonts/JetBrainsMono-Bold.ttf"),
    "sans-medium": require("../assets/fonts/JetBrainsMono-Medium.ttf"),
    "sans-semibold": require("../assets/fonts/JetBrainsMono-SemiBold.ttf"),
    "sans-extrabold": require("../assets/fonts/JetBrainsMono-ExtraBold.ttf"),
    "sans-light": require("../assets/fonts/JetBrainsMono-Light.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}
