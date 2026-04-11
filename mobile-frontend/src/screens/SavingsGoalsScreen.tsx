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
import {
  contributeTosavingsGoal,
  createSavingsGoal,
  deleteSavingsGoal,
  getAccountSavingsGoals,
} from '../services/api';
import {colors, commonStyles} from '../styles/commonStyles';

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  progress: number;
  createdDate: string;
  targetDate?: string;
}

interface Props {
  route: {params?: {accountId?: string}};
}

type ScreenMode = 'list' | 'addGoal' | 'contribute';

const SavingsGoalsScreen = ({route}: Props) => {
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<ScreenMode>('list');
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalAmount, setNewGoalAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [contributionAmount, setContributionAmount] = useState('');

  const {userData} = useAuth();

  const accountId = route?.params?.accountId || (userData?.id ?? '');

  const fetchSavingsGoals = useCallback(async () => {
    if (!accountId) {
      setLoading(false);
      setError('No account ID available');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await getAccountSavingsGoals(accountId);
      setSavingsGoals(Array.isArray(response.data) ? response.data : []);
    } catch (err: unknown) {
      const e = err as {
        response?: {data?: {message?: string}};
        message?: string;
      };
      console.error('Failed to fetch savings goals:', err);
      const errorMessage =
        e.response?.data?.message ||
        e.message ||
        'Failed to load savings goals.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    fetchSavingsGoals();
  }, [fetchSavingsGoals]);

  const handleAddGoal = async () => {
    setFormError('');

    if (!newGoalName.trim()) {
      setFormError('Please enter a goal name.');
      return;
    }

    const targetAmount = parseFloat(newGoalAmount);
    if (!newGoalAmount || isNaN(targetAmount) || targetAmount <= 0) {
      setFormError('Please enter a valid target amount greater than $0.');
      return;
    }

    if (targetDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (
        !dateRegex.test(targetDate) ||
        isNaN(new Date(targetDate).getTime())
      ) {
        setFormError('Target date must be in YYYY-MM-DD format.');
        return;
      }
      if (new Date(targetDate) <= new Date()) {
        setFormError('Target date must be in the future.');
        return;
      }
    }

    setFormSubmitting(true);
    try {
      await createSavingsGoal({
        accountId,
        name: newGoalName.trim(),
        targetAmount,
        targetDate: targetDate || undefined,
      });

      await fetchSavingsGoals();
      setNewGoalName('');
      setNewGoalAmount('');
      setTargetDate('');
      setMode('list');
      Alert.alert(
        'Goal Created',
        `"${newGoalName.trim()}" savings goal has been created successfully!`,
      );
    } catch (err: unknown) {
      const e = err as {
        response?: {data?: {message?: string}};
        message?: string;
      };
      const errorMessage =
        e.response?.data?.message ||
        e.message ||
        'Failed to create savings goal.';
      setFormError(errorMessage);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleContribute = async () => {
    setFormError('');

    if (!selectedGoalId) {
      return;
    }

    const amount = parseFloat(contributionAmount);
    if (!contributionAmount || isNaN(amount) || amount <= 0) {
      setFormError('Please enter a valid contribution amount.');
      return;
    }

    setFormSubmitting(true);
    try {
      await contributeTosavingsGoal(selectedGoalId, {amount});
      await fetchSavingsGoals();
      setContributionAmount('');
      setSelectedGoalId(null);
      setMode('list');
      Alert.alert(
        'Contribution Added',
        `$${amount.toFixed(2)} has been added to your savings goal!`,
      );
    } catch (err: unknown) {
      const e = err as {
        response?: {data?: {message?: string}};
        message?: string;
      };
      const errorMessage =
        e.response?.data?.message || e.message || 'Failed to add contribution.';
      setFormError(errorMessage);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteGoal = (goalId: string, goalName: string) => {
    Alert.alert(
      'Delete Goal',
      `Are you sure you want to delete "${goalName}"? This action cannot be undone.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteSavingsGoal(goalId);
              await fetchSavingsGoals();
              Alert.alert('Deleted', 'Savings goal has been deleted.');
            } catch (err: unknown) {
              const e = err as {
                response?: {data?: {message?: string}};
                message?: string;
              };
              const errorMessage =
                e.response?.data?.message ||
                e.message ||
                'Failed to delete savings goal.';
              Alert.alert('Error', errorMessage);
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  const renderGoalItem = ({item}: {item: SavingsGoal}) => {
    const clampedProgress = Math.min(100, Math.max(0, item.progress));
    const isComplete = clampedProgress >= 100;

    return (
      <View style={styles.goalCard}>
        <View style={commonStyles.spaceBetween}>
          <Text style={styles.goalName} numberOfLines={1}>
            {item.name}
          </Text>
          {isComplete && (
            <View style={styles.completeBadge}>
              <Text style={styles.completeBadgeText}>✓ Done</Text>
            </View>
          )}
        </View>

        <View style={styles.amountsRow}>
          <View>
            <Text style={styles.amountLabel}>Saved</Text>
            <Text style={styles.currentAmount}>
              $
              {item.currentAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>
          <View style={styles.amountDivider} />
          <View style={{alignItems: 'flex-end'}}>
            <Text style={styles.amountLabel}>Goal</Text>
            <Text style={styles.targetAmount}>
              $
              {item.targetAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>
        </View>

        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${clampedProgress}%`,
                backgroundColor: isComplete ? colors.success : colors.primary,
              },
            ]}
          />
        </View>
        <View style={commonStyles.spaceBetween}>
          <Text style={styles.progressText}>
            {clampedProgress.toFixed(0)}% complete
          </Text>
          {item.targetDate ? (
            <Text style={styles.targetDateText}>
              by{' '}
              {new Date(item.targetDate).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          ) : null}
        </View>

        <View style={styles.goalActions}>
          <TouchableOpacity
            style={styles.contributeBtn}
            onPress={() => {
              setSelectedGoalId(item.id);
              setContributionAmount('');
              setFormError('');
              setMode('contribute');
            }}
            activeOpacity={0.75}>
            <Text style={styles.contributeBtnText}>+ Contribute</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDeleteGoal(item.id, item.name)}
            activeOpacity={0.75}>
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading && mode === 'list') {
    return (
      <View style={commonStyles.centerContent}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading Savings Goals...</Text>
      </View>
    );
  }

  if (mode === 'addGoal') {
    return (
      <ScrollView
        style={commonStyles.container}
        keyboardShouldPersistTaps="handled">
        <View style={commonStyles.spaceBetween}>
          <Text style={styles.screenTitle}>New Goal</Text>
          <TouchableOpacity
            onPress={() => {
              setMode('list');
              setFormError('');
            }}
            style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {formError ? (
          <View style={commonStyles.errorContainer}>
            <Text style={commonStyles.errorText}>{formError}</Text>
          </View>
        ) : null}

        <Text style={styles.formLabel}>Goal Name</Text>
        <TextInput
          style={commonStyles.input}
          placeholder="e.g. Vacation Fund, Emergency Fund"
          value={newGoalName}
          onChangeText={setNewGoalName}
          placeholderTextColor={colors.textTertiary}
          autoCapitalize="words"
        />

        <Text style={styles.formLabel}>Target Amount ($)</Text>
        <TextInput
          style={commonStyles.input}
          placeholder="e.g. 5000"
          value={newGoalAmount}
          onChangeText={setNewGoalAmount}
          keyboardType="decimal-pad"
          placeholderTextColor={colors.textTertiary}
        />

        <Text style={styles.formLabel}>Target Date (optional)</Text>
        <TextInput
          style={commonStyles.input}
          placeholder="YYYY-MM-DD"
          value={targetDate}
          onChangeText={setTargetDate}
          placeholderTextColor={colors.textTertiary}
          keyboardType="numbers-and-punctuation"
          maxLength={10}
        />

        <View style={styles.formButtons}>
          <TouchableOpacity
            style={[
              commonStyles.button,
              commonStyles.buttonOutline,
              styles.cancelBtn,
            ]}
            onPress={() => {
              setMode('list');
              setFormError('');
            }}
            disabled={formSubmitting}>
            <Text style={commonStyles.buttonTextOutline}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              commonStyles.button,
              styles.saveBtn,
              formSubmitting && styles.disabledBtn,
            ]}
            onPress={handleAddGoal}
            disabled={formSubmitting}>
            {formSubmitting ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={commonStyles.buttonText}>Create Goal</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (mode === 'contribute' && selectedGoalId) {
    const goal = savingsGoals.find(g => g.id === selectedGoalId);
    return (
      <View style={commonStyles.container}>
        <View style={commonStyles.spaceBetween}>
          <Text style={styles.screenTitle}>Add Contribution</Text>
          <TouchableOpacity
            onPress={() => {
              setMode('list');
              setSelectedGoalId(null);
              setFormError('');
            }}
            style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {goal ? (
          <View style={[commonStyles.card, styles.contributionGoalCard]}>
            <Text style={styles.contributionGoalName}>{goal.name}</Text>
            <Text style={styles.contributionGoalProgress}>
              $
              {goal.currentAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}{' '}
              of $
              {goal.targetAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </Text>
          </View>
        ) : null}

        {formError ? (
          <View style={commonStyles.errorContainer}>
            <Text style={commonStyles.errorText}>{formError}</Text>
          </View>
        ) : null}

        <Text style={styles.formLabel}>Contribution Amount ($)</Text>
        <TextInput
          style={commonStyles.input}
          placeholder="Enter amount"
          value={contributionAmount}
          onChangeText={setContributionAmount}
          keyboardType="decimal-pad"
          placeholderTextColor={colors.textTertiary}
          autoFocus
        />

        <View style={styles.formButtons}>
          <TouchableOpacity
            style={[
              commonStyles.button,
              commonStyles.buttonOutline,
              styles.cancelBtn,
            ]}
            onPress={() => {
              setMode('list');
              setSelectedGoalId(null);
              setFormError('');
            }}
            disabled={formSubmitting}>
            <Text style={commonStyles.buttonTextOutline}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              commonStyles.button,
              styles.saveBtn,
              formSubmitting && styles.disabledBtn,
            ]}
            onPress={handleContribute}
            disabled={formSubmitting}>
            {formSubmitting ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={commonStyles.buttonText}>Add</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.spaceBetween}>
        <Text style={styles.screenTitle}>
          {savingsGoals.length > 0
            ? `${savingsGoals.length} Goal${
                savingsGoals.length !== 1 ? 's' : ''
              }`
            : 'Savings Goals'}
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setMode('addGoal');
            setFormError('');
          }}
          activeOpacity={0.85}>
          <Text style={styles.addButtonText}>+ New Goal</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={commonStyles.errorContainer}>
          <Text style={commonStyles.errorText}>{error}</Text>
        </View>
      ) : null}

      <FlatList
        data={savingsGoals}
        renderItem={renderGoalItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <View style={commonStyles.emptyStateContainer}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={commonStyles.emptyStateTitle}>No Savings Goals</Text>
            <Text style={commonStyles.emptyStateSubtitle}>
              Create a savings goal to start tracking your financial milestones.
            </Text>
            <TouchableOpacity
              style={[commonStyles.button, styles.emptyAddBtn]}
              onPress={() => setMode('addGoal')}>
              <Text style={commonStyles.buttonText}>Create First Goal</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={
          savingsGoals.length === 0 ? {flex: 1} : {paddingBottom: 24}
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingText: {marginTop: 12, fontSize: 15, color: colors.textSecondary},
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  addButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    marginBottom: 16,
  },
  addButtonText: {color: colors.white, fontWeight: '700', fontSize: 14},
  emptyIcon: {fontSize: 48, marginBottom: 8},
  emptyAddBtn: {marginTop: 16, minWidth: 200},
  goalCard: {
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
  goalName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  completeBadge: {
    backgroundColor: colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completeBadgeText: {fontSize: 12, color: colors.success, fontWeight: '700'},
  amountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 14,
  },
  amountLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  currentAmount: {fontSize: 20, fontWeight: '700', color: colors.primary},
  targetAmount: {fontSize: 16, fontWeight: '600', color: colors.textSecondary},
  amountDivider: {width: 1, height: 36, backgroundColor: colors.borderLight},
  progressBarBg: {
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {height: '100%', borderRadius: 4},
  progressText: {fontSize: 12, color: colors.textSecondary, fontWeight: '500'},
  targetDateText: {fontSize: 12, color: colors.textSecondary},
  goalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  contributeBtn: {
    flex: 1,
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  contributeBtnText: {color: colors.primary, fontWeight: '700', fontSize: 14},
  deleteBtn: {
    paddingHorizontal: 16,
    backgroundColor: colors.errorLight,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  deleteBtnText: {color: colors.error, fontWeight: '600', fontSize: 14},
  // Form styles
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  formButtons: {flexDirection: 'row', gap: 12, marginTop: 8},
  cancelBtn: {flex: 1},
  saveBtn: {
    flex: 1,
    shadowColor: colors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledBtn: {opacity: 0.65},
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  closeBtnText: {fontSize: 15, color: colors.textSecondary, fontWeight: '600'},
  contributionGoalCard: {
    marginBottom: 16,
    backgroundColor: colors.primaryLight,
  },
  contributionGoalName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  contributionGoalProgress: {fontSize: 14, color: colors.primary, opacity: 0.8},
});

export default SavingsGoalsScreen;
