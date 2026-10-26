import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/ScreenContainer';
import { colors } from '../../theme/colors';
import { usePartnerRequests } from '../../context/PartnerRequestsContext';
import type { PartnerIncomingRequest, RequestStatus } from '../../data/partnerDemoData';
import type { PartnerRequestsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<PartnerRequestsStackParamList, 'PartnerRequests'>;

const STATUS_STYLES: Record<RequestStatus, { label: string; color: string; background: string }> = {
  pending: { label: 'Pending', color: '#8A6D00', background: '#FDF3D0' },
  accepted: { label: 'Accepted', color: colors.success, background: '#E3F3E3' },
  declined: { label: 'Declined', color: colors.textSecondary, background: colors.surfaceAlt },
};

function formatTimeAgo(timestamp: number): string {
  const minutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.round(hours / 24)} day ago`;
}

export function PartnerRequestsScreen({ navigation }: Props) {
  const { requests } = usePartnerRequests();

  function renderItem({ item }: { item: PartnerIncomingRequest }) {
    const statusStyle = STATUS_STYLES[item.status];
    return (
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('RequestDetail', { requestId: item.id })}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.riderName.charAt(0)}</Text>
        </View>
        <View style={styles.flexShrink}>
          <View style={styles.rowTop}>
            <Text style={styles.riderName}>{item.riderName}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.background }]}>
              <Text style={[styles.statusText, { color: statusStyle.color }]}>{statusStyle.label}</Text>
            </View>
          </View>
          <Text style={styles.vehicleTitle} numberOfLines={1}>
            {item.vehicleTitle}
          </Text>
          <Text style={styles.message} numberOfLines={1}>
            {item.message}
          </Text>
          <Text style={styles.time}>{formatTimeAgo(item.createdAt)}</Text>
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
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="file-tray-outline" size={36} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No requests yet.</Text>
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
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontSize: 16, fontWeight: '800' },
  flexShrink: { flexShrink: 1, flex: 1 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  riderName: { fontSize: 14.5, fontWeight: '700', color: colors.textPrimary },
  vehicleTitle: { fontSize: 12.5, color: colors.primary, fontWeight: '600', marginTop: 2 },
  message: { fontSize: 12.5, color: colors.textSecondary, marginTop: 3 },
  time: { fontSize: 11, color: colors.textSecondary, marginTop: 4 },
  statusBadge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 9 },
  statusText: { fontSize: 11, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyText: { fontSize: 14, color: colors.textSecondary },
});
