import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import type { TabParamList } from "../navigation/AppNavigator";
import { applyForLoan, getAccountLoans, getLoanTypes } from "../services/api";
import { colors, commonStyles } from "../styles/commonStyles";

type LoansRoute = RouteProp<TabParamList, "Loans">;

interface Loan {
  id: string;
  type: string;
  amount: number;
  interestRate: number;
  term: number;
  monthlyPayment: number;
  remainingBalance: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "ACTIVE" | "PAID";
  appliedDate: string;
  approvalDate?: string;
}

interface LoanType {
  id: string;
  name: string;
  maxAmount: number;
  baseRate: number;
}

const statusConfig = (s: Loan["status"]) => {
  switch (s) {
    case "APPROVED":
    case "ACTIVE":
      return {
        color: colors.success,
        bg: colors.successLight,
        label: s === "ACTIVE" ? "Active" : "Approved",
      };
    case "PENDING":
      return {
        color: colors.warning,
        bg: colors.warningLight,
        label: "Pending",
      };
    case "REJECTED":
      return { color: colors.error, bg: colors.errorLight, label: "Rejected" };
    case "PAID":
      return { color: colors.textSecondary, bg: colors.surface, label: "Paid" };
    default:
      return { color: colors.textSecondary, bg: colors.surface, label: s };
  }
};

type Screen = "list" | "apply";

