import type { ReactNode } from 'react';

export type SheetProps = {
  visible: boolean;
  onClose: () => void;
  /** Heading, also the accessible name of the dialog. */
  title: string;
  children: ReactNode;
  testID?: string;
};
