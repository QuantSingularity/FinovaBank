import {Dimensions, Platform, StyleSheet} from 'react-native';

const {width, height} = Dimensions.get('window');

export const colors = {
  primary: '#0A7AFF',
  primaryDark: '#0055CC',
  primaryLight: '#E8F0FF',
  secondary: '#34C759',
  secondaryDark: '#248A3D',
  success: '#34C759',
  successLight: '#E6F9ED',
  warning: '#FF9500',
  warningLight: '#FFF4E0',
  error: '#FF3B30',
  errorLight: '#FFE5E5',
  background: '#FFFFFF',
  backgroundSecondary: '#F8F9FE',
  surface: '#F2F2F7',
  surfaceElevated: '#FFFFFF',
  textPrimary: '#1C1C1E',
  textSecondary: '#6E6E73',
  textTertiary: '#C7C7CC',
  border: '#E5E5EA',
  borderLight: '#F0F0F5',
  lightGray: '#F2F2F7',
  white: '#FFFFFF',
  shadow: '#000000',
};

export const shadows = {
  small: Platform.select({
    ios: {
      shadowColor: colors.shadow,
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
    android: {elevation: 2},
  }),
  medium: Platform.select({
    ios: {
      shadowColor: colors.shadow,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.12,
      shadowRadius: 8,
    },
    android: {elevation: 4},
  }),
  large: Platform.select({
    ios: {
      shadowColor: colors.shadow,
      shadowOffset: {width: 0, height: 8},
      shadowOpacity: 0.16,
      shadowRadius: 16,
    },
    android: {elevation: 8},
  }),
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: colors.backgroundSecondary,
  },
  containerWhite: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: colors.background,
  },
  titleText: {
    fontSize: width > 360 ? 28 : 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: width > 360 ? 16 : 14,
    color: colors.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 54,
    flexDirection: 'row',
  },
  buttonSecondary: {
    backgroundColor: colors.primaryLight,
    borderWidth: 0,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  buttonDanger: {
    backgroundColor: colors.error,
  },
  buttonSuccess: {
    backgroundColor: colors.secondary,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  buttonTextSecondary: {
    color: colors.primary,
  },
  buttonTextOutline: {
    color: colors.primary,
  },
  input: {
    height: 54,
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: 12,
    marginBottom: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
    fontSize: 16,
    color: colors.textPrimary,
    width: '100%',
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 1.5,
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {elevation: 3},
    }),
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  errorContainer: {
    backgroundColor: colors.errorLight,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
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
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export const responsiveWidth = (percentage: number) => {
  return (width * percentage) / 100;
};

export const responsiveHeight = (percentage: number) => {
  return (height * percentage) / 100;
};

export const isSmallScreen = width < 375;
export const isMediumScreen = width >= 375 && width < 414;
export const isLargeScreen = width >= 414;
