/**
 * App Configuration — Expo edition
 * Uses EXPO_PUBLIC_ prefix so values are inlined at build time.
 * Set these in your .env file (copy from .env.example).
 */

interface AppConfig {
  API_BASE_URL: string;
  API_TIMEOUT: number;
  ENABLE_LOGGING: boolean;
}

const Config: AppConfig = {
  API_BASE_URL:
    process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1",
  API_TIMEOUT: Number(process.env.EXPO_PUBLIC_API_TIMEOUT ?? 30000),
  // Log in dev builds only
  ENABLE_LOGGING: __DEV__,
};

export default Config;
