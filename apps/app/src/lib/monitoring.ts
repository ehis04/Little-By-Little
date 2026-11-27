import * as Sentry from '@sentry/react-native';

import { env } from './env';

/** Sentry runs only when a DSN is set and the app is not running locally. */
export function monitoringEnabled(config: Pick<typeof env, 'appEnv' | 'sentryDsn'> = env): boolean {
  return config.sentryDsn !== '' && config.appEnv !== 'local';
}

export function initMonitoring(): void {
  if (!monitoringEnabled()) return;
  Sentry.init({
    dsn: env.sentryDsn,
    environment: env.appEnv,
    // No personal data: no default PII, no session replay.
    sendDefaultPii: false,
    tracesSampleRate: 0,
  });
}
