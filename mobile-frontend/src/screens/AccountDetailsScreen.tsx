import {
  type RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {useEffect, useState} from 'react';
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

// Define the route prop type for this screen
type AccountDetailsScreenRouteProp = RouteProp<
  RootStackParamList,
  'AccountDetails'
>;

// Define the structure for account details data
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

const AccountDetailsScreen = () => {
  const route = useRoute<AccountDetailsScreenRouteProp>();
  const navigation = useNavigation();
  const {userData} = useAuth();

  // Get accountId from route params or use default from user data
  const accountId =
    route.params?.accountId || (userData?.id ? userData.id : '');

  const [accountDetails, setAccountDetails] =
    useState<AccountDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
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
      } catch (err: any) {
        console.error('Failed to fetch account details:', err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          'Failed to load account details.';
        setError(errorMessage);
        Alert.alert('Error', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [accountId]);

  const handleViewTransactions = () => {
    navigation.navigate('Transactions', {accountId});
  };

  const handleViewSavingsGoals = () => {
    navigation.navigate('SavingsGoals', {accountId});
  };

  const handleViewLoans = () => {
    navigation.navigate('Loans', {accountId});
  };

  if (loading) {
    return (
      <View style={[commonStyles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading Account Details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[commonStyles.container, styles.centerContent]}>
        <Text style={commonStyles.errorText}>Error: {error}</Text>
        <TouchableOpacity
          style={[commonStyles.button, styles.retryButton]}
          onPress={() => navigation.navigate('Dashboard')}>
          <Text style={commonStyles.buttonText}>Return to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!accountDetails) {
    return (
      <View style={[commonStyles.container, styles.centerContent]}>
        <Text style={styles.infoText}>No account details found.</Text>
        <TouchableOpacity
          style={[commonStyles.button, styles.retryButton]}
          onPress={() => navigation.navigate('Dashboard')}>
          <Text style={commonStyles.buttonText}>Return to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={commonStyles.container}>
      <Text style={commonStyles.titleText}>Account Details</Text>

      <View style={[commonStyles.card, styles.detailsContainer]}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Account Number:</Text>
          <Text style={styles.detailValue}>{accountDetails.accountNumber}</Text>
        </View>
        {accountDetails.routingNumber && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Routing Number:</Text>
            <Text style={styles.detailValue}>
              {accountDetails.routingNumber}
            </Text>
          </View>
        )}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Account Type:</Text>
          <Text style={styles.detailValue}>{accountDetails.accountType}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status:</Text>
          <Text
            style={[
              styles.detailValue,
              styles.statusValue(accountDetails.status),
            ]}>
            {accountDetails.status}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Open Date:</Text>
          <Text style={styles.detailValue}>
            {new Date(accountDetails.openDate).toLocaleDateString()}
          </Text>
        </View>
        {accountDetails.interestRate !== undefined && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Interest Rate:</Text>
            <Text style={styles.detailValue}>
              {accountDetails.interestRate.toFixed(2)}%
            </Text>
          </View>
        )}
        <View style={[styles.detailRow, styles.lastDetailRow]}>
          <Text style={styles.detailLabel}>Balance:</Text>
          <Text style={[styles.detailValue, styles.balanceValue]}>
            $
            {accountDetails.balance.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>
      </View>

      <View style={styles.accountOwnerContainer}>
        <Text style={styles.sectionTitle}>Account Owner</Text>
        <View style={[commonStyles.card, styles.ownerDetailsContainer]}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Name:</Text>
            <Text style={styles.detailValue}>{accountDetails.name}</Text>
          </View>
          <View style={[styles.detailRow, styles.lastDetailRow]}>
            <Text style={styles.detailLabel}>Email:</Text>
            <Text style={styles.detailValue}>{accountDetails.email}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Account Actions</Text>
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[commonStyles.button, styles.actionButton]}
            onPress={handleViewTransactions}>
            <Text style={commonStyles.buttonText}>Transactions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[commonStyles.button, styles.actionButton]}
            onPress={handleViewSavingsGoals}>
            <Text style={commonStyles.buttonText}>Savings Goals</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[commonStyles.button, styles.actionButton]}
            onPress={handleViewLoans}>
            <Text style={commonStyles.buttonText}>Loans</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.lastUpdatedText}>
        Last updated: {new Date(accountDetails.lastUpdated).toLocaleString()}
      </Text>
    </ScrollView>
  );
};

// Add specific styles for AccountDetailsScreen
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
  infoText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  retryButton: {
    marginTop: 15,
    backgroundColor: colors.secondary,
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lastDetailRow: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  balanceValue: {
    fontWeight: 'bold',
    color: colors.primary,
    fontSize: 18,
  },
  statusValue: status => ({
    color:
      status === 'ACTIVE'
        ? colors.success
        : status === 'INACTIVE'
          ? colors.warning
          : status === 'FROZEN'
            ? colors.error
            : colors.textSecondary,
    fontWeight: '500',
  }),
  accountOwnerContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  ownerDetailsContainer: {
    marginBottom: 0,
  },
  actionsContainer: {
    marginBottom: 20,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
    marginBottom: 10,
    minWidth: '30%',
  },
  lastUpdatedText: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
});

export default AccountDetailsScreen;
