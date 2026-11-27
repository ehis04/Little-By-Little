import { useState } from 'react';

/**
 * Pressed state for Pressables that also take a className. NativeWind drops function-form `style`
 * on web, so components use array styles and read the pressed state from here.
 */
export function usePressed() {
  const [pressed, setPressed] = useState(false);
  return {
    pressed,
    handlers: { onPressIn: () => setPressed(true), onPressOut: () => setPressed(false) },
  };
}
