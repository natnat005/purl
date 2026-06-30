import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, rs, fs, FONTS } from '../constants/theme';

const PROJECTS = [
  { id: 'scarf',      label: 'Scarf',            icon: 'remove-outline',    base: { bulky: 200,  chunky: 150, aran: 120, worsted: 100, dk: 80,   sport: 60,  fingering: 40  } },
  { id: 'beanie',     label: 'Beanie / Hat',      icon: 'ellipse-outline',         base: { bulky: 120,  chunky: 100, aran: 80,  worsted: 70,  dk: 55,   sport: 45,  fingering: 30  } },
  { id: 'cowl',       label: 'Cowl',              icon: 'refresh-circle-outline',     base: { bulky: 150,  chunky: 120, aran: 100, worsted: 80,  dk: 65,   sport: 50,  fingering: 35  } },
  { id: 'sweater',    label: 'Sweater (adult)',   icon: 'shirt-outline',           base: { bulky: 800,  chunky: 650, aran: 500, worsted: 400, dk: 350,  sport: 280, fingering: 200 } },
  { id: 'cardigan',   label: 'Cardigan (adult)',  icon: 'body-outline',            base: { bulky: 900,  chunky: 750, aran: 600, worsted: 500, dk: 400,  sport: 320, fingering: 250 } },
  { id: 'blanket_b',  label: 'Baby Blanket',      icon: 'happy-outline',           base: { bulky: 400,  chunky: 300, aran: 250, worsted: 200, dk: 160,  sport: 130, fingering: 100 } },
  { id: 'blanket_t',  label: 'Throw Blanket',     icon: 'bed-outline',             base: { bulky: 1200, chunky: 900, aran: 750, worsted: 600, dk: 500,  sport: 400, fingering: 300 } },
  { id: 'socks',      label: 'Socks (pair)',      icon: 'footsteps-outline',       base: { bulky: 150,  chunky: 120, aran: 100, worsted: 80,  dk: 60,   sport: 50,  fingering: 40  } },
  { id: 'mittens',    label: 'Mittens (pair)',    icon: 'hand-left-outline',       base: { bulky: 100,  chunky: 80,  aran: 65,  worsted: 55,  dk: 40,   sport: 32,  fingering: 25  } },
  { id: 'tote',       label: 'Tote Bag',          icon: 'bag-handle-outline',      base: { bulky: 250,  chunky: 200, aran: 160, worsted: 130, dk: 100,  sport: 80,  fingering: 60  } },
  { id: 'amigurumi',  label: 'Amigurumi (small)', icon: 'happy-outline',          base: { bulky: 80,   chunky: 60,  aran: 50,  worsted: 40,  dk: 30,   sport: 25,  fingering: 18  } },
  { id: 'shawl',      label: 'Shawl / Wrap',      icon: 'partly-sunny-outline',    base: { bulky: 400,  chunky: 320, aran: 260, worsted: 210, dk: 175,  sport: 140, fingering: 100 } },
];

const WEIGHTS = [
  { id: 'bulky',      label: 'Super Bulky',     hook: '9mm+',    needles: '9mm+',    dots: 7 },
  { id: 'chunky',     label: 'Chunky / Bulky',  hook: '6-8mm',   needles: '6-8mm',   dots: 6 },
  { id: 'aran',       label: 'Aran / Worsted',  hook: '5-6mm',   needles: '5-6mm',   dots: 5 },
  { id: 'worsted',    label: 'Worsted',         hook: '4.5-5mm', needles: '4.5-5mm', dots: 4 },
  { id: 'dk',         label: 'DK / Light',      hook: '3.5-4mm', needles: '3.5-4mm', dots: 3 },
  { id: 'sport',      label: 'Sport / Fine',    hook: '3-3.5mm', needles: '3-3.5mm', dots: 2 },
  { id: 'fingering',  label: 'Fingering / Lace',hook: '2-3mm',   needles: '2-3mm',   dots: 1 },
];

const SIZES = [
  { id: 'xs',   label: 'XS / Baby',  mult: 0.7 },
  { id: 's',    label: 'Small',      mult: 0.85 },
  { id: 'm',    label: 'Medium',     mult: 1.0 },
  { id: 'l',    label: 'Large',      mult: 1.15 },
  { id: 'xl',   label: 'XL',         mult: 1.3 },
  { id: 'xxl',  label: 'XXL',        mult: 1.45 },
];

