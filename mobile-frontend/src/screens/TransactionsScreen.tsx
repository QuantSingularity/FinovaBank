import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useRef, useState} from 'react';
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
import type {RootStackParamList} from '../navigation/AppNavigator';
import {getAccountTransactions} from '../services/api';
import {colors, commonStyles} from '../styles/commonStyles';

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

interface TransactionFilter {
  startDate: string;
  endDate: string;
  type?: string;
}

type TransactionsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Transactions'
>;

interface Props {
  route: {params?: {accountId?: string}};
}

const TransactionsScreen = ({route}: Props) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TransactionFilter | null>(null);

  const navigation = useNavigation<TransactionsScreenNavigationProp>();
  const {userData} = useAuth();

  const accountId = route?.params?.accountId || (userData?.id ?? '');

  // Use a ref to avoid stale closure bug in useEffect dependency
  const filterRef = useRef(filter);
  filterRef.current = filter;

  const fetchTransactions = useCallback(
    async (isRefreshing = false) => {
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
        const currentFilter = filterRef.current;
        const params: {
          startDate?: string;
          endDate?: string;
          type?: string;
          limit: number;
          offset: number;
        } = {limit: 50, offset: 0};

        if (currentFilter) {
          if (currentFilter.startDate) {
            params.startDate = currentFilter.startDate;
          }
          if (currentFilter.endDate) {
            params.endDate = currentFilter.endDate;
          }
          if (currentFilter.type) {
            params.type = currentFilter.type;
          }
        }

        const response = await getAccountTransactions(accountId, params);
        const data = Array.isArray(response.data) ? response.data : [];
        setTransactions(data);
      } catch (err: unknown) {
        const e = err as {
          response?: {data?: {message?: string}};
          message?: string;
        };
        console.error('Failed to fetch transactions:', err);
        setError(
          e.response?.data?.message ||
            e.message ||
            'Failed to load transactions.',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accountId],
  );

  // Re-fetch whenever filter changes
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions, filter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions(true);
  };

  const handleTransactionPress = (transaction: Transaction) => {
    navigation.navigate('TransactionDetails', {
      transactionId: transaction.id,
      transaction: transaction as unknown as Record<string, unknown>,
    });
  };

  const handleFilterPress = () => {
    navigation.navigate('TransactionFilters', {
      currentFilter: filter ?? undefined,
      onFilterApply: (newFilter: TransactionFilter) => {
        setFilter(newFilter);
      },
    });
  };

  const renderTransactionItem = ({item}: {item: Transaction}) => {
    const isCredit = item.type === 'CREDIT';
    const formattedDate = new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    return (
      <TouchableOpacity
        style={styles.transactionItem}
        onPress={() => handleTransactionPress(item)}
        activeOpacity={0.75}>
        <View
          style={[
            styles.txIcon,
            {
              backgroundColor: isCredit
                ? colors.successLight
                : colors.errorLight,
            },
          ]}>
          <Text style={styles.txIconText}>{isCredit ? '↓' : '↑'}</Text>
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionDescription} numberOfLines={1}>
            {item.description}
          </Text>
          {item.merchantName ? (
            <Text style={styles.merchantName} numberOfLines={1}>
              {item.merchantName}
            </Text>
          ) : null}
          <Text style={styles.transactionDate}>
            {formattedDate}
            {item.category ? ` · ${item.category}` : ''}
          </Text>
        </View>
        <Text
          style={[
            styles.transactionAmount,
            isCredit ? styles.creditAmount : styles.debitAmount,
          ]}>
          {isCredit ? '+' : '-'}$
          {item.amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={commonStyles.centerContent}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading Transactions...</Text>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <Text style={styles.countText}>
          {transactions.length > 0
            ? `${transactions.length} transaction${transactions.length !== 1 ? 's' : ''}`
            : 'Transactions'}
        </Text>
        <View style={styles.filterBarRight}>
          {filter ? (
            <TouchableOpacity
              style={styles.clearFilterBtn}
              onPress={() => setFilter(null)}>
              <Text style={styles.clearFilterText}>✕ Clear</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter ? styles.filterButtonActive : null,
            ]}
            onPress={handleFilterPress}>
            <Text
              style={[
                styles.filterButtonText,
                filter ? styles.filterButtonTextActive : null,
              ]}>
              ⚡ Filter
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchTransactions()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={transactions}
        renderItem={renderTransactionItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <View style={commonStyles.emptyStateContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={commonStyles.emptyStateTitle}>No Transactions</Text>
            <Text style={commonStyles.emptyStateSubtitle}>
              {filter
                ? 'No transactions match your current filters.'
                : 'Your transactions will appear here.'}
            </Text>
            {filter ? (
              <TouchableOpacity
                style={[commonStyles.button, styles.clearFilterBtnLarge]}
                onPress={() => setFilter(null)}>
                <Text style={commonStyles.buttonText}>Clear Filters</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        }
        contentContainerStyle={
          transactions.length === 0 ? {flex: 1} : styles.listContent
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  filterBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  filterButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterButtonActive: {
    backgroundColor: colors.primaryLight,
  },
  filterButtonText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  clearFilterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.errorLight,
  },
  clearFilterText: {
    fontSize: 13,
    color: colors.error,
    fontWeight: '500',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: colors.textSecondary,
  },
  errorBanner: {
    backgroundColor: colors.errorLight,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    color: colors.error,
    marginRight: 8,
  },
  retryButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  clearFilterBtnLarge: {
    marginTop: 16,
    minWidth: 160,
  },
  listContent: {
    paddingBottom: 24,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  txIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txIconText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  transactionDetails: {
    flex: 1,
    marginRight: 10,
  },
  transactionDescription: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  merchantName: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  creditAmount: {
    color: colors.success,
  },
  debitAmount: {
    color: colors.error,
  },
});

export default TransactionsScreen;
