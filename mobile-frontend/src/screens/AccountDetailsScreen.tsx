import {
  type RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useAuth} from '../context/AuthContext';
import type {RootStackParamList} from '../navigation/AppNavigator';
import {getAccountDetails} from '../services/api';
import {colors, commonStyles} from '../styles/commonStyles';

type AccountDetailsRoute = RouteProp<RootStackParamList, 'AccountDetails'>;
type AccountDetailsNav = NativeStackNavigationProp<
  RootStackParamList,
  'AccountDetails'
>;

interface AccountDetailsData {
  accountId: string;
  name: string;
  email: string;
  balance: number;
  accountType: string;
  accountNumber: string;
  routingNumber?: string;
  openDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'FROZEN' | 'CLOSED';
  interestRate?: number;
  lastUpdated: string;
  currency?: string;
}

const statusConfig = (s: string) => {
  switch (s) {
    case 'ACTIVE':
      return {color: colors.success, bg: colors.successLight, label: 'Active'};
    case 'INACTIVE':
      return {
        color: colors.warning,
        bg: colors.warningLight,
        label: 'Inactive',
      };
    case 'FROZEN':
      return {color: colors.error, bg: colors.errorLight, label: 'Frozen'};
    case 'CLOSED':
      return {color: colors.textSecondary, bg: colors.surface, label: 'Closed'};
    default:
      return {color: colors.textSecondary, bg: colors.surface, label: s};
  }
};

