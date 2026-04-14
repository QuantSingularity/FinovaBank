import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useRef, useState} from 'react';
import {
  ActivityIndicator,
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

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {login, isLoading} = useAuth();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const passwordRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    try {
      await login({email: email.trim().toLowerCase(), password});
    } catch (apiError: unknown) {
      const err = apiError as {
        response?: {data?: {error?: {message?: string}; message?: string}};
        message?: string;
      };
      setError(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          err.message ||
          'Login failed. Please check your credentials.',
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Hero banner */}
        <View style={styles.heroBanner}>
          <View style={styles.logoRow}>
            <View style={styles.logoBox}>
              <Text style={styles.logoLetter}>F</Text>
            </View>
            <Text style={styles.appName}>FinovaBank</Text>
          </View>
          <Text style={styles.heroTagline}>
            Your money, beautifully managed
          </Text>
          {/* decorative circles */}
          <View style={styles.circleDecor1} />
          <View style={styles.circleDecor2} />
        </View>

        {/* Form card */}
        <View style={styles.formCard}>
          <Text style={styles.welcomeTitle}>Welcome back</Text>
          <Text style={styles.welcomeSub}>Sign in to your account</Text>

          {error ? (
            <View style={commonStyles.errorContainer}>
              <Text style={commonStyles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email address</Text>
            <TextInput
              style={[
                commonStyles.input,
                emailFocused && commonStyles.inputFocused,
              ]}
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              placeholderTextColor={colors.textTertiary}
              editable={!isLoading}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <View style={commonStyles.spaceBetween}>
              <Text style={styles.fieldLabel}>Password</Text>
              <TouchableOpacity>
                <Text style={styles.forgotLink}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.passwordWrap}>
              <TextInput
                ref={passwordRef}
                style={[
                  commonStyles.input,
                  passwordFocused && commonStyles.inputFocused,
                  {marginBottom: 0, paddingRight: 48},
                ]}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                placeholderTextColor={colors.textTertiary}
                editable={!isLoading}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(v => !v)}>
                <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign in button */}
          <TouchableOpacity
            style={[styles.signInBtn, isLoading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}>
            {isLoading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={commonStyles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.divLine} />
            <Text style={styles.divText}>or</Text>
            <View style={styles.divLine} />
          </View>

          {/* Register link */}
          <TouchableOpacity
            style={styles.registerRow}
            onPress={() => navigation.navigate('Register')}
            disabled={isLoading}
            activeOpacity={0.7}>
            <Text style={styles.registerText}>
              Don't have an account?{' '}
              <Text style={styles.registerLink}>Create one</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Trust badges */}
        <View style={styles.trustRow}>
          {['🔒 256-bit SSL', '🏦 FDIC Insured', '⚡ Instant Access'].map(b => (
            <View key={b} style={styles.trustBadge}>
              <Text style={styles.trustText}>{b}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardView: {flex: 1, backgroundColor: colors.background},
  scrollContent: {flexGrow: 1, paddingBottom: 32},

  heroBanner: {
    background: 'transparent',
    backgroundColor: colors.gradientStart,
    paddingHorizontal: 28,
    paddingTop: 64,
    paddingBottom: 52,
    overflow: 'hidden',
    position: 'relative',
  },
  logoRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 20},
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logoLetter: {fontSize: 24, fontWeight: '800', color: colors.white},
  appName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -0.3,
  },
  heroTagline: {fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 22},
  circleDecor1: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  circleDecor2: {
    position: 'absolute',
    right: 40,
    bottom: -60,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  formCard: {
    backgroundColor: colors.backgroundWhite,
    marginHorizontal: 20,
    marginTop: -24,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: {width: 0, height: 8},
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {elevation: 6},
    }),
  },

  welcomeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  welcomeSub: {fontSize: 14, color: colors.textSecondary, marginBottom: 22},

  fieldGroup: {marginBottom: 6},
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  forgotLink: {fontSize: 13, color: colors.primary, fontWeight: '500'},

  passwordWrap: {position: 'relative'},
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  eyeIcon: {fontSize: 16},

  signInBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
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

  dividerRow: {flexDirection: 'row', alignItems: 'center', marginVertical: 20},
  divLine: {flex: 1, height: 1, backgroundColor: colors.border},
  divText: {marginHorizontal: 12, color: colors.textTertiary, fontSize: 13},

  registerRow: {alignItems: 'center', paddingVertical: 6},
  registerText: {fontSize: 14, color: colors.textSecondary},
  registerLink: {color: colors.primary, fontWeight: '600'},

  trustRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 20,
  },
  trustBadge: {
    backgroundColor: colors.backgroundWhite,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  trustText: {fontSize: 11, color: colors.textSecondary, fontWeight: '500'},
});

export default LoginScreen;
