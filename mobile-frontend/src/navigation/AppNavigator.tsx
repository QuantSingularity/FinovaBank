/**
 * AppNavigator — FinovaBank Expo Edition
 *
 * Changes vs original:
 * - Wraps everything in SafeAreaProvider (fixes notch/status-bar overlap)
 * - Bottom tab navigator for main sections (Dashboard, Transactions, Loans, Savings)
 * - Profile tab added (was missing)
 * - TransactionFilters uses a navigation-state approach instead of passing
 *   functions through params (functions can't be serialised in RN Navigation)
 * - StatusBar configured per-screen theme
 */

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { ActivityIndicator, View, StyleSheet, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../context/AuthContext";
import { colors } from "../styles/commonStyles";

// Screens
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import DashboardScreen from "../screens/DashboardScreen";
import AccountDetailsScreen from "../screens/AccountDetailsScreen";
import TransactionsScreen from "../screens/TransactionsScreen";
import TransactionDetailsScreen from "../screens/TransactionDetailsScreen";
import TransactionFiltersScreen from "../screens/TransactionFiltersScreen";
import LoansScreen from "../screens/LoansScreen";
import SavingsGoalsScreen from "../screens/SavingsGoalsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import TransferScreen from "../screens/TransferScreen";
import NotificationsScreen from "../screens/NotificationsScreen";

// ── Param lists ────────────────────────────────────────────────────────────
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  AccountDetails: { accountId?: string };
  TransactionDetails: {
    transactionId: string;
    transaction?: Record<string, unknown>;
  };
  // Filter screen uses a filterKey instead of a callback function
  // (functions cannot be serialised in React Navigation params)
  TransactionFilters: {
    filterKey: string; // unique key written to a shared ref store
    currentFilter?: { startDate: string; endDate: string; type?: string };
  };
  Transfer: { accountId?: string };
  Notifications: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Transactions: { accountId?: string };
  Loans: { accountId?: string };
  Savings: { accountId?: string };
  Profile: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// ── Tab icon helper (uses emoji for zero native-dependency icons) ──────────
const TabIcon = ({
  icon,
  focused,
  color,
}: {
  icon: string;
  focused: boolean;
  color: string;
}) => (
  <Text style={{ fontSize: focused ? 24 : 22, opacity: focused ? 1 : 0.6 }}>
    {icon}
  </Text>
);

// ── Bottom Tab Navigator ──────────────────────────────────────────────────
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarStyle: {
        backgroundColor: colors.backgroundWhite,
        borderTopColor: colors.border,
        borderTopWidth: 1,
        height: 60,
        paddingBottom: 8,
        paddingTop: 4,
      },
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: "600",
      },
    }}
  >
    <Tab.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{
        tabBarLabel: "Home",
        tabBarIcon: ({ focused, color }) => (
          <TabIcon icon="🏠" focused={focused} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Transactions"
      component={TransactionsScreen}
      options={{
        tabBarLabel: "Transactions",
        tabBarIcon: ({ focused, color }) => (
          <TabIcon icon="↕️" focused={focused} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Loans"
      component={LoansScreen}
      options={{
        tabBarLabel: "Loans",
        tabBarIcon: ({ focused, color }) => (
          <TabIcon icon="🏦" focused={focused} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Savings"
      component={SavingsGoalsScreen}
      options={{
        tabBarLabel: "Savings",
        tabBarIcon: ({ focused, color }) => (
          <TabIcon icon="🎯" focused={focused} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarLabel: "Profile",
        tabBarIcon: ({ focused, color }) => (
          <TabIcon icon="👤" focused={focused} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

// ── Auth Stack ────────────────────────────────────────────────────────────
const AuthNavigator = () => (
  <AuthStack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.backgroundWhite },
      headerTintColor: colors.textPrimary,
      headerShadowVisible: false,
      headerBackTitleVisible: false,
    }}
  >
    <AuthStack.Screen
      name="Login"
      component={LoginScreen}
      options={{ headerShown: false }}
    />
    <AuthStack.Screen
      name="Register"
      component={RegisterScreen}
      options={{ title: "Create Account" }}
    />
    <AuthStack.Screen
      name="ForgotPassword"
      component={ForgotPasswordScreen}
      options={{ title: "Reset Password" }}
    />
  </AuthStack.Navigator>
);

// ── Root Navigator ────────────────────────────────────────────────────────
const RootNavigator = () => {
  const { userToken, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!userToken) {
    return <AuthNavigator />;
  }

  return (
    <RootStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.backgroundWhite },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontWeight: "700", fontSize: 17 },
        headerShadowVisible: false,
        headerBackTitleVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <RootStack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="AccountDetails"
        component={AccountDetailsScreen}
        options={{ title: "Account Details" }}
      />
      <RootStack.Screen
        name="TransactionDetails"
        component={TransactionDetailsScreen}
        options={{ title: "Transaction Details" }}
      />
      <RootStack.Screen
        name="TransactionFilters"
        component={TransactionFiltersScreen}
        options={{ title: "Filter Transactions", presentation: "modal" }}
      />
      <RootStack.Screen
        name="Transfer"
        component={TransferScreen}
        options={{ title: "Transfer Funds", presentation: "modal" }}
      />
      <RootStack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: "Notifications" }}
      />
    </RootStack.Navigator>
  );
};

// ── App Navigator (root export) ───────────────────────────────────────────
const AppNavigator = () => (
  <SafeAreaProvider>
    <StatusBar style="auto" />
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  </SafeAreaProvider>
);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.backgroundWhite,
  },
});

export default AppNavigator;
