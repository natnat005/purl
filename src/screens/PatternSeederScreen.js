import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { PATTERNS } from '../data/patterns';
import { C, rs, fs } from '../constants/theme';
import { haptic } from '../utils/haptics';

export default function PatternSeederScreen() {
  const [existingCount, setExistingCount] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [log, setLog] = useState([]);

  useEffect(() => {
    refreshCount();
  }, []);

  const refreshCount = async () => {
    try {
      const snap = await getDocs(collection(db, 'patterns'));
      setExistingCount(snap.size);
    } catch (e) {
      setExistingCount(-1);
    }
  };

  const addLog = (msg) => setLog(prev => [...prev, msg]);

  const seedAll = async () => {
    Alert.alert(
      'Upload patterns to Firestore?',
      `This will upload ${PATTERNS.length} patterns. Existing patterns with the same ID will be overwritten. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Upload', onPress: async () => {
          setUploading(true);
          setLog([]);
          let uploaded = 0;
          let failed = 0;
          for (const pattern of PATTERNS) {
            try {
              // Strip the C.* color references since they don't store cleanly in Firestore
              // Save the tagColor as a hex string if possible
              const { tagColor, ...rest } = pattern;
              const cleanPattern = { ...rest };
              if (typeof tagColor === 'string') cleanPattern.tagColor = tagColor;
              await setDoc(doc(db, 'patterns', pattern.id), cleanPattern);
              uploaded++;
              addLog(`✓ ${pattern.name}`);
            } catch (e) {
              failed++;
              addLog(`✗ ${pattern.name} (${e.message})`);
            }
          }
          setUploading(false);
          haptic.success();
          Alert.alert('Done!', `Uploaded ${uploaded} patterns${failed ? `, ${failed} failed` : ''}.`);
          refreshCount();
        }},
      ]
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bgPage }}
      contentContainerStyle={{ padding: rs(16), paddingBottom: rs(60) }}>

      <View style={s.warning}>
        <Ionicons name="warning-outline" size={rs(20)} color={C.amberDeep} />
        <Text style={s.warningText}>
          This is a one-time admin tool. Use it once to upload your patterns to Firestore so the app reads from the database. After that you don't need to come back here.
        </Text>
      </View>

      <View style={s.statCard}>
        <Text style={s.statLabel}>In your code (hardcoded)</Text>
        <Text style={s.statNum}>{PATTERNS.length}</Text>
        <Text style={s.statSub}>patterns ready to upload</Text>
      </View>

      <View style={s.statCard}>
        <Text style={s.statLabel}>In Firestore right now</Text>
        <Text style={s.statNum}>
          {existingCount === null ? '...' : existingCount === -1 ? 'error' : existingCount}
        </Text>
        <Text style={s.statSub}>patterns currently in the database</Text>
      </View>

      <TouchableOpacity onPress={seedAll} disabled={uploading}
        style={[s.uploadBtn, uploading && { opacity: 0.5 }]} activeOpacity={0.85}>
        <Ionicons name="cloud-upload-outline" size={rs(20)} color={C.white} />
        <Text style={s.uploadText}>
          {uploading ? 'Uploading...' : `Upload all ${PATTERNS.length} patterns`}
        </Text>
      </TouchableOpacity>

      {log.length > 0 && (
        <View style={s.logCard}>
          <Text style={s.logTitle}>Progress</Text>
          {log.slice(-20).map((line, i) => (
            <Text key={i} style={s.logLine}>{line}</Text>
          ))}
        </View>
      )}

      <View style={s.howCard}>
        <Text style={s.howTitle}>What this does</Text>
        <Text style={s.howText}>
          Adds every pattern from your local code into the Firestore `patterns` collection. Once uploaded, the app reads patterns from Firestore — so you can add new ones, edit existing ones, or delete patterns directly from the Firebase console without touching code.
        </Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  warning:    { flexDirection: 'row', gap: rs(10), backgroundColor: C.amberPale, borderRadius: rs(12), padding: rs(14), marginBottom: rs(20), alignItems: 'flex-start' },
  warningText:{ flex: 1, fontSize: fs(12), color: C.amberDeep, lineHeight: fs(18) },
  statCard:   { backgroundColor: C.bgCard, borderRadius: rs(14), padding: rs(16), borderWidth: 1, borderColor: C.border, marginBottom: rs(12) },
  statLabel:  { fontSize: fs(11), fontWeight: '700', color: C.slateMid, textTransform: 'uppercase', letterSpacing: 0.5 },
  statNum:    { fontSize: fs(36), fontWeight: '800', color: C.rose, marginTop: rs(4) },
  statSub:    { fontSize: fs(12), color: C.slateMid },
  uploadBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: rs(10), backgroundColor: C.rose, borderRadius: rs(14), paddingVertical: rs(14), marginTop: rs(8), marginBottom: rs(16) },
  uploadText: { fontSize: fs(14), fontWeight: '700', color: C.white },
  logCard:    { backgroundColor: C.bgMuted, borderRadius: rs(12), padding: rs(12), marginBottom: rs(16) },
  logTitle:   { fontSize: fs(12), fontWeight: '700', color: C.slateMid, marginBottom: rs(6) },
  logLine:    { fontSize: fs(11), color: C.slate, fontFamily: 'Courier' },
  howCard:    { backgroundColor: C.bgCard, borderRadius: rs(12), padding: rs(14), borderWidth: 1, borderColor: C.border },
  howTitle:   { fontSize: fs(13), fontWeight: '700', color: C.slate, marginBottom: rs(6) },
  howText:    { fontSize: fs(12), color: C.slateMid, lineHeight: fs(18) },
});