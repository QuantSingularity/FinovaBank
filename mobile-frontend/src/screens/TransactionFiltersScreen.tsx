import {
  type RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type {RootStackParamList} from '../navigation/AppNavigator';
import {colors, commonStyles} from '../styles/commonStyles';

type TransactionFiltersScreenRouteProp = RouteProp<
  RootStackParamList,
  'TransactionFilters'
>;

interface TransactionFilter {
  startDate: string;
  endDate: string;
  type?: string;
}

const QUICK_FILTERS = [
  {label: 'Last 7 Days', days: 7},
  {label: 'Last 30 Days', days: 30},
  {label: 'Last 90 Days', days: 90},
];

const TRANSACTION_TYPES = [
  {label: 'All Types', value: undefined, icon: '↕'},
  {label: 'Credits Only', value: 'CREDIT', icon: '↓'},
  {label: 'Debits Only', value: 'DEBIT', icon: '↑'},
];

const isValidDate = (dateStr: string): boolean => {
  if (!dateStr) {
    return true;
  }
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) {
    return false;
  }
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
};

const TransactionFiltersScreen = () => {
  const route = useRoute<TransactionFiltersScreenRouteProp>();
  const navigation = useNavigation();

  const currentFilter = route.params?.currentFilter;
  const onFilterApply = route.params?.onFilterApply;

  const [startDate, setStartDate] = useState(currentFilter?.startDate || '');
  const [endDate, setEndDate] = useState(currentFilter?.endDate || '');
  const [selectedType, setSelectedType] = useState<string | undefined>(
    currentFilter?.type,
  );
  const [dateError, setDateError] = useState('');

  const handleApplyFilter = () => {
    setDateError('');

    if (startDate && !isValidDate(startDate)) {
      setDateError('Start date must be in YYYY-MM-DD format.');
      return;
    }
    if (endDate && !isValidDate(endDate)) {
      setDateError('End date must be in YYYY-MM-DD format.');
      return;
    }
    if (startDate && endDate && startDate > endDate) {
      setDateError('Start date cannot be after end date.');
      return;
    }

    const filter: TransactionFilter = {
      startDate,
      endDate,
      type: selectedType,
    };

    if (onFilterApply) {
      onFilterApply(filter);
    }

    navigation.goBack();
  };

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    setSelectedType(undefined);
    setDateError('');
  };

  const handleQuickFilter = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
    setDateError('');
  };

  const hasActiveFilter = !!(startDate || endDate || selectedType);

  return (
    <ScrollView
      style={commonStyles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      <Text style={styles.screenTitle}>Filter Transactions</Text>

      {/* Quick Filters */}
      <Text style={commonStyles.sectionTitle}>Quick Select</Text>
      <View style={styles.quickFiltersRow}>
        {QUICK_FILTERS.map(qf => (
          <TouchableOpacity
            key={qf.days}
            style={styles.quickFilterChip}
            onPress={() => handleQuickFilter(qf.days)}
            activeOpacity={0.7}>
            <Text style={styles.quickFilterText}>{qf.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Date Range */}
      <Text style={commonStyles.sectionTitle}>Date Range</Text>
      <View style={commonStyles.card}>
        <Text style={styles.inputLabel}>Start Date</Text>
        <TextInput
          style={[commonStyles.input, styles.dateInput]}
          placeholder="YYYY-MM-DD"
          value={startDate}
          onChangeText={text => {
            setStartDate(text);
            setDateError('');
          }}
          placeholderTextColor={colors.textTertiary}
          keyboardType="numbers-and-punctuation"
          maxLength={10}
        />
        <Text style={styles.inputLabel}>End Date</Text>
        <TextInput
          style={[commonStyles.input, styles.dateInput, {marginBottom: 0}]}
          placeholder="YYYY-MM-DD"
          value={endDate}
          onChangeText={text => {
            setEndDate(text);
            setDateError('');
          }}
          placeholderTextColor={colors.textTertiary}
          keyboardType="numbers-and-punctuation"
          maxLength={10}
        />
        {dateError ? <Text style={styles.dateError}>{dateError}</Text> : null}
      </View>

      {/* Transaction Type */}
      <Text style={commonStyles.sectionTitle}>Transaction Type</Text>
      <View style={styles.typeButtonsContainer}>
        {TRANSACTION_TYPES.map(type => {
          const isSelected = selectedType === type.value;
          return (
            <TouchableOpacity
              key={type.value ?? 'all'}
              style={[
                styles.typeButton,
                isSelected && styles.typeButtonSelected,
              ]}
              onPress={() => setSelectedType(type.value)}
              activeOpacity={0.75}>
              <Text style={styles.typeIcon}>{type.icon}</Text>
              <Text
                style={[
                  styles.typeButtonText,
                  isSelected && styles.typeButtonTextSelected,
                ]}>
                {type.label}
              </Text>
              {isSelected && (
                <View style={styles.typeCheckmark}>
                  <Text style={styles.typeCheckmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[commonStyles.button, styles.applyButton]}
          onPress={handleApplyFilter}
          activeOpacity={0.85}>
          <Text style={commonStyles.buttonText}>Apply Filters</Text>
        </TouchableOpacity>

        {hasActiveFilter ? (
          <TouchableOpacity
            style={[
              commonStyles.button,
              commonStyles.buttonOutline,
              styles.clearButton,
            ]}
            onPress={handleClearFilter}
            activeOpacity={0.75}>
            <Text style={commonStyles.buttonTextOutline}>Clear All</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screenTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  quickFiltersRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  quickFilterChip: {
    flex: 1,
    backgroundColor: colors.primaryLight,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickFilterText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  dateInput: {
    marginBottom: 14,
  },
  dateError: {
    fontSize: 13,
    color: colors.error,
    marginTop: 8,
  },
  typeButtonsContainer: {
    gap: 10,
    marginBottom: 28,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 14,
    gap: 12,
  },
  typeButtonSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  typeIcon: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  typeButtonText: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  typeButtonTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  typeCheckmark: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeCheckmarkText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  actionsContainer: {
    marginBottom: 40,
    gap: 10,
  },
  applyButton: {
    borderRadius: 14,
    shadowColor: colors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  clearButton: {
    borderRadius: 14,
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});

export default TransactionFiltersScreen;
