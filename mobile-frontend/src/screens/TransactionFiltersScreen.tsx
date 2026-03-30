import {
  type RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {useState} from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type {RootStackParamList} from '../navigation/AppNavigator';
import {colors, commonStyles} from '../styles/commonStyles';

// Define the route prop type for this screen
type TransactionFiltersScreenRouteProp = RouteProp<
  RootStackParamList,
  'TransactionFilters'
>;

interface TransactionFilterProps {
  startDate: string;
  endDate: string;
  type?: string;
}

const TransactionFiltersScreen = () => {
  const route = useRoute<TransactionFiltersScreenRouteProp>();
  const navigation = useNavigation();

  // Get current filter from route params
  const currentFilter = route.params?.currentFilter;
  const onFilterApply = route.params?.onFilterApply;

  // Initialize state with current filter or defaults
  const [startDate, setStartDate] = useState(currentFilter?.startDate || '');
  const [endDate, setEndDate] = useState(currentFilter?.endDate || '');
  const [selectedType, setSelectedType] = useState<string | undefined>(
    currentFilter?.type,
  );

  const transactionTypes = [
    {label: 'All Types', value: undefined},
    {label: 'Credit', value: 'CREDIT'},
    {label: 'Debit', value: 'DEBIT'},
  ];

  const handleApplyFilter = () => {
    const filter: TransactionFilterProps = {
      startDate,
      endDate,
      type: selectedType,
    };

    // Call the callback function if provided
    if (onFilterApply) {
      onFilterApply(filter);
    }

    // Navigate back
    navigation.goBack();
  };

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    setSelectedType(undefined);
  };

  const handleQuickFilter = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  return (
    <ScrollView style={commonStyles.container}>
      <Text style={commonStyles.titleText}>Filter Transactions</Text>

      {/* Quick Filters */}
      <View style={[commonStyles.card, styles.section]}>
        <Text style={styles.sectionTitle}>Quick Filters</Text>
        <View style={styles.quickFiltersContainer}>
          <TouchableOpacity
            style={styles.quickFilterButton}
            onPress={() => handleQuickFilter(7)}>
            <Text style={styles.quickFilterText}>Last 7 Days</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickFilterButton}
            onPress={() => handleQuickFilter(30)}>
            <Text style={styles.quickFilterText}>Last 30 Days</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickFilterButton}
            onPress={() => handleQuickFilter(90)}>
            <Text style={styles.quickFilterText}>Last 90 Days</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Date Range */}
      <View style={[commonStyles.card, styles.section]}>
        <Text style={styles.sectionTitle}>Date Range</Text>
        <Text style={styles.inputLabel}>Start Date (YYYY-MM-DD)</Text>
        <TextInput
          style={commonStyles.input}
          placeholder="2024-01-01"
          value={startDate}
          onChangeText={setStartDate}
          placeholderTextColor={colors.textSecondary}
          keyboardType={
            Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'
          }
        />
        <Text style={styles.inputLabel}>End Date (YYYY-MM-DD)</Text>
        <TextInput
          style={commonStyles.input}
          placeholder="2024-12-31"
          value={endDate}
          onChangeText={setEndDate}
          placeholderTextColor={colors.textSecondary}
          keyboardType={
            Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'
          }
        />
      </View>

      {/* Transaction Type */}
      <View style={[commonStyles.card, styles.section]}>
        <Text style={styles.sectionTitle}>Transaction Type</Text>
        <View style={styles.typeButtonsContainer}>
          {transactionTypes.map(type => (
            <TouchableOpacity
              key={type.value || 'all'}
              style={[
                styles.typeButton,
                selectedType === type.value && styles.typeButtonSelected,
              ]}
              onPress={() => setSelectedType(type.value)}>
              <Text
                style={[
                  styles.typeButtonText,
                  selectedType === type.value && styles.typeButtonTextSelected,
                ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[commonStyles.button, styles.applyButton]}
          onPress={handleApplyFilter}>
          <Text style={commonStyles.buttonText}>Apply Filters</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            commonStyles.button,
            commonStyles.buttonSecondary,
            styles.clearButton,
          ]}
          onPress={handleClearFilter}>
          <Text
            style={[commonStyles.buttonText, commonStyles.buttonTextSecondary]}>
            Clear Filters
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cancelButton]}
          onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 15,
  },
  quickFiltersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  quickFilterButton: {
    backgroundColor: colors.lightGray,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 10,
    minWidth: '30%',
    alignItems: 'center',
  },
  quickFilterText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  inputLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    marginTop: 4,
  },
  typeButtonsContainer: {
    flexDirection: 'column',
  },
  typeButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  typeButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeButtonText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  typeButtonTextSelected: {
    color: colors.background,
  },
  actionsContainer: {
    marginBottom: 30,
  },
  applyButton: {
    marginBottom: 12,
  },
  clearButton: {
    marginBottom: 12,
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
