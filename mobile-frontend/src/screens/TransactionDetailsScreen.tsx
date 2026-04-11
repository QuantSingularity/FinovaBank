import {
  type RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
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
import type {RootStackParamList} from '../navigation/AppNavigator';
import {getTransactionDetails} from '../services/api';
import {colors, commonStyles} from '../styles/commonStyles';

type TransactionDetailsScreenRouteProp = RouteProp<
  RootStackParamList,
  'TransactionDetails'
>;

interface TransactionDetails {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  category?: string;
  merchantName?: string;
  merchantAddress?: string;
  reference?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  accountId: string;
  balance: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return {color: colors.success, bg: colors.successLight, icon: '✓'};
    case 'PENDING':
      return {color: colors.warning, bg: colors.warningLight, icon: '⏳'};
    case 'FAILED':
      return {color: colors.error, bg: colors.errorLight, icon: '✕'};
    case 'CANCELLED':
      return {color: colors.textSecondary, bg: colors.surface, icon: '✕'};
    default:
      return {color: colors.textSecondary, bg: colors.surface, icon: '?'};
  }
};

const TransactionDetailsScreen = () => {
  const route = useRoute<TransactionDetailsScreenRouteProp>();
  const navigation = useNavigation();
  const [transaction, setTransaction] = useState<TransactionDetails | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const transactionId = route.params?.transactionId;
  const initialTransaction = route.params?.transaction;

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      if (!transactionId) {
        setLoading(false);
        setError('No transaction ID provided');
        return;
      }

      if (initialTransaction) {
        setTransaction(initialTransaction as unknown as TransactionDetails);
        setLoading(false);
        // Silently refresh in background for full details
        try {
          const response = await getTransactionDetails(transactionId);
          setTransaction(response.data);
        } catch {
          // Keep showing initial data if refresh fails
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await getTransactionDetails(transactionId);
        setTransaction(response.data);
      } catch (err: unknown) {
        const e = err as {
          response?: {data?: {message?: string}};
          message?: string;
        };
        console.error('Failed to fetch transaction details:', err);
        const errorMessage =
          e.response?.data?.message ||
          e.message ||
          'Failed to load transaction details.';
        setError(errorMessage);
        Alert.alert('Error', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionDetails();
  }, [transactionId]); // Removed initialTransaction from deps - we only want to fetch once

  if (loading) {
    return (
      <View style={commonStyles.centerContent}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading Transaction Details...</Text>
      </View>
    );
  }

  if (error || !transaction) {
    return (
      <View style={commonStyles.centerContent}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorTitle}>Transaction Not Found</Text>
        <Text style={styles.errorMessage}>
          {error || 'Transaction data unavailable'}
        </Text>
        <TouchableOpacity
          style={[commonStyles.button, styles.backBtn]}
          onPress={() => navigation.goBack()}>
          <Text style={commonStyles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isCredit = transaction.type === 'CREDIT';
  const statusConfig = getStatusConfig(transaction.status);

  const DetailBlock = ({
    label,
    value,
    mono = false,
  }: {
    label: string;
    value: string;
    mono?: boolean;
  }) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, mono ? styles.monoText : null]}>
        {value}
      </Text>
    </View>
  );

  return (
    <ScrollView
      style={commonStyles.container}
      showsVerticalScrollIndicator={false}>
      {/* Amount Hero Card */}
      <View
        style={[
          styles.amountCard,
          isCredit ? styles.creditCard : styles.debitCard,
        ]}>
        <View style={[styles.statusPill, {backgroundColor: statusConfig.bg}]}>
          <Text style={[styles.statusPillText, {color: statusConfig.color}]}>
            {statusConfig.icon} {transaction.status}
          </Text>
        </View>
        <Text style={styles.amountLabel}>
          {isCredit ? 'Money Received' : 'Money Sent'}
        </Text>
        <Text
          style={[
            styles.amount,
            isCredit ? styles.creditAmount : styles.debitAmount,
          ]}>
          {isCredit ? '+' : '-'}$
          {transaction.amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
        <Text style={styles.dateText}>
          {new Date(transaction.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>

      {/* Transaction Details */}
      <Text style={commonStyles.sectionTitle}>Details</Text>
      <View style={commonStyles.card}>
        <DetailBlock label="Description" value={transaction.description} />
        {transaction.merchantName ? (
          <DetailBlock label="Merchant" value={transaction.merchantName} />
        ) : null}
        {transaction.merchantAddress ? (
          <DetailBlock label="Location" value={transaction.merchantAddress} />
        ) : null}
        {transaction.category ? (
          <DetailBlock label="Category" value={transaction.category} />
        ) : null}
        <DetailBlock
          label="Type"
          value={isCredit ? 'Credit (Incoming)' : 'Debit (Outgoing)'}
        />
        <DetailBlock
          label="Balance After"
          value={`$${transaction.balance.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
        />
      </View>

      {/* Reference Details */}
      <Text style={commonStyles.sectionTitle}>Reference</Text>
      <View style={commonStyles.card}>
        <DetailBlock label="Transaction ID" value={transaction.id} mono />
        {transaction.reference ? (
          <DetailBlock label="Reference" value={transaction.reference} mono />
        ) : null}
        <DetailBlock
          label="Date & Time"
          value={new Date(transaction.date).toLocaleString()}
        />
      </View>

      {transaction.note ? (
        <>
          <Text style={commonStyles.sectionTitle}>Note</Text>
          <View style={[commonStyles.card, styles.noteCard]}>
            <Text style={styles.noteText}>{transaction.note}</Text>
          </View>
        </>
      ) : null}

      <TouchableOpacity
        style={[commonStyles.button, styles.backButton]}
        onPress={() => navigation.goBack()}>
        <Text style={commonStyles.buttonText}>← Back to Transactions</Text>
      </TouchableOpacity>

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
  errorEmoji: {fontSize: 48, marginBottom: 16},
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  backBtn: {minWidth: 160},
  amountCard: {
    borderRadius: 20,
    padding: 28,
    marginBottom: 24,
    alignItems: 'center',
  },
  creditCard: {
    backgroundColor: colors.success,
    shadowColor: colors.success,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  debitCard: {
    backgroundColor: colors.error,
    shadowColor: colors.error,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  statusPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  amountLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  amount: {
    fontSize: 44,
    fontWeight: '700',
    letterSpacing: -1,
    marginBottom: 8,
  },
  creditAmount: {color: colors.white},
  debitAmount: {color: colors.white},
  dateText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  detailRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  detailLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  monoText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 13,
    color: colors.textSecondary,
  },
  noteCard: {backgroundColor: colors.primaryLight},
  noteText: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  backButton: {
    marginBottom: 8,
    borderRadius: 14,
  },
  bottomSpacer: {height: 32},
});

export default TransactionDetailsScreen;
