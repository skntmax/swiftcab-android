import Singup from '@/components/HomePage/Singup/Singup';
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
      primary: 'tomato',
      secondary: 'yellow',
    },
    fonts: {
      ...DefaultTheme.fonts,
      // Override default fonts with your custom fonts
      default: {
        ...DefaultTheme.fonts.default,
        fontFamily: 'CustomFont-Regular', // Set your default font
      },
      displayLarge: {
        ...DefaultTheme.fonts.displayLarge,
        fontFamily: 'CustomFont-Bold',
      },
      displayMedium: {
        ...DefaultTheme.fonts.displayMedium,
        fontFamily: 'CustomFont-Bold',
      },
      displaySmall: {
        ...DefaultTheme.fonts.displaySmall,
        fontFamily: 'CustomFont-Bold',
      },
      headlineLarge: {
        ...DefaultTheme.fonts.headlineLarge,
        fontFamily: 'CustomFont-Bold',
      },
      headlineMedium: {
        ...DefaultTheme.fonts.headlineMedium,
        fontFamily: 'CustomFont-Bold',
      },
      headlineSmall: {
        ...DefaultTheme.fonts.headlineSmall,
        fontFamily: 'CustomFont-Bold',
      },
      titleLarge: {
        ...DefaultTheme.fonts.titleLarge,
        fontFamily: 'CustomFont-Bold',
      },
      titleMedium: {
        ...DefaultTheme.fonts.titleMedium,
        fontFamily: 'CustomFont-Regular',
      },
      titleSmall: {
        ...DefaultTheme.fonts.titleSmall,
        fontFamily: 'CustomFont-Regular',
      },
      bodyLarge: {
        ...DefaultTheme.fonts.bodyLarge,
        fontFamily: 'CustomFont-Regular',
      },
      bodyMedium: {
        ...DefaultTheme.fonts.bodyMedium,
        fontFamily: 'CustomFont-Regular',
      },
      bodySmall: {
        ...DefaultTheme.fonts.bodySmall,
        fontFamily: 'CustomFont-Regular',
      },
      labelLarge: {
        ...DefaultTheme.fonts.labelLarge,
        fontFamily: 'CustomFont-Regular',
      },
      labelMedium: {
        ...DefaultTheme.fonts.labelMedium,
        fontFamily: 'CustomFont-Regular',
      },
      labelSmall: {
        ...DefaultTheme.fonts.labelSmall,
        fontFamily: 'CustomFont-Regular',
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
        <Singup />
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
        <Singup />
      </PaperProvider>
    </StoreProvider>
  );
}