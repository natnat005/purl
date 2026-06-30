import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, rs, fs, FONTS } from '../constants/theme';
import { PATTERNS } from '../data/patterns';
import { iconForPattern } from '../utils/icons';

const QUESTIONS = [
  {
    id: 'q1',
    question: 'Have you ever knitted or crocheted before?',
    options: [
      { label: 'Never tried it',              points: 0, icon: 'leaf-outline' },
      { label: 'Made a few simple things',    points: 1, icon: 'flower-outline' },
      { label: 'I\'ve done several projects', points: 2, icon: 'sparkles-outline' },
      { label: 'I\'m quite experienced',      points: 3, icon: 'school-outline' },
    ],
  },
  {
    id: 'q2',
    question: 'How patient are you with detailed instructions?',
    options: [
      { label: 'I need very simple steps',          points: 0, icon: 'help-circle-outline' },
      { label: 'I\'m okay with some complexity',    points: 1, icon: 'happy-outline' },
      { label: 'I enjoy following detailed patterns', points: 2, icon: 'list-outline' },
      { label: 'Complex patterns excite me',        points: 3, icon: 'analytics-outline' },
    ],
  },
  {
    id: 'q3',
    question: 'What craft interests you most?',
    options: [
      { label: 'Crochet',       points: 0, icon: 'flower-outline',         type: 'crochet'  },
      { label: 'Knitting',      points: 0, icon: 'reorder-three-outline',  type: 'knitting' },
      { label: 'Sewing',        points: 0, icon: 'cut-outline',            type: 'sewing'   },
      { label: 'All of them',   points: 0, icon: 'apps-outline',           type: 'all'      },
    ],
  },
  {
    id: 'q4',
    question: 'How much time can you dedicate per project?',
    options: [
      { label: 'Under 2 hours',  points: 0, icon: 'flash-outline' },
      { label: '2-6 hours',      points: 1, icon: 'sunny-outline' },
      { label: '6-20 hours',     points: 2, icon: 'calendar-outline' },
      { label: '20+ hours fine', points: 3, icon: 'trophy-outline' },
    ],
  },
  {
    id: 'q5',
    question: 'What do you want to make?',
    options: [
      { label: 'Cosy accessories (hats, scarves)', points: 1, icon: 'shirt-outline' },
      { label: 'Home decor (blankets, bags)',      points: 1, icon: 'home-outline' },
      { label: 'Clothing and garments',            points: 2, icon: 'body-outline' },
      { label: 'Toys and gifts',                   points: 1, icon: 'gift-outline' },
    ],
  },
];

const LEVEL_INFO = {
  beginner:     { label: 'Beginner',     icon: 'leaf-outline',     color: C.sage,  desc: 'Perfect! Start with simple projects that teach the fundamentals. You\'ll build skills quickly.' },
  intermediate: { label: 'Intermediate', icon: 'sparkles-outline', color: C.amber, desc: 'You\'re ready for more interesting patterns with shaping, joining, and colour work.' },
  advanced:     { label: 'Advanced',     icon: 'flame-outline',    color: C.rose,  desc: 'You can tackle complex patterns, garments, and intricate techniques with confidence.' },
};

