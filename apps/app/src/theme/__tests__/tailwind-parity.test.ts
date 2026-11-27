import { colours, radius, spacing, typography } from '../tokens';

// tailwind.config.js is plain CommonJS; it mirrors tokens.ts and this test keeps the two in step.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const tailwind = require('../../../tailwind.config.js') as {
  theme: {
    spacing: Record<string, string>;
    borderRadius: Record<string, string>;
    fontSize: Record<string, [string, { lineHeight: string }]>;
    colors: Record<string, string>;
  };
};

const px = (n: number) => `${n}px`;

describe('tailwind config mirrors tokens', () => {
  it('spacing', () => {
    expect(tailwind.theme.spacing).toEqual(
      Object.fromEntries(Object.entries(spacing).map(([k, v]) => [k, px(v)])),
    );
  });

  it('radius', () => {
    expect(tailwind.theme.borderRadius).toEqual(
      Object.fromEntries(Object.entries(radius).map(([k, v]) => [k, px(v)])),
    );
  });

  it('type sizes and line heights', () => {
    for (const [name, size] of Object.entries(tailwind.theme.fontSize)) {
      const token = typography[name as keyof typeof typography];
      expect(size[0]).toBe(px(token.size));
      expect(size[1].lineHeight).toBe(px(token.lineHeight));
    }
    // bodyStrong is body at weight 600, so it has no size of its own.
    expect(Object.keys(tailwind.theme.fontSize).sort()).toEqual(
      Object.keys(typography).filter((k) => k !== 'bodyStrong').sort(),
    );
  });

  it('every colour token has a Tailwind colour backed by its CSS variable', () => {
    const used = new Set(
      Object.values(tailwind.theme.colors)
        .map((v) => /--c-(\w+)\)/.exec(v)?.[1])
        .filter((v): v is string => v !== undefined),
    );
    expect([...used].sort()).toEqual(Object.keys(colours.light).sort());
  });
});
