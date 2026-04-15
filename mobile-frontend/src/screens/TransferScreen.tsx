import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { createTransaction } from "../services/api";
import { colors, commonStyles } from "../styles/commonStyles";

type TransferRoute = RouteProp<RootStackParamList, "Transfer">;

type TransferType = "internal" | "external" | "bill";

const TRANSFER_TYPES: {
  id: TransferType;
  label: string;
  icon: string;
  desc: string;
}[] = [
  {
    id: "internal",
    label: "Between Accounts",
    icon: "🔄",
    desc: "Move money between your accounts",
  },
  {
    id: "external",
    label: "To Someone",
    icon: "👤",
    desc: "Send to another person or account",
  },
  {
    id: "bill",
    label: "Pay a Bill",
    icon: "📄",
    desc: "Pay utilities, subscriptions, etc.",
  },
];

const TransferScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<TransferRoute>();
  const accountId = route.params?.accountId ?? "";

  const [transferType, setTransferType] = useState<TransferType>("internal");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleTransfer = async () => {
    setError("");
    const amt = Number(amount);
    if (!amount || isNaN(amt) || amt <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if (!recipient.trim()) {
      setError("Please enter a recipient or destination.");
      return;
    }

    setSubmitting(true);
    try {
      await createTransaction({
        accountId,
        type: "DEBIT",
        amount: amt,
        description: note.trim() || `Transfer to ${recipient.trim()}`,
        recipient: recipient.trim(),
        transferType,
      });
      Alert.alert(
        "Transfer Submitted",
        `$${amt.toFixed(2)} transfer has been submitted successfully.`,
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (e: unknown) {
      const err = e as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setError(
        err.response?.data?.message ??
          err.message ??
          "Transfer failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Transfer type ──────────────────────────────────── */}
          <Text style={commonStyles.sectionTitle}>Transfer Type</Text>
          <View style={styles.typeRow}>
            {TRANSFER_TYPES.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.typeCard,
                  transferType === t.id && styles.typeCardActive,
                ]}
                onPress={() => setTransferType(t.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.typeIcon}>{t.icon}</Text>
                <Text
                  style={[
                    styles.typeLabel,
                    transferType === t.id && styles.typeLabelActive,
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.typeDesc}>
            {TRANSFER_TYPES.find((t) => t.id === transferType)?.desc}
          </Text>

          {error ? (
            <View style={commonStyles.errorContainer}>
              <Text style={commonStyles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* ── Amount ────────────────────────────────────────── */}
          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>Amount</Text>
            <View style={styles.amountRow}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor={colors.textTertiary}
                keyboardType="decimal-pad"
                editable={!submitting}
              />
            </View>

            {/* Quick amounts */}
            <View style={styles.quickAmounts}>
              {["50", "100", "250", "500"].map((a) => (
                <TouchableOpacity
                  key={a}
                  style={styles.quickAmtBtn}
                  onPress={() => setAmount(a)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickAmtText}>${a}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── Recipient ─────────────────────────────────────── */}
          <Text style={styles.fieldLabel}>
            {transferType === "internal"
              ? "Destination Account Number"
              : transferType === "external"
              ? "Recipient Name or Account"
              : "Biller / Company Name"}
          </Text>
          <TextInput
            style={commonStyles.input}
            value={recipient}
            onChangeText={setRecipient}
            placeholder={
              transferType === "internal"
                ? "e.g. 1234567890"
                : transferType === "external"
                ? "e.g. John Smith"
                : "e.g. Electric Company"
            }
            placeholderTextColor={colors.textTertiary}
            editable={!submitting}
            autoCapitalize={transferType === "internal" ? "none" : "words"}
          />

          {/* ── Note ──────────────────────────────────────────── */}
          <Text style={styles.fieldLabel}>Note (optional)</Text>
          <TextInput
            style={[commonStyles.input, styles.noteInput]}
            value={note}
            onChangeText={setNote}
            placeholder="Add a note..."
            placeholderTextColor={colors.textTertiary}
            editable={!submitting}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          {/* ── Submit ────────────────────────────────────────── */}
          <TouchableOpacity
            style={[commonStyles.button, submitting && styles.btnDisabled]}
            onPress={handleTransfer}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={commonStyles.buttonText}>Send Transfer</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Transfers are typically processed within 1–3 business days.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.backgroundWhite },
  flex: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },

  typeRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  typeCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    backgroundColor: colors.backgroundWhite,
  },
  typeCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  typeIcon: { fontSize: 22, marginBottom: 4 },
  typeLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textSecondary,
    textAlign: "center",
  },
  typeLabelActive: { color: colors.primary },
  typeDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 20,
    marginTop: 4,
  },

  amountCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  amountLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "500",
    marginBottom: 8,
  },
  amountRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  currencySymbol: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.textPrimary,
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: 36,
    fontWeight: "700",
    color: colors.textPrimary,
    padding: 0,
  },
  quickAmounts: { flexDirection: "row", gap: 8 },
  quickAmtBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.backgroundWhite,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickAmtText: { fontSize: 13, fontWeight: "600", color: colors.primary },

  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  noteInput: { height: 80, paddingTop: 12 },

  btnDisabled: { opacity: 0.6 },
  disclaimer: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 18,
  },
});

export default TransferScreen;
