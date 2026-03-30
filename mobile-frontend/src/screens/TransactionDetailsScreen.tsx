import {
  type RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {useEffect, useState} from 'react';
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

// Define the route prop type for this screen
type TransactionDetailsScreenRouteProp = RouteProp<
  RootStackParamList,
  'TransactionDetails'
>;

// Define the structure for transaction details
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

const TransactionDetailsScreen = () => {
  const route = useRoute<TransactionDetailsScreenRouteProp>();
  const navigation = useNavigation();
  const [transaction, setTransaction] = useState<TransactionDetails | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get transaction from route params (may include immediate data)
  const transactionId = route.params?.transactionId;
  const initialTransaction = route.params?.transaction;

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      if (!transactionId) {
        setLoading(false);
        setError('No transaction ID provided');
        return;
      }

      // If we have initial transaction data, show it immediately
      if (initialTransaction) {
        setTransaction(initialTransaction as TransactionDetails);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await getTransactionDetails(transactionId);
        setTransaction(response.data);
      } catch (err: any) {
        console.error('Failed to fetch transaction details:', err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          'Failed to load transaction details.';
        setError(errorMessage);
        Alert.alert('Error', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionDetails();
  }, [transactionId, initialTransaction]);

  if (loading) {
    return (
      <View style={[commonStyles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading Transaction Details...</Text>
      </View>
    );
  }

  if (error || !transaction) {
    return (
      <View style={[commonStyles.container, styles.centerContent]}>
        <Text style={commonStyles.errorText}>
          {error || 'Transaction not found'}
        </Text>
        <TouchableOpacity
          style={[commonStyles.button, styles.retryButton]}
          onPress={() => navigation.goBack()}>
          <Text style={commonStyles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return colors.success;
      case 'PENDING':
        return colors.warning;
      case 'FAILED':
      case 'CANCELLED':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <ScrollView style={commonStyles.container}>
      <Text style={commonStyles.titleText}>Transaction Details</Text>

      {/* Transaction Amount Card */}
      <View style={[commonStyles.card, styles.amountCard]}>
        <Text style={styles.amountLabel}>Amount</Text>
        <Text
          style={[
            styles.amount,
            transaction.type === 'CREDIT'
              ? styles.creditAmount
              : styles.debitAmount,
          ]}>
          {transaction.type === 'CREDIT' ? '+' : '-'}$
          {transaction.amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
        <Text
          style={[
            styles.statusText,
            {color: getStatusColor(transaction.status)},
          ]}>
          {transaction.status}
        </Text>
      </View>

      {/* Transaction Details Card */}
      <View style={[commonStyles.card, styles.detailsCard]}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Description</Text>
          <Text style={styles.detailValue}>{transaction.description}</Text>
        </View>

        {transaction.merchantName && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Merchant</Text>
            <Text style={styles.detailValue}>{transaction.merchantName}</Text>
          </View>
        )}

        {transaction.merchantAddress && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue}>
              {transaction.merchantAddress}
            </Text>
          </View>
        )}

        {transaction.category && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category</Text>
            <Text style={styles.detailValue}>{transaction.category}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Transaction ID</Text>
          <Text style={[styles.detailValue, styles.monoText]}>
            {transaction.id}
          </Text>
        </View>

        {transaction.reference && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Reference</Text>
            <Text style={[styles.detailValue, styles.monoText]}>
              {transaction.reference}
            </Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date & Time</Text>
          <Text style={styles.detailValue}>
            {new Date(transaction.date).toLocaleString()}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Type</Text>
          <Text style={styles.detailValue}>{transaction.type}</Text>
        </View>

        <View style={[styles.detailRow, styles.lastDetailRow]}>
          <Text style={styles.detailLabel}>Balance After</Text>
          <Text style={[styles.detailValue, styles.balanceValue]}>
            $
            {transaction.balance.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>

        {transaction.note && (
          <View style={[styles.noteContainer, styles.lastDetailRow]}>
            <Text style={styles.detailLabel}>Note</Text>
            <Text style={styles.noteText}>{transaction.note}</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[commonStyles.button, styles.actionButton]}
          onPress={() => navigation.goBack()}>
          <Text style={commonStyles.buttonText}>Back to Transactions</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textSecondary,
  },
  retryButton: {
    marginTop: 15,
    backgroundColor: colors.secondary,
  },
  amountCard: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  amountLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  amount: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  creditAmount: {
    color: colors.success,
  },
  debitAmount: {
    color: colors.error,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailsCard: {
    marginBottom: 20,
  },
  detailRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lastDetailRow: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  monoText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 14,
  },
  balanceValue: {
    fontWeight: 'bold',
    color: colors.primary,
    fontSize: 18,
  },
  noteContainer: {
    paddingTop: 12,
  },
  noteText: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  actionsContainer: {
    marginBottom: 30,
  },
  actionButton: {
    marginBottom: 10,
  },
});

export default TransactionDetailsScreen;
