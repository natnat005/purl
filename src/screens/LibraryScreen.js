import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  ScrollView, Modal, StyleSheet, SafeAreaView, Alert,
  Image, Animated, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, rs, fs, CARD_W, DIFF_COLORS, CRAFT_COLORS, FONTS } from '../constants/theme';
import { usePatterns } from '../hooks/usePatterns';
import PatternCard from '../components/PatternCard';
import { SkeletonGrid } from '../components/SkeletonCard';
import { haptic } from '../utils/haptics';
import { iconForPattern } from '../utils/icons';
import CreatePatternScreen from './CreatePatternScreen';

const FILTERS = [
  { id: 'all',          label: 'All',          emoji: '✨' },
  { id: 'crochet',      label: 'Crochet',      emoji: '🪝' },
  { id: 'knitting',     label: 'Knitting',     emoji: '🧶' },
  { id: 'sewing',       label: 'Sewing',       emoji: '🧵' },
  { id: 'beginner',     label: 'Beginner',     emoji: '🌱' },
  { id: 'intermediate', label: 'Intermediate', emoji: '⭐' },
  { id: 'advanced',     label: 'Advanced',     emoji: '🔥' },
  { id: 'quick',        label: 'Quick',        emoji: '⚡' },
  { id: 'popular',      label: 'Popular',      emoji: '📈' },
];

