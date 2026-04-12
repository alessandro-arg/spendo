import { useClerk } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  bg: "#0F0F0F",
  surface: "#1A1A1A",
  surfaceLight: "#2A2A2A",
  text: "#F8FAFC",
  textSecondary: "#94A3B8",
  accent: "#4A90E2",
  accentLight: "#60A5FA",
  border: "#2D333F",
  error: "#EF4444",
};

const Settings = () => {
  const { signOut } = useClerk();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <Pressable
            style={({ pressed }) => [
              styles.settingItem,
              pressed && styles.settingItemPressed,
            ]}
            onPress={handleLogout}
          >
            <View style={styles.settingLeft}>
              <View style={styles.settingIconContainer}>
                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color={COLORS.error}
                />
              </View>
              <View>
                <Text style={styles.settingLabel}>Log Out</Text>
                <Text style={styles.settingDescription}>
                  Sign out of your account
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLORS.textSecondary}
            />
          </Pressable>
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Spendo v1.0.0</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 32,
    fontFamily: "sans-bold",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontFamily: "sans-semibold",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  settingItemPressed: {
    opacity: 0.7,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    fontFamily: "sans-semibold",
  },
  settingDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontFamily: "sans-regular",
  },
  footerContainer: {
    marginTop: "auto",
    alignItems: "center",
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: "sans-regular",
  },
});

export default Settings;
