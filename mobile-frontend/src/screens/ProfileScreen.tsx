import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { changePassword, updateUserProfile } from "../services/api";
import { colors, commonStyles } from "../styles/commonStyles";

type Tab = "profile" | "security" | "about";

const ProfileScreen = () => {
  const { userData, logout, updateUserData } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  // Profile edit
  const [firstName, setFirstName] = useState(userData?.firstName ?? "");
  const [lastName, setLastName] = useState(userData?.lastName ?? "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNew, setConfirmNew] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const handleSaveProfile = async () => {
    setProfileError("");
    setProfileSuccess("");
    if (!firstName.trim() || !lastName.trim()) {
      setProfileError("First and last name are required.");
      return;
    }
    setSavingProfile(true);
    try {
      await updateUserProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      updateUserData({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      setProfileSuccess("Profile updated successfully.");
    } catch (e: unknown) {
      const err = e as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setProfileError(
        err.response?.data?.message ??
          err.message ??
          "Failed to update profile."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");
    if (!currentPassword || !newPassword || !confirmNew) {
      setPasswordError("All password fields are required.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmNew) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordError("New password must be different from current password.");
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setPasswordSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNew("");
    } catch (e: unknown) {
      const err = e as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setPasswordError(
        err.response?.data?.message ??
          err.message ??
          "Failed to change password."
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => logout() },
    ]);
  };

  const avatarInitials = `${userData?.firstName?.[0] ?? ""}${
    userData?.lastName?.[0] ?? ""
  }`.toUpperCase();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* ── Profile header ───────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{avatarInitials || "?"}</Text>
        </View>
        <Text style={styles.userName}>
          {userData?.firstName} {userData?.lastName}
        </Text>
        <Text style={styles.userEmail}>{userData?.email}</Text>
      </View>

      {/* ── Tabs ─────────────────────────────────────────────────── */}
      <View style={styles.tabsRow}>
        {(["profile", "security", "about"] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, activeTab === t && styles.tabActive]}
            onPress={() => setActiveTab(t)}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.tabText, activeTab === t && styles.tabTextActive]}
            >
              {t === "profile"
                ? "👤 Profile"
                : t === "security"
                ? "🔒 Security"
                : "ℹ️ About"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentPad}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Profile tab ───────────────────────────────────────── */}
        {activeTab === "profile" && (
          <View>
            <Text style={commonStyles.sectionTitle}>Personal Information</Text>

            {profileError ? (
              <View style={commonStyles.errorContainer}>
                <Text style={commonStyles.errorText}>{profileError}</Text>
              </View>
            ) : null}
            {profileSuccess ? (
              <View style={styles.successBox}>
                <Text style={styles.successText}>{profileSuccess}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={commonStyles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First name"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="words"
              editable={!savingProfile}
            />

            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={commonStyles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last name"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="words"
              editable={!savingProfile}
            />

            <Text style={styles.label}>Email</Text>
            <View style={[commonStyles.input, styles.disabledInput]}>
              <Text style={styles.disabledText}>{userData?.email}</Text>
            </View>
            <Text style={styles.hint}>Email address cannot be changed.</Text>

            <TouchableOpacity
              style={[commonStyles.button, savingProfile && styles.btnDisabled]}
              onPress={handleSaveProfile}
              disabled={savingProfile}
              activeOpacity={0.85}
            >
              {savingProfile ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={commonStyles.buttonText}>Save Changes</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                commonStyles.button,
                commonStyles.buttonDanger,
                { marginTop: 32 },
              ]}
              onPress={handleLogout}
              activeOpacity={0.85}
            >
              <Text style={commonStyles.buttonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Security tab ─────────────────────────────────────── */}
        {activeTab === "security" && (
          <View>
            <Text style={commonStyles.sectionTitle}>Change Password</Text>

            {passwordError ? (
              <View style={commonStyles.errorContainer}>
                <Text style={commonStyles.errorText}>{passwordError}</Text>
              </View>
            ) : null}
            {passwordSuccess ? (
              <View style={styles.successBox}>
                <Text style={styles.successText}>{passwordSuccess}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>Current Password</Text>
            <View style={styles.passwordWrap}>
              <TextInput
                style={[commonStyles.input, styles.passwordInput]}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Current password"
                placeholderTextColor={colors.textTertiary}
                secureTextEntry={!showCurrent}
                editable={!savingPassword}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowCurrent((v) => !v)}
              >
                <Text style={styles.eyeIcon}>{showCurrent ? "🙈" : "👁️"}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>New Password</Text>
            <View style={styles.passwordWrap}>
              <TextInput
                style={[commonStyles.input, styles.passwordInput]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Min. 8 characters"
                placeholderTextColor={colors.textTertiary}
                secureTextEntry={!showNew}
                editable={!savingPassword}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowNew((v) => !v)}
              >
                <Text style={styles.eyeIcon}>{showNew ? "🙈" : "👁️"}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput
              style={commonStyles.input}
              value={confirmNew}
              onChangeText={setConfirmNew}
              placeholder="Re-enter new password"
              placeholderTextColor={colors.textTertiary}
              secureTextEntry
              editable={!savingPassword}
            />

            <TouchableOpacity
              style={[
                commonStyles.button,
                savingPassword && styles.btnDisabled,
              ]}
              onPress={handleChangePassword}
              disabled={savingPassword}
              activeOpacity={0.85}
            >
              {savingPassword ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={commonStyles.buttonText}>Update Password</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ── About tab ────────────────────────────────────────── */}
        {activeTab === "about" && (
          <View>
            <View style={styles.aboutCard}>
              <View style={styles.aboutLogoRow}>
                <View style={styles.aboutLogo}>
                  <Text style={styles.aboutLogoText}>FB</Text>
                </View>
                <View>
                  <Text style={styles.aboutAppName}>FinovaBank</Text>
                  <Text style={styles.aboutVersion}>Version 1.0.0</Text>
                </View>
              </View>
              <Text style={styles.aboutDesc}>
                FinovaBank is your trusted digital banking partner. Manage your
                accounts, transactions, loans, and savings goals all in one
                place.
              </Text>
            </View>

            {[
              { label: "📄 Privacy Policy", onPress: () => {} },
              { label: "📋 Terms of Service", onPress: () => {} },
              { label: "💬 Contact Support", onPress: () => {} },
              { label: "⭐ Rate the App", onPress: () => {} },
            ].map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.aboutRow}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <Text style={styles.aboutRowText}>{item.label}</Text>
                <Text style={styles.aboutRowArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },

  header: {
    backgroundColor: colors.gradientStart,
    paddingVertical: 28,
    alignItems: "center",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  avatarText: { fontSize: 26, fontWeight: "700", color: colors.white },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 4,
  },
  userEmail: { fontSize: 14, color: "rgba(255,255,255,0.7)" },

  tabsRow: {
    flexDirection: "row",
    backgroundColor: colors.backgroundWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabText: { fontSize: 12, fontWeight: "600", color: colors.textSecondary },
  tabTextActive: { color: colors.primary },

  content: { flex: 1 },
  contentPad: { padding: 20 },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  hint: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: -10,
    marginBottom: 14,
  },

  disabledInput: {
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderColor: colors.borderLight,
  },
  disabledText: { fontSize: 15, color: colors.textSecondary },

  successBox: {
    backgroundColor: colors.successLight,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
  },
  successText: { color: colors.success, fontSize: 13, fontWeight: "500" },

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

  btnDisabled: { opacity: 0.6 },

  aboutCard: {
    ...Platform.select({
      ios: {
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
    backgroundColor: colors.backgroundWhite,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  aboutLogoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 14,
  },
  aboutLogo: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.gradientStart,
    alignItems: "center",
    justifyContent: "center",
  },
  aboutLogoText: { fontSize: 20, fontWeight: "800", color: colors.white },
  aboutAppName: { fontSize: 18, fontWeight: "700", color: colors.textPrimary },
  aboutVersion: { fontSize: 13, color: colors.textSecondary },
  aboutDesc: { fontSize: 14, color: colors.textSecondary, lineHeight: 21 },

  aboutRow: {
    backgroundColor: colors.backgroundWhite,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  aboutRowText: { fontSize: 14, fontWeight: "500", color: colors.textPrimary },
  aboutRowArrow: { fontSize: 18, color: colors.textTertiary },
});

export default ProfileScreen;
