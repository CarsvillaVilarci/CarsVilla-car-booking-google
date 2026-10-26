import { Alert, FlatList, Image, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors } from '../../theme/colors';
import { usePartnerVehicles } from '../../context/PartnerVehiclesContext';
import type { PartnerVehicleListing } from '../../data/partnerDemoData';
import type { PartnerVehiclesStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<PartnerVehiclesStackParamList, 'PartnerVehicles'>;

export function PartnerVehiclesScreen({ navigation }: Props) {
  const { vehicles, toggleActive, removeVehicle } = usePartnerVehicles();

  function handleEdit(vehicle: PartnerVehicleListing) {
    Alert.alert(vehicle.title, 'Editing listings is coming soon.');
  }

  function handleDelete(vehicle: PartnerVehicleListing) {
    Alert.alert('Remove listing', `Remove ${vehicle.title} from your listings?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeVehicle(vehicle.id) },
    ]);
  }

  function renderItem({ item }: { item: PartnerVehicleListing }) {
    return (
      <View style={styles.card}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.thumbnail} resizeMode="cover" />
        ) : (
          <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
            <Ionicons name="car-sport" size={26} color={colors.textSecondary} />
          </View>
        )}

        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.cardSubtitle}>
            {item.category} · {item.seats} seats · {item.transmission}
          </Text>
          <Text style={styles.cardPrice}>₹{item.pricePerDay.toLocaleString('en-IN')}/day</Text>

          <View style={styles.cardFooter}>
            <View style={styles.statusRow}>
              <Switch
                value={item.isActive}
                onValueChange={() => toggleActive(item.id)}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={item.isActive ? colors.primary : colors.surface}
              />
              <Text style={styles.statusText}>{item.isActive ? 'Active' : 'Inactive'}</Text>
            </View>
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleEdit(item)} activeOpacity={0.7}>
                <Ionicons name="create-outline" size={18} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item)} activeOpacity={0.7}>
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScreenContainer>
      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <PrimaryButton
            label="+ Add Vehicle"
            onPress={() => navigation.navigate('AddVehicle')}
            style={styles.addButton}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="car-outline" size={36} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No vehicles listed yet.</Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingTop: 12, paddingBottom: 24 },
  addButton: { marginBottom: 18 },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    marginBottom: 14,
    overflow: 'hidden',
  },
  thumbnail: { width: 96, height: '100%', backgroundColor: colors.surfaceAlt },
  thumbnailPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, padding: 12, gap: 2 },
  cardTitle: { fontSize: 14.5, fontWeight: '800', color: colors.textPrimary },
  cardSubtitle: { fontSize: 12, color: colors.textSecondary },
  cardPrice: { fontSize: 14, fontWeight: '700', color: colors.primary, marginTop: 2 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  actionsRow: { flexDirection: 'row', gap: 6 },
  actionButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyText: { fontSize: 14, color: colors.textSecondary },
});
