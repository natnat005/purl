import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, rs, fs } from '../constants/theme';
import { haptic } from '../utils/haptics';

// A small numeric field
function NumField({ label, value, onChange, suffix, placeholder }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={s.label}>{label}</Text>
      <View style={s.inputWrap}>
        <TextInput
          style={s.input}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder || '0'}
          placeholderTextColor={C.slateLight}
          keyboardType="decimal-pad"
        />
        {suffix ? <Text style={s.suffix}>{suffix}</Text> : null}
      </View>
    </View>
  );
}

export default function GaugeCalculatorScreen() {
  const [unit, setUnit] = useState('in'); // 'in' | 'cm'

  // Your swatch measurements
  const [stitches, setStitches] = useState('');
  const [swatchW, setSwatchW]   = useState('');
  const [rows, setRows]         = useState('');
  const [swatchH, setSwatchH]   = useState('');

  // What you want to make
  const [targetW, setTargetW]   = useState('');
  const [targetH, setTargetH]   = useState('');

  const n = (v) => { const x = parseFloat(v); return isNaN(x) ? 0 : x; };

  const stPerUnit  = n(swatchW) > 0 ? n(stitches) / n(swatchW) : 0;
  const rowPerUnit = n(swatchH) > 0 ? n(rows) / n(swatchH) : 0;

  const castOn     = stPerUnit > 0 && n(targetW) > 0 ? Math.round(stPerUnit * n(targetW)) : null;
  const totalRows  = rowPerUnit > 0 && n(targetH) > 0 ? Math.round(rowPerUnit * n(targetH)) : null;

  const hasGauge = stPerUnit > 0 || rowPerUnit > 0;

  const reset = () => {
    haptic.light();
    setStitches(''); setSwatchW(''); setRows(''); setSwatchH('');
    setTargetW(''); setTargetH('');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bgPage }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: rs(16), paddingBottom: rs(60) }}
        keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Intro */}
        <View style={s.introCard}>
          <Ionicons name="resize-outline" size={rs(22)} color={C.rose} />
          <Text style={s.introText}>
            Knit or crochet a small swatch, measure it, and enter the numbers below. We'll work out your gauge and exactly how many stitches to cast on.
          </Text>
        </View>

        {/* Unit toggle */}
        <View style={s.unitRow}>
          {['in', 'cm'].map(u => (
            <TouchableOpacity key={u} onPress={() => { haptic.selection(); setUnit(u); }}
              style={[s.unitBtn, unit === u && s.unitBtnActive]} activeOpacity={0.8}>
              <Text style={[s.unitText, unit === u && s.unitTextActive]}>
                {u === 'in' ? 'Inches' : 'Centimeters'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Swatch section */}
        <Text style={s.section}>Your swatch</Text>
        <View style={s.card}>
          <View style={s.fieldRow}>
            <NumField label="Stitches counted" value={stitches} onChange={setStitches} />
            <NumField label={`Width (${unit})`} value={swatchW} onChange={setSwatchW} suffix={unit} />
          </View>
          <View style={[s.fieldRow, { marginTop: rs(14) }]}>
            <NumField label="Rows counted" value={rows} onChange={setRows} />
            <NumField label={`Height (${unit})`} value={swatchH} onChange={setSwatchH} suffix={unit} />
          </View>
        </View>

        {/* Gauge result */}
        {hasGauge && (
          <View style={s.gaugeCard}>
            <Text style={s.gaugeTitle}>Your gauge</Text>
            <View style={{ flexDirection: 'row', gap: rs(12) }}>
              <View style={s.gaugeStat}>
                <Text style={s.gaugeNum}>{stPerUnit > 0 ? stPerUnit.toFixed(1) : '—'}</Text>
                <Text style={s.gaugeLabel}>stitches / {unit}</Text>
              </View>
              <View style={s.gaugeStat}>
                <Text style={s.gaugeNum}>{rowPerUnit > 0 ? rowPerUnit.toFixed(1) : '—'}</Text>
                <Text style={s.gaugeLabel}>rows / {unit}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Target section */}
        <Text style={s.section}>What you want to make</Text>
        <View style={s.card}>
          <View style={s.fieldRow}>
            <NumField label={`Target width (${unit})`} value={targetW} onChange={setTargetW} suffix={unit} />
            <NumField label={`Target height (${unit})`} value={targetH} onChange={setTargetH} suffix={unit} />
          </View>
        </View>

        {/* Results */}
        {(castOn !== null || totalRows !== null) && (
          <View style={s.resultCard}>
            <Text style={s.resultTitle}>You'll need</Text>
            {castOn !== null && (
              <View style={s.resultRow}>
                <Text style={s.resultBig}>{castOn}</Text>
                <Text style={s.resultUnit}>stitches to cast on</Text>
              </View>
            )}
            {totalRows !== null && (
              <View style={[s.resultRow, { marginTop: rs(8) }]}>
                <Text style={s.resultBig}>{totalRows}</Text>
                <Text style={s.resultUnit}>rows total</Text>
              </View>
            )}
            <Text style={s.resultNote}>
              Tip: always cast on a few extra stitches for edge/seam allowance, and round to your pattern's stitch repeat if it has one.
            </Text>
          </View>
        )}

        {(stitches || rows || targetW || targetH) ? (
          <TouchableOpacity onPress={reset} style={s.resetBtn} activeOpacity={0.8}>
            <Ionicons name="refresh-outline" size={rs(16)} color={C.slateMid} />
            <Text style={s.resetText}>Clear all</Text>
          </TouchableOpacity>
        ) : null}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  introCard:  { flexDirection: 'row', gap: rs(12), alignItems: 'flex-start', backgroundColor: C.rosePale, borderRadius: rs(16), padding: rs(16), marginBottom: rs(20) },
  introText:  { flex: 1, fontSize: fs(13), color: C.roseDeep, lineHeight: fs(20) },
  unitRow:    { flexDirection: 'row', backgroundColor: C.bgMuted, borderRadius: rs(12), padding: rs(4), gap: rs(4), marginBottom: rs(20) },
  unitBtn:    { flex: 1, borderRadius: rs(10), paddingVertical: rs(9), alignItems: 'center' },
  unitBtnActive: { backgroundColor: C.bgCard, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  unitText:   { fontSize: fs(13), fontWeight: '600', color: C.slateMid },
  unitTextActive: { color: C.rose, fontWeight: '700' },
  section:    { fontSize: fs(13), fontWeight: '700', color: C.slateMid, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: rs(10) },
  card:       { backgroundColor: C.bgCard, borderRadius: rs(16), padding: rs(16), borderWidth: 1, borderColor: C.border, marginBottom: rs(20) },
  fieldRow:   { flexDirection: 'row', gap: rs(12) },
  label:      { fontSize: fs(11), fontWeight: '600', color: C.slateMid, marginBottom: rs(6) },
  inputWrap:  { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgMuted, borderRadius: rs(12), borderWidth: 1, borderColor: C.border, paddingHorizontal: rs(12) },
  input:      { flex: 1, paddingVertical: rs(12), fontSize: fs(16), color: C.slate, fontWeight: '600' },
  suffix:     { fontSize: fs(13), color: C.slateLight, fontWeight: '600' },
  gaugeCard:  { backgroundColor: C.sagePale, borderRadius: rs(16), padding: rs(16), marginBottom: rs(20) },
  gaugeTitle: { fontSize: fs(13), fontWeight: '700', color: C.sageDeep, marginBottom: rs(12) },
  gaugeStat:  { flex: 1, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: rs(12), paddingVertical: rs(14) },
  gaugeNum:   { fontSize: fs(28), fontWeight: '800', color: C.sageDeep },
  gaugeLabel: { fontSize: fs(11), color: C.sageDeep, fontWeight: '600', marginTop: rs(2) },
  resultCard: { backgroundColor: C.roseDeep, borderRadius: rs(16), padding: rs(20), marginBottom: rs(16) },
  resultTitle:{ fontSize: fs(13), fontWeight: '700', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: rs(12) },
  resultRow:  { flexDirection: 'row', alignItems: 'baseline', gap: rs(10) },
  resultBig:  { fontSize: fs(40), fontWeight: '800', color: C.white },
  resultUnit: { fontSize: fs(15), color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  resultNote: { fontSize: fs(12), color: 'rgba(255,255,255,0.7)', lineHeight: fs(18), marginTop: rs(14) },
  resetBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: rs(6), paddingVertical: rs(12) },
  resetText:  { fontSize: fs(13), color: C.slateMid, fontWeight: '600' },
});