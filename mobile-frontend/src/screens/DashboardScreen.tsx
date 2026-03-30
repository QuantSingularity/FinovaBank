import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type {RootStackParamList} from '../navigation/AppNavigator';
import {colors, commonStyles} from '../styles/commonStyles'; // Import common styles and colors

// Define the navigation prop type for this screen
type DashboardScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Dashboard'
>;

const DashboardScreen = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();

  // Placeholder data - replace with actual data fetched from API
  const accountSummary = {
    balance: 5420.5,
    accountNumber: '**** **** **** 1234',
  };

  const quickActions = [
    {
      label: 'View Transactions',
      screen: 'Transactions' as keyof RootStackParamList,
    },
    {label: 'Apply for Loan', screen: 'Loans' as keyof RootStackParamList},
    {
      label: 'Manage Savings',
      screen: 'SavingsGoals' as keyof RootStackParamList,
    },
    {
      label: 'Account Details',
      screen: 'AccountDetails' as keyof RootStackParamList,
      params: {accountId: '1'},
    }, // Example accountId
  ];

  return (
    <ScrollView style={commonStyles.container}>
      {' '}
      {/* Use ScrollView for potentially long content */}
      <Text style={commonStyles.titleText}>Welcome Back!</Text>
      {/* Account Summary Section */}
      <View style={[commonStyles.card, styles.sectionContainer]}>
        {' '}
        {/* Use card style */}
        <Text style={styles.sectionTitle}>Account Summary</Text>
        <Text style={styles.balanceText}>
          ${accountSummary.balance.toFixed(2)}
        </Text>
        <Text style={styles.accountNumberText}>
          Account: {accountSummary.accountNumber}
        </Text>
      </View>
      {/* Quick Actions Section */}
      <View style={[commonStyles.card, styles.sectionContainer]}>
        {' '}
        {/* Use card style */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        {quickActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[commonStyles.button, styles.actionButton]} // Use common button style
            onPress={() =>
              navigation.navigate(action.screen, action.params as any)
            } // Navigate to the respective screen
          >
            <Text style={commonStyles.buttonText}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Add more sections as needed, e.g., Recent Transactions, Notifications */}
    </ScrollView>
  );
};

// Add specific styles for DashboardScreen
const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 20, // Increased margin between cards
    // Removed background color, shadow etc. as it's handled by commonStyles.card
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600', // Semibold
    marginBottom: 12,
    color: colors.textPrimary,
  },
  balanceText: {
    fontSize: 28, // Larger balance font size
    fontWeight: 'bold',
    color: colors.primary, // Use primary color for balance
    marginBottom: 8,
  },
  accountNumberText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  actionButton: {
    marginBottom: 12, // Add margin between buttons
    width: '100%', // Make buttons full width within the card
    alignSelf: 'auto', // Reset alignSelf from commonStyles.button
  },
});

export default DashboardScreen;
