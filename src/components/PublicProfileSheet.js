import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { C, rs, fs, FONTS } from '../constants/theme';
import { haptic } from '../utils/haptics';

// Shows another user's profile in a sheet, with a follow button.
export default function PublicProfileSheet({ userId, visible, onClose }) {
  const [profile, setProfile] = useState(null);
  const [me, setMe]           = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!visible || !userId) return;
    setLoading(true);
    (async () => {
      try {
        const [pSnap, meSnap] = await Promise.all([
          getDoc(doc(db, 'users', userId)),
          getDoc(doc(db, 'users', auth.currentUser.uid)),
        ]);
        if (pSnap.exists()) setProfile({ id: userId, ...pSnap.data() });
        if (meSnap.exists()) setMe({ id: auth.currentUser.uid, ...meSnap.data() });
      } catch (e) {}
      setLoading(false);
    })();
  }, [visible, userId]);

  const isMe = userId === auth.currentUser?.uid;
  const isFollowing = me?.following?.includes(userId);

  const toggleFollow = async () => {
    haptic.light();
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        following: isFollowing ? arrayRemove(userId) : arrayUnion(userId),
      });
      await updateDoc(doc(db, 'users', userId), {
        followers: isFollowing ? arrayRemove(auth.currentUser.uid) : arrayUnion(auth.currentUser.uid),
      });
      setMe(prev => ({
        ...prev,
        following: isFollowing
          ? prev.following.filter(x => x !== userId)
          : [...(prev.following || []), userId],
      }));
      setProfile(prev => ({
        ...prev,
        followers: isFollowing
          ? (prev.followers || []).filter(x => x !== auth.currentUser.uid)
          : [...(prev.followers || []), auth.currentUser.uid],
      }));
    } catch (e) {}
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: C.bgPage }}>
        <View style={s.header}>
          <TouchableOpacity onPress={onClose}><Ionicons name="close" size={rs(22)} color={C.slate} /></TouchableOpacity>
        </View>

        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: fs(14), color: C.slateMid }}>Loading...</Text>
          </View>
        ) : !profile ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: fs(14), color: C.slateMid }}>Profile not found</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ padding: rs(16), alignItems: 'center' }}>
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} style={s.avatar} />
            ) : (
              <View style={[s.avatar, { backgroundColor: C.rosePale, alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={{ fontSize: fs(40), fontWeight: '800', color: C.rose }}>{profile.username?.[0]?.toUpperCase()}</Text>
              </View>
            )}
            <Text style={s.username}>{profile.username}</Text>
            {profile.bio ? <Text style={s.bio}>{profile.bio}</Text> : null}

            {profile.crafts?.length > 0 && (
              <View style={{ flexDirection: 'row', gap: rs(6), marginTop: rs(10) }}>
                {profile.crafts.map(c => (
                  <View key={c} style={s.craftBadge}>
                    <Text style={{ fontSize: fs(12), color: C.slate }}>
                      {c === 'crochet' ? 'Crochet' : c === 'knitting' ? 'Knitting' : 'Sewing'}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <View style={s.statsRow}>
              <View style={s.stat}>
                <Text style={s.statNum}>{profile.followers?.length || 0}</Text>
                <Text style={s.statLabel}>Followers</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.stat}>
                <Text style={s.statNum}>{profile.following?.length || 0}</Text>
                <Text style={s.statLabel}>Following</Text>
              </View>
            </View>

            {!isMe && (
              <TouchableOpacity onPress={toggleFollow}
                style={[s.followBtn, isFollowing && s.followingBtn]} activeOpacity={0.85}>
                <Text style={[s.followBtnText, isFollowing && { color: C.slate }]}>
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  header:      { flexDirection: 'row', justifyContent: 'flex-end', padding: rs(16) },
  avatar:      { width: rs(96), height: rs(96), borderRadius: rs(48), marginTop: rs(8) },
  username:    { fontSize: fs(22), fontWeight: '800', color: C.slate, marginTop: rs(12), fontFamily: FONTS.heading },
  bio:         { fontSize: fs(13), color: C.slateMid, textAlign: 'center', marginTop: rs(6), lineHeight: fs(20), paddingHorizontal: rs(20) },
  craftBadge:  { backgroundColor: C.bgMuted, borderRadius: rs(10), paddingHorizontal: rs(10), paddingVertical: rs(5) },
  statsRow:    { flexDirection: 'row', backgroundColor: C.bgCard, borderRadius: rs(16), padding: rs(16), borderWidth: 1, borderColor: C.border, marginTop: rs(20), width: '100%' },
  stat:        { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: C.border },
  statNum:     { fontSize: fs(20), fontWeight: '800', color: C.slate },
  statLabel:   { fontSize: fs(11), color: C.slateMid, marginTop: rs(2) },
  followBtn:   { backgroundColor: C.rose, borderRadius: rs(16), paddingVertical: rs(14), alignItems: 'center', marginTop: rs(20), width: '100%' },
  followingBtn:{ backgroundColor: C.bgMuted, borderWidth: 1, borderColor: C.border },
  followBtnText:{ fontSize: fs(15), fontWeight: '700', color: C.white },
});