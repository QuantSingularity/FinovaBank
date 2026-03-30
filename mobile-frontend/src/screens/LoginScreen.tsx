import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useAuth} from '../context/AuthContext'; // Import useAuth hook
import type {RootStackParamList} from '../navigation/AppNavigator';
import {colors, commonStyles} from '../styles/commonStyles'; // Import common styles and colors

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // State for login error message
  const {login, isLoading} = useAuth(); // Get login function and loading state from context
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const handleLogin = async () => {
    setError(''); // Clear previous errors
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    try {
      await login({email, password});
      // Navigation is handled by AppNavigator based on userToken change
    } catch (apiError: any) {
      // Specify 'any' or a more specific error type
      console.error('Login failed:', apiError);
      const errorMessage =
        apiError.response?.data?.error?.message ||
        apiError.message ||
        'Login failed. Please check your credentials and try again.';
      setError(errorMessage);
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={commonStyles.container}>
      <View style={styles.innerContainer}>
        <Text style={commonStyles.titleText}>Welcome Back!</Text>
        <Text style={commonStyles.subtitleText}>
          Login to your FinovaBank account
        </Text>

        {error ? <Text style={commonStyles.errorText}>{error}</Text> : null}

        <TextInput
          style={commonStyles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={colors.textSecondary}
          editable={!isLoading} // Disable input during loading
        />
        <TextInput
          style={commonStyles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor={colors.textSecondary}
          editable={!isLoading} // Disable input during loading
        />
        <TouchableOpacity
          style={[commonStyles.button, isLoading && styles.buttonDisabled]} // Apply disabled style if loading
          onPress={handleLogin}
          disabled={isLoading} // Disable button during loading
        >
          {isLoading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={commonStyles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            commonStyles.button,
            commonStyles.buttonSecondary,
            styles.registerButton,
            isLoading && styles.buttonDisabled,
          ]} // Use secondary button style
          onPress={navigateToRegister}
          disabled={isLoading} // Disable button during loading
        >
          <Text
            style={[commonStyles.buttonText, commonStyles.buttonTextSecondary]}>
            Don't have an account? Register
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// Add specific styles for LoginScreen if needed
const styles = StyleSheet.create({
  innerContainer: {
    flex: 1,
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
    width: '100%',
  },
  registerButton: {
    marginTop: 10, // Keep specific margin if needed
    borderWidth: 0, // Remove border if using surface background for secondary
    backgroundColor: 'transparent', // Make background transparent for text-like button
  },
  buttonDisabled: {
    opacity: 0.6, // Reduce opacity for disabled buttons
  },
});

export default LoginScreen;