export default function DifficultyQuizScreen() {
  const [step, setStep]         = useState(0);
  const [answers, setAnswers]   = useState({});
  const [done, setDone]         = useState(false);
  const [results, setResults]   = useState(null);

  const handleAnswer = (option) => {
    const newAnswers = { ...answers, [QUESTIONS[step].id]: option };
    setAnswers(newAnswers);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      const totalPoints = Object.values(newAnswers).reduce((sum, a) => sum + (a.points || 0), 0);
      const craftType   = newAnswers['q3']?.type || 'all';

      let level;
      if (totalPoints <= 2) level = 'beginner';
      else if (totalPoints <= 6) level = 'intermediate';
      else level = 'advanced';

      let recommended = PATTERNS.filter(p => {
        const craftMatch = craftType === 'all' || p.type === craftType;
        const levelMatch = p.cat === level || (level === 'intermediate' && p.cat === 'beginner');
        return craftMatch && levelMatch;
      }).slice(0, 4);

      setResults({ level, points: totalPoints, craftType, recommended });
      setDone(true);
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setDone(false);
    setResults(null);
  };

  if (done && results) {
    const info = LEVEL_INFO[results.level];
    return (
      <ScrollView style={{ flex: 1, backgroundColor: C.bgPage }}
        contentContainerStyle={{ padding: rs(16), paddingBottom: rs(48) }}
        showsVerticalScrollIndicator={false}>

        {/* Result hero */}
        <View style={[s.resultHero, { backgroundColor: info.color + '18', borderColor: info.color + '40' }]}>
          <View style={{ width: rs(72), height: rs(72), borderRadius: rs(36), backgroundColor: info.color + '25', alignItems: 'center', justifyContent: 'center', marginBottom: rs(14) }}>
            <Ionicons name={info.icon} size={rs(40)} color={info.color} />
          </View>
          <Text style={{ fontSize: fs(11), fontWeight: '700', color: info.color, textTransform: 'uppercase', letterSpacing: 1, marginBottom: rs(4) }}>Your level</Text>
          <Text style={{ fontSize: fs(28), fontWeight: '800', color: C.slate, marginBottom: rs(10) }}>{info.label}</Text>
          <Text style={{ fontSize: fs(14), color: C.slateMid, textAlign: 'center', lineHeight: fs(22) }}>{info.desc}</Text>
        </View>

        {/* Recommended patterns */}
        <Text style={[s.sectionTitle, { marginTop: rs(24), marginBottom: rs(14) }]}>
          Recommended patterns for you
        </Text>
        {results.recommended.map(p => (
          <View key={p.id} style={s.recCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs(12) }}>
              <View style={[s.recEmoji, { backgroundColor: (p.tagColor || C.rose) + '18' }]}>
                <Ionicons name={iconForPattern(p)} size={rs(26)} color={p.tagColor || C.rose} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: fs(14), fontWeight: '700', color: C.slate }}>{p.name}</Text>
                <Text style={{ fontSize: fs(11), color: C.slateMid, marginTop: rs(2) }}>
                  {p.type} · {p.cat} · {p.time}
                </Text>
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity onPress={reset} style={s.retakeBtn} activeOpacity={0.85}>
          <Ionicons name="refresh" size={rs(16)} color={C.rose} />
          <Text style={s.retakeBtnText}>Retake the quiz</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  const q = QUESTIONS[step];
  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bgPage }}
      contentContainerStyle={{ padding: rs(16), paddingBottom: rs(48) }}
      showsVerticalScrollIndicator={false}>

      <Text style={s.progressText}>
        Question {step + 1} of {QUESTIONS.length}
      </Text>

      {/* Question */}
      <View style={s.questionCard}>
        <Text style={s.questionText}>{q.question}</Text>
        <View style={{ gap: rs(10), marginTop: rs(16) }}>
          {q.options.map((opt, i) => (
            <TouchableOpacity key={i} onPress={() => handleAnswer(opt)}
              activeOpacity={0.85} style={s.optionBtn}>
              <View style={{ width: rs(32), height: rs(32), borderRadius: rs(16), backgroundColor: C.rose + '15', alignItems: 'center', justifyContent: 'center', marginRight: rs(12) }}>
                <Ionicons name={opt.icon} size={rs(18)} color={C.rose} />
              </View>
              <Text style={s.optionLabel}>{opt.label}</Text>
              <Ionicons name="chevron-forward" size={rs(16)} color={C.slateLight} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {step > 0 && (
        <TouchableOpacity onPress={() => setStep(step - 1)}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: rs(4), marginTop: rs(16) }}>
          <Ionicons name="chevron-back" size={rs(14)} color={C.slateMid} />
          <Text style={{ fontSize: fs(13), color: C.slateMid }}>Back</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  progressText:   { fontSize: fs(12), fontWeight: '700', color: C.slateMid, textTransform: 'uppercase', letterSpacing: 1, marginBottom: rs(14) },
  questionCard:   { backgroundColor: C.bgCard, borderRadius: rs(16), padding: rs(20), borderWidth: 1, borderColor: C.border },
  questionText:   { fontSize: fs(18), fontWeight: '700', color: C.slate, lineHeight: fs(26) },
  optionBtn:      { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgPage, borderRadius: rs(12), paddingHorizontal: rs(14), paddingVertical: rs(14), borderWidth: 1, borderColor: C.border },
  optionLabel:    { flex: 1, fontSize: fs(14), color: C.slate, fontWeight: '500' },
  resultHero:     { alignItems: 'center', borderRadius: rs(20), padding: rs(28), borderWidth: 1 },
  sectionTitle:   { fontSize: fs(15), fontWeight: '800', color: C.slate },
  recCard:        { backgroundColor: C.bgCard, borderRadius: rs(14), padding: rs(14), borderWidth: 1, borderColor: C.border, marginBottom: rs(10) },
  recEmoji:       { width: rs(48), height: rs(48), borderRadius: rs(12), alignItems: 'center', justifyContent: 'center' },
  retakeBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: rs(6), marginTop: rs(20), padding: rs(14) },
  retakeBtnText:  { fontSize: fs(14), fontWeight: '700', color: C.rose },
});