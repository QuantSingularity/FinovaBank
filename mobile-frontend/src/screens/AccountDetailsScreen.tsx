import {
  type RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { getAccountDetails } from "../services/api";
import { colors, commonStyles } from "../styles/commonStyles";

type AccountDetailsRoute = RouteProp<RootStackParamList, "AccountDetails">;
type AccountDetailsNav = NativeStackNavigationProp<
  RootStackParamList,
  "AccountDetails"
>;

interface AccountDetailsData {
  accountId: string;
  name: string;
  email: string;
  balance: number;
  accountType: string;
  accountNumber: string;
  routingNumber?: string;
  openDate: string;
  status: "ACTIVE" | "INACTIVE" | "FROZEN" | "CLOSED";
  interestRate?: number;
  lastUpdated: string;
  currency?: string;
}

const statusConfig = (s: string) => {
  switch (s) {
    case "ACTIVE":
      return {
        color: colors.success,
        bg: colors.successLight,
        label: "Active",
      };
    case "INACTIVE":
      return {
        color: colors.warning,
        bg: colors.warningLight,
        label: "Inactive",
      };
    case "FROZEN":
      return { color: colors.error, bg: colors.errorLight, label: "Frozen" };
    case "CLOSED":
      return {
        color: colors.textSecondary,
        bg: colors.surface,
        label: "Closed",
      };
    default:
      return { color: colors.textSecondary, bg: colors.surface, label: s };
  }
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const AccountDetailsScreen = () => {
  const route = useRoute<AccountDetailsRoute>();
  const navigation = useNavigation<AccountDetailsNav>();
  const { userData } = useAuth();
  const accountId = route.params?.accountId ?? userData?.id ?? "";

  const [account, setAccount] = useState<AccountDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccount = useCallback(
    async (isRefreshing = false) => {
      if (!accountId) {
        setLoading(false);
        setError("No account ID provided.");
        return;
      }
      if (!isRefreshing) setLoading(true);
      setError(null);
      try {
        const res = await getAccountDetails(accountId);
        setAccount(res.data as AccountDetailsData);
      } catch (e: unknown) {
        const err = e as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        setError(
          err.response?.data?.message ??
            err.message ??
            "Failed to load account."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accountId]
  );

  useEffect(() => {
    fetchAccount();
  }, [fetchAccount]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAccount(true);
  };

  const handleCopyAccountNumber = () => {
    Alert.alert("Account Number", account?.accountNumber ?? "", [
      { text: "OK" },
    ]);
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={commonStyles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !account) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={commonStyles.centerContent}>
          <Text style={{ fontSize: 36, marginBottom: 12 }}>⚠️</Text>
          <Text style={commonStyles.emptyStateTitle}>
            Unable to load account
          </Text>
          <Text style={commonStyles.emptyStateSubtitle}>{error}</Text>
          <TouchableOpacity
            style={[
              commonStyles.button,
              { marginTop: 20, paddingHorizontal: 32 },
            ]}
            onPress={() => fetchAccount()}
            activeOpacity={0.85}
          >
            <Text style={commonStyles.buttonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const sc = statusConfig(account.status);

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={styles.scroll}
      >
        {/* ── Balance hero ────────────────────────────────────────── */}
        <View style={styles.heroBanner}>
          <View style={styles.heroRow}>
            <View>
              <Text style={styles.heroAccountType}>{account.accountType}</Text>
              <Text style={styles.heroAccountNum}>
                ****{String(account.accountNumber).slice(-4)}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
              <Text style={[styles.statusBadgeText, { color: sc.color }]}>
                {sc.label}
              </Text>
            </View>
          </View>
          <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
          <Text style={styles.balanceAmount}>
            $
            {account.balance.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
          <Text style={styles.currency}>{account.currency ?? "USD"}</Text>
          <View style={styles.decor1} pointerEvents="none" />
          <View style={styles.decor2} pointerEvents="none" />
        </View>

        {/* ── Quick actions ─────────────────────────────────────────── */}
        <View style={styles.actionsRow}>
          {[
            {
              label: "Transactions",
              icon: "↕️",
              action: () =>
                navigation.navigate("TransactionDetails", {
                  transactionId: accountId,
                }),
            },
            {
              label: "Transfer",
              icon: "💸",
              action: () => navigation.navigate("Transfer", { accountId }),
            },
            { label: "Loans", icon: "🏦", action: () => {} },
            { label: "Savings", icon: "🎯", action: () => {} },
          ].map((a) => (
            <TouchableOpacity
              key={a.label}
              style={styles.actionBtn}
              onPress={a.action}
              activeOpacity={0.75}
            >
              <Text style={styles.actionIcon}>{a.icon}</Text>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Account info ──────────────────────────────────────────── */}
        <View style={[commonStyles.card, styles.section]}>
          <Text style={commonStyles.sectionTitle}>Account Information</Text>
          <InfoRow label="Account Holder" value={account.name} />
          <View style={commonStyles.divider} />
          <InfoRow label="Email" value={account.email} />
          <View style={commonStyles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Account Number</Text>
            <TouchableOpacity
              onPress={handleCopyAccountNumber}
              activeOpacity={0.7}
            >
              <Text style={[styles.infoValue, styles.tapToReveal]}>
                ****{String(account.accountNumber).slice(-4)} 👁
              </Text>
            </TouchableOpacity>
          </View>
          {account.routingNumber && (
            <>
              <View style={commonStyles.divider} />
              <InfoRow label="Routing Number" value={account.routingNumber} />
            </>
          )}
          <View style={commonStyles.divider} />
          <InfoRow
            label="Opened"
            value={new Date(account.openDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          />
          {account.interestRate !== undefined && (
            <>
              <View style={commonStyles.divider} />
              <InfoRow
                label="Interest Rate"
                value={`${account.interestRate}% APY`}
              />
            </>
          )}
          <View style={commonStyles.divider} />
          <InfoRow
            label="Last Updated"
            value={new Date(account.lastUpdated).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: 40 },

  heroBanner: {
    backgroundColor: colors.gradientStart,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 32,
    overflow: "hidden",
    position: "relative",
  },
  heroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  heroAccountType: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 2,
  },
  heroAccountNum: { fontSize: 18, fontWeight: "700", color: colors.white },
  statusBadge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  statusBadgeText: { fontSize: 12, fontWeight: "600" },
  balanceLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: "700",
    color: colors.white,
    letterSpacing: -1.5,
    marginBottom: 4,
  },
  currency: { fontSize: 14, color: "rgba(255,255,255,0.6)", fontWeight: "500" },
  decor1: {
    position: "absolute",
    right: -50,
    top: -50,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  decor2: {
    position: "absolute",
    right: 40,
    bottom: -60,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  actionsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.backgroundWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8,
  },
  actionBtn: { flex: 1, alignItems: "center", paddingVertical: 8 },
  actionIcon: { fontSize: 24, marginBottom: 4 },
  actionLabel: { fontSize: 11, fontWeight: "600", color: colors.textSecondary },

  section: { margin: 16 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    alignItems: "center",
  },
  infoLabel: { fontSize: 13, color: colors.textSecondary },
  infoValue: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },
  tapToReveal: { color: colors.primary },
});

export default AccountDetailsScreen;
