import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { C, rs, fs, FONTS } from '../constants/theme';
import { haptic } from '../utils/haptics';
import FeedScreen from './FeedScreen';
import ClubsScreen from './ClubsScreen';

export default function CommunityScreen({ user, joined, onToggleClub }) {
  const [view, setView] = useState('feed');

  return (
    <View style={{ flex: 1, backgroundColor: C.bgPage }}>
      {/* Toggle header */}
      <View style={s.header}>
        <Text style={s.title}>Community</Text>
        <View style={s.toggle}>
          <TouchableOpacity onPress={() => { setView('feed'); haptic.selection(); }}
            style={[s.toggleBtn, view === 'feed' && s.toggleBtnActive]} activeOpacity={0.8}>
            <Text style={[s.toggleText, view === 'feed' && s.toggleTextActive]}>Feed</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setView('clubs'); haptic.selection(); }}
            style={[s.toggleBtn, view === 'clubs' && s.toggleBtnActive]} activeOpacity={0.8}>
            <Text style={[s.toggleText, view === 'clubs' && s.toggleTextActive]}>Clubs</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content — both stay mounted, toggle visibility */}
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1, display: view === 'feed' ? 'flex' : 'none' }}>
          <FeedScreen user={user} hideHeader />
        </View>
        <View style={{ flex: 1, display: view === 'clubs' ? 'flex' : 'none' }}>
          <ClubsScreen joined={joined} onToggle={onToggleClub} user={user} />
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header:          { paddingHorizontal: rs(16), paddingTop: rs(14), paddingBottom: rs(10), borderBottomWidth: 1, borderBottomColor: C.border + '60' },
  title:           { fontSize: fs(26), fontWeight: '800', color: C.slate, fontFamily: FONTS.heading, marginBottom: rs(12) },
  toggle:          { flexDirection: 'row', backgroundColor: C.bgMuted, borderRadius: rs(12), padding: rs(4), gap: rs(4) },
  toggleBtn:       { flex: 1, borderRadius: rs(10), paddingVertical: rs(9), alignItems: 'center' },
  toggleBtnActive: { backgroundColor: C.bgCard, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  toggleText:      { fontSize: fs(14), fontWeight: '600', color: C.slateMid },
  toggleTextActive:{ color: C.rose, fontWeight: '700' },
});