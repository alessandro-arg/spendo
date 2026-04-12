import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

interface CodeVerificationProps {
  signUp: any;
  emailAddress: string;
  code: string;
  setCode: (code: string) => void;
  codeInputFocused: boolean;
  setCodeInputFocused: (focused: boolean) => void;
  errors: any;
  fetchStatus: string;
  handleVerify: () => Promise<void>;
  onGoBack: () => Promise<void>;
}

export default function CodeVerification({
  signUp,
  emailAddress,
  code,
  setCode,
  codeInputFocused,
  setCodeInputFocused,
  errors,
  fetchStatus,
  handleVerify,
  onGoBack,
}: CodeVerificationProps) {
  const router = useRouter();

  const handleBackPress = async () => {
    await onGoBack();
    router.back();
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
          <View className="auth-code-content">
            <Pressable className="auth-arrow-back" onPress={handleBackPress}>
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
                  codeInputFocused ? "border-accent!" : "border-border"
                }`}
              >
                <TextInput
                  className="auth-input"
                  value={code}
                  placeholder="Verification code"
                  onChangeText={(code) => setCode(code)}
                  onFocus={() => setCodeInputFocused(true)}
                  keyboardType="numeric"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="off"
                  textContentType="oneTimeCode"
                  importantForAutofill="yes"
                  contextMenuHidden={false}
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
                  {fetchStatus === "fetching" ? "Verifying..." : "Verify Email"}
                </Text>
              </Pressable>
            </View>

            <View className="auth-footer-row">
              <Text className="auth-footer-text">Didn't receive a code? </Text>
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
