import {Dimensions, StyleSheet} from 'react-native';

const {width, height} = Dimensions.get('window');

// Define modern color palette
export const colors = {
  primary: '#0A7AFF', // Modern Blue
  secondary: '#34C759', // Green
  success: '#34C759', // Green (for success states)
  warning: '#FF9500', // Orange (for warning states)
  error: '#FF3B30', // Red
  errorLight: '#FFE5E5', // Light Red background
  background: '#FFFFFF', // White
  surface: '#F2F2F7', // Light Gray for cards/surfaces
  textPrimary: '#1C1C1E', // Dark Gray
  textSecondary: '#8E8E93', // Medium Gray
  textTertiary: '#C7C7CC', // Light Gray
  border: '#E5E5EA', // Subtle Gray
  lightGray: '#F2F2F7', // Same as surface, for consistency
};

// Define common styles and responsive utilities
export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20, // Increased padding
    backgroundColor: colors.background,
  },
  titleText: {
    fontSize: width > 360 ? 28 : 24, // Slightly larger font size
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 24, // Increased margin
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: width > 360 ? 18 : 16,
    color: colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14, // Increased padding
    paddingHorizontal: 24,
    borderRadius: 12, // More rounded corners
    alignItems: 'center',
    marginTop: 16,
    minWidth: '80%', // Ensure buttons have a good width
    alignSelf: 'center',
  },
  buttonSecondary: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  buttonText: {
    color: colors.background, // White text for primary button
    fontSize: 17,
    fontWeight: '600', // Semibold
  },
  buttonTextSecondary: {
    color: colors.primary, // Primary color text for secondary button
  },
  input: {
    height: 50, // Increased height
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 16,
    paddingHorizontal: 15,
    backgroundColor: colors.surface, // Light background for input
    fontSize: 16,
    color: colors.textPrimary,
    width: '100%', // Use full width within padding
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2, // For Android shadow
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  // Add more common styles as needed
});

// Utility function for responsive sizing (example)
export const responsiveWidth = (percentage: number) => {
  return (width * percentage) / 100;
};

export const responsiveHeight = (percentage: number) => {
  return (height * percentage) / 100;
};
