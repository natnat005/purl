import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, rs, fs } from '../constants/theme';
import { CLUBS } from '../data/patterns';
import ClubChatScreen from './ClubChatScreen';

export default function ClubsScreen({ joined, onToggle, user }) {
  const [filter, setFilter]     = useState('all');
  const [openClub, setOpenClub] = useState(null);

  if (openClub) {
    return (
      <ClubChatScreen
        club={openClub}
        user={user}
        onBack={() => setOpenClub(null)}
      />
    );
  }

  const filtered = filter === 'all'     ? CLUBS
    : filter === 'joined'               ? CLUBS.filter(c => joined.includes(c.id))
    : CLUBS.filter(c => c.crafts.includes(filter));

  const CRAFT_FILTERS = [
    { id: 'all',      label: 'All',      emoji: '✨' },
    { id: 'joined',   label: 'My clubs', emoji: '⭐' },
    { id: 'crochet',  label: 'Crochet',  emoji: '🪝' },
    { id: 'knitting', label: 'Knitting', emoji: '🧶' },
    { id: 'sewing',   label: 'Sewing',   emoji: '🧵' },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bgPage }}
      contentContainerStyle={{ padding: rs(16), paddingBottom: rs(40) }}
      showsVerticalScrollIndicator={false}>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={{ marginBottom: rs(20) }} contentContainerStyle={{ gap: rs(8) }}>
        {CRAFT_FILTERS.map(f => {
          const active = filter === f.id;
          return (
            <TouchableOpacity key={f.id} onPress={() => setFilter(f.id)} activeOpacity={0.8}
              style={[s.chip, active && s.chipActive]}>
              <Text style={s.chipEmoji}>{f.emoji}</Text>
              <Text style={[s.chipLabel, active && s.chipLabelActive]}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {filtered.length === 0 && (
        <View style={{ alignItems: 'center', paddingVertical: rs(40) }}>
          <Text style={{ fontSize: rs(40), marginBottom: rs(12) }}>🧶</Text>
          <Text style={s.emptyTitle}>No clubs joined yet</Text>
          <Text style={{ fontSize: fs(13), color: C.slateMid, textAlign: 'center' }}>
            Tap "All" to explore and join clubs
          </Text>
        </View>
      )}

      {filtered.map(club => {
        const isJoined = joined.includes(club.id);
        return (
          <View key={club.id} style={[s.card, isJoined && { borderColor: club.color, borderWidth: 1.5 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={[s.clubIcon, { backgroundColor: club.color + '20' }]}>
                <Text style={{ fontSize: fs(26) }}>{club.emoji}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: rs(14) }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs(8), marginBottom: rs(4) }}>
                  <Text style={{ fontSize: fs(15), fontWeight: '700', color: C.slate, flex: 1 }}>{club.name}</Text>
                  {isJoined && (
                    <View style={[s.joinedBadge, { backgroundColor: club.color }]}>
                      <Text style={{ fontSize: fs(9), color: C.white, fontWeight: '800' }}>JOINED</Text>
                    </View>
                  )}
                </View>
                <Text style={{ fontSize: fs(12), color: C.slateMid, lineHeight: fs(19), marginBottom: rs(12) }}>
                  {club.desc}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', gap: rs(8), alignItems: 'center' }}>
                    <View style={[s.tagPill, { backgroundColor: club.color + '18' }]}>
                      <Text style={[s.tagPillText, { color: club.color }]}>{club.tag}</Text>
                    </View>
                    <Text style={{ fontSize: fs(11), color: C.slateLight }}>
                      👥 {club.members.toLocaleString()}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: rs(8) }}>
                    {isJoined && (
                      <TouchableOpacity
                        onPress={() => setOpenClub(club)}
                        style={[s.chatBtn, { backgroundColor: club.color }]}
                        activeOpacity={0.85}>
                        <Ionicons name="chatbubble-outline" size={rs(14)} color={C.white} />
                        <Text style={{ fontSize: fs(12), color: C.white, fontWeight: '700' }}>Chat</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={() => {
                        if (isJoined) {
                          Alert.alert('Leave club?', `Leave "${club.name}"?`, [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Leave', style: 'destructive', onPress: () => onToggle(club.id) },
                          ]);
                        } else {
                          onToggle(club.id);
                        }
                      }}
                      activeOpacity={0.85}
                      style={[s.joinBtn, isJoined && { backgroundColor: club.color, borderColor: club.color }]}>
                      <Text style={[s.joinBtnText, isJoined && { color: C.white }]}>
                        {isJoined ? '✓' : 'Join'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: rs(6), marginTop: rs(10) }}>
                  {club.crafts.map(craft => (
                    <Text key={craft} style={{ fontSize: fs(11), color: C.slateLight }}>
                      {craft === 'crochet' ? '🪝' : craft === 'knitting' ? '🧶' : '🧵'} {craft}
                    </Text>
                  ))}
                </View>
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  title:        { fontSize: fs(24), fontWeight: '800', color: C.slate, marginBottom: rs(4) },
  chip:         { flexDirection: 'row', alignItems: 'center', gap: rs(5), paddingHorizontal: rs(12), paddingVertical: rs(7), borderRadius: rs(20), backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border },
  chipActive:   { backgroundColor: C.rosePale, borderColor: C.rose },
  chipEmoji:    { fontSize: fs(13) },
  chipLabel:    { fontSize: fs(12), fontWeight: '600', color: C.slateMid },
  chipLabelActive:{ color: C.roseDeep },
  card:         { backgroundColor: C.bgCard, borderRadius: rs(16), padding: rs(16), borderWidth: 1, borderColor: C.border, marginBottom: rs(12) },
  clubIcon:     { width: rs(54), height: rs(54), borderRadius: rs(16), alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  joinedBadge:  { borderRadius: rs(8), paddingHorizontal: rs(6), paddingVertical: rs(2) },
  tagPill:      { borderRadius: rs(8), paddingHorizontal: rs(8), paddingVertical: rs(3) },
  tagPillText:  { fontSize: fs(10), fontWeight: '700' },
  chatBtn:      { flexDirection: 'row', alignItems: 'center', gap: rs(4), borderRadius: rs(20), paddingHorizontal: rs(12), paddingVertical: rs(7) },
  joinBtn:      { borderRadius: rs(20), paddingHorizontal: rs(16), paddingVertical: rs(7), borderWidth: 1.5, borderColor: C.rose },
  joinBtnText:  { fontSize: fs(12), fontWeight: '700', color: C.rose },
  emptyTitle:   { fontSize: fs(18), fontWeight: '700', color: C.slate, marginBottom: rs(8) },
});