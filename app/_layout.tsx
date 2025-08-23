import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import {
  MD3LightTheme as DefaultReactNativePaperTheme,
  PaperProvider,
} from 'react-native-paper'
import 'react-native-reanimated'

import { useColorScheme } from '@/hooks/useColorScheme'
import { SafeAreaProvider } from 'react-native-safe-area-context'

const theme = {
  ...DefaultReactNativePaperTheme,
  colors: {
    ...DefaultReactNativePaperTheme.colors,
    // Primary colors
    primary: '#183A7C',
    onPrimary: '#FFFFFF',
    primaryContainer: '#D6E3FF',
    onPrimaryContainer: '#0C1D3E',

    // Secondary colors
    secondary: '#2E9AB6',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#B8E6F0',
    onSecondaryContainer: '#0A4A57',

    // Tertiary colors
    tertiary: '#00A69C',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#B3F0ED',
    onTertiaryContainer: '#004D4A',

    // Surface colors
    surface: '#FFFFFF',
    onSurface: '#1C1B1F',
    surfaceVariant: '#F4F4F4',
    onSurfaceVariant: '#49454F',

    // Outline colors
    outline: '#79747E',
    outlineVariant: '#CAC4D0',

    // Background colors
    background: '#FFFBFE',
    onBackground: '#1C1B1F',

    // Inverse colors
    inverseSurface: '#313033',
    inverseOnSurface: '#F4EFF4',
    inversePrimary: '#8BB5FF',

    // Error colors (keep default)
    error: '#BA1A1A',
    onError: '#FFFFFF',
    errorContainer: '#FFDAD6',
    onErrorContainer: '#410002',

    // Shadow and scrim
    shadow: '#000000',
    scrim: '#000000',
  },
  fonts: {
    ...DefaultReactNativePaperTheme.fonts,
    default: {
      fontFamily: 'Prompt-Regular',
    },
    displayLarge: {
      fontFamily: 'Prompt-Bold',
      fontSize: 57,
      fontWeight: '400' as const,
      letterSpacing: 0,
      lineHeight: 64,
    },
    displayMedium: {
      fontFamily: 'Prompt-SemiBold',
      fontSize: 45,
      fontWeight: '400' as const,
      letterSpacing: 0,
      lineHeight: 52,
    },
    displaySmall: {
      fontFamily: 'Prompt-Medium',
      fontSize: 36,
      fontWeight: '400' as const,
      letterSpacing: 0,
      lineHeight: 44,
    },
    headlineLarge: {
      fontFamily: 'Prompt-SemiBold',
      fontSize: 32,
      fontWeight: '400' as const,
      letterSpacing: 0,
      lineHeight: 40,
    },
    headlineMedium: {
      fontFamily: 'Prompt-Medium',
      fontSize: 28,
      fontWeight: '400' as const,
      letterSpacing: 0,
      lineHeight: 36,
    },
    headlineSmall: {
      fontFamily: 'Prompt-Medium',
      fontSize: 24,
      fontWeight: '400' as const,
      letterSpacing: 0,
      lineHeight: 32,
    },
    titleLarge: {
      fontFamily: 'Prompt-Medium',
      fontSize: 22,
      fontWeight: '400' as const,
      letterSpacing: 0,
      lineHeight: 28,
    },
    titleMedium: {
      fontFamily: 'Prompt-Medium',
      fontSize: 16,
      fontWeight: '500' as const,
      letterSpacing: 0.15,
      lineHeight: 24,
    },
    titleSmall: {
      fontFamily: 'Prompt-Medium',
      fontSize: 14,
      fontWeight: '500' as const,
      letterSpacing: 0.1,
      lineHeight: 20,
    },
    bodyLarge: {
      fontFamily: 'Prompt-Regular',
      fontSize: 16,
      fontWeight: '400' as const,
      letterSpacing: 0.15,
      lineHeight: 24,
    },
    bodyMedium: {
      fontFamily: 'Prompt-Regular',
      fontSize: 14,
      fontWeight: '400' as const,
      letterSpacing: 0.25,
      lineHeight: 20,
    },
    bodySmall: {
      fontFamily: 'Prompt-Regular',
      fontSize: 12,
      fontWeight: '400' as const,
      letterSpacing: 0.4,
      lineHeight: 16,
    },
    labelLarge: {
      fontFamily: 'Prompt-Medium',
      fontSize: 14,
      fontWeight: '500' as const,
      letterSpacing: 0.1,
      lineHeight: 20,
    },
    labelMedium: {
      fontFamily: 'Prompt-Medium',
      fontSize: 12,
      fontWeight: '500' as const,
      letterSpacing: 0.5,
      lineHeight: 16,
    },
    labelSmall: {
      fontFamily: 'Prompt-Medium',
      fontSize: 11,
      fontWeight: '500' as const,
      letterSpacing: 0.5,
      lineHeight: 16,
    },
  },
}

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const [loaded] = useFonts({
    'Prompt-Black': require('../assets/fonts/Prompt-Black.ttf'),
    'Prompt-BlackItalic': require('../assets/fonts/Prompt-BlackItalic.ttf'),
    'Prompt-Bold': require('../assets/fonts/Prompt-Bold.ttf'),
    'Prompt-BoldItalic': require('../assets/fonts/Prompt-BoldItalic.ttf'),
    'Prompt-ExtraBold': require('../assets/fonts/Prompt-ExtraBold.ttf'),
    'Prompt-ExtraBoldItalic': require('../assets/fonts/Prompt-ExtraBoldItalic.ttf'),
    'Prompt-ExtraLight': require('../assets/fonts/Prompt-ExtraLight.ttf'),
    'Prompt-ExtraLightItalic': require('../assets/fonts/Prompt-ExtraLightItalic.ttf'),
    'Prompt-Italic': require('../assets/fonts/Prompt-Italic.ttf'),
    'Prompt-Light': require('../assets/fonts/Prompt-Light.ttf'),
    'Prompt-LightItalic': require('../assets/fonts/Prompt-LightItalic.ttf'),
    'Prompt-Medium': require('../assets/fonts/Prompt-Medium.ttf'),
    'Prompt-MediumItalic': require('../assets/fonts/Prompt-MediumItalic.ttf'),
    'Prompt-Regular': require('../assets/fonts/Prompt-Regular.ttf'),
    'Prompt-SemiBold': require('../assets/fonts/Prompt-SemiBold.ttf'),
    'Prompt-SemiBoldItalic': require('../assets/fonts/Prompt-SemiBoldItalic.ttf'),
    'Prompt-Thin': require('../assets/fonts/Prompt-Thin.ttf'),
    'Prompt-ThinItalic': require('../assets/fonts/Prompt-ThinItalic.ttf'),
  })

  if (!loaded) {
    // Async font loading only occurs in development.
    return null
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <ThemeProvider
          value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
            <Stack.Screen name='courses' options={{ headerShown: false }} />
            <Stack.Screen name='curriculums' options={{ headerShown: false }} />
            <Stack.Screen
              name='curriculum-detail'
              options={{ headerShown: false }}
            />
            <Stack.Screen name='+not-found' />
          </Stack>
          <StatusBar style='dark' backgroundColor='transparent' translucent />
        </ThemeProvider>
      </PaperProvider>
    </SafeAreaProvider>
  )
}
