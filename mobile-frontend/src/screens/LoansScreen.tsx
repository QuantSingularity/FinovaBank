import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useAuth} from '../context/AuthContext';
import type {RootStackParamList} from '../navigation/AppNavigator';
import {applyForLoan, getAccountLoans, getLoanTypes} from '../services/api';
import {commonStyles, responsiveWidth} from '../styles/commonStyles';

// Define the structure for loan data
interface Loan {
  id: string;
  type: string;
  amount: number;
  interestRate: number;
  term: number; // in months
  monthlyPayment: number;
  remainingBalance: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'PAID';
  appliedDate: string;
  approvalDate?: string;
}

// Define the navigation prop type for this screen
type LoansScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Loans'
>;

interface LoanApplicationFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (loanData: any) => void;
}

const LoansScreen = ({route}: any) => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [loanTypes, setLoanTypes] = useState<
    {id: string; name: string; maxAmount: number; baseRate: number}[]
  >([]);

  const navigation = useNavigation<LoansScreenNavigationProp>();
  const {userData} = useAuth();

  // Get accountId from route params or use default from user data
  const accountId =
    route?.params?.accountId || (userData?.id ? userData.id : '');

  useEffect(() => {
    const fetchLoans = async () => {
      if (!accountId) {
        setLoading(false);
        setError('No account ID available');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await getAccountLoans(accountId);
        setLoans(response.data);

        // Also fetch available loan types
        const typesResponse = await getLoanTypes();
        setLoanTypes(typesResponse.data);
      } catch (err: any) {
        console.error('Failed to fetch loans:', err);
        const errorMessage =
          err.response?.data?.message || err.message || 'Failed to load loans.';
        setError(errorMessage);
        Alert.alert('Error', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, [accountId]);

  const handleApplyLoan = () => {
    setShowLoanForm(true);
  };

  const handleLoanFormClose = () => {
    setShowLoanForm(false);
  };

  const handleLoanSubmit = async (loanData: any) => {
    try {
      setLoading(true);
      await applyForLoan({
        ...loanData,
        accountId,
      });

      // Refresh loans list after successful application
      const response = await getAccountLoans(accountId);
      setLoans(response.data);

      Alert.alert('Success', 'Loan application submitted successfully!');
    } catch (err: any) {
      console.error('Failed to apply for loan:', err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to submit loan application.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
      setShowLoanForm(false);
    }
  };

  const renderLoanItem = ({item}: {item: Loan}) => (
    <TouchableOpacity
      style={styles.loanItem}
      onPress={() => navigation.navigate('LoanDetails', {loanId: item.id})}>
      <View style={styles.loanDetails}>
        <Text style={styles.loanType}>{item.type}</Text>
        <Text style={styles.loanDate}>
          Applied: {new Date(item.appliedDate).toLocaleDateString()}
        </Text>
        <Text style={styles.loanAmount}>
          Amount: $
          {item.amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
        {item.status === 'ACTIVE' && (
          <Text style={styles.loanPayment}>
            Monthly Payment: $
            {item.monthlyPayment.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        )}
      </View>
      <Text style={[styles.loanStatus, getStatusStyle(item.status)]}>
        {item.status}
      </Text>
    </TouchableOpacity>
  );

  const getStatusStyle = (status: Loan['status']) => {
    switch (status) {
      case 'APPROVED':
      case 'ACTIVE':
        return styles.statusApproved;
      case 'PENDING':
        return styles.statusPending;
      case 'REJECTED':
        return styles.statusRejected;
      case 'PAID':
        return styles.statusPaid;
      default:
        return {};
    }
  };

  if (loading) {
    return (
      <View style={[commonStyles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading Loans...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[commonStyles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity
          style={[commonStyles.button, styles.retryButton]}
          onPress={() => navigation.navigate('Dashboard')}>
          <Text style={commonStyles.buttonText}>Return to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <Text style={commonStyles.titleText}>Your Loans</Text>
      <TouchableOpacity
        style={[commonStyles.button, styles.applyButton]}
        onPress={handleApplyLoan}>
        <Text style={commonStyles.buttonText}>Apply for a New Loan</Text>
      </TouchableOpacity>

      {showLoanForm && (
        <LoanApplicationForm
          visible={showLoanForm}
          onClose={handleLoanFormClose}
          onSubmit={handleLoanSubmit}
          loanTypes={loanTypes}
        />
      )}

      <FlatList
        data={loans}
        renderItem={renderLoanItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No loans found.</Text>
            <Text style={styles.emptySubText}>
              Apply for a loan to get started.
            </Text>
          </View>
        }
        style={styles.listContainer}
        contentContainerStyle={
          loans.length === 0 ? styles.emptyListContent : null
        }
      />
    </View>
  );
};

// Loan Application Form Component
const LoanApplicationForm = ({visible, onClose, onSubmit, loanTypes}) => {
  const [loanType, setLoanType] = useState('');
  const [amount, setAmount] = useState('');
  const [term, setTerm] = useState('');
  const [purpose, setPurpose] = useState('');

  if (!visible) return null;

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Apply for a Loan</Text>

      <View style={styles.formField}>
        <Text style={styles.formLabel}>Loan Type</Text>
        {/* Implement dropdown for loan types */}
        {/* For simplicity, using a text input here */}
        <TextInput
          style={styles.formInput}
          value={loanType}
          onChangeText={setLoanType}
          placeholder="Select loan type"
        />
      </View>

      <View style={styles.formField}>
        <Text style={styles.formLabel}>Amount</Text>
        <TextInput
          style={styles.formInput}
          value={amount}
          onChangeText={setAmount}
          placeholder="Enter loan amount"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formField}>
        <Text style={styles.formLabel}>Term (months)</Text>
        <TextInput
          style={styles.formInput}
          value={term}
          onChangeText={setTerm}
          placeholder="Enter loan term"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formField}>
        <Text style={styles.formLabel}>Purpose</Text>
        <TextInput
          style={styles.formInput}
          value={purpose}
          onChangeText={setPurpose}
          placeholder="Enter loan purpose"
          multiline
        />
      </View>

      <View style={styles.formButtons}>
        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={() =>
            onSubmit({
              loanType,
              amount: parseFloat(amount),
              term: parseInt(term, 10),
              purpose,
            })
          }>
          <Text style={styles.submitButtonText}>Submit Application</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Add specific styles for LoansScreen
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
  applyButton: {
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
  loanItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: responsiveWidth(3.5),
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 1.0,
    elevation: 1,
  },
  loanDetails: {
    flex: 1,
    marginRight: 10,
  },
  loanType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  loanDate: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  loanAmount: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  loanPayment: {
    fontSize: 14,
    color: '#28a745',
    marginTop: 4,
    fontWeight: '500',
  },
  loanStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    overflow: 'hidden',
    textAlign: 'center',
  },
  statusApproved: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  statusPending: {
    backgroundColor: '#fff3cd',
    color: '#856404',
  },
  statusRejected: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
  statusPaid: {
    backgroundColor: '#e2e3e5',
    color: '#383d41',
  },
  // Form styles
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  formField: {
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 4,
    padding: 8,
    fontSize: 16,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    padding: 10,
    borderRadius: 4,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ced4da',
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6c757d',
    fontWeight: '500',
  },
  submitButton: {
    padding: 10,
    borderRadius: 4,
    backgroundColor: '#007bff',
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
});

export default LoansScreen;
