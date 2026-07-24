import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AppColors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack
        screenOptions={{
          headerShown: false,
          headerStyle: { backgroundColor: AppColors.background },
          headerTintColor: AppColors.primary,
          headerTitleStyle: { color: AppColors.text, fontWeight: '800' },
          headerShadowVisible: false,
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="circles/index" options={{ title: 'My Circles' }} />
        <Stack.Screen name="circle/[id]" options={{ headerShown: true, title: 'Circle' }} />
      </Stack>
    </ThemeProvider>
  );
}
