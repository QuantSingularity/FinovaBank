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

type AccountDetailsScreenRouteProp = RouteProp<
  RootStackParamList,
  'AccountDetails'
>;

type AccountDetailsScreenNavigationProp = NativeStackNavigationProp<
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
}

const getStatusConfig = (status: string) => {
  switch (status) {
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
      return {color: colors.textSecondary, bg: colors.surface, label: status};
  }
};

const AccountDetailsScreen = () => {
  const route = useRoute<AccountDetailsScreenRouteProp>();
  const navigation = useNavigation<AccountDetailsScreenNavigationProp>();
  const {userData} = useAuth();

  const accountId = route.params?.accountId || (userData?.id ?? '');

  const [accountDetails, setAccountDetails] =
    useState<AccountDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!accountId) {
      setLoading(false);
      setError('No account ID available');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await getAccountDetails(accountId);
      setAccountDetails(response.data);
    } catch (err: unknown) {
      const e = err as {
        response?: {data?: {message?: string}};
        message?: string;
      };
      console.error('Failed to fetch account details:', err);
      const errorMessage =
        e.response?.data?.message ||
        e.message ||
        'Failed to load account details.';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  if (loading) {
    return (
      <View style={commonStyles.centerContent}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading Account Details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={commonStyles.centerContent}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity
          style={[commonStyles.button, styles.actionBtn]}
          onPress={fetchDetails}>
          <Text style={commonStyles.buttonText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backLink}
          onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.backLinkText}>← Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!accountDetails) {
    return (
      <View style={commonStyles.centerContent}>
        <Text style={styles.errorEmoji}>🔍</Text>
        <Text style={styles.errorTitle}>No Account Found</Text>
        <TouchableOpacity
          style={[commonStyles.button, styles.actionBtn]}
          onPress={() => navigation.navigate('Dashboard')}>
          <Text style={commonStyles.buttonText}>Return to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusConfig = getStatusConfig(accountDetails.status);

  const DetailRow = ({
    label,
    value,
    valueStyle,
  }: {
    label: string;
    value: string;
    valueStyle?: object;
  }) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, valueStyle]}>{value}</Text>
    </View>
  );

  return (
    <ScrollView
      style={commonStyles.container}
      showsVerticalScrollIndicator={false}>
      {/* Balance Hero */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceCardLabel}>Current Balance</Text>
        <Text style={styles.balanceCardAmount}>
          $
          {accountDetails.balance.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
        <View style={styles.statusRow}>
          <View
            style={[styles.statusBadge, {backgroundColor: statusConfig.bg}]}>
            <View
              style={[styles.statusDot, {backgroundColor: statusConfig.color}]}
            />
            <Text style={[styles.statusBadgeText, {color: statusConfig.color}]}>
              {statusConfig.label}
            </Text>
          </View>
          <Text style={styles.accountTypeLabel}>
            {accountDetails.accountType}
          </Text>
        </View>
      </View>

      {/* Account Details */}
      <Text style={commonStyles.sectionTitle}>Account Information</Text>
      <View style={commonStyles.card}>
        <DetailRow
          label="Account Number"
          value={accountDetails.accountNumber}
        />
        {accountDetails.routingNumber ? (
          <DetailRow
            label="Routing Number"
            value={accountDetails.routingNumber}
          />
        ) : null}
        <DetailRow
          label="Opened"
          value={new Date(accountDetails.openDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        />
        {accountDetails.interestRate !== undefined ? (
          <DetailRow
            label="Interest Rate"
            value={`${accountDetails.interestRate.toFixed(2)}% APY`}
            valueStyle={styles.interestRateValue}
          />
        ) : null}
      </View>

      {/* Account Owner */}
      <Text style={commonStyles.sectionTitle}>Account Holder</Text>
      <View style={commonStyles.card}>
        <DetailRow label="Full Name" value={accountDetails.name} />
        <DetailRow label="Email" value={accountDetails.email} />
      </View>

      {/* Actions */}
      <Text style={commonStyles.sectionTitle}>Account Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Transactions', {accountId})}
          activeOpacity={0.75}>
          <Text style={styles.actionCardIcon}>↕️</Text>
          <Text style={styles.actionCardLabel}>Transactions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('SavingsGoals', {accountId})}
          activeOpacity={0.75}>
          <Text style={styles.actionCardIcon}>🎯</Text>
          <Text style={styles.actionCardLabel}>Savings Goals</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Loans', {accountId})}
          activeOpacity={0.75}>
          <Text style={styles.actionCardIcon}>🏦</Text>
          <Text style={styles.actionCardLabel}>Loans</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.lastUpdatedText}>
        Last updated: {new Date(accountDetails.lastUpdated).toLocaleString()}
      </Text>
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: colors.textSecondary,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  actionBtn: {
    minWidth: 200,
    marginBottom: 12,
  },
  backLink: {
    paddingVertical: 8,
  },
  backLinkText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '500',
  },
  balanceCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  balanceCardLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  balanceCardAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  accountTypeLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  interestRateValue: {
    color: colors.secondary,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  actionCardIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  actionCardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  lastUpdatedText: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: 8,
  },
  bottomSpacer: {
    height: 32,
  },
});

export default AccountDetailsScreen;
