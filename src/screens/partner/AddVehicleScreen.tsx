import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { CategoryPill } from '../../components/CategoryPill';
import { colors } from '../../theme/colors';
import { usePartnerVehicles } from '../../context/PartnerVehiclesContext';
import type {
  ListingCategory,
  ListingFuelType,
  ListingTransmission,
} from '../../data/partnerDemoData';
import type { PartnerVehiclesStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<PartnerVehiclesStackParamList, 'AddVehicle'>;

const CATEGORIES: ListingCategory[] = ['SUV', 'Sedan', 'Hatchback', 'MUV'];
const TRANSMISSIONS: ListingTransmission[] = ['Manual', 'Automatic'];
const FUEL_TYPES: ListingFuelType[] = ['Petrol', 'Diesel', 'CNG'];

export function AddVehicleScreen({ navigation }: Props) {
  const { addVehicle } = usePartnerVehicles();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ListingCategory>('Sedan');
  const [pricePerDay, setPricePerDay] = useState('');
  const [seats, setSeats] = useState('5');
  const [transmission, setTransmission] = useState<ListingTransmission>('Manual');
  const [fuelType, setFuelType] = useState<ListingFuelType>('Petrol');

  const isValid = title.trim().length > 1 && Number(pricePerDay) > 0 && Number(seats) > 0;

  function handleSubmit() {
    if (!isValid) return;
    addVehicle({
      title: title.trim(),
      category,
      pricePerDay: Number(pricePerDay),
      seats: Number(seats),
      transmission,
      fuelType,
    });
    navigation.goBack();
  }

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Vehicle name</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g. Hyundai Creta SX (2022)"
          placeholderTextColor={colors.textSecondary}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.sectionTitle}>Category</Text>
        <View style={styles.pillRow}>
          {CATEGORIES.map((c) => (
            <CategoryPill key={c} label={c} active={c === category} onPress={() => setCategory(c)} />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Price per day (₹)</Text>
        <TextInput
          style={styles.input}
          placeholder="1800"
          placeholderTextColor={colors.textSecondary}
          keyboardType="number-pad"
          value={pricePerDay}
          onChangeText={setPricePerDay}
        />

        <Text style={styles.sectionTitle}>Seats</Text>
        <TextInput
          style={styles.input}
          placeholder="5"
          placeholderTextColor={colors.textSecondary}
          keyboardType="number-pad"
          value={seats}
          onChangeText={setSeats}
        />

        <Text style={styles.sectionTitle}>Transmission</Text>
        <View style={styles.pillRow}>
          {TRANSMISSIONS.map((t) => (
            <CategoryPill key={t} label={t} active={t === transmission} onPress={() => setTransmission(t)} />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Fuel type</Text>
        <View style={styles.pillRow}>
          {FUEL_TYPES.map((f) => (
            <CategoryPill key={f} label={f} active={f === fuelType} onPress={() => setFuelType(f)} />
          ))}
        </View>

        <PrimaryButton label="List Vehicle" onPress={handleSubmit} disabled={!isValid} style={styles.submitButton} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 32 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginTop: 20, marginBottom: 10 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.textPrimary,
  },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap' },
  submitButton: { marginTop: 28 },
});
