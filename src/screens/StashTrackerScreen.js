import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Modal, Alert, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { C, rs, fs, FONTS } from '../constants/theme';
import { haptic } from '../utils/haptics';

const WEIGHTS = ['Lace','Fingering','Sport','DK','Worsted','Aran','Bulky','Super Bulky'];
const FIBRES  = ['Wool','Merino','Alpaca','Cotton','Acrylic','Linen','Silk','Bamboo','Mohair','Cashmere','Blend'];
const COLOURS = ['#E8B4B8','#F7D6D0','#A8C5A0','#C5D5A8','#B4C5E8','#D4B4E8','#F5E6A0','#E8D4A0','#B4D4D4','#E8C4A0','#D4D4D4','#8B7355','#C04A5A','#5A8B5A','#5A6B8B'];

function AddYarnModal({ visible, onClose, onSave, editing }) {
  const [brand,  setBrand]  = useState('');
  const [name,   setName]   = useState('');
  const [weight, setWeight] = useState('Worsted');
  const [fibre,  setFibre]  = useState('Wool');
  const [colour, setColour] = useState(COLOURS[0]);
  const [skeins, setSkeins] = useState('1');
  const [grams,  setGrams]  = useState('100');
  const [notes,  setNotes]  = useState('');

  useEffect(() => {
    if (editing) {
      setBrand(editing.brand||''); setName(editing.name||'');
      setWeight(editing.weight||'Worsted'); setFibre(editing.fibre||'Wool');
      setColour(editing.colour||COLOURS[0]); setSkeins(String(editing.skeins||1));
      setGrams(String(editing.grams||100)); setNotes(editing.notes||'');
    } else {
      setBrand(''); setName(''); setWeight('Worsted'); setFibre('Wool');
      setColour(COLOURS[0]); setSkeins('1'); setGrams('100'); setNotes('');
    }
  }, [editing, visible]);

  const save = () => {
    if (!name.trim()) { Alert.alert('Add a yarn name'); return; }
    onSave({ id: editing?.id||Date.now().toString(), brand: brand.trim(), name: name.trim(), weight, fibre, colour, skeins: parseInt(skeins)||1, grams: parseInt(grams)||100, notes: notes.trim(), addedAt: editing?.addedAt||new Date().toISOString() });
    haptic.success(); onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: C.bgPage }}>
        <View style={s.sheetHeader}>
          <TouchableOpacity onPress={onClose}><Text style={{ fontSize: fs(15), color: C.slateMid }}>Cancel</Text></TouchableOpacity>
          <Text style={s.sheetTitle}>{editing ? 'Edit Yarn' : 'Add to Stash'}</Text>
          <TouchableOpacity onPress={save}><Text style={{ fontSize: fs(15), color: C.rose, fontWeight: '700' }}>Save</Text></TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{ padding: rs(16) }} showsVerticalScrollIndicator={false}>

          <Text style={s.label}>Colour</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs(12), marginBottom: rs(12) }}>
            <View style={{ width: rs(40), height: rs(40), borderRadius: rs(10), backgroundColor: colour }} />
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: rs(8), marginBottom: rs(20) }}>
            {COLOURS.map(c => (
              <TouchableOpacity key={c} onPress={() => { setColour(c); haptic.selection(); }}
                style={{ width: rs(32), height: rs(32), borderRadius: rs(8), backgroundColor: c, alignItems: 'center', justifyContent: 'center', transform: [{ scale: colour === c ? 1.2 : 1 }] }}>
                {colour === c && <Ionicons name="checkmark" size={rs(14)} color="#fff" />}
              </TouchableOpacity>
            ))}
          </View>

          <Text style={s.label}>Brand (optional)</Text>
          <TextInput style={[s.input, { marginBottom: rs(16) }]} value={brand} onChangeText={setBrand} placeholder="e.g. Cascade, Lion Brand" placeholderTextColor={C.slateLight} />

          <Text style={s.label}>Yarn name *</Text>
          <TextInput style={[s.input, { marginBottom: rs(16) }]} value={name} onChangeText={setName} placeholder="e.g. 220 Superwash" placeholderTextColor={C.slateLight} />

          <Text style={s.label}>Weight</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: rs(16) }} contentContainerStyle={{ gap: rs(8) }}>
            {WEIGHTS.map(w => (
              <TouchableOpacity key={w} onPress={() => { setWeight(w); haptic.selection(); }} style={[s.chip, weight===w && s.chipActive]}>
                <Text style={[s.chipText, weight===w && { color: C.white }]}>{w}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={s.label}>Fibre</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: rs(8), marginBottom: rs(16) }}>
            {FIBRES.map(f => (
              <TouchableOpacity key={f} onPress={() => { setFibre(f); haptic.selection(); }} style={[s.chip, fibre===f && s.chipActive]}>
                <Text style={[s.chipText, fibre===f && { color: C.white }]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ flexDirection: 'row', gap: rs(12), marginBottom: rs(16) }}>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>Skeins</Text>
              <TextInput style={s.input} value={skeins} onChangeText={setSkeins} keyboardType="numeric" placeholder="1" placeholderTextColor={C.slateLight} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>Grams/skein</Text>
              <TextInput style={s.input} value={grams} onChangeText={setGrams} keyboardType="numeric" placeholder="100" placeholderTextColor={C.slateLight} />
            </View>
          </View>

          <Text style={s.label}>Notes (optional)</Text>
          <TextInput style={[s.input, { height: rs(80), textAlignVertical: 'top', marginBottom: rs(40) }]}
            value={notes} onChangeText={setNotes} multiline
            placeholder="Dye lot, where bought, project ideas..." placeholderTextColor={C.slateLight} />
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function StashTrackerScreen() {
  const [stash,   setStash]   = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter,  setFilter]  = useState('all');
  const [search,  setSearch]  = useState('');

  useEffect(() => {
    AsyncStorage.getItem('yarnStash').then(r => { if (r) setStash(JSON.parse(r)); }).catch(() => {});
  }, []);

  const saveStash = (updated) => { setStash(updated); AsyncStorage.setItem('yarnStash', JSON.stringify(updated)).catch(() => {}); };
  const save   = (yarn) => { saveStash(editing ? stash.map(y => y.id===yarn.id ? yarn : y) : [...stash, yarn]); setEditing(null); };
  const remove = (id)   => Alert.alert('Remove yarn?', '', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Remove', style: 'destructive', onPress: () => saveStash(stash.filter(y => y.id !== id)) },
  ]);

  const filtered = stash.filter(y => {
    const mw = filter === 'all' || y.weight === filter;
    const ms = !search.trim() || y.name.toLowerCase().includes(search.toLowerCase()) || y.brand?.toLowerCase().includes(search.toLowerCase());
    return mw && ms;
  });

  const totalSkeins = stash.reduce((sum, y) => sum + (y.skeins||0), 0);
  const totalGrams  = stash.reduce((sum, y) => sum + ((y.skeins||0)*(y.grams||0)), 0);

  return (
    <View style={{ flex: 1, backgroundColor: C.bgPage }}>
      <View style={s.header}>
        <View>
          <Text style={s.title}>My Stash 🧶</Text>
          {stash.length > 0 && <Text style={{ fontSize: fs(12), color: C.slateMid }}>{totalSkeins} skeins · {totalGrams}g total</Text>}
        </View>
        <TouchableOpacity onPress={() => { haptic.medium(); setEditing(null); setAddOpen(true); }} style={s.addBtn} activeOpacity={0.85}>
          <Ionicons name="add" size={rs(20)} color={C.white} />
          <Text style={s.addBtnText}>Add yarn</Text>
        </TouchableOpacity>
      </View>

      <View style={s.searchBar}>
        <Ionicons name="search-outline" size={rs(16)} color={C.slateMid} />
        <TextInput style={s.searchInput} placeholder="Search your stash..." placeholderTextColor={C.slateLight} value={search} onChangeText={setSearch} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={{ maxHeight: rs(44), marginBottom: rs(4) }} contentContainerStyle={{ paddingHorizontal: rs(16), gap: rs(8), alignItems: 'center' }}>
        {['all', ...WEIGHTS].map(w => (
          <TouchableOpacity key={w} onPress={() => { setFilter(w); haptic.selection(); }} style={[s.chip, filter===w && s.chipActive]}>
            <Text style={[s.chipText, filter===w && { color: C.white }]}>{w==='all' ? 'All' : w}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {stash.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: rs(32) }}>
          <Text style={{ fontSize: rs(52), marginBottom: rs(16) }}>🧶</Text>
          <Text style={s.emptyTitle}>Your stash is empty</Text>
          <Text style={s.emptySub}>Log your yarn so you always know what you have. No more buying duplicates!</Text>
          <TouchableOpacity onPress={() => setAddOpen(true)} style={[s.addBtn, { marginTop: rs(20) }]} activeOpacity={0.85}>
            <Ionicons name="add" size={rs(18)} color={C.white} />
            <Text style={s.addBtnText}>Add your first yarn</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList data={filtered} keyExtractor={y => y.id}
          contentContainerStyle={{ padding: rs(16), paddingTop: rs(8), paddingBottom: rs(40) }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<View style={{ alignItems: 'center', paddingVertical: rs(40) }}><Text style={{ fontSize: fs(14), color: C.slateMid }}>No yarn matching your search</Text></View>}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => { setEditing(item); setAddOpen(true); haptic.light(); }} activeOpacity={0.85} style={s.yarnCard}>
              <View style={[s.colourSwatch, { backgroundColor: item.colour }]} />
              <View style={{ flex: 1 }}>
                <Text style={s.yarnName}>{item.name}</Text>
                {item.brand ? <Text style={s.yarnBrand}>{item.brand}</Text> : null}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: rs(6), marginTop: rs(6) }}>
                  <View style={[s.pill, { backgroundColor: C.rosePale }]}><Text style={[s.pillText, { color: C.rose }]}>{item.weight}</Text></View>
                  <View style={[s.pill, { backgroundColor: C.sagePale }]}><Text style={[s.pillText, { color: C.sageDeep }]}>{item.fibre}</Text></View>
                  <View style={[s.pill, { backgroundColor: C.amberPale }]}><Text style={[s.pillText, { color: C.amberDeep }]}>{item.skeins} skein{item.skeins!==1?'s':''} · {item.skeins*item.grams}g</Text></View>
                </View>
                {item.notes ? <Text style={s.yarnNotes} numberOfLines={2}>{item.notes}</Text> : null}
              </View>
              <TouchableOpacity onPress={() => remove(item.id)} hitSlop={{ top:10, bottom:10, left:10, right:10 }}>
                <Ionicons name="trash-outline" size={rs(16)} color={C.slateLight} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}

      <AddYarnModal visible={addOpen} onClose={() => { setAddOpen(false); setEditing(null); }} onSave={save} editing={editing} />
    </View>
  );
}

