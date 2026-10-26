import { useEffect, useRef } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../components/ScreenContainer';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { getCategory } from '../data/helpCategories';
import { useHelpRequests } from '../context/HelpRequestsContext';
import type { CarHelpStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<CarHelpStackParamList, 'HelpTracking'>;

export function HelpTrackingScreen({ route, navigation }: Props) {
  const { requestId } = route.params;
  const { getRequest, assignPartner, completeRequest, cancelRequest } = useHelpRequests();
  const request = getRequest(requestId);
  const triggeredRef = useRef(false);

  useEffect(() => {
    if (request?.status === 'searching' && !triggeredRef.current) {
      triggeredRef.current = true;
      const delay = request.priority ? 1200 : 2000;
      setTimeout(() => assignPartner(requestId), delay);
    }
  }, [request?.status, requestId, request?.priority, assignPartner]);

  if (!request) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <Text style={styles.statusTitle}>Request not found</Text>
          <PrimaryButton label="Back to Help" onPress={() => navigation.popToTop()} style={styles.actionButton} />
        </View>
      </ScreenContainer>
    );
  }

  const category = getCategory(request.categoryKey);

  function handleCall() {
    if (request?.partner) Linking.openURL(`tel:${request.partner.phone}`);
  }

  function handleCancel() {
    cancelRequest(requestId);
  }

  function handleComplete() {
    completeRequest(requestId);
  }

  return (
    <ScreenContainer>
      <View style={styles.categoryBar}>
        <Ionicons name={category.icon} size={18} color={colors.primary} />
        <Text style={styles.categoryText}>{category.title}</Text>
      </View>

      {request.status === 'searching' && (
        <View style={styles.centered}>
          <Ionicons name="radio-outline" size={36} color={colors.primary} />
          <Text style={styles.statusTitle}>Finding the nearest help partner…</Text>
          <Text style={styles.statusSubtitle}>This usually takes under a minute.</Text>
          <PrimaryButton label="Cancel Request" onPress={handleCancel} variant="outline" style={styles.actionButton} />
        </View>
      )}

      {request.status === 'assigned' && request.partner && (
        <View style={styles.centered}>
          <View style={styles.partnerAvatar}>
            <Text style={styles.partnerInitial}>{request.partner.name.charAt(0)}</Text>
          </View>
          <Text style={styles.statusTitle}>{request.partner.name} is on the way</Text>
          <Text style={styles.statusSubtitle}>
            {request.partner.service} · {request.partner.distanceKm.toFixed(1)} km · ETA {request.partner.etaMinutes} min
          </Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={colors.accent} />
            <Text style={styles.ratingText}>{request.partner.rating.toFixed(1)}</Text>
          </View>

          <View style={styles.buttonRow}>
            <PrimaryButton label="Call Partner" onPress={handleCall} style={styles.flexButton} />
            <PrimaryButton label="Resolved" onPress={handleComplete} variant="outline" style={styles.flexButton} />
          </View>
          <PrimaryButton label="Cancel Request" onPress={handleCancel} variant="outline" style={styles.actionButton} />
        </View>
      )}

      {request.status === 'completed' && (
        <View style={styles.centered}>
          <Ionicons name="checkmark-circle" size={40} color={colors.success} />
          <Text style={styles.statusTitle}>Request completed</Text>
          <Text style={styles.statusSubtitle}>Glad we could help get you back on the road.</Text>
          <PrimaryButton label="Back to Help" onPress={() => navigation.popToTop()} style={styles.actionButton} />
        </View>
      )}

      {request.status === 'cancelled' && (
        <View style={styles.centered}>
          <Ionicons name="close-circle" size={40} color={colors.textSecondary} />
          <Text style={styles.statusTitle}>Request cancelled</Text>
          <PrimaryButton label="Back to Help" onPress={() => navigation.popToTop()} style={styles.actionButton} />
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  categoryBar: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  categoryText: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 12 },
  statusTitle: { fontSize: 17, fontWeight: '800', color: colors.textPrimary, marginTop: 10, textAlign: 'center' },
  statusSubtitle: { fontSize: 13, color: colors.textSecondary, textAlign: 'center' },
  partnerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerInitial: { color: colors.white, fontSize: 22, fontWeight: '800' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  ratingText: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 20, width: '100%' },
  flexButton: { flex: 1 },
  actionButton: { marginTop: 14, width: '100%' },
});
