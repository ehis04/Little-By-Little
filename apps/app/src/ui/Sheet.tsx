// Metro picks Sheet.web.tsx on web and Sheet.native.tsx on iOS and Android. This file gives TypeScript
// and tooling a single import path and is the fallback for any other platform.
export { Sheet } from './Sheet.native';
export type { SheetProps } from './Sheet.types';