const s = StyleSheet.create({
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: rs(16), paddingVertical: rs(14) },
  title:       { fontSize: fs(26), fontWeight: '800', color: C.slate, fontFamily: FONTS.heading },
  addBtn:      { flexDirection: 'row', alignItems: 'center', gap: rs(6), backgroundColor: C.rose, borderRadius: rs(20), paddingHorizontal: rs(16), paddingVertical: rs(8) },
  addBtnText:  { fontSize: fs(13), fontWeight: '700', color: C.white },
  searchBar:   { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgCard, borderRadius: rs(12), borderWidth: 1, borderColor: C.border, paddingHorizontal: rs(12), marginHorizontal: rs(16), marginBottom: rs(10), gap: rs(8) },
  searchInput: { flex: 1, fontSize: fs(14), color: C.slate, paddingVertical: rs(10) },
  chip:        { borderRadius: rs(20), paddingHorizontal: rs(12), paddingVertical: rs(6), backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border },
  chipActive:  { backgroundColor: C.rose, borderColor: C.rose },
  chipText:    { fontSize: fs(12), fontWeight: '600', color: C.slateMid },
  yarnCard:    { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: C.bgCard, borderRadius: rs(14), padding: rs(14), marginBottom: rs(10), borderWidth: 1, borderColor: C.border, gap: rs(12) },
  colourSwatch:{ width: rs(44), height: rs(44), borderRadius: rs(12), flexShrink: 0 },
  yarnName:    { fontSize: fs(15), fontWeight: '700', color: C.slate },
  yarnBrand:   { fontSize: fs(12), color: C.slateMid, marginTop: rs(1) },
  yarnNotes:   { fontSize: fs(11), color: C.slateMid, marginTop: rs(6), fontStyle: 'italic' },
  pill:        { borderRadius: rs(8), paddingHorizontal: rs(8), paddingVertical: rs(3) },
  pillText:    { fontSize: fs(10), fontWeight: '600' },
  emptyTitle:  { fontSize: fs(20), fontWeight: '800', color: C.slate, marginBottom: rs(8) },
  emptySub:    { fontSize: fs(14), color: C.slateMid, textAlign: 'center', lineHeight: fs(22) },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: rs(16), borderBottomWidth: 1, borderBottomColor: C.border },
  sheetTitle:  { fontSize: fs(16), fontWeight: '700', color: C.slate },
  label:       { fontSize: fs(12), fontWeight: '700', color: C.slateMid, marginBottom: rs(8), textTransform: 'uppercase', letterSpacing: 0.5 },
  input:       { backgroundColor: C.bgMuted, borderRadius: rs(12), paddingHorizontal: rs(14), paddingVertical: rs(12), fontSize: fs(14), color: C.slate, borderWidth: 1, borderColor: C.border },
});