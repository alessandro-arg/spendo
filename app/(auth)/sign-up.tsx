import { useAuth, useSignUp } from "@clerk/expo";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { type Href, Link, useRouter } from "expo-router";
import { styled } from "nativewind";
import React from "react";
import {
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
import CodeVerification from "./code-verification";

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
  const [nameFocused, setNameFocused] = React.useState(false);
  const [emailFocused, setEmailFocused] = React.useState(false);
  const [passwordFocused, setPasswordFocused] = React.useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] =
    React.useState(false);
  const [code, setCode] = React.useState("");
  const [codeInputFocused, setCodeInputFocused] = React.useState(false);
  const [agreedToTerms, setAgreedToTerms] = React.useState(false);

  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [passwordError, setPasswordError] = React.useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = React.useState<
    string | null
  >(null);
  const [termsError, setTermsError] = React.useState<string | null>(null);
  const [showVerification, setShowVerification] = React.useState(false);

  const isDisabled =
    !emailAddress ||
    !password ||
    !confirmPassword ||
    !agreedToTerms ||
    fetchStatus === "fetching";

  React.useEffect(() => {
    if (signUp.status === "complete" || isSignedIn) {
      setShowVerification(false);
    }
  }, [signUp.status, isSignedIn]);

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
      firstName: fullName.split(" ")[0] || undefined,
      lastName: fullName.split(" ").slice(1).join(" ") || undefined,
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

    if (!error) {
      await signUp.verifications.sendEmailCode();
      setShowVerification(true);
    }
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

  if (showVerification) {
    return (
      <CodeVerification
        signUp={signUp}
        emailAddress={emailAddress}
        code={code}
        setCode={setCode}
        codeInputFocused={codeInputFocused}
        setCodeInputFocused={setCodeInputFocused}
        errors={errors}
        fetchStatus={fetchStatus}
        handleVerify={handleVerify}
        onGoBack={async () => {
          setShowVerification(false);
          setCode("");
          setCodeInputFocused(false);
        }}
      />
    );
  }

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
                color="white"
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
                  <Ionicons name="person-add" size={34} color="#4a90e2" />
                </View>
              </View>

              <Text className="auth-title">Create Account</Text>
              <Text className="auth-subtitle">
                Join us to start managing your subscriptions
              </Text>
            </View>

            <View className="auth-form">
              <View>
                <View
                  className={`auth-input-container ${
                    nameFocused ? "border-accent!" : "border-border"
                  }`}
                >
                  <TextInput
                    className="auth-input"
                    placeholder="Full Name (Optional)"
                    value={fullName}
                    onChangeText={setFullName}
                    onFocus={() => setNameFocused(true)}
                    onBlur={() => setNameFocused(false)}
                    autoCapitalize="words"
                  />
                </View>
                <View className="h-6" />
              </View>

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
                    value={emailAddress}
                    onChangeText={(text) => {
                      setEmailAddress(text);
                      setEmailError(null);
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
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="off"
                    textContentType="none"
                    importantForAutofill="no"
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

              <View>
                <View
                  className={`auth-password-container ${
                    confirmPasswordError
                      ? "border-destructive!"
                      : confirmPasswordFocused
                        ? "border-accent!"
                        : "border-border"
                  }`}
                >
                  <TextInput
                    className={`flex-1 auth-input`}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      setConfirmPasswordError(null);
                    }}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="off"
                    textContentType="none"
                    importantForAutofill="no"
                    onFocus={() => setConfirmPasswordFocused(true)}
                    onBlur={handleConfirmPasswordBlur}
                  />
                  <Pressable
                    className="auth-eye"
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <MaterialCommunityIcons
                      name={
                        showConfirmPassword ? "eye-outline" : "eye-off-outline"
                      }
                      size={20}
                      color="#9ca3af"
                    />
                  </Pressable>
                </View>
                <View className="h-6">
                  {confirmPasswordError && (
                    <Text className="auth-error">{confirmPasswordError}</Text>
                  )}
                </View>
              </View>

              <View className="terms-container">
                <View>
                  <Pressable
                    className={`terms-checkbox-box ${
                      agreedToTerms && "terms-checkbox-box-agreed"
                    }`}
                    onPress={() => {
                      setAgreedToTerms(!agreedToTerms);
                      setTermsError(null);
                    }}
                  >
                    {agreedToTerms && (
                      <MaterialCommunityIcons
                        name="check"
                        size={16}
                        color="#121212"
                      />
                    )}
                  </Pressable>
                </View>
                <Text className="terms-text">
                  I agree to the{" "}
                  <Link href="/" asChild>
                    <Text className="terms-link">Terms of Service</Text>
                  </Link>{" "}
                  and{" "}
                  <Link href="/" asChild>
                    <Text className="terms-link">Privacy Policy</Text>
                  </Link>
                  .
                </Text>
              </View>
              {termsError && <Text className="auth-error">{termsError}</Text>}

              <Pressable
                className={`auth-button mt-4 ${isDisabled && "bg-btn-primary-bg/50!"}`}
                onPress={handleSubmit}
                disabled={isDisabled}
              >
                <Text className="auth-button-text">
                  {fetchStatus === "fetching"
                    ? "Creating Account..."
                    : "Create Account"}
                </Text>
              </Pressable>
            </View>

            <View className="auth-footer-row">
              <Text className="auth-footer-text">
                Already have an account?{" "}
              </Text>
              <Link href="/(auth)/sign-in" asChild>
                <Pressable>
                  <Text className="auth-footer-link">Sign In</Text>
                </Pressable>
              </Link>
            </View>

            <View nativeID="clerk-captcha" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
