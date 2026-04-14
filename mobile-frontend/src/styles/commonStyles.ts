import {Dimensions, Platform, StyleSheet} from 'react-native';

const {width, height} = Dimensions.get('window');

export const colors = {
  primary: '#2563eb',
  primaryDark: '#1d4ed8',
  primaryLight: '#eff6ff',
  secondary: '#7c3aed',
  secondaryLight: '#f5f3ff',
  success: '#059669',
  successLight: '#ecfdf5',
  warning: '#d97706',
  warningLight: '#fffbeb',
  error: '#dc2626',
  errorLight: '#fef2f2',
  info: '#0284c7',
  infoLight: '#e0f2fe',
  background: '#f8fafc',
  backgroundWhite: '#ffffff',
  surface: '#f1f5f9',
  surfaceElevated: '#ffffff',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  textPrimary: '#0f172a',
  textSecondary: '#64748b',
  textTertiary: '#94a3b8',
  textDisabled: '#cbd5e1',
  white: '#ffffff',
  shadow: '#0f172a',
  gradientStart: '#1e3a8a',
  gradientEnd: '#7c3aed',
  // keep legacy aliases so unchanged screens compile
  backgroundSecondary: '#f8fafc',
  lightGray: '#f1f5f9',
};

export const shadows = {
  small: Platform.select({
    ios: {
      shadowColor: '#0f172a',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.06,
      shadowRadius: 4,
    },
    android: {elevation: 2},
  }),
  medium: Platform.select({
    ios: {
      shadowColor: '#0f172a',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.08,
      shadowRadius: 12,
    },
    android: {elevation: 4},
  }),
  large: Platform.select({
    ios: {
      shadowColor: '#0f172a',
      shadowOffset: {width: 0, height: 8},
      shadowOpacity: 0.12,
      shadowRadius: 20,
    },
    android: {elevation: 8},
  }),
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#f8fafc',
  },
  containerWhite: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#ffffff',
  },
  titleText: {
    fontSize: width > 360 ? 26 : 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 24,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 52,
    flexDirection: 'row',
  },
  buttonSecondary: {backgroundColor: '#eff6ff'},
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  buttonDanger: {backgroundColor: '#dc2626'},
  buttonSuccess: {backgroundColor: '#059669'},
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  buttonTextSecondary: {color: '#2563eb'},
  buttonTextOutline: {color: '#64748b'},
  input: {
    height: 52,
    borderColor: '#e2e8f0',
    borderWidth: 1.5,
    borderRadius: 10,
    marginBottom: 14,
    paddingHorizontal: 14,
    backgroundColor: '#ffffff',
    fontSize: 15,
    color: '#0f172a',
    width: '100%',
  },
  inputFocused: {borderColor: '#2563eb', borderWidth: 2},
  inputError: {borderColor: '#dc2626', borderWidth: 1.5},
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {elevation: 2},
    }),
  },
  errorText: {color: '#dc2626', fontSize: 13, marginBottom: 10, lineHeight: 18},
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#dc2626',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeText: {fontSize: 12, fontWeight: '600'},
  divider: {height: 1, backgroundColor: '#e2e8f0', marginVertical: 8},
  row: {flexDirection: 'row', alignItems: 'center'},
  spaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 14,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 21,
  },
});

export const responsiveWidth = (p: number) => (width * p) / 100;
export const responsiveHeight = (p: number) => (height * p) / 100;
export const isSmallScreen = width < 375;
export const isMediumScreen = width >= 375 && width < 414;
export const isLargeScreen = width >= 414;
