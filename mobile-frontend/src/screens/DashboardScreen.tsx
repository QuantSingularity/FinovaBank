import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useAuth} from '../context/AuthContext';
import type {RootStackParamList} from '../navigation/AppNavigator';
import {getUserAccounts} from '../services/api';
import {colors, commonStyles} from '../styles/commonStyles';

type DashboardScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Dashboard'
>;

interface AccountSummary {
  id: string;
  balance: number;
  accountNumber: string;
  accountType: string;
  status: string;
}

interface QuickAction {
  label: string;
  icon: string;
  screen: keyof RootStackParamList;
  params?: Record<string, unknown>;
  color: string;
}

const DashboardScreen = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const {userData, logout} = useAuth();
  const [accounts, setAccounts] = useState<AccountSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const primaryAccount = accounts[0];

  const fetchAccounts = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) {
      setLoading(true);
    }
    setError(null);
    try {
      const response = await getUserAccounts();
      const data = Array.isArray(response.data) ? response.data : [];
      setAccounts(data);
    } catch (err: unknown) {
      const e = err as {
        response?: {data?: {message?: string}};
        message?: string;
      };
      console.error('Failed to fetch accounts:', err);
      setError(
        e.response?.data?.message ||
          e.message ||
          'Failed to load account data.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAccounts(true);
  };

  const handleLogout = () => {
    logout().catch(err => console.error('Logout error:', err));
  };

  const quickActions: QuickAction[] = [
    {
      label: 'Transactions',
      icon: '↕',
      screen: 'Transactions',
      params: primaryAccount ? {accountId: primaryAccount.id} : {},
      color: colors.primary,
    },
    {
      label: 'Loans',
      icon: '🏦',
      screen: 'Loans',
      params: primaryAccount ? {accountId: primaryAccount.id} : {},
      color: '#5856D6',
    },
    {
      label: 'Savings',
      icon: '🎯',
      screen: 'SavingsGoals',
      params: primaryAccount ? {accountId: primaryAccount.id} : {},
      color: colors.secondary,
    },
    {
      label: 'Account',
      icon: '👤',
      screen: 'AccountDetails',
      params: primaryAccount ? {accountId: primaryAccount.id} : {},
      color: colors.warning,
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good morning';
    }
    if (hour < 17) {
      return 'Good afternoon';
    }
    return 'Good evening';
  };

  if (loading && !refreshing) {
    return (
      <View style={commonStyles.centerContent}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={commonStyles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {getGreeting()},{' '}
            <Text style={styles.userName}>
              {userData?.firstName ?? 'there'}
            </Text>
          </Text>
          <Text style={styles.headerSubtitle}>
            Here's your financial overview
          </Text>
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceAmount}>
          $
          {totalBalance.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
        {primaryAccount && (
          <View style={styles.accountNumberBadge}>
            <Text style={styles.accountNumberText}>
              {primaryAccount.accountType} · {primaryAccount.accountNumber}
            </Text>
          </View>
        )}
        {error && (
          <Text style={styles.balanceError}>⚠ Could not load account data</Text>
        )}
      </View>

      {/* Quick Actions */}
      <Text style={commonStyles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        {quickActions.map(action => (
          <TouchableOpacity
            key={action.screen}
            style={styles.quickActionItem}
            onPress={() =>
              navigation.navigate(action.screen as any, action.params as any)
            }
            activeOpacity={0.75}>
            <View
              style={[
                styles.quickActionIcon,
                {backgroundColor: action.color + '18'},
              ]}>
              <Text style={styles.quickActionEmoji}>{action.icon}</Text>
            </View>
            <Text style={[styles.quickActionLabel, {color: action.color}]}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Accounts Section */}
      {accounts.length > 1 && (
        <>
          <Text style={commonStyles.sectionTitle}>Your Accounts</Text>
          {accounts.map(account => (
            <TouchableOpacity
              key={account.id}
              style={commonStyles.card}
              onPress={() =>
                navigation.navigate('AccountDetails', {accountId: account.id})
              }
              activeOpacity={0.8}>
              <View style={commonStyles.spaceBetween}>
                <View>
                  <Text style={styles.accountType}>{account.accountType}</Text>
                  <Text style={styles.accountNum}>{account.accountNumber}</Text>
                </View>
                <View style={styles.accountBalanceContainer}>
                  <Text style={styles.accountBalance}>
                    $
                    {account.balance.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor:
                          account.status === 'ACTIVE'
                            ? colors.success
                            : colors.warning,
                      },
                    ]}
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingTop: 4,
  },
  greeting: {
    fontSize: 20,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  userName: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textTertiary,
    marginTop: 2,
  },
  logoutButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  logoutText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: colors.textSecondary,
  },
  balanceCard: {
    borderRadius: 20,
    padding: 28,
    marginBottom: 24,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -1,
    marginBottom: 16,
  },
  accountNumberBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  accountNumberText: {
    fontSize: 13,
    color: colors.white,
    fontWeight: '500',
  },
  balanceError: {
    marginTop: 8,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
    gap: 10,
  },
  quickActionItem: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionEmoji: {
    fontSize: 22,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  accountType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  accountNum: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  accountBalanceContainer: {
    alignItems: 'flex-end',
    gap: 6,
  },
  accountBalance: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primary,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bottomSpacer: {
    height: 32,
  },
});

export default DashboardScreen;
