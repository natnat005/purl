import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  collection, addDoc, onSnapshot, orderBy,
  query, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { C, rs, fs } from '../constants/theme';

export default function ClubChatScreen({ club, user, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [sending, setSending]   = useState(false);
  const flatRef = useRef(null);

  useEffect(() => {
    const q = query(
      collection(db, 'clubs', club.id, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, snap => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMessages(msgs);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    });
    return unsub;
  }, [club.id]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    setSending(true);
    try {
      await addDoc(collection(db, 'clubs', club.id, 'messages'), {
        text,
        userId:   user.uid,
        username: user.email?.split('@')[0] || 'Maker',
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      Alert.alert('Error', 'Could not send message. Try again.');
      setInput(text);
    }
    setSending(false);
  };

  const renderMessage = ({ item }) => {
    const isMe = item.userId === user.uid;
    const time = item.createdAt?.toDate?.()?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) || '';
    return (
      <View style={[s.row, isMe && s.rowMe]}>
        {!isMe && (
          <View style={[s.avatar, { backgroundColor: club.color + '30' }]}>
            <Text style={{ fontSize: fs(12), fontWeight: '700', color: club.color }}>
              {item.username?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
        )}
        <View style={{ maxWidth: '75%' }}>
          {!isMe && (
            <Text style={s.username}>{item.username}</Text>
          )}
          <View style={[s.bubble, isMe ? [s.bubbleMe, { backgroundColor: club.color }] : s.bubbleThem]}>
            <Text style={[s.bubbleText, isMe && { color: C.white }]}>{item.text}</Text>
          </View>
          <Text style={[s.time, isMe && { textAlign: 'right' }]}>{time}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bgPage }}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: club.color }]}>
        <TouchableOpacity onPress={onBack} style={{ padding: rs(4) }}>
          <Ionicons name="arrow-back" size={rs(22)} color={C.white} />
        </TouchableOpacity>
        <Text style={{ fontSize: fs(20) }}>{club.emoji}</Text>
        <View style={{ flex: 1, marginLeft: rs(8) }}>
          <Text style={s.headerTitle}>{club.name}</Text>
          <Text style={s.headerSub}>{club.members.toLocaleString()} members</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={rs(0)}>

        {messages.length === 0 ? (
          <View style={s.empty}>
            <Text style={{ fontSize: rs(40), marginBottom: rs(12) }}>{club.emoji}</Text>
            <Text style={s.emptyTitle}>Start the conversation!</Text>
            <Text style={s.emptySub}>Be the first to post in {club.name}</Text>
          </View>
        ) : (
          <FlatList
            ref={flatRef}
            data={messages}
            keyExtractor={m => m.id}
            renderItem={renderMessage}
            contentContainerStyle={{ padding: rs(16), paddingBottom: rs(8) }}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Input */}
        <View style={s.inputRow}>
          <TextInput
            style={s.input}
            value={input}
            onChangeText={setInput}
            placeholder={`Message ${club.name}...`}
            placeholderTextColor={C.slateLight}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={send}
            disabled={!input.trim() || sending}
            style={[s.sendBtn, { backgroundColor: club.color }, (!input.trim() || sending) && { opacity: 0.4 }]}
            activeOpacity={0.85}>
            <Ionicons name="send" size={rs(18)} color={C.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  header:       { flexDirection: 'row', alignItems: 'center', gap: rs(10), padding: rs(16), paddingTop: rs(52) },
  headerTitle:  { fontSize: fs(16), fontWeight: '700', color: C.white },
  headerSub:    { fontSize: fs(11), color: 'rgba(255,255,255,0.75)' },
  empty:        { flex: 1, alignItems: 'center', justifyContent: 'center', padding: rs(32) },
  emptyTitle:   { fontSize: fs(18), fontWeight: '700', color: C.slate, marginBottom: rs(6) },
  emptySub:     { fontSize: fs(13), color: C.slateMid, textAlign: 'center' },
  row:          { flexDirection: 'row', marginBottom: rs(12), alignItems: 'flex-end', gap: rs(8) },
  rowMe:        { flexDirection: 'row-reverse' },
  avatar:       { width: rs(32), height: rs(32), borderRadius: rs(16), alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  username:     { fontSize: fs(11), color: C.slateMid, fontWeight: '600', marginBottom: rs(3), marginLeft: rs(4) },
  bubble:       { borderRadius: rs(16), padding: rs(10), paddingHorizontal: rs(14) },
  bubbleThem:   { backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border, borderBottomLeftRadius: rs(4) },
  bubbleMe:     { borderBottomRightRadius: rs(4) },
  bubbleText:   { fontSize: fs(14), color: C.slate, lineHeight: fs(21) },
  time:         { fontSize: fs(10), color: C.slateLight, marginTop: rs(3), marginHorizontal: rs(4) },
  inputRow:     { flexDirection: 'row', alignItems: 'flex-end', gap: rs(10), padding: rs(12), borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.bgCard },
  input:        { flex: 1, backgroundColor: C.bgMuted, borderRadius: rs(20), paddingHorizontal: rs(16), paddingVertical: rs(10), fontSize: fs(14), color: C.slate, maxHeight: rs(100) },
  sendBtn:      { width: rs(40), height: rs(40), borderRadius: rs(20), alignItems: 'center', justifyContent: 'center' },
});