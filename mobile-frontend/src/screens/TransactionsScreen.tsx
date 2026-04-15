import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type {
  CompositeNavigationProp,
  RouteProp,
} from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import type {
  RootStackParamList,
  TabParamList,
} from "../navigation/AppNavigator";
import { FilterStore } from "../services/FilterStore";
import { getAccountTransactions } from "../services/api";
import { colors, commonStyles } from "../styles/commonStyles";

type TransactionsNav = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, "Transactions">,
  NativeStackNavigationProp<RootStackParamList>
>;
type TransactionsRoute = RouteProp<TabParamList, "Transactions">;

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "DEBIT" | "CREDIT";
  category?: string;
  merchantName?: string;
  reference?: string;
}

interface ActiveFilter {
  startDate: string;
  endDate: string;
  type?: string;
}

const pad = (n: number) => String(n).padStart(2, "0");
const fmt = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return fmt(d);
};

const QUICK_TYPES = ["All", "CREDIT", "DEBIT"];

const TransactionsScreen = () => {
  const navigation = useNavigation<TransactionsNav>();
  const route = useRoute<TransactionsRoute>();
  const { userData } = useAuth();
  const accountId = route.params?.accountId ?? userData?.id ?? "";

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeType, setActiveType] = useState("All");
  const [filter, setFilter] = useState<ActiveFilter>({
    startDate: daysAgo(30),
    endDate: fmt(new Date()),
  });

  // Keep a ref to the current filter to avoid stale closures
  const filterRef = useRef(filter);
  filterRef.current = filter;

  const fetchTransactions = useCallback(
    async (isRefreshing = false) => {
      if (!accountId) {
        setLoading(false);
        setError("No account ID available.");
        return;
      }
      if (!isRefreshing) setLoading(true);
      setError(null);
      try {
        const f = filterRef.current;
        const params: Record<string, string | undefined> = {
          startDate: f.startDate,
          endDate: f.endDate,
        };
        if (f.type) params.type = f.type;
        const res = await getAccountTransactions(accountId, params);
        setTransactions(Array.isArray(res.data) ? res.data : []);
      } catch (e: unknown) {
        const err = e as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        setError(
          err.response?.data?.message ??
            err.message ??
            "Failed to load transactions.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accountId],
  );

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Re-fetch whenever filter changes
  useEffect(() => {
    fetchTransactions();
  }, [filter, fetchTransactions]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions(true);
  };

  const openFilters = () => {
    // Register a callback in FilterStore — avoids passing functions via nav params
    const key = FilterStore.register((applied) => {
      setFilter(applied);
      if (applied.type !== undefined) {
        setActiveType(applied.type || "All");
      }
    });
    navigation.navigate("TransactionFilters", {
      filterKey: key,
      currentFilter: filter,
    });
  };

  const filteredByType =
    activeType === "All"
      ? transactions
      : transactions.filter((t) => t.type === activeType);

  const formatAmount = (amount: number, type: string) => {
    const sign = type === "CREDIT" ? "+" : "-";
    return `${sign}$${Math.abs(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getCategoryIcon = (category?: string) => {
    const map: Record<string, string> = {
      food: "🍔",
      transport: "🚗",
      shopping: "🛍",
      health: "💊",
      entertainment: "🎬",
      utilities: "💡",
      salary: "💰",
      transfer: "↕️",
    };
    return map[category?.toLowerCase() ?? ""] ?? "💳";
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={commonStyles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transactions</Text>
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={openFilters}
          activeOpacity={0.7}
        >
          <Text style={styles.filterBtnText}>⚙ Filter</Text>
        </TouchableOpacity>
      </View>

      {/* ── Type tabs ───────────────────────────────────────────── */}
      <View style={styles.tabsRow}>
        {QUICK_TYPES.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, activeType === t && styles.tabActive]}
            onPress={() => setActiveType(t)}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.tabText, activeType === t && styles.tabTextActive]}
            >
              {t === "CREDIT" ? "↑ Credits" : t === "DEBIT" ? "↓ Debits" : t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Date range pill ─────────────────────────────────────── */}
      <View style={styles.dateRangePill}>
        <Text style={styles.dateRangeText}>
          📅 {filter.startDate} → {filter.endDate}
        </Text>
      </View>

      {error && (
        <View style={[commonStyles.errorContainer, { marginHorizontal: 16 }]}>
          <Text style={commonStyles.errorText}>{error}</Text>
        </View>
      )}

      {/* ── List ─────────────────────────────────────────────────── */}
      <FlatList
        data={filteredByType}
        keyExtractor={(item) => item.id}
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
        ListEmptyComponent={
          <View style={commonStyles.emptyStateContainer}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>📭</Text>
            <Text style={commonStyles.emptyStateTitle}>No transactions</Text>
            <Text style={commonStyles.emptyStateSubtitle}>
              No transactions found for the selected period.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.txCard}
            onPress={() =>
              navigation.navigate("TransactionDetails", {
                transactionId: item.id,
                transaction: item as Record<string, unknown>,
              })
            }
            activeOpacity={0.8}
          >
            <View style={styles.txIconBox}>
              <Text style={styles.txIcon}>
                {getCategoryIcon(item.category)}
              </Text>
            </View>
            <View style={styles.txMid}>
              <Text style={styles.txDesc} numberOfLines={1}>
                {item.merchantName ?? item.description}
              </Text>
              <Text style={styles.txDate}>{formatDate(item.date)}</Text>
              {item.category ? (
                <View style={styles.txCatPill}>
                  <Text style={styles.txCatText}>{item.category}</Text>
                </View>
              ) : null}
            </View>
            <Text
              style={[
                styles.txAmount,
                {
                  color: item.type === "CREDIT" ? colors.success : colors.error,
                },
              ]}
            >
              {formatAmount(item.amount, item.type)}
            </Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.backgroundWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: colors.textPrimary },
  filterBtn: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterBtnText: { fontSize: 13, color: colors.primary, fontWeight: "600" },

  tabsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.backgroundWhite,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  tabTextActive: { color: colors.white },

  dateRangePill: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  dateRangeText: { fontSize: 12, color: colors.primary, fontWeight: "500" },

  listContent: { padding: 16, flexGrow: 1 },
  loadingText: { marginTop: 12, fontSize: 15, color: colors.textSecondary },

  txCard: {
    backgroundColor: colors.backgroundWhite,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: { elevation: 1 },
    }),
  },
  txIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  txIcon: { fontSize: 20 },
  txMid: { flex: 1, marginRight: 8 },
  txDesc: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  txDate: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  txCatPill: {
    backgroundColor: colors.surface,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  txCatText: { fontSize: 11, color: colors.textSecondary, fontWeight: "500" },
  txAmount: { fontSize: 15, fontWeight: "700" },
});

export default TransactionsScreen;
