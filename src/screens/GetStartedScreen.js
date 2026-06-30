import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, rs, fs, FONTS } from '../constants/theme';
import { PATTERNS } from '../data/patterns';
import { iconForPattern } from '../utils/icons';
import { haptic } from '../utils/haptics';

// Small set of starter recommendations the screen falls back on.
// We pick by craft and time. Each maps to a pattern id we know is in PATTERNS.
const STARTERS = {
  any: {
    quick:  'c15',  // Simple Bookmark
    short:  'c17',  // Granny Square Coaster
    medium: 'c18',  // Easy Garter Scarf
  },
  crochet: {
    quick:  'c15',  // Bookmark
    short:  'c17',  // Granny Square Coaster
    medium: 'c18',  // Garter Scarf
  },
  knitting: {
    quick:  'k19',  // Knit Coasters
    short:  'k16',  // Knit Headband
    medium: 'k13',  // Garter Stitch Scarf
  },
  sewing: {
    quick:  's16',  // Hair Scrunchies
    short:  's15',  // Drawstring Bag
    medium: 's13',  // Pillowcase
  },
};

export default function GetStartedScreen({ onOpenPattern }) {
  const [step, setStep]     = useState(0);
  const [craft, setCraft]   = useState(null);
  const [time, setTime]     = useState(null);
  const [done, setDone]     = useState(false);

  const pick = (key, value) => {
    haptic.selection();
    if (key === 'craft') {
      setCraft(value);
      setStep(1);
    } else if (key === 'time') {
      setTime(value);
      setStep(2);
      setDone(true);
    }
  };

  const reset = () => {
    setStep(0);
    setCraft(null);
    setTime(null);
    setDone(false);
  };

  if (done) {
    const id = STARTERS[craft]?.[time] || 'c15';
    const pattern = PATTERNS.find(p => p.id === id);
    if (!pattern) return null;

    return (
      <ScrollView style={{ flex: 1, backgroundColor: C.bgPage }}
        contentContainerStyle={{ padding: rs(16), paddingBottom: rs(48) }}>

        {/* Result */}
        <View style={s.resultCard}>
          <Text style={s.tagLine}>YOUR FIRST PROJECT</Text>
          <View style={[s.heroIcon, { backgroundColor: C.rose + '20' }]}>
            <Ionicons name={iconForPattern(pattern)} size={rs(48)} color={C.rose} />
          </View>
          <Text style={s.patternName}>{pattern.name}</Text>
          <Text style={s.patternMeta}>
            {pattern.time} · {pattern.cat} · {pattern.type}
          </Text>
          <Text style={s.patternDesc}>{pattern.desc}</Text>
        </View>

        {/* Why this */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Why we picked this for you</Text>
          <Text style={s.body}>
            {craft === 'any' ?
              'You said you weren\'t sure which craft to try. This project uses crochet, the most forgiving starter craft — your stitches are easy to see and easy to unravel if you make a mistake.' :
            craft === 'crochet' ?
              'Crochet is the most forgiving craft to start with. Each stitch is one motion, and if you mess up you can pull back without losing the whole project.' :
            craft === 'knitting' ?
              'Knitting takes a few rows to feel natural, but once it clicks it\'s meditative. This project uses only knit stitches — no purling yet.' :
              'Sewing is the fastest craft to see results. This project will be done in a single sitting and uses straight seams only.'}
            {' '}
            {time === 'quick' ?
              'And since you said you have a quick window, this one finishes in under an hour.' :
            time === 'short' ?
              'It\'s sized for a short weekend session — you\'ll have a finished thing before you go to bed.' :
              'It\'s a real project but not overwhelming — finishable in 4–6 hours spread across a few sessions.'}
          </Text>
        </View>

        {/* What you need to buy */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>What to buy</Text>
          {(pattern.materials || []).slice(0, 5).map((m, i) => (
            <View key={i} style={s.bullet}>
              <Ionicons name="checkmark-circle-outline" size={rs(14)} color={C.rose} />
              <Text style={s.bulletText}>{m}</Text>
            </View>
          ))}
          <Text style={[s.body, { marginTop: rs(10), fontStyle: 'italic' }]}>
            Most craft stores carry all of this. Michael's, Joann, Hobby Lobby, or your local yarn shop. Total cost: usually under $15.
          </Text>
        </View>

        {/* How to actually start */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>How to actually start</Text>
          <View style={s.numStep}><Text style={s.numStepNum}>1</Text><Text style={s.numStepText}>Get the materials above. Don't overthink yarn colour — pick whatever you'd be happy looking at while you work.</Text></View>
          <View style={s.numStep}><Text style={s.numStepNum}>2</Text><Text style={s.numStepText}>Tap the button below to open this pattern and add it to your Projects.</Text></View>
          <View style={s.numStep}><Text style={s.numStepNum}>3</Text><Text style={s.numStepText}>Watch one short YouTube video on the basic stitch first. The pattern detail page has a "Watch on YouTube" link.</Text></View>
          <View style={s.numStep}><Text style={s.numStepNum}>4</Text><Text style={s.numStepText}>Start. Go slow. The first row is always wonky. That's fine.</Text></View>
        </View>

        {/* Primary action: open the pattern */}
        {onOpenPattern && (
          <TouchableOpacity
            onPress={() => { haptic.success(); onOpenPattern(pattern.id); }}
            style={s.primaryBtn}
            activeOpacity={0.88}>
            <Text style={s.primaryBtnText}>Open this pattern</Text>
            <Ionicons name="arrow-forward" size={rs(16)} color={C.white} />
          </TouchableOpacity>
        )}

        {/* Permission to be bad */}
        <View style={[s.section, { backgroundColor: C.amberPale, borderColor: C.amber + '40' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs(8), marginBottom: rs(6) }}>
            <Ionicons name="heart-outline" size={rs(16)} color={C.amberDeep} />
            <Text style={[s.sectionTitle, { color: C.amberDeep, marginBottom: 0 }]}>Permission to be bad</Text>
          </View>
          <Text style={[s.body, { color: C.amberDeep }]}>
            Your first project won't be perfect. The edges will be wavy, stitches will be uneven, you'll lose count. That's exactly what learning looks like. Every crafter you admire has a pile of weird first attempts somewhere.
          </Text>
        </View>

        <TouchableOpacity onPress={reset} style={s.retake} activeOpacity={0.85}>
          <Ionicons name="refresh-outline" size={rs(16)} color={C.slate} />
          <Text style={s.retakeText}>Try different answers</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // Question screens
  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bgPage }}
      contentContainerStyle={{ padding: rs(16), paddingBottom: rs(48) }}>

      <Text style={s.progressDots}>
        Step {step + 1} of 2
      </Text>

      {step === 0 && (
        <View>
          <Text style={s.question}>Which craft are you most curious about?</Text>
          <Text style={s.questionSub}>
            If you genuinely don't know, pick "not sure" — we'll start you with the most forgiving one.
          </Text>
          {[
            { id: 'any',      label: 'Not sure yet',     icon: 'help-circle-outline' },
            { id: 'crochet',  label: 'Crochet',          icon: 'flower-outline' },
            { id: 'knitting', label: 'Knitting',         icon: 'reorder-three-outline' },
            { id: 'sewing',   label: 'Sewing',           icon: 'cut-outline' },
          ].map(opt => (
            <TouchableOpacity key={opt.id} onPress={() => pick('craft', opt.id)}
              activeOpacity={0.85} style={s.choice}>
              <View style={s.choiceIcon}>
                <Ionicons name={opt.icon} size={rs(20)} color={C.rose} />
              </View>
              <Text style={s.choiceLabel}>{opt.label}</Text>
              <Ionicons name="chevron-forward" size={rs(16)} color={C.slateLight} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {step === 1 && (
        <View>
          <Text style={s.question}>How much time do you have to spend?</Text>
          <Text style={s.questionSub}>
            Pick honestly — projects that match your real time get finished. Ambitious ones become guilt piles.
          </Text>
          {[
            { id: 'quick',  label: 'Under an hour',           sub: 'A quick win in one sitting',           icon: 'flash-outline' },
            { id: 'short',  label: 'An afternoon (2-3 hrs)',  sub: 'Something finishable today',           icon: 'sunny-outline' },
            { id: 'medium', label: 'A few sessions',          sub: 'Real project, spread across days',     icon: 'calendar-outline' },
          ].map(opt => (
            <TouchableOpacity key={opt.id} onPress={() => pick('time', opt.id)}
              activeOpacity={0.85} style={s.choice}>
              <View style={s.choiceIcon}>
                <Ionicons name={opt.icon} size={rs(20)} color={C.rose} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.choiceLabel}>{opt.label}</Text>
                <Text style={s.choiceSub}>{opt.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={rs(16)} color={C.slateLight} />
            </TouchableOpacity>
          ))}

          <TouchableOpacity onPress={() => setStep(0)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: rs(4), marginTop: rs(16), padding: rs(10) }}>
            <Ionicons name="chevron-back" size={rs(14)} color={C.slateMid} />
            <Text style={{ fontSize: fs(13), color: C.slateMid }}>Back</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  progressDots:  { fontSize: fs(11), fontWeight: '700', color: C.slateMid, textTransform: 'uppercase', letterSpacing: 1, marginBottom: rs(14) },
  question:      { fontSize: fs(20), fontWeight: '800', color: C.slate, lineHeight: fs(28), marginBottom: rs(6) },
  questionSub:   { fontSize: fs(13), color: C.slateMid, marginBottom: rs(20), lineHeight: fs(20) },

  choice:        { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgCard, borderRadius: rs(14), padding: rs(14), marginBottom: rs(10), gap: rs(12), borderWidth: 1, borderColor: C.border },
  choiceIcon:    { width: rs(36), height: rs(36), borderRadius: rs(18), backgroundColor: C.rose + '15', alignItems: 'center', justifyContent: 'center' },
  choiceLabel:   { flex: 1, fontSize: fs(14), color: C.slate, fontWeight: '600' },
  choiceSub:     { fontSize: fs(11), color: C.slateMid, marginTop: rs(2) },

  resultCard:    { backgroundColor: C.bgCard, borderRadius: rs(20), padding: rs(24), alignItems: 'center', borderWidth: 1, borderColor: C.border, marginBottom: rs(16) },
  tagLine:       { fontSize: fs(11), fontWeight: '800', color: C.rose, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: rs(12) },
  heroIcon:      { width: rs(80), height: rs(80), borderRadius: rs(40), alignItems: 'center', justifyContent: 'center', marginBottom: rs(14) },
  patternName:   { fontSize: fs(22), fontWeight: '800', color: C.slate, textAlign: 'center', marginBottom: rs(6) },
  patternMeta:   { fontSize: fs(12), color: C.slateMid, marginBottom: rs(12) },
  patternDesc:   { fontSize: fs(13), color: C.slate, textAlign: 'center', lineHeight: fs(20) },

  section:       { backgroundColor: C.bgCard, borderRadius: rs(16), padding: rs(16), marginBottom: rs(12), borderWidth: 1, borderColor: C.border },
  sectionTitle:  { fontSize: fs(14), fontWeight: '800', color: C.slate, marginBottom: rs(8) },
  body:          { fontSize: fs(13), color: C.slate, lineHeight: fs(20) },

  bullet:        { flexDirection: 'row', gap: rs(8), alignItems: 'flex-start', marginBottom: rs(6) },
  bulletText:    { flex: 1, fontSize: fs(13), color: C.slate, lineHeight: fs(20) },

  numStep:       { flexDirection: 'row', gap: rs(10), marginBottom: rs(10) },
  numStepNum:    { width: rs(22), height: rs(22), borderRadius: rs(11), backgroundColor: C.rose, color: C.white, textAlign: 'center', lineHeight: rs(22), fontSize: fs(12), fontWeight: '800', overflow: 'hidden' },
  numStepText:   { flex: 1, fontSize: fs(13), color: C.slate, lineHeight: fs(20) },

  retake:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: rs(6), padding: rs(14), marginTop: rs(12) },
  retakeText:    { fontSize: fs(13), color: C.slate, fontWeight: '600' },

  primaryBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: rs(8), backgroundColor: C.rose, paddingVertical: rs(15), borderRadius: rs(14), marginVertical: rs(12), shadowColor: C.rose, shadowOpacity: 0.2, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 4 },
  primaryBtnText:{ fontSize: fs(15), fontWeight: '700', color: C.white },
});