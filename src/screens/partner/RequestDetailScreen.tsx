import { Linking, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors } from '../../theme/colors';
import { usePartnerRequests } from '../../context/PartnerRequestsContext';
import type { PartnerRequestsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<PartnerRequestsStackParamList, 'RequestDetail'>;

export function RequestDetailScreen({ route, navigation }: Props) {
  const { requestId } = route.params;
  const { getRequest, acceptRequest, declineRequest } = usePartnerRequests();
  const request = getRequest(requestId);

  if (!request) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <Text style={styles.title}>Request not found</Text>
          <PrimaryButton label="Back" onPress={() => navigation.goBack()} style={styles.fullButton} />
        </View>
      </ScreenContainer>
    );
  }

  function handleCall() {
    Linking.openURL(`tel:${request!.riderPhone}`);
  }

  function handleAccept() {
    acceptRequest(requestId);
  }

  function handleDecline() {
    declineRequest(requestId);
  }

  return (
    <ScreenContainer>
      <View style={styles.riderCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{request.riderName.charAt(0)}</Text>
        </View>
        <View style={styles.flexShrink}>
          <Text style={styles.riderName}>{request.riderName}</Text>
          <Text style={styles.vehicleTitle}>{request.vehicleTitle}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Message</Text>
      <View style={styles.messageCard}>
        <Text style={styles.messageText}>{request.message}</Text>
      </View>

      {request.status === 'pending' ? (
        <>
          <View style={styles.actionsRow}>
            <PrimaryButton label="Decline" onPress={handleDecline} variant="outline" style={styles.flexButton} />
            <PrimaryButton label="Accept" onPress={handleAccept} style={styles.flexButton} />
          </View>
          <PrimaryButton label="Call Rider" onPress={handleCall} variant="outline" style={styles.fullButton} />
        </>
      ) : (
        <View style={styles.statusCard}>
          <Ionicons
            name={request.status === 'accepted' ? 'checkmark-circle' : 'close-circle'}
            size={28}
            color={request.status === 'accepted' ? colors.success : colors.textSecondary}
          />
          <Text style={styles.statusText}>
            {request.status === 'accepted' ? 'You accepted this request' : 'You declined this request'}
          </Text>
          {request.status === 'accepted' && (
            <PrimaryButton label="Call Rider" onPress={handleCall} style={styles.fullButton} />
          )}
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  title: { fontSize: 17, fontWeight: '800', color: colors.textPrimary },
  riderCard: {
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
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontSize: 18, fontWeight: '800' },
  flexShrink: { flexShrink: 1 },
  riderName: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  vehicleTitle: { fontSize: 13, color: colors.primary, fontWeight: '600', marginTop: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginTop: 24, marginBottom: 10 },
  messageCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
  },
  messageText: { fontSize: 14, color: colors.textPrimary, lineHeight: 20 },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 28 },
  flexButton: { flex: 1 },
  fullButton: { marginTop: 12 },
  statusCard: {
    marginTop: 28,
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 24,
  },
  statusText: { fontSize: 14.5, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' },
});
