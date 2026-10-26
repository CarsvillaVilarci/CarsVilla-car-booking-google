import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../components/ScreenContainer';
import { CategoryPill } from '../components/CategoryPill';
import { VehicleCard } from '../components/VehicleCard';
import { colors } from '../theme/colors';
import { DEMO_VEHICLES, type VehicleCategory } from '../data/demoVehicles';
import type { ListingStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<ListingStackParamList, 'VehicleList'>;

const CATEGORIES: Array<VehicleCategory | 'All'> = ['All', 'SUV', 'Sedan', 'Hatchback', 'MUV'];

export function VehicleListScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<VehicleCategory | 'All'>('All');

  const filtered = useMemo(() => {
    return DEMO_VEHICLES.filter((v) => {
      const matchesCategory = category === 'All' || v.category === category;
      const matchesQuery =
        query.trim().length === 0 ||
        v.title.toLowerCase().includes(query.trim().toLowerCase()) ||
        v.location.toLowerCase().includes(query.trim().toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  return (
    <ScreenContainer>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by car or city"
                placeholderTextColor={colors.textSecondary}
                value={query}
                onChangeText={setQuery}
              />
            </View>

            <FlatList
              data={CATEGORIES}
              horizontal
              keyExtractor={(c) => c}
              showsHorizontalScrollIndicator={false}
              style={styles.categoryList}
              renderItem={({ item }) => (
                <CategoryPill label={item} active={item === category} onPress={() => setCategory(item)} />
              )}
            />

            <Text style={styles.resultsText}>{filtered.length} vehicles available</Text>
          </View>
        }
        renderItem={({ item }) => (
          <VehicleCard vehicle={item} onPress={() => navigation.navigate('VehicleDetail', { vehicleId: item.id })} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="car-outline" size={36} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No vehicles match your search.</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingBottom: 6 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 8,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.textPrimary },
  categoryList: { marginTop: 16, marginBottom: 4 },
  resultsText: { fontSize: 13, color: colors.textSecondary, marginTop: 10, marginBottom: 4, fontWeight: '600' },
  listContent: { paddingBottom: 24 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyText: { fontSize: 14, color: colors.textSecondary },
});
