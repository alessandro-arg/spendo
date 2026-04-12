import { useSignIn } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { type Href, Link, useRouter } from "expo-router";
import { styled } from "nativewind";
import React from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

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
  const [hasSubmitted, setHasSubmitted] = React.useState(false);
  const isDisabled = !email || !password || fetchStatus === "fetching";

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
    setHasSubmitted(true);

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
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="grow"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="auth-content">
            {/* ── Header ── */}
            <View className="auth-header">
              {/* Wallet icon with multi-layer glow */}
              <View className="auth-icon-container">
                {/* Icon tile */}
                <View
                  className="auth-icon"
                  style={{
                    shadowColor: "#4a90e2",
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.3,
                    shadowRadius: 15,
                  }}
                >
                  <Ionicons name="wallet" size={34} color="#4a90e2" />
                </View>
              </View>

              <Text className="auth-title">Welcome Back</Text>
              <Text className="auth-subtitle">
                Log in to track your subscriptions
              </Text>
            </View>

            {/* ── Form ── */}
            <View className="auth-form">
              {/* Email */}
              <View>
                <View
                  className={`auth-input-container ${
                    emailError
                      ? "border-destructive!"
                      : emailFocused
                        ? "border-accent!"
                        : "border-border"
                  }`}
                >
                  <TextInput
                    className="auth-input"
                    placeholder="Email Address"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setEmailError(null);
                      setHasSubmitted(false);
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="off"
                    textContentType="none"
                    importantForAutofill="no"
                    onFocus={() => setEmailFocused(true)}
                    onBlur={handleEmailBlur}
                  />
                </View>
                <View className="h-6">
                  {emailError && (
                    <Text className="auth-error">{emailError}</Text>
                  )}
                </View>
              </View>

              {/* Password */}
              <View>
                <View
                  className={`auth-password-container ${
                    passwordError
                      ? "border-destructive!"
                      : passwordFocused
                        ? "border-accent!"
                        : "border-border"
                  }`}
                >
                  <TextInput
                    className={`flex-1 auth-input`}
                    placeholder="Password"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setPasswordError(null);
                      setHasSubmitted(false);
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="off"
                    textContentType="none"
                    importantForAutofill="no"
                    style={{ backgroundColor: "transparent", color: "white" }}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={handlePasswordBlur}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    className="auth-eye"
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color="#9ca3af"
                    />
                  </Pressable>
                </View>
                <View className="h-6">
                  {passwordError && (
                    <Text className="auth-error">{passwordError}</Text>
                  )}
                </View>
              </View>

              {/* Errors */}
              {hasSubmitted && !isDisabled && (
                <View>
                  {errors.fields.identifier && (
                    <Text className="auth-error">
                      {errors.fields.identifier.message}
                    </Text>
                  )}
                  {errors.fields.password && (
                    <Text className="auth-error">
                      {errors.fields.password.message}
                    </Text>
                  )}
                </View>
              )}

              {/* Forgot Password */}
              {/* <Pressable style={styles.forgotButton}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </Pressable> */}
            </View>

            {/* ── Primary CTA ── */}
            <Pressable
              className={`auth-button ${isDisabled && "bg-btn-primary-bg/50!"}`}
              onPress={handleSubmit}
              disabled={isDisabled}
            >
              <Text className="auth-button-text">
                {fetchStatus === "fetching" ? "Logging in..." : "Log In"}
              </Text>
            </Pressable>

            {/* ── Divider ── */}
            <View className="auth-divider-row">
              <View className="auth-divider-line" />
              <Text className="auth-divider-text">Or continue with</Text>
              <View className="auth-divider-line" />
            </View>

            {/* ── Social Buttons ── */}
            <View className="auth-social-buttons">
              <Pressable className="auth-social-btn">
                <Ionicons name="logo-google" size={26} color="white" />
              </Pressable>

              <Pressable className="auth-social-btn">
                <Ionicons name="logo-apple" size={28} color="white" />
              </Pressable>
            </View>

            {/* ── Sign Up Footer ── */}
            <View className="auth-footer-row">
              <Text className="auth-footer-text">Don't have an account? </Text>
              <Link href="/(auth)/sign-up" asChild>
                <Pressable>
                  <Text className="auth-footer-link">Sign Up</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
