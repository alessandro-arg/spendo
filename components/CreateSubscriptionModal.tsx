import { icons } from "@/constants/icons";
import { FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons";
import clsx from "clsx";
import dayjs from "dayjs";
import { usePostHog } from "posthog-react-native";
import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const categoryOptions = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
] as const;

const currencyOptions = [
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "CHF", label: "CHF (Fr)" },
] as const;

const billingCycleOptions = [
  { value: "Monthly", label: "Monthly" },
  { value: "Yearly", label: "Yearly" },
  { value: "Half-Yearly", label: "Half-Yearly" },
] as const;

const categoryColors: Record<string, string> = {
  Entertainment: "#7c6cf0",
  "AI Tools": "#38bdf8",
  "Developer Tools": "#f97316",
  Design: "#ec4899",
  Productivity: "#22c55e",
  Cloud: "#60a5fa",
  Music: "#f59e0b",
  Other: "#a1a1aa",
};

export type CreateSubscriptionModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreate: (subscription: Subscription) => void;
};

const CreateSubscriptionModal = ({
  visible,
  onClose,
  onCreate,
}: CreateSubscriptionModalProps) => {
  const insets = useSafeAreaInsets();
  const [serviceName, setServiceName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<string>("EUR");
  const [category, setCategory] = useState<string>("");
  const [billing, setBilling] = useState<string>("Monthly");
  const [nextChargeDate, setNextChargeDate] = useState("");
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);

  const posthog = usePostHog();

  const resetForm = () => {
    setServiceName("");
    setAmount("");
    setCurrency("EUR");
    setCategory("");
    setBilling("Monthly");
    setNextChargeDate("");
    setShowCurrencyPicker(false);
    setShowCategoryPicker(false);
    setNameError(null);
    setAmountError(null);
  };

  const selectedCategoryColor = useMemo(
    () => categoryColors[category] ?? "#60a5fa80",
    [category],
  );

  const selectedCurrencyLabel = useMemo(
    () => currencyOptions.find((c) => c.value === currency)?.label ?? "EUR (€)",
    [currency],
  );

  const handleSubmit = () => {
    const cleanedAmount = parseFloat(amount.replace(/,/g, "."));

    let hasError = false;
    if (!serviceName.trim()) {
      setNameError("Name is required");
      hasError = true;
    } else {
      setNameError(null);
    }

    if (Number.isNaN(cleanedAmount) || cleanedAmount <= 0) {
      setAmountError("Please enter a positive amount");
      hasError = true;
    } else {
      setAmountError(null);
    }

    if (hasError) {
      return;
    }

    const startDate = dayjs().toISOString();
    const renewalDate = dayjs(startDate)
      .add(
        billing === "Yearly" ? 1 : billing === "Half-Yearly" ? 6 : 1,
        billing === "Yearly" ? "year" : "month",
      )
      .toISOString();

    const subscription: Subscription = {
      id: `${serviceName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
      icon: icons.layer_group,
      name: serviceName.trim(),
      price: cleanedAmount,
      currency,
      billing,
      category,
      status: "active",
      startDate,
      renewalDate,
      color: selectedCategoryColor,
    };

    onCreate(subscription);

    posthog.capture("subscription_created", {
      subscription_name: subscription.name,
      subscription_price: subscription.price,
      subscription_billing: subscription.billing,
    });

    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="modal-overlay">
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.modalContentWrap}>
          <View className="csm-container">
            {/* Header */}
            <View className="csm-header">
              <Pressable className="csm-back-btn" onPress={onClose}>
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={20}
                  color="white"
                />
              </Pressable>
              <Text className="csm-header-title">Add Subscription</Text>
              <View style={styles.headerSpacer} />
            </View>

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              keyboardDismissMode="on-drag"
            >
              {/* Service Name */}
              <View className="csm-field">
                <Text className="csm-label">SERVICE NAME</Text>
                <View
                  className={clsx(
                    "csm-input-row",
                    nameError && "csm-input-error",
                  )}
                >
                  <View className="csm-service-icon-wrap">
                    <FontAwesome6 name="icons" size={14} color="#9ca3af90" />
                  </View>
                  <TextInput
                    className="csm-input flex-1"
                    placeholder="e.g. Netflix, Spotify"
                    value={serviceName}
                    onChangeText={(t) => {
                      setServiceName(t);
                      setNameError(null);
                    }}
                    onSubmitEditing={handleSubmit}
                  />
                </View>
                {nameError && <Text className="auth-error">{nameError}</Text>}
              </View>

              {/* Amount + Currency */}
              <View className="csm-row-fields">
                <View className="csm-field flex-1">
                  <Text className="csm-label">AMOUNT</Text>
                  <View
                    className={clsx(
                      "csm-input-row",
                      amountError && "csm-input-error",
                    )}
                  >
                    <TextInput
                      className="csm-input flex-1"
                      placeholder="0,00"
                      value={amount}
                      onChangeText={(t) => {
                        setAmount(t);
                        setAmountError(null);
                      }}
                      keyboardType="decimal-pad"
                      returnKeyType="done"
                    />
                  </View>
                  {amountError && (
                    <Text className="auth-error">{amountError}</Text>
                  )}
                </View>

                <View className="csm-field" style={styles.currencyField}>
                  <Text className="csm-label">CURRENCY</Text>
                  <Pressable
                    className="csm-input-row csm-picker-row"
                    onPress={() => {
                      setShowCurrencyPicker((v) => !v);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <Text className="csm-input">{selectedCurrencyLabel}</Text>
                    <MaterialCommunityIcons
                      name="chevron-down"
                      size={18}
                      color="#9ca3af"
                    />
                  </Pressable>
                  {showCurrencyPicker && (
                    <View className="csm-dropdown">
                      {currencyOptions.map((opt) => (
                        <Pressable
                          key={opt.value}
                          className={clsx(
                            "csm-dropdown-item",
                            currency === opt.value &&
                              "csm-dropdown-item-active",
                          )}
                          onPress={() => {
                            setCurrency(opt.value);
                            setShowCurrencyPicker(false);
                          }}
                        >
                          <Text
                            className={clsx(
                              "csm-dropdown-text",
                              currency === opt.value &&
                                "csm-dropdown-text-active",
                            )}
                          >
                            {opt.label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              {/* Category */}
              <View className="csm-field">
                <Text className="csm-label">CATEGORY</Text>
                <Pressable
                  className="csm-input-row csm-picker-row"
                  onPress={() => {
                    setShowCategoryPicker((v) => !v);
                    setShowCurrencyPicker(false);
                  }}
                >
                  <Text
                    className={clsx(
                      "csm-input flex-1",
                      !category && "csm-placeholder",
                    )}
                  >
                    {category || "Select Category"}
                  </Text>
                  <MaterialCommunityIcons
                    name="chevron-down"
                    size={18}
                    color="#9ca3af"
                  />
                </Pressable>
                {showCategoryPicker && (
                  <View className="csm-dropdown">
                    {categoryOptions.map((opt) => (
                      <Pressable
                        key={opt}
                        className={clsx(
                          "csm-dropdown-item",
                          category === opt && "csm-dropdown-item-active",
                        )}
                        onPress={() => {
                          setCategory(opt);
                          setShowCategoryPicker(false);
                        }}
                      >
                        <View
                          className="csm-category-dot"
                          style={{ backgroundColor: categoryColors[opt] }}
                        />
                        <Text
                          className={clsx(
                            "csm-dropdown-text",
                            category === opt && "csm-dropdown-text-active",
                          )}
                        >
                          {opt}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>

              <View className="csm-divider" />

              {/* Billing Cycle */}
              <View className="csm-field">
                <Text className="csm-label">BILLING CYCLE</Text>
                <View className="csm-billing-row">
                  {billingCycleOptions.map((opt) => (
                    <Pressable
                      key={opt.value}
                      className={clsx(
                        "csm-billing-option",
                        billing === opt.value && "csm-billing-option-active",
                      )}
                      onPress={() => setBilling(opt.value)}
                    >
                      <Text
                        className={clsx(
                          "csm-billing-text",
                          billing === opt.value && "csm-billing-text-active",
                        )}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Next Charge Date */}
              <View className="csm-field">
                <Text className="csm-label">NEXT CHARGE DATE</Text>
                <View className="csm-input-row csm-picker-row">
                  <TextInput
                    className="csm-input flex-1 placeholder:text-primary"
                    placeholder="mm/dd/yyyy"
                    value={nextChargeDate}
                    onChangeText={setNextChargeDate}
                    keyboardType="numbers-and-punctuation"
                  />
                  <MaterialCommunityIcons
                    name="calendar-outline"
                    size={18}
                    color="#9ca3af"
                  />
                </View>
              </View>

              <View className="csm-divider" />

              {/* Spacer for bottom bar */}
              <View style={{ height: 100 }} />
            </ScrollView>

            {/* Fixed bottom actions */}
            <View
              className="csm-actions"
              style={{ paddingBottom: insets.bottom }}
            >
              <Pressable
                className="csm-delete-btn"
                onPress={() => {
                  resetForm();
                  onClose();
                }}
              >
                <FontAwesome6 name="trash-can" size={16} color="#ef4444" />
              </Pressable>
              <Pressable className="csm-save-btn flex-1" onPress={handleSubmit}>
                <Text className="csm-save-text">Save Subscription</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContentWrap: {
    flex: 1,
    justifyContent: "flex-end",
  },
  headerSpacer: {
    width: 36,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  currencyField: {
    width: 155,
    flexShrink: 0,
  },
});

export default CreateSubscriptionModal;
