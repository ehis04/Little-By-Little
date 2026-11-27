import { monitoringEnabled } from '../monitoring';

jest.mock('@sentry/react-native', () => ({ init: jest.fn() }));

describe('monitoringEnabled', () => {
  it('is off locally even with a DSN', () => {
    expect(monitoringEnabled({ appEnv: 'local', sentryDsn: 'https://example.invalid/1' })).toBe(false);
  });
  it('is off without a DSN', () => {
    expect(monitoringEnabled({ appEnv: 'production', sentryDsn: '' })).toBe(false);
  });
  it('is on in staging and production with a DSN', () => {
    expect(monitoringEnabled({ appEnv: 'staging', sentryDsn: 'https://example.invalid/1' })).toBe(true);
    expect(monitoringEnabled({ appEnv: 'production', sentryDsn: 'https://example.invalid/1' })).toBe(true);
  });
});
