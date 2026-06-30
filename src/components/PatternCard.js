import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, rs, fs, CARD_W, DIFF_COLORS, CRAFT_COLORS } from '../constants/theme';
import { iconForPattern } from '../utils/icons';

export default function PatternCard({ item, onPress, inProgress, isFavorite, onToggleFavorite }) {
  const anim = useRef(new Animated.Value(1)).current;

  const press = () => {
    Animated.sequence([
      Animated.spring(anim, { toValue: 0.95, useNativeDriver: true, speed: 60, bounciness: 6 }),
      Animated.spring(anim, { toValue: 1,    useNativeDriver: true, speed: 40, bounciness: 8 }),
    ]).start();
    onPress(item);
  };

  const dc = DIFF_COLORS[item.cat]   || C.slate;
  const cc = CRAFT_COLORS[item.type] || C.rose;

  return (
    <Animated.View style={[s.card, { transform: [{ scale: anim }] }]}>
      <TouchableOpacity onPress={press} activeOpacity={0.92} style={{ flex: 1 }}>

        {/* Icon card art */}
        <View style={s.imageArea}>
          <View style={[s.emojiArea, { backgroundColor: dc + '18' }]}>
            <Ionicons name={iconForPattern(item)} size={rs(44)} color={cc} />
          </View>

          {/* Tags */}
          {item.tag && (
            <View style={[s.tag, { backgroundColor: item.tagColor }]}>
              <Text style={s.tagText}>{item.tag}</Text>
            </View>
          )}
          {inProgress && (
            <View style={[s.tag, { backgroundColor: C.amber, top: rs(6), left: rs(6), right: 'auto', bottom: 'auto' }]}>
              <Text style={s.tagText}>WIP</Text>
            </View>
          )}

          {/* Craft badge */}
          <View style={[s.craftBadge, { backgroundColor: cc }]}>
            <Text style={s.craftBadgeText}>
              {item.type === 'crochet' ? '🪝' : item.type === 'knitting' ? '🧶' : '🧵'}
            </Text>
          </View>
        </View>

        {/* Favorite heart — positioned absolute, separate from main onPress */}
        {onToggleFavorite && (
          <TouchableOpacity
            onPress={(e) => { e.stopPropagation?.(); onToggleFavorite(item); }}
            style={s.heartBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}>
            <Ionicons name={isFavorite ? 'heart' : 'heart-outline'}
              size={rs(18)} color={isFavorite ? C.rose : '#FFFFFF'} />
          </TouchableOpacity>
        )}

        {/* Info */}
        <View style={s.info}>
          <Text style={s.name} numberOfLines={2}>{item.name}</Text>
          <Text style={s.desc} numberOfLines={2}>{item.desc}</Text>
          <View style={s.metaRow}>
            <View style={[s.diffPill, { backgroundColor: dc + '20' }]}>
              <Text style={[s.diffText, { color: dc }]}>{item.cat}</Text>
            </View>
            <Text style={s.time}>⏱ {item.time}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card:          { width: CARD_W, backgroundColor: C.bgCard, borderRadius: rs(16), borderWidth: 1, borderColor: C.border, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  imageArea:     { position: 'relative', height: rs(130) },
  image:         { width: '100%', height: '100%' },
  emojiArea:     { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  tag:           { position: 'absolute', bottom: rs(6), right: rs(6), borderRadius: rs(6), paddingHorizontal: rs(6), paddingVertical: rs(2) },
  tagText:       { fontSize: fs(8), color: C.white, fontWeight: '800' },
  craftBadge:    { position: 'absolute', bottom: rs(6), left: rs(6), width: rs(24), height: rs(24), borderRadius: rs(12), alignItems: 'center', justifyContent: 'center' },
  craftBadgeText:{ fontSize: fs(12) },
  heartBtn:      { position: 'absolute', top: rs(8), right: rs(8), width: rs(32), height: rs(32), borderRadius: rs(16), backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  info:          { padding: rs(10) },
  name:          { fontSize: fs(13), fontWeight: '700', color: C.slate, marginBottom: rs(3), lineHeight: fs(18) },
  desc:          { fontSize: fs(10), color: C.slateMid, lineHeight: fs(15), marginBottom: rs(6) },
  metaRow:       { flexDirection: 'row', alignItems: 'center', gap: rs(6) },
  diffPill:      { borderRadius: rs(8), paddingHorizontal: rs(6), paddingVertical: rs(2) },
  diffText:      { fontSize: fs(9), fontWeight: '700' },
  time:          { fontSize: fs(9), color: C.slateMid },
});