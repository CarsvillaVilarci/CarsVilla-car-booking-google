import { useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../components/ScreenContainer';
import { colors } from '../theme/colors';
import { DEMO_VEHICLES } from '../data/demoVehicles';
import { getInitialMessages, type ChatMessage } from '../data/demoChats';
import type { ListingStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<ListingStackParamList, 'Chat'>;

export function ChatScreen({ route }: Props) {
  const { vehicleId } = route.params;
  const vehicle = DEMO_VEHICLES.find((v) => v.id === vehicleId) ?? DEMO_VEHICLES[0];
  const [messages, setMessages] = useState<ChatMessage[]>(() => getInitialMessages(vehicle));
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);

  function handleSend() {
    if (!draft.trim()) return;
    const message: ChatMessage = {
      id: `me-${messages.length}-${draft.length}`,
      sender: 'me',
      text: draft.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, message]);
    setDraft('');
  }

  return (
    <ScreenContainer>
      <View style={styles.ownerBar}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{vehicle.ownerName.charAt(0)}</Text>
        </View>
        <View>
          <Text style={styles.ownerName}>{vehicle.ownerName}</Text>
          <Text style={styles.ownerSub}>{vehicle.title}</Text>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        style={styles.flatList}
        contentContainerStyle={styles.messages}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View style={[styles.bubbleRow, item.sender === 'me' && styles.bubbleRowMe]}>
            <View style={[styles.bubble, item.sender === 'me' ? styles.bubbleMe : styles.bubbleOwner]}>
              <Text style={[styles.bubbleText, item.sender === 'me' && styles.bubbleTextMe]}>{item.text}</Text>
              <Text style={[styles.time, item.sender === 'me' && styles.timeMe]}>{item.time}</Text>
            </View>
          </View>
        )}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a message"
          placeholderTextColor={colors.textSecondary}
          value={draft}
          onChangeText={setDraft}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend} activeOpacity={0.85}>
          <Ionicons name="send" size={18} color={colors.white} />
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  ownerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontWeight: '800', fontSize: 16 },
  ownerName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  ownerSub: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  flatList: { flex: 1 },
  messages: { paddingVertical: 16, gap: 10 },
  bubbleRow: { flexDirection: 'row' },
  bubbleRowMe: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '78%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleOwner: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopLeftRadius: 4,
  },
  bubbleMe: { backgroundColor: colors.primary, borderTopRightRadius: 4 },
  bubbleText: { fontSize: 14, color: colors.textPrimary, lineHeight: 19 },
  bubbleTextMe: { color: colors.white },
  time: { fontSize: 10, color: colors.textSecondary, marginTop: 4, textAlign: 'right' },
  timeMe: { color: 'rgba(255,255,255,0.75)' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingTop: 10, paddingBottom: 4 },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
    maxHeight: 100,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