// ─── Pattern Detail Modal ─────────────────────────────────────────
function PatternDetailModal({ item, onClose, onStartProject, inProgress }) {
  if (!item) return null;

  // Sizing state — only used if the pattern has a sizing config.
  // Initialize to the default values declared on the pattern.
  const [sizeValues, setSizeValues] = useState(() => {
    if (!item.sizing?.inputs) return {};
    const init = {};
    for (const inp of item.sizing.inputs) {
      init[inp.id] = String(inp.defaultValue);
    }
    return init;
  });

  // Compute the placeholder values by evaluating each formula with
  // sizeValues plugged in. We use a tiny safe-ish evaluator: only Math
  // and the input variables are in scope.
  const computed = (() => {
    if (!item.sizing?.compute) return {};
    const numeric = {};
    for (const inp of item.sizing.inputs || []) {
      const v = parseFloat(sizeValues[inp.id]);
      numeric[inp.id] = isNaN(v) ? inp.defaultValue : v;
    }
    const out = {};
    for (const [key, expr] of Object.entries(item.sizing.compute)) {
      try {
        // eslint-disable-next-line no-new-func
        const fn = new Function(...Object.keys(numeric), `return ${expr};`);
        const val = fn(...Object.values(numeric));
        out[key] = Number.isFinite(val) ? val : '?';
      } catch (e) {
        out[key] = '?';
      }
    }
    return out;
  })();

  // Replace {placeholder} tokens in a step's text with computed values.
  const fillPlaceholders = (text) => {
    if (typeof text !== 'string') return text;
    return text.replace(/\{(\w+)\}/g, (_, key) => {
      if (key in computed) return computed[key];
      return `{${key}}`;
    });
  };

  const dc       = DIFF_COLORS[item.cat]   || C.slate;
  const cc       = CRAFT_COLORS[item.type] || C.rose;
  const isCrochet  = item.type === 'crochet';
  const isKnitting = item.type === 'knitting';
  const isSewing   = item.type === 'sewing';

  // If this pattern has user-submitted steps (community pattern), use them.
  // Otherwise fall back to the generated steps for admin/legacy patterns.
  const steps = (Array.isArray(item.steps) && item.steps.length > 0) ? item.steps : (isCrochet ? [
    `Foundation: ${item.id === 'c2' ? 'Make a magic ring or ch 4, sl st to join' : `Chain ${item.cat === 'beginner' ? '16 (or desired width + 1 turning chain)' : '24 (adjust for your gauge)'}`}.`,
    `Row/Round 1: ${item.id === 'c1' ? 'Sc in 2nd ch from hook and each ch across. Ch 1, turn.' : 'Dc in 4th ch from hook and each ch across. Ch 3, turn.'}`,
    `Continue for ${item.cat === 'beginner' ? '20 rows or desired length' : 'as many rows as pattern requires, checking measurements'}.`,
    `Shape: ${item.cat === 'advanced' ? 'Follow chart precisely for all inc/dec' : 'Decrease evenly across final rows to shape'}.`,
    'Fasten off leaving a 10-inch tail.',
    'Weave in all ends through stitches in multiple directions. Trim close.',
    item.cat !== 'beginner' ? 'Block: wet thoroughly, pin to measurements, dry 24–48 hrs.' : '🎉 Complete!',
  ] : isKnitting ? [
    `Cast on ${item.cat === 'beginner' ? '20 sts using long-tail cast on' : '40–80 sts depending on gauge and size'}.`,
    `Setup: ${item.id === 'k1' ? 'Knit every row (garter stitch).' : item.id === 'k3' ? 'K2, P2 across every row.' : 'Knit RS, purl WS for stockinette.'}`,
    `Work for ${item.cat === 'beginner' ? '40 rows or desired length' : '80+ rows following any shaping'}.`,
    item.cat === 'advanced' ? 'Follow cable chart on RS rows only using cable needle.' : 'Maintain pattern, counting every 10 rows.',
    `Finish: ${item.id === 'k5' || item.id === 'k9' ? 'K2tog across crown until 8 sts. Break yarn, thread through, pull tight.' : 'Bind off loosely in pattern.'}`,
    'Weave all ends on WS along purl bumps for security.',
    'Block to measurements: soak, roll in towel, pin, dry completely.',
  ] : [
    `Pre-wash your ${item.fabric || 'fabric'} to prevent shrinkage later. Press while damp.`,
    'Cut fabric pieces following pattern, leaving correct seam allowance on all edges.',
    'Transfer all notches and markings. Staystitch curved edges before assembling.',
    'Assemble in pattern order — darts first, then major seams, then details.',
    'Press every seam as you go. Never skip pressing.',
    'Finish raw edges with zigzag or serger. Hem and press carefully.',
    item.cat !== 'beginner' ? 'Sew lining if required. Attach closures. Final press.' : 'Hem by turning up twice, stitch close to fold. Done!',
  ]);

  const materials = (Array.isArray(item.materials) && item.materials.length > 0) ? item.materials : [
    item.type !== 'sewing'
      ? `${item.yarn} weight yarn — ${item.cat === 'beginner' ? '100–200g' : item.cat === 'intermediate' ? '200–400g' : '400g+'}`
      : `${item.fabric || 'Fabric'} — ${item.cat === 'beginner' ? '0.5m' : item.cat === 'intermediate' ? '1–2m' : '2–3m'}`,
    isCrochet  ? `Crochet hook ${item.hook}`
    : isKnitting ? `Knitting needles ${item.needles}`
    : 'Sewing machine (or hand needle)',
    'Sharp scissors for fabric/yarn only',
    'Yarn needle or hand sewing needle for finishing',
    item.cat !== 'beginner' ? '4–8 stitch markers' : null,
    isSewing ? 'Iron and pressing cloth — essential' : null,
    item.id === 'c7' ? '2 safety eyes (9mm) + toy stuffing' : null,
    'Blocking mats and rust-proof pins',
  ].filter(Boolean);

  return (
    <Modal visible={!!item} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bgPage }}>
        <ScrollView contentContainerStyle={{ paddingBottom: rs(48) }} showsVerticalScrollIndicator={false}>

          {/* Close button */}
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: rs(16), paddingBottom: 0 }}>
            <TouchableOpacity onPress={() => { haptic.light(); onClose(); }} style={{ padding: rs(4) }}>
              <Ionicons name="arrow-back" size={rs(22)} color={C.rose} />
            </TouchableOpacity>
            <Text style={{ fontSize: fs(17), fontWeight: '800', color: C.slate, flex: 1, marginLeft: rs(10) }} numberOfLines={2}>{item.name}</Text>
          </View>

          {/* Hero — icon card */}
          <View style={{ margin: rs(16), borderRadius: rs(20), overflow: 'hidden', backgroundColor: dc + '15' }}>
            <View style={{ height: rs(160), alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={iconForPattern(item)} size={rs(72)} color={cc} />
            </View>
            <View style={{ padding: rs(16) }}>
              <View style={{ flexDirection: 'row', gap: rs(8), marginBottom: rs(8) }}>
                <View style={[s.pill, { backgroundColor: dc + '25' }]}><Text style={[s.pillText, { color: dc }]}>{item.cat}</Text></View>
                <View style={[s.pill, { backgroundColor: cc + '25' }]}><Text style={[s.pillText, { color: cc }]}>{item.type}</Text></View>
              </View>
              <Text style={{ fontSize: fs(13), color: C.slateMid, lineHeight: fs(21) }}>{item.desc}</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={{ flexDirection: 'row', gap: rs(10), marginHorizontal: rs(16), marginBottom: rs(20) }}>
            {[
              { icon: 'time-outline',      val: item.time,                                       label: 'Time' },
              { icon: 'construct-outline', val: isCrochet ? item.hook : isKnitting ? item.needles : 'Machine', label: isCrochet ? 'Hook' : isKnitting ? 'Needles' : 'Tool' },
              { icon: 'layers-outline',    val: item.yarn || item.fabric,                        label: isSewing ? 'Fabric' : 'Yarn' },
            ].map(i => (
              <View key={i.label} style={{ flex: 1, backgroundColor: C.bgCard, borderRadius: rs(12), padding: rs(10), alignItems: 'center', borderWidth: 1, borderColor: C.border }}>
                <Ionicons name={i.icon} size={rs(16)} color={C.rose} />
                <Text style={{ fontSize: fs(11), fontWeight: '700', color: C.slate, marginTop: rs(4), textAlign: 'center' }}>{i.val}</Text>
                <Text style={{ fontSize: fs(9), color: C.slateMid }}>{i.label}</Text>
              </View>
            ))}
          </View>

          {/* Materials */}
          <View style={[s.card, { marginHorizontal: rs(16), marginBottom: rs(16) }]}>
            <Text style={s.sectionLabel}>What you'll need</Text>
            {materials.map((m, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: rs(8), marginBottom: rs(8) }}>
                <Text style={{ color: C.rose, fontSize: fs(14) }}>•</Text>
                <Text style={{ fontSize: fs(13), color: C.slate, flex: 1, lineHeight: fs(21) }}>{m}</Text>
              </View>
            ))}
          </View>

          {/* Sizing — only shown when the pattern declares it */}
          {item.sizing?.inputs?.length > 0 && (
            <View style={[s.card, { marginHorizontal: rs(16), marginBottom: rs(16), backgroundColor: C.lavender + '10', borderColor: C.lavender + '40' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs(8), marginBottom: rs(4) }}>
                <Ionicons name="resize-outline" size={rs(16)} color={C.lavender} />
                <Text style={[s.sectionLabel, { color: C.lavender, marginBottom: 0 }]}>Customize Size</Text>
              </View>
              <Text style={{ fontSize: fs(12), color: C.slateMid, marginBottom: rs(12), lineHeight: fs(18) }}>
                Enter your measurements and the steps below will fill in the right numbers automatically. Always swatch first to find your gauge.
              </Text>
              {item.sizing.inputs.map(inp => (
                <View key={inp.id} style={{ marginBottom: rs(10) }}>
                  <Text style={{ fontSize: fs(12), color: C.slate, fontWeight: '600', marginBottom: rs(4) }}>
                    {inp.label} {inp.unit ? `(${inp.unit})` : ''}
                  </Text>
                  <TextInput
                    style={{ backgroundColor: C.bgCard, borderRadius: rs(10), borderWidth: 1, borderColor: C.border, paddingHorizontal: rs(12), paddingVertical: rs(8), fontSize: fs(14), color: C.slate }}
                    value={sizeValues[inp.id]}
                    keyboardType="numeric"
                    onChangeText={v => setSizeValues(prev => ({ ...prev, [inp.id]: v }))}
                  />
                </View>
              ))}
            </View>
          )}

          {/* Steps */}
          <View style={[s.card, { marginHorizontal: rs(16), marginBottom: rs(16) }]}>
            <Text style={s.sectionLabel}>Step-by-step</Text>
            {steps.map((step, i) => {
              // Steps can be a plain string, or an object { text, image }
              const rawText   = typeof step === 'string' ? step : step.text;
              const stepText  = fillPlaceholders(rawText);
              const stepImage = typeof step === 'string' ? null : step.image;
              return (
                <View key={i} style={{ marginBottom: rs(16) }}>
                  <View style={{ flexDirection: 'row', gap: rs(12) }}>
                    <View style={{ width: rs(26), height: rs(26), borderRadius: rs(13), backgroundColor: C.rose, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Text style={{ fontSize: fs(11), color: C.white, fontWeight: '700' }}>{i + 1}</Text>
                    </View>
                    <Text style={{ fontSize: fs(13), color: C.slate, flex: 1, lineHeight: fs(22) }}>{stepText}</Text>
                  </View>
                  {stepImage && (
                    <Image
                      source={{ uri: stepImage }}
                      style={{ width: '100%', height: rs(180), borderRadius: rs(12), marginTop: rs(10) }}
                      resizeMode="cover"
                    />
                  )}
                </View>
              );
            })}
          </View>

          {/* Watch tutorials — opens YouTube search (always works) */}
          <TouchableOpacity
            style={[s.card, { marginHorizontal: rs(16), marginBottom: rs(16), flexDirection: 'row', alignItems: 'center', gap: rs(12) }]}
            onPress={() => {
              haptic.light();
              const skill = item.cat === 'beginner' ? 'for beginners' : '';
              const q = encodeURIComponent(`how to ${item.type} ${item.name} ${skill} step by step tutorial`.replace(/\s+/g, ' ').trim());
              Linking.openURL(`https://www.youtube.com/results?search_query=${q}`);
            }}
            activeOpacity={0.85}>
            <View style={{ width: rs(48), height: rs(48), borderRadius: rs(12), backgroundColor: '#FF000018', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="logo-youtube" size={rs(26)} color="#FF0000" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fs(14), fontWeight: '700', color: C.slate }}>Watch video tutorials</Text>
              <Text style={{ fontSize: fs(12), color: C.slateMid, marginTop: rs(2) }}>Opens a YouTube search for this exact project</Text>
            </View>
            <Ionicons name="open-outline" size={rs(18)} color={C.slateLight} />
          </TouchableOpacity>

          {/* CTA */}
          <TouchableOpacity
            style={[s.mainBtn, { marginHorizontal: rs(16) }]}
            onPress={() => { haptic.success(); onStartProject(item); }}
            activeOpacity={0.88}>
            <Text style={s.mainBtnText}>{inProgress ? 'Already in your projects' : 'Add to My Projects'}</Text>
            <Ionicons name={inProgress ? 'checkmark-circle' : 'add-circle-outline'} size={rs(20)} color={C.white} />
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Sort Modal ───────────────────────────────────────────────────
function SortModal({ visible, current, onSelect, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
        <View style={s.sheet}>
          <View style={s.sheetHandle} />
          <Text style={[s.sectionLabel, { fontSize: fs(16), marginBottom: rs(16) }]}>Filter patterns</Text>
          {FILTERS.map(f => (
            <TouchableOpacity key={f.id}
              onPress={() => { haptic.selection(); onSelect(f.id); onClose(); }}
              style={[s.sortRow, current === f.id && { backgroundColor: C.rosePale }]}
              activeOpacity={0.8}>
              <Text style={{ fontSize: fs(20), marginRight: rs(12) }}>{f.emoji}</Text>
              <Text style={[s.sortLabel, current === f.id && { color: C.rose }]}>{f.label}</Text>
              {current === f.id && <Ionicons name="checkmark" size={rs(18)} color={C.rose} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
}

// ─── Library Screen ───────────────────────────────────────────────
export default function LibraryScreen({ projects, onStartProject, user, homeSignal, favorites = [], onToggleFavorite = () => {}, pendingPatternId, onConsumePendingPattern }) {
  const [filter, setFilter]     = useState('all');
  const [search, setSearch]     = useState('');
  const [sortOpen, setSortOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loaded, setLoaded]     = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Live patterns from Firestore (falls back to hardcoded data while loading)
  const { patterns: PATTERNS } = usePatterns();

  // Simulate initial load
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 1200);
    return () => clearTimeout(t);
  }, []);

  // If another screen handed us a pendingPatternId (e.g. Get Started),
  // find that pattern and open its detail modal, then clear the request.
  useEffect(() => {
    if (!pendingPatternId || !PATTERNS || PATTERNS.length === 0) return;
    const found = PATTERNS.find(p => p.id === pendingPatternId);
    if (found) {
      setSelected(found);
      onConsumePendingPattern && onConsumePendingPattern();
    }
  }, [pendingPatternId, PATTERNS]);

  const filtered = useMemo(() => {
    let items = [...PATTERNS];
    if (filter === 'crochet' || filter === 'knitting' || filter === 'sewing')
      items = items.filter(p => p.type === filter);
    else if (['beginner','intermediate','advanced'].includes(filter))
      items = items.filter(p => p.cat === filter);
    else if (filter === 'quick')
      items = items.filter(p => parseInt(p.time) <= 4);
    else if (filter === 'popular')
      items = items.filter(p => ['Popular','Trending','Classic','Start here'].includes(p.tag));
    if (search.trim())
      items = items.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.desc.toLowerCase().includes(search.toLowerCase())
      );
    return items;
  }, [filter, search, favorites, PATTERNS]);

  const LABEL = { all:'All patterns', crochet:'Crochet', knitting:'Knitting', sewing:'Sewing', beginner:'Beginner', intermediate:'Intermediate', advanced:'Advanced', quick:'Quick projects', popular:'Popular' };

  // Logo header opacity — fades as user scrolls
  const renderPair = ({ item, index }) => {
    if (index % 2 !== 0) return null;
    const right = filtered[index + 1];
    return (
      <View style={{ flexDirection: 'row', paddingHorizontal: rs(16), gap: rs(12), marginBottom: rs(12) }}>
        <PatternCard item={item} onPress={p => { haptic.light(); setSelected(p); }} inProgress={!!projects.find(p => p.id === item.id)} isFavorite={favorites.includes(item.id)} onToggleFavorite={onToggleFavorite} />
        {right
          ? <PatternCard item={right} onPress={p => { haptic.light(); setSelected(p); }} inProgress={!!projects.find(p => p.id === right.id)} isFavorite={favorites.includes(right.id)} onToggleFavorite={onToggleFavorite} />
          : <View style={{ width: CARD_W }} />
        }
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bgPage }}>
      {/* Sticky top bar — search + filter */}
      <View style={s.topBar}>
        <View style={s.searchBar}>
          <Ionicons name="search-outline" size={rs(16)} color={C.slateMid} />
          <TextInput style={s.searchInput} placeholder="Search patterns..."
            placeholderTextColor={C.slateLight} value={search} onChangeText={setSearch} />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={rs(16)} color={C.slateMid} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={() => { haptic.light(); setSortOpen(true); }}
          style={s.filterBtn} activeOpacity={0.8}>
          <Ionicons name="options-outline" size={rs(20)} color={C.rose} />
        </TouchableOpacity>
      </View>

      {!loaded ? (
        <ScrollView contentContainerStyle={{ paddingTop: rs(12) }} showsVerticalScrollIndicator={false}>
          <SkeletonGrid />
        </ScrollView>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={p => p.id}
          renderItem={renderPair}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
          scrollEventThrottle={16}
          ListHeaderComponent={
            <View style={{ paddingTop: rs(12), paddingBottom: rs(4) }}>
              {/* Greeting card */}
              {filter === 'all' && !search && (
                <View style={s.heroCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.greeting}>
                      {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}
                    </Text>
                    <Text style={s.greetingSub}>What will you make today?</Text>
                  </View>
                  <Text style={{ fontSize: rs(40) }}>🧶</Text>
                </View>
              )}

              {/* Filter label */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: rs(16), marginBottom: rs(12) }}>
                <Text style={s.filterLabel}>{LABEL[filter]} · {filtered.length}</Text>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: rs(60) }}>
              <Text style={{ fontSize: rs(48), marginBottom: rs(12) }}>🔍</Text>
              <Text style={{ fontSize: fs(16), fontWeight: '700', color: C.slate }}>No patterns found</Text>
              <Text style={{ fontSize: fs(13), color: C.slateMid, marginTop: rs(4) }}>Try a different search or filter</Text>
            </View>
          }
          ListFooterComponent={<View style={{ height: rs(24) }} />}
        />
      )}

      <SortModal visible={sortOpen} current={filter} onSelect={setFilter} onClose={() => setSortOpen(false)} />
      <PatternDetailModal item={selected} onClose={() => setSelected(null)}
        inProgress={selected ? !!projects.find(p => p.id === selected.id) : false}
        onStartProject={item => { onStartProject(item); setSelected(null); }} />

      {/* Floating "create pattern" button */}
      <TouchableOpacity onPress={() => { haptic.medium(); setCreateOpen(true); }}
        style={s.fab} activeOpacity={0.88}>
        <Ionicons name="add" size={rs(28)} color={C.white} />
      </TouchableOpacity>

      <Modal visible={createOpen} animationType="slide" presentationStyle="pageSheet"
        onRequestClose={() => setCreateOpen(false)}>
        <CreatePatternScreen
          onCancel={() => setCreateOpen(false)}
          onDone={() => setCreateOpen(false)}
        />
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  topBar:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: rs(16), paddingVertical: rs(10), gap: rs(10), backgroundColor: C.bgPage, borderBottomWidth: 1, borderBottomColor: C.border + '80' },
  logo:        { fontSize: rs(26) },
  searchBar:   { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgMuted, borderRadius: rs(12), paddingHorizontal: rs(12), gap: rs(8), height: rs(40) },
  searchInput: { flex: 1, fontSize: fs(14), color: C.slate, paddingVertical: rs(0) },
  filterBtn:   { width: rs(40), height: rs(40), borderRadius: rs(12), backgroundColor: C.rosePale, alignItems: 'center', justifyContent: 'center' },
  greeting:    { fontSize: fs(24), fontWeight: '800', color: C.roseDeep, fontFamily: FONTS.heading },
  greetingSub: { fontSize: fs(14), color: C.rose, marginTop: rs(2) },
  heroCard:    { flexDirection: 'row', alignItems: 'center', backgroundColor: C.rosePale, borderRadius: rs(20), padding: rs(20), marginHorizontal: rs(16), marginBottom: rs(16) },
  filterLabel: { fontSize: fs(14), fontWeight: '700', color: C.slate },
  fab:         { position: 'absolute', right: rs(20), bottom: rs(24), width: rs(56), height: rs(56), borderRadius: rs(28), backgroundColor: C.rose, alignItems: 'center', justifyContent: 'center', shadowColor: C.roseDeep, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6 },
  card:        { backgroundColor: C.bgCard, borderRadius: rs(16), padding: rs(16), borderWidth: 1, borderColor: C.border },
  sectionLabel:{ fontSize: fs(11), fontWeight: '700', color: C.slateMid, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: rs(12) },
  pill:        { borderRadius: rs(10), paddingHorizontal: rs(10), paddingVertical: rs(4) },
  pillText:    { fontSize: fs(11), fontWeight: '700' },
  mainBtn:     { backgroundColor: C.rose, borderRadius: rs(16), paddingVertical: rs(16), paddingHorizontal: rs(20), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mainBtnText: { fontSize: fs(15), fontWeight: '800', color: C.white },
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet:       { backgroundColor: C.bgCard, borderTopLeftRadius: rs(24), borderTopRightRadius: rs(24), padding: rs(24), paddingBottom: rs(48) },
  sheetHandle: { width: rs(36), height: rs(4), backgroundColor: C.border, borderRadius: rs(2), alignSelf: 'center', marginBottom: rs(16) },
  sortRow:     { flexDirection: 'row', alignItems: 'center', paddingVertical: rs(14), paddingHorizontal: rs(12), borderRadius: rs(12), marginBottom: rs(4) },
  sortLabel:   { flex: 1, fontSize: fs(15), fontWeight: '600', color: C.slate },
});