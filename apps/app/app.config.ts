import type { ExpoConfig } from 'expo/config';

const APP_ENV = process.env.EXPO_PUBLIC_APP_ENV ?? 'local';

const config: ExpoConfig = {
  name: 'Little by Little',
  slug: 'little-by-little',
  scheme: 'lbl',
  version: '0.1.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  platforms: ['ios', 'android', 'web'],
  ios: {
    // ASSUMPTION: placeholder identifiers until the Apple and Google accounts exist (P-2).
    bundleIdentifier: 'ie.littlebylittle.app',
    supportsTablet: true,
  },
  android: {
    package: 'ie.littlebylittle.app',
  },
  web: {
    bundler: 'metro',
    output: 'static',
  },
  plugins: ['expo-router', 'expo-font'],
  experiments: { typedRoutes: true },
  extra: { appEnv: APP_ENV },
};

export default config;
