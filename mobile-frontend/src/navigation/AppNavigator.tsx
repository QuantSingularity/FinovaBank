import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ActivityIndicator, View} from 'react-native';
import {useAuth} from '../context/AuthContext';
import AccountDetailsScreen from '../screens/AccountDetailsScreen';
import DashboardScreen from '../screens/DashboardScreen';
import LoansScreen from '../screens/LoansScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SavingsGoalsScreen from '../screens/SavingsGoalsScreen';
import TransactionDetailsScreen from '../screens/TransactionDetailsScreen';
import TransactionFiltersScreen from '../screens/TransactionFiltersScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import {colors, commonStyles} from '../styles/commonStyles';

// Define the type for the stack navigator parameters
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  AccountDetails: {accountId?: string};
  Transactions: {accountId?: string};
  TransactionDetails: {
    transactionId: string;
    transaction?: any;
  };
  TransactionFilters: {
    currentFilter?: {
      startDate: string;
      endDate: string;
      type?: string;
    };
    onFilterApply?: (filter: any) => void;
  };
  Loans: {accountId?: string};
  SavingsGoals: {accountId?: string};
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const {userToken, isLoading} = useAuth();

  if (isLoading) {
    // Show a loading screen while checking token
    return (
      <View
        style={[
          commonStyles.container,
          {justifyContent: 'center', alignItems: 'center'},
        ]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {userToken == null ? (
          // No token found, user isn't signed in
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{
                title: 'Create Account',
                headerBackTitleVisible: false,
              }}
            />
          </>
        ) : (
          // User is signed in
          <>
            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{title: 'Dashboard'}}
            />
            <Stack.Screen
              name="AccountDetails"
              component={AccountDetailsScreen}
              options={{title: 'Account Details'}}
            />
            <Stack.Screen
              name="Transactions"
              component={TransactionsScreen}
              options={{title: 'Transactions'}}
            />
            <Stack.Screen
              name="TransactionDetails"
              component={TransactionDetailsScreen}
              options={{title: 'Transaction Details'}}
            />
            <Stack.Screen
              name="TransactionFilters"
              component={TransactionFiltersScreen}
              options={{title: 'Filter Transactions', presentation: 'modal'}}
            />
            <Stack.Screen
              name="Loans"
              component={LoansScreen}
              options={{title: 'Loans'}}
            />
            <Stack.Screen
              name="SavingsGoals"
              component={SavingsGoalsScreen}
              options={{title: 'Savings Goals'}}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
