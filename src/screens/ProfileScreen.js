import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Modal, Alert, FlatList, Image, KeyboardAvoidingView, Platform, Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  doc, getDoc, setDoc, updateDoc, collection, query,
  where, onSnapshot, arrayUnion, arrayRemove, getDocs,
} from 'firebase/firestore';
import { signOut, sendEmailVerification } from 'firebase/auth';
import { db, auth } from '../../firebase';
import { C, rs, fs, FONTS, DIFF_COLORS, CRAFT_COLORS } from '../constants/theme';
import { haptic } from '../utils/haptics';
import { pickImage, takePhoto } from '../utils/imagePicker';
import { iconForPattern } from '../utils/icons';
import { PATTERNS } from '../data/patterns';
import { usePatterns } from '../hooks/usePatterns';
import SettingsScreen from './SettingsScreen';

// Ensure a user profile doc exists; returns the profile
async function ensureProfile(user) {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return { id: user.uid, ...snap.data() };
  const fresh = {
    username: user.email?.split('@')[0] || 'Maker',
    bio: '',
    avatar: null,
    crafts: [],
    followers: [],
    following: [],
    createdAt: new Date().toISOString(),
  };
  await setDoc(ref, fresh);
  return { id: user.uid, ...fresh };
}

// ─── Edit Profile Sheet ───────────────────────────────────────────
function EditProfileSheet({ visible, profile, onClose, onSave }) {
  const [username, setUsername] = useState('');
  const [bio, setBio]           = useState('');
  const [avatar, setAvatar]     = useState(null);
  const [crafts, setCrafts]     = useState([]);
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setBio(profile.bio || '');
      setAvatar(profile.avatar || null);
      setCrafts(profile.crafts || []);
    }
  }, [profile, visible]);

  const toggleCraft = (c) => {
    haptic.selection();
    setCrafts(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  const changeAvatar = () => {
    haptic.light();
    Alert.alert('Profile photo', 'Choose a source', [
      { text: 'Take Photo', onPress: async () => { const r = await takePhoto(); if (r.uri) setAvatar(r.uri); else if (r.error) Alert.alert('Oops', r.error); } },
      { text: 'Choose from Library', onPress: async () => { const r = await pickImage(); if (r.uri) setAvatar(r.uri); else if (r.error) Alert.alert('Oops', r.error); } },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const save = async () => {
    if (!username.trim()) { Alert.alert('Add a username'); return; }
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        username: username.trim(), bio: bio.trim(), avatar: avatar || null, crafts,
      });
      haptic.success();
      onSave({ ...profile, username: username.trim(), bio: bio.trim(), avatar, crafts });
      onClose();
    } catch (e) { Alert.alert('Error', 'Could not save profile.'); }
    setSaving(false);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bgPage }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={s.sheetHeader}>
          <TouchableOpacity onPress={onClose}><Text style={{ fontSize: fs(15), color: C.slateMid }}>Cancel</Text></TouchableOpacity>
          <Text style={s.sheetTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={save} disabled={saving}>
            <Text style={{ fontSize: fs(15), color: C.rose, fontWeight: '700' }}>{saving ? 'Saving...' : 'Save'}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{ padding: rs(16) }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
          {/* Avatar */}
          <View style={{ alignItems: 'center', marginBottom: rs(24) }}>
            <TouchableOpacity onPress={changeAvatar} activeOpacity={0.85}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={s.editAvatar} />
              ) : (
                <View style={[s.editAvatar, { backgroundColor: C.rosePale, alignItems: 'center', justifyContent: 'center' }]}>
                  <Text style={{ fontSize: fs(36), fontWeight: '800', color: C.rose }}>{username?.[0]?.toUpperCase() || '?'}</Text>
                </View>
              )}
              <View style={s.cameraBadge}>
                <Ionicons name="camera" size={rs(16)} color="#fff" />
              </View>
            </TouchableOpacity>
            <Text style={{ fontSize: fs(12), color: C.slateMid, marginTop: rs(8) }}>Tap to change photo</Text>
          </View>

          <Text style={s.label}>Username</Text>
          <TextInput style={[s.input, { marginBottom: rs(16) }]} value={username} onChangeText={setUsername}
            placeholder="Your maker name" placeholderTextColor={C.slateLight} maxLength={24} />

          <Text style={s.label}>Bio</Text>
          <TextInput style={[s.input, { height: rs(80), textAlignVertical: 'top', marginBottom: rs(16) }]}
            value={bio} onChangeText={setBio} multiline maxLength={150}
            placeholder="Tell the community about yourself..." placeholderTextColor={C.slateLight} />

          <Text style={s.label}>I craft...</Text>
          <View style={{ flexDirection: 'row', gap: rs(8), marginBottom: rs(24) }}>
            {[{ id: 'crochet', label: '🪝 Crochet' }, { id: 'knitting', label: '🧶 Knitting' }, { id: 'sewing', label: '🧵 Sewing' }].map(c => (
              <TouchableOpacity key={c.id} onPress={() => toggleCraft(c.id)}
                style={[s.craftChip, crafts.includes(c.id) && s.craftChipActive]}>
                <Text style={[s.craftChipText, crafts.includes(c.id) && { color: C.white }]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Followers/Following list ─────────────────────────────────────
function PeopleListSheet({ visible, title, userIds, onClose, currentProfile, onToggleFollow }) {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    (async () => {
      const results = [];
      for (const uid of (userIds || [])) {
        try {
          const snap = await getDoc(doc(db, 'users', uid));
          if (snap.exists()) results.push({ id: uid, ...snap.data() });
        } catch (e) {}
      }
      setPeople(results);
      setLoading(false);
    })();
  }, [visible, userIds]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: C.bgPage }}>
        <View style={s.sheetHeader}>
          <Text style={s.sheetTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose}><Ionicons name="close" size={rs(22)} color={C.slate} /></TouchableOpacity>
        </View>
        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: fs(14), color: C.slateMid }}>Loading...</Text>
          </View>
        ) : (
          <FlatList data={people} keyExtractor={p => p.id}
            contentContainerStyle={{ padding: rs(16) }}
            ListEmptyComponent={<View style={{ alignItems: 'center', paddingVertical: rs(40) }}><Text style={{ fontSize: fs(14), color: C.slateMid }}>No one here yet</Text></View>}
            renderItem={({ item }) => {
              const isFollowing = currentProfile?.following?.includes(item.id);
              const isMe = item.id === auth.currentUser.uid;
              return (
                <View style={s.personRow}>
                  {item.avatar ? (
                    <Image source={{ uri: item.avatar }} style={s.personAvatar} />
                  ) : (
                    <View style={[s.personAvatar, { backgroundColor: C.rosePale, alignItems: 'center', justifyContent: 'center' }]}>
                      <Text style={{ fontSize: fs(16), fontWeight: '800', color: C.rose }}>{item.username?.[0]?.toUpperCase()}</Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={s.personName}>{item.username}</Text>
                    {item.bio ? <Text style={s.personBio} numberOfLines={1}>{item.bio}</Text> : null}
                  </View>
                  {!isMe && (
                    <TouchableOpacity onPress={() => onToggleFollow(item.id)}
                      style={[s.followBtnSmall, isFollowing && s.followingBtnSmall]}>
                      <Text style={[s.followBtnSmallText, isFollowing && { color: C.slate }]}>
                        {isFollowing ? 'Following' : 'Follow'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            }}
          />
        )}
      </View>
    </Modal>
  );
}

// ─── Discover People ──────────────────────────────────────────────
function DiscoverSheet({ visible, onClose, currentProfile, onToggleFollow }) {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'users'));
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() }))
          .filter(u => u.id !== auth.currentUser.uid);
        setPeople(all);
      } catch (e) {}
      setLoading(false);
    })();
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: C.bgPage }}>
        <View style={s.sheetHeader}>
          <Text style={s.sheetTitle}>Discover Makers</Text>
          <TouchableOpacity onPress={onClose}><Ionicons name="close" size={rs(22)} color={C.slate} /></TouchableOpacity>
        </View>
        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: rs(32), marginBottom: rs(8) }}>🧶</Text>
            <Text style={{ fontSize: fs(14), color: C.slateMid }}>Finding makers...</Text>
          </View>
        ) : (
          <FlatList data={people} keyExtractor={p => p.id}
            contentContainerStyle={{ padding: rs(16) }}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', paddingVertical: rs(60) }}>
                <Text style={{ fontSize: rs(40), marginBottom: rs(12) }}>👋</Text>
                <Text style={{ fontSize: fs(15), fontWeight: '700', color: C.slate }}>No other makers yet</Text>
                <Text style={{ fontSize: fs(13), color: C.slateMid, marginTop: rs(4), textAlign: 'center' }}>As more people join, they'll appear here to follow.</Text>
              </View>
            }
            renderItem={({ item }) => {
              const isFollowing = currentProfile?.following?.includes(item.id);
              return (
                <View style={s.personRow}>
                  {item.avatar ? (
                    <Image source={{ uri: item.avatar }} style={s.personAvatar} />
                  ) : (
                    <View style={[s.personAvatar, { backgroundColor: C.rosePale, alignItems: 'center', justifyContent: 'center' }]}>
                      <Text style={{ fontSize: fs(16), fontWeight: '800', color: C.rose }}>{item.username?.[0]?.toUpperCase()}</Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={s.personName}>{item.username}</Text>
                    {item.bio ? <Text style={s.personBio} numberOfLines={1}>{item.bio}</Text> :
                      <Text style={s.personBio}>{(item.crafts || []).map(c => c === 'crochet' ? '🪝' : c === 'knitting' ? '🧶' : '🧵').join(' ')}</Text>}
                  </View>
                  <TouchableOpacity onPress={() => onToggleFollow(item.id)}
                    style={[s.followBtnSmall, isFollowing && s.followingBtnSmall]}>
                    <Text style={[s.followBtnSmallText, isFollowing && { color: C.slate }]}>
                      {isFollowing ? 'Following' : 'Follow'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        )}
      </View>
    </Modal>
  );
}

// ─── Saved Patterns Sheet ─────────────────────────────────────────
function SavedPatternsSheet({ visible, favorites, onToggleFavorite, onClose }) {
  const { patterns: PATTERNS } = usePatterns();
  const savedPatterns = PATTERNS.filter(p => favorites.includes(p.id));
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: C.bgPage }}>
        <View style={s.sheetHeader}>
          <Text style={s.sheetTitle}>Saved Patterns</Text>
          <TouchableOpacity onPress={onClose}><Ionicons name="close" size={rs(22)} color={C.slate} /></TouchableOpacity>
        </View>
        {savedPatterns.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: rs(32) }}>
            <Ionicons name="heart-outline" size={rs(48)} color={C.slateLight} style={{ marginBottom: rs(16) }} />
            <Text style={{ fontSize: fs(16), fontWeight: '700', color: C.slate, marginBottom: rs(8) }}>No saved patterns yet</Text>
            <Text style={{ fontSize: fs(13), color: C.slateMid, textAlign: 'center', lineHeight: fs(20) }}>
              Tap the heart on any pattern in the Library to save it here for later.
            </Text>
          </View>
        ) : (
          <FlatList data={savedPatterns} keyExtractor={p => p.id}
            contentContainerStyle={{ padding: rs(16) }}
            renderItem={({ item }) => {
              const dc = DIFF_COLORS[item.cat]   || C.slate;
              const cc = CRAFT_COLORS[item.type] || C.rose;
              return (
                <View style={s.savedRow}>
                  <View style={[s.savedEmoji, { backgroundColor: dc + '18' }]}>
                    <Ionicons name={iconForPattern(item)} size={rs(26)} color={cc} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.savedName} numberOfLines={1}>{item.name}</Text>
                    <Text style={s.savedDesc} numberOfLines={2}>{item.desc}</Text>
                    <View style={{ flexDirection: 'row', gap: rs(6), marginTop: rs(6) }}>
                      <View style={[s.savedPill, { backgroundColor: cc + '18' }]}>
                        <Text style={[s.savedPillText, { color: cc }]}>{item.type}</Text>
                      </View>
                      <View style={[s.savedPill, { backgroundColor: dc + '18' }]}>
                        <Text style={[s.savedPillText, { color: dc }]}>{item.cat}</Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => { haptic.light(); onToggleFavorite(item); }} hitSlop={{ top:10, bottom:10, left:10, right:10 }}>
                    <Ionicons name="heart" size={rs(22)} color={C.rose} />
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        )}
      </View>
    </Modal>
  );
}

