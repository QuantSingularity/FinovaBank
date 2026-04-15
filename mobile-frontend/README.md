# FinovaBank Mobile — Expo Edition

A full-featured mobile banking frontend built with **Expo SDK 52** and React Native.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode (macOS only) or Expo Go app
- Android: Android Studio or Expo Go app

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment config
cp .env.example .env
# Edit .env with your API URL

# 3. Start dev server
npx expo start

# 4. Open in simulator or Expo Go
# Press 'i' for iOS, 'a' for Android, 'w' for web
```

---

## 📱 Screens

| Screen                  | Description                                                 |
| ----------------------- | ----------------------------------------------------------- |
| **Login**               | Email/password auth with forgot password link               |
| **Register**            | Account creation with password strength indicator           |
| **Forgot Password**     | Email-based password reset                                  |
| **Dashboard**           | Balance overview, accounts, stat cards, transfer CTA        |
| **Transactions**        | Filterable transaction list with pull-to-refresh            |
| **Transaction Details** | Full transaction breakdown                                  |
| **Transaction Filters** | Date range + type filter (modal)                            |
| **Loans**               | Active loans + loan application form with payment estimator |
| **Savings Goals**       | Goal tracking + contributions + progress bars               |
| **Account Details**     | Full account info with balance hero                         |
| **Transfer**            | Send money — internal, external, or bill pay                |
| **Notifications**       | In-app notification feed                                    |
| **Profile**             | Edit name, change password, app info                        |

---

## 🏗 Architecture

```
src/
├── context/
│   └── AuthContext.tsx        # Auth state (SecureStore-backed)
├── navigation/
│   └── AppNavigator.tsx       # Stack + Bottom Tab navigator
├── screens/                   # 13 screens
├── services/
│   ├── api.ts                 # Axios client + all API calls
│   ├── config.ts              # EXPO_PUBLIC_ env vars
│   └── FilterStore.ts         # Callback bridge (fixes RN nav limitation)
└── styles/
    └── commonStyles.ts        # Design tokens + shared styles
```

---

## 🔧 Environment Variables

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
EXPO_PUBLIC_API_TIMEOUT=30000
```

All variables must use the `EXPO_PUBLIC_` prefix to be inlined at build time.

---

## 📦 Key Dependencies

| Package                          | Purpose                               |
| -------------------------------- | ------------------------------------- |
| `expo` ~52                       | Build toolchain                       |
| `expo-secure-store`              | Encrypted token storage (OS keychain) |
| `expo-status-bar`                | StatusBar cross-platform              |
| `@react-navigation/native`       | Navigation container                  |
| `@react-navigation/native-stack` | Stack navigator                       |
| `@react-navigation/bottom-tabs`  | Tab bar                               |
| `axios`                          | HTTP client                           |
| `react-native-safe-area-context` | Notch-safe layout                     |
