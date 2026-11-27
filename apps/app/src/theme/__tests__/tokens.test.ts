import { colours, type ColourName } from '../tokens';
import { hexToChannels, themeVariables } from '../ThemeProvider';

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

describe('colour tokens', () => {
  it('defines the same names in light and dark', () => {
    expect(Object.keys(colours.dark).sort()).toEqual(Object.keys(colours.light).sort());
  });

  it('converts hex to space separated channels', () => {
    expect(hexToChannels('#010203')).toBe('1 2 3');
    expect(themeVariables(colours.light)['--c-bg']).toBe(hexToChannels(colours.light.bg));
  });

  describe.each(['light', 'dark'] as const)('%s contrast (WCAG 2.2 AA)', (scheme) => {
    const p = colours[scheme];
    const textOnSurfaces: ColourName[] = ['text', 'textSecondary', 'textTertiary', 'primary', 'accentText', 'positive', 'warning', 'danger', 'info'];
    const backgrounds: ColourName[] = ['bg', 'surface'];

    it.each(textOnSurfaces.flatMap((fg) => backgrounds.map((bg) => [fg, bg] as const)))(
      '%s on %s is at least 4.5:1',
      (fg, bg) => {
        expect(contrast(p[fg], p[bg])).toBeGreaterThanOrEqual(4.5);
      },
    );

    it('onPrimary on primary is at least 4.5:1', () => {
      expect(contrast(p.onPrimary, p.primary)).toBeGreaterThanOrEqual(4.5);
    });

    it('borderStrong against the backgrounds is at least 3:1', () => {
      expect(contrast(p.borderStrong, p.bg)).toBeGreaterThanOrEqual(3);
      expect(contrast(p.borderStrong, p.surface)).toBeGreaterThanOrEqual(3);
    });

    it.each(['chain1', 'chain2', 'chain3', 'chain4', 'chain5'] as const)('text on %s is at least 4.5:1', (chain) => {
      expect(contrast(p.text, p[chain])).toBeGreaterThanOrEqual(4.5);
    });
  });
});
