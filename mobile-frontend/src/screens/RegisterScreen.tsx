import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useRef, useState} from 'react';
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

type RegisterNavProp = NativeStackNavigationProp<
  RootStackParamList,
  'Register'
>;

const RegisterScreen = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [firstFocus, setFirstFocus] = useState(false);
  const [lastFocus, setLastFocus] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [passFocus, setPassFocus] = useState(false);
  const [confirmFocus, setConfirmFocus] = useState(false);

  const {register, isLoading} = useAuth();
  const navigation = useNavigation<RegisterNavProp>();

  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const handleRegister = async () => {
    setError('');
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
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
        email: email.trim().toLowerCase(),
        password,
        confirmPassword,
      });
      Alert.alert(
        'Welcome to FinovaBank!',
        'Your account has been created successfully.',
      );
    } catch (err: unknown) {
      const e = err as {
        response?: {data?: {message?: string}};
        message?: string;
      };
      setError(
        e.response?.data?.message ||
          e.message ||
          'Registration failed. Please try again.',
      );
    }
  };

  // password strength hints
  const hints = [
    {label: '8+ characters', met: password.length >= 8},
    {label: 'Letters & numbers', met: /(?=.*[a-zA-Z])(?=.*\d)/.test(password)},
    {
      label: 'Passwords match',
      met: !!confirmPassword && password === confirmPassword,
    },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoLetter}>F</Text>
          </View>
          <Text style={styles.headerTitle}>Create your account</Text>
          <Text style={styles.headerSub}>Join 2.4M+ FinovaBank customers</Text>
        </View>

        {/* Form card */}
        <View style={styles.formCard}>
          {error ? (
            <View style={commonStyles.errorContainer}>
              <Text style={commonStyles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Name row */}
          <View style={styles.nameRow}>
            <View style={styles.halfField}>
              <Text style={styles.fieldLabel}>First Name</Text>
              <TextInput
                style={[
                  commonStyles.input,
                  firstFocus && commonStyles.inputFocused,
                  {marginBottom: 0},
                ]}
                placeholder="Jane"
                placeholderTextColor={colors.textTertiary}
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => lastNameRef.current?.focus()}
                editable={!isLoading}
                onFocus={() => setFirstFocus(true)}
                onBlur={() => setFirstFocus(false)}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.fieldLabel}>Last Name</Text>
              <TextInput
                ref={lastNameRef}
                style={[
                  commonStyles.input,
                  lastFocus && commonStyles.inputFocused,
                  {marginBottom: 0},
                ]}
                placeholder="Doe"
                placeholderTextColor={colors.textTertiary}
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
                editable={!isLoading}
                onFocus={() => setLastFocus(true)}
                onBlur={() => setLastFocus(false)}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email address</Text>
            <TextInput
              ref={emailRef}
              style={[
                commonStyles.input,
                emailFocus && commonStyles.inputFocused,
                {marginBottom: 0},
              ]}
              placeholder="you@example.com"
              placeholderTextColor={colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              editable={!isLoading}
              onFocus={() => setEmailFocus(true)}
              onBlur={() => setEmailFocus(false)}
            />
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Password</Text>
            <View style={styles.passwordWrap}>
              <TextInput
                ref={passwordRef}
                style={[
                  commonStyles.input,
                  passFocus && commonStyles.inputFocused,
                  {marginBottom: 0, paddingRight: 48},
                ]}
                placeholder="Min. 8 characters"
                placeholderTextColor={colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                returnKeyType="next"
                onSubmitEditing={() => confirmRef.current?.focus()}
                editable={!isLoading}
                onFocus={() => setPassFocus(true)}
                onBlur={() => setPassFocus(false)}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPass(v => !v)}>
                <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Confirm Password</Text>
            <View style={styles.passwordWrap}>
              <TextInput
                ref={confirmRef}
                style={[
                  commonStyles.input,
                  confirmFocus && commonStyles.inputFocused,
                  {marginBottom: 0, paddingRight: 48},
                ]}
                placeholder="Re-enter password"
                placeholderTextColor={colors.textTertiary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
                editable={!isLoading}
                onFocus={() => setConfirmFocus(true)}
                onBlur={() => setConfirmFocus(false)}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowConfirm(v => !v)}>
                <Text style={styles.eyeIcon}>{showConfirm ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Hints */}
          <View style={styles.hintRow}>
            {hints.map(h => (
              <View key={h.label} style={styles.hintItem}>
                <Text
                  style={[
                    styles.hintDot,
                    {color: h.met ? colors.success : colors.textDisabled},
                  ]}>
                  ●
                </Text>
                <Text
                  style={[
                    styles.hintText,
                    {color: h.met ? colors.success : colors.textTertiary},
                  ]}>
                  {h.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, isLoading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.85}>
            {isLoading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={commonStyles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signinRow}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
            activeOpacity={0.7}>
            <Text style={styles.signinText}>
              Already have an account?{' '}
              <Text style={styles.signinLink}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Security note */}
        <View style={styles.securityNote}>
          <Text style={styles.securityText}>
            🔒 Your data is encrypted with 256-bit SSL and stored securely.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.background},
  scroll: {flexGrow: 1, paddingBottom: 32},

  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 28,
    paddingHorizontal: 24,
  },
  logoBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
      android: {elevation: 6},
    }),
  },
  logoLetter: {fontSize: 28, fontWeight: '800', color: colors.white},
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  headerSub: {fontSize: 14, color: colors.textSecondary},

  formCard: {
    marginHorizontal: 20,
    backgroundColor: colors.backgroundWhite,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {elevation: 4},
    }),
  },

  nameRow: {flexDirection: 'row', gap: 10, marginBottom: 0},
  halfField: {flex: 1},
  fieldGroup: {marginBottom: 6, marginTop: 10},
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },

  passwordWrap: {position: 'relative'},
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  eyeIcon: {fontSize: 16},

  hintRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
    marginBottom: 18,
  },
  hintItem: {flexDirection: 'row', alignItems: 'center', gap: 4},
  hintDot: {fontSize: 8},
  hintText: {fontSize: 12},

  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
      android: {elevation: 5},
    }),
  },
  btnDisabled: {opacity: 0.6},

  signinRow: {alignItems: 'center', paddingVertical: 16},
  signinText: {fontSize: 14, color: colors.textSecondary},
  signinLink: {color: colors.primary, fontWeight: '600'},

  securityNote: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: colors.backgroundWhite,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  securityText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default RegisterScreen;
