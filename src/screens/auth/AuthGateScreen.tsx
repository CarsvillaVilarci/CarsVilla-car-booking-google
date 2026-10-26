import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors } from '../../theme/colors';
import type { ProfileStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'AuthGate'>;

export function AuthGateScreen({ navigation }: Props) {
  return (
    <ScreenContainer>
      <View style={styles.centered}>
        <View style={styles.iconCircle}>
          <Ionicons name="person-outline" size={32} color={colors.primary} />
        </View>
        <Text style={styles.title}>Sign in to view your profile</Text>
        <Text style={styles.subtitle}>
          Track your requests, save vehicles, and manage your account once you're signed in.
        </Text>
        <PrimaryButton label="Sign In / Sign Up" onPress={() => navigation.navigate('Phone')} style={styles.button} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 12 },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  title: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: 13.5, color: colors.textSecondary, textAlign: 'center', lineHeight: 19 },
  button: { marginTop: 16, width: '100%' },
});
