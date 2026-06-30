import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, Easing } from 'react-native';

const { width: W, height: H } = Dimensions.get('window');

const COLORS = ['#E2A9A7', '#B5546A', '#7A2840', '#F5E6EA', '#C4853A', '#5A7A5E', '#7A6AAA', '#F0CBB0'];

function Piece({ delay, color, startX }) {
  const fall   = useRef(new Animated.Value(0)).current;
  const sway   = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity= useRef(new Animated.Value(0)).current;

  const size   = 6 + Math.random() * 8;
  const fallDuration = 2400 + Math.random() * 1600;
  const swayRange = 60 + Math.random() * 80;
  const spin = 360 * (2 + Math.random() * 4);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fall, { toValue: 1, duration: fallDuration, delay, useNativeDriver: true, easing: Easing.in(Easing.quad) }),
      Animated.loop(Animated.sequence([
        Animated.timing(sway, { toValue: 1, duration: 600 + Math.random() * 400, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(sway, { toValue: -1, duration: 600 + Math.random() * 400, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])),
      Animated.timing(rotate, { toValue: 1, duration: fallDuration, delay, useNativeDriver: true, easing: Easing.linear }),
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(fallDuration - 800),
        Animated.timing(opacity, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const translateY = fall.interpolate({ inputRange: [0, 1], outputRange: [-200, H + 40] });
  const translateX = sway.interpolate({ inputRange: [-1, 1], outputRange: [-swayRange / 2, swayRange / 2] });
  const rot = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${spin}deg`] });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: startX,
        width: size,
        height: size * 1.5,
        backgroundColor: color,
        borderRadius: 2,
        opacity,
        transform: [{ translateY }, { translateX }, { rotate: rot }],
      }}
    />
  );
}

export default function Confetti({ count = 80 }) {
  const pieces = Array.from({ length: count }).map((_, i) => ({
    id: i,
    delay: Math.random() * 400,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    startX: Math.random() * W,
  }));
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
      {pieces.map(p => <Piece key={p.id} delay={p.delay} color={p.color} startX={p.startX} />)}
    </View>
  );
}