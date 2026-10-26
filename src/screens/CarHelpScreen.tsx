import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../components/ScreenContainer';
import { colors } from '../theme/colors';
import { HELP_CATEGORIES, getCategory } from '../data/helpCategories';
import { useHelpRequests } from '../context/HelpRequestsContext';
import type { CarHelpStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<CarHelpStackParamList, 'CarHelp'>;

const EMERGENCY_NUMBER = '+911234567890';

const STATUS_LABEL: Record<string, string> = {
  searching: 'Finding help…',
  assigned: 'Help is on the way',
};

export function CarHelpScreen({ navigation }: Props) {
  const { activeRequest, createRequest } = useHelpRequests();

  function handleSOS() {
    Alert.alert(
      'Emergency SOS',
      "Call Vride's 24/7 roadside emergency line, or request priority help through the app.",
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Now', onPress: () => Linking.openURL(`tel:${EMERGENCY_NUMBER}`) },
        {
          text: 'Request Help',
          onPress: () => {
            const id = createRequest('sos', 'Emergency SOS triggered', true);
            navigation.navigate('HelpTracking', { requestId: id });
          },
        },
      ],
    );
  }

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <View style={styles.flexShrink}>
            <Text style={styles.heading}>Roadside Help</Text>
            <Text style={styles.subheading}>Stuck mid-way? Get help fast.</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('HelpHistory')} activeOpacity={0.7}>
            <Text style={styles.historyLink}>My Requests</Text>
          </TouchableOpacity>
        </View>

        {activeRequest && (
          <TouchableOpacity
            style={styles.activeBanner}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('HelpTracking', { requestId: activeRequest.id })}
          >
            <Ionicons name="time-outline" size={20} color={colors.white} />
            <View style={styles.flexShrink}>
              <Text style={styles.activeBannerTitle}>{getCategory(activeRequest.categoryKey).title}</Text>
              <Text style={styles.activeBannerSubtitle}>{STATUS_LABEL[activeRequest.status]}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.white} />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.sosCard} activeOpacity={0.9} onPress={handleSOS}>
          <View style={styles.sosIcon}>
            <Ionicons name="call" size={22} color={colors.white} />
          </View>
          <View style={styles.flexShrink}>
            <Text style={styles.sosTitle}>Emergency SOS</Text>
            <Text style={styles.sosSubtitle}>Call or request 24/7 emergency support</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.white} />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>What's the problem?</Text>
        <View style={styles.optionGrid}>
          {HELP_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.key}
              style={styles.optionCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('HelpRequestForm', { categoryKey: category.key })}
            >
              <View style={styles.optionIcon}>
                <Ionicons name={category.icon} size={22} color={colors.primary} />
              </View>
              <Text style={styles.optionTitle}>{category.title}</Text>
              <Text style={styles.optionSubtitle}>{category.subtitle}</Text>
              <Text style={styles.optionEta}>{category.etaText}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 32 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 12 },
  flexShrink: { flexShrink: 1 },
  heading: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  subheading: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  historyLink: { fontSize: 13, fontWeight: '700', color: colors.primary },
  activeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.textPrimary,
    borderRadius: 14,
    padding: 14,
    marginTop: 18,
  },
  activeBannerTitle: { color: colors.white, fontSize: 14, fontWeight: '700' },
  activeBannerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 1 },
  sosCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  sosIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosTitle: { fontSize: 16, fontWeight: '800', color: colors.white },
  sosSubtitle: { fontSize: 12.5, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginTop: 26, marginBottom: 12 },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  optionCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    gap: 4,
  },
  optionIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  optionTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  optionSubtitle: { fontSize: 11.5, color: colors.textSecondary, lineHeight: 15 },
  optionEta: { fontSize: 11, color: colors.primary, fontWeight: '700', marginTop: 4 },
});
