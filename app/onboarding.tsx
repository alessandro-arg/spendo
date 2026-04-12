import { useAuth } from "@clerk/expo";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// ─── Colour tokens (dark mode — matches your design) ─────────────────────────
const C = {
  bg: "#121417",
  surface: "#1C1F26",
  surfaceElevated: "#22262F",
  accent: "#4A90E2",
  accentLight: "#60A5FA",
  textPrimary: "#F8FAFC",
  textSecondary: "#94A3B8",
  border: "#2D333F",
};

// ─── Wallet Icon (pure RN, no external icon lib needed) ──────────────────────
function WalletIcon() {
  return (
    <View style={styles.walletIconOuter}>
      {/* card body */}
      <View style={styles.walletCard}>
        {/* stripe */}
        <View style={styles.walletStripe} />
        {/* dot */}
        <View style={styles.walletDot} />
      </View>
    </View>
  );
}

// ─── Dot indicator ────────────────────────────────────────────────────────────
function Dots({ total = 3, active = 0 }) {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === active ? styles.dotActive : styles.dotInactive,
          ]}
        />
      ))}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
type OnboardingScreenProps = {
  navigation?: {
    navigate?: (route: string) => void;
  };
};

export default function OnboardingScreen({
  navigation,
}: OnboardingScreenProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  // Animations
  const cardAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const btnsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.spring(cardAnim, {
        toValue: 1,
        tension: 60,
        friction: 9,
        useNativeDriver: true,
      }),
      Animated.spring(contentAnim, {
        toValue: 1,
        tension: 60,
        friction: 9,
        useNativeDriver: true,
      }),
      Animated.spring(btnsAnim, {
        toValue: 1,
        tension: 60,
        friction: 9,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isLoaded, isSignedIn, cardAnim, contentAnim, btnsAnim]);

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  const fadeUp = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [24, 0],
        }),
      },
    ],
  });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* Skip */}
      <TouchableOpacity
        style={styles.skipBtn}
        onPress={() => router.push("/(tabs)")}
        activeOpacity={0.6}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* ── Hero card ── */}
      <Animated.View style={[styles.heroWrapper, fadeUp(cardAnim)]}>
        {/* subtle ambient glow behind card */}
        <View style={styles.glowRing} />

        <View style={styles.heroCard}>
          {/* inner gradient */}
          <LinearGradient
            colors={["#1C1F26", "#16191F"]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />

          {/* icon glow */}
          <View style={styles.iconGlowWrap}>
            <View style={styles.iconGlow} />
            <WalletIcon />
          </View>
        </View>
      </Animated.View>

      {/* ── Copy & dots ── */}
      <Animated.View style={[styles.copyBlock, fadeUp(contentAnim)]}>
        <Text style={styles.headline}>Master Your{"\n"}Balance</Text>
        <Text style={styles.body}>
          Track your net worth in real-time. See exactly where your money goes
          with AI-driven insights.
        </Text>
        <Dots total={3} active={0} />
      </Animated.View>

      {/* ── Buttons ── */}
      <Animated.View style={[styles.btnBlock, fadeUp(btnsAnim)]}>
        <TouchableOpacity
          style={styles.btnPrimary}
          activeOpacity={0.85}
          onPress={() => router.push("/(auth)/sign-up")}
        >
          <Text style={styles.btnPrimaryText}>Create Account →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnGhost}
          activeOpacity={0.7}
          onPress={() => router.push("/(auth)/sign-in")}
        >
          <Text style={styles.btnGhostText}>Log In</Text>
        </TouchableOpacity>

        <Text style={styles.legalText}>
          By continuing, you agree to our{" "}
          <Text style={styles.legalLink}>Terms</Text> and{" "}
          <Text style={styles.legalLink}>Privacy Policy</Text>.
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const CARD_SIZE = width * 0.72;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
    alignItems: "center",
    paddingHorizontal: 24,
  },

  // Skip
  skipBtn: {
    alignSelf: "flex-end",
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginTop: 4,
  },
  skipText: {
    fontFamily: "JetBrainsMono_500Medium",
    fontSize: 14,
    color: C.textSecondary,
    letterSpacing: 0.3,
  },

  // Hero
  heroWrapper: {
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
    width: CARD_SIZE,
    height: CARD_SIZE,
  },
  glowRing: {
    position: "absolute",
    width: CARD_SIZE + 40,
    height: CARD_SIZE + 40,
    borderRadius: 48,
    backgroundColor: "transparent",
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 48,
    elevation: 12,
  },
  heroCard: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 32,
    elevation: 20,
  },

  // Wallet icon
  iconGlowWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconGlow: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: C.accent,
    opacity: 0.12,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
  },
  walletIconOuter: {
    width: 72,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  walletCard: {
    width: 64,
    height: 52,
    backgroundColor: C.accent,
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: "flex-end",
    padding: 10,
  },
  walletStripe: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  walletDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignSelf: "flex-end",
  },

  // Copy
  copyBlock: {
    marginTop: 36,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  headline: {
    fontFamily: "JetBrainsMono_700Bold",
    fontSize: 32,
    color: C.textPrimary,
    textAlign: "center",
    lineHeight: 40,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  body: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 14,
    color: C.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    letterSpacing: 0.1,
    marginBottom: 24,
    maxWidth: 280,
  },

  // Dots
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: C.accentLight,
  },
  dotInactive: {
    width: 8,
    backgroundColor: C.border,
  },

  // Buttons
  btnBlock: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 12,
    alignItems: "stretch",
  },
  btnPrimary: {
    backgroundColor: C.textPrimary, // white/off-white — matches screenshot
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  btnPrimaryText: {
    fontFamily: "JetBrainsMono_600SemiBold",
    fontSize: 15,
    color: C.bg,
    letterSpacing: 0.2,
  },
  btnGhost: {
    backgroundColor: C.surface,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  btnGhostText: {
    fontFamily: "JetBrainsMono_600SemiBold",
    fontSize: 15,
    color: C.textPrimary,
    letterSpacing: 0.2,
  },
  legalText: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 11,
    color: C.textSecondary,
    textAlign: "center",
    lineHeight: 17,
    marginTop: 4,
  },
  legalLink: {
    color: C.accentLight,
    textDecorationLine: "underline",
  },
});
