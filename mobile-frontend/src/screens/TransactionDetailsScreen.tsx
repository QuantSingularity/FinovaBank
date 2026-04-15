import { type RouteProp, useRoute } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { getTransactionDetails } from "../services/api";
import { colors, commonStyles } from "../styles/commonStyles";

type TransactionDetailsRoute = RouteProp<
  RootStackParamList,
  "TransactionDetails"
>;

interface TransactionData {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "DEBIT" | "CREDIT";
  category?: string;
  merchantName?: string;
  reference?: string;
  status?: string;
  accountId?: string;
  fee?: number;
}

const Row = ({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={[styles.rowValue, highlight && styles.rowValueHighlight]}>
      {value}
    </Text>
  </View>
);

const TransactionDetailsScreen = () => {
  const route = useRoute<TransactionDetailsRoute>();
  const { transactionId, transaction: passedTx } = route.params;

  const [tx, setTx] = useState<TransactionData | null>(
    (passedTx as TransactionData) ?? null,
  );
  const [loading, setLoading] = useState(!passedTx);
  const [error, setError] = useState<string | null>(null);

  const fetchTx = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTransactionDetails(transactionId);
      setTx(res.data as TransactionData);
    } catch (e: unknown) {
      const err = e as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setError(
        err.response?.data?.message ??
          err.message ??
          "Failed to load transaction.",
      );
    } finally {
      setLoading(false);
    }
  }, [transactionId]);

  useEffect(() => {
    if (!passedTx) fetchTx();
  }, [passedTx, fetchTx]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={commonStyles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !tx) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={commonStyles.centerContent}>
          <Text style={{ fontSize: 36, marginBottom: 12 }}>⚠️</Text>
          <Text style={commonStyles.emptyStateTitle}>Unable to load</Text>
          <Text style={commonStyles.emptyStateSubtitle}>
            {error ?? "Transaction not found."}
          </Text>
          {error && (
            <TouchableOpacity
              style={[
                commonStyles.button,
                { marginTop: 20, paddingHorizontal: 32 },
              ]}
              onPress={fetchTx}
              activeOpacity={0.85}
            >
              <Text style={commonStyles.buttonText}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  const isCredit = tx.type === "CREDIT";
  const formattedAmount = `${isCredit ? "+" : "-"}$${Math.abs(
    tx.amount,
  ).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Amount hero ────────────────────────────────────────── */}
        <View
          style={[
            styles.amountCard,
            {
              backgroundColor: isCredit
                ? colors.successLight
                : colors.errorLight,
            },
          ]}
        >
          <View
            style={[
              styles.typeIcon,
              { backgroundColor: isCredit ? colors.success : colors.error },
            ]}
          >
            <Text style={styles.typeIconText}>{isCredit ? "↑" : "↓"}</Text>
          </View>
          <Text
            style={[
              styles.amountText,
              { color: isCredit ? colors.success : colors.error },
            ]}
          >
            {formattedAmount}
          </Text>
          <Text style={styles.amountDesc}>
            {tx.merchantName ?? tx.description}
          </Text>
          {tx.status && (
            <View
              style={[
                styles.statusPill,
                {
                  backgroundColor:
                    tx.status === "COMPLETED"
                      ? colors.successLight
                      : tx.status === "PENDING"
                        ? colors.warningLight
                        : colors.surface,
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      tx.status === "COMPLETED"
                        ? colors.success
                        : tx.status === "PENDING"
                          ? colors.warning
                          : colors.textSecondary,
                  },
                ]}
              >
                {tx.status}
              </Text>
            </View>
          )}
        </View>

        {/* ── Details card ───────────────────────────────────────── */}
        <View style={[commonStyles.card, styles.detailsCard]}>
          <Text style={commonStyles.sectionTitle}>Transaction Details</Text>

          <Row label="Date" value={formatDate(tx.date)} />
          <View style={commonStyles.divider} />
          <Row label="Type" value={tx.type} />
          <View style={commonStyles.divider} />
          <Row label="Description" value={tx.description} />

          {tx.merchantName && (
            <>
              <View style={commonStyles.divider} />
              <Row label="Merchant" value={tx.merchantName} />
            </>
          )}

          {tx.category && (
            <>
              <View style={commonStyles.divider} />
              <Row label="Category" value={tx.category} />
            </>
          )}

          {tx.reference && (
            <>
              <View style={commonStyles.divider} />
              <Row label="Reference" value={tx.reference} />
            </>
          )}

          {tx.fee !== undefined && tx.fee > 0 && (
            <>
              <View style={commonStyles.divider} />
              <Row label="Fee" value={`$${tx.fee.toFixed(2)}`} highlight />
            </>
          )}

          {tx.accountId && (
            <>
              <View style={commonStyles.divider} />
              <Row
                label="Account"
                value={`****${String(tx.accountId).slice(-4)}`}
              />
            </>
          )}

          <View style={commonStyles.divider} />
          <Row label="Transaction ID" value={tx.id} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 16, paddingBottom: 40 },

  amountCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  typeIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  typeIconText: { fontSize: 22, color: colors.white, fontWeight: "700" },
  amountText: {
    fontSize: 40,
    fontWeight: "700",
    letterSpacing: -1,
    marginBottom: 6,
  },
  amountDesc: { fontSize: 15, color: colors.textSecondary, marginBottom: 12 },
  statusPill: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  statusText: { fontSize: 13, fontWeight: "600" },

  detailsCard: { marginBottom: 16 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    gap: 12,
  },
  rowLabel: { fontSize: 13, color: colors.textSecondary, flex: 1 },
  rowValue: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
    flex: 2,
    textAlign: "right",
  },
  rowValueHighlight: { color: colors.error },
});

export default TransactionDetailsScreen;
