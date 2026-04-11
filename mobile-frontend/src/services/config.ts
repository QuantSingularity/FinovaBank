/**
 * App Configuration
 * This file contains environment-specific configuration for the mobile app
 */

declare const __DEV__: boolean;

interface AppConfig {
  API_BASE_URL: string;
  API_TIMEOUT: number;
  ENABLE_LOGGING: boolean;
}

const devConfig: AppConfig = {
  API_BASE_URL: 'http://localhost:8080/api/v1',
  API_TIMEOUT: 30000,
  ENABLE_LOGGING: true,
};

const prodConfig: AppConfig = {
  API_BASE_URL: 'https://api.finovabank.com/api/v1',
  API_TIMEOUT: 30000,
  ENABLE_LOGGING: false,
};

const Config: AppConfig = __DEV__ ? devConfig : prodConfig;

export default Config;
