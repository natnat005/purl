import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Image, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, rs, fs, FONTS } from '../constants/theme';
import { LEARN_SECTIONS } from '../data/learn';

// Map section type → Ionicon name
const LEARN_ICONS = {
  crochet:  'flower-outline',
  knitting: 'reorder-three-outline',
  sewing:   'cut-outline',
  both:     'book-outline',
};

// ─── Section Detail ───────────────────────────────────────────────
function SectionDetail({ section, onBack }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bgPage }}>
      <ScrollView contentContainerStyle={{ padding: rs(16), paddingBottom: rs(40) }} showsVerticalScrollIndicator={false}>

        {/* Back */}
        <TouchableOpacity onPress={onBack}
          style={{ flexDirection: 'row', alignItems: 'center', gap: rs(8), marginBottom: rs(20) }}>
          <Ionicons name="arrow-back" size={rs(20)} color={C.rose} />
          <Text style={{ fontSize: fs(14), color: C.rose, fontWeight: '600' }}>All topics</Text>
        </TouchableOpacity>

        {/* Hero */}
        <View style={{ backgroundColor: section.color + '15', borderRadius: rs(20), padding: rs(20), marginBottom: rs(20), alignItems: 'center' }}>
          <View style={{ width: rs(72), height: rs(72), borderRadius: rs(36), backgroundColor: section.color + '25', alignItems: 'center', justifyContent: 'center', marginBottom: rs(12) }}>
            <Ionicons name={LEARN_ICONS[section.type] || 'book-outline'} size={rs(36)} color={section.color} />
          </View>
          <Text style={{ fontSize: fs(22), fontWeight: '800', color: C.slate, textAlign: 'center', marginBottom: rs(8) }}>
            {section.title}
          </Text>
          <View style={[s.pill, { backgroundColor: section.color + '25' }]}>
            <Text style={[s.pillText, { color: section.color }]}>
              {section.type === 'both' ? 'Crochet & Knitting & Sewing'
               : section.type === 'crochet'  ? '🪝 Crochet'
               : section.type === 'knitting' ? '🧶 Knitting'
               : section.type === 'sewing'   ? '🧵 Sewing'
               : section.type}
            </Text>
          </View>
        </View>

        {/* Intro */}
        <Text style={{ fontSize: fs(14), color: C.slateMid, lineHeight: fs(23), marginBottom: rs(20) }}>
          {section.intro}
        </Text>

        {/* Items */}
        {section.items.map((item, i) => (
          <TouchableOpacity key={i}
            onPress={() => setExpanded(expanded === i ? null : i)}
            activeOpacity={0.85}
            style={[s.itemCard, expanded === i && { borderColor: section.color }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[s.numBubble, { backgroundColor: section.color + '20' }]}>
                <Text style={[s.numText, { color: section.color }]}>{i + 1}</Text>
              </View>
              <Text style={{ flex: 1, fontSize: fs(14), fontWeight: '700', color: C.slate, marginLeft: rs(12) }}>
                {item.name}
              </Text>
              <Ionicons name={expanded === i ? 'chevron-up' : 'chevron-down'} size={rs(16)} color={C.slateLight} />
            </View>
            {expanded === i && (
              <View style={{ marginTop: rs(14), paddingTop: rs(14), borderTopWidth: 1, borderTopColor: C.border }}>
                {item.image && (
                  <Image source={{ uri: item.image }} style={{ width: '100%', height: rs(180), borderRadius: rs(12), marginBottom: rs(12) }} resizeMode="cover" />
                )}
                <Text style={{ fontSize: fs(13), color: C.slate, lineHeight: fs(23) }}>
                  {item.desc}
                </Text>
                {item.youtubeQuery && (
                  <TouchableOpacity onPress={() => {
                    const q = encodeURIComponent(item.youtubeQuery);
                    Linking.openURL(`https://www.youtube.com/results?search_query=${q}`);
                  }} style={s.ytBtn} activeOpacity={0.85}>
                    <Ionicons name="logo-youtube" size={rs(20)} color="#FF0000" />
                    <Text style={s.ytText}>Watch on YouTube</Text>
                    <Ionicons name="chevron-forward" size={rs(16)} color={C.slateLight} />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Learn Screen ─────────────────────────────────────────────────
export default function LearnScreen({ homeSignal }) {
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (homeSignal) setSelected(null);
  }, [homeSignal]);

  if (selected) return <SectionDetail section={selected} onBack={() => setSelected(null)} />;

  const crochetSections  = LEARN_SECTIONS.filter(s => s.type === 'crochet');
  const knittingSections = LEARN_SECTIONS.filter(s => s.type === 'knitting');
  const sewingSections   = LEARN_SECTIONS.filter(s => s.type === 'sewing');
  const bothSections     = LEARN_SECTIONS.filter(s => s.type === 'both');

  const SectionGroup = ({ title, icon, sections }) => (
    <View style={{ marginBottom: rs(24) }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs(8), marginBottom: rs(10) }}>
        <Ionicons name={icon} size={rs(16)} color={C.slate} />
        <Text style={s.groupTitle}>{title}</Text>
      </View>
      {sections.map(sec => (
        <TouchableOpacity key={sec.id} onPress={() => setSelected(sec)}
          activeOpacity={0.85}
          style={[s.topicCard, { borderLeftColor: sec.color }]}>
          <View style={{ width: rs(40), height: rs(40), borderRadius: rs(12), backgroundColor: sec.color + '20', alignItems: 'center', justifyContent: 'center', marginRight: rs(14) }}>
            <Ionicons name={LEARN_ICONS[sec.type] || 'book-outline'} size={rs(22)} color={sec.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: fs(15), fontWeight: '700', color: C.slate, marginBottom: rs(4) }}>{sec.title}</Text>
            <Text style={{ fontSize: fs(12), color: C.slateMid, lineHeight: fs(18) }} numberOfLines={2}>{sec.intro}</Text>
            <View style={[s.pill, { backgroundColor: sec.color + '20', marginTop: rs(6), alignSelf: 'flex-start' }]}>
              <Text style={[s.pillText, { color: sec.color }]}>{sec.items.length} topics</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={rs(18)} color={C.slateLight} />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bgPage }}
      contentContainerStyle={{ padding: rs(16), paddingBottom: rs(40) }}
      showsVerticalScrollIndicator={false}>
      <Text style={s.screenTitle}>Learn</Text>
      <Text style={{ fontSize: fs(13), color: C.slateMid, marginBottom: rs(24) }}>Tap any topic to dive in</Text>
      <SectionGroup title="Crochet"     icon="flower-outline"        sections={crochetSections}  />
      <SectionGroup title="Knitting"    icon="reorder-three-outline" sections={knittingSections} />
      <SectionGroup title="Sewing"      icon="cut-outline"           sections={sewingSections}   />
      <SectionGroup title="All Crafts"  icon="book-outline"          sections={bothSections}     />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screenTitle: { fontSize: fs(28), fontWeight: '800', color: C.slate, marginBottom: rs(4), fontFamily: FONTS.heading },
  groupTitle:  { fontSize: fs(14), fontWeight: '800', color: C.slate, marginBottom: rs(12), textTransform: 'uppercase', letterSpacing: 0.5 },
  topicCard:   { backgroundColor: C.bgCard, borderRadius: rs(16), padding: rs(16), marginBottom: rs(10), borderWidth: 1, borderColor: C.border, borderLeftWidth: rs(4), flexDirection: 'row', alignItems: 'center' },
  itemCard:    { backgroundColor: C.bgCard, borderRadius: rs(14), padding: rs(14), marginBottom: rs(10), borderWidth: 1, borderColor: C.border },
  ytBtn:       { flexDirection: 'row', alignItems: 'center', gap: rs(10), backgroundColor: C.bgMuted, borderRadius: rs(12), paddingHorizontal: rs(14), paddingVertical: rs(12), marginTop: rs(14), borderWidth: 1, borderColor: C.border },
  ytText:      { flex: 1, fontSize: fs(13), fontWeight: '700', color: C.slate },
  numBubble:   { width: rs(32), height: rs(32), borderRadius: rs(16), alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  numText:     { fontSize: fs(13), fontWeight: '800' },
  pill:        { borderRadius: rs(10), paddingHorizontal: rs(10), paddingVertical: rs(4) },
  pillText:    { fontSize: fs(11), fontWeight: '700' },
});