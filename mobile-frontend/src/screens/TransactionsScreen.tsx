import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
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
type TransactionsNav = NativeStackNavigationProp<
  RootStackParamList,
  'Transactions'
>;
interface Props {
  route: {params?: {accountId?: string}};
}

const CATEGORIES = ['All', 'CREDIT', 'DEBIT'];

const TransactionsScreen = ({route}: Props) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TransactionFilter | null>(null);
  const [activeType, setActiveType] = useState('All');
  const navigation = useNavigation<TransactionsNav>();
  const {userData} = useAuth();
  const accountId = route?.params?.accountId || userData?.id || '';
  const filterRef = useRef(filter);
  filterRef.current = filter;

  const fetchTransactions = useCallback(
    async (isRefreshing = false) => {
      if (!accountId) {
        setLoading(false);
        setError('No account ID.');
        return;
      }
      if (!isRefreshing) setLoading(true);
      setError(null);
      try {
        const params: any = {limit: 50};
        if (filterRef.current) {
          params.startDate = filterRef.current.startDate;
          params.endDate = filterRef.current.endDate;
          if (filterRef.current.type) params.type = filterRef.current.type;
        }
        const res = await getAccountTransactions(accountId, params);
        setTransactions(Array.isArray(res.data) ? res.data : []);
      } catch (e: any) {
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

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);
  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions(true);
  };

  const filtered =
    activeType === 'All'
      ? transactions
      : transactions.filter(t => t.type === activeType);

  const totalCredit = transactions
    .filter(t => t.type === 'CREDIT')
    .reduce((s, t) => s + t.amount, 0);
  const totalDebit = transactions
    .filter(t => t.type === 'DEBIT')
    .reduce((s, t) => s + t.amount, 0);

  const renderItem = ({item}: {item: Transaction}) => (
    <TouchableOpacity
      style={styles.txCard}
      onPress={() =>
        navigation.navigate('TransactionDetails', {
          transactionId: item.id,
          transaction: item as any,
        })
      }
      activeOpacity={0.8}>
      <View
        style={[
          styles.txIconBox,
          {backgroundColor: item.type === 'CREDIT' ? '#ecfdf5' : '#fef2f2'},
        ]}>
        <Text style={styles.txIcon}>{item.type === 'CREDIT' ? '↑' : '↓'}</Text>
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txDesc} numberOfLines={1}>
          {item.merchantName || item.description || `Transaction #${item.id}`}
        </Text>
        <Text style={styles.txMeta}>
          {new Date(item.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
          {item.category ? ` · ${item.category}` : ''}
        </Text>
      </View>
      <Text
        style={[
          styles.txAmount,
          {color: item.type === 'CREDIT' ? colors.success : colors.error},
        ]}>
        {item.type === 'CREDIT' ? '+' : '-'}$
        {Math.abs(item.amount).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      {/* Summary strip */}
      <View style={styles.summaryStrip}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Income</Text>
          <Text style={[styles.summaryValue, {color: colors.success}]}>
            +$
            {totalCredit.toLocaleString(undefined, {minimumFractionDigits: 2})}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Expenses</Text>
          <Text style={[styles.summaryValue, {color: colors.error}]}>
            -${totalDebit.toLocaleString(undefined, {minimumFractionDigits: 2})}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Net</Text>
          <Text
            style={[
              styles.summaryValue,
              {
                color:
                  totalCredit - totalDebit >= 0 ? colors.success : colors.error,
              },
            ]}>
            $
            {(totalCredit - totalDebit).toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </Text>
        </View>
      </View>

      {/* Filter tabs + filter btn */}
      <View style={styles.filterBar}>
        <View style={styles.filterTabs}>
          {CATEGORIES.map(c => (
            <TouchableOpacity
              key={c}
              style={[
                styles.filterTab,
                activeType === c && styles.filterTabActive,
              ]}
              onPress={() => setActiveType(c)}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.filterTabText,
                  activeType === c && styles.filterTabTextActive,
                ]}>
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={styles.filterIconBtn}
          onPress={() =>
            navigation.navigate('TransactionFilters', {
              currentFilter: filter || undefined,
              onFilterApply: f => {
                setFilter(f);
                fetchTransactions();
              },
            })
          }
          activeOpacity={0.75}>
          <Text style={styles.filterIconText}>⚙</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading && !refreshing ? (
        <View style={commonStyles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      ) : error ? (
        <View style={commonStyles.emptyStateContainer}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={commonStyles.emptyStateTitle}>Failed to load</Text>
          <Text style={commonStyles.emptyStateSubtitle}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => fetchTransactions()}
            activeOpacity={0.8}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={t => t.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={commonStyles.emptyStateContainer}>
              <Text style={styles.emptyEmoji}>📋</Text>
              <Text style={commonStyles.emptyStateTitle}>
                No transactions yet
              </Text>
              <Text style={commonStyles.emptyStateSubtitle}>
                Your transaction history will appear here.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.background},

  summaryStrip: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundWhite,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryItem: {flex: 1, alignItems: 'center'},
  summaryDivider: {width: 1, backgroundColor: colors.border},
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryValue: {fontSize: 16, fontWeight: '700', letterSpacing: -0.3},

  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.backgroundWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  filterTabs: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 3,
    gap: 2,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: colors.backgroundWhite,
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: {elevation: 2},
    }),
  },
  filterTabText: {fontSize: 13, color: colors.textSecondary, fontWeight: '500'},
  filterTabTextActive: {color: colors.textPrimary, fontWeight: '700'},
  filterIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterIconText: {fontSize: 16},

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    flexGrow: 1,
  },

  txCard: {
    backgroundColor: colors.backgroundWhite,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {elevation: 1},
    }),
  },
  txIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txIcon: {fontSize: 20, fontWeight: '700'},
  txInfo: {flex: 1, marginRight: 10},
  txDesc: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 3,
  },
  txMeta: {fontSize: 12, color: colors.textSecondary},
  txAmount: {fontSize: 15, fontWeight: '700', letterSpacing: -0.3},

  loadingText: {marginTop: 12, fontSize: 15, color: colors.textSecondary},
  errorEmoji: {fontSize: 40, marginBottom: 12},
  emptyEmoji: {fontSize: 48, marginBottom: 12},
  retryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  retryBtnText: {color: colors.white, fontWeight: '600', fontSize: 15},
});

export default TransactionsScreen;
