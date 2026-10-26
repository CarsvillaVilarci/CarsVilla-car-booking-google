import { ActivityIndicator, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { VehicleListScreen } from '../screens/VehicleListScreen';
import { VehicleDetailScreen } from '../screens/VehicleDetailScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { LiveBookingScreen } from '../screens/LiveBookingScreen';
import { CarHelpScreen } from '../screens/CarHelpScreen';
import { HelpRequestFormScreen } from '../screens/HelpRequestFormScreen';
import { HelpTrackingScreen } from '../screens/HelpTrackingScreen';
import { HelpHistoryScreen } from '../screens/HelpHistoryScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { AuthGateScreen } from '../screens/auth/AuthGateScreen';
import { PhoneScreen } from '../screens/auth/PhoneScreen';
import { OtpScreen } from '../screens/auth/OtpScreen';
import { NameScreen } from '../screens/auth/NameScreen';
import { AppHeader } from '../components/AppHeader';
import { useAuth } from '../context/AuthContext';
import { DEMO_VEHICLES } from '../data/demoVehicles';
import type {
  CarHelpStackParamList,
  ListingStackParamList,
  LiveBookingStackParamList,
  ProfileStackParamList,
  TabParamList,
} from './types';

const headerOptions = {
  header: (props: Parameters<typeof AppHeader>[0]) => <AppHeader {...props} />,
};

const ListingStack = createNativeStackNavigator<ListingStackParamList>();
const LiveBookingStack = createNativeStackNavigator<LiveBookingStackParamList>();
const CarHelpStack = createNativeStackNavigator<CarHelpStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function ListingStackNavigator() {
  return (
    <ListingStack.Navigator screenOptions={headerOptions}>
      <ListingStack.Screen name="VehicleList" component={VehicleListScreen} options={{ title: 'Vride' }} />
      <ListingStack.Screen
        name="VehicleDetail"
        component={VehicleDetailScreen}
        options={{ title: 'Vehicle details' }}
      />
      <ListingStack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }) => ({
          title: DEMO_VEHICLES.find((v) => v.id === route.params.vehicleId)?.ownerName ?? 'Chat',
        })}
      />
    </ListingStack.Navigator>
  );
}

function LiveBookingStackNavigator() {
  return (
    <LiveBookingStack.Navigator screenOptions={headerOptions}>
      <LiveBookingStack.Screen name="LiveBooking" component={LiveBookingScreen} options={{ title: 'Book a Ride' }} />
    </LiveBookingStack.Navigator>
  );
}

function CarHelpStackNavigator() {
  return (
    <CarHelpStack.Navigator screenOptions={headerOptions}>
      <CarHelpStack.Screen name="CarHelp" component={CarHelpScreen} options={{ title: 'Car Help' }} />
      <CarHelpStack.Screen
        name="HelpRequestForm"
        component={HelpRequestFormScreen}
        options={{ title: 'Request Help' }}
      />
      <CarHelpStack.Screen name="HelpTracking" component={HelpTrackingScreen} options={{ title: 'Your Request' }} />
      <CarHelpStack.Screen name="HelpHistory" component={HelpHistoryScreen} options={{ title: 'My Requests' }} />
    </CarHelpStack.Navigator>
  );
}

function ProfileStackNavigator() {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ProfileStack.Navigator screenOptions={headerOptions}>
      {!session ? (
        <>
          <ProfileStack.Screen name="AuthGate" component={AuthGateScreen} options={{ title: 'Profile' }} />
          <ProfileStack.Screen name="Phone" component={PhoneScreen} options={{ title: 'Vride' }} />
          <ProfileStack.Screen name="Otp" component={OtpScreen} options={{ title: 'Verify' }} />
        </>
      ) : !profile?.fullName ? (
        <ProfileStack.Screen name="Name" component={NameScreen} options={{ title: 'Vride' }} />
      ) : (
        <ProfileStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
      )}
    </ProfileStack.Navigator>
  );
}

const TAB_ICONS: Record<keyof TabParamList, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  Listing: { active: 'car-sport', inactive: 'car-sport-outline' },
  LiveBooking: { active: 'navigate-circle', inactive: 'navigate-circle-outline' },
  CarHelp: { active: 'help-buoy', inactive: 'help-buoy-outline' },
  Profile: { active: 'person-circle', inactive: 'person-circle-outline' },
};

export function TabNavigator() {
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
          const icons = TAB_ICONS[route.name as keyof TabParamList];
          return <Ionicons name={focused ? icons.active : icons.inactive} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Listing" component={ListingStackNavigator} options={{ title: 'Listing' }} />
      <Tab.Screen name="LiveBooking" component={LiveBookingStackNavigator} options={{ title: 'Live Booking' }} />
      <Tab.Screen name="CarHelp" component={CarHelpStackNavigator} options={{ title: 'Car Help' }} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
