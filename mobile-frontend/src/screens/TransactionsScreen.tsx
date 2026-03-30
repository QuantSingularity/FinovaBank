import {useNavigation} from '@react-navigation/native';
import {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useAuth} from '../context/AuthContext';
import {getAccountTransactions} from '../services/api';
import {colors, commonStyles} from '../styles/commonStyles';

// Define the structure for transaction data
interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  category?: string;
  merchantName?: string;
  reference?: string;
}

interface TransactionFilterProps {
  startDate: string;
  endDate: string;
  type?: string;
}

const TransactionsScreen = ({route}: any) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TransactionFilterProps | null>(null);

  const navigation = useNavigation();
  const {userData} = useAuth();

  // Get accountId from route params or use default from user data
  const accountId =
    route?.params?.accountId || (userData?.id ? userData.id : '');

  const fetchTransactions = async (isRefreshing = false) => {
    if (!accountId) {
      setLoading(false);
      setError('No account ID available');
      return;
    }

    if (!isRefreshing) {
      setLoading(true);
    }
    setError(null);

    try {
      // Prepare filter parameters
      const params: any = {};
      if (filter) {
        if (filter.startDate) params.startDate = filter.startDate;
        if (filter.endDate) params.endDate = filter.endDate;
        if (filter.type) params.type = filter.type;
      }

      // Set default limit and pagination
      params.limit = 50;
      params.offset = 0;

      const response = await getAccountTransactions(accountId, params);
      setTransactions(response.data);
    } catch (err: any) {
      console.error('Failed to fetch transactions:', err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to load transactions.';
      setError(errorMessage);
    } finally {
      if (!isRefreshing) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions(true);
  };

  const handleTransactionPress = (transaction: Transaction) => {
    navigation.navigate('TransactionDetails', {
      transactionId: transaction.id,
      transaction, // Pass the transaction data for immediate display
    });
  };

  const handleFilterPress = () => {
    navigation.navigate('TransactionFilters', {
      currentFilter: filter,
      onFilterApply: (newFilter: TransactionFilterProps) => {
        setFilter(newFilter);
      },
    });
  };

  const renderTransactionItem = ({item}: {item: Transaction}) => (
    <TouchableOpacity
      style={[commonStyles.card, styles.transactionItem]}
      onPress={() => handleTransactionPress(item)}>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        {item.merchantName && (
          <Text style={styles.merchantName}>{item.merchantName}</Text>
        )}
        <Text style={styles.transactionDate}>
          {new Date(item.date).toLocaleDateString()}
          {item.category && ` • ${item.category}`}
        </Text>
      </View>
      <Text
        style={[
          styles.transactionAmount,
          item.type === 'CREDIT' ? styles.creditAmount : styles.debitAmount,
        ]}>
        {item.type === 'CREDIT' ? '+' : '-'}$
        {item.amount.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={[commonStyles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading Transactions...</Text>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={commonStyles.titleText}>Transactions</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={handleFilterPress}>
          <Text style={styles.filterButtonText}>
            {filter ? 'Filters Applied' : 'Filter'}
          </Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={commonStyles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchTransactions()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={transactions}
        renderItem={renderTransactionItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No transactions found.</Text>
            {filter && (
              <TouchableOpacity
                style={styles.clearFilterButton}
                onPress={() => setFilter(null)}>
                <Text style={styles.clearFilterText}>Clear Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        contentContainerStyle={
          transactions.length === 0
            ? styles.emptyListContent
            : styles.listContainer
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />
    </View>
  );
};

// Add specific styles for TransactionsScreen
const styles = StyleSheet.create({
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  filterButton: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterButtonText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorContainer: {
    backgroundColor: colors.errorLight,
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  retryButton: {
    backgroundColor: colors.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  clearFilterButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  clearFilterText: {
    color: '#fff',
    fontWeight: '500',
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    padding: 15,
  },
  transactionDetails: {
    flex: 1,
    marginRight: 10,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  merchantName: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  transactionAmount: {
    fontSize: 17,
    fontWeight: '600',
  },
  creditAmount: {
    color: colors.success,
  },
  debitAmount: {
    color: colors.error,
  },
});

export default TransactionsScreen;
