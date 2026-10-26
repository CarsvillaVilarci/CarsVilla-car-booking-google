import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../components/ScreenContainer';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { getCategory } from '../data/helpCategories';
import { useHelpRequests } from '../context/HelpRequestsContext';
import type { CarHelpStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<CarHelpStackParamList, 'HelpRequestForm'>;

export function HelpRequestFormScreen({ route, navigation }: Props) {
  const category = getCategory(route.params.categoryKey);
  const { createRequest } = useHelpRequests();
  const [description, setDescription] = useState('');

  function handleSubmit() {
    const id = createRequest(category.key, description.trim());
    navigation.replace('HelpTracking', { requestId: id });
  }

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.categoryCard}>
          <View style={styles.categoryIcon}>
            <Ionicons name={category.icon} size={26} color={colors.primary} />
          </View>
          <View style={styles.flexShrink}>
            <Text style={styles.categoryTitle}>{category.title}</Text>
            <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Your location</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={18} color={colors.primary} />
          <Text style={styles.locationText}>Current location (GPS)</Text>
        </View>

        <Text style={styles.sectionTitle}>Describe the issue (optional)</Text>
        <TextInput
          style={styles.textArea}
          multiline
          placeholder="E.g. parked on the highway shoulder, near exit 12…"
          placeholderTextColor={colors.textSecondary}
          value={description}
          onChangeText={setDescription}
        />

        <View style={styles.etaRow}>
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.etaText}>{category.serviceLabel} · {category.etaText}</Text>
        </View>

        <PrimaryButton label="Request Help" onPress={handleSubmit} style={styles.submitButton} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 32 },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flexShrink: { flexShrink: 1 },
  categoryTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  categorySubtitle: { fontSize: 12.5, color: colors.textSecondary, marginTop: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginTop: 24, marginBottom: 10 },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  locationText: { fontSize: 14, color: colors.textPrimary, fontWeight: '600' },
  textArea: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.textPrimary,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  etaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16 },
  etaText: { fontSize: 12.5, color: colors.textSecondary, fontWeight: '600' },
  submitButton: { marginTop: 24 },
});
