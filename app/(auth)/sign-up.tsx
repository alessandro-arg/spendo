import { useAuth, useSignUp } from "@clerk/expo";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { type Href, Link, useRouter } from "expo-router";
import { styled } from "nativewind";
import React from "react";
import {
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

import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const COLORS = {
  bg: "#0F0F0F",
  surface: "#1A1A1A",
  surfaceLight: "#2A2A2A",
  accent: "#4A90E2",
  accentLight: "#60A5FA",
  text: "#F8FAFC",
  textSecondary: "#94A3B8",
  border: "#2D333F",
  error: "#EF4444",
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
  if (!/[A-Z]/.test(password))
    return "Password must contain at least one uppercase letter";
  if (!/[0-9]/.test(password))
    return "Password must contain at least one number";
  return null;
};

const validatePasswordMatch = (
  password: string,
  confirm: string,
): string | null => {
  if (!confirm) return "Please confirm your password";
  if (password !== confirm) return "Passwords do not match";
  return null;
};

export default function SignUpPage() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = React.useState("");
  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [inputFocused, setInputFocused] = React.useState(false);
  const [agreedToTerms, setAgreedToTerms] = React.useState(false);

  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [passwordError, setPasswordError] = React.useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = React.useState<
    string | null
  >(null);
  const [termsError, setTermsError] = React.useState<string | null>(null);

  const handleEmailBlur = () => {
    const error = validateEmail(emailAddress);
    setEmailError(error);
  };

  const handlePasswordBlur = () => {
    const error = validatePassword(password);
    setPasswordError(error);
  };

  const handleConfirmPasswordBlur = () => {
    const error = validatePasswordMatch(password, confirmPassword);
    setConfirmPasswordError(error);
  };

  const handleSubmit = async () => {
    const emailErr = validateEmail(emailAddress);
    const passwordErr = validatePassword(password);
    const confirmErr = validatePasswordMatch(password, confirmPassword);
    let termsErr: string | null = null;

    setEmailError(emailErr);
    setPasswordError(passwordErr);
    setConfirmPasswordError(confirmErr);

    if (!agreedToTerms) {
      termsErr = "You must agree to the Terms of Service and Privacy Policy";
      setTermsError(termsErr);
    } else {
      setTermsError(null);
    }

    if (emailErr || passwordErr || confirmErr || termsErr) {
      return;
    }

    const { error } = await signUp.password({
      emailAddress,
      password,
    });
    if (error) {
      console.error(JSON.stringify(error, null, 2));
      if (error.code === "form_identifier_exists") {
        setEmailError("An account with this email already exists");
      } else if (error.message) {
        setEmailError(error.message);
      }
      return;
    }

    if (!error) await signUp.verifications.sendEmailCode();
  };

  const handleVerify = async () => {
    await signUp.verifications.verifyEmailCode({
      code,
    });
    if (signUp.status === "complete") {
      await signUp.finalize({
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
    } else {
      console.error("Sign-up attempt not complete:", signUp);
    }
  };

  if (signUp.status === "complete" || isSignedIn) {
    return null;
  }

  if (
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0
  ) {
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
            <View className="auth-code-content">
              <Pressable
                className="auth-arrow-back"
                onPress={() => router.back()}
              >
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={24}
                  color={COLORS.text}
                />
              </Pressable>

              <View className="auth-header">
                <View className="auth-icon-container">
                  <View
                    className="auth-icon"
                    style={{
                      shadowColor: "#4a90e2",
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.3,
                      shadowRadius: 15,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="email-check"
                      size={34}
                      color="#4a90e2"
                    />
                  </View>
                </View>

                <Text className="auth-title">Verify your email</Text>
                <Text className="auth-subtitle">
                  We've sent a verification code to {emailAddress}
                </Text>
              </View>

              <View className="auth-form">
                <View
                  className={`auth-input-container ${
                    inputFocused ? "border-accent!" : "border-border"
                  }`}
                >
                  <TextInput
                    className="auth-input"
                    value={code}
                    placeholder="Verification code"
                    onChangeText={(code) => setCode(code)}
                    onFocus={() => setInputFocused(true)}
                    keyboardType="numeric"
                  />
                </View>
                <View className="h-4">
                  {errors.fields.code && (
                    <Text className="auth-error">
                      {errors.fields.code.message}
                    </Text>
                  )}
                </View>

                <Pressable
                  className={`auth-button ${
                    fetchStatus === "fetching" ||
                    (!code && "bg-btn-primary-bg/50!")
                  }`}
                  onPress={handleVerify}
                  disabled={fetchStatus === "fetching" || !code}
                >
                  <Text className="auth-button-text">
                    {fetchStatus === "fetching"
                      ? "Verifying..."
                      : "Verify Email"}
                  </Text>
                </Pressable>
              </View>

              <View className="auth-footer-row">
                <Text className="auth-footer-text">
                  Didn't receive a code?{" "}
                </Text>
                <Pressable onPress={() => signUp.verifications.sendEmailCode()}>
                  <Text className="auth-footer-link">Resend</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <MaterialCommunityIcons
          name="arrow-left"
          size={24}
          color={COLORS.text}
        />
      </Pressable>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconContainer}>
          <View style={styles.icon}>
            <MaterialCommunityIcons
              name="account-plus"
              size={32}
              color={COLORS.accent}
            />
          </View>
        </View>

        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join us to start tracking</Text>

        <View style={styles.formSection}>
          <TextInput
            style={styles.input}
            placeholder="Full Name (Optional)"
            placeholderTextColor={COLORS.textSecondary}
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />

          <View>
            <TextInput
              style={[
                styles.input,
                emailError && { borderColor: COLORS.error, borderWidth: 1 },
              ]}
              placeholder="Email Address"
              placeholderTextColor={COLORS.textSecondary}
              value={emailAddress}
              onChangeText={(text) => {
                setEmailAddress(text);
                setEmailError(null);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              onBlur={handleEmailBlur}
            />
            {emailError && <Text style={styles.fieldError}>{emailError}</Text>}
          </View>

          <View>
            <View
              style={[
                styles.passwordContainer,
                passwordError && { borderColor: COLORS.error },
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
                onBlur={handlePasswordBlur}
              />
              <Pressable
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <MaterialCommunityIcons
                  name={showPassword ? "eye" : "eye-off"}
                  size={20}
                  color={COLORS.textSecondary}
                />
              </Pressable>
            </View>
            {passwordError && (
              <Text style={styles.fieldError}>{passwordError}</Text>
            )}
          </View>

          <View>
            <View
              style={[
                styles.passwordContainer,
                confirmPasswordError && { borderColor: COLORS.error },
              ]}
            >
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm Password"
                placeholderTextColor={COLORS.textSecondary}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setConfirmPasswordError(null);
                }}
                secureTextEntry={!showConfirmPassword}
                onBlur={handleConfirmPasswordBlur}
              />
              <Pressable
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <MaterialCommunityIcons
                  name={showConfirmPassword ? "eye" : "eye-off"}
                  size={20}
                  color={COLORS.textSecondary}
                />
              </Pressable>
            </View>
            {confirmPasswordError && (
              <Text style={styles.fieldError}>{confirmPasswordError}</Text>
            )}
          </View>

          <View style={styles.termsContainer}>
            <View style={styles.checkbox}>
              <Pressable
                style={[
                  styles.checkboxBox,
                  agreedToTerms && styles.checkboxBoxChecked,
                ]}
                onPress={() => {
                  setAgreedToTerms(!agreedToTerms);
                  setTermsError(null);
                }}
              >
                {agreedToTerms && (
                  <MaterialCommunityIcons
                    name="check"
                    size={14}
                    color={COLORS.text}
                  />
                )}
              </Pressable>
            </View>
            <Text style={styles.termsText}>
              I agree to the{" "}
              <Link href="/" asChild>
                <Pressable>
                  <Text style={styles.termsLink}>Terms of Service</Text>
                </Pressable>
              </Link>{" "}
              and{" "}
              <Link href="/" asChild>
                <Pressable>
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Pressable>
              </Link>
              .
            </Text>
          </View>
          {termsError && <Text style={styles.fieldError}>{termsError}</Text>}

          <Pressable
            style={({ pressed }) => [
              styles.button,
              (!emailAddress ||
                !password ||
                !confirmPassword ||
                !agreedToTerms ||
                fetchStatus === "fetching") &&
                styles.buttonDisabled,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleSubmit}
            disabled={
              !emailAddress ||
              !password ||
              !confirmPassword ||
              !agreedToTerms ||
              fetchStatus === "fetching"
            }
          >
            <Text style={styles.buttonText}>
              {fetchStatus === "fetching"
                ? "Creating Account..."
                : "Create Account"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.signinContainer}>
          <Text style={styles.signinText}>Already have an account? </Text>
          <Link href="/(auth)/sign-in" asChild>
            <Pressable>
              <Text style={styles.signinLink}>Log In</Text>
            </Pressable>
          </Link>
        </View>

        <View nativeID="clerk-captcha" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  icon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 32,
    textAlign: "center",
  },
  formSection: {
    marginBottom: 24,
    gap: 16,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: COLORS.text,
    fontSize: 14,
    fontFamily: "sans-regular",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: COLORS.text,
    fontSize: 14,
    fontFamily: "sans-regular",
  },
  eyeButton: {
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginVertical: 8,
  },
  checkbox: {
    paddingTop: 2,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxBoxChecked: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  termsText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  termsLink: {
    color: COLORS.accent,
    textDecorationLine: "underline",
  },
  error: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: -12,
  },
  fieldError: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
    fontFamily: "sans-regular",
  },
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: COLORS.text,
    fontWeight: "700",
    fontSize: 16,
  },
  signinContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signinText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  signinLink: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: "600",
  },
  linkButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  linkButtonText: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: "500",
  },
});
