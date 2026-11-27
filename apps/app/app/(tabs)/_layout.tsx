import { Tabs } from 'expo-router';
import { ListChecks, Route, UserRound } from 'lucide-react-native';

import { copy } from '@/copy/en-IE';
import { fontFamily } from '@/theme/tokens';
import { useBreakpoint } from '@/theme/useBreakpoint';
import { useTheme } from '@/theme/ThemeProvider';

const ICON_SIZE = 24;
const ICON_STROKE = 1.75;

export default function TabsLayout() {
  const { colours } = useTheme();
  const rail = useBreakpoint() === 'lg';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Bottom tab bar on phones and tablets, left rail on desktop web (lg and up).
        tabBarPosition: rail ? 'left' : 'bottom',
        tabBarActiveTintColor: colours.primary,
        tabBarInactiveTintColor: colours.textSecondary,
        tabBarActiveBackgroundColor: rail ? colours.surfaceMuted : 'transparent',
        tabBarStyle: { backgroundColor: colours.surface, borderColor: colours.border },
        tabBarLabelStyle: { fontFamily: fontFamily[500] },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: copy.tabs.list,
          tabBarAccessibilityLabel: copy.tabs.list,
          tabBarIcon: ({ color }) => <ListChecks color={color} size={ICON_SIZE} strokeWidth={ICON_STROKE} />,
        }}
      />
      <Tabs.Screen
        name="plan/index"
        options={{
          title: copy.tabs.plan,
          tabBarAccessibilityLabel: copy.tabs.plan,
          tabBarIcon: ({ color }) => <Route color={color} size={ICON_SIZE} strokeWidth={ICON_STROKE} />,
        }}
      />
      <Tabs.Screen
        name="you/index"
        options={{
          title: copy.tabs.you,
          tabBarAccessibilityLabel: copy.tabs.you,
          tabBarIcon: ({ color }) => <UserRound color={color} size={ICON_SIZE} strokeWidth={ICON_STROKE} />,
        }}
      />
    </Tabs>
  );
}
