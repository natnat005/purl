import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Modal, Alert, KeyboardAvoidingView,
  Platform, FlatList, RefreshControl, Animated, Image, Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  collection, addDoc, onSnapshot, orderBy,
  query, updateDoc, doc, arrayUnion, arrayRemove,
  serverTimestamp, limit, deleteDoc,
} from 'firebase/firestore';
import { db } from '../../firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { C, rs, fs, FONTS } from '../constants/theme';
import { haptic } from '../utils/haptics';
import { PATTERNS as FALLBACK_PATTERNS } from '../data/patterns';
import { usePatterns } from '../hooks/usePatterns';
import { pickImage, takePhoto } from '../utils/imagePicker';
import PublicProfileSheet from '../components/PublicProfileSheet';
import { timeAgo } from '../utils/timeAgo';
import { CRAFT_ICONS } from '../utils/icons';

function CommentSheet({ post, user, visible, onClose }) {
  const [comments, setComments] = useState([]);
  const [input, setInput]       = useState('');
  const [sending, setSending]   = useState(false);

  useEffect(() => {
    if (!visible || !post) return;
    const q = query(collection(db, 'feed', post.id, 'comments'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, snap => setComments(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return unsub;
  }, [visible, post?.id]);

  const sendComment = async () => {
    const text = input.trim();
    if (!text || !post) return;
    setInput('');
    setSending(true);
    try {
      await addDoc(collection(db, 'feed', post.id, 'comments'), {
        text, userId: user.uid,
        username: user.email?.split('@')[0] || 'Maker',
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'feed', post.id), { commentCount: (post.commentCount || 0) + 1 });
      haptic.success();
    } catch (e) { Alert.alert('Error', 'Could not send.'); setInput(text); }
    setSending(false);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bgPage }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={s.sheetHeader}>
          <Text style={s.sheetTitle}>Comments</Text>
          <TouchableOpacity onPress={() => { Keyboard.dismiss(); onClose(); }}><Ionicons name="close" size={rs(22)} color={C.slate} /></TouchableOpacity>
        </View>
        <FlatList data={comments} keyExtractor={c => c.id}
          contentContainerStyle={{ padding: rs(16), flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: rs(40) }}>
              <Text style={{ fontSize: rs(32), marginBottom: rs(8) }}>💬</Text>
              <Text style={{ fontSize: fs(14), color: C.slateMid }}>No comments yet. Be first!</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={s.comment}>
              <View style={[s.commentAvatar, { backgroundColor: C.rosePale }]}>
                <Text style={{ fontSize: fs(12), fontWeight: '700', color: C.rose }}>{item.username?.[0]?.toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.commentUser}>{item.username}</Text>
                <Text style={s.commentText}>{item.text}</Text>
              </View>
            </View>
          )}
        />
        <View style={s.inputRow}>
          <TextInput style={s.input} value={input} onChangeText={setInput}
            placeholder="Add a comment..." placeholderTextColor={C.slateLight}
            multiline maxLength={300} returnKeyType="send" blurOnSubmit={false}
            onSubmitEditing={sendComment} />
          <TouchableOpacity onPress={sendComment} disabled={!input.trim() || sending}
            style={[s.sendBtn, (!input.trim() || sending) && { opacity: 0.4 }]} activeOpacity={0.85}>
            <Ionicons name="send" size={rs(16)} color={C.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function NewPostSheet({ user, visible, onClose }) {
  const [caption, setCaption]   = useState('');
  const [pattern, setPattern]   = useState(null);
  const [photo, setPhoto]       = useState(null);
  const [posting, setPosting]   = useState(false);
  const [pickOpen, setPickOpen] = useState(false);
  const { patterns: PATTERNS }  = usePatterns();

  const addPhoto = async () => {
    haptic.light();
    Alert.alert('Add a photo', 'Choose a source', [
      { text: 'Take Photo', onPress: async () => {
        const res = await takePhoto();
        if (res.uri) setPhoto(res.uri);
        else if (res.error) Alert.alert('Oops', res.error);
      }},
      { text: 'Choose from Library', onPress: async () => {
        const res = await pickImage();
        if (res.uri) setPhoto(res.uri);
        else if (res.error) Alert.alert('Oops', res.error);
      }},
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const post = async () => {
    if (!caption.trim() && !photo) { Alert.alert('Add a caption or photo first!'); return; }
    setPosting(true);
    try {
      await addDoc(collection(db, 'feed'), {
        caption: caption.trim(),
        photo: photo || null,
        patternId: pattern?.id || null,
        patternName: pattern?.name || null,
        patternType: pattern?.type || null,
        userId: user.uid,
        username: user.email?.split('@')[0] || 'Maker',
        likes: [], commentCount: 0,
        createdAt: serverTimestamp(),
      });
      haptic.success();
      setCaption(''); setPattern(null); setPhoto(null); onClose();
    } catch (e) { Alert.alert('Error', 'Could not post.'); }
    setPosting(false);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bgPage }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={s.sheetHeader}>
          <TouchableOpacity onPress={onClose}><Text style={{ fontSize: fs(15), color: C.slateMid }}>Cancel</Text></TouchableOpacity>
          <Text style={s.sheetTitle}>New Post</Text>
          <TouchableOpacity onPress={post} disabled={posting || !caption.trim()}
            style={[s.postBtn, (!caption.trim() || posting) && { opacity: 0.4 }]}>
            <Text style={s.postBtnText}>{posting ? 'Posting...' : 'Share'}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{ padding: rs(16) }} keyboardShouldPersistTaps="handled">
          <View style={s.captionArea}>
            <View style={s.userAvatar}>
              <Text style={{ fontSize: fs(16), fontWeight: '700', color: C.rose }}>{user.email?.[0]?.toUpperCase()}</Text>
            </View>
            <TextInput style={s.captionInput} value={caption} onChangeText={setCaption}
              placeholder="Share what you're making... 🧶" placeholderTextColor={C.slateLight}
              multiline maxLength={500} autoFocus />
          </View>
          {/* Photo */}
          {photo ? (
            <View style={{ marginBottom: rs(16) }}>
              <Image source={{ uri: photo }} style={{ width: '100%', height: rs(220), borderRadius: rs(14) }} resizeMode="cover" />
              <TouchableOpacity onPress={() => setPhoto(null)}
                style={{ position: 'absolute', top: rs(8), right: rs(8), backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: rs(16), width: rs(32), height: rs(32), alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="close" size={rs(18)} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={addPhoto} activeOpacity={0.85} style={s.photoBtn}>
              <Ionicons name="image-outline" size={rs(22)} color={C.rose} />
              <Text style={{ fontSize: fs(14), color: C.rose, fontWeight: '600' }}>Add a photo</Text>
            </TouchableOpacity>
          )}

          <Text style={s.sectionLabel}>Tag a pattern (optional)</Text>
          <TouchableOpacity onPress={() => setPickOpen(true)} activeOpacity={0.85} style={s.patternPickerBtn}>
            {pattern ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs(10) }}>
                <View style={{ width: rs(28), height: rs(28), borderRadius: rs(14), backgroundColor: C.rose + '20', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name={CRAFT_ICONS[pattern.type] || 'shapes-outline'} size={rs(16)} color={C.rose} />
                </View>
                <Text style={{ fontSize: fs(14), fontWeight: '600', color: C.slate, flex: 1 }}>{pattern.name}</Text>
                <TouchableOpacity onPress={() => setPattern(null)}>
                  <Ionicons name="close-circle" size={rs(18)} color={C.slateMid} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs(8) }}>
                <Ionicons name="pricetag-outline" size={rs(18)} color={C.slateMid} />
                <Text style={{ fontSize: fs(14), color: C.slateMid }}>Tag a pattern...</Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', gap: rs(10), backgroundColor: C.amberPale, borderRadius: rs(12), padding: rs(14), alignItems: 'flex-start' }}>
            <Ionicons name="bulb-outline" size={rs(16)} color={C.amberDeep} style={{ marginTop: rs(2) }} />
            <Text style={{ flex: 1, fontSize: fs(12), color: C.amberDeep, lineHeight: fs(20) }}>
              Share WIPs, finished objects, yarn hauls, or anything crafting-related.
            </Text>
          </View>
        </ScrollView>
        <Modal visible={pickOpen} animationType="slide" presentationStyle="pageSheet"
          onRequestClose={() => setPickOpen(false)}>
          <View style={{ flex: 1, backgroundColor: C.bgPage, paddingTop: rs(52) }}>
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>Tag a Pattern</Text>
              <TouchableOpacity onPress={() => setPickOpen(false)}>
                <Ionicons name="close" size={rs(22)} color={C.slate} />
              </TouchableOpacity>
            </View>
            <FlatList data={PATTERNS} keyExtractor={p => p.id}
              contentContainerStyle={{ padding: rs(16) }}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => { setPattern(item); setPickOpen(false); haptic.light(); }}
                  activeOpacity={0.8} style={s.patternRow}>
                  <View style={{ width: rs(36), height: rs(36), borderRadius: rs(18), backgroundColor: C.rose + '15', alignItems: 'center', justifyContent: 'center', marginRight: rs(12) }}>
                    <Ionicons name={CRAFT_ICONS[item.type] || 'shapes-outline'} size={rs(20)} color={C.rose} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: fs(14), fontWeight: '600', color: C.slate }}>{item.name}</Text>
                    <Text style={{ fontSize: fs(11), color: C.slateMid }}>{item.type} · {item.cat}</Text>
                  </View>
                  {pattern?.id === item.id && <Ionicons name="checkmark" size={rs(18)} color={C.rose} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function PostCard({ post, user, onComment, onViewProfile, onDeletePost, onReportOrBlock }) {
  const [liked, setLiked]   = useState(post.likes?.includes(user.uid));
  const likeAnim = useRef(new Animated.Value(1)).current;
  const likeCount = post.likes?.length || 0;
  const time = timeAgo(post.createdAt);

  const toggleLike = async () => {
    haptic.light();
    const newLiked = !liked;
    setLiked(newLiked);
    Animated.sequence([
      Animated.spring(likeAnim, { toValue: 1.35, useNativeDriver: true, speed: 60 }),
      Animated.spring(likeAnim, { toValue: 1,    useNativeDriver: true, speed: 40 }),
    ]).start();
    try {
      await updateDoc(doc(db, 'feed', post.id), {
        likes: newLiked ? arrayUnion(user.uid) : arrayRemove(user.uid),
      });
    } catch (e) {}
  };

  return (
    <View style={s.postCard}>
      <View style={s.postHeader}>
        <TouchableOpacity onPress={() => { haptic.light(); onViewProfile(post.userId); }}
          activeOpacity={0.7} style={s.postAvatar}>
          <Text style={{ fontSize: fs(16), fontWeight: '800', color: C.rose }}>{post.username?.[0]?.toUpperCase()}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { haptic.light(); onViewProfile(post.userId); }}
          activeOpacity={0.7} style={{ flex: 1 }}>
          <Text style={s.postUsername}>{post.username}</Text>
          <Text style={s.postTime}>{time}</Text>
        </TouchableOpacity>
        {(post.patternType || post.patternName) && (
          <View style={s.patternTag}>
            <Ionicons
              name={post.patternType ? (CRAFT_ICONS[post.patternType] || 'shapes-outline') : 'shapes-outline'}
              size={rs(12)}
              color={C.slate}
            />
            <Text style={s.patternTagText} numberOfLines={1}>{post.patternName}</Text>
          </View>
        )}
        {/* 3-dot menu: delete for own posts, report/block for others' posts */}
        <TouchableOpacity onPress={() => {
            haptic.light();
            if (post.userId === user?.uid) {
              onDeletePost && onDeletePost(post);
            } else {
              onReportOrBlock && onReportOrBlock(post);
            }
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ padding: rs(4), marginLeft: rs(4) }}>
          <Ionicons name="ellipsis-horizontal" size={rs(20)} color={C.slateMid} />
        </TouchableOpacity>
      </View>
      {post.caption ? <Text style={s.caption}>{post.caption}</Text> : null}
      {post.photo ? (
        <Image source={{ uri: post.photo }} style={{ width: '100%', height: rs(280), borderRadius: rs(12), marginBottom: rs(12) }} resizeMode="cover" />
      ) : null}
      <View style={s.actions}>
        <TouchableOpacity onPress={toggleLike} activeOpacity={0.8} style={s.actionBtn}>
          <Animated.View style={{ transform: [{ scale: likeAnim }] }}>
            <Ionicons name={liked ? 'heart' : 'heart-outline'} size={rs(22)} color={liked ? C.rose : C.slateMid} />
          </Animated.View>
          {likeCount > 0 && <Text style={[s.actionCount, liked && { color: C.rose }]}>{likeCount}</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { haptic.light(); onComment(post); }} activeOpacity={0.8} style={s.actionBtn}>
          <Ionicons name="chatbubble-outline" size={rs(20)} color={C.slateMid} />
          {post.commentCount > 0 && <Text style={s.actionCount}>{post.commentCount}</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function FeedScreen({ user, hideHeader }) {
  const [posts, setPosts]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newPostOpen, setNewPostOpen]   = useState(false);
  const [commentPost, setCommentPost]   = useState(null);
  const [following, setFollowing]       = useState([]);
  const [viewProfileId, setViewProfileId] = useState(null);
  const [blockedUsers, setBlockedUsers] = useState([]);

  // Load blocked users from local storage
  useEffect(() => {
    AsyncStorage.getItem('blockedUsers').then(r => { if (r) setBlockedUsers(JSON.parse(r)); }).catch(() => {});
  }, []);

  const handleReportOrBlock = (post) => {
    haptic.light();
    Alert.alert(
      `Post by ${post.username || 'Maker'}`,
      'What would you like to do?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Report this post', style: 'destructive', onPress: () => {
          Alert.alert(
            'Report this post?',
            'Reports are sent to the Purl moderation team for review. Please report content that is abusive, harassing, or violates community guidelines.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Report', style: 'destructive', onPress: async () => {
                try {
                  await addDoc(collection(db, 'reports'), {
                    postId: post.id,
                    postUserId: post.userId,
                    postUsername: post.username || '',
                    postCaption: (post.caption || '').slice(0, 500),
                    reportedBy: user?.uid || 'anonymous',
                    reportedByName: user?.email?.split('@')[0] || '',
                    createdAt: serverTimestamp(),
                    status: 'pending',
                  });
                  Alert.alert('Thank you', 'Your report has been received. Our team will review it within 24 hours.');
                } catch (e) {
                  Alert.alert('Error', 'Could not send report. Please try again.');
                }
              }},
            ]
          );
        }},
        { text: `Block ${post.username || 'this user'}`, style: 'destructive', onPress: () => {
          Alert.alert(
            `Block ${post.username || 'this user'}?`,
            "You won't see their posts or comments anymore. You can unblock them later from Settings.",
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Block', style: 'destructive', onPress: async () => {
                const next = [...blockedUsers, post.userId];
                setBlockedUsers(next);
                AsyncStorage.setItem('blockedUsers', JSON.stringify(next)).catch(() => {});
                haptic.medium();
              }},
            ]
          );
        }},
      ]
    );
  };

  const handleDeletePost = (post) => {
    Alert.alert(
      'Delete post?',
      'This will remove your post from the Community feed. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await deleteDoc(doc(db, 'feed', post.id));
            haptic.medium();
          } catch (e) {
            Alert.alert('Error', 'Could not delete. Try again.');
          }
        }},
      ]
    );
  };

  useEffect(() => {
    const q = query(collection(db, 'feed'), orderBy('createdAt', 'desc'), limit(50));
    const unsub = onSnapshot(q, async snap => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPosts(docs);
      setLoading(false); setRefreshing(false);

      // Seed a welcome post once if the feed is completely empty
      if (docs.length === 0) {
        const seededFlag = await AsyncStorage.getItem('feedSeeded').catch(() => null);
        if (!seededFlag) {
          await AsyncStorage.setItem('feedSeeded', 'true').catch(() => {});
          try {
            await addDoc(collection(db, 'feed'), {
              caption: "Welcome to the Purl community! This is the place to share your works in progress, finished makes, and yarn hauls. Tap the heart to cheer each other on, and tap a name to follow other makers. Happy crafting!",
              photo: null, patternId: null, patternName: null, patternEmoji: null,
              userId: 'purl-team', username: 'Purl Team',
              likes: [], commentCount: 0,
              createdAt: serverTimestamp(),
            });
          } catch (e) {}
        }
      }
    });
    return unsub;
  }, []);

  // Load who I follow (live)
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'users', user.uid), snap => {
      if (snap.exists()) setFollowing(snap.data().following || []);
    });
    return unsub;
  }, [user.uid]);

  // One unified feed, but show posts from people you follow first
  // (the rest acts as "suggested" content underneath)
  const visiblePosts = [...posts]
    .filter(p => !blockedUsers.includes(p.userId))
    .sort((a, b) => {
      const aFollow = following.includes(a.userId) ? 1 : 0;
      const bFollow = following.includes(b.userId) ? 1 : 0;
      if (aFollow !== bFollow) return bFollow - aFollow;
      return 0;
    });

  return (
    <View style={{ flex: 1, backgroundColor: C.bgPage }}>
      {!hideHeader && (
        <View style={s.header}>
          <Text style={s.headerTitle}>Community</Text>
        </View>
      )}

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: fs(14), color: C.slateMid }}>Loading posts...</Text>
        </View>
      ) : (
        <FlatList data={visiblePosts} keyExtractor={p => p.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: rs(24) }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(true)} tintColor={C.rose} />}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: rs(60), paddingHorizontal: rs(32) }}>
              <Ionicons name="leaf-outline" size={rs(44)} color={C.sage} style={{ marginBottom: rs(12) }} />
              <Text style={s.emptyTitle}>Be the first to post</Text>
              <Text style={s.emptySub}>Share your works in progress, finished objects, and yarn hauls with the community.</Text>
              <TouchableOpacity onPress={() => setNewPostOpen(true)}
                style={[s.newPostBtn, { marginTop: rs(20), paddingHorizontal: rs(24) }]} activeOpacity={0.85}>
                <Ionicons name="add" size={rs(18)} color={C.white} />
                <Text style={s.newPostBtnText}>Create first post</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => <PostCard post={item} user={user} onComment={setCommentPost} onViewProfile={setViewProfileId} onDeletePost={handleDeletePost} onReportOrBlock={handleReportOrBlock} />}
        />
      )}

      <NewPostSheet user={user} visible={newPostOpen} onClose={() => setNewPostOpen(false)} />
      <CommentSheet post={commentPost} user={user} visible={!!commentPost} onClose={() => setCommentPost(null)} />
      <PublicProfileSheet userId={viewProfileId} visible={!!viewProfileId} onClose={() => setViewProfileId(null)} />

      {/* Floating new-post button */}
      <TouchableOpacity onPress={() => { haptic.medium(); setNewPostOpen(true); }}
        style={s.fab} activeOpacity={0.88}>
        <Ionicons name="add" size={rs(28)} color={C.white} />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  header:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: rs(16), paddingVertical: rs(14), borderBottomWidth: 1, borderBottomColor: C.border + '60' },
  feedTabs:        { flexDirection: 'row', gap: rs(24), paddingHorizontal: rs(20), paddingTop: rs(12), borderBottomWidth: 1, borderBottomColor: C.border + '60' },
  feedTab:         { paddingBottom: rs(10), alignItems: 'center' },
  feedTabText:     { fontSize: fs(15), fontWeight: '600', color: C.slateLight },
  feedTabTextActive:{ color: C.slate, fontWeight: '800' },
  feedTabUnderline:{ position: 'absolute', bottom: 0, left: 0, right: 0, height: rs(3), borderRadius: rs(2), backgroundColor: C.rose },
  fab:             { position: 'absolute', right: rs(20), bottom: rs(24), width: rs(56), height: rs(56), borderRadius: rs(28), backgroundColor: C.rose, alignItems: 'center', justifyContent: 'center', shadowColor: C.roseDeep, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6 },
  headerTitle:     { fontSize: fs(26), fontWeight: '800', color: C.slate, fontFamily: FONTS.heading },
  newPostBtn:      { flexDirection: 'row', alignItems: 'center', gap: rs(6), backgroundColor: C.rose, borderRadius: rs(20), paddingHorizontal: rs(16), paddingVertical: rs(8) },
  newPostBtnText:  { fontSize: fs(13), fontWeight: '700', color: C.white },
  postCard:        { backgroundColor: C.bgCard, marginHorizontal: rs(16), marginTop: rs(12), borderRadius: rs(16), padding: rs(16), borderWidth: 1, borderColor: C.border },
  postHeader:      { flexDirection: 'row', alignItems: 'center', marginBottom: rs(12), gap: rs(10) },
  postAvatar:      { width: rs(40), height: rs(40), borderRadius: rs(20), backgroundColor: C.rosePale, alignItems: 'center', justifyContent: 'center' },
  postUsername:    { fontSize: fs(14), fontWeight: '700', color: C.slate },
  postTime:        { fontSize: fs(11), color: C.slateLight },
  patternTag:      { flexDirection: 'row', alignItems: 'center', gap: rs(4), backgroundColor: C.amberPale, borderRadius: rs(10), paddingHorizontal: rs(8), paddingVertical: rs(4), maxWidth: rs(130) },
  patternTagText:  { fontSize: fs(10), color: C.amberDeep, fontWeight: '600' },
  caption:         { fontSize: fs(14), color: C.slate, lineHeight: fs(22), marginBottom: rs(12) },
  actions:         { flexDirection: 'row', gap: rs(16), borderTopWidth: 1, borderTopColor: C.border, paddingTop: rs(12) },
  actionBtn:       { flexDirection: 'row', alignItems: 'center', gap: rs(6) },
  actionCount:     { fontSize: fs(13), color: C.slateMid, fontWeight: '600' },
  emptyTitle:      { fontSize: fs(20), fontWeight: '800', color: C.slate, marginBottom: rs(8) },
  emptySub:        { fontSize: fs(14), color: C.slateMid, textAlign: 'center', lineHeight: fs(22) },
  sheetHeader:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: rs(16), borderBottomWidth: 1, borderBottomColor: C.border },
  sheetTitle:      { fontSize: fs(16), fontWeight: '700', color: C.slate },
  postBtn:         { backgroundColor: C.rose, borderRadius: rs(16), paddingHorizontal: rs(16), paddingVertical: rs(7) },
  postBtnText:     { fontSize: fs(14), fontWeight: '700', color: C.white },
  captionArea:     { flexDirection: 'row', gap: rs(12), marginBottom: rs(20) },
  userAvatar:      { width: rs(40), height: rs(40), borderRadius: rs(20), backgroundColor: C.rosePale, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  captionInput:    { flex: 1, fontSize: fs(15), color: C.slate, lineHeight: fs(24), minHeight: rs(100) },
  sectionLabel:    { fontSize: fs(12), fontWeight: '700', color: C.slateMid, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: rs(10) },
  patternPickerBtn:{ backgroundColor: C.bgMuted, borderRadius: rs(12), padding: rs(14), borderWidth: 1, borderColor: C.border, marginBottom: rs(20) },
  photoBtn:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: rs(8), backgroundColor: C.rosePale, borderRadius: rs(12), padding: rs(16), marginBottom: rs(16), borderWidth: 1, borderColor: C.rose + '30', borderStyle: 'dashed' },
  comment:         { flexDirection: 'row', gap: rs(10), marginBottom: rs(14) },
  commentAvatar:   { width: rs(32), height: rs(32), borderRadius: rs(16), alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  commentUser:     { fontSize: fs(12), fontWeight: '700', color: C.slate, marginBottom: rs(2) },
  commentText:     { fontSize: fs(13), color: C.slate, lineHeight: fs(20) },
  inputRow:        { flexDirection: 'row', alignItems: 'flex-end', gap: rs(10), padding: rs(12), borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.bgCard },
  input:           { flex: 1, backgroundColor: C.bgMuted, borderRadius: rs(20), paddingHorizontal: rs(16), paddingVertical: rs(10), fontSize: fs(14), color: C.slate, maxHeight: rs(100) },
  sendBtn:         { width: rs(38), height: rs(38), borderRadius: rs(19), backgroundColor: C.rose, alignItems: 'center', justifyContent: 'center' },
  patternRow:      { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgCard, borderRadius: rs(12), padding: rs(12), marginBottom: rs(8), borderWidth: 1, borderColor: C.border },
});