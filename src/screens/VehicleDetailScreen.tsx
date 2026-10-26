import { useState } from 'react';
import { Dimensions, Image, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../components/ScreenContainer';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { DEMO_VEHICLES } from '../data/demoVehicles';
import type { ListingStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<ListingStackParamList, 'VehicleDetail'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_HEIGHT = 260;

const SPECS = [
  { key: 'year', icon: 'calendar-outline' as const, label: 'Year' },
  { key: 'seats', icon: 'people-outline' as const, label: 'Seats' },
  { key: 'transmission', icon: 'cog-outline' as const, label: 'Transmission' },
  { key: 'fuelType', icon: 'water-outline' as const, label: 'Fuel' },
];

export function VehicleDetailScreen({ route, navigation }: Props) {
  const { vehicleId } = route.params;
  const vehicle = DEMO_VEHICLES.find((v) => v.id === vehicleId) ?? DEMO_VEHICLES[0];
  const [activeImage, setActiveImage] = useState(0);

  function handleOpenChat() {
    navigation.navigate('Chat', { vehicleId: vehicle.id });
  }

  function handleCall() {
    Linking.openURL(`tel:${vehicle.ownerPhone}`);
  }

  function handleWhatsApp() {
    Linking.openURL(`https://wa.me/${vehicle.ownerPhone.replace('+', '')}`);
  }

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 48));
              setActiveImage(index);
            }}
            style={styles.carousel}
          >
            {vehicle.images.map((uri) => (
              <Image key={uri} source={{ uri }} style={styles.carouselImage} resizeMode="cover" />
            ))}
          </ScrollView>
          <View style={styles.dots}>
            {vehicle.images.map((uri, i) => (
              <View key={uri} style={[styles.dot, i === activeImage && styles.dotActive]} />
            ))}
          </View>
        </View>

        <View style={styles.titleRow}>
          <View style={styles.flexShrink}>
            <Text style={styles.title}>
              {vehicle.title} ({vehicle.year})
            </Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.locationText}>{vehicle.location}</Text>
            </View>
          </View>
          <View style={styles.ratingPill}>
            <Ionicons name="star" size={13} color={colors.accent} />
            <Text style={styles.ratingText}>{vehicle.rating.toFixed(1)}</Text>
          </View>
        </View>

        <View style={styles.specsGrid}>
          {SPECS.map((spec) => (
            <View key={spec.key} style={styles.specCard}>
              <Ionicons name={spec.icon} size={20} color={colors.primary} />
              <Text style={styles.specLabel}>{spec.label}</Text>
              <Text style={styles.specValue}>
                {spec.key === 'year' && vehicle.year}
                {spec.key === 'seats' && `${vehicle.seats} seats`}
                {spec.key === 'transmission' && vehicle.transmission}
                {spec.key === 'fuelType' && vehicle.fuelType}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>About this vehicle</Text>
        <Text style={styles.description}>{vehicle.description}</Text>

        <Text style={styles.sectionTitle}>Owner</Text>
        <View style={styles.ownerCard}>
          <View style={styles.ownerAvatar}>
            <Text style={styles.ownerInitial}>{vehicle.ownerName.charAt(0)}</Text>
          </View>
          <View style={styles.flexShrink}>
            <View style={styles.ownerNameRow}>
              <Text style={styles.ownerName}>{vehicle.ownerName}</Text>
              {vehicle.ownerVerified && (
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              )}
            </View>
            <Text style={styles.ownerSub}>
              {vehicle.ownerVerified ? 'Verified partner' : 'Partner'}
            </Text>
          </View>
        </View>

        {vehicle.ownerSubscribed && (
          <View style={styles.contactRow}>
            <PrimaryButton label="Call Owner" onPress={handleCall} style={styles.contactButton} />
            <PrimaryButton label="WhatsApp" onPress={handleWhatsApp} style={[styles.contactButton, styles.whatsapp]} />
          </View>
        )}

        <PrimaryButton
          label="Message Owner"
          onPress={handleOpenChat}
          variant={vehicle.ownerSubscribed ? 'outline' : 'solid'}
          style={styles.messageButton}
        />

        {!vehicle.ownerSubscribed && (
          <Text style={styles.hiddenNote}>
            This owner hasn't unlocked direct contact yet — message them in-app to arrange details.
          </Text>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 32 },
  carousel: { height: CAROUSEL_HEIGHT, borderRadius: 18, overflow: 'hidden' },
  carouselImage: { width: SCREEN_WIDTH - 48, height: CAROUSEL_HEIGHT, backgroundColor: colors.surfaceAlt },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary, width: 16 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 18 },
  flexShrink: { flexShrink: 1 },
  title: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  locationText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  ratingText: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  specsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 20 },
  specCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 4,
  },
  specLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '600', marginTop: 2 },
  specValue: { fontSize: 14, color: colors.textPrimary, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary, marginTop: 24, marginBottom: 8 },
  description: { fontSize: 14, color: colors.textSecondary, lineHeight: 21 },
  ownerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
  },
  ownerAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerInitial: { color: colors.white, fontSize: 18, fontWeight: '800' },
  ownerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ownerName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  ownerSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  contactRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  contactButton: { flex: 1 },
  whatsapp: { backgroundColor: colors.success },
  messageButton: { marginTop: 12 },
  hiddenNote: { fontSize: 12, color: colors.textSecondary, marginTop: 10, lineHeight: 17 },
});
