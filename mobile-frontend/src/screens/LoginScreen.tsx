import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useRef, useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import type { AuthStackParamList } from "../navigation/AppNavigator";
import { colors, commonStyles } from "../styles/commonStyles";

type LoginNav = NativeStackNavigationProp<AuthStackParamList, "Login">;

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigation = useNavigation<LoginNav>();
  const passwordRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    setError("");
    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    setIsSubmitting(true);
    try {
      await login({ email: email.trim().toLowerCase(), password });
    } catch (apiError: unknown) {
      const err = apiError as {
        response?: {
          data?: { error?: { message?: string }; message?: string };
        };
        message?: string;
      };
      setError(
        err.response?.data?.error?.message ??
          err.response?.data?.message ??
          err.message ??
          "Login failed. Please check your credentials."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo / Brand */}
          <View style={styles.brandSection}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>FB</Text>
            </View>
            <Text style={styles.brandName}>FinovaBank</Text>
            <Text style={styles.brandTagline}>
              Your trusted banking partner
            </Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={commonStyles.titleText}>Welcome back</Text>
            <Text style={commonStyles.subtitleText}>
              Sign in to your account
            </Text>

            {error ? (
              <View style={commonStyles.errorContainer}>
                <Text style={commonStyles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Email */}
            <Text style={styles.label}>Email address</Text>
            <TextInput
              style={[
                commonStyles.input,
                emailFocused && commonStyles.inputFocused,
              ]}
              placeholder="you@example.com"
              placeholderTextColor={colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              editable={!isSubmitting}
            />

            {/* Password */}
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordWrap}>
              <TextInput
                ref={passwordRef}
                style={[
                  commonStyles.input,
                  styles.passwordInput,
                  passwordFocused && commonStyles.inputFocused,
                ]}
                placeholder="Enter your password"
                placeholderTextColor={colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                editable={!isSubmitting}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword((v) => !v)}
                activeOpacity={0.7}
              >
                <Text style={styles.eyeIcon}>{showPassword ? "🙈" : "👁️"}</Text>
              </TouchableOpacity>
            </View>

            {/* Forgot password */}
            <TouchableOpacity
              style={styles.forgotWrap}
              onPress={() => navigation.navigate("ForgotPassword")}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Login button */}
            <TouchableOpacity
              style={[commonStyles.button, isSubmitting && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={commonStyles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Register link */}
            <View style={styles.registerRow}>
              <Text style={styles.registerHint}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("Register")}
                activeOpacity={0.7}
              >
                <Text style={styles.registerLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.gradientStart },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    paddingBottom: 40,
  },
  brandSection: { alignItems: "center", marginBottom: 32 },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  logoText: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.white,
    letterSpacing: 1,
  },
  brandName: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.white,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  brandTagline: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "400",
  },
  card: {
    backgroundColor: colors.backgroundWhite,
    borderRadius: 20,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
      },
      android: { elevation: 8 },
    }),
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  passwordWrap: { position: "relative" },
  passwordInput: { paddingRight: 48 },
  eyeBtn: {
    position: "absolute",
    right: 14,
    top: 0,
    height: 52,
    justifyContent: "center",
  },
  eyeIcon: { fontSize: 18 },
  forgotWrap: { alignSelf: "flex-end", marginBottom: 20, marginTop: -6 },
  forgotText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "500",
  },
  btnDisabled: { opacity: 0.6 },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  registerHint: { fontSize: 14, color: colors.textSecondary },
  registerLink: { fontSize: 14, color: colors.primary, fontWeight: "600" },
});

export default LoginScreen;
