import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../components/ScreenContainer';
import { colors } from '../theme/colors';
import { getCategory } from '../data/helpCategories';
import { useHelpRequests, type HelpRequest, type HelpRequestStatus } from '../context/HelpRequestsContext';
import type { CarHelpStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<CarHelpStackParamList, 'HelpHistory'>;

const STATUS_STYLES: Record<HelpRequestStatus, { label: string; color: string; background: string }> = {
  searching: { label: 'Searching', color: '#8A6D00', background: '#FDF3D0' },
  assigned: { label: 'In progress', color: colors.primary, background: colors.surfaceAlt },
  completed: { label: 'Completed', color: colors.success, background: '#E3F3E3' },
  cancelled: { label: 'Cancelled', color: colors.textSecondary, background: colors.surfaceAlt },
};

function formatTimeAgo(timestamp: number): string {
  const minutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  return `${hours} hr ago`;
}

export function HelpHistoryScreen({ navigation }: Props) {
  const { requests } = useHelpRequests();

  function renderItem({ item }: { item: HelpRequest }) {
    const category = getCategory(item.categoryKey);
    const statusStyle = STATUS_STYLES[item.status];
    return (
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('HelpTracking', { requestId: item.id })}
      >
        <View style={styles.rowIcon}>
          <Ionicons name={category.icon} size={20} color={colors.primary} />
        </View>
        <View style={styles.flexShrink}>
          <Text style={styles.rowTitle}>{category.title}</Text>
          <Text style={styles.rowTime}>{formatTimeAgo(item.createdAt)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.background }]}>
          <Text style={[styles.statusText, { color: statusStyle.color }]}>{statusStyle.label}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <ScreenContainer>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={36} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No help requests yet.</Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingTop: 12, paddingBottom: 24 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flexShrink: { flexShrink: 1, flex: 1 },
  rowTitle: { fontSize: 14.5, fontWeight: '700', color: colors.textPrimary },
  rowTime: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  statusText: { fontSize: 11.5, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyText: { fontSize: 14, color: colors.textSecondary },
});
