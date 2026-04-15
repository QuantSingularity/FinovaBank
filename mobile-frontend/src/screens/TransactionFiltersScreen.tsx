import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import React, { useState } from "react";
import {
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
import { FilterStore } from "../services/FilterStore";
import { colors, commonStyles } from "../styles/commonStyles";

type FiltersRoute = RouteProp<RootStackParamList, "TransactionFilters">;

const QUICK_RANGES = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
  { label: "This year", days: 365 },
];

const TX_TYPES = [
  { label: "All Types", value: "" },
  { label: "↑  Credits (Money In)", value: "CREDIT" },
  { label: "↓  Debits (Money Out)", value: "DEBIT" },
];

const pad = (n: number) => String(n).padStart(2, "0");
const fmt = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return fmt(d);
};

const isValidDate = (str: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(str) && !isNaN(Date.parse(str));

const TransactionFiltersScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<FiltersRoute>();
  const { filterKey, currentFilter } = route.params;

  const [selectedRange, setSelectedRange] = useState<number | null>(null);
  const [txType, setTxType] = useState(currentFilter?.type ?? "");
  const [startDate, setStartDate] = useState(
    currentFilter?.startDate ?? daysAgo(30),
  );
  const [endDate, setEndDate] = useState(
    currentFilter?.endDate ?? fmt(new Date()),
  );
  const [dateError, setDateError] = useState("");

  const handleQuickRange = (days: number) => {
    setSelectedRange(days);
    setStartDate(daysAgo(days));
    setEndDate(fmt(new Date()));
    setDateError("");
  };

  const handleApply = () => {
    setDateError("");
    if (!isValidDate(startDate)) {
      setDateError("Start date must be in YYYY-MM-DD format.");
      return;
    }
    if (!isValidDate(endDate)) {
      setDateError("End date must be in YYYY-MM-DD format.");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setDateError("Start date must be before end date.");
      return;
    }

    // Call the registered callback via FilterStore
    FilterStore.call(filterKey, {
      startDate,
      endDate,
      type: txType || undefined,
    });
    navigation.goBack();
  };

  const handleReset = () => {
    setSelectedRange(30);
    setStartDate(daysAgo(30));
    setEndDate(fmt(new Date()));
    setTxType("");
    setDateError("");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Quick date ranges ───────────────────────────────────── */}
        <Text style={commonStyles.sectionTitle}>Quick Range</Text>
        <View style={styles.rangeGrid}>
          {QUICK_RANGES.map((r) => (
            <TouchableOpacity
              key={r.days}
              style={[
                styles.rangeChip,
                selectedRange === r.days && styles.rangeChipActive,
              ]}
              onPress={() => handleQuickRange(r.days)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.rangeChipText,
                  selectedRange === r.days && styles.rangeChipTextActive,
                ]}
              >
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Custom dates ────────────────────────────────────────── */}
        <Text style={[commonStyles.sectionTitle, { marginTop: 8 }]}>
          Custom Date Range
        </Text>
        {dateError ? (
          <View style={commonStyles.errorContainer}>
            <Text style={commonStyles.errorText}>{dateError}</Text>
          </View>
        ) : null}

        <Text style={styles.fieldLabel}>Start Date (YYYY-MM-DD)</Text>
        <TextInput
          style={commonStyles.input}
          value={startDate}
          onChangeText={(v) => {
            setStartDate(v);
            setSelectedRange(null);
            setDateError("");
          }}
          placeholder="2024-01-01"
          placeholderTextColor={colors.textTertiary}
          keyboardType={
            Platform.OS === "ios" ? "numbers-and-punctuation" : "default"
          }
          maxLength={10}
        />

        <Text style={styles.fieldLabel}>End Date (YYYY-MM-DD)</Text>
        <TextInput
          style={commonStyles.input}
          value={endDate}
          onChangeText={(v) => {
            setEndDate(v);
            setSelectedRange(null);
            setDateError("");
          }}
          placeholder="2024-12-31"
          placeholderTextColor={colors.textTertiary}
          keyboardType={
            Platform.OS === "ios" ? "numbers-and-punctuation" : "default"
          }
          maxLength={10}
        />

        {/* ── Transaction type ────────────────────────────────────── */}
        <Text style={[commonStyles.sectionTitle, { marginTop: 8 }]}>
          Transaction Type
        </Text>
        <View style={styles.typeList}>
          {TX_TYPES.map((t) => (
            <TouchableOpacity
              key={t.value}
              style={[
                styles.typeRow,
                txType === t.value && styles.typeRowActive,
              ]}
              onPress={() => setTxType(t.value)}
              activeOpacity={0.7}
            >
              <View
                style={[styles.radio, txType === t.value && styles.radioActive]}
              >
                {txType === t.value && <View style={styles.radioDot} />}
              </View>
              <Text
                style={[
                  styles.typeLabel,
                  txType === t.value && styles.typeLabelActive,
                ]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* ── Action buttons ────────────────────────────────────────── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.resetBtn}
          onPress={handleReset}
          activeOpacity={0.7}
        >
          <Text style={styles.resetBtnText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.applyBtn}
          onPress={handleApply}
          activeOpacity={0.85}
        >
          <Text style={commonStyles.buttonText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.backgroundWhite },
  scroll: { padding: 20, paddingBottom: 16 },

  rangeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  rangeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.backgroundWhite,
  },
  rangeChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  rangeChipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  rangeChipTextActive: { color: colors.primary, fontWeight: "600" },

  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 6,
  },

  typeList: { gap: 8, marginBottom: 24 },
  typeRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.backgroundWhite,
    gap: 12,
  },
  typeRowActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: { borderColor: colors.primary },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  typeLabel: { fontSize: 14, color: colors.textSecondary, fontWeight: "500" },
  typeLabelActive: { color: colors.primary, fontWeight: "600" },

  footer: {
    flexDirection: "row",
    padding: 16,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.backgroundWhite,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
  },
  resetBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  applyBtn: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
});

export default TransactionFiltersScreen;
