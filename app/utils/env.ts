import Constants from 'expo-constants';

// Environment types
type Environment = 'development' | 'production';

interface EnvironmentConfig {
  API_URL: string;
  CLIENT_PORTAL_URL: string;
  CLIENT_COOKIE_PORTAL: string;
  CLIENT_MEDIUM_URL: string;
  API_ENCRYPT: boolean;
  OLA_API_URL: string;
  OLA_MAP_KEY: string;
  OLA_CLIENT_ID: string;
  OLA_CLIENT_SECRET?: string;
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
    OLA_API_URL: 'https://api.olamaps.io',
    OLA_MAP_KEY: 'TmEEWGRULBa01UTDqFDzn7plIxDHJqn2QaMWzBoR',
    OLA_CLIENT_ID: '9716cd3b-32e7-426f-95f6-d9a760c454a2',
    OLA_CLIENT_SECRET: 'qGKFdaxVR1UJ1TCCjdpddZ1JhudSoQPq',
  },
  production: {
    API_URL: 'https://swiftcab-api.365itsolution.com',
    CLIENT_PORTAL_URL: 'https://swiftcab-client.365itsolution.com/callback',
    CLIENT_COOKIE_PORTAL: 'https://swiftcab-client.365itsolution.com',
    CLIENT_MEDIUM_URL: 'https://swiftcab-medium.365itsolution.com',
    API_ENCRYPT: true,
    OLA_API_URL: 'https://api.olamaps.io',
    OLA_MAP_KEY: 'TmEEWGRULBa01UTDqFDzn7plIxDHJqn2QaMWzBoR',
    OLA_CLIENT_ID: '9716cd3b-32e7-426f-95f6-d9a760c454a2',
    OLA_CLIENT_SECRET: 'qGKFdaxVR1UJ1TCCjdpddZ1JhudSoQPq',
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
  OLA_API_URL: currentConfig.OLA_API_URL,
  OLA_MAP_KEY: currentConfig.OLA_MAP_KEY,
  OLA_CLIENT_ID: currentConfig.OLA_CLIENT_ID,
  OLA_CLIENT_SECRET: currentConfig.OLA_CLIENT_SECRET,
};

console.log(`🚀 Environment: ${environment}`, temp_env);

const all_env = Object.freeze(temp_env);
export { all_env };