const AccountDetailsScreen = () => {
  const route = useRoute<AccountDetailsRoute>();
  const navigation = useNavigation<AccountDetailsNav>();
  const {userData} = useAuth();
  const accountId = route.params?.accountId || userData?.id || '';
  const [account, setAccount] = useState<AccountDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!accountId) {
      setLoading(false);
      setError('No account ID.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await getAccountDetails(accountId);
      setAccount(res.data);
    } catch (e: any) {
      setError(
        e.response?.data?.message ||
          e.message ||
          'Failed to load account details.',
      );
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  if (loading)
    return (
      <View style={commonStyles.centerContent}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading account details...</Text>
      </View>
    );

  if (error || !account)
    return (
      <View style={commonStyles.centerContent}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorTitle}>Unable to load account</Text>
        <Text style={styles.errorMsg}>{error}</Text>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={fetchDetails}
          activeOpacity={0.8}>
          <Text style={styles.retryBtnText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );

  const sc = statusConfig(account.status);

  const infoRows = [
    {label: 'Account Number', value: account.accountNumber},
    {label: 'Routing Number', value: account.routingNumber || 'N/A'},
    {label: 'Account Type', value: account.accountType},
    {label: 'Currency', value: account.currency || 'USD'},
    {
      label: 'Opened',
      value: new Date(account.openDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    },
    {
      label: 'Last Updated',
      value: new Date(account.lastUpdated).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    },
    ...(account.interestRate
      ? [{label: 'Interest Rate', value: `${account.interestRate}% APY`}]
      : []),
  ];

  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      {/* Balance hero card */}
      <View style={styles.heroBanner}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroLabel}>ACCOUNT BALANCE</Text>
            <Text style={styles.heroBalance}>
              $
              {account.balance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {backgroundColor: 'rgba(255,255,255,0.2)'},
            ]}>
            <Text style={styles.statusBadgeText}>{sc.label}</Text>
          </View>
        </View>
        <Text style={styles.heroAccountType}>{account.accountType}</Text>
        <Text style={styles.heroAccountNum}>
          ****{String(account.accountNumber).slice(-4)}
        </Text>
        <View style={styles.decor1} />
        <View style={styles.decor2} />
      </View>

      <View style={styles.bodyPad}>
        {/* Action row */}
        <View style={styles.actionRow}>
          {[
            {
              icon: '↕',
              label: 'Transfer',
              onPress: () => navigation.navigate('Transactions', {accountId}),
            },
            {
              icon: '📊',
              label: 'Transactions',
              onPress: () => navigation.navigate('Transactions', {accountId}),
            },
            {
              icon: '🏦',
              label: 'Loans',
              onPress: () => navigation.navigate('Loans', {accountId}),
            },
            {
              icon: '🎯',
              label: 'Savings',
              onPress: () => navigation.navigate('SavingsGoals', {accountId}),
            },
          ].map(a => (
            <TouchableOpacity
              key={a.label}
              style={styles.actionBtn}
              onPress={a.onPress}
              activeOpacity={0.75}>
              <View style={styles.actionIconBox}>
                <Text style={styles.actionIcon}>{a.icon}</Text>
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Account holder */}
        <Text style={commonStyles.sectionTitle}>Account Holder</Text>
        <View style={styles.infoCard}>
          <View style={styles.holderRow}>
            <View style={styles.holderAvatar}>
              <Text style={styles.holderAvatarText}>
                {account.name?.charAt(0) || 'U'}
              </Text>
            </View>
            <View>
              <Text style={styles.holderName}>{account.name}</Text>
              <Text style={styles.holderEmail}>{account.email}</Text>
            </View>
          </View>
        </View>

        {/* Account details */}
        <Text style={commonStyles.sectionTitle}>Account Details</Text>
        <View style={styles.infoCard}>
          {infoRows.map((r, i) => (
            <View key={r.label}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{r.label}</Text>
                <Text style={styles.infoValue}>{r.value}</Text>
              </View>
              {i < infoRows.length - 1 && <View style={commonStyles.divider} />}
            </View>
          ))}
        </View>

        {/* Danger zone */}
        <View style={styles.dangerCard}>
          <Text style={styles.dangerTitle}>Account Actions</Text>
          <TouchableOpacity
            style={styles.dangerBtn}
            onPress={() =>
              Alert.alert(
                'Freeze Account',
                'Are you sure you want to freeze this account?',
                [
                  {text: 'Cancel', style: 'cancel'},
                  {text: 'Freeze', style: 'destructive', onPress: () => {}},
                ],
              )
            }
            activeOpacity={0.8}>
            <Text style={styles.dangerBtnText}>❄️ Freeze Account</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.background},
  loadingText: {marginTop: 12, fontSize: 15, color: colors.textSecondary},
  errorEmoji: {fontSize: 40, marginBottom: 12},
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  errorMsg: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryBtnText: {color: colors.white, fontWeight: '600', fontSize: 15},

  heroBanner: {
    backgroundColor: colors.gradientStart,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 32,
    overflow: 'hidden',
    position: 'relative',
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  heroBalance: {
    fontSize: 38,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -1.5,
  },
  heroAccountType: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
    marginBottom: 4,
  },
  heroAccountNum: {fontSize: 13, color: 'rgba(255,255,255,0.55)'},
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  statusBadgeText: {fontSize: 12, color: colors.white, fontWeight: '600'},
  decor1: {
    position: 'absolute',
    right: -50,
    top: -50,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  decor2: {
    position: 'absolute',
    right: 30,
    bottom: -70,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  bodyPad: {paddingHorizontal: 20, paddingTop: 20},

  actionRow: {flexDirection: 'row', gap: 10, marginBottom: 28},
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.backgroundWhite,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionIcon: {fontSize: 18},
  actionLabel: {fontSize: 11, fontWeight: '600', color: colors.textSecondary},

  infoCard: {
    backgroundColor: colors.backgroundWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  infoLabel: {fontSize: 14, color: colors.textSecondary},
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    maxWidth: '55%',
    textAlign: 'right',
  },

  holderRow: {flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12},
  holderAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  holderAvatarText: {fontSize: 20, fontWeight: '700', color: colors.primary},
  holderName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  holderEmail: {fontSize: 13, color: colors.textSecondary},

  dangerCard: {
    backgroundColor: colors.backgroundWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 24,
  },
  dangerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  dangerBtn: {
    borderWidth: 1.5,
    borderColor: colors.error,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dangerBtnText: {fontSize: 14, color: colors.error, fontWeight: '600'},

  bottomSpacer: {height: 40},
});

export default AccountDetailsScreen;
