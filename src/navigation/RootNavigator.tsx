import { NavigationContainer } from '@react-navigation/native';
import { ModeAwareNavigator } from './ModeAwareNavigator';

// Browsing (Listing/Live Booking/Car Help) stays open to everyone.
// Signing in is only required inside the Profile tab — see the
// auth-gate logic in TabNavigator.tsx's ProfileStackNavigator.
export function RootNavigator() {
  return (
    <NavigationContainer>
      <ModeAwareNavigator />
    </NavigationContainer>
  );
}
