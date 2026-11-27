import { durationToWords, formatDuration, formatMoney, moneyToWords, numberToWords } from '../format';

describe('formatMoney', () => {
  it('formats integer cents as euro', () => {
    expect(formatMoney(420)).toBe('€4.20');
    expect(formatMoney(0)).toBe('€0.00');
    expect(formatMoney(5)).toBe('€0.05');
    expect(formatMoney(1234567)).toBe('€12,345.67');
  });

  it('formats negatives and optional signs', () => {
    expect(formatMoney(-150)).toBe('-€1.50');
    expect(formatMoney(250, { signed: true })).toBe('+€2.50');
    expect(formatMoney(0, { signed: true })).toBe('€0.00');
  });

  it('rejects fractional cents', () => {
    expect(() => formatMoney(4.2)).toThrow();
  });
});

describe('moneyToWords', () => {
  it.each([
    [420, 'four euro twenty'],
    [400, 'four euro'],
    [20, 'twenty cent'],
    [1, 'one cent'],
    [0, 'zero euro'],
    [189, 'one euro eighty-nine'],
    [-150, 'minus one euro fifty'],
    [12345, 'one hundred and twenty-three euro forty-five'],
  ])('%i cents is "%s"', (cents, words) => {
    expect(moneyToWords(cents)).toBe(words);
  });

  it('announces the sign when asked', () => {
    expect(moneyToWords(250, { signed: true })).toBe('plus two euro fifty');
  });

  it('spells thousands', () => {
    expect(numberToWords(2500)).toBe('two thousand five hundred');
  });
});

describe('formatDuration', () => {
  it.each([
    [55 * 60, '55 min'],
    [70 * 60, '1 h 10 min'],
    [2 * 3600, '2 h'],
    [0, '0 min'],
    [20, '1 min'],
    [89, '1 min'],
    [90, '2 min'],
  ])('%i seconds is "%s"', (seconds, text) => {
    expect(formatDuration(seconds)).toBe(text);
  });

  it('spells durations for screen readers', () => {
    expect(durationToWords(55 * 60)).toBe('55 minutes');
    expect(durationToWords(70 * 60)).toBe('1 hour 10 minutes');
    expect(durationToWords(3600)).toBe('1 hour');
    expect(durationToWords(60)).toBe('1 minute');
  });

  it('rejects negative or fractional seconds', () => {
    expect(() => formatDuration(-1)).toThrow();
    expect(() => formatDuration(1.5)).toThrow();
  });
});
