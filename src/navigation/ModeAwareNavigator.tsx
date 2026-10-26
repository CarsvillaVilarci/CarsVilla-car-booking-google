import { useAppMode } from '../context/AppModeContext';
import { TabNavigator } from './TabNavigator';
import { PartnerTabNavigator } from './PartnerTabNavigator';

export function ModeAwareNavigator() {
  const { mode } = useAppMode();
  return mode === 'partner' ? <PartnerTabNavigator /> : <TabNavigator />;
}