// ─── Profile Screen ───────────────────────────────────────────────
export default function ProfileScreen({ user, projects = [], favorites = [], onToggleFavorite }) {
  const [profile, setProfile]   = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [listSheet, setListSheet] = useState(null); // 'followers' | 'following'
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    let unsub;
    (async () => {
      await ensureProfile(user);
      unsub = onSnapshot(doc(db, 'users', user.uid), snap => {
        if (snap.exists()) setProfile({ id: user.uid, ...snap.data() });
      });
    })();
    return () => unsub && unsub();
  }, [user]);

  const toggleFollow = async (targetId) => {
    if (!profile) return;
    haptic.light();
    const isFollowing = profile.following?.includes(targetId);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        following: isFollowing ? arrayRemove(targetId) : arrayUnion(targetId),
      });
      await updateDoc(doc(db, 'users', targetId), {
        followers: isFollowing ? arrayRemove(user.uid) : arrayUnion(user.uid),
      });
    } catch (e) {}
  };

  const logout = () => {
    Alert.alert('Log out?', 'You can log back in anytime.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => signOut(auth).catch(() => {}) },
    ]);
  };

  if (!profile) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bgPage }}>
        <Text style={{ fontSize: rs(36), marginBottom: rs(12) }}>🧶</Text>
        <Text style={{ fontSize: fs(14), color: C.slateMid }}>Loading profile...</Text>
      </View>
    );
  }

  const finishedCount = projects.filter(p => p.progress === 100).length;
  const wipCount      = projects.filter(p => p.progress < 100).length;

  return (
    <View style={{ flex: 1, backgroundColor: C.bgPage }}>
      <View style={s.header}>
        <Text style={s.title}>Profile</Text>
        <View style={{ flexDirection: 'row', gap: rs(4) }}>
          <TouchableOpacity onPress={() => { haptic.light(); setDiscoverOpen(true); }} style={s.iconBtn}>
            <Ionicons name="person-add-outline" size={rs(20)} color={C.rose} />
          </TouchableOpacity>
          <TouchableOpacity onPress={logout} style={s.iconBtn}>
            <Ionicons name="log-out-outline" size={rs(20)} color={C.slateMid} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: rs(16), paddingBottom: rs(40) }} showsVerticalScrollIndicator={false}>
        {/* Verify email reminder — Insta-style */}
        {user && !user.emailVerified && (
          <TouchableOpacity onPress={async () => {
            try {
              await sendEmailVerification(user);
              Alert.alert('Verification sent', `We sent a link to ${user.email}. Tap it from your inbox to verify.`);
            } catch (e) { Alert.alert('Error', 'Could not send. Try again in a moment.'); }
          }} style={s.verifyBanner} activeOpacity={0.85}>
            <Ionicons name="mail-outline" size={rs(18)} color={C.amberDeep} />
            <View style={{ flex: 1 }}>
              <Text style={s.verifyBannerTitle}>Verify your email</Text>
              <Text style={s.verifyBannerSub}>Tap to resend the verification link</Text>
            </View>
            <Ionicons name="chevron-forward" size={rs(16)} color={C.amberDeep} />
          </TouchableOpacity>
        )}

        {/* Avatar + name */}
        <View style={{ alignItems: 'center', marginBottom: rs(20) }}>
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
            <View style={{ flexDirection: 'row', gap: rs(6), marginTop: rs(8) }}>
              {profile.crafts.map(c => (
                <View key={c} style={s.craftBadge}>
                  <Text style={{ fontSize: fs(12) }}>{c === 'crochet' ? '🪝 Crochet' : c === 'knitting' ? '🧶 Knitting' : '🧵 Sewing'}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          <TouchableOpacity style={s.stat} onPress={() => setListSheet('followers')} activeOpacity={0.7}>
            <Text style={s.statNum}>{profile.followers?.length || 0}</Text>
            <Text style={s.statLabel}>Followers</Text>
          </TouchableOpacity>
          <View style={s.statDivider} />
          <TouchableOpacity style={s.stat} onPress={() => setListSheet('following')} activeOpacity={0.7}>
            <Text style={s.statNum}>{profile.following?.length || 0}</Text>
            <Text style={s.statLabel}>Following</Text>
          </TouchableOpacity>
          <View style={s.statDivider} />
          <View style={s.stat}>
            <Text style={s.statNum}>{finishedCount}</Text>
            <Text style={s.statLabel}>Finished</Text>
          </View>
        </View>

        {/* Edit button */}
        <TouchableOpacity onPress={() => { haptic.light(); setEditOpen(true); }} style={s.editBtn} activeOpacity={0.85}>
          <Ionicons name="create-outline" size={rs(18)} color={C.slate} />
          <Text style={s.editBtnText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* My projects summary */}
        <View style={s.summaryCard}>
          <Text style={s.summaryTitle}>My Crafting</Text>
          <View style={{ flexDirection: 'row', gap: rs(12) }}>
            <View style={[s.summaryStat, { backgroundColor: C.amberPale }]}>
              <Text style={[s.summaryNum, { color: C.amberDeep }]}>{wipCount}</Text>
              <Text style={[s.summaryLabel, { color: C.amberDeep }]}>In progress</Text>
            </View>
            <View style={[s.summaryStat, { backgroundColor: C.sagePale }]}>
              <Text style={[s.summaryNum, { color: C.sageDeep }]}>{finishedCount}</Text>
              <Text style={[s.summaryLabel, { color: C.sageDeep }]}>Completed</Text>
            </View>
          </View>
        </View>

        {/* Saved patterns */}
        <TouchableOpacity onPress={() => { haptic.light(); setSavedOpen(true); }} style={[s.discoverCard, { marginBottom: rs(12) }]} activeOpacity={0.85}>
          <View style={[s.profileIcon, { backgroundColor: C.rose + '18' }]}>
            <Ionicons name="heart" size={rs(20)} color={C.rose} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: fs(14), fontWeight: '700', color: C.slate }}>Saved Patterns</Text>
            <Text style={{ fontSize: fs(12), color: C.slateMid }}>
              {favorites.length === 0 ? 'Heart patterns to save them here' : `${favorites.length} pattern${favorites.length === 1 ? '' : 's'} saved`}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={rs(18)} color={C.slateLight} />
        </TouchableOpacity>

        {/* Discover prompt */}
        <TouchableOpacity onPress={() => { haptic.light(); setDiscoverOpen(true); }} style={[s.discoverCard, { marginBottom: rs(12) }]} activeOpacity={0.85}>
          <View style={[s.profileIcon, { backgroundColor: C.lavender + '18' }]}>
            <Ionicons name="people" size={rs(20)} color={C.lavender} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: fs(14), fontWeight: '700', color: C.slate }}>Find makers to follow</Text>
            <Text style={{ fontSize: fs(12), color: C.slateMid }}>Discover other crafters in the community</Text>
          </View>
          <Ionicons name="chevron-forward" size={rs(18)} color={C.slateLight} />
        </TouchableOpacity>

        {/* Settings */}
        <TouchableOpacity onPress={() => { haptic.light(); setSettingsOpen(true); }} style={s.discoverCard} activeOpacity={0.85}>
          <View style={[s.profileIcon, { backgroundColor: C.slate + '15' }]}>
            <Ionicons name="settings-outline" size={rs(20)} color={C.slate} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: fs(14), fontWeight: '700', color: C.slate }}>Settings</Text>
            <Text style={{ fontSize: fs(12), color: C.slateMid }}>Blocked users, legal info, account</Text>
          </View>
          <Ionicons name="chevron-forward" size={rs(18)} color={C.slateLight} />
        </TouchableOpacity>
      </ScrollView>

      <EditProfileSheet visible={editOpen} profile={profile} onClose={() => setEditOpen(false)} onSave={setProfile} />
      <PeopleListSheet
        visible={listSheet === 'followers'}
        title="Followers"
        userIds={profile.followers}
        currentProfile={profile}
        onToggleFollow={toggleFollow}
        onClose={() => setListSheet(null)}
      />
      <PeopleListSheet
        visible={listSheet === 'following'}
        title="Following"
        userIds={profile.following}
        currentProfile={profile}
        onToggleFollow={toggleFollow}
        onClose={() => setListSheet(null)}
      />
      <DiscoverSheet visible={discoverOpen} onClose={() => setDiscoverOpen(false)} currentProfile={profile} onToggleFollow={toggleFollow} />
      <SavedPatternsSheet visible={savedOpen} favorites={favorites} onToggleFavorite={onToggleFavorite} onClose={() => setSavedOpen(false)} />
      <SettingsScreen visible={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </View>
  );
}

const s = StyleSheet.create({
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: rs(16), paddingVertical: rs(14) },
  title:         { fontSize: fs(26), fontWeight: '800', color: C.slate, fontFamily: FONTS.heading },
  iconBtn:       { width: rs(40), height: rs(40), borderRadius: rs(20), backgroundColor: C.bgMuted, alignItems: 'center', justifyContent: 'center' },
  avatar:        { width: rs(96), height: rs(96), borderRadius: rs(48) },
  username:      { fontSize: fs(22), fontWeight: '800', color: C.slate, marginTop: rs(12), fontFamily: FONTS.heading },
  bio:           { fontSize: fs(13), color: C.slateMid, textAlign: 'center', marginTop: rs(6), lineHeight: fs(20), paddingHorizontal: rs(20) },
  craftBadge:    { backgroundColor: C.bgMuted, borderRadius: rs(10), paddingHorizontal: rs(10), paddingVertical: rs(5) },
  statsRow:      { flexDirection: 'row', backgroundColor: C.bgCard, borderRadius: rs(16), padding: rs(16), borderWidth: 1, borderColor: C.border, marginBottom: rs(12) },
  stat:          { flex: 1, alignItems: 'center' },
  statDivider:   { width: 1, backgroundColor: C.border },
  statNum:       { fontSize: fs(20), fontWeight: '800', color: C.slate },
  statLabel:     { fontSize: fs(11), color: C.slateMid, marginTop: rs(2) },
  editBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: rs(8), backgroundColor: C.bgMuted, borderRadius: rs(14), paddingVertical: rs(12), marginBottom: rs(20) },
  editBtnText:   { fontSize: fs(14), fontWeight: '700', color: C.slate },
  summaryCard:   { backgroundColor: C.bgCard, borderRadius: rs(16), padding: rs(16), borderWidth: 1, borderColor: C.border, marginBottom: rs(12) },
  summaryTitle:  { fontSize: fs(15), fontWeight: '700', color: C.slate, marginBottom: rs(12) },
  summaryStat:   { flex: 1, borderRadius: rs(12), padding: rs(16), alignItems: 'center' },
  summaryNum:    { fontSize: fs(24), fontWeight: '800' },
  summaryLabel:  { fontSize: fs(11), fontWeight: '600', marginTop: rs(2) },
  discoverCard:  { flexDirection: 'row', alignItems: 'center', gap: rs(12), backgroundColor: C.bgCard, borderRadius: rs(16), padding: rs(16), borderWidth: 1, borderColor: C.border },
  verifyBanner: { flexDirection: 'row', alignItems: 'center', gap: rs(12), backgroundColor: C.amberPale, borderRadius: rs(12), padding: rs(12), marginBottom: rs(16), borderWidth: 1, borderColor: C.amber + '40' },
  verifyBannerTitle: { fontSize: fs(13), fontWeight: '700', color: C.amberDeep },
  verifyBannerSub: { fontSize: fs(11), color: C.amberDeep, opacity: 0.85 },
  profileIcon:   { width: rs(40), height: rs(40), borderRadius: rs(12), alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  savedRow:      { flexDirection: 'row', alignItems: 'center', gap: rs(12), backgroundColor: C.bgCard, borderRadius: rs(14), padding: rs(12), marginBottom: rs(8), borderWidth: 1, borderColor: C.border },
  savedEmoji:    { width: rs(56), height: rs(56), borderRadius: rs(14), alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  savedName:     { fontSize: fs(14), fontWeight: '700', color: C.slate },
  savedDesc:     { fontSize: fs(12), color: C.slateMid, marginTop: rs(2) },
  savedPill:     { borderRadius: rs(8), paddingHorizontal: rs(8), paddingVertical: rs(3) },
  savedPillText: { fontSize: fs(10), fontWeight: '600' },
  sheetHeader:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: rs(16), borderBottomWidth: 1, borderBottomColor: C.border },
  sheetTitle:    { fontSize: fs(16), fontWeight: '700', color: C.slate },
  editAvatar:    { width: rs(100), height: rs(100), borderRadius: rs(50) },
  cameraBadge:   { position: 'absolute', bottom: 0, right: 0, width: rs(32), height: rs(32), borderRadius: rs(16), backgroundColor: C.rose, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.bgPage },
  label:         { fontSize: fs(12), fontWeight: '700', color: C.slateMid, marginBottom: rs(8), textTransform: 'uppercase', letterSpacing: 0.5 },
  input:         { backgroundColor: C.bgMuted, borderRadius: rs(12), paddingHorizontal: rs(14), paddingVertical: rs(12), fontSize: fs(15), color: C.slate, borderWidth: 1, borderColor: C.border },
  craftChip:     { flex: 1, alignItems: 'center', backgroundColor: C.bgMuted, borderRadius: rs(12), paddingVertical: rs(12), borderWidth: 1, borderColor: C.border },
  craftChipActive:{ backgroundColor: C.rose, borderColor: C.rose },
  craftChipText: { fontSize: fs(13), fontWeight: '600', color: C.slate },
  personRow:     { flexDirection: 'row', alignItems: 'center', gap: rs(12), backgroundColor: C.bgCard, borderRadius: rs(14), padding: rs(12), marginBottom: rs(8), borderWidth: 1, borderColor: C.border },
  personAvatar:  { width: rs(44), height: rs(44), borderRadius: rs(22) },
  personName:    { fontSize: fs(14), fontWeight: '700', color: C.slate },
  personBio:     { fontSize: fs(12), color: C.slateMid, marginTop: rs(1) },
  followBtnSmall:{ backgroundColor: C.rose, borderRadius: rs(16), paddingHorizontal: rs(16), paddingVertical: rs(7) },
  followingBtnSmall:{ backgroundColor: C.bgMuted, borderWidth: 1, borderColor: C.border },
  followBtnSmallText:{ fontSize: fs(12), fontWeight: '700', color: C.white },
});