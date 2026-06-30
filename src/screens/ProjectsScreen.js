import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Image, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, rs, fs, DIFF_COLORS, CRAFT_COLORS, FONTS } from '../constants/theme';
import { haptic } from '../utils/haptics';
import { pickImage, takePhoto } from '../utils/imagePicker';
import Confetti from '../components/Confetti';

function ProjectCard({ proj, onUpdate, onRemove, onAddPhoto, onShare, onUpdateNotes }) {
  const pct = proj.progress || 0;
  const dc  = DIFF_COLORS[proj.cat]   || C.rose;
  const cc  = CRAFT_COLORS[proj.type] || C.rose;
  const done = pct === 100;
  const [notesOpen, setNotesOpen]   = useState(false);
  const [draftNotes, setDraftNotes] = useState(proj.notes || '');

  const addPhoto = () => {
    haptic.light();
    Alert.alert('Add progress photo', 'Choose a source', [
      { text: 'Take Photo', onPress: async () => {
        const res = await takePhoto();
        if (res.uri) onAddPhoto(proj.id, res.uri);
        else if (res.error) Alert.alert('Oops', res.error);
      }},
      { text: 'Choose from Library', onPress: async () => {
        const res = await pickImage();
        if (res.uri) onAddPhoto(proj.id, res.uri);
        else if (res.error) Alert.alert('Oops', res.error);
      }},
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={[s.card, done && { borderColor: C.sage, borderWidth: 1.5 }]}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: rs(12) }}>
          <View style={[s.emojiBox, { backgroundColor: dc + '18' }]}>
            <Text style={{ fontSize: fs(28) }}>{proj.emoji}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: rs(12) }}>
            <Text style={{ fontSize: fs(15), fontWeight: '700', color: C.slate }}>{proj.name}</Text>
            <View style={{ flexDirection: 'row', gap: rs(6), marginTop: rs(4) }}>
              <View style={[s.pill, { backgroundColor: cc + '18' }]}>
                <Text style={[s.pillText, { color: cc }]}>{proj.type}</Text>
              </View>
              <View style={[s.pill, { backgroundColor: dc + '18' }]}>
                <Text style={[s.pillText, { color: dc }]}>{proj.cat}</Text>
              </View>
            </View>
            <Text style={{ fontSize: fs(10), color: C.slateLight, marginTop: rs(3) }}>
              ⏱ {proj.time} · Started {new Date(proj.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
          </View>
          <TouchableOpacity onPress={() => Alert.alert('Remove project?', `Remove "${proj.name}" from your projects?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Remove', style: 'destructive', onPress: () => onRemove(proj.id) },
          ])} style={s.removeBtn}>
            <Text style={s.removeTxt}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Progress photo */}
        {proj.photo ? (
          <View style={{ marginBottom: rs(12) }}>
            <Image source={{ uri: proj.photo }} style={{ width: '100%', height: rs(200), borderRadius: rs(12) }} resizeMode="cover" />
            <TouchableOpacity onPress={addPhoto}
              style={{ position: 'absolute', bottom: rs(8), right: rs(8), backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: rs(16), flexDirection: 'row', alignItems: 'center', gap: rs(4), paddingHorizontal: rs(10), paddingVertical: rs(6) }}>
              <Ionicons name="camera" size={rs(14)} color="#fff" />
              <Text style={{ fontSize: fs(11), color: '#fff', fontWeight: '600' }}>Update</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={addPhoto} activeOpacity={0.85} style={s.addPhotoBtn}>
            <Ionicons name="camera-outline" size={rs(18)} color={C.rose} />
            <Text style={{ fontSize: fs(13), color: C.rose, fontWeight: '600' }}>Add progress photo</Text>
          </TouchableOpacity>
        )}

        {/* Progress bar */}
        <View style={{ marginBottom: rs(10) }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: rs(6) }}>
            <Text style={{ fontSize: fs(12), color: C.slateMid, fontWeight: '600' }}>
              {done ? '🎉 Finished!' : 'Progress'}
            </Text>
            <Text style={{ fontSize: fs(12), color: dc, fontWeight: '700' }}>{pct}%</Text>
          </View>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: `${pct}%`, backgroundColor: done ? C.sage : dc }]} />
          </View>
        </View>

        {/* Progress buttons */}
        {!done && (
          <View style={{ flexDirection: 'row', gap: rs(6) }}>
            {[0, 25, 50, 75, 100].map(val => (
              <TouchableOpacity key={val} onPress={() => onUpdate(proj.id, val)} activeOpacity={0.8}
                style={[s.progBtn, pct === val && { backgroundColor: dc, borderColor: dc }]}>
                <Text style={[s.progBtnText, pct === val && { color: C.white }]}>
                  {val === 100 ? '✓' : `${val}%`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {done && (
          <View style={{ marginTop: rs(10), gap: rs(10) }}>
            <View style={s.doneRow}>
              <Ionicons name="checkmark-circle" size={rs(18)} color={C.sage} />
              <Text style={{ fontSize: fs(13), color: C.sageDeep, fontWeight: '600', flex: 1 }}>
                Amazing work — you finished it!
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => { haptic.medium(); onShare(proj); }}
              style={s.shareBtn} activeOpacity={0.85}>
              <Ionicons name="share-social-outline" size={rs(18)} color={C.white} />
              <Text style={s.shareBtnText}>Share to Community</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Notes / journal */}
        <TouchableOpacity onPress={() => setNotesOpen(o => !o)} activeOpacity={0.7}
          style={s.notesToggle}>
          <Ionicons name="create-outline" size={rs(16)} color={C.slateMid} />
          <Text style={s.notesToggleText}>
            {proj.notes ? 'My notes' : 'Add notes'}
          </Text>
          <Ionicons name={notesOpen ? 'chevron-up' : 'chevron-down'} size={rs(16)} color={C.slateMid} />
        </TouchableOpacity>
        {notesOpen && (
          <View style={{ marginTop: rs(8) }}>
            <TextInput
              style={s.notesInput}
              value={draftNotes}
              onChangeText={setDraftNotes}
              placeholder="Hook size, yarn used, modifications, things to remember next time..."
              placeholderTextColor={C.slateLight}
              multiline
              textAlignVertical="top"
            />
            {draftNotes !== (proj.notes || '') && (
              <TouchableOpacity onPress={() => { haptic.light(); onUpdateNotes(proj.id, draftNotes); }}
                style={s.notesSaveBtn} activeOpacity={0.85}>
                <Text style={s.notesSaveText}>Save notes</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
}

export default function ProjectsScreen({ projects, onUpdate, onRemove, onAddPhoto, onShare, onUpdateNotes }) {
  const [confetti, setConfetti] = useState(false);
  const prevProjects = useRef(projects);

  // Watch for any project crossing into 100% complete → fire confetti
  useEffect(() => {
    const prevDone = new Set(prevProjects.current.filter(p => p.progress === 100).map(p => p.id));
    const newlyDone = projects.find(p => p.progress === 100 && !prevDone.has(p.id));
    if (newlyDone) {
      haptic.success();
      setConfetti(false);
      setTimeout(() => setConfetti(true), 50);
      setTimeout(() => setConfetti(false), 4500);
    }
    prevProjects.current = projects;
  }, [projects]);

  if (!projects.length) return (
    <View style={s.empty}>
      <View style={s.emptyCard}>
        <Text style={{ fontSize: rs(56), marginBottom: rs(16) }}>🪡</Text>
        <Text style={s.emptyTitle}>Start your first project</Text>
        <Text style={s.emptySub}>Go to the Library tab, tap any pattern you like, and hit "Add to My Projects".</Text>
        <View style={s.emptyHints}>
          {['🌱 Great for beginners: Garter Stitch Scarf', '🪝 First crochet: Classic Beanie', '🧵 First sewing: Fabric Tote Bag'].map(hint => (
            <View key={hint} style={s.emptyHint}>
              <Text style={{ fontSize: fs(12), color: C.slateMid }}>{hint}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const active   = projects.filter(p => p.progress < 100);
  const finished = projects.filter(p => p.progress === 100);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, backgroundColor: C.bgPage }}
        contentContainerStyle={{ padding: rs(16), paddingBottom: rs(40) }}
        showsVerticalScrollIndicator={false}>

        <Text style={s.pageTitle}>My Projects</Text>

      {active.length > 0 && (
        <>
          <Text style={s.sectionTitle}>In progress ({active.length})</Text>
          {active.map(p => <ProjectCard key={p.id} proj={p} onUpdate={onUpdate} onRemove={onRemove} onAddPhoto={onAddPhoto} onShare={onShare} onUpdateNotes={onUpdateNotes} />)}
        </>
      )}

      {finished.length > 0 && (
        <>
          <Text style={[s.sectionTitle, { marginTop: rs(24) }]}>Finished objects 🎉 ({finished.length})</Text>
          {finished.map(p => <ProjectCard key={p.id} proj={p} onUpdate={onUpdate} onRemove={onRemove} onAddPhoto={onAddPhoto} onShare={onShare} onUpdateNotes={onUpdateNotes} />)}
        </>
      )}
      </ScrollView>
      {confetti && <Confetti count={90} />}
    </View>
  );
}

const s = StyleSheet.create({
  empty:       { flex: 1, alignItems: 'center', justifyContent: 'center', padding: rs(24), backgroundColor: C.bgPage },
  emptyCard:   { backgroundColor: C.bgCard, borderRadius: rs(24), padding: rs(28), alignItems: 'center', borderWidth: 1, borderColor: C.border, width: '100%' },
  pageTitle:   { fontSize: fs(28), fontWeight: '800', color: C.slate, marginBottom: rs(16), fontFamily: FONTS.heading },
  emptyTitle:  { fontSize: fs(22), fontWeight: '800', color: C.slate, marginBottom: rs(8), textAlign: 'center', fontFamily: FONTS.heading },
  emptySub:    { fontSize: fs(14), color: C.slateMid, textAlign: 'center', lineHeight: fs(22), marginBottom: rs(20) },
  emptyHints:  { width: '100%', gap: rs(8) },
  emptyHint:   { backgroundColor: C.bgMuted, borderRadius: rs(10), padding: rs(10) },
  sectionTitle:{ fontSize: fs(16), fontWeight: '800', color: C.slate, marginBottom: rs(14) },
  card:        { backgroundColor: C.bgCard, borderRadius: rs(16), padding: rs(16), borderWidth: 1, borderColor: C.border, marginBottom: rs(12), shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  emojiBox:    { width: rs(52), height: rs(52), borderRadius: rs(14), alignItems: 'center', justifyContent: 'center' },
  addPhotoBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: rs(8), backgroundColor: C.rosePale, borderRadius: rs(12), paddingVertical: rs(12), marginBottom: rs(12), borderWidth: 1, borderColor: C.rose + '30', borderStyle: 'dashed' },
  pill:        { borderRadius: rs(8), paddingHorizontal: rs(8), paddingVertical: rs(3) },
  pillText:    { fontSize: fs(10), fontWeight: '700' },
  removeBtn:   { width: rs(28), height: rs(28), borderRadius: rs(14), backgroundColor: C.bgMuted, alignItems: 'center', justifyContent: 'center' },
  removeTxt:   { fontSize: fs(12), color: C.red, fontWeight: '700' },
  progressTrack:{ height: rs(8), backgroundColor: C.bgMuted, borderRadius: rs(4), overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: rs(4) },
  progBtn:     { flex: 1, paddingVertical: rs(7), borderRadius: rs(8), alignItems: 'center', backgroundColor: C.bgMuted, borderWidth: 1, borderColor: C.border },
  progBtnText: { fontSize: fs(10), fontWeight: '700', color: C.slateMid },
  doneRow:     { flexDirection: 'row', alignItems: 'center', gap: rs(8), backgroundColor: C.sagePale, borderRadius: rs(10), padding: rs(10) },
  shareBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: rs(8), backgroundColor: C.rose, borderRadius: rs(12), paddingVertical: rs(12) },
  shareBtnText:{ fontSize: fs(14), fontWeight: '700', color: C.white },
  notesToggle: { flexDirection: 'row', alignItems: 'center', gap: rs(6), marginTop: rs(12), paddingTop: rs(12), borderTopWidth: 1, borderTopColor: C.border },
  notesToggleText: { flex: 1, fontSize: fs(13), color: C.slateMid, fontWeight: '600' },
  notesInput:  { backgroundColor: C.bgMuted, borderRadius: rs(12), padding: rs(12), fontSize: fs(14), color: C.slate, minHeight: rs(80), borderWidth: 1, borderColor: C.border },
  notesSaveBtn:{ alignSelf: 'flex-end', backgroundColor: C.rose, borderRadius: rs(12), paddingHorizontal: rs(18), paddingVertical: rs(8), marginTop: rs(8) },
  notesSaveText: { fontSize: fs(13), fontWeight: '700', color: C.white },
});