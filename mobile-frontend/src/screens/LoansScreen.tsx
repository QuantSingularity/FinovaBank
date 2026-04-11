import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useAuth} from '../context/AuthContext';
import type {RootStackParamList} from '../navigation/AppNavigator';
import {applyForLoan, getAccountLoans, getLoanTypes} from '../services/api';
import {colors, commonStyles} from '../styles/commonStyles';

interface Loan {
  id: string;
  type: string;
  amount: number;
  interestRate: number;
  term: number;
  monthlyPayment: number;
  remainingBalance: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'PAID';
  appliedDate: string;
  approvalDate?: string;
}

interface LoanType {
  id: string;
  name: string;
  maxAmount: number;
  baseRate: number;
}

type LoansScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Loans'
>;

interface Props {
  route: {params?: {accountId?: string}};
}

const getStatusConfig = (status: Loan['status']) => {
  switch (status) {
    case 'APPROVED':
    case 'ACTIVE':
      return {color: colors.success, bg: colors.successLight};
    case 'PENDING':
      return {color: colors.warning, bg: colors.warningLight};
    case 'REJECTED':
      return {color: colors.error, bg: colors.errorLight};
    case 'PAID':
      return {color: colors.textSecondary, bg: colors.surface};
    default:
      return {color: colors.textSecondary, bg: colors.surface};
  }
};

interface LoanApplicationFormProps {
  loanTypes: LoanType[];
  onClose: () => void;
  onSubmit: (loanData: {
    loanType: string;
    amount: number;
    term: number;
    purpose: string;
  }) => Promise<void>;
}

const LoanApplicationForm = ({
  loanTypes,
  onClose,
  onSubmit,
}: LoanApplicationFormProps) => {
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [amount, setAmount] = useState('');
  const [term, setTerm] = useState('');
  const [purpose, setPurpose] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const selectedType = loanTypes.find(t => t.id === selectedTypeId);

  const handleSubmit = async () => {
    setFormError('');
    if (!selectedTypeId) {
      setFormError('Please select a loan type.');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError('Please enter a valid loan amount.');
      return;
    }
    if (selectedType && parsedAmount > selectedType.maxAmount) {
      setFormError(
        `Maximum amount for this loan type is $${selectedType.maxAmount.toLocaleString()}.`,
      );
      return;
    }
    const parsedTerm = parseInt(term, 10);
    if (!term || isNaN(parsedTerm) || parsedTerm <= 0 || parsedTerm > 360) {
      setFormError('Please enter a valid term (1-360 months).');
      return;
    }
    if (!purpose.trim()) {
      setFormError('Please describe the purpose of this loan.');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        loanType: selectedTypeId,
        amount: parsedAmount,
        term: parsedTerm,
        purpose: purpose.trim(),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.formScroll} keyboardShouldPersistTaps="handled">
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>Apply for a Loan</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      {formError ? (
        <View style={commonStyles.errorContainer}>
          <Text style={commonStyles.errorText}>{formError}</Text>
        </View>
      ) : null}

      <Text style={styles.formLabel}>Loan Type</Text>
      <View style={styles.loanTypesGrid}>
        {loanTypes.map(type => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.loanTypeChip,
              selectedTypeId === type.id && styles.loanTypeChipSelected,
            ]}
            onPress={() => setSelectedTypeId(type.id)}
            activeOpacity={0.75}>
            <Text
              style={[
                styles.loanTypeChipText,
                selectedTypeId === type.id && styles.loanTypeChipTextSelected,
              ]}>
              {type.name}
            </Text>
            <Text
              style={[
                styles.loanTypeRate,
                selectedTypeId === type.id && styles.loanTypeRateSelected,
              ]}>
              {type.baseRate}% APR
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedType ? (
        <View style={styles.loanTypeInfo}>
          <Text style={styles.loanTypeInfoText}>
            Max amount: ${selectedType.maxAmount.toLocaleString()} · Base rate:{' '}
            {selectedType.baseRate}%
          </Text>
        </View>
      ) : null}

      <Text style={styles.formLabel}>Loan Amount ($)</Text>
      <TextInput
        style={commonStyles.input}
        value={amount}
        onChangeText={setAmount}
        placeholder="e.g. 10000"
        placeholderTextColor={colors.textTertiary}
        keyboardType="decimal-pad"
      />

      <Text style={styles.formLabel}>Loan Term (months)</Text>
      <TextInput
        style={commonStyles.input}
        value={term}
        onChangeText={setTerm}
        placeholder="e.g. 36"
        placeholderTextColor={colors.textTertiary}
        keyboardType="number-pad"
      />

      <Text style={styles.formLabel}>Purpose</Text>
      <TextInput
        style={[commonStyles.input, styles.purposeInput]}
        value={purpose}
        onChangeText={setPurpose}
        placeholder="Describe why you need this loan..."
        placeholderTextColor={colors.textTertiary}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      <View style={styles.formButtons}>
        <TouchableOpacity
          style={[
            commonStyles.button,
            commonStyles.buttonOutline,
            styles.cancelFormBtn,
          ]}
          onPress={onClose}
          disabled={submitting}>
          <Text style={commonStyles.buttonTextOutline}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            commonStyles.button,
            styles.submitBtn,
            submitting && styles.disabledBtn,
          ]}
          onPress={handleSubmit}
          disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Text style={commonStyles.buttonText}>Submit</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const LoansScreen = ({route}: Props) => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [loanTypes, setLoanTypes] = useState<LoanType[]>([]);

  const navigation = useNavigation<LoansScreenNavigationProp>();
  const {userData} = useAuth();

  const accountId = route?.params?.accountId || (userData?.id ?? '');

  const fetchLoans = useCallback(async () => {
    if (!accountId) {
      setLoading(false);
      setError('No account ID available');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [loansResponse, typesResponse] = await Promise.all([
        getAccountLoans(accountId),
        getLoanTypes(),
      ]);
      setLoans(Array.isArray(loansResponse.data) ? loansResponse.data : []);
      setLoanTypes(Array.isArray(typesResponse.data) ? typesResponse.data : []);
    } catch (err: unknown) {
      const e = err as {
        response?: {data?: {message?: string}};
        message?: string;
      };
      console.error('Failed to fetch loans:', err);
      const errorMessage =
        e.response?.data?.message || e.message || 'Failed to load loans.';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const handleLoanSubmit = async (loanData: {
    loanType: string;
    amount: number;
    term: number;
    purpose: string;
  }) => {
    try {
      await applyForLoan({...loanData, accountId});
      await fetchLoans();
      setShowLoanForm(false);
      Alert.alert(
        'Application Submitted',
        'Your loan application has been submitted successfully. You will be notified once it is reviewed.',
      );
    } catch (err: unknown) {
      const e = err as {
        response?: {data?: {message?: string}};
        message?: string;
      };
      const errorMessage =
        e.response?.data?.message ||
        e.message ||
        'Failed to submit loan application.';
      Alert.alert('Error', errorMessage);
      throw err;
    }
  };

  const renderLoanItem = ({item}: {item: Loan}) => {
    const statusConfig = getStatusConfig(item.status);
    const progressPct =
      item.status === 'ACTIVE'
        ? Math.round(
            ((item.amount - item.remainingBalance) / item.amount) * 100,
          )
        : 0;

    return (
      <View style={styles.loanCard}>
        <View style={commonStyles.spaceBetween}>
          <View style={styles.loanLeft}>
            <Text style={styles.loanType}>{item.type}</Text>
            <Text style={styles.loanDate}>
              Applied{' '}
              {new Date(item.appliedDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>
          <View
            style={[
              styles.loanStatusBadge,
              {backgroundColor: statusConfig.bg},
            ]}>
            <Text style={[styles.loanStatusText, {color: statusConfig.color}]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.loanAmountRow}>
          <View style={styles.loanAmountBlock}>
            <Text style={styles.loanAmountLabel}>Amount</Text>
            <Text style={styles.loanAmountValue}>
              $
              {item.amount.toLocaleString(undefined, {
                minimumFractionDigits: 0,
              })}
            </Text>
          </View>
          <View style={styles.loanAmountBlock}>
            <Text style={styles.loanAmountLabel}>Rate</Text>
            <Text style={styles.loanAmountValue}>{item.interestRate}% APR</Text>
          </View>
          <View style={styles.loanAmountBlock}>
            <Text style={styles.loanAmountLabel}>Term</Text>
            <Text style={styles.loanAmountValue}>{item.term} mo.</Text>
          </View>
        </View>

        {item.status === 'ACTIVE' && (
          <>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Repayment Progress</Text>
              <Text style={styles.progressPct}>{progressPct}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[styles.progressBarFill, {width: `${progressPct}%`}]}
              />
            </View>
            <View style={commonStyles.spaceBetween}>
              <Text style={styles.remainingLabel}>Remaining</Text>
              <Text style={styles.remainingValue}>
                $
                {item.remainingBalance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>
            <View style={[commonStyles.spaceBetween, {marginTop: 6}]}>
              <Text style={styles.remainingLabel}>Monthly Payment</Text>
              <Text style={[styles.remainingValue, {color: colors.success}]}>
                $
                {item.monthlyPayment.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>
          </>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={commonStyles.centerContent}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading Loans...</Text>
      </View>
    );
  }

  if (error && !loans.length) {
    return (
      <View style={commonStyles.centerContent}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorTitle}>Unable to Load Loans</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity
          style={[commonStyles.button, styles.retryBtn]}
          onPress={fetchLoans}>
          <Text style={commonStyles.buttonText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dashboardLink}
          onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.dashboardLinkText}>← Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (showLoanForm) {
    return (
      <View style={[commonStyles.container, {flex: 1}]}>
        <LoanApplicationForm
          loanTypes={loanTypes}
          onClose={() => setShowLoanForm(false)}
          onSubmit={handleLoanSubmit}
        />
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.spaceBetween}>
        <Text style={styles.screenTitle}>
          {loans.length > 0
            ? `${loans.length} Loan${loans.length !== 1 ? 's' : ''}`
            : 'Your Loans'}
        </Text>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => setShowLoanForm(true)}
          activeOpacity={0.85}>
          <Text style={styles.applyButtonText}>+ Apply</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={loans}
        renderItem={renderLoanItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <View style={commonStyles.emptyStateContainer}>
            <Text style={styles.emptyIcon}>🏦</Text>
            <Text style={commonStyles.emptyStateTitle}>No Loans Yet</Text>
            <Text style={commonStyles.emptyStateSubtitle}>
              Apply for a loan to get started with competitive rates.
            </Text>
            <TouchableOpacity
              style={[commonStyles.button, styles.emptyApplyBtn]}
              onPress={() => setShowLoanForm(true)}>
              <Text style={commonStyles.buttonText}>Apply for a Loan</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={
          loans.length === 0 ? {flex: 1} : {paddingBottom: 24}
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingText: {marginTop: 12, fontSize: 15, color: colors.textSecondary},
  errorEmoji: {fontSize: 48, marginBottom: 16},
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
  },
  retryBtn: {minWidth: 160, marginBottom: 12},
  dashboardLink: {paddingVertical: 8},
  dashboardLinkText: {color: colors.primary, fontSize: 15, fontWeight: '500'},
  screenTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  applyButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 16,
  },
  applyButtonText: {color: colors.white, fontWeight: '700', fontSize: 15},
  emptyIcon: {fontSize: 48, marginBottom: 8},
  emptyApplyBtn: {marginTop: 16, minWidth: 200},
  loanCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  loanLeft: {flex: 1, marginRight: 10},
  loanType: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 3,
  },
  loanDate: {fontSize: 13, color: colors.textSecondary},
  loanStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  loanStatusText: {fontSize: 12, fontWeight: '700'},
  loanAmountRow: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    marginBottom: 12,
  },
  loanAmountBlock: {flex: 1, alignItems: 'center'},
  loanAmountLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  loanAmountValue: {fontSize: 15, fontWeight: '700', color: colors.textPrimary},
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {fontSize: 13, color: colors.textSecondary, fontWeight: '500'},
  progressPct: {fontSize: 13, color: colors.primary, fontWeight: '700'},
  progressBarBg: {
    height: 6,
    backgroundColor: colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  remainingLabel: {fontSize: 13, color: colors.textSecondary},
  remainingValue: {fontSize: 14, fontWeight: '700', color: colors.textPrimary},
  // Form styles
  formScroll: {flex: 1},
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {fontSize: 15, color: colors.textSecondary, fontWeight: '600'},
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  loanTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  loanTypeChip: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  loanTypeChipSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  loanTypeChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 3,
    textAlign: 'center',
  },
  loanTypeChipTextSelected: {color: colors.primary},
  loanTypeRate: {fontSize: 12, color: colors.textSecondary},
  loanTypeRateSelected: {color: colors.primary},
  loanTypeInfo: {
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  loanTypeInfoText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
  purposeInput: {height: 88, paddingTop: 12},
  formButtons: {flexDirection: 'row', gap: 12, marginTop: 8, marginBottom: 40},
  cancelFormBtn: {flex: 1},
  submitBtn: {
    flex: 1,
    shadowColor: colors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledBtn: {opacity: 0.65},
});

export default LoansScreen;
