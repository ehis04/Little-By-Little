export type AppEnv = 'local' | 'staging' | 'production';

function parseEnv(value: string | undefined): AppEnv {
  return value === 'staging' || value === 'production' ? value : 'local';
}

// EXPO_PUBLIC_* values are inlined at build time, so they must be read as literal property accesses.
export const env = {
  appEnv: parseEnv(process.env.EXPO_PUBLIC_APP_ENV),
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000',
  sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? '',
} as const;
