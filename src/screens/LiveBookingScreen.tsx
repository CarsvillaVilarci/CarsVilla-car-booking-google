import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components/ScreenContainer';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';

type RideState = 'idle' | 'searching' | 'matched';

interface RideTier {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  eta: string;
  price: number;
}

const RIDE_TIERS: RideTier[] = [
  { key: 'bike', label: 'Bike', icon: 'bicycle-outline', eta: '2 min', price: 49 },
  { key: 'auto', label: 'Auto', icon: 'car-outline', eta: '4 min', price: 89 },
  { key: 'cab', label: 'Cab', icon: 'car-sport-outline', eta: '6 min', price: 149 },
  { key: 'premium', label: 'Premium', icon: 'diamond-outline', eta: '8 min', price: 249 },
];

export function LiveBookingScreen() {
  const [pickup, setPickup] = useState('Current location');
  const [destination, setDestination] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('cab');
  const [rideState, setRideState] = useState<RideState>('idle');

  const canBook = destination.trim().length > 0 && rideState === 'idle';

  function handleBook() {
    if (!canBook) return;
    setRideState('searching');
    setTimeout(() => setRideState('matched'), 1800);
  }

  function handleCancel() {
    setRideState('idle');
  }

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.heading}>Where to?</Text>

      <View style={styles.inputStack}>
        <View style={styles.inputRow}>
          <View style={[styles.dot, styles.dotPickup]} />
          <TextInput
            style={styles.input}
            value={pickup}
            onChangeText={setPickup}
            placeholder="Pickup location"
            placeholderTextColor={colors.textSecondary}
            editable={rideState === 'idle'}
          />
        </View>
        <View style={styles.inputDivider} />
        <View style={styles.inputRow}>
          <View style={[styles.dot, styles.dotDrop]} />
          <TextInput
            style={styles.input}
            value={destination}
            onChangeText={setDestination}
            placeholder="Enter destination"
            placeholderTextColor={colors.textSecondary}
            editable={rideState === 'idle'}
          />
        </View>
      </View>

      {rideState === 'idle' && (
        <>
          <Text style={styles.sectionTitle}>Choose a ride</Text>
          <View style={styles.tierGrid}>
            {RIDE_TIERS.map((tier) => {
              const active = tier.key === selectedTier;
              return (
                <TouchableOpacity
                  key={tier.key}
                  style={[styles.tierCard, active && styles.tierCardActive]}
                  activeOpacity={0.85}
                  onPress={() => setSelectedTier(tier.key)}
                >
                  <Ionicons name={tier.icon} size={26} color={active ? colors.primary : colors.textSecondary} />
                  <Text style={[styles.tierLabel, active && styles.tierLabelActive]}>{tier.label}</Text>
                  <Text style={styles.tierEta}>{tier.eta} away</Text>
                  <Text style={[styles.tierPrice, active && styles.tierLabelActive]}>₹{tier.price}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <PrimaryButton
            label={destination.trim() ? 'Book Ride' : 'Enter a destination'}
            onPress={handleBook}
            disabled={!canBook}
            style={styles.bookButton}
          />
        </>
      )}

      {rideState === 'searching' && (
        <View style={styles.statusCard}>
          <Ionicons name="radio-outline" size={32} color={colors.primary} />
          <Text style={styles.statusTitle}>Finding your driver…</Text>
          <Text style={styles.statusSubtitle}>This usually takes a few seconds.</Text>
          <PrimaryButton label="Cancel" onPress={handleCancel} variant="outline" style={styles.cancelButton} />
        </View>
      )}

      {rideState === 'matched' && (
        <View style={styles.statusCard}>
          <View style={styles.driverAvatar}>
            <Ionicons name="person" size={26} color={colors.white} />
          </View>
          <Text style={styles.statusTitle}>Rahul Thakur is on the way</Text>
          <Text style={styles.statusSubtitle}>WB-04-AX-9091 · Swift Dzire · Arriving in 4 min</Text>
          <View style={styles.contactRow}>
            <PrimaryButton label="Call Driver" onPress={() => {}} style={styles.contactButton} />
            <PrimaryButton label="Cancel Ride" onPress={handleCancel} variant="outline" style={styles.contactButton} />
          </View>
        </View>
      )}

      <Text style={styles.disclaimer}>
        Live ride matching is a preview demo — real-time dispatch arrives in a later phase.
      </Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 32 },
  heading: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, marginTop: 12, marginBottom: 16 },
  inputStack: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  dot: { width: 9, height: 9, borderRadius: 5 },
  dotPickup: { backgroundColor: colors.success },
  dotDrop: { backgroundColor: colors.primary },
  input: { flex: 1, fontSize: 15, color: colors.textPrimary },
  inputDivider: { height: 1, backgroundColor: colors.border, marginLeft: 21 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginTop: 24, marginBottom: 12 },
  tierGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tierCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 4,
  },
  tierCardActive: { borderColor: colors.primary, backgroundColor: colors.surfaceAlt },
  tierLabel: { fontSize: 14, fontWeight: '700', color: colors.textSecondary, marginTop: 4 },
  tierLabelActive: { color: colors.primary },
  tierEta: { fontSize: 11, color: colors.textSecondary },
  tierPrice: { fontSize: 15, fontWeight: '800', color: colors.textPrimary, marginTop: 2 },
  bookButton: { marginTop: 24 },
  statusCard: {
    marginTop: 28,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingVertical: 32,
    paddingHorizontal: 20,
    gap: 6,
  },
  statusTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary, marginTop: 8 },
  statusSubtitle: { fontSize: 13, color: colors.textSecondary, textAlign: 'center' },
  cancelButton: { marginTop: 18, width: '100%' },
  driverAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactRow: { flexDirection: 'row', gap: 10, marginTop: 18, width: '100%' },
  contactButton: { flex: 1 },
  disclaimer: { fontSize: 11.5, color: colors.textSecondary, textAlign: 'center', marginTop: 20, lineHeight: 16 },
});
