import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors } from '../../theme/colors';
import { supabase } from '../../lib/supabase';
import type { ProfileStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Otp'>;

export function OtpScreen({ route }: Props) {
  const { phone } = route.params;
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(30);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function handleVerify() {
    if (code.length !== 6) return;
    setError('');
    setLoading(true);
    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone,
      token: code,
      type: 'sms',
    });
    setLoading(false);
    if (verifyError) setError(verifyError.message);
    // On success the session listener in AuthContext flips RootNavigator over automatically.
  }

  async function handleResend() {
    if (cooldown > 0) return;
    setCooldown(30);
    await supabase.auth.signInWithOtp({ phone });
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>Enter the code</Text>
      <Text style={styles.subtitle}>Sent via WhatsApp to {phone}</Text>

      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        maxLength={6}
        placeholder="------"
        placeholderTextColor={colors.textSecondary}
        value={code}
        onChangeText={(v) => setCode(v.replace(/[^0-9]/g, ''))}
      />

      {!!error && <Text style={styles.error}>{error}</Text>}

      <PrimaryButton
        label="Verify & Continue"
        onPress={handleVerify}
        loading={loading}
        disabled={code.length !== 6}
        style={styles.button}
      />

      <Text onPress={handleResend} style={[styles.resend, cooldown > 0 && styles.resendDisabled]}>
        {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, marginTop: 12 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 8, marginBottom: 32 },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 22,
    letterSpacing: 8,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  error: { color: colors.danger, marginTop: 12, fontSize: 13 },
  button: { marginTop: 28 },
  resend: { textAlign: 'center', marginTop: 20, color: colors.primary, fontWeight: '600' },
  resendDisabled: { color: colors.textSecondary },
});
