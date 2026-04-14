import {type RouteProp, useRoute} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
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

type TransactionDetailsRoute = RouteProp<
  RootStackParamList,
  'TransactionDetails'
>;

interface TransactionData {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  category?: string;
  merchantName?: string;
  reference?: string;
  status?: string;
  accountId?: string;
  fee?: number;
}

const TransactionDetailsScreen = () => {
  const route = useRoute<TransactionDetailsRoute>();
  const {transactionId, transaction: passedTx} = route.params;
  const [tx, setTx] = useState<TransactionData | null>(
    (passedTx as TransactionData) || null,
  );
  const [loading, setLoading] = useState(!passedTx);
  const [error, setError] = useState<string | null>(null);

  const fetchTx = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTransactionDetails(transactionId);
      setTx(res.data);
    } catch (e: any) {
      setError(
        e.response?.data?.message || e.message || 'Failed to load transaction.',
      );
    } finally {
      setLoading(false);
    }
  }, [transactionId]);

  useEffect(() => {
    if (!passedTx) fetchTx();
  }, [fetchTx, passedTx]);

  if (loading)
    return (
      <View style={commonStyles.centerContent}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading transaction...</Text>
      </View>
    );

  if (error || !tx)
    return (
      <View style={commonStyles.centerContent}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={commonStyles.emptyStateTitle}>Failed to load</Text>
        <Text style={commonStyles.emptyStateSubtitle}>{error}</Text>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={fetchTx}
          activeOpacity={0.8}>
          <Text style={styles.retryBtnText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );

  const isCredit = tx.type === 'CREDIT';

  const rows = [
    {label: 'Transaction ID', value: `#${tx.id}`},
    {
      label: 'Date & Time',
      value: new Date(tx.date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    },
    {
      label: 'Type',
      value: isCredit ? 'Credit (Money In)' : 'Debit (Money Out)',
    },
    ...(tx.category ? [{label: 'Category', value: tx.category}] : []),
    ...(tx.merchantName ? [{label: 'Merchant', value: tx.merchantName}] : []),
    ...(tx.reference ? [{label: 'Reference', value: tx.reference}] : []),
    ...(tx.status ? [{label: 'Status', value: tx.status}] : []),
    ...(tx.fee !== undefined
      ? [{label: 'Processing Fee', value: `$${tx.fee.toFixed(2)}`}]
      : []),
  ];

  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      {/* Amount hero */}
      <View
        style={[
          styles.heroBanner,
          {backgroundColor: isCredit ? colors.success : colors.gradientStart},
        ]}>
        <View
          style={[
            styles.txTypeIcon,
            {backgroundColor: 'rgba(255,255,255,0.2)'},
          ]}>
          <Text style={styles.txTypeText}>{isCredit ? '↑' : '↓'}</Text>
        </View>
        <Text style={styles.txLabel}>
          {isCredit ? 'Money Received' : 'Money Sent'}
        </Text>
        <Text style={styles.txAmount}>
          {isCredit ? '+' : '-'}$
          {Math.abs(tx.amount).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
        <Text style={styles.txDesc} numberOfLines={2}>
          {tx.merchantName || tx.description}
        </Text>
        <View style={styles.decor1} />
        <View style={styles.decor2} />
      </View>

      <View style={styles.bodyPad}>
        <Text style={commonStyles.sectionTitle}>Transaction Details</Text>
        <View style={styles.infoCard}>
          {rows.map((r, i) => (
            <View key={r.label}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{r.label}</Text>
                <Text style={styles.infoValue}>{r.value}</Text>
              </View>
              {i < rows.length - 1 && <View style={commonStyles.divider} />}
            </View>
          ))}
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
  retryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  retryBtnText: {color: colors.white, fontWeight: '600'},

  heroBanner: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  txTypeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  txTypeText: {fontSize: 28, fontWeight: '700', color: colors.white},
  txLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
    marginBottom: 8,
  },
  txAmount: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -1.5,
    marginBottom: 8,
  },
  txDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    maxWidth: 280,
  },
  decor1: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  decor2: {
    position: 'absolute',
    left: -30,
    bottom: -50,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  bodyPad: {paddingHorizontal: 20, paddingTop: 24},
  infoCard: {
    backgroundColor: colors.backgroundWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  infoLabel: {fontSize: 14, color: colors.textSecondary, flex: 1},
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    maxWidth: '55%',
    textAlign: 'right',
  },
  bottomSpacer: {height: 40},
});

export default TransactionDetailsScreen;
