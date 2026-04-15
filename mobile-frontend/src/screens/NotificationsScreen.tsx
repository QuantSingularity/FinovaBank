import React, { useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, commonStyles } from "../styles/commonStyles";

interface Notification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  type: "transaction" | "security" | "promotion" | "info";
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Transaction Alert",
    body: "A debit of $49.99 was processed at Netflix.",
    timestamp: "2 min ago",
    type: "transaction",
    read: false,
  },
  {
    id: "2",
    title: "Savings Goal Update",
    body: "You're 75% of the way to your Dream Vacation goal!",
    timestamp: "1 hour ago",
    type: "info",
    read: false,
  },
  {
    id: "3",
    title: "Security Alert",
    body: "New login detected from iOS device in Karachi, PK.",
    timestamp: "3 hours ago",
    type: "security",
    read: true,
  },
  {
    id: "4",
    title: "Loan Update",
    body: "Your loan application is under review. We'll notify you within 2 business days.",
    timestamp: "Yesterday",
    type: "info",
    read: true,
  },
  {
    id: "5",
    title: "Special Offer",
    body: "Apply for a home loan this month and get 0.5% off your rate.",
    timestamp: "2 days ago",
    type: "promotion",
    read: true,
  },
];

const typeConfig = (type: Notification["type"]) => {
  switch (type) {
    case "transaction":
      return { icon: "💳", color: colors.primary, bg: colors.primaryLight };
    case "security":
      return { icon: "🔒", color: colors.error, bg: colors.errorLight };
    case "promotion":
      return { icon: "🎁", color: colors.secondary, bg: colors.secondaryLight };
    default:
      return { icon: "ℹ️", color: colors.info, bg: colors.infoLight };
  }
};

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((ns) =>
      ns.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      {/* Header action row */}
      {unreadCount > 0 && (
        <View style={styles.topRow}>
          <Text style={styles.unreadBadge}>{unreadCount} unread</Text>
          <TouchableOpacity onPress={markAllRead} activeOpacity={0.7}>
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(n) => n.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={commonStyles.emptyStateContainer}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🔔</Text>
            <Text style={commonStyles.emptyStateTitle}>No notifications</Text>
            <Text style={commonStyles.emptyStateSubtitle}>
              You're all caught up! Notifications will appear here.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const tc = typeConfig(item.type);
          return (
            <TouchableOpacity
              style={[styles.notifCard, !item.read && styles.notifCardUnread]}
              onPress={() => markRead(item.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.iconBox, { backgroundColor: tc.bg }]}>
                <Text style={styles.iconText}>{tc.icon}</Text>
              </View>
              <View style={styles.notifBody}>
                <View style={styles.notifTopRow}>
                  <Text
                    style={[
                      styles.notifTitle,
                      !item.read && styles.notifTitleUnread,
                    ]}
                  >
                    {item.title}
                  </Text>
                  {!item.read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notifText}>{item.body}</Text>
                <Text style={styles.notifTime}>{item.timestamp}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.backgroundWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  unreadBadge: { fontSize: 13, color: colors.textSecondary, fontWeight: "500" },
  markAllText: { fontSize: 13, color: colors.primary, fontWeight: "600" },
  listContent: { padding: 16, flexGrow: 1 },
  notifCard: {
    backgroundColor: colors.backgroundWhite,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
    }),
  },
  notifCardUnread: { borderColor: colors.primary, borderWidth: 1.5 },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  iconText: { fontSize: 20 },
  notifBody: { flex: 1 },
  notifTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    flex: 1,
  },
  notifTitleUnread: { color: colors.primary },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: 6,
  },
  notifText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  notifTime: { fontSize: 11, color: colors.textTertiary, fontWeight: "500" },
});

export default NotificationsScreen;
