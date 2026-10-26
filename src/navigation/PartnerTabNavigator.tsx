import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { AppHeader } from '../components/AppHeader';
import { PartnerDashboardScreen } from '../screens/partner/PartnerDashboardScreen';
import { PartnerVehiclesScreen } from '../screens/partner/PartnerVehiclesScreen';
import { AddVehicleScreen } from '../screens/partner/AddVehicleScreen';
import { PartnerRequestsScreen } from '../screens/partner/PartnerRequestsScreen';
import { RequestDetailScreen } from '../screens/partner/RequestDetailScreen';
import { PartnerProfileScreen } from '../screens/partner/PartnerProfileScreen';
import type {
  PartnerDashboardStackParamList,
  PartnerProfileStackParamList,
  PartnerRequestsStackParamList,
  PartnerTabParamList,
  PartnerVehiclesStackParamList,
} from './types';

const headerOptions = {
  header: (props: Parameters<typeof AppHeader>[0]) => <AppHeader {...props} />,
};

const DashboardStack = createNativeStackNavigator<PartnerDashboardStackParamList>();
const VehiclesStack = createNativeStackNavigator<PartnerVehiclesStackParamList>();
const RequestsStack = createNativeStackNavigator<PartnerRequestsStackParamList>();
const ProfileStack = createNativeStackNavigator<PartnerProfileStackParamList>();
const Tab = createBottomTabNavigator<PartnerTabParamList>();

function DashboardStackNavigator() {
  return (
    <DashboardStack.Navigator screenOptions={headerOptions}>
      <DashboardStack.Screen name="PartnerDashboard" component={PartnerDashboardScreen} options={{ title: 'Dashboard' }} />
    </DashboardStack.Navigator>
  );
}

function VehiclesStackNavigator() {
  return (
    <VehiclesStack.Navigator screenOptions={headerOptions}>
      <VehiclesStack.Screen name="PartnerVehicles" component={PartnerVehiclesScreen} options={{ title: 'My Vehicles' }} />
      <VehiclesStack.Screen name="AddVehicle" component={AddVehicleScreen} options={{ title: 'Add Vehicle' }} />
    </VehiclesStack.Navigator>
  );
}

function RequestsStackNavigator() {
  return (
    <RequestsStack.Navigator screenOptions={headerOptions}>
      <RequestsStack.Screen name="PartnerRequests" component={PartnerRequestsScreen} options={{ title: 'Requests' }} />
      <RequestsStack.Screen name="RequestDetail" component={RequestDetailScreen} options={{ title: 'Request' }} />
    </RequestsStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={headerOptions}>
      <ProfileStack.Screen name="PartnerProfile" component={PartnerProfileScreen} options={{ title: 'Profile' }} />
    </ProfileStack.Navigator>
  );
}

const TAB_ICONS: Record<keyof PartnerTabParamList, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  Dashboard: { active: 'speedometer', inactive: 'speedometer-outline' },
  Vehicles: { active: 'car-sport', inactive: 'car-sport-outline' },
  Requests: { active: 'file-tray-full', inactive: 'file-tray-full-outline' },
  Profile: { active: 'person-circle', inactive: 'person-circle-outline' },
};

export function PartnerTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 11.5, fontWeight: '600' as const },
        tabBarIcon: ({ color, focused, size }) => {
          const icons = TAB_ICONS[route.name as keyof PartnerTabParamList];
          return <Ionicons name={focused ? icons.active : icons.inactive} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStackNavigator} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Vehicles" component={VehiclesStackNavigator} options={{ title: 'Vehicles' }} />
      <Tab.Screen name="Requests" component={RequestsStackNavigator} options={{ title: 'Requests' }} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
