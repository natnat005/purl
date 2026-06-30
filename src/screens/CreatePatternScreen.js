import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { C, rs, fs, FONTS } from '../constants/theme';
import { haptic } from '../utils/haptics';
import { CRAFT_ICONS, DIFF_ICONS } from '../utils/icons';

const CRAFTS = [
  { id: 'crochet',  label: 'Crochet',  color: C.rose },
  { id: 'knitting', label: 'Knitting', color: C.lavender },
  { id: 'sewing',   label: 'Sewing',   color: C.teal },
];

const LEVELS = [
  { id: 'beginner',     label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced',     label: 'Advanced' },
];

export default function CreatePatternScreen({ onDone, onCancel }) {
  const [name, setName]         = useState('');
  const [desc, setDesc]         = useState('');
  const [type, setType]         = useState(null);
  const [cat, setCat]           = useState(null);
  const [time, setTime]         = useState('');
  const [materials, setMaterials] = useState([{ id: 'm1', text: '' }]);
  const [steps, setSteps]       = useState([{ id: 's1', text: '' }]);
  const [saving, setSaving]     = useState(false);

  // Validation: name, desc, type, cat are required. At least 1 non-empty material and 1 non-empty step.
  const validMaterials = materials.filter(m => m.text.trim()).length;
  const validSteps     = steps.filter(s => s.text.trim()).length;
  const valid = name.trim() && desc.trim() && type && cat && validMaterials > 0 && validSteps > 0;

  const updateMaterial = (id, text) =>
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, text } : m));
  const addMaterial = () => {
    haptic.light();
    setMaterials(prev => [...prev, { id: 'm' + Date.now(), text: '' }]);
  };
  const removeMaterial = (id) => {
    if (materials.length === 1) return; // always keep at least one
    haptic.light();
    setMaterials(prev => prev.filter(m => m.id !== id));
  };

  const updateStep = (id, text) =>
    setSteps(prev => prev.map(s => s.id === id ? { ...s, text } : s));
  const addStep = () => {
    haptic.light();
    setSteps(prev => [...prev, { id: 's' + Date.now(), text: '' }]);
  };
  const removeStep = (id) => {
    if (steps.length === 1) return;
    haptic.light();
    setSteps(prev => prev.filter(s => s.id !== id));
  };

  const save = async () => {
    if (!valid) {
      Alert.alert(
        'Almost there',
        'Please fill in the pattern name, description, craft, difficulty, and at least one material and one step.'
      );
      return;
    }
    setSaving(true);
    try {
      const id = 'u_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
      await setDoc(doc(db, 'patterns', id), {
        id,
        name: name.trim(),
        desc: desc.trim(),
        type,
        cat,
        time: time.trim() || '—',
        // Materials/steps as arrays so the detail view can render them numbered
        materials: materials.filter(m => m.text.trim()).map(m => m.text.trim()),
        steps: steps.filter(s => s.text.trim()).map(s => s.text.trim()),
        tag: 'Community',
        tagColor: '#7A6AAA',
        createdBy: auth.currentUser?.uid || null,
        createdByName: auth.currentUser?.email?.split('@')[0] || 'Maker',
        createdAt: serverTimestamp(),
      });
      haptic.success();
      Alert.alert('Posted', 'Your pattern is now in the community library.');
      onDone && onDone();
    } catch (e) {
      Alert.alert('Could not save', e.message);
    }
    setSaving(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bgPage }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={onCancel}>
          <Text style={{ fontSize: fs(15), color: C.slateMid }}>Cancel</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Share a Pattern</Text>
        <TouchableOpacity onPress={save} disabled={!valid || saving}>
          <Text style={[{ fontSize: fs(15), fontWeight: '700' }, (!valid || saving) ? { color: C.slateLight } : { color: C.rose }]}>
            {saving ? 'Posting…' : 'Post'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: rs(16), paddingBottom: rs(80) }}
        keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Name */}
        <Text style={s.label}>Pattern name</Text>
        <TextInput style={s.input} value={name} onChangeText={setName}
          placeholder="e.g. Cozy Cabin Socks" placeholderTextColor={C.slateLight} maxLength={50} />

        {/* What is it */}
        <Text style={s.label}>Description</Text>
        <TextInput style={[s.input, { height: rs(90), textAlignVertical: 'top' }]}
          value={desc} onChangeText={setDesc} multiline maxLength={400}
          placeholder="Describe the project — what it makes, what makes it special, who it's for..."
          placeholderTextColor={C.slateLight} />

        {/* Craft type */}
        <Text style={s.label}>Craft</Text>
        <View style={s.chipRow}>
          {CRAFTS.map(c => (
            <TouchableOpacity key={c.id}
              onPress={() => { haptic.selection(); setType(c.id); }}
              style={[s.chip, type === c.id && { backgroundColor: c.color, borderColor: c.color }]}
              activeOpacity={0.85}>
              <Ionicons
                name={CRAFT_ICONS[c.id]}
                size={rs(16)}
                color={type === c.id ? C.white : c.color}
              />
              <Text style={[s.chipText, type === c.id && { color: C.white, fontWeight: '700' }]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Difficulty */}
        <Text style={s.label}>Difficulty</Text>
        <View style={s.chipRow}>
          {LEVELS.map(l => (
            <TouchableOpacity key={l.id}
              onPress={() => { haptic.selection(); setCat(l.id); }}
              style={[s.chip, cat === l.id && { backgroundColor: C.rose, borderColor: C.rose }]}
              activeOpacity={0.85}>
              <Ionicons
                name={DIFF_ICONS[l.id]}
                size={rs(14)}
                color={cat === l.id ? C.white : C.rose}
              />
              <Text style={[s.chipText, cat === l.id && { color: C.white, fontWeight: '700' }]}>
                {l.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Time */}
        <Text style={s.label}>Estimated time (optional)</Text>
        <TextInput style={s.input} value={time} onChangeText={setTime}
          placeholder="e.g. 3–4 hrs, one weekend, etc." placeholderTextColor={C.slateLight} maxLength={30} />

        {/* Materials */}
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Materials</Text>
          <TouchableOpacity onPress={addMaterial} style={s.addBtn} activeOpacity={0.7}>
            <Ionicons name="add" size={rs(16)} color={C.rose} />
            <Text style={s.addBtnText}>Add material</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.sectionHint}>
          List everything someone will need. One material per line.
        </Text>
        {materials.map((m, idx) => (
          <View key={m.id} style={s.listRow}>
            <View style={s.listBullet}>
              <Ionicons name="ellipse" size={rs(6)} color={C.slateMid} />
            </View>
            <TextInput
              style={[s.input, s.listInput]}
              value={m.text}
              onChangeText={t => updateMaterial(m.id, t)}
              placeholder={
                idx === 0 ? 'e.g. Worsted weight yarn, 200 yards' :
                idx === 1 ? 'e.g. 5.0mm crochet hook' :
                'Another material'
              }
              placeholderTextColor={C.slateLight}
              maxLength={150}
            />
            {materials.length > 1 && (
              <TouchableOpacity onPress={() => removeMaterial(m.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={s.removeBtn} activeOpacity={0.7}>
                <Ionicons name="close-circle" size={rs(20)} color={C.slateLight} />
              </TouchableOpacity>
            )}
          </View>
        ))}

        {/* Steps */}
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Steps</Text>
          <TouchableOpacity onPress={addStep} style={s.addBtn} activeOpacity={0.7}>
            <Ionicons name="add" size={rs(16)} color={C.rose} />
            <Text style={s.addBtnText}>Add step</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.sectionHint}>
          Walk through the pattern one step at a time. Be specific — what stitches, how many, what comes next.
        </Text>
        {steps.map((st, idx) => (
          <View key={st.id} style={s.listRow}>
            <View style={s.stepNum}>
              <Text style={s.stepNumText}>{idx + 1}</Text>
            </View>
            <TextInput
              style={[s.input, s.listInput, { minHeight: rs(60), textAlignVertical: 'top' }]}
              value={st.text}
              onChangeText={t => updateStep(st.id, t)}
              multiline
              placeholder={
                idx === 0 ? 'e.g. Make a slip knot and chain 30 stitches' :
                idx === 1 ? 'e.g. Single crochet across, turn (29 sts)' :
                'Describe this step…'
              }
              placeholderTextColor={C.slateLight}
              maxLength={500}
            />
            {steps.length > 1 && (
              <TouchableOpacity onPress={() => removeStep(st.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={s.removeBtn} activeOpacity={0.7}>
                <Ionicons name="close-circle" size={rs(20)} color={C.slateLight} />
              </TouchableOpacity>
            )}
          </View>
        ))}

        {/* Tip */}
        <View style={s.tipCard}>
          <Ionicons name="information-circle-outline" size={rs(18)} color={C.lavender} />
          <Text style={s.tipText}>
            Your pattern will appear in the Library with a Community tag. You can edit or delete it anytime from your profile.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: rs(16), paddingVertical: rs(14), borderBottomWidth: 1, borderBottomColor: C.border },
  headerTitle:   { fontSize: fs(16), fontWeight: '800', color: C.slate, fontFamily: FONTS.heading },

  label:         { fontSize: fs(12), fontWeight: '700', color: C.slateMid, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: rs(8), marginTop: rs(18) },
  input:         { backgroundColor: C.bgCard, borderRadius: rs(12), borderWidth: 1, borderColor: C.border, paddingHorizontal: rs(14), paddingVertical: rs(12), fontSize: fs(15), color: C.slate },
  chipRow:       { flexDirection: 'row', gap: rs(8), flexWrap: 'wrap' },
  chip:          { flexDirection: 'row', alignItems: 'center', gap: rs(6), paddingHorizontal: rs(14), paddingVertical: rs(10), borderRadius: rs(20), backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border },
  chipText:      { fontSize: fs(13), color: C.slate, fontWeight: '600' },

  sectionRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: rs(24), marginBottom: rs(4) },
  sectionTitle:  { fontSize: fs(15), fontWeight: '800', color: C.slate },
  sectionHint:   { fontSize: fs(12), color: C.slateMid, marginBottom: rs(12), lineHeight: fs(17) },
  addBtn:        { flexDirection: 'row', alignItems: 'center', gap: rs(4), paddingVertical: rs(6), paddingHorizontal: rs(10), borderRadius: rs(8), backgroundColor: C.rose + '15' },
  addBtnText:    { fontSize: fs(12), fontWeight: '700', color: C.rose },

  listRow:       { flexDirection: 'row', alignItems: 'flex-start', gap: rs(8), marginBottom: rs(8) },
  listBullet:    { width: rs(24), height: rs(42), alignItems: 'center', justifyContent: 'center' },
  listInput:     { flex: 1 },
  stepNum:       { width: rs(28), height: rs(28), borderRadius: rs(14), backgroundColor: C.rose + '20', alignItems: 'center', justifyContent: 'center', marginTop: rs(8) },
  stepNumText:   { fontSize: fs(12), fontWeight: '800', color: C.rose },
  removeBtn:     { padding: rs(8), marginTop: rs(4) },

  tipCard:       { flexDirection: 'row', gap: rs(10), backgroundColor: C.lavender + '15', borderRadius: rs(12), padding: rs(14), marginTop: rs(28) },
  tipText:       { flex: 1, fontSize: fs(12), color: C.slate, lineHeight: fs(18) },
});