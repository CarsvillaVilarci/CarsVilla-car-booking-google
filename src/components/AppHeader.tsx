import { useEffect, useRef } from 'react';
import { Alert, Animated, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { useAppMode } from '../context/AppModeContext';

const CONTENT_HEIGHT = 56;
const LOGO_URL = 'https://officialpic.vilarci.in/Icons/web-icon.png';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SHIMMER_WIDTH = 110;

// Demo-only values — no wallet/notifications backend yet (see PIPELINE.md).
const DEMO_WALLET_BALANCE = 450;
const DEMO_UNREAD_NOTIFICATIONS = 3;

// Auth/onboarding screens have no back button either, but a wallet
// balance / notifications don't make sense before a user is signed in.
const SUPPRESS_ACTIONS_ON = new Set(['Phone', 'Otp', 'Name']);

export function AppHeader({ navigation, route, options, back }: NativeStackHeaderProps) {
  const insets = useSafeAreaInsets();
  const { mode, toggleMode } = useAppMode();
  const title = options.title ?? route.name;
  const showActions = !back && !SUPPRESS_ACTIONS_ON.has(route.name);
  const shimmerX = useRef(new Animated.Value(-SHIMMER_WIDTH)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(2200),
        Animated.timing(shimmerX, {
          toValue: SCREEN_WIDTH + SHIMMER_WIDTH,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerX, {
          toValue: -SHIMMER_WIDTH,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmerX]);

  function handleNotificationsPress() {
    Alert.alert('Notifications', `You have ${DEMO_UNREAD_NOTIFICATIONS} unread notifications.`);
  }

  function handleWalletPress() {
    const label = mode === 'partner' ? 'Partner Wallet' : 'Vride Wallet';
    Alert.alert(label, `Current balance: ₹${DEMO_WALLET_BALANCE.toLocaleString('en-IN')}`);
  }

  return (
    <View style={styles.shadowWrapper}>
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View
        pointerEvents="none"
        style={[styles.shimmer, { transform: [{ translateX: shimmerX }, { rotate: '18deg' }] }]}
      >
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.22)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <View style={styles.content}>
        <View style={styles.leftZone}>
          {back ? (
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.7}
              onPress={navigation.goBack}
              accessibilityLabel="Go back"
            >
              <Ionicons name="chevron-back" size={22} color={colors.white} />
            </TouchableOpacity>
          ) : (
            <View style={styles.badge}>
              <Image source={{ uri: LOGO_URL }} style={styles.badgeImage} resizeMode="contain" />
            </View>
          )}
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>

        {showActions && (
          <View style={styles.rightZone}>
            <TouchableOpacity
              style={styles.iconButton}
              activeOpacity={0.7}
              onPress={toggleMode}
              accessibilityLabel={mode === 'rider' ? 'Switch to Partner mode' : 'Switch to Rider mode'}
            >
              <Ionicons
                name={mode === 'rider' ? 'briefcase-outline' : 'car-sport-outline'}
                size={19}
                color={colors.white}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.walletPill}
              activeOpacity={0.7}
              onPress={handleWalletPress}
              accessibilityLabel="Wallet"
            >
              <Ionicons name="wallet-outline" size={16} color={colors.white} />
              <Text style={styles.walletText}>₹{DEMO_WALLET_BALANCE.toLocaleString('en-IN')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
              activeOpacity={0.7}
              onPress={handleNotificationsPress}
              accessibilityLabel="Notifications"
            >
              <Ionicons name="notifications-outline" size={20} color={colors.white} />
              {DEMO_UNREAD_NOTIFICATIONS > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {DEMO_UNREAD_NOTIFICATIONS > 9 ? '9+' : DEMO_UNREAD_NOTIFICATIONS}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={styles.accentLine} />
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Shadow and overflow:'hidden' can't live on the same view on iOS —
  // overflow would clip the shadow. shadowWrapper carries the shadow,
  // container (nested inside) clips the shimmer sweep.
  shadowWrapper: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  container: {
    backgroundColor: colors.primary,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: -30,
    bottom: -30,
    width: SHIMMER_WIDTH,
  },
  content: {
    height: CONTENT_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  leftZone: { flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 1 },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  badgeImage: { width: '100%', height: '100%' },
  title: { color: colors.white, fontSize: 18, fontWeight: '800', flexShrink: 1 },
  rightZone: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 10,
  },
  walletText: { color: colors.white, fontSize: 12.5, fontWeight: '700' },
  notificationBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  notificationBadgeText: { color: colors.white, fontSize: 9.5, fontWeight: '800' },
  accentLine: { height: 3, backgroundColor: colors.accent },
});
