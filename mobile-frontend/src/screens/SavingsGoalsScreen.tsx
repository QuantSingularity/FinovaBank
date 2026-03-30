import {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
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
import {commonStyles, responsiveWidth} from '../styles/commonStyles';

// Define the structure for savings goal data
interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  progress: number; // Percentage of completion (0-100)
  createdDate: string;
  targetDate?: string;
}

interface ContributionFormProps {
  goalId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const SavingsGoalsScreen = ({route}: any) => {
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showContributeForm, setShowContributeForm] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalAmount, setNewGoalAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const {userData} = useAuth();

  // Get accountId from route params or use default from user data
  const accountId =
    route?.params?.accountId || (userData?.id ? userData.id : '');

  useEffect(() => {
    fetchSavingsGoals();
  }, [fetchSavingsGoals]);

  const fetchSavingsGoals = async () => {
    if (!accountId) {
      setLoading(false);
      setError('No account ID available');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await getAccountSavingsGoals(accountId);
      setSavingsGoals(response.data);
    } catch (err: any) {
      console.error('Failed to fetch savings goals:', err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to load savings goals.';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async () => {
    if (!newGoalName.trim() || !newGoalAmount.trim()) {
      Alert.alert('Error', 'Please enter both goal name and target amount.');
      return;
    }

    const targetAmount = parseFloat(newGoalAmount);
    if (Number.isNaN(targetAmount) || targetAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid target amount.');
      return;
    }

    try {
      setLoading(true);
      await createSavingsGoal({
        accountId,
        name: newGoalName,
        targetAmount,
        targetDate: targetDate || undefined,
      });

      // Refresh the goals list
      await fetchSavingsGoals();

      // Reset form
      setNewGoalName('');
      setNewGoalAmount('');
      setTargetDate('');
      setShowAddForm(false);

      Alert.alert('Success', 'Savings goal created successfully!');
    } catch (err: any) {
      console.error('Failed to create savings goal:', err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to create savings goal.';
      Alert.alert('Error', errorMessage);
      setLoading(false);
    }
  };

  const handleContribute = (goalId: string) => {
    setSelectedGoalId(goalId);
    setShowContributeForm(true);
  };

  const handleDeleteGoal = async (goalId: string) => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this savings goal?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteSavingsGoal(goalId);
              await fetchSavingsGoals();
              Alert.alert('Success', 'Savings goal deleted successfully!');
            } catch (err: any) {
              console.error('Failed to delete savings goal:', err);
              const errorMessage =
                err.response?.data?.message ||
                err.message ||
                'Failed to delete savings goal.';
              Alert.alert('Error', errorMessage);
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleContributionSuccess = async () => {
    setShowContributeForm(false);
    setSelectedGoalId(null);
    await fetchSavingsGoals();
  };

  const renderSavingsGoalItem = ({item}: {item: SavingsGoal}) => (
    <View style={styles.goalItem}>
      <Text style={styles.goalName}>{item.name}</Text>
      <View style={styles.goalDetails}>
        <Text style={styles.goalAmount}>
          $
          {item.currentAmount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{' '}
          / $
          {item.targetAmount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
        <Text style={styles.goalDate}>
          Created: {new Date(item.createdDate).toLocaleDateString()}
        </Text>
        {item.targetDate && (
          <Text style={styles.goalDate}>
            Target: {new Date(item.targetDate).toLocaleDateString()}
          </Text>
        )}
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, {width: `${item.progress}%`}]} />
      </View>
      <Text style={styles.progressText}>{item.progress}% Complete</Text>

      {/* Action buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.contributeButton]}
          onPress={() => handleContribute(item.id)}>
          <Text style={styles.actionButtonText}>Contribute</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteGoal(item.id)}>
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Contribution Form Component
  const ContributionForm = ({
    goalId,
    onSuccess,
    onCancel,
  }: ContributionFormProps) => {
    const [amount, setAmount] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
      if (!amount.trim()) {
        Alert.alert('Error', 'Please enter a contribution amount.');
        return;
      }

      const contributionAmount = parseFloat(amount);
      if (Number.isNaN(contributionAmount) || contributionAmount <= 0) {
        Alert.alert('Error', 'Please enter a valid amount.');
        return;
      }

      try {
        setSubmitting(true);
        await contributeTosavingsGoal(goalId, {amount: contributionAmount});
        Alert.alert('Success', 'Contribution added successfully!');
        onSuccess();
      } catch (err: any) {
        console.error('Failed to add contribution:', err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          'Failed to add contribution.';
        Alert.alert('Error', errorMessage);
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Add Contribution</Text>
        <TextInput
          style={styles.input}
          placeholder="Amount ($)"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          autoFocus
        />
        <View style={styles.formButtons}>
          <TouchableOpacity
            style={[commonStyles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={submitting}>
            <Text style={commonStyles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[commonStyles.button, styles.saveButton]}
            onPress={handleSubmit}
            disabled={submitting}>
            <Text style={commonStyles.buttonText}>
              {submitting ? 'Processing...' : 'Add Contribution'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading && !showAddForm && !showContributeForm) {
    return (
      <View style={[commonStyles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading Savings Goals...</Text>
      </View>
    );
  }

  if (error && !showAddForm && !showContributeForm) {
    return (
      <View style={[commonStyles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity
          style={[commonStyles.button, styles.retryButton]}
          onPress={fetchSavingsGoals}>
          <Text style={commonStyles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <Text style={commonStyles.titleText}>Your Savings Goals</Text>

      {/* Add Goal Button */}
      {!showAddForm && !showContributeForm && (
        <TouchableOpacity
          style={[commonStyles.button, styles.addButton]}
          onPress={() => setShowAddForm(true)}>
          <Text style={commonStyles.buttonText}>Add New Savings Goal</Text>
        </TouchableOpacity>
      )}

      {/* Add Goal Form */}
      {showAddForm && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Create New Savings Goal</Text>
          <TextInput
            style={styles.input}
            placeholder="Goal Name (e.g., Vacation Fund)"
            value={newGoalName}
            onChangeText={setNewGoalName}
          />
          <TextInput
            style={styles.input}
            placeholder="Target Amount ($)"
            value={newGoalAmount}
            onChangeText={setNewGoalAmount}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Target Date (YYYY-MM-DD, optional)"
            value={targetDate}
            onChangeText={setTargetDate}
          />
          <View style={styles.formButtons}>
            <TouchableOpacity
              style={[commonStyles.button, styles.cancelButton]}
              onPress={() => {
                setShowAddForm(false);
                setNewGoalName('');
                setNewGoalAmount('');
                setTargetDate('');
              }}>
              <Text style={commonStyles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[commonStyles.button, styles.saveButton]}
              onPress={handleAddGoal}>
              <Text style={commonStyles.buttonText}>Save Goal</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Contribution Form */}
      {showContributeForm && selectedGoalId && (
        <ContributionForm
          goalId={selectedGoalId}
          onSuccess={handleContributionSuccess}
          onCancel={() => {
            setShowContributeForm(false);
            setSelectedGoalId(null);
          }}
        />
      )}

      {/* Goals List */}
      {!showAddForm && !showContributeForm && (
        <FlatList
          data={savingsGoals}
          renderItem={renderSavingsGoalItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No savings goals found.</Text>
              <Text style={styles.emptySubText}>
                Create a goal to start saving!
              </Text>
            </View>
          }
          style={styles.listContainer}
          contentContainerStyle={
            savingsGoals.length === 0 ? styles.emptyListContent : null
          }
        />
      )}
    </View>
  );
};

// Add specific styles for SavingsGoalsScreen
const styles = StyleSheet.create({
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#6c757d',
    marginBottom: 8,
  },
  emptySubText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#adb5bd',
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  addButton: {
    marginBottom: 20,
    backgroundColor: '#28a745',
  },
  retryButton: {
    marginTop: 10,
    backgroundColor: '#6c757d',
  },
  listContainer: {
    flex: 1,
  },
  goalItem: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: responsiveWidth(4),
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 1.0,
    elevation: 1,
  },
  goalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  goalDetails: {
    marginBottom: 10,
  },
  goalAmount: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  goalDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#e9ecef',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#17a2b8',
  },
  progressText: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'right',
    marginBottom: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  contributeButton: {
    backgroundColor: '#007bff',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: responsiveWidth(4),
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  input: {
    height: 45,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    marginRight: 10,
    backgroundColor: '#6c757d',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#28a745',
  },
});

export default SavingsGoalsScreen;
