import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
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

const GOAL_ICONS = ['🏖', '🏠', '🚗', '📚', '💍', '✈️', '💊', '🎓'];

const SavingsGoalsScreen = ({route}: Props) => {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<ScreenMode>('list');
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [goalName, setGoalName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [contribution, setContribution] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const {userData} = useAuth();
  const accountId = route?.params?.accountId || userData?.id || '';

  const fetchGoals = useCallback(async () => {
    if (!accountId) {
      setLoading(false);
      setError('No account ID.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await getAccountSavingsGoals(accountId);
      setGoals(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      setError(
        e.response?.data?.message ||
          e.message ||
          'Failed to load savings goals.',
      );
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleAddGoal = async () => {
    setFormError('');
    if (!goalName.trim()) {
      setFormError('Please enter a goal name.');
      return;
    }
    if (!goalAmount || isNaN(Number(goalAmount)) || Number(goalAmount) <= 0) {
      setFormError('Please enter a valid target amount.');
      return;
    }
    setSubmitting(true);
    try {
      await createSavingsGoal({
        accountId,
        name: goalName.trim(),
        targetAmount: Number(goalAmount),
        targetDate: targetDate || undefined,
      });
      Alert.alert(
        'Goal Created!',
        `"${goalName.trim()}" savings goal has been created.`,
      );
      setMode('list');
      setGoalName('');
      setGoalAmount('');
      setTargetDate('');
      fetchGoals();
    } catch (e: any) {
      setFormError(
        e.response?.data?.message || e.message || 'Failed to create goal.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleContribute = async () => {
    setFormError('');
    if (!selectedGoalId) return;
    if (
      !contribution ||
      isNaN(Number(contribution)) ||
      Number(contribution) <= 0
    ) {
      setFormError('Please enter a valid amount.');
      return;
    }
    setSubmitting(true);
    try {
      await contributeTosavingsGoal(selectedGoalId, {
        amount: Number(contribution),
      });
      Alert.alert(
        'Contributed!',
        `$${contribution} added to your savings goal.`,
      );
      setMode('list');
      setContribution('');
      setSelectedGoalId(null);
      fetchGoals();
    } catch (e: any) {
      setFormError(
        e.response?.data?.message || e.message || 'Failed to contribute.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete Goal', `Delete "${name}"? This cannot be undone.`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSavingsGoal(id);
            fetchGoals();
          } catch (e: any) {
            Alert.alert(
              'Error',
              e.response?.data?.message || 'Failed to delete goal.',
            );
          }
        },
      },
    ]);
  };

  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const overallProgress =
    totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  if (loading)
    return (
      <View style={commonStyles.centerContent}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading savings goals...</Text>
      </View>
    );

  if (mode === 'addGoal')
    return (
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.formScroll}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.formTitle}>New Savings Goal</Text>
        <Text style={styles.formSub}>What are you saving towards?</Text>
        {formError ? (
          <View style={commonStyles.errorContainer}>
            <Text style={commonStyles.errorText}>{formError}</Text>
          </View>
        ) : null}

        <Text style={styles.fieldLabel}>Goal Name</Text>
        <TextInput
          style={commonStyles.input}
          placeholder='e.g. "Vacation to Bali"'
          placeholderTextColor={colors.textTertiary}
          value={goalName}
          onChangeText={setGoalName}
          editable={!submitting}
        />

        <Text style={styles.fieldLabel}>Target Amount ($)</Text>
        <TextInput
          style={commonStyles.input}
          placeholder="e.g. 5000"
          placeholderTextColor={colors.textTertiary}
          value={goalAmount}
          onChangeText={setGoalAmount}
          keyboardType="numeric"
          editable={!submitting}
        />

        <Text style={styles.fieldLabel}>Target Date (optional)</Text>
        <TextInput
          style={commonStyles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textTertiary}
          value={targetDate}
          onChangeText={setTargetDate}
          editable={!submitting}
        />

        <View style={styles.formBtnRow}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => setMode('list')}
            activeOpacity={0.7}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.btnDisabled]}
            onPress={handleAddGoal}
            disabled={submitting}
            activeOpacity={0.85}>
            {submitting ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={commonStyles.buttonText}>Create Goal</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    );

  if (mode === 'contribute' && selectedGoalId) {
    const goal = goals.find(g => g.id === selectedGoalId);
    return (
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.formScroll}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.formTitle}>Add to Savings</Text>
        <Text style={styles.formSub}>{goal?.name}</Text>
        {formError ? (
          <View style={commonStyles.errorContainer}>
            <Text style={commonStyles.errorText}>{formError}</Text>
          </View>
        ) : null}
        {goal && (
          <View style={styles.goalMiniCard}>
            <View style={commonStyles.spaceBetween}>
              <Text style={styles.goalMiniLabel}>Current</Text>
              <Text style={styles.goalMiniLabel}>Target</Text>
            </View>
            <View style={commonStyles.spaceBetween}>
              <Text style={styles.goalMiniVal}>
                $
                {goal.currentAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </Text>
              <Text style={styles.goalMiniVal}>
                $
                {goal.targetAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {width: `${Math.min(100, goal.progress)}%`},
                ]}
              />
            </View>
            <Text style={styles.goalMiniPercent}>{goal.progress}% saved</Text>
          </View>
        )}
        <Text style={styles.fieldLabel}>Contribution Amount ($)</Text>
        <TextInput
          style={commonStyles.input}
          placeholder="e.g. 250"
          placeholderTextColor={colors.textTertiary}
          value={contribution}
          onChangeText={setContribution}
          keyboardType="numeric"
          editable={!submitting}
        />
        <View style={styles.formBtnRow}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => {
              setMode('list');
              setSelectedGoalId(null);
            }}
            activeOpacity={0.7}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.btnDisabled]}
            onPress={handleContribute}
            disabled={submitting}
            activeOpacity={0.85}>
            {submitting ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={commonStyles.buttonText}>Add Funds</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.root}>
      {/* Summary banner */}
      <View style={styles.summaryBanner}>
        <View style={styles.summaryLeft}>
          <Text style={styles.bannerLabel}>Total Saved</Text>
          <Text style={styles.bannerValue}>
            ${totalSaved.toLocaleString(undefined, {minimumFractionDigits: 2})}
          </Text>
          <Text style={styles.bannerSub}>
            of ${totalTarget.toLocaleString()} target
          </Text>
        </View>
        <View style={styles.summaryRight}>
          <View style={styles.progressRing}>
            <Text style={styles.progressRingText}>{overallProgress}%</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setMode('addGoal')}
          activeOpacity={0.85}>
          <Text style={styles.addBtnText}>+ New Goal</Text>
        </TouchableOpacity>
        <View style={styles.decor1} />
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>⚠ {error}</Text>
        </View>
      ) : null}

      {goals.length === 0 ? (
        <View style={commonStyles.emptyStateContainer}>
          <Text style={styles.emptyEmoji}>🎯</Text>
          <Text style={commonStyles.emptyStateTitle}>No savings goals yet</Text>
          <Text style={commonStyles.emptyStateSubtitle}>
            Set a goal and start saving towards your dreams.
          </Text>
          <TouchableOpacity
            style={styles.emptyAddBtn}
            onPress={() => setMode('addGoal')}
            activeOpacity={0.85}>
            <Text style={commonStyles.buttonText}>Create First Goal</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={goals}
          keyExtractor={g => g.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({item, index}) => {
            const icon = GOAL_ICONS[index % GOAL_ICONS.length];
            const pct = Math.min(100, item.progress);
            return (
              <View style={styles.goalCard}>
                <View style={styles.goalCardTop}>
                  <View style={styles.goalIconWrap}>
                    <Text style={styles.goalIcon}>{icon}</Text>
                  </View>
                  <View style={styles.goalInfo}>
                    <Text style={styles.goalName}>{item.name}</Text>
                    {item.targetDate && (
                      <Text style={styles.goalDate}>
                        Target:{' '}
                        {new Date(item.targetDate).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDelete(item.id, item.name)}
                    activeOpacity={0.7}
                    style={styles.deleteBtn}>
                    <Text style={styles.deleteBtnText}>🗑</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.amountRow}>
                  <View>
                    <Text style={styles.goalCurrent}>
                      $
                      {item.currentAmount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </Text>
                    <Text style={styles.goalSaved}>saved</Text>
                  </View>
                  <View style={styles.goalTargetWrap}>
                    <Text style={styles.goalTargetAmt}>
                      $
                      {item.targetAmount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </Text>
                    <Text style={styles.goalTargetLabel}>goal</Text>
                  </View>
                </View>

                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, {width: `${pct}%`}]} />
                </View>
                <View style={commonStyles.spaceBetween}>
                  <Text style={styles.progressPct}>{pct}% complete</Text>
                  <Text style={styles.progressRemaining}>
                    $
                    {(item.targetAmount - item.currentAmount).toLocaleString(
                      undefined,
                      {minimumFractionDigits: 2},
                    )}{' '}
                    remaining
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.contributeBtn}
                  onPress={() => {
                    setSelectedGoalId(item.id);
                    setMode('contribute');
                  }}
                  activeOpacity={0.85}>
                  <Text style={styles.contributeBtnText}>Add Funds</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.background},
  loadingText: {marginTop: 12, fontSize: 15, color: colors.textSecondary},

  summaryBanner: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    position: 'relative',
  },
  summaryLeft: {flex: 1},
  bannerLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '500',
    marginBottom: 4,
  },
  bannerValue: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -0.8,
    marginBottom: 2,
  },
  bannerSub: {fontSize: 12, color: 'rgba(255,255,255,0.6)'},
  summaryRight: {marginRight: 14},
  progressRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  progressRingText: {fontSize: 16, fontWeight: '800', color: colors.white},
  addBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  addBtnText: {fontSize: 13, color: colors.white, fontWeight: '700'},
  decor1: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  errorBanner: {
    backgroundColor: colors.errorLight,
    margin: 16,
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  errorBannerText: {color: colors.error, fontSize: 13},

  listContent: {padding: 16, paddingBottom: 32, flexGrow: 1},
  goalCard: {
    backgroundColor: colors.backgroundWhite,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
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
  goalCardTop: {flexDirection: 'row', alignItems: 'center', marginBottom: 14},
  goalIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f5f3ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  goalIcon: {fontSize: 22},
  goalInfo: {flex: 1},
  goalName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  goalDate: {fontSize: 12, color: colors.textSecondary},
  deleteBtn: {padding: 4},
  deleteBtnText: {fontSize: 18},

  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  goalCurrent: {fontSize: 20, fontWeight: '700', color: colors.secondary},
  goalSaved: {fontSize: 12, color: colors.textSecondary},
  goalTargetWrap: {alignItems: 'flex-end'},
  goalTargetAmt: {fontSize: 15, fontWeight: '600', color: colors.textSecondary},
  goalTargetLabel: {fontSize: 12, color: colors.textTertiary},

  progressTrack: {
    height: 7,
    backgroundColor: colors.surface,
    borderRadius: 4,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 4,
  },
  progressPct: {fontSize: 12, color: colors.textSecondary, fontWeight: '500'},
  progressRemaining: {fontSize: 12, color: colors.textTertiary},

  contributeBtn: {
    backgroundColor: '#f5f3ff',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  contributeBtnText: {fontSize: 14, color: colors.secondary, fontWeight: '700'},

  emptyEmoji: {fontSize: 48, marginBottom: 12},
  emptyAddBtn: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 20,
  },

  // Forms
  formScroll: {padding: 20, paddingBottom: 40},
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  formSub: {fontSize: 14, color: colors.textSecondary, marginBottom: 24},
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  formBtnRow: {flexDirection: 'row', gap: 10, marginTop: 8},
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelBtnText: {fontSize: 15, fontWeight: '600', color: colors.textSecondary},
  submitBtn: {
    flex: 2,
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnDisabled: {opacity: 0.6},

  goalMiniCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  goalMiniLabel: {fontSize: 12, color: colors.textSecondary},
  goalMiniVal: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginVertical: 3,
  },
  goalMiniPercent: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: '600',
    marginTop: 6,
  },
});

export default SavingsGoalsScreen;
