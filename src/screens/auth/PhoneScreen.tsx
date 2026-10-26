import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors } from '../../theme/colors';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { ProfileStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Phone'>;

export function PhoneScreen({ navigation }: Props) {
  const [digits, setDigits] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValid = digits.length === 10;

  async function handleSendOtp() {
    if (!isValid) return;
    setError('');
    const phone = `+91${digits}`;

    if (!isSupabaseConfigured) {
      Alert.alert(
        'Backend not configured',
        'Supabase URL/anon key are not set yet. Add them to .env to enable OTP login.',
      );
      return;
    }

    setLoading(true);
    const { error: otpError } = await supabase.auth.signInWithOtp({ phone });
    setLoading(false);

    if (otpError) {
      setError(otpError.message);
      return;
    }
    navigation.navigate('Otp', { phone });
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>Your mobile number</Text>
      <Text style={styles.subtitle}>We'll send a verification code on WhatsApp to confirm it's you.</Text>

      <View style={styles.inputRow}>
        <View style={styles.codeBox}>
          <Text style={styles.codeText}>+91</Text>
        </View>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          maxLength={10}
          placeholder="98765 43210"
          placeholderTextColor={colors.textSecondary}
          value={digits}
          onChangeText={(v) => setDigits(v.replace(/[^0-9]/g, ''))}
        />
      </View>

      {!!error && <Text style={styles.error}>{error}</Text>}

      <PrimaryButton
        label="Send OTP via WhatsApp"
        onPress={handleSendOtp}
        loading={loading}
        disabled={!isValid}
        style={styles.button}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, marginTop: 12 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 8, marginBottom: 32, lineHeight: 20 },
  inputRow: { flexDirection: 'row', gap: 10 },
  codeBox: {
    paddingHorizontal: 14,
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  codeText: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.textPrimary,
  },
  error: { color: colors.danger, marginTop: 12, fontSize: 13 },
  button: { marginTop: 28 },
});
