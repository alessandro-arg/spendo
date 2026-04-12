import "@/global.css";
import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

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

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <StatusBar backgroundColor="#121212" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#121212" },
        }}
      />
    </ClerkProvider>
  );
}
