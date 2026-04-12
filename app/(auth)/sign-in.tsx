import { useSignIn } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { type Href, Link, useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  bg: "#0F0F0F",
  surface: "#1A1A1A",
  surfaceLight: "#2A2A2A",
  accent: "#4A90E2",
  accentLight: "#60A5FA",
  text: "#F8FAFC",
  textSecondary: "#94A3B8",
  border: "#2D333F",
  borderFocused: "#4A90E2",
  error: "#EF4444",
  glow: "rgba(74, 144, 226, 0.08)",
  glowMid: "rgba(74, 144, 226, 0.12)",
};

const validateEmail = (email: string): string | null => {
  if (!email) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  return null;
};

const validatePassword = (password: string): string | null => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  return null;
};

export default function SignInPage() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [emailFocused, setEmailFocused] = React.useState(false);
  const [passwordFocused, setPasswordFocused] = React.useState(false);
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [passwordError, setPasswordError] = React.useState<string | null>(null);

  const handleEmailBlur = () => {
    setEmailFocused(false);
    const error = validateEmail(email);
    setEmailError(error);
  };

  const handlePasswordBlur = () => {
    setPasswordFocused(false);
    const error = validatePassword(password);
    setPasswordError(error);
  };

  const handleSubmit = async () => {
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    setEmailError(emailErr);
    setPasswordError(passwordErr);

    if (emailErr || passwordErr) {
      return;
    }

    const { error } = await signIn.password({
      emailAddress: email,
      password,
    });
    if (error) {
      console.error(JSON.stringify(error, null, 2));
      if (error.code === "form_identifier_not_found") {
        setEmailError("Email not found. Please sign up first.");
      } else if (error.code === "form_password_incorrect") {
        setPasswordError("Incorrect password. Please try again.");
      }
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            console.log(session?.currentTask);
            return;
          }

          const url = decorateUrl("/");
          if (url.startsWith("http")) {
            Linking.openURL(url);
          } else {
            router.push(url as Href);
          }
        },
      });
    } else if (signIn.status === "needs_second_factor") {
      Alert.alert("MFA Required", "Please complete two-factor authentication.");
    } else if (signIn.status === "needs_client_trust") {
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        (factor) => factor.strategy === "email_code",
      );

      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode();
      }
    } else {
      console.error("Sign-in attempt not complete:", signIn);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* ── Header ── */}
            <View style={styles.header}>
              {/* Wallet icon with multi-layer glow */}
              <View style={styles.iconContainer}>
                {/* Outer ambient glow */}
                <View style={styles.outerGlow} />
                {/* Mid glow ring */}
                <View style={styles.midGlow} />
                {/* Icon tile */}
                <View style={styles.icon}>
                  <Ionicons name="wallet" size={36} color={COLORS.accent} />
                </View>
              </View>

              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>
                Log in to continue managing your subscriptions
              </Text>
            </View>

            {/* ── Form ── */}
            <View style={styles.form}>
              {/* Email */}
              <View>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      borderColor: emailError
                        ? COLORS.error
                        : emailFocused
                          ? COLORS.borderFocused
                          : COLORS.border,
                    },
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    placeholderTextColor={COLORS.textSecondary}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setEmailError(null);
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={handleEmailBlur}
                  />
                </View>
                {emailError && (
                  <Text style={styles.fieldError}>{emailError}</Text>
                )}
              </View>

              {/* Password */}
              <View>
                <View
                  style={[
                    styles.passwordContainer,
                    {
                      borderColor: passwordError
                        ? COLORS.error
                        : passwordFocused
                          ? COLORS.borderFocused
                          : COLORS.border,
                    },
                  ]}
                >
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Password"
                    placeholderTextColor={COLORS.textSecondary}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setPasswordError(null);
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={handlePasswordBlur}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color={COLORS.textSecondary}
                    />
                  </Pressable>
                </View>
                {passwordError && (
                  <Text style={styles.fieldError}>{passwordError}</Text>
                )}
              </View>

              {/* Forgot Password */}
              <Pressable style={styles.forgotButton}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </Pressable>

              {/* Error Messages */}
              {errors.fields.identifier && (
                <Text style={styles.error}>
                  {errors.fields.identifier.message}
                </Text>
              )}
              {errors.fields.password && (
                <Text style={styles.error}>
                  {errors.fields.password.message}
                </Text>
              )}
            </View>

            {/* ── Primary CTA ── */}
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                (!email || !password || fetchStatus === "fetching") &&
                  styles.buttonDisabled,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleSubmit}
              disabled={!email || !password || fetchStatus === "fetching"}
            >
              <Text style={styles.primaryButtonText}>
                {fetchStatus === "fetching" ? "Logging in..." : "Log In"}
              </Text>
            </Pressable>

            {/* ── Divider ── */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* ── Social Buttons ── */}
            <View style={styles.socialButtons}>
              <Pressable style={styles.socialButton}>
                <Text style={styles.googleText}>G</Text>
              </Pressable>

              <Pressable style={styles.socialButton}>
                <Ionicons name="logo-apple" size={22} color={COLORS.text} />
              </Pressable>
            </View>

            {/* ── Sign Up Footer ── */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Link href="/(auth)/sign-up" asChild>
                <Pressable>
                  <Text style={styles.footerLink}>Sign Up</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 40,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  outerGlow: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.glow,
  },
  midGlow: {
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.glowMid,
  },
  icon: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(74, 144, 226, 0.3)",
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
    textAlign: "center",
    fontFamily: "sans-bold",
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    fontFamily: "sans-regular",
  },
  form: {
    gap: 16,
    marginBottom: 8,
  },
  inputContainer: {
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  input: {
    color: COLORS.text,
    fontSize: 16,
    paddingVertical: 16,
    fontFamily: "sans-regular",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
    paddingVertical: 16,
    fontFamily: "sans-regular",
  },
  eyeButton: {
    paddingLeft: 8,
  },
  forgotButton: {
    alignSelf: "flex-end",
  },
  forgotText: {
    color: COLORS.accent,
    fontSize: 14,
    fontFamily: "sans-medium",
  },
  error: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: -8,
  },
  fieldError: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
    fontFamily: "sans-regular",
  },
  primaryButton: {
    backgroundColor: COLORS.accentLight,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
  },
  primaryButtonText: {
    color: COLORS.bg,
    fontSize: 16,
    fontFamily: "sans-semibold",
    letterSpacing: 0.3,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 32,
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: "sans-regular",
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  socialButton: {
    width: 64,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  googleText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    lineHeight: 22,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: "sans-regular",
  },
  footerLink: {
    color: COLORS.accent,
    fontSize: 14,
    fontFamily: "sans-semibold",
  },
});
