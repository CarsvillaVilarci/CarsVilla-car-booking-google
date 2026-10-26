import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { AppModeProvider } from './src/context/AppModeContext';
import { HelpRequestsProvider } from './src/context/HelpRequestsContext';
import { PartnerVehiclesProvider } from './src/context/PartnerVehiclesContext';
import { PartnerRequestsProvider } from './src/context/PartnerRequestsContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <AppModeProvider>
            <HelpRequestsProvider>
              <PartnerVehiclesProvider>
                <PartnerRequestsProvider>
                  <StatusBar style="dark" />
                  <RootNavigator />
                </PartnerRequestsProvider>
              </PartnerVehiclesProvider>
            </HelpRequestsProvider>
          </AppModeProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
