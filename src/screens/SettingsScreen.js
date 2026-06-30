import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, Alert, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut, deleteUser } from 'firebase/auth';
import { doc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { C, rs, fs, FONTS } from '../constants/theme';
import { haptic } from '../utils/haptics';

export default function SettingsScreen({ visible, onClose }) {
  const [blocked, setBlocked] = useState([]);

  useEffect(() => {
    if (visible) {
      AsyncStorage.getItem('blockedUsers').then(r => {
        if (r) setBlocked(JSON.parse(r));
      }).catch(() => {});
    }
  }, [visible]);

  const unblock = (uid) => {
    Alert.alert(
      'Unblock this user?',
      'You will start seeing their posts again.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Unblock', onPress: () => {
          const next = blocked.filter(b => b !== uid);
          setBlocked(next);
          AsyncStorage.setItem('blockedUsers', JSON.stringify(next)).catch(() => {});
          haptic.light();
        }},
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete your account?',
      'This is permanent. All your posts, comments, and profile data will be deleted within 30 days. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete forever', style: 'destructive', onPress: () => {
          Alert.alert(
            'Are you absolutely sure?',
            'Once you confirm, your account and data are gone.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Yes, delete it', style: 'destructive', onPress: doDelete },
            ]
          );
        }},
      ]
    );
  };

  const doDelete = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const postsQ = query(collection(db, 'feed'), where('userId', '==', user.uid));
      const postsSnap = await getDocs(postsQ);
      for (const d of postsSnap.docs) {
        await deleteDoc(doc(db, 'feed', d.id));
      }
      try { await deleteDoc(doc(db, 'profiles', user.uid)); } catch (e) {}
      try { await deleteDoc(doc(db, 'users', user.uid)); } catch (e) {}
      await deleteUser(user);
      haptic.success();
    } catch (e) {
      if (e.code === 'auth/requires-recent-login') {
        Alert.alert(
          'Please sign in again',
          'For security, you need to sign in again before deleting your account. Log out and sign back in, then try again.',
          [{ text: 'OK', onPress: () => signOut(auth).catch(() => {}) }]
        );
      } else {
        Alert.alert('Error', 'Could not delete account. Please try again or contact support.');
      }
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: C.bgPage }}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Settings</Text>
          <TouchableOpacity onPress={onClose}><Ionicons name="close" size={rs(22)} color={C.slate} /></TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: rs(16), paddingBottom: rs(60) }}>

          <Text style={s.sectionLabel}>Blocked Users</Text>
          <View style={s.card}>
            {blocked.length === 0 ? (
              <Text style={s.emptyText}>You haven't blocked anyone. If you ever do, they'll show up here so you can unblock them.</Text>
            ) : (
              blocked.map(uid => (
                <View key={uid} style={s.blockedRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.blockedId} numberOfLines={1}>{uid.slice(0, 12)}…</Text>
                    <Text style={s.blockedSub}>Blocked user</Text>
                  </View>
                  <TouchableOpacity onPress={() => unblock(uid)} style={s.unblockBtn} activeOpacity={0.7}>
                    <Text style={s.unblockText}>Unblock</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>

          <Text style={s.sectionLabel}>Legal & Community</Text>
          <View style={s.card}>
            <TouchableOpacity style={s.linkRow} activeOpacity={0.7}
              onPress={() => Linking.openURL('https://natnat005.github.io/purl/terms.html').catch(() =>
                Alert.alert('Terms of Service', 'Visit our website to read the full Terms of Service.')
              )}>
              <Ionicons name="document-text-outline" size={rs(18)} color={C.slate} />
              <Text style={s.linkText}>Terms of Service</Text>
              <Ionicons name="chevron-forward" size={rs(16)} color={C.slateLight} />
            </TouchableOpacity>
            <View style={s.divider} />
            <TouchableOpacity style={s.linkRow} activeOpacity={0.7}
              onPress={() => Linking.openURL('https://natnat005.github.io/purl/privacy.html').catch(() =>
                Alert.alert('Privacy Policy', 'Visit our website to read the full Privacy Policy.')
              )}>
              <Ionicons name="shield-outline" size={rs(18)} color={C.slate} />
              <Text style={s.linkText}>Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={rs(16)} color={C.slateLight} />
            </TouchableOpacity>
            <View style={s.divider} />
            <TouchableOpacity style={s.linkRow} activeOpacity={0.7}
              onPress={() => Linking.openURL('https://natnat005.github.io/purl/guidelines.html').catch(() =>
                Alert.alert('Community Guidelines', 'Be kind. No abuse, harassment, hate speech, spam, or illegal content. Reports are reviewed within 24 hours.')
              )}>
              <Ionicons name="heart-outline" size={rs(18)} color={C.slate} />
              <Text style={s.linkText}>Community Guidelines</Text>
              <Ionicons name="chevron-forward" size={rs(16)} color={C.slateLight} />
            </TouchableOpacity>
          </View>

          <Text style={s.sectionLabel}>Account</Text>
          <View style={s.card}>
            <TouchableOpacity style={s.linkRow} activeOpacity={0.7}
              onPress={() => Alert.alert(
                'Log out?',
                'You can sign back in anytime.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Log out', style: 'destructive', onPress: () => signOut(auth).catch(() => {}) },
                ]
              )}>
              <Ionicons name="log-out-outline" size={rs(18)} color={C.slate} />
              <Text style={s.linkText}>Log out</Text>
              <Ionicons name="chevron-forward" size={rs(16)} color={C.slateLight} />
            </TouchableOpacity>
            <View style={s.divider} />
            <TouchableOpacity style={s.linkRow} activeOpacity={0.7} onPress={handleDeleteAccount}>
              <Ionicons name="trash-outline" size={rs(18)} color="#C2392E" />
              <Text style={[s.linkText, { color: '#C2392E' }]}>Delete my account</Text>
              <Ionicons name="chevron-forward" size={rs(16)} color={C.slateLight} />
            </TouchableOpacity>
          </View>

          <Text style={s.footer}>Purl • Built with care for makers</Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: rs(16), paddingVertical: rs(14), borderBottomWidth: 1, borderBottomColor: C.border },
  headerTitle:   { fontSize: fs(18), fontWeight: '800', color: C.slate, fontFamily: FONTS.heading },
  sectionLabel:  { fontSize: fs(11), fontWeight: '700', color: C.slateMid, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: rs(20), marginBottom: rs(8), marginLeft: rs(4) },
  card:          { backgroundColor: C.bgCard, borderRadius: rs(14), borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  emptyText:     { fontSize: fs(13), color: C.slateMid, padding: rs(16), lineHeight: fs(20) },
  blockedRow:    { flexDirection: 'row', alignItems: 'center', padding: rs(14), gap: rs(12) },
  blockedId:     { fontSize: fs(13), fontWeight: '600', color: C.slate },
  blockedSub:    { fontSize: fs(11), color: C.slateMid, marginTop: rs(2) },
  unblockBtn:    { backgroundColor: C.bgMuted, borderRadius: rs(8), paddingHorizontal: rs(12), paddingVertical: rs(6) },
  unblockText:   { fontSize: fs(12), fontWeight: '600', color: C.rose },
  linkRow:       { flexDirection: 'row', alignItems: 'center', gap: rs(12), paddingHorizontal: rs(14), paddingVertical: rs(13) },
  linkText:      { flex: 1, fontSize: fs(14), fontWeight: '500', color: C.slate },
  divider:       { height: 1, backgroundColor: C.border, marginLeft: rs(14) },
  footer:        { textAlign: 'center', fontSize: fs(11), color: C.slateLight, marginTop: rs(32) },
});