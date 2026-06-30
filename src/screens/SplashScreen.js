import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Dimensions, StatusBar, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, rs, fs, FONTS } from '../constants/theme';

const { width: W, height: H } = Dimensions.get('window');

const SLIDES = [
  {
    useImage: true,
    title: 'Welcome',
    subtitle: 'Your complete guide to crochet, knitting, and sewing — from your very first chain to your first finished garment.',
    bg: '#3A233A',
    accent: '#E2A9A7',
  },
  {
    icon: 'book-outline',
    title: 'Learn at your own pace',
    subtitle: 'Step-by-step pattern instructions, detailed stitch guides, and a comprehensive terminology reference. Everything in one place.',
    bg: C.sageDeep || '#2C4A3E',
    accent: C.sagePale || '#E8F5E9',
  },
  {
    icon: 'cut-outline',
    title: 'Crochet, Knit & Sew',
    subtitle: 'Explore patterns across all three crafts. From beginner granny squares to advanced tailored blazers — there\'s a project for every skill level.',
    bg: C.tealDeep || '#1A4D4D',
    accent: C.tealPale || '#E0F2F1',
  },
  {
    icon: 'people-outline',
    title: 'Join a community',
    subtitle: 'Connect with makers in craft clubs. Share your WIPs, join monthly craft-alongs, get help, and celebrate your finished objects together.',
    bg: '#5A3A7A',
    accent: C.lavPale || '#F3E5F5',
  },
];

function SlideContent({ slide }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 550, useNativeDriver: true }).start();
  }, []);
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });

  return (
    <Animated.View style={[s.content, { opacity: anim, transform: [{ translateY }] }]}>
      {slide.useImage ? (
        <View style={s.heroWrap}>
          <View style={s.frameRow}>
            <Text style={[s.flourishChar, { transform: [{ scaleX: -1 }] }]}>❧</Text>
            <Text style={s.wordmark}>Purl</Text>
            <Text style={s.flourishChar}>❧</Text>
          </View>
          <Text style={s.craftTagline}>crochet · knitting · sewing</Text>
        </View>
      ) : (
        <View style={[s.emojiBubble, { backgroundColor: (slide.accent || '#FFFFFF') + '22' }]}>
          <Ionicons name={slide.icon} size={rs(52)} color={slide.accent || '#FFFFFF'} />
        </View>
      )}
      <Text style={s.title}>{slide.title}</Text>
      <Text style={s.subtitle}>{slide.subtitle}</Text>
    </Animated.View>
  );
}

export default function SplashScreen({ onDone }) {
  const [index, setIndex] = React.useState(0);
  const goNext = () => {
    if (index < SLIDES.length - 1) {
      setIndex(i => i + 1);
    } else { onDone(); }
  };
  const goBack = () => {
    if (index > 0) setIndex(i => i - 1);
  };
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;
  const isFirst = index === 0;
  return (
    <View style={[s.root, { backgroundColor: slide.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={slide.bg} />

      <SlideContent key={index} slide={slide} />
      <View style={s.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[s.dot, i === index && [s.dotActive, { backgroundColor: slide.useImage ? '#E2A9A7' : '#FFFFFF' }]]} />
        ))}
      </View>
      <TouchableOpacity
        style={[s.btn, { backgroundColor: 'rgba(255,255,255,0.18)' }]}
        onPress={goNext}
        activeOpacity={0.85}>
        <Text style={s.btnText}>{isLast ? 'Get Started' : 'Continue'}</Text>
      </TouchableOpacity>
      <View style={{ height: rs(40) }} />

      {/* Back button — top left, hidden on first slide */}
      {!isFirst && (
        <TouchableOpacity
          style={s.back}
          onPress={goBack}
          activeOpacity={0.7}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
          <Ionicons name="chevron-back" size={rs(22)} color="rgba(255,255,255,0.85)" />
        </TouchableOpacity>
      )}

      {/* Skip button — top right, hidden on last slide */}
      {!isLast && (
        <TouchableOpacity
          style={s.skip}
          onPress={onDone}
          activeOpacity={0.7}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
          <Text style={s.skipText}>Skip</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: rs(32), paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  skip:        { position: 'absolute', top: rs(56), right: rs(24), padding: rs(8), zIndex: 100, elevation: 10 },
  skipText:    { fontSize: fs(14), color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  back:        { position: 'absolute', top: rs(54), left: rs(20), padding: rs(8), zIndex: 100, elevation: 10 },
  content:     { alignItems: 'center', flex: 1, justifyContent: 'center' },
  emojiBubble: { width: rs(120), height: rs(120), borderRadius: rs(60), alignItems: 'center', justifyContent: 'center', marginBottom: rs(32), overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 3 },
  heroWrap:    { height: rs(120), marginBottom: rs(32), alignItems: 'center', justifyContent: 'center' },
  frameRow:    { flexDirection: 'row', alignItems: 'center', gap: rs(14) },
  flourishChar:{ fontSize: fs(28), color: 'rgba(226,169,167,0.85)' },
  wordmark:    { fontSize: fs(60), fontWeight: '300', color: '#FFFFFF', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', letterSpacing: 1 },
  craftTagline:{ fontSize: fs(12), color: '#E2A9A7', letterSpacing: 2.5, marginTop: rs(14), textTransform: 'lowercase' },
  splashIconImage: { width: '100%', height: '100%', borderRadius: rs(60), transform: [{ scale: 1.80 }] },
  emoji:      { fontSize: rs(56) },
  title:      { fontSize: fs(34), fontWeight: '800', color: '#FFFFFF', textAlign: 'center', marginBottom: rs(16), letterSpacing: 0.3, fontFamily: FONTS.heading },
  subtitle:   { fontSize: fs(16), color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: fs(26) },
  dots:       { flexDirection: 'row', gap: rs(8), marginBottom: rs(32) },
  dot:        { width: rs(8), height: rs(8), borderRadius: rs(4), backgroundColor: 'rgba(255,255,255,0.35)' },
  dotActive:  { width: rs(24) },
  btn:        { borderRadius: rs(16), paddingVertical: rs(16), paddingHorizontal: rs(48) },
  btnText:    { fontSize: fs(16), fontWeight: '800', color: '#FFFFFF' },
});