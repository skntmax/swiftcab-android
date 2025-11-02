import Constants from 'expo-constants';

// Environment types
type Environment = 'development' | 'production';

interface EnvironmentConfig {
  API_URL: string;
  CLIENT_PORTAL_URL: string;
  CLIENT_COOKIE_PORTAL: string;
  CLIENT_MEDIUM_URL: string;
  API_ENCRYPT: boolean;
}

// Get environment from Expo config or fallback to development
const environment: Environment = (Constants.expoConfig?.extra?.environment as Environment) || 'development';

// Environment-specific configuration
const config: Record<Environment, EnvironmentConfig> = {
  development: {
    API_URL: 'http://localhost:5000',
    CLIENT_PORTAL_URL: 'http://localhost:3001/callback',
    CLIENT_COOKIE_PORTAL: 'http://localhost:3001',
    CLIENT_MEDIUM_URL: 'http://localhost:7001',
    API_ENCRYPT: false,
  },
  production: {
    API_URL: 'https://swiftcab-api.365itsolution.com',
    CLIENT_PORTAL_URL: 'https://swiftcab-client.365itsolution.com/callback',
    CLIENT_COOKIE_PORTAL: 'https://swiftcab-client.365itsolution.com',
    CLIENT_MEDIUM_URL: 'https://swiftcab-medium.365itsolution.com',
    API_ENCRYPT: true,
  }
};

const currentConfig = config[environment] || config.development;

const temp_env = {
  API_URL: currentConfig.API_URL,
  CLIENT_PORTAL_URL: currentConfig.CLIENT_PORTAL_URL,
  CLIENT_COOKIE_PORTAL: currentConfig.CLIENT_COOKIE_PORTAL,
  CLIENT_MEDIUM_URL: currentConfig.CLIENT_MEDIUM_URL,
  API_ENCRYPT: currentConfig.API_ENCRYPT,
  ENVIRONMENT: environment,
};

console.log(`🚀 Environment: ${environment}`, temp_env);

const all_env = Object.freeze(temp_env);
export { all_env };

