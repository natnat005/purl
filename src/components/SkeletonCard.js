import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { C, rs, CARD_W } from '../constants/theme';

function ShimmerBox({ style }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1,   duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return <Animated.View style={[style, { opacity }]} />;
}

export function SkeletonPatternCard() {
  return (
    <View style={s.card}>
      <ShimmerBox style={s.imageArea} />
      <View style={s.info}>
        <ShimmerBox style={s.titleLine} />
        <ShimmerBox style={s.titleLineShort} />
        <ShimmerBox style={s.metaLine} />
      </View>
    </View>
  );
}

export function SkeletonGrid() {
  return (
    <View>
      {[0, 1, 2].map(row => (
        <View key={row} style={s.row}>
          <SkeletonPatternCard />
          <SkeletonPatternCard />
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row:           { flexDirection: 'row', paddingHorizontal: rs(16), gap: rs(12), marginBottom: rs(12) },
  card:          { width: CARD_W, backgroundColor: C.bgCard, borderRadius: rs(16), overflow: 'hidden', borderWidth: 1, borderColor: C.border },
  imageArea:     { height: rs(130), backgroundColor: C.bgMuted },
  info:          { padding: rs(10), gap: rs(8) },
  titleLine:     { height: rs(14), backgroundColor: C.bgMuted, borderRadius: rs(4), width: '85%' },
  titleLineShort:{ height: rs(12), backgroundColor: C.bgMuted, borderRadius: rs(4), width: '65%' },
  metaLine:      { height: rs(10), backgroundColor: C.bgMuted, borderRadius: rs(4), width: '50%' },
});