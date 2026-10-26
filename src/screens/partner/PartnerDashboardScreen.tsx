import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { colors } from '../../theme/colors';
import { usePartnerVehicles } from '../../context/PartnerVehiclesContext';
import { usePartnerRequests } from '../../context/PartnerRequestsContext';

const SUBSCRIPTION_ACTIVE = true;
const SUBSCRIPTION_VALID_UNTIL = 'Dec 31, 2026';
const DEMO_MONTHLY_EARNINGS = 12400;
const DEMO_RATING = 4.8;

export function PartnerDashboardScreen() {
  const { vehicles } = usePartnerVehicles();
  const { requests } = usePartnerRequests();

  const activeListings = vehicles.filter((v) => v.isActive).length;
  const pendingRequests = requests.filter((r) => r.status === 'pending').length;

  function handleManagePlan() {
    Alert.alert(
      'Vride Partner Plan',
      SUBSCRIPTION_ACTIVE
        ? `Your plan is active until ${SUBSCRIPTION_VALID_UNTIL}.`
        : 'Subscribe to unlock direct contact with riders.',
    );
  }

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>Partner Dashboard</Text>
        <Text style={styles.subheading}>Here's how your listings are doing.</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="car-sport-outline" size={20} color={colors.primary} />
            <Text style={styles.statValue}>{activeListings}</Text>
            <Text style={styles.statLabel}>Active Listings</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="file-tray-full-outline" size={20} color={colors.primary} />
            <Text style={styles.statValue}>{pendingRequests}</Text>
            <Text style={styles.statLabel}>Pending Requests</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="cash-outline" size={20} color={colors.primary} />
            <Text style={styles.statValue}>₹{DEMO_MONTHLY_EARNINGS.toLocaleString('en-IN')}</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="star-outline" size={20} color={colors.primary} />
            <Text style={styles.statValue}>{DEMO_RATING.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.subscriptionCard} activeOpacity={0.9} onPress={handleManagePlan}>
          <View style={styles.subscriptionIcon}>
            <Ionicons name={SUBSCRIPTION_ACTIVE ? 'shield-checkmark' : 'shield-outline'} size={22} color={colors.white} />
          </View>
          <View style={styles.flexShrink}>
            <Text style={styles.subscriptionTitle}>
              {SUBSCRIPTION_ACTIVE ? 'Plan Active' : 'No Active Plan'}
            </Text>
            <Text style={styles.subscriptionSubtitle}>
              {SUBSCRIPTION_ACTIVE ? `Valid until ${SUBSCRIPTION_VALID_UNTIL}` : 'Subscribe to unlock rider contact'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.white} />
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 32 },
  heading: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, marginTop: 12 },
  subheading: { fontSize: 14, color: colors.textSecondary, marginTop: 4, marginBottom: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    gap: 4,
  },
  statValue: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginTop: 4 },
  statLabel: { fontSize: 12, color: colors.textSecondary },
  flexShrink: { flexShrink: 1 },
  subscriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
  },
  subscriptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscriptionTitle: { fontSize: 16, fontWeight: '800', color: colors.white },
  subscriptionSubtitle: { fontSize: 12.5, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
});
