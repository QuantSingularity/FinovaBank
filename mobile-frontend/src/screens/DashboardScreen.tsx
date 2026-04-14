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

type DashboardNavProp = NativeStackNavigationProp<
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
  bg: string;
}

const DashboardScreen = () => {
  const navigation = useNavigation<DashboardNavProp>();
  const {userData, logout} = useAuth();
  const [accounts, setAccounts] = useState<AccountSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const primaryAccount = accounts[0];

  const fetchAccounts = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) {
      setLoading(true);
    }
    setError(null);
    try {
      const response = await getUserAccounts();
      setAccounts(Array.isArray(response.data) ? response.data : []);
    } catch (err: unknown) {
      const e = err as {
        response?: {data?: {message?: string}};
        message?: string;
      };
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
    logout().catch(e => console.error(e));
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  };

  const quickActions: QuickAction[] = [
    {
      label: 'Transactions',
      icon: '↕',
      screen: 'Transactions',
      params: primaryAccount ? {accountId: primaryAccount.id} : {},
      color: colors.primary,
      bg: '#eff6ff',
    },
    {
      label: 'Loans',
      icon: '🏦',
      screen: 'Loans',
      params: primaryAccount ? {accountId: primaryAccount.id} : {},
      color: '#7c3aed',
      bg: '#f5f3ff',
    },
    {
      label: 'Savings',
      icon: '🎯',
      screen: 'SavingsGoals',
      params: primaryAccount ? {accountId: primaryAccount.id} : {},
      color: colors.success,
      bg: '#ecfdf5',
    },
    {
      label: 'Account',
      icon: '👤',
      screen: 'AccountDetails',
      params: primaryAccount ? {accountId: primaryAccount.id} : {},
      color: colors.warning,
      bg: '#fffbeb',
    },
  ];

  const statCards = [
    {
      label: 'Monthly Income',
      value: '$5,240',
      change: '+8.2%',
      up: true,
      color: colors.success,
    },
    {
      label: 'Monthly Expenses',
      value: '$3,570',
      change: '3.1%',
      up: false,
      color: colors.error,
    },
    {
      label: 'Savings Goal',
      value: '68%',
      change: 'On track',
      up: true,
      color: colors.secondary,
    },
  ];

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
      style={styles.root}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }>
      {/* ── Hero Banner ───────────────────────────────────────── */}
      <View style={styles.heroBanner}>
        {/* top row */}
        <View style={styles.heroTopRow}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>
              {userData?.firstName ?? 'there'} 👋
            </Text>
            <Text style={styles.heroSub}>Here's your financial overview</Text>
          </View>
          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={handleLogout}
            activeOpacity={0.7}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Balance */}
        <Text style={styles.balanceLabel}>TOTAL BALANCE</Text>
        <Text style={styles.balanceAmount}>
          $
          {totalBalance.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
        {primaryAccount && (
          <TouchableOpacity
            style={styles.accountPill}
            onPress={() =>
              navigation.navigate('AccountDetails', {
                accountId: primaryAccount.id,
              })
            }
            activeOpacity={0.8}>
            <Text style={styles.accountPillText}>
              {primaryAccount.accountType} · ****
              {String(primaryAccount.accountNumber).slice(-4)}
            </Text>
            <Text style={styles.accountPillArrow}> ›</Text>
          </TouchableOpacity>
        )}
        {error && <Text style={styles.heroBannerError}>⚠ {error}</Text>}

        {/* CTAs */}
        <View style={styles.heroCtas}>
          <TouchableOpacity
            style={styles.heroCtaBtn}
            onPress={() =>
              navigation.navigate(
                'Transactions',
                primaryAccount ? {accountId: primaryAccount.id} : {},
              )
            }
            activeOpacity={0.8}>
            <Text style={styles.heroCtaText}>↕ Transfer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.heroCtaBtn, styles.heroCtaBtnOutline]}
            onPress={() =>
              primaryAccount &&
              navigation.navigate('AccountDetails', {
                accountId: primaryAccount.id,
              })
            }
            activeOpacity={0.8}>
            <Text style={[styles.heroCtaText, styles.heroCtaTextOutline]}>
              📄 Statement
            </Text>
          </TouchableOpacity>
        </View>

        {/* decorative circles */}
        <View style={styles.decor1} pointerEvents="none" />
        <View style={styles.decor2} pointerEvents="none" />
      </View>

      <View style={styles.bodyPad}>
        {/* ── Stat Cards ──────────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statScroll}
          contentContainerStyle={styles.statScrollContent}>
          {statCards.map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
              <View
                style={[
                  styles.statBadge,
                  {backgroundColor: s.up ? '#ecfdf5' : '#fef2f2'},
                ]}>
                <Text
                  style={[
                    styles.statBadgeText,
                    {color: s.up ? colors.success : colors.error},
                  ]}>
                  {s.up ? '▲' : '▼'} {s.change}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* ── Quick Actions ────────────────────────────────────── */}
        <Text style={commonStyles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map(a => (
            <TouchableOpacity
              key={a.screen}
              style={[styles.actionCard]}
              onPress={() =>
                navigation.navigate(a.screen as any, a.params as any)
              }
              activeOpacity={0.75}>
              <View style={[styles.actionIconBox, {backgroundColor: a.bg}]}>
                <Text style={styles.actionIcon}>{a.icon}</Text>
              </View>
              <Text style={[styles.actionLabel, {color: a.color}]}>
                {a.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Accounts ─────────────────────────────────────────── */}
        {accounts.length > 0 && (
          <>
            <Text style={commonStyles.sectionTitle}>Your Accounts</Text>
            {accounts.map(acc => (
              <TouchableOpacity
                key={acc.id}
                style={styles.accountCard}
                onPress={() =>
                  navigation.navigate('AccountDetails', {accountId: acc.id})
                }
                activeOpacity={0.8}>
                <View style={styles.accountCardLeft}>
                  <View style={styles.accountIcon}>
                    <Text style={styles.accountIconText}>🏦</Text>
                  </View>
                  <View>
                    <Text style={styles.accountType}>{acc.accountType}</Text>
                    <Text style={styles.accountNum}>
                      ****{String(acc.accountNumber).slice(-4)}
                    </Text>
                  </View>
                </View>
                <View style={styles.accountCardRight}>
                  <Text style={styles.accountBal}>
                    $
                    {acc.balance.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor:
                          acc.status === 'ACTIVE' ? '#ecfdf5' : '#fffbeb',
                      },
                    ]}>
                    <Text
                      style={[
                        styles.statusPillText,
                        {
                          color:
                            acc.status === 'ACTIVE'
                              ? colors.success
                              : colors.warning,
                        },
                      ]}>
                      {acc.status === 'ACTIVE' ? 'Active' : acc.status}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        <View style={styles.bottomSpacer} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.background},

  /* Hero */
  heroBanner: {
    backgroundColor: colors.gradientStart,
    paddingHorizontal: 22,
    paddingTop: 56,
    paddingBottom: 32,
    overflow: 'hidden',
    position: 'relative',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greeting: {fontSize: 15, color: 'rgba(255,255,255,0.7)', fontWeight: '400'},
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -0.3,
  },
  heroSub: {fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2},
  signOutBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  signOutText: {fontSize: 13, color: colors.white, fontWeight: '500'},
  balanceLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -1.5,
    marginBottom: 14,
  },
  accountPill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    marginBottom: 20,
  },
  accountPillText: {fontSize: 13, color: colors.white, fontWeight: '500'},
  accountPillArrow: {fontSize: 16, color: 'rgba(255,255,255,0.7)'},
  heroBannerError: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
  },
  heroCtas: {flexDirection: 'row', gap: 10},
  heroCtaBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  heroCtaBtnOutline: {backgroundColor: 'transparent'},
  heroCtaText: {fontSize: 14, color: colors.white, fontWeight: '600'},
  heroCtaTextOutline: {color: 'rgba(255,255,255,0.85)'},
  decor1: {
    position: 'absolute',
    right: -50,
    top: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  decor2: {
    position: 'absolute',
    right: 40,
    bottom: -80,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  bodyPad: {paddingHorizontal: 20, paddingTop: 20},
  loadingText: {marginTop: 12, fontSize: 15, color: colors.textSecondary},

  /* Stat strip */
  statScroll: {marginBottom: 24},
  statScrollContent: {paddingRight: 4, gap: 12},
  statCard: {
    backgroundColor: colors.backgroundWhite,
    borderRadius: 14,
    padding: 16,
    width: 160,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  statBadge: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  statBadgeText: {fontSize: 11, fontWeight: '600'},

  /* Quick actions */
  actionsGrid: {flexDirection: 'row', gap: 10, marginBottom: 28},
  actionCard: {
    flex: 1,
    backgroundColor: colors.backgroundWhite,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {elevation: 2},
    }),
  },
  actionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionIcon: {fontSize: 22},
  actionLabel: {fontSize: 12, fontWeight: '600'},

  /* Account cards */
  accountCard: {
    backgroundColor: colors.backgroundWhite,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {elevation: 2},
    }),
  },
  accountCardLeft: {flexDirection: 'row', alignItems: 'center', gap: 12},
  accountIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountIconText: {fontSize: 20},
  accountType: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  accountNum: {fontSize: 13, color: colors.textSecondary},
  accountCardRight: {alignItems: 'flex-end', gap: 6},
  accountBal: {fontSize: 16, fontWeight: '700', color: colors.primary},
  statusPill: {borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3},
  statusPillText: {fontSize: 11, fontWeight: '600'},

  bottomSpacer: {height: 40},
});

export default DashboardScreen;
