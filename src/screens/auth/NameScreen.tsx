import { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors } from '../../theme/colors';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export function NameScreen() {
  const { session, refreshProfile } = useAuth();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValid = name.trim().length >= 2;

  async function handleContinue() {
    if (!session || !isValid) return;
    setError('');
    setLoading(true);
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ full_name: name.trim() })
      .eq('id', session.user.id);
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    await refreshProfile();
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>What's your name?</Text>
      <Text style={styles.subtitle}>This is how owners will see you when you request a vehicle.</Text>

      <TextInput
        style={styles.input}
        placeholder="Full name"
        placeholderTextColor={colors.textSecondary}
        value={name}
        onChangeText={setName}
        autoFocus
      />

      {!!error && <Text style={styles.error}>{error}</Text>}

      <PrimaryButton label="Continue" onPress={handleContinue} loading={loading} disabled={!isValid} style={styles.button} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, marginTop: 12 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 8, marginBottom: 32, lineHeight: 20 },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.textPrimary,
  },
  error: { color: colors.danger, marginTop: 12, fontSize: 13 },
  button: { marginTop: 28 },
});
