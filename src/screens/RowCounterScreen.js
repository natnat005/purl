import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Modal, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { C, rs, fs, FONTS } from '../constants/theme';
import { haptic } from '../utils/haptics';

export default function RowCounterScreen() {
  const [counters, setCounters] = useState([]);
  const [addOpen, setAddOpen]   = useState(false);
  const [newName, setNewName]   = useState('');

  useEffect(() => {
    AsyncStorage.getItem('rowCounters').then(r => {
      if (r) setCounters(JSON.parse(r));
      else setCounters([{ id: '1', name: 'My Counter', count: 0, target: null }]);
    }).catch(() => setCounters([{ id: '1', name: 'My Counter', count: 0, target: null }]));
  }, []);

  const persist = (updated) => {
    setCounters(updated);
    AsyncStorage.setItem('rowCounters', JSON.stringify(updated)).catch(() => {});
  };

  const increment = (id) => { haptic.medium(); persist(counters.map(c => c.id===id ? { ...c, count: c.count+1 } : c)); };
  const decrement = (id) => { haptic.light();  persist(counters.map(c => c.id===id ? { ...c, count: Math.max(0, c.count-1) } : c)); };
  const reset = (id) => Alert.alert('Reset counter?', 'Set back to zero?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Reset', style: 'destructive', onPress: () => { haptic.success(); persist(counters.map(c => c.id===id ? { ...c, count: 0 } : c)); } },
  ]);
  const removeCounter = (id) => Alert.alert('Delete counter?', '', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: () => persist(counters.filter(c => c.id !== id)) },
  ]);
  const addCounter = () => {
    if (!newName.trim()) { Alert.alert('Name your counter'); return; }
    persist([...counters, { id: Date.now().toString(), name: newName.trim(), count: 0, target: null }]);
    setNewName(''); setAddOpen(false); haptic.success();
  };
  const setTarget = (id, target) => persist(counters.map(c => c.id===id ? { ...c, target } : c));

  return (
    <View style={{ flex: 1, backgroundColor: C.bgPage }}>
      <View style={s.header}>
        <Text style={s.title}>Row Counter</Text>
        <TouchableOpacity onPress={() => { haptic.light(); setAddOpen(true); }} style={s.addBtn} activeOpacity={0.85}>
          <Ionicons name="add" size={rs(20)} color={C.white} />
          <Text style={s.addBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: rs(16), paddingBottom: rs(40) }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {counters.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: rs(50), paddingHorizontal: rs(24) }}>
            <Ionicons name="add-circle-outline" size={rs(48)} color={C.slateLight} style={{ marginBottom: rs(16) }} />
            <Text style={{ fontSize: fs(18), fontWeight: '800', color: C.slate, marginBottom: rs(8) }}>No counters yet</Text>
            <Text style={{ fontSize: fs(14), color: C.slateMid, textAlign: 'center', lineHeight: fs(21), marginBottom: rs(20) }}>
              Create a counter to keep track of your rows and pattern repeats so you never lose your place.
            </Text>
            <TouchableOpacity onPress={() => { haptic.light(); setAddOpen(true); }}
              style={[s.addBtn, { paddingHorizontal: rs(24) }]} activeOpacity={0.85}>
              <Ionicons name="add" size={rs(20)} color={C.white} />
              <Text style={s.addBtnText}>Create your first counter</Text>
            </TouchableOpacity>
          </View>
        )}
        {counters.map(c => (
          <View key={c.id} style={s.counterCard}>
            <View style={s.counterTop}>
              <Text style={s.counterName} numberOfLines={1}>{c.name}</Text>
              <View style={{ flexDirection: 'row', gap: rs(4) }}>
                <TouchableOpacity onPress={() => reset(c.id)} style={s.smallBtn} hitSlop={{ top:8, bottom:8, left:8, right:8 }}>
                  <Ionicons name="refresh" size={rs(16)} color={C.slateMid} />
                </TouchableOpacity>
                {counters.length > 1 && (
                  <TouchableOpacity onPress={() => removeCounter(c.id)} style={s.smallBtn} hitSlop={{ top:8, bottom:8, left:8, right:8 }}>
                    <Ionicons name="trash-outline" size={rs(16)} color={C.slateLight} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={s.countRow}>
              <TouchableOpacity onPress={() => decrement(c.id)} style={s.minusBtn} activeOpacity={0.7}>
                <Ionicons name="remove" size={rs(28)} color={C.rose} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => increment(c.id)} activeOpacity={0.85} style={s.countDisplay}>
                <Text style={s.countNumber}>{c.count}</Text>
                {c.target ? <Text style={s.countTarget}>of {c.target}</Text> : <Text style={s.tapHint}>tap to count</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => increment(c.id)} style={s.plusBtn} activeOpacity={0.7}>
                <Ionicons name="add" size={rs(28)} color={C.white} />
              </TouchableOpacity>
            </View>

            {c.target ? (
              <View style={s.progressBarBg}>
                <View style={[s.progressBarFill, { width: `${Math.min(100, (c.count / c.target) * 100)}%` }]} />
              </View>
            ) : null}

            <View style={s.targetRow}>
              <Text style={s.targetLabel}>Goal:</Text>
              <TextInput style={s.targetInput}
                value={c.target ? String(c.target) : ''}
                onChangeText={txt => { const n = parseInt(txt); setTarget(c.id, isNaN(n) ? null : n); }}
                keyboardType="numeric" placeholder="none" placeholderTextColor={C.slateLight} returnKeyType="done" />
              <Text style={s.targetHint}>rows</Text>
            </View>
          </View>
        ))}

        {counters.length > 0 && (
          <View style={s.tipCard}>
            <Text style={s.tipText}>💡 Tap the big number or + to count up. Use multiple counters to track rows and pattern repeats at once. Saves automatically.</Text>
          </View>
        )}
      </ScrollView>

      <Modal visible={addOpen} transparent animationType="fade" onRequestClose={() => setAddOpen(false)}>
        <View style={s.overlay}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>New Counter</Text>
            <TextInput style={s.modalInput} value={newName} onChangeText={setNewName}
              placeholder="e.g. Sleeve rows, Pattern repeat" placeholderTextColor={C.slateLight}
              autoFocus returnKeyType="done" onSubmitEditing={addCounter} />
            <View style={{ flexDirection: 'row', gap: rs(10), marginTop: rs(16) }}>
              <TouchableOpacity onPress={() => { setAddOpen(false); setNewName(''); }} style={[s.modalBtn, { backgroundColor: C.bgMuted }]}>
                <Text style={{ fontSize: fs(14), fontWeight: '700', color: C.slate }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addCounter} style={[s.modalBtn, { backgroundColor: C.rose }]}>
                <Text style={{ fontSize: fs(14), fontWeight: '700', color: C.white }}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: rs(16), paddingVertical: rs(14) },
  title:         { fontSize: fs(26), fontWeight: '800', color: C.slate, fontFamily: FONTS.heading },
  addBtn:        { flexDirection: 'row', alignItems: 'center', gap: rs(6), backgroundColor: C.rose, borderRadius: rs(20), paddingHorizontal: rs(16), paddingVertical: rs(8) },
  addBtnText:    { fontSize: fs(13), fontWeight: '700', color: C.white },
  counterCard:   { backgroundColor: C.bgCard, borderRadius: rs(20), padding: rs(20), marginBottom: rs(16), borderWidth: 1, borderColor: C.border, shadowColor: '#000', shadowOffset: { width:0, height:2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  counterTop:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: rs(16) },
  counterName:   { fontSize: fs(16), fontWeight: '700', color: C.slate, flex: 1 },
  smallBtn:      { width: rs(32), height: rs(32), borderRadius: rs(16), backgroundColor: C.bgMuted, alignItems: 'center', justifyContent: 'center' },
  countRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: rs(12) },
  minusBtn:      { width: rs(56), height: rs(56), borderRadius: rs(28), backgroundColor: C.rosePale, alignItems: 'center', justifyContent: 'center' },
  plusBtn:       { width: rs(56), height: rs(56), borderRadius: rs(28), backgroundColor: C.rose, alignItems: 'center', justifyContent: 'center' },
  countDisplay:  { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bgMuted, borderRadius: rs(16), paddingVertical: rs(16) },
  countNumber:   { fontSize: fs(48), fontWeight: '800', color: C.slate, fontFamily: FONTS.heading },
  countTarget:   { fontSize: fs(13), color: C.slateMid, marginTop: rs(-4) },
  tapHint:       { fontSize: fs(11), color: C.slateLight, marginTop: rs(2) },
  progressBarBg: { height: rs(6), backgroundColor: C.bgMuted, borderRadius: rs(3), marginTop: rs(16), overflow: 'hidden' },
  progressBarFill:{ height: '100%', backgroundColor: C.sage, borderRadius: rs(3) },
  targetRow:     { flexDirection: 'row', alignItems: 'center', gap: rs(8), marginTop: rs(16) },
  targetLabel:   { fontSize: fs(13), color: C.slateMid, fontWeight: '600' },
  targetInput:   { backgroundColor: C.bgMuted, borderRadius: rs(8), paddingHorizontal: rs(12), paddingVertical: rs(6), fontSize: fs(14), color: C.slate, minWidth: rs(70), textAlign: 'center', borderWidth: 1, borderColor: C.border },
  targetHint:    { fontSize: fs(13), color: C.slateMid },
  tipCard:       { backgroundColor: C.amberPale, borderRadius: rs(12), padding: rs(14) },
  tipText:       { fontSize: fs(13), color: C.amberDeep, lineHeight: fs(20) },
  overlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: rs(32) },
  modal:         { backgroundColor: C.bgCard, borderRadius: rs(20), padding: rs(24), width: '100%' },
  modalTitle:    { fontSize: fs(18), fontWeight: '800', color: C.slate, marginBottom: rs(16), fontFamily: FONTS.heading },
  modalInput:    { backgroundColor: C.bgMuted, borderRadius: rs(12), paddingHorizontal: rs(14), paddingVertical: rs(12), fontSize: fs(15), color: C.slate, borderWidth: 1, borderColor: C.border },
  modalBtn:      { flex: 1, borderRadius: rs(12), paddingVertical: rs(12), alignItems: 'center' },
});