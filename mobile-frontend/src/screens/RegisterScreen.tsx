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

type RegisterNav = NativeStackNavigationProp<AuthStackParamList, "Register">;

const RegisterScreen = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigation = useNavigation<RegisterNav>();

  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const handleRegister = async () => {
    setError("");
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirmPassword,
      });
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
          "Registration failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const Field = ({
    label,
    value,
    onChangeText,
    placeholder,
    inputRef,
    nextRef,
    keyboardType = "default",
    autoCapitalize = "none",
    autoComplete,
    secureTextEntry,
    onToggleSecure,
    returnKeyType = "next",
  }: {
    label: string;
    value: string;
    onChangeText: (v: string) => void;
    placeholder: string;
    inputRef?: React.RefObject<TextInput>;
    nextRef?: React.RefObject<TextInput>;
    keyboardType?: "default" | "email-address";
    autoCapitalize?: "none" | "words";
    autoComplete?: string;
    secureTextEntry?: boolean;
    onToggleSecure?: () => void;
    returnKeyType?: "next" | "done";
  }) => (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={{ position: "relative" }}>
        <TextInput
          ref={inputRef}
          style={[commonStyles.input, onToggleSecure && styles.inputWithEye]}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          autoComplete={autoComplete as any}
          secureTextEntry={secureTextEntry}
          returnKeyType={returnKeyType}
          onSubmitEditing={() => nextRef?.current?.focus()}
          editable={!isSubmitting}
        />
        {onToggleSecure && (
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={onToggleSecure}
            activeOpacity={0.7}
          >
            <Text style={styles.eyeIcon}>{secureTextEntry ? "👁️" : "🙈"}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={commonStyles.titleText}>Create Account</Text>
          <Text style={commonStyles.subtitleText}>
            Join FinovaBank and take control of your finances
          </Text>

          {error ? (
            <View style={commonStyles.errorContainer}>
              <Text style={commonStyles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.nameRow}>
            <View style={styles.nameField}>
              <Field
                label="First Name"
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Jane"
                nextRef={lastNameRef}
                autoCapitalize="words"
                autoComplete="given-name"
              />
            </View>
            <View style={styles.nameField}>
              <Field
                label="Last Name"
                value={lastName}
                onChangeText={setLastName}
                placeholder="Smith"
                inputRef={lastNameRef}
                nextRef={emailRef}
                autoCapitalize="words"
                autoComplete="family-name"
              />
            </View>
          </View>

          <Field
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            inputRef={emailRef}
            nextRef={passwordRef}
            keyboardType="email-address"
            autoComplete="email"
          />

          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Min. 8 characters"
            inputRef={passwordRef}
            nextRef={confirmRef}
            secureTextEntry={!showPass}
            onToggleSecure={() => setShowPass((v) => !v)}
            autoComplete="new-password"
          />

          {/* Password strength hint */}
          {password.length > 0 && (
            <View style={styles.strengthRow}>
              {[6, 8, 12].map((threshold, i) => (
                <View
                  key={i}
                  style={[
                    styles.strengthBar,
                    {
                      backgroundColor:
                        password.length >= threshold
                          ? i === 0
                            ? colors.error
                            : i === 1
                            ? colors.warning
                            : colors.success
                          : colors.border,
                    },
                  ]}
                />
              ))}
              <Text style={styles.strengthLabel}>
                {password.length < 6
                  ? "Weak"
                  : password.length < 12
                  ? "Good"
                  : "Strong"}
              </Text>
            </View>
          )}

          <Field
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter password"
            inputRef={confirmRef}
            secureTextEntry={!showConfirm}
            onToggleSecure={() => setShowConfirm((v) => !v)}
            autoComplete="new-password"
            returnKeyType="done"
          />

          <TouchableOpacity
            style={[commonStyles.button, isSubmitting && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={commonStyles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginHint}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.backgroundWhite },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 40,
  },
  fieldWrap: { marginBottom: 4 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  nameRow: { flexDirection: "row", gap: 12 },
  nameField: { flex: 1 },
  inputWithEye: { paddingRight: 48 },
  eyeBtn: {
    position: "absolute",
    right: 14,
    top: 0,
    height: 52,
    justifyContent: "center",
  },
  eyeIcon: { fontSize: 18 },
  strengthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: -8,
    marginBottom: 14,
  },
  strengthBar: { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: 12, color: colors.textSecondary, minWidth: 44 },
  btnDisabled: { opacity: 0.6 },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  loginHint: { fontSize: 14, color: colors.textSecondary },
  loginLink: { fontSize: 14, color: colors.primary, fontWeight: "600" },
});

export default RegisterScreen;
