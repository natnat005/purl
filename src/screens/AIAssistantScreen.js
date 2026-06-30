import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, rs, fs } from '../constants/theme';

// ⚠️ Paste your Claude API key here
const CLAUDE_KEY = 'your_claude_api_key_here';

const SUGGESTIONS = [
  'What hook size for chunky yarn?',
  'How do I fix a dropped stitch?',
  'Best yarn for beginners?',
  'How do I read a crochet pattern?',
  'What\'s the difference between DK and worsted?',
  'How do I block a finished project?',
];

const SYSTEM_PROMPT = `You are a friendly and expert crafting assistant specialising in crochet, knitting, and sewing. 
You give clear, practical advice to crafters of all skill levels.
Keep responses concise but helpful. Use bullet points for steps.
When recommending yarn weights or hook/needle sizes, be specific.
If someone is a beginner, be extra encouraging and suggest starting simple.
You can help with: pattern reading, stitch techniques, yarn selection, fixing mistakes, 
blocking and finishing, tool recommendations, and project ideas.`;

export default function AIAssistantScreen() {
  const [messages, setMessages] = useState([
    {
      id: '0',
      role: 'assistant',
      text: 'Hi! I\'m your crafting assistant 🧶 Ask me anything about crochet, knitting, or sewing — patterns, stitches, yarn, tools, fixing mistakes. I\'m here to help!',
    },
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const flatRef = useRef(null);

  useEffect(() => {
    if (messages.length > 1) {
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const send = async (text) => {
    const q = text || input.trim();
    if (!q) return;
    setInput('');

    const userMsg = { id: Date.now().toString(), role: 'user', text: q };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    // No API key set yet — show a friendly note instead of erroring
    if (!CLAUDE_KEY || CLAUDE_KEY === 'your_claude_api_key_here') {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: "The AI assistant isn't switched on yet! Once an API key is added it'll be able to answer all your crochet, knitting, and sewing questions. In the meantime, try the Learn & Guides section or the video tutorials on any pattern.",
        }]);
        setLoading(false);
      }, 400);
      return;
    }

    try {
      const history = messages
        .filter(m => m.role !== 'assistant' || m.id !== '0')
        .map(m => ({ role: m.role, content: m.text }));

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: [...history, { role: 'user', content: q }],
        }),
      });

      const data = await res.json();
      const reply = data.content?.[0]?.text || 'Sorry, I couldn\'t get a response. Try again!';

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: reply,
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: 'Connection error — please check your internet and try again.',
      }]);
    }
    setLoading(false);
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[s.msgRow, isUser && s.msgRowUser]}>
        {!isUser && (
          <View style={s.avatar}>
            <Text style={{ fontSize: fs(14) }}>🧶</Text>
          </View>
        )}
        <View style={[s.bubble, isUser ? s.bubbleUser : s.bubbleAssistant]}>
          <Text style={[s.bubbleText, isUser && s.bubbleTextUser]}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bgPage }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={rs(90)}>

        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={m => m.id}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: rs(16), paddingBottom: rs(8) }}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            loading ? (
              <View style={[s.msgRow]}>
                <View style={s.avatar}><Text style={{ fontSize: fs(14) }}>🧶</Text></View>
                <View style={s.bubbleAssistant}>
                  <ActivityIndicator size="small" color={C.rose} />
                </View>
              </View>
            ) : null
          }
        />

        {/* Suggestions */}
        {messages.length === 1 && (
          <View style={{ paddingHorizontal: rs(16), marginBottom: rs(8) }}>
            <Text style={{ fontSize: fs(11), color: C.slateMid, marginBottom: rs(8), fontWeight: '600' }}>
              Try asking:
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: rs(6) }}>
              {SUGGESTIONS.map(s => (
                <TouchableOpacity key={s} onPress={() => send(s)} activeOpacity={0.8}
                  style={st.suggestion}>
                  <Text style={st.suggestionText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Input */}
        <View style={s.inputRow}>
          <TextInput
            style={s.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask anything about crafting..."
            placeholderTextColor={C.slateLight}
            multiline
            maxLength={500}
            onSubmitEditing={() => send()}
          />
          <TouchableOpacity
            onPress={() => send()}
            disabled={!input.trim() || loading}
            style={[s.sendBtn, (!input.trim() || loading) && { opacity: 0.4 }]}
            activeOpacity={0.85}>
            <Ionicons name="send" size={rs(18)} color={C.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  msgRow:           { flexDirection: 'row', marginBottom: rs(14), alignItems: 'flex-end', gap: rs(8) },
  msgRowUser:       { flexDirection: 'row-reverse' },
  avatar:           { width: rs(32), height: rs(32), borderRadius: rs(16), backgroundColor: C.rosePale, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  bubble:           { maxWidth: '75%', borderRadius: rs(16), padding: rs(12) },
  bubbleAssistant:  { backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border, borderBottomLeftRadius: rs(4) },
  bubbleUser:       { backgroundColor: C.rose, borderBottomRightRadius: rs(4) },
  bubbleText:       { fontSize: fs(14), color: C.slate, lineHeight: fs(22) },
  bubbleTextUser:   { color: C.white },
  inputRow:         { flexDirection: 'row', alignItems: 'flex-end', gap: rs(10), padding: rs(12), borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.bgCard },
  input:            { flex: 1, backgroundColor: C.bgMuted, borderRadius: rs(20), paddingHorizontal: rs(16), paddingVertical: rs(10), fontSize: fs(14), color: C.slate, maxHeight: rs(100) },
  sendBtn:          { width: rs(40), height: rs(40), borderRadius: rs(20), backgroundColor: C.rose, alignItems: 'center', justifyContent: 'center' },
});

const st = StyleSheet.create({
  suggestion:     { backgroundColor: C.bgCard, borderRadius: rs(16), paddingHorizontal: rs(10), paddingVertical: rs(6), borderWidth: 1, borderColor: C.border },
  suggestionText: { fontSize: fs(11), color: C.rose, fontWeight: '600' },
});