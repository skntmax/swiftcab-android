import OnboardingFlowScreen from '@/components/onboarding/OnboardingFlowScreen';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';
import {
  MD3LightTheme as DefaultTheme,
  PaperProvider,
} from 'react-native-paper';
import 'react-native-reanimated';
import { Provider as StoreProvider } from 'react-redux';
import { store } from './lib/store';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // Add your custom fonts here
    'Montserrat-Regular': require('../assets/fonts/Montserrat-VariableFont_wght.ttf'),
  });

  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: '#ED8902',
      secondary: '#111111',
      background: '#FFF8DC',
      surface: '#FFFFFF',
      onPrimary: '#FFFFFF',
      onSurface: '#111111',
    },
    fonts: {
      ...DefaultTheme.fonts,
      // Override default fonts with your custom fonts
      default: {
        ...DefaultTheme.fonts.default,
        fontFamily: 'Montserrat-Regular',
      },
      displayLarge: {
        ...DefaultTheme.fonts.displayLarge,
        fontFamily: 'Montserrat-Regular',
      },
      displayMedium: {
        ...DefaultTheme.fonts.displayMedium,
        fontFamily: 'Montserrat-Regular',
      },
      displaySmall: {
        ...DefaultTheme.fonts.displaySmall,
        fontFamily: 'Montserrat-Regular',
      },
      headlineLarge: {
        ...DefaultTheme.fonts.headlineLarge,
        fontFamily: 'Montserrat-Regular',
      },
      headlineMedium: {
        ...DefaultTheme.fonts.headlineMedium,
        fontFamily: 'Montserrat-Regular',
      },
      headlineSmall: {
        ...DefaultTheme.fonts.headlineSmall,
        fontFamily: 'Montserrat-Regular',
      },
      titleLarge: {
        ...DefaultTheme.fonts.titleLarge,
        fontFamily: 'Montserrat-Regular',
      },
      titleMedium: {
        ...DefaultTheme.fonts.titleMedium,
        fontFamily: 'Montserrat-Regular',
      },
      titleSmall: {
        ...DefaultTheme.fonts.titleSmall,
        fontFamily: 'Montserrat-Regular',
      },
      bodyLarge: {
        ...DefaultTheme.fonts.bodyLarge,
        fontFamily: 'Montserrat-Regular',
      },
      bodyMedium: {
        ...DefaultTheme.fonts.bodyMedium,
        fontFamily: 'Montserrat-Regular',
      },
      bodySmall: {
        ...DefaultTheme.fonts.bodySmall,
        fontFamily: 'Montserrat-Regular',
      },
      labelLarge: {
        ...DefaultTheme.fonts.labelLarge,
        fontFamily: 'Montserrat-Regular',
      },
      labelMedium: {
        ...DefaultTheme.fonts.labelMedium,
        fontFamily: 'Montserrat-Regular',
      },
      labelSmall: {
        ...DefaultTheme.fonts.labelSmall,
        fontFamily: 'Montserrat-Regular',
      },
    },
  };

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // Show nothing until fonts are loaded
  if (!loaded && !error) {
    return null;
  }

  // Optional: Show error message if fonts failed to load
  if (error) {
    console.warn('Font loading error:', error);
    // You can still continue with default fonts
  }

  return (
    <StoreProvider store={store}>
      <PaperProvider theme={theme}>
        <OnboardingFlowScreen />
      </PaperProvider>
    </StoreProvider>
  );
}

// Alternative approach: If you want to show a loading screen while fonts load
export function RootLayoutWithLoadingScreen() {
  const [loaded, error] = useFonts({
     'Montserrat-Regular': require('../assets/fonts/Montserrat-VariableFont_wght.ttf'),
  });

  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: 'tomato',
      secondary: 'yellow',
    },
    fonts: {
      ...DefaultTheme.fonts,
      default: {
        ...DefaultTheme.fonts.default,
        fontFamily: 'CustomFont-Regular',
      },
    },
  };

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        {/* You can add a custom loading component here */}
      </View>
    );
  }

  return (
    <StoreProvider store={store}>
      <PaperProvider theme={theme}>
        <OnboardingFlowScreen />
      </PaperProvider>
    </StoreProvider>
  );
}