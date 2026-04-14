import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type {RootStackParamList} from '../navigation/AppNavigator';
import {colors, commonStyles} from '../styles/commonStyles';

type FiltersRoute = RouteProp<RootStackParamList, 'TransactionFilters'>;

const QUICK_RANGES = [
  {label: 'Last 7 days', days: 7},
  {label: 'Last 30 days', days: 30},
  {label: 'Last 90 days', days: 90},
  {label: 'This year', days: 365},
];

const TX_TYPES = [
  {label: 'All Types', value: ''},
  {label: '↑  Credits (Money In)', value: 'CREDIT'},
  {label: '↓  Debits (Money Out)', value: 'DEBIT'},
];

const pad = (n: number) => String(n).padStart(2, '0');
const fmt = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return fmt(d);
};

const TransactionFiltersScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<FiltersRoute>();
  const {currentFilter, onFilterApply} = route.params || {};

  const [selectedRange, setSelectedRange] = useState<number | null>(null);
  const [txType, setTxType] = useState(currentFilter?.type || '');
  const [startDate, setStartDate] = useState(
    currentFilter?.startDate || daysAgo(30),
  );
  const [endDate, setEndDate] = useState(
    currentFilter?.endDate || fmt(new Date()),
  );

  const handleQuickRange = (days: number) => {
    setSelectedRange(days);
    setStartDate(daysAgo(days));
    setEndDate(fmt(new Date()));
  };

  const handleApply = () => {
    if (onFilterApply) {
      onFilterApply({startDate, endDate, type: txType || undefined});
    }
    navigation.goBack();
  };

  const handleReset = () => {
    setSelectedRange(30);
    setStartDate(daysAgo(30));
    setEndDate(fmt(new Date()));
    setTxType('');
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Filter Transactions</Text>
          <Text style={styles.headerSub}>
            Narrow down your transaction history
          </Text>
        </View>

        {/* Quick date ranges */}
        <Text style={styles.sectionLabel}>Quick Date Range</Text>
        <View style={styles.rangeGrid}>
          {QUICK_RANGES.map(r => (
            <TouchableOpacity
              key={r.days}
              style={[
                styles.rangeChip,
                selectedRange === r.days && styles.rangeChipActive,
              ]}
              onPress={() => handleQuickRange(r.days)}
              activeOpacity={0.75}>
              <Text
                style={[
                  styles.rangeChipText,
                  selectedRange === r.days && styles.rangeChipTextActive,
                ]}>
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date range display */}
        <Text style={styles.sectionLabel}>Date Range</Text>
        <View style={styles.dateRangeCard}>
          <View style={styles.dateItem}>
            <Text style={styles.dateItemLabel}>From</Text>
            <Text style={styles.dateItemValue}>
              {new Date(startDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>
          <View style={styles.dateArrow}>
            <Text style={styles.dateArrowText}>→</Text>
          </View>
          <View style={styles.dateItem}>
            <Text style={styles.dateItemLabel}>To</Text>
            <Text style={styles.dateItemValue}>
              {new Date(endDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>

        {/* Transaction type */}
        <Text style={styles.sectionLabel}>Transaction Type</Text>
        <View style={styles.typeList}>
          {TX_TYPES.map(t => (
            <TouchableOpacity
              key={t.value}
              style={[
                styles.typeRow,
                txType === t.value && styles.typeRowActive,
              ]}
              onPress={() => setTxType(t.value)}
              activeOpacity={0.75}>
              <View
                style={[
                  styles.radioOuter,
                  txType === t.value && styles.radioOuterActive,
                ]}>
                {txType === t.value && <View style={styles.radioInner} />}
              </View>
              <Text
                style={[
                  styles.typeLabel,
                  txType === t.value && styles.typeLabelActive,
                ]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Active filter summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Active Filters</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>Date range:</Text>
            <Text style={styles.summaryVal}>
              {startDate} → {endDate}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>Type:</Text>
            <Text style={styles.summaryVal}>{txType || 'All Types'}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom action bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.resetBtn}
          onPress={handleReset}
          activeOpacity={0.7}>
          <Text style={styles.resetBtnText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.applyBtn}
          onPress={handleApply}
          activeOpacity={0.85}>
          <Text style={styles.applyBtnText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.background},
  scroll: {padding: 20, paddingBottom: 16},

  header: {marginBottom: 24},
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  headerSub: {fontSize: 14, color: colors.textSecondary},

  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  rangeGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 28},
  rangeChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: colors.backgroundWhite,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  rangeChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  rangeChipText: {fontSize: 13, fontWeight: '500', color: colors.textSecondary},
  rangeChipTextActive: {color: colors.primary, fontWeight: '700'},

  dateRangeCard: {
    backgroundColor: colors.backgroundWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 28,
  },
  dateItem: {flex: 1},
  dateItemLabel: {
    fontSize: 11,
    color: colors.textTertiary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  dateItemValue: {fontSize: 15, fontWeight: '700', color: colors.textPrimary},
  dateArrow: {paddingHorizontal: 12},
  dateArrowText: {fontSize: 18, color: colors.textTertiary},

  typeList: {
    backgroundColor: colors.backgroundWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
    overflow: 'hidden',
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  typeRowActive: {backgroundColor: colors.primaryLight},
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioOuterActive: {borderColor: colors.primary},
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  typeLabel: {fontSize: 15, color: colors.textSecondary, fontWeight: '500'},
  typeLabelActive: {color: colors.primary, fontWeight: '700'},

  summaryCard: {
    backgroundColor: colors.backgroundWhite,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  summaryRow: {flexDirection: 'row', marginBottom: 6},
  summaryKey: {fontSize: 13, color: colors.textSecondary, width: 90},
  summaryVal: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },

  actionBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.backgroundWhite,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: {width: 0, height: -2},
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {elevation: 8},
    }),
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  resetBtnText: {fontSize: 15, fontWeight: '600', color: colors.textSecondary},
  applyBtn: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {elevation: 4},
    }),
  },
  applyBtnText: {fontSize: 15, fontWeight: '700', color: colors.white},
});

export default TransactionFiltersScreen;
