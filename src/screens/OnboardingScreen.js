import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { C, rs, fs, FONTS } from '../constants/theme';
import { haptic } from '../utils/haptics';

const CRAFTS = [
  { id: 'crochet',  label: 'Crochet',  icon: 'color-filter-outline' },
  { id: 'knitting', label: 'Knitting', icon: 'git-network-outline' },
  { id: 'sewing',   label: 'Sewing',   icon: 'cut-outline' },
];

const LEVELS = [
  { id: 'beginner',     label: 'Just starting',  desc: 'New to making — show me the basics' },
  { id: 'intermediate', label: 'Some experience', desc: "I've made a few things" },
  { id: 'advanced',     label: 'Experienced',     desc: 'Comfortable with complex patterns' },
];

export default function OnboardingScreen({ user, onDone }) {
  const [step, setStep]     = useState(0);
  const [crafts, setCrafts] = useState([]);
  const [level, setLevel]   = useState(null);
  const [saving, setSaving] = useState(false);

  const toggleCraft = (id) => {
    haptic.selection();
    setCrafts(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const finish = async () => {
    setSaving(true);
    try {
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      const existing = snap.exists() ? snap.data() : {};
      await setDoc(ref, {
        ...existing,
        username: existing.username || user.email?.split('@')[0] || 'Maker',
        bio: existing.bio || '',
        avatar: existing.avatar || null,
        crafts,
        level,
        followers: existing.followers || [],
        following: existing.following || [],
        onboarded: true,
        createdAt: existing.createdAt || new Date().toISOString(),
      }, { merge: true });
      haptic.success();
    } catch (e) {}
    setSaving(false);
    onDone(level);
  };

  return (
    <View style={s.root}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: rs(24), justifyContent: 'center' }}>
        {step === 0 ? (
          <>
            <Text style={s.kicker}>Welcome to Purl</Text>
            <Text style={s.title}>What do you{'\n'}love to make?</Text>
            <Text style={s.sub}>Pick all that apply. We'll tailor patterns to your crafts.</Text>
            <View style={{ gap: rs(12), marginTop: rs(32) }}>
              {CRAFTS.map(c => {
                const active = crafts.includes(c.id);
                return (
                  <TouchableOpacity key={c.id} onPress={() => toggleCraft(c.id)} activeOpacity={0.85}
                    style={[s.optionCard, active && s.optionCardActive]}>
                    <View style={[s.optionIcon, { backgroundColor: active ? C.rose : C.bgMuted }]}>
                      <Ionicons name={c.icon} size={rs(22)} color={active ? C.white : C.slateMid} />
                    </View>
                    <Text style={[s.optionLabel, active && { color: C.rose }]}>{c.label}</Text>
                    {active && <Ionicons name="checkmark-circle" size={rs(22)} color={C.rose} />}
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity onPress={() => { haptic.light(); setStep(1); }}
              disabled={crafts.length === 0}
              style={[s.nextBtn, crafts.length === 0 && { opacity: 0.4 }]} activeOpacity={0.88}>
              <Text style={s.nextBtnText}>Continue</Text>
              <Ionicons name="arrow-forward" size={rs(18)} color={C.white} />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={s.kicker}>Almost there</Text>
            <Text style={s.title}>How much have{'\n'}you made before?</Text>
            <Text style={s.sub}>This helps us recommend the right patterns for you.</Text>
            <View style={{ gap: rs(12), marginTop: rs(32) }}>
              {LEVELS.map(l => {
                const active = level === l.id;
                return (
                  <TouchableOpacity key={l.id} onPress={() => { haptic.selection(); setLevel(l.id); }} activeOpacity={0.85}
                    style={[s.levelCard, active && s.optionCardActive]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.optionLabel, active && { color: C.rose }]}>{l.label}</Text>
                      <Text style={s.levelDesc}>{l.desc}</Text>
                    </View>
                    {active && <Ionicons name="checkmark-circle" size={rs(22)} color={C.rose} />}
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity onPress={finish} disabled={!level || saving}
              style={[s.nextBtn, (!level || saving) && { opacity: 0.4 }]} activeOpacity={0.88}>
              <Text style={s.nextBtnText}>{saving ? 'Setting up...' : 'Start crafting'}</Text>
              <Ionicons name="arrow-forward" size={rs(18)} color={C.white} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setStep(0)} style={{ alignItems: 'center', marginTop: rs(16) }}>
              <Text style={{ fontSize: fs(13), color: C.slateMid }}>Back</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:          { flex: 1, backgroundColor: C.bgPage },
  kicker:        { fontSize: fs(13), fontWeight: '700', color: C.rose, textTransform: 'uppercase', letterSpacing: 1, marginBottom: rs(8) },
  title:         { fontSize: fs(30), fontWeight: '800', color: C.slate, fontFamily: FONTS.heading, lineHeight: fs(38) },
  sub:           { fontSize: fs(14), color: C.slateMid, marginTop: rs(10), lineHeight: fs(21) },
  optionCard:    { flexDirection: 'row', alignItems: 'center', gap: rs(14), backgroundColor: C.bgCard, borderRadius: rs(16), padding: rs(16), borderWidth: 1.5, borderColor: C.border },
  optionCardActive: { borderColor: C.rose, backgroundColor: C.rosePale },
  optionIcon:    { width: rs(44), height: rs(44), borderRadius: rs(12), alignItems: 'center', justifyContent: 'center' },
  optionLabel:   { flex: 1, fontSize: fs(16), fontWeight: '700', color: C.slate },
  levelCard:     { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgCard, borderRadius: rs(16), padding: rs(16), borderWidth: 1.5, borderColor: C.border },
  levelDesc:     { fontSize: fs(13), color: C.slateMid, marginTop: rs(3) },
  nextBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: rs(8), backgroundColor: C.rose, borderRadius: rs(16), paddingVertical: rs(16), marginTop: rs(32) },
  nextBtnText:   { fontSize: fs(16), fontWeight: '800', color: C.white },
});