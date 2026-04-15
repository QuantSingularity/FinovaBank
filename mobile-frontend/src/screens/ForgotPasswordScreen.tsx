import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { resetPassword } from "../services/api";
import { colors, commonStyles } from "../styles/commonStyles";

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    setIsSubmitting(true);
    try {
      await resetPassword(email.trim().toLowerCase());
      setSuccess(true);
    } catch (e: unknown) {
      const err = e as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      // Show a generic message to avoid user enumeration
      setSuccess(true); // Still show success to prevent email enumeration
      console.warn("[ForgotPassword]", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.successContainer}>
          <Text style={styles.successEmoji}>📬</Text>
          <Text style={styles.successTitle}>Check your inbox</Text>
          <Text style={styles.successBody}>
            If an account exists for{" "}
            <Text style={styles.emailHighlight}>{email}</Text>, you'll receive a
            password reset link shortly.
          </Text>
          <TouchableOpacity
            style={[commonStyles.button, { marginTop: 32 }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <Text style={commonStyles.buttonText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.container}>
          <Text style={styles.icon}>🔑</Text>
          <Text style={commonStyles.titleText}>Reset Password</Text>
          <Text style={commonStyles.subtitleText}>
            Enter your email address and we'll send you a link to reset your
            password.
          </Text>

          {error ? (
            <View style={commonStyles.errorContainer}>
              <Text style={commonStyles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={[commonStyles.input, focused && commonStyles.inputFocused]}
            placeholder="you@example.com"
            placeholderTextColor={colors.textTertiary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            returnKeyType="send"
            onSubmitEditing={handleSubmit}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            editable={!isSubmitting}
          />

          <TouchableOpacity
            style={[commonStyles.button, isSubmitting && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={commonStyles.buttonText}>Send Reset Link</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backText}>← Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.backgroundWhite },
  flex: { flex: 1 },
  container: { flex: 1, padding: 24, paddingTop: 32 },
  icon: { fontSize: 40, marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  btnDisabled: { opacity: 0.6 },
  backBtn: { alignSelf: "center", marginTop: 20 },
  backText: { fontSize: 14, color: colors.primary, fontWeight: "500" },

  // Success state
  successContainer: {
    flex: 1,
    padding: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  successEmoji: { fontSize: 60, marginBottom: 20 },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  successBody: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  emailHighlight: { color: colors.primary, fontWeight: "600" },
});

export default ForgotPasswordScreen;
