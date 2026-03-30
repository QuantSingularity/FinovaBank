import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useAuth} from '../context/AuthContext';
import type {RootStackParamList} from '../navigation/AppNavigator';
import {colors, commonStyles} from '../styles/commonStyles';

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Register'
>;

const RegisterScreen = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const {register, isLoading} = useAuth();
  const navigation = useNavigation<RegisterScreenNavigationProp>();

  const handleRegister = async () => {
    setError('');

    // Validation
    if (!firstName.trim() || !lastName.trim() || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        confirmPassword,
      });
      Alert.alert('Success', 'Registration successful! Please log in.');
      navigation.navigate('Login');
    } catch (apiError: any) {
      console.error('Registration failed:', apiError);
      const errorMessage =
        apiError.response?.data?.error?.message ||
        apiError.response?.data?.message ||
        apiError.message ||
        'Registration failed. Please try again.';
      setError(errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={commonStyles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.innerContainer}>
          <Text style={commonStyles.titleText}>Create Account</Text>
          <Text style={commonStyles.subtitleText}>Join FinovaBank today!</Text>

          {error ? <Text style={commonStyles.errorText}>{error}</Text> : null}

          <TextInput
            style={commonStyles.input}
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
            placeholderTextColor={colors.textSecondary}
            editable={!isLoading}
            autoCapitalize="words"
          />
          <TextInput
            style={commonStyles.input}
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
            placeholderTextColor={colors.textSecondary}
            editable={!isLoading}
            autoCapitalize="words"
          />
          <TextInput
            style={commonStyles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={colors.textSecondary}
            editable={!isLoading}
          />
          <TextInput
            style={commonStyles.input}
            placeholder="Password (min. 6 characters)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor={colors.textSecondary}
            editable={!isLoading}
          />
          <TextInput
            style={commonStyles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholderTextColor={colors.textSecondary}
            editable={!isLoading}
          />

          <TouchableOpacity
            style={[commonStyles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={commonStyles.buttonText}>Register</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              commonStyles.button,
              commonStyles.buttonSecondary,
              styles.loginButton,
              isLoading && styles.buttonDisabled,
            ]}
            onPress={() => navigation.navigate('Login')}
            disabled={isLoading}>
            <Text
              style={[
                commonStyles.buttonText,
                commonStyles.buttonTextSecondary,
              ]}>
              Already have an account? Login
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Add specific styles for RegisterScreen
const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  loginButton: {
    marginTop: 10,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default RegisterScreen;