export default function YarnCalculatorScreen() {
  const [project, setProject] = useState(null);
  const [weight,  setWeight]  = useState(null);
  const [size,    setSize]    = useState('m');
  const [extraPct, setExtraPct] = useState('10');

  const result = project && weight ? (() => {
    const base    = project.base[weight.id] || 200;
    const sizeMult= SIZES.find(s => s.id === size)?.mult || 1;
    const extra   = 1 + (parseInt(extraPct) || 10) / 100;
    const grams   = Math.ceil(base * sizeMult * extra / 10) * 10;
    const meters  = Math.ceil(grams * 3.5);
    const skeins  = Math.ceil(grams / 100);
    return { grams, meters, skeins };
  })() : null;

  const wInfo = weight ? WEIGHTS.find(w => w.id === weight.id) : null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bgPage }}
      contentContainerStyle={{ padding: rs(16), paddingBottom: rs(48) }}
      showsVerticalScrollIndicator={false}>

      <Text style={s.title}>Yarn Calculator</Text>
      <Text style={{ fontSize: fs(13), color: C.slateMid, marginBottom: rs(24), lineHeight: fs(20) }}>
        Estimate how much yarn you need before you start your project.
      </Text>

      {/* Step 1 — Project */}
      <Text style={s.stepLabel}>1. What are you making?</Text>
      <View style={s.grid}>
        {PROJECTS.map(p => (
          <TouchableOpacity key={p.id} onPress={() => setProject(p)} activeOpacity={0.8}
            style={[s.gridBtn, project?.id === p.id && s.gridBtnActive]}>
            <Ionicons name={p.icon} size={rs(24)} color={project?.id === p.id ? C.rose : C.slateMid} />
            <Text style={[s.gridLabel, project?.id === p.id && { color: C.rose, fontWeight: '700' }]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Step 2 — Yarn weight */}
      <Text style={[s.stepLabel, { marginTop: rs(24) }]}>2. Yarn weight</Text>
      {WEIGHTS.map(w => (
        <TouchableOpacity key={w.id} onPress={() => setWeight(w)} activeOpacity={0.8}
          style={[s.weightRow, weight?.id === w.id && s.weightRowActive]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs(2), marginRight: rs(12), width: rs(50) }}>
            {[1,2,3,4,5,6,7].map(n => (
              <View key={n} style={{
                width: rs(4), height: rs(4 + n), borderRadius: rs(2),
                backgroundColor: n <= w.dots ? (weight?.id === w.id ? C.rose : C.slate) : C.border,
              }} />
            ))}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.weightLabel, weight?.id === w.id && { color: C.rose }]}>{w.label}</Text>
            <Text style={s.weightMeta}>Hook: {w.hook} · Needles: {w.needles}</Text>
          </View>
          {weight?.id === w.id && (
            <Ionicons name="checkmark-circle" size={rs(18)} color={C.rose} />
          )}
        </TouchableOpacity>
      ))}

      {/* Step 3 — Size */}
      <Text style={[s.stepLabel, { marginTop: rs(24) }]}>3. Size</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: rs(8), marginBottom: rs(16) }}>
        {SIZES.map(sz => (
          <TouchableOpacity key={sz.id} onPress={() => setSize(sz.id)} activeOpacity={0.8}
            style={[s.sizeBtn, size === sz.id && s.sizeBtnActive]}>
            <Text style={[s.sizeBtnText, size === sz.id && { color: C.white }]}>{sz.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Step 4 — Extra */}
      <Text style={[s.stepLabel, { marginTop: rs(8) }]}>4. Extra yarn buffer (%)</Text>
      <Text style={{ fontSize: fs(12), color: C.slateMid, marginBottom: rs(8) }}>
        Add extra for mistakes, swatching, and weaving in ends. 10–15% is standard.
      </Text>
      <View style={{ flexDirection: 'row', gap: rs(8) }}>
        {['5', '10', '15', '20'].map(pct => (
          <TouchableOpacity key={pct} onPress={() => setExtraPct(pct)} activeOpacity={0.8}
            style={[s.sizeBtn, extraPct === pct && s.sizeBtnActive]}>
            <Text style={[s.sizeBtnText, extraPct === pct && { color: C.white }]}>{pct}%</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Result */}
      {result && (
        <View style={[s.resultCard, { borderColor: C.rose }]}>
          <Text style={s.resultTitle}>You'll need approximately:</Text>
          <View style={{ flexDirection: 'row', gap: rs(12), marginTop: rs(16) }}>
            {[
              { val: `${result.grams}g`, label: 'Weight' },
              { val: `~${result.meters}m`, label: 'Length' },
              { val: `${result.skeins}`, label: 'Skeins (100g)' },
            ].map(r => (
              <View key={r.label} style={s.resultStat}>
                <Text style={s.resultStatVal}>{r.val}</Text>
                <Text style={s.resultStatLabel}>{r.label}</Text>
              </View>
            ))}
          </View>
          <View style={s.resultNote}>
            <Text style={{ fontSize: fs(12), color: C.slateMid, lineHeight: fs(18) }}>
              For <Text style={{ fontWeight: '700', color: C.slate }}>{project.label}</Text> in{' '}
              <Text style={{ fontWeight: '700', color: C.slate }}>{wInfo?.label}</Text> weight yarn,{' '}
              {SIZES.find(sz => sz.id === size)?.label} size, with {extraPct}% extra.
              {'\n\n'}Always buy an extra skein from the same dye lot — you can return it if unused.
            </Text>
          </View>
        </View>
      )}

      {!project && (
        <View style={{ alignItems: 'center', paddingVertical: rs(20) }}>
          <Text style={{ fontSize: rs(40), marginBottom: rs(8) }}>🧶</Text>
          <Text style={{ fontSize: fs(13), color: C.slateMid, textAlign: 'center' }}>
            Select a project and yarn weight to calculate
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  title:          { fontSize: fs(26), fontWeight: '800', color: C.slate, marginBottom: rs(4), fontFamily: FONTS.heading },
  stepLabel:      { fontSize: fs(14), fontWeight: '700', color: C.slate, marginBottom: rs(12) },
  grid:           { flexDirection: 'row', flexWrap: 'wrap', gap: rs(8), marginBottom: rs(8) },
  gridBtn:        { backgroundColor: C.bgCard, borderRadius: rs(12), padding: rs(10), alignItems: 'center', borderWidth: 1, borderColor: C.border, minWidth: rs(80) },
  gridBtnActive:  { backgroundColor: C.rosePale, borderColor: C.rose },
  gridEmoji:      { fontSize: fs(22), marginBottom: rs(4) },
  gridLabel:      { fontSize: fs(10), color: C.slateMid, textAlign: 'center', fontWeight: '600' },
  weightRow:      { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgCard, borderRadius: rs(12), padding: rs(12), marginBottom: rs(8), borderWidth: 1, borderColor: C.border },
  weightRowActive:{ backgroundColor: C.rosePale, borderColor: C.rose },
  weightLabel:    { fontSize: fs(14), fontWeight: '600', color: C.slate },
  weightMeta:     { fontSize: fs(11), color: C.slateMid, marginTop: rs(2) },
  sizeBtn:        { borderRadius: rs(20), paddingHorizontal: rs(14), paddingVertical: rs(8), backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border },
  sizeBtnActive:  { backgroundColor: C.rose, borderColor: C.rose },
  sizeBtnText:    { fontSize: fs(12), fontWeight: '700', color: C.slateMid },
  resultCard:     { backgroundColor: C.bgCard, borderRadius: rs(16), padding: rs(20), marginTop: rs(24), borderWidth: 2 },
  resultTitle:    { fontSize: fs(15), fontWeight: '700', color: C.slate },
  resultStat:     { flex: 1, alignItems: 'center', backgroundColor: C.rosePale, borderRadius: rs(12), padding: rs(12) },
  resultStatVal:  { fontSize: fs(20), fontWeight: '800', color: C.rose },
  resultStatLabel:{ fontSize: fs(10), color: C.slateMid, marginTop: rs(2) },
  resultNote:     { backgroundColor: C.bgMuted, borderRadius: rs(12), padding: rs(12), marginTop: rs(16) },
});