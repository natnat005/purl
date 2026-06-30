import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';
import { Alert } from 'react-native';
import { C } from './src/constants/theme';
import {
  useFonts,
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_400Regular_Italic,
  PlayfairDisplay_700Bold_Italic,
} from '@expo-google-fonts/playfair-display';

import SplashScreen    from './src/screens/SplashScreen';
import AuthScreen      from './src/screens/AuthScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LibraryScreen   from './src/screens/LibraryScreen';
import ProjectsScreen  from './src/screens/ProjectsScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import ToolsScreen     from './src/screens/ToolsScreen';
import ProfileScreen   from './src/screens/ProfileScreen';
import TabBar          from './src/components/TabBar';

function FadeScreen({ children, active }) {
  const opacity = useRef(new Animated.Value(active ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(opacity, { toValue: active ? 1 : 0, duration: 200, useNativeDriver: true }).start();
  }, [active]);
  return (
    <Animated.View pointerEvents={active ? 'auto' : 'none'}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity }}>
      {children}
    </Animated.View>
  );
}

function MainApp() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_400Regular_Italic,
    PlayfairDisplay_700Bold_Italic,
  });

  const [showSplash, setShowSplash] = useState(null);
  const [user, setUser]             = useState(null);
  const [needsOnboard, setNeedsOnboard] = useState(null); // null = checking
  const [profileAlert, setProfileAlert] = useState(false);
  const [tab, setTab]               = useState('library');
  const [projects, setProjects]     = useState([]);
  const [joined, setJoined]         = useState([]);
  const [favorites, setFavorites]   = useState([]);
  const [homeSignal, setHomeSignal] = useState({});
  // When set, LibraryScreen will auto-open the detail modal for this pattern id.
  // Used by GetStartedScreen to jump straight to a recommended pattern.
  const [pendingPatternId, setPendingPatternId] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('hasSeenSplash')
      .then(val => setShowSplash(val !== 'true'))
      .catch(() => setShowSplash(true));
  }, []);

  useEffect(() => {
    let pollId;
    const unsub = onAuthStateChanged(auth, async u => {
      if (pollId) { clearInterval(pollId); pollId = null; }
      if (u) {
        await u.reload();
        // Relaxed: any signed-in user gets into the app; verification is now optional
        setUser(u);
      } else {
        setUser(null);
      }
    });
    return () => { unsub(); if (pollId) clearInterval(pollId); };
  }, []);

  useEffect(() => {
    if (!user) { setNeedsOnboard(null); return; }
    AsyncStorage.getItem('stitchProjects').then(r => { if (r) setProjects(JSON.parse(r)); }).catch(() => {});
    AsyncStorage.getItem('stitchClubs').then(r => { if (r) setJoined(JSON.parse(r)); }).catch(() => {});
    AsyncStorage.getItem('favorites').then(r => { if (r) setFavorites(JSON.parse(r)); }).catch(() => {});
    // Check if this user has completed onboarding
    getDoc(doc(db, 'users', user.uid))
      .then(snap => setNeedsOnboard(!(snap.exists() && snap.data().onboarded)))
      .catch(() => setNeedsOnboard(false));
  }, [user]);

  // Watch follower count → show a dot on Profile when it grows past last-seen
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'users', user.uid), async snap => {
      if (!snap.exists()) return;
      const count = (snap.data().followers || []).length;
      const seenRaw = await AsyncStorage.getItem('seenFollowerCount').catch(() => null);
      const seen = seenRaw ? parseInt(seenRaw) : 0;
      if (count > seen) setProfileAlert(true);
    });
    return unsub;
  }, [user]);

  // When user opens Profile, clear the alert and remember current count
  useEffect(() => {
    if (tab !== 'profile' || !user) return;
    setProfileAlert(false);
    getDoc(doc(db, 'users', user.uid))
      .then(snap => {
        const count = snap.exists() ? (snap.data().followers || []).length : 0;
        AsyncStorage.setItem('seenFollowerCount', String(count)).catch(() => {});
      })
      .catch(() => {});
  }, [tab, user]);

  const saveProjects = u => { setProjects(u); AsyncStorage.setItem('stitchProjects', JSON.stringify(u)).catch(() => {}); };
  const handleToggleFavorite = (item) => {
    const next = favorites.includes(item.id)
      ? favorites.filter(id => id !== item.id)
      : [...favorites, item.id];
    setFavorites(next);
    AsyncStorage.setItem('favorites', JSON.stringify(next)).catch(() => {});
  };
  const handleStartProject   = item => { if (projects.find(p => p.id === item.id)) return; saveProjects([...projects, { ...item, progress: 0, startedAt: new Date().toISOString() }]); };
  const handleUpdateProgress = (id, pct) => saveProjects(projects.map(p => p.id === id ? { ...p, progress: pct } : p));
  const handleRemoveProject  = id => saveProjects(projects.filter(p => p.id !== id));
  const handleAddPhoto       = (id, photo) => saveProjects(projects.map(p => p.id === id ? { ...p, photo } : p));
  const handleUpdateNotes    = (id, notes) => saveProjects(projects.map(p => p.id === id ? { ...p, notes } : p));
  const handleShareProject   = (proj) => {
    Alert.alert(
      'Share to Community?',
      `Post "${proj.name}" to the Community feed for everyone to see?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Share', onPress: async () => {
          try {
            await addDoc(collection(db, 'feed'), {
              caption: `Just finished my ${proj.name}! 🎉`,
              photo: proj.photo || null,
              patternId: proj.id || null,
              patternName: proj.name || null,
              patternEmoji: proj.emoji || null,
              userId: user.uid,
              username: user.email?.split('@')[0] || 'Maker',
              likes: [], commentCount: 0,
              createdAt: serverTimestamp(),
            });
            Alert.alert('Shared! 🎉', 'Your finished project is now in the Community feed.');
          } catch (e) {
            Alert.alert('Error', 'Could not share. Try again.');
          }
        }},
      ]
    );
  };
  const handleSplashDone     = () => { AsyncStorage.setItem('hasSeenSplash', 'true'); setShowSplash(false); };

  const toggleClub = id => {
    const u = joined.includes(id) ? joined.filter(j => j !== id) : [...joined, id];
    setJoined(u); AsyncStorage.setItem('stitchClubs', JSON.stringify(u)).catch(() => {});
  };

  const handleTabPress = (newTab) => {
    if (newTab === tab) {
      setHomeSignal(prev => ({ ...prev, [newTab]: (prev[newTab] || 0) + 1 }));
    } else {
      setTab(newTab);
    }
  };

  if (!fontsLoaded || showSplash === null) return <View style={{ flex: 1, backgroundColor: C.roseDeep }} />;
  if (showSplash)  return <SplashScreen onDone={handleSplashDone} />;
  if (!user)       return <AuthScreen onAuthed={async () => {
    try { await auth.currentUser?.reload(); } catch (e) {}
    if (auth.currentUser?.emailVerified) setUser(auth.currentUser);
  }} />;
  if (needsOnboard === null) return <View style={{ flex: 1, backgroundColor: C.bgPage }} />;
  if (needsOnboard) return <OnboardingScreen user={user} onDone={() => setNeedsOnboard(false)} />;

  const activeCount = projects.filter(p => p.progress < 100).length;

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <View style={{ flex: 1 }}>
        <FadeScreen active={tab === 'library'}>
          <LibraryScreen projects={projects} onStartProject={handleStartProject} user={user} homeSignal={homeSignal.library} favorites={favorites} onToggleFavorite={handleToggleFavorite}
            pendingPatternId={pendingPatternId} onConsumePendingPattern={() => setPendingPatternId(null)} />
        </FadeScreen>
        <FadeScreen active={tab === 'projects'}>
          <ProjectsScreen projects={projects} onUpdate={handleUpdateProgress} onRemove={handleRemoveProject} onAddPhoto={handleAddPhoto} onShare={handleShareProject} onUpdateNotes={handleUpdateNotes} />
        </FadeScreen>
        <FadeScreen active={tab === 'community'}>
          <CommunityScreen user={user} joined={joined} onToggleClub={toggleClub} />
        </FadeScreen>
        <FadeScreen active={tab === 'tools'}>
          <ToolsScreen homeSignal={homeSignal.tools}
            onOpenPattern={(patternId) => {
              setPendingPatternId(patternId);
              setTab('library');
            }} />
        </FadeScreen>
        <FadeScreen active={tab === 'profile'}>
          <ProfileScreen user={user} projects={projects} favorites={favorites} onToggleFavorite={handleToggleFavorite} />
        </FadeScreen>
      </View>
      <TabBar tab={tab} setTab={handleTabPress} projectCount={activeCount} profileAlert={profileAlert} />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <MainApp />
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgPage },
});