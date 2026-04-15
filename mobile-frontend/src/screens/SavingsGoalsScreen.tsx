import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import type { TabParamList } from "../navigation/AppNavigator";
import {
  contributeToSavingsGoal, // Bug fix: was "contributeTosavingsGoal"
  createSavingsGoal,
  deleteSavingsGoal,
  getAccountSavingsGoals,
} from "../services/api";
import { colors, commonStyles } from "../styles/commonStyles";

type SavingsRoute = RouteProp<TabParamList, "Savings">;

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  progress: number;
  createdDate: string;
  targetDate?: string;
  icon?: string;
}

type ScreenMode = "list" | "addGoal" | "contribute";

const GOAL_ICONS = ["🏖", "🏠", "🚗", "📚", "💍", "✈️", "💊", "🎓", "💻", "🎸"];

const SavingsGoalsScreen = () => {
  const route = useRoute<SavingsRoute>();
  const { userData } = useAuth();
  const accountId = route.params?.accountId ?? userData?.id ?? "";

  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<ScreenMode>("list");
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [goalName, setGoalName] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(GOAL_ICONS[0]);
  const [contribution, setContribution] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchGoals = useCallback(
    async (isRefreshing = false) => {
      if (!accountId) {
        setLoading(false);
        setError("No account ID.");
        return;
      }
      if (!isRefreshing) setLoading(true);
      setError(null);
      try {
        const res = await getAccountSavingsGoals(accountId);
        setGoals(Array.isArray(res.data) ? res.data : []);
      } catch (e: unknown) {
        const err = e as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        setError(
          err.response?.data?.message ??
            err.message ??
            "Failed to load savings goals."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accountId]
  );

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchGoals(true);
  };

  const handleCreateGoal = async () => {
    setFormError("");
    if (!goalName.trim()) {
      setFormError("Please enter a goal name.");
      return;
    }
    const amt = Number(goalAmount);
    if (!goalAmount || isNaN(amt) || amt <= 0) {
      setFormError("Please enter a valid target amount.");
      return;
    }
    if (targetDate && !/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
      setFormError("Target date must be in YYYY-MM-DD format.");
      return;
    }
    if (targetDate && new Date(targetDate) <= new Date()) {
      setFormError("Target date must be in the future.");
      return;
    }

    setSubmitting(true);
    try {
      await createSavingsGoal({
        accountId,
        name: goalName.trim(),
        targetAmount: amt,
        targetDate: targetDate || undefined,
        icon: selectedIcon,
      });
      Alert.alert(
        "Goal Created",
        `"${goalName.trim()}" savings goal has been created!`
      );
      setMode("list");
      setGoalName("");
      setGoalAmount("");
      setTargetDate("");
      setSelectedIcon(GOAL_ICONS[0]);
      fetchGoals();
    } catch (e: unknown) {
      const err = e as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setFormError(
        err.response?.data?.message ?? err.message ?? "Failed to create goal."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleContribute = async () => {
    setFormError("");
    if (!selectedGoalId) return;
    const amt = Number(contribution);
    if (!contribution || isNaN(amt) || amt <= 0) {
      setFormError("Please enter a valid contribution amount.");
      return;
    }

    setSubmitting(true);
    try {
      // Bug fix: was contributeTosavingsGoal
      await contributeToSavingsGoal(selectedGoalId, { amount: amt });
      const goalName =
        goals.find((g) => g.id === selectedGoalId)?.name ?? "goal";
      Alert.alert(
        "Contribution Added",
        `$${amt.toFixed(2)} added to "${goalName}".`
      );
      setMode("list");
      setContribution("");
      setSelectedGoalId(null);
      fetchGoals();
    } catch (e: unknown) {
      const err = e as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setFormError(
        err.response?.data?.message ??
          err.message ??
          "Failed to add contribution."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (goalId: string, name: string) => {
    Alert.alert(
      "Delete Goal",
      `Are you sure you want to delete "${name}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteSavingsGoal(goalId);
              fetchGoals();
            } catch (e: unknown) {
              const err = e as {
                response?: { data?: { message?: string } };
                message?: string;
              };
              Alert.alert(
                "Error",
                err.response?.data?.message ?? "Failed to delete goal."
              );
            }
          },
        },
      ]
    );
  };

  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={commonStyles.centerContent}>
          <ActivityIndicator size="large" color={colors.secondary} />
          <Text style={styles.loadingText}>Loading savings goals...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Add goal form ─────────────────────────────────────────────────────
  if (mode === "addGoal") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.formScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setMode("list")}
            activeOpacity={0.7}
          >
            <Text style={styles.backBtnText}>← Back to Goals</Text>
          </TouchableOpacity>

          <Text style={styles.formTitle}>New Savings Goal</Text>
          <Text style={styles.formSub}>
            Set a goal and track your progress.
          </Text>

          {formError ? (
            <View style={commonStyles.errorContainer}>
              <Text style={commonStyles.errorText}>{formError}</Text>
            </View>
          ) : null}

          {/* Icon picker */}
          <Text style={styles.fieldLabel}>Goal Icon</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.iconScroll}
          >
            {GOAL_ICONS.map((icon) => (
              <TouchableOpacity
                key={icon}
                style={[
                  styles.iconBtn,
                  selectedIcon === icon && styles.iconBtnActive,
                ]}
                onPress={() => setSelectedIcon(icon)}
                activeOpacity={0.7}
              >
                <Text style={styles.iconBtnText}>{icon}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.fieldLabel}>Goal Name</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="e.g. Dream Vacation"
            placeholderTextColor={colors.textTertiary}
            value={goalName}
            onChangeText={setGoalName}
            editable={!submitting}
            autoCapitalize="words"
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

          <Text style={styles.fieldLabel}>
            Target Date (optional, YYYY-MM-DD)
          </Text>
          <TextInput
            style={commonStyles.input}
            placeholder="e.g. 2025-12-31"
            placeholderTextColor={colors.textTertiary}
            value={targetDate}
            onChangeText={setTargetDate}
            keyboardType={
              Platform.OS === "ios" ? "numbers-and-punctuation" : "default"
            }
            editable={!submitting}
            maxLength={10}
          />

          <View style={styles.formBtnRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setMode("list")}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.btnDisabled]}
              onPress={handleCreateGoal}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={commonStyles.buttonText}>Create Goal</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Contribute form ───────────────────────────────────────────────────
  if (mode === "contribute" && selectedGoalId) {
    const goal = goals.find((g) => g.id === selectedGoalId);
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.formScroll}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              setMode("list");
              setSelectedGoalId(null);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.backBtnText}>← Back to Goals</Text>
          </TouchableOpacity>

          <Text style={styles.formTitle}>Add Contribution</Text>
          <Text style={styles.formSub}>Add funds to your savings goal.</Text>

          {goal && (
            <View style={styles.goalMiniCard}>
              <Text style={styles.goalMiniLabel}>
                {goal.icon ?? "🎯"} {goal.name}
              </Text>
              <Text style={styles.goalMiniVal}>
                $
                {goal.currentAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}{" "}
                / $
                {goal.targetAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(
                        100,
                        goal.progress ??
                          (goal.currentAmount / goal.targetAmount) * 100
                      )}%` as any,
                    },
                  ]}
                />
              </View>
              <Text style={styles.goalMiniPercent}>
                {Math.round(
                  goal.progress ??
                    (goal.currentAmount / goal.targetAmount) * 100
                )}
                % complete
              </Text>
            </View>
          )}

          {formError ? (
            <View style={commonStyles.errorContainer}>
              <Text style={commonStyles.errorText}>{formError}</Text>
            </View>
          ) : null}

          <Text style={styles.fieldLabel}>Contribution Amount ($)</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="e.g. 200"
            placeholderTextColor={colors.textTertiary}
            value={contribution}
            onChangeText={setContribution}
            keyboardType="numeric"
            autoFocus
            editable={!submitting}
          />

          <View style={styles.formBtnRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setMode("list");
                setSelectedGoalId(null);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.btnDisabled]}
              onPress={handleContribute}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={commonStyles.buttonText}>Add Funds</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Goals list ────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Summary banner */}
      <View style={styles.summaryBanner}>
        <View>
          <Text style={styles.summaryLabel}>Total Saved</Text>
          <Text style={styles.summaryValue}>
            $
            {totalSaved.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Text>
          {totalTarget > 0 && (
            <Text style={styles.summaryTarget}>
              of $
              {totalTarget.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}{" "}
              target
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setMode("addGoal")}
          activeOpacity={0.85}
        >
          <Text style={styles.addBtnText}>+ New Goal</Text>
        </TouchableOpacity>
        <View style={styles.decor1} />
        <View style={styles.decor2} />
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
            Create a goal to start tracking your savings.
          </Text>
          <TouchableOpacity
            style={styles.emptyAddBtn}
            onPress={() => setMode("addGoal")}
            activeOpacity={0.85}
          >
            <Text style={commonStyles.buttonText}>Create First Goal</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={goals}
          keyExtractor={(g) => g.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.secondary}
              colors={[colors.secondary]}
            />
          }
          renderItem={({ item }) => {
            const pct = Math.min(
              100,
              Math.round(
                item.progress ?? (item.currentAmount / item.targetAmount) * 100
              )
            );
            const remaining = Math.max(
              0,
              item.targetAmount - item.currentAmount
            );
            return (
              <View style={styles.goalCard}>
                <View style={styles.goalCardTop}>
                  <View style={styles.goalIconWrap}>
                    <Text style={styles.goalIconText}>{item.icon ?? "🎯"}</Text>
                  </View>
                  <View style={styles.goalInfo}>
                    <Text style={styles.goalName}>{item.name}</Text>
                    {item.targetDate && (
                      <Text style={styles.goalDate}>
                        Target:{" "}
                        {new Date(item.targetDate).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDelete(item.id, item.name)}
                    style={styles.deleteBtn}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.deleteBtnText}>🗑</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.goalAmounts}>
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
                  <View
                    style={[styles.progressFill, { width: `${pct}%` as any }]}
                  />
                </View>

                <View style={commonStyles.spaceBetween}>
                  <Text style={styles.progressPct}>{pct}% complete</Text>
                  {pct < 100 && (
                    <Text style={styles.progressRemaining}>
                      $
                      {remaining.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}{" "}
                      to go
                    </Text>
                  )}
                  {pct >= 100 && (
                    <Text
                      style={[styles.progressPct, { color: colors.success }]}
                    >
                      🎉 Goal reached!
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.contributeBtn}
                  onPress={() => {
                    setSelectedGoalId(item.id);
                    setMode("contribute");
                  }}
                  activeOpacity={0.8}
                  disabled={pct >= 100}
                >
                  <Text
                    style={[
                      styles.contributeBtnText,
                      pct >= 100 && { color: colors.textSecondary },
                    ]}
                  >
                    {pct >= 100 ? "✓ Goal Completed" : "+ Add Funds"}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  summaryBanner: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 22,
    paddingVertical: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
    position: "relative",
  },
  summaryLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
    fontWeight: "500",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.white,
    letterSpacing: -0.8,
  },
  summaryTarget: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  addBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    zIndex: 1,
  },
  addBtnText: { fontSize: 14, color: colors.white, fontWeight: "700" },
  decor1: {
    position: "absolute",
    right: -40,
    top: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  decor2: {
    position: "absolute",
    right: 60,
    bottom: -60,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  errorBanner: {
    backgroundColor: colors.errorLight,
    margin: 16,
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  errorBannerText: { color: colors.error, fontSize: 13 },

  listContent: { padding: 16, flexGrow: 1 },
  goalCard: {
    backgroundColor: colors.backgroundWhite,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  goalCardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 10,
  },
  goalIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.secondaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  goalIconText: { fontSize: 22 },
  goalInfo: { flex: 1 },
  goalName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  goalDate: { fontSize: 12, color: colors.textSecondary },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.errorLight,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtnText: { fontSize: 16 },

  goalAmounts: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 10,
  },
  goalCurrent: { fontSize: 20, fontWeight: "700", color: colors.secondary },
  goalSaved: { fontSize: 12, color: colors.textSecondary },
  goalTargetWrap: { alignItems: "flex-end" },
  goalTargetAmt: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  goalTargetLabel: { fontSize: 12, color: colors.textTertiary },

  progressTrack: {
    height: 7,
    backgroundColor: colors.surface,
    borderRadius: 4,
    marginBottom: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.secondary,
    borderRadius: 4,
  },
  progressPct: { fontSize: 12, color: colors.textSecondary, fontWeight: "500" },
  progressRemaining: { fontSize: 12, color: colors.textTertiary },

  contributeBtn: {
    backgroundColor: colors.secondaryLight,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#e9d5ff",
  },
  contributeBtnText: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: "700",
  },

  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyAddBtn: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 20,
  },

  // Forms
  backBtn: { marginBottom: 20 },
  backBtnText: { fontSize: 14, color: colors.secondary, fontWeight: "500" },
  formScroll: { padding: 20, paddingBottom: 40 },
  formTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  formSub: { fontSize: 14, color: colors.textSecondary, marginBottom: 24 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  iconScroll: { marginBottom: 16 },
  iconBtn: {
    width: 50,
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    backgroundColor: colors.backgroundWhite,
  },
  iconBtnActive: {
    borderColor: colors.secondary,
    backgroundColor: colors.secondaryLight,
  },
  iconBtnText: { fontSize: 24 },
  formBtnRow: { flexDirection: "row", gap: 10, marginTop: 8 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  submitBtn: {
    flex: 2,
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.6 },
  loadingText: { marginTop: 12, fontSize: 15, color: colors.textSecondary },

  // Contribute mini card
  goalMiniCard: {
    backgroundColor: colors.secondaryLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  goalMiniLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.secondary,
    marginBottom: 4,
  },
  goalMiniVal: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginVertical: 3,
  },
  goalMiniPercent: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: "600",
    marginTop: 6,
  },
});

export default SavingsGoalsScreen;