const LoansScreen = () => {
  const route = useRoute<LoansRoute>();
  const { userData } = useAuth();
  const accountId = route.params?.accountId ?? userData?.id ?? "";

  const [loans, setLoans] = useState<Loan[]>([]);
  const [loanTypes, setLoanTypes] = useState<LoanType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>("list");
  const [selectedType, setSelectedType] = useState("");
  const [amount, setAmount] = useState("");
  const [term, setTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchData = useCallback(
    async (isRefreshing = false) => {
      if (!accountId) {
        setLoading(false);
        setError("No account ID.");
        return;
      }
      if (!isRefreshing) setLoading(true);
      setError(null);
      try {
        const [loansRes, typesRes] = await Promise.all([
          getAccountLoans(accountId),
          getLoanTypes(),
        ]);
        setLoans(Array.isArray(loansRes.data) ? loansRes.data : []);
        setLoanTypes(Array.isArray(typesRes.data) ? typesRes.data : []);
      } catch (e: unknown) {
        const err = e as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        setError(
          err.response?.data?.message ?? err.message ?? "Failed to load loans.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accountId],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(true);
  };

  const handleApply = async () => {
    setFormError("");
    if (!selectedType) {
      setFormError("Please select a loan type.");
      return;
    }
    const amountNum = Number(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setFormError("Please enter a valid amount.");
      return;
    }
    const termNum = Number(term);
    if (!term || isNaN(termNum) || termNum <= 0 || !Number.isInteger(termNum)) {
      setFormError("Please enter a valid term (whole months).");
      return;
    }

    // Validate against selected loan type limits
    const selectedLoanType = loanTypes.find((t) => t.id === selectedType);
    if (selectedLoanType && amountNum > selectedLoanType.maxAmount) {
      setFormError(
        `Maximum amount for this loan type is $${selectedLoanType.maxAmount.toLocaleString()}.`,
      );
      return;
    }

    setSubmitting(true);
    try {
      await applyForLoan({
        accountId,
        loanTypeId: selectedType,
        amount: amountNum,
        term: termNum,
      });
      Alert.alert(
        "Application Submitted",
        "Your loan application has been submitted for review.",
        [{ text: "OK" }],
      );
      setScreen("list");
      setAmount("");
      setTerm("");
      setSelectedType("");
      fetchData();
    } catch (e: unknown) {
      const err = e as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setFormError(
        err.response?.data?.message ??
          err.message ??
          "Failed to submit application.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const totalBalance = loans
    .filter((l) => ["ACTIVE", "APPROVED"].includes(l.status))
    .reduce((s, l) => s + l.remainingBalance, 0);

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={commonStyles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading loans...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Apply screen ─────────────────────────────────────────────────────────
  if (screen === "apply") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.applyScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setScreen("list")}
            activeOpacity={0.7}
          >
            <Text style={styles.backBtnText}>← Back to Loans</Text>
          </TouchableOpacity>

          <Text style={styles.applyTitle}>Apply for a Loan</Text>
          <Text style={styles.applySub}>
            Choose your loan type and fill in the details below.
          </Text>

          {formError ? (
            <View style={commonStyles.errorContainer}>
              <Text style={commonStyles.errorText}>{formError}</Text>
            </View>
          ) : null}

          <Text style={styles.applyLabel}>Loan Type</Text>
          {loanTypes.length === 0 ? (
            <Text style={styles.noTypesText}>
              No loan types available at this time.
            </Text>
          ) : (
            <View style={styles.typeGrid}>
              {loanTypes.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={[
                    styles.typeCard,
                    selectedType === t.id && styles.typeCardActive,
                  ]}
                  onPress={() => setSelectedType(t.id)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.typeName,
                      selectedType === t.id && styles.typeNameActive,
                    ]}
                  >
                    {t.name}
                  </Text>
                  <Text
                    style={[
                      styles.typeRate,
                      selectedType === t.id && styles.typeRateActive,
                    ]}
                  >
                    From {t.baseRate}%
                  </Text>
                  <Text
                    style={[
                      styles.typeMax,
                      selectedType === t.id && styles.typeMaxActive,
                    ]}
                  >
                    Up to ${t.maxAmount.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.applyLabel}>Loan Amount ($)</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="e.g. 10000"
            placeholderTextColor={colors.textTertiary}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            editable={!submitting}
          />

          <Text style={styles.applyLabel}>Term (months)</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="e.g. 36"
            placeholderTextColor={colors.textTertiary}
            value={term}
            onChangeText={setTerm}
            keyboardType="numeric"
            editable={!submitting}
          />

          {/* Estimated monthly payment hint */}
          {selectedType &&
            amount &&
            term &&
            !isNaN(Number(amount)) &&
            !isNaN(Number(term)) &&
            (() => {
              const lt = loanTypes.find((t) => t.id === selectedType);
              if (!lt) return null;
              const r = lt.baseRate / 100 / 12;
              const n = Number(term);
              const p = Number(amount);
              const monthly =
                r === 0
                  ? p / n
                  : (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
              if (isNaN(monthly) || !isFinite(monthly)) return null;
              return (
                <View style={styles.estimateBox}>
                  <Text style={styles.estimateLabel}>
                    Estimated monthly payment
                  </Text>
                  <Text style={styles.estimateValue}>
                    ${monthly.toFixed(2)}/mo
                  </Text>
                </View>
              );
            })()}

          <View style={styles.applyBtnRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setScreen("list")}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.btnDisabled]}
              onPress={handleApply}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={commonStyles.buttonText}>Submit Application</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── List screen ──────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.summaryBanner}>
        <View>
          <Text style={styles.summaryLabel}>Active Loan Balance</Text>
          <Text style={styles.summaryValue}>
            $
            {totalBalance.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.applyHeroBtn}
          onPress={() => setScreen("apply")}
          activeOpacity={0.85}
        >
          <Text style={styles.applyHeroBtnText}>+ Apply</Text>
        </TouchableOpacity>
        <View style={styles.decor1} />
        <View style={styles.decor2} />
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>⚠ {error}</Text>
        </View>
      ) : null}

      {loans.length === 0 ? (
        <View style={commonStyles.emptyStateContainer}>
          <Text style={styles.emptyEmoji}>🏦</Text>
          <Text style={commonStyles.emptyStateTitle}>No loans yet</Text>
          <Text style={commonStyles.emptyStateSubtitle}>
            Apply for a loan to get started.
          </Text>
          <TouchableOpacity
            style={styles.emptyApplyBtn}
            onPress={() => setScreen("apply")}
            activeOpacity={0.85}
          >
            <Text style={commonStyles.buttonText}>Apply for a Loan</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={loans}
          keyExtractor={(l) => l.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          renderItem={({ item }) => {
            const sc = statusConfig(item.status);
            return (
              <View style={styles.loanCard}>
                <View style={styles.loanCardTop}>
                  <View>
                    <Text style={styles.loanType}>{item.type}</Text>
                    <Text style={styles.loanDate}>
                      Applied{" "}
                      {new Date(item.appliedDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: sc.bg }]}>
                    <Text style={[styles.statusPillText, { color: sc.color }]}>
                      {sc.label}
                    </Text>
                  </View>
                </View>
                <View style={commonStyles.divider} />
                <View style={styles.loanStatsRow}>
                  {[
                    {
                      label: "Amount",
                      value: `$${item.amount.toLocaleString()}`,
                    },
                    { label: "Rate", value: `${item.interestRate}%` },
                    {
                      label: "Monthly",
                      value: `$${item.monthlyPayment.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                      })}`,
                    },
                  ].map((s) => (
                    <View key={s.label} style={styles.loanStat}>
                      <Text style={styles.loanStatLabel}>{s.label}</Text>
                      <Text style={styles.loanStatValue}>{s.value}</Text>
                    </View>
                  ))}
                </View>
                {["ACTIVE", "APPROVED"].includes(item.status) && (
                  <View style={styles.progressWrap}>
                    <View style={commonStyles.spaceBetween}>
                      <Text style={styles.progressLabel}>Remaining</Text>
                      <Text style={styles.progressValue}>
                        $
                        {item.remainingBalance.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </Text>
                    </View>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.max(
                              5,
                              100 - (item.remainingBalance / item.amount) * 100,
                            )}%` as any,
                          },
                        ]}
                      />
                    </View>
                  </View>
                )}
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  summaryBanner: {
    backgroundColor: colors.gradientStart,
    paddingHorizontal: 22,
    paddingVertical: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
    position: "relative",
  },
  summaryLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
    fontWeight: "500",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.white,
    letterSpacing: -0.8,
  },
  applyHeroBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    zIndex: 1,
  },
  applyHeroBtnText: { fontSize: 14, color: colors.white, fontWeight: "700" },
  decor1: {
    position: "absolute",
    right: -40,
    top: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  decor2: {
    position: "absolute",
    right: 60,
    bottom: -60,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  errorBanner: {
    backgroundColor: colors.errorLight,
    margin: 16,
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  errorBannerText: { color: colors.error, fontSize: 13 },

  listContent: { padding: 16, flexGrow: 1 },
  loanCard: {
    backgroundColor: colors.backgroundWhite,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  loanCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  loanType: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 3,
  },
  loanDate: { fontSize: 12, color: colors.textSecondary },
  statusPill: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusPillText: { fontSize: 12, fontWeight: "600" },
  loanStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  loanStat: { alignItems: "center" },
  loanStatLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 3 },
  loanStatValue: { fontSize: 15, fontWeight: "700", color: colors.textPrimary },
  progressWrap: { marginTop: 8 },
  progressLabel: { fontSize: 12, color: colors.textSecondary },
  progressValue: { fontSize: 13, fontWeight: "600", color: colors.textPrimary },
  progressTrack: {
    height: 6,
    backgroundColor: colors.surface,
    borderRadius: 3,
    marginTop: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 3,
  },

  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyApplyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 20,
  },

  // Apply form
  backBtn: { marginBottom: 20 },
  backBtnText: { fontSize: 14, color: colors.primary, fontWeight: "500" },
  applyScroll: { padding: 20, paddingBottom: 40 },
  applyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  applySub: { fontSize: 14, color: colors.textSecondary, marginBottom: 24 },
  applyLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  noTypesText: { fontSize: 14, color: colors.textSecondary, marginBottom: 16 },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  typeCard: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    minWidth: "45%",
    flex: 1,
  },
  typeCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  typeName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 3,
  },
  typeNameActive: { color: colors.primary },
  typeRate: { fontSize: 13, color: colors.textSecondary, marginBottom: 2 },
  typeRateActive: { color: colors.primaryDark },
  typeMax: { fontSize: 12, color: colors.textTertiary },
  typeMaxActive: { color: colors.primary },
  estimateBox: {
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  estimateLabel: { fontSize: 13, color: colors.primary, fontWeight: "500" },
  estimateValue: { fontSize: 18, fontWeight: "700", color: colors.primary },
  applyBtnRow: { flexDirection: "row", gap: 10, marginTop: 8 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  submitBtn: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.6 },
  loadingText: { marginTop: 12, fontSize: 15, color: colors.textSecondary },
});

export default LoansScreen;
