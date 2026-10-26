import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import type { DemoVehicle } from '../data/demoVehicles';

interface Props {
  vehicle: DemoVehicle;
  onPress: () => void;
}

export function VehicleCard({ vehicle, onPress }: Props) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.card}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: vehicle.images[0] }} style={styles.image} resizeMode="cover" />
        <View style={styles.categoryPill}>
          <Text style={styles.categoryText}>{vehicle.category}</Text>
        </View>
        <View style={styles.ratingPill}>
          <Ionicons name="star" size={12} color={colors.accent} />
          <Text style={styles.ratingText}>{vehicle.rating.toFixed(1)}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {vehicle.title} ({vehicle.year})
        </Text>

        <View style={styles.specRow}>
          <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.specText}>{vehicle.seats} seats</Text>
          <Text style={styles.specDot}>•</Text>
          <Ionicons name="cog-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.specText}>{vehicle.transmission}</Text>
          <Text style={styles.specDot}>•</Text>
          <Ionicons name="water-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.specText}>{vehicle.fuelType}</Text>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={13} color={colors.textSecondary} />
            <Text style={styles.locationText}>{vehicle.location}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    marginBottom: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  imageWrap: { width: '100%', height: 170, backgroundColor: colors.surfaceAlt },
  image: { width: '100%', height: '100%' },
  categoryPill: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(36,16,18,0.65)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  categoryText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  ratingPill: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.white,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },
  ratingText: { fontSize: 12, fontWeight: '700', color: colors.textPrimary },
  body: { padding: 14 },
  title: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  specRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  specText: { fontSize: 12.5, color: colors.textSecondary, fontWeight: '500' },
  specDot: { color: colors.border, marginHorizontal: 2 },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  locationText: { fontSize: 12.5, color: colors.textSecondary, fontWeight: '500' },
});
