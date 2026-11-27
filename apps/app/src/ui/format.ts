// Pure formatters for Money and Duration (docs/02 section 6, section 7). Money is integer cents,
// time is integer seconds (CLAUDE.md quality bar). Unknown data is unknown, never zero.
import { copy } from '@/copy/en-IE';

const euro = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' });
const euroSigned = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  signDisplay: 'exceptZero',
});

export const UNKNOWN = '—';

function assertInteger(value: number, what: string): void {
  if (!Number.isInteger(value)) throw new Error(`${what} must be an integer, got ${value}`);
}

export function formatMoney(cents: number, options: { signed?: boolean } = {}): string {
  assertInteger(cents, 'cents');
  return (options.signed ? euroSigned : euro).format(cents / 100);
}

const ONES = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven',
  'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen',
];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

export function numberToWords(n: number): string {
  assertInteger(n, 'number');
  if (n < 0) return `minus ${numberToWords(-n)}`;
  if (n < 20) return ONES[n] as string;
  if (n < 100) {
    const rest = n % 10;
    return `${TENS[Math.floor(n / 10)]}${rest ? `-${ONES[rest]}` : ''}`;
  }
  if (n < 1000) {
    const rest = n % 100;
    return `${ONES[Math.floor(n / 100)]} hundred${rest ? ` and ${numberToWords(rest)}` : ''}`;
  }
  if (n < 1_000_000) {
    const rest = n % 1000;
    return `${numberToWords(Math.floor(n / 1000))} thousand${rest ? ` ${numberToWords(rest)}` : ''}`;
  }
  return String(n);
}

/** "four euro twenty", "twenty cent", "minus one euro fifty". Screen readers get words, not symbols. */
export function moneyToWords(cents: number, options: { signed?: boolean } = {}): string {
  assertInteger(cents, 'cents');
  const abs = Math.abs(cents);
  const euros = Math.floor(abs / 100);
  const rest = abs % 100;
  let words: string;
  if (euros > 0 && rest > 0) words = `${numberToWords(euros)} euro ${numberToWords(rest)}`;
  else if (euros > 0) words = `${numberToWords(euros)} euro`;
  else if (rest > 0) words = `${numberToWords(rest)} cent`;
  else words = 'zero euro';
  if (cents < 0) return `minus ${words}`;
  if (options.signed && cents > 0) return `plus ${words}`;
  return words;
}

function minutesFromSeconds(seconds: number): number {
  assertInteger(seconds, 'seconds');
  if (seconds < 0) throw new Error('seconds must not be negative');
  const minutes = Math.round(seconds / 60);
  return seconds > 0 ? Math.max(1, minutes) : minutes;
}

/** "55 min", "1 h 10 min", "2 h". Rounded to the nearest minute, never below 1 min for a non-zero time. */
export function formatDuration(seconds: number): string {
  const minutes = minutesFromSeconds(seconds);
  const { min, hour } = copy.ui.duration;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} ${min}`;
  return m === 0 ? `${h} ${hour}` : `${h} ${hour} ${m} ${min}`;
}

/** "55 minutes", "1 hour 10 minutes". */
export function durationToWords(seconds: number): string {
  const minutes = minutesFromSeconds(seconds);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h} ${h === 1 ? 'hour' : 'hours'}`);
  if (m > 0 || h === 0) parts.push(`${m} ${m === 1 ? 'minute' : 'minutes'}`);
  return parts.join(' ');
}
