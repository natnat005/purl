import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, rs, fs, FONTS } from '../constants/theme';
import { haptic } from '../utils/haptics';

const HOOKS = [
  { mm:'2.0', us:'B/1',    weight:'Lace / Thread',      color:'#E8B4B8' },
  { mm:'2.5', us:'C/2',    weight:'Lace / Fingering',   color:'#F0C0C0' },
  { mm:'3.0', us:'D/3',    weight:'Fingering / Sport',  color:'#F5CBA7' },
  { mm:'3.5', us:'E/4',    weight:'Sport / DK',         color:'#F9E79F' },
  { mm:'4.0', us:'G/6',    weight:'DK',                 color:'#A9DFBF' },
  { mm:'4.5', us:'7',      weight:'DK / Worsted',       color:'#82E0AA' },
  { mm:'5.0', us:'H/8',    weight:'Worsted',            color:'#76D7C4' },
  { mm:'5.5', us:'I/9',    weight:'Worsted / Aran',     color:'#85C1E9' },
  { mm:'6.0', us:'J/10',   weight:'Aran / Bulky',       color:'#BB8FCE' },
  { mm:'6.5', us:'K/10.5', weight:'Bulky',              color:'#C39BD3' },
  { mm:'8.0', us:'L/11',   weight:'Super Bulky',        color:'#D7BDE2' },
  { mm:'10.0',us:'N/15',   weight:'Jumbo',              color:'#FDFEFE' },
];

const NEEDLES = [
  { mm:'2.0',  us:'0',  weight:'Lace / Fingering',  color:'#E8B4B8' },
  { mm:'2.25', us:'1',  weight:'Fingering',          color:'#F0C0C0' },
  { mm:'2.75', us:'2',  weight:'Fingering / Sport',  color:'#F5CBA7' },
  { mm:'3.25', us:'3',  weight:'Sport',              color:'#F9E79F' },
  { mm:'3.5',  us:'4',  weight:'Sport / DK',         color:'#ABEBC6' },
  { mm:'3.75', us:'5',  weight:'DK',                 color:'#82E0AA' },
  { mm:'4.0',  us:'6',  weight:'DK / Worsted',       color:'#76D7C4' },
  { mm:'4.5',  us:'7',  weight:'Worsted',            color:'#85C1E9' },
  { mm:'5.0',  us:'8',  weight:'Worsted / Aran',     color:'#BB8FCE' },
  { mm:'5.5',  us:'9',  weight:'Aran',               color:'#C39BD3' },
  { mm:'6.0',  us:'10', weight:'Aran / Bulky',       color:'#D7BDE2' },
  { mm:'8.0',  us:'11', weight:'Bulky',              color:'#FDEBD0' },
  { mm:'10.0', us:'15', weight:'Super Bulky',        color:'#F9E79F' },
];

const FIBRES = [
  { name:'Merino Wool',   emoji:'🐑', color:C.sage,     desc:'The gold standard. Incredibly soft, elastic, warm, and breathable. Wet blocks beautifully.', best:'Garments, accessories, anything worn against skin', care:'Hand wash cold or gentle machine. Lay flat to dry.', avoid:'Hot water (causes felting)' },
  { name:'Regular Wool',  emoji:'🐏', color:C.sage,     desc:'Warm, elastic, durable. Can be scratchy. Felts easily with heat and agitation.', best:'Outerwear, bags, home decor, felted projects', care:'Hand wash cold only. Do not agitate. Lay flat to dry.', avoid:'Sensitive skin, hot water' },
  { name:'Alpaca',        emoji:'🦙', color:C.amber,    desc:'Incredibly soft, hypoallergenic, 3× warmer than wool. Lacks elasticity — tends to grow over time. Beautiful drape.', best:'Shawls, wraps, blankets, accessories', care:'Hand wash cold. Reshape and dry flat.', avoid:'Stretchy garments, tight gauge' },
  { name:'Cotton',        emoji:'☁️', color:C.teal,     desc:'Breathable, washable, great for warm climates. No elasticity. Gets softer with washing. Ideal for kitchen/bath items.', best:'Dishcloths, bags, summer tops, baby items', care:'Machine wash warm. Tumble dry on low.', avoid:'Cold weather wear, garments needing stretch' },
  { name:'Acrylic',       emoji:'✨', color:C.lavender, desc:'Budget-friendly, machine washable, hundreds of colours. "Killed" by steam — becomes permanently soft. Doesn\'t felt.', best:'Blankets, gifts, practice projects, kids items', care:'Machine wash and dry — very easy care.', avoid:'High-end garments, blocking' },
  { name:'Linen',         emoji:'🌾', color:C.amber,    desc:'Gets softer with every wash. Naturally antibacterial, moisture-wicking. Stiff to work with at first. Gorgeous summer fabric.', best:'Summer tops, bags, home decor, dishcloths', care:'Machine wash. Improves with washing.', avoid:'Cold weather wear, items needing elasticity' },
  { name:'Silk',          emoji:'🪡', color:C.lavender, desc:'Incredible sheen and drape. Slippery to work with. Often blended with wool to add lustre while keeping workability.', best:'Luxury shawls, special occasion accessories', care:'Hand wash cold. Very delicate.', avoid:'Beginners (very slippery), everyday wear' },
  { name:'Cashmere',      emoji:'👑', color:C.rose,     desc:'The most luxurious fibre. Incredibly soft, lightweight, warm. Very expensive. Usually blended to improve durability.', best:'Luxury accessories, gifts, special heirlooms', care:'Hand wash cold with specialist detergent. Dry flat.', avoid:'High-wear items, everyday bags' },
  { name:'Mohair',        emoji:'🐐', color:C.lavender, desc:'Extremely fluffy, halo-like. Usually held with a smooth yarn. Warm and lightweight. Difficult to frog once worked.', best:'Held with another yarn for halo effect, cozy accessories', care:'Hand wash cold. Very gentle.', avoid:'Using alone (too fine), projects you might frog' },
  { name:'Bamboo',        emoji:'🎋', color:C.teal,     desc:'Silky smooth with subtle sheen. Breathable, moisture-wicking, eco-friendly. Beautiful drape similar to silk.', best:'Summer wear, baby items, drape-heavy projects', care:'Gentle machine wash cold. Lay flat to dry.', avoid:'Projects needing structure or elasticity' },
];

export default function ReferenceScreen() {
  const [section,  setSection]  = useState('hooks');
  const [expanded, setExpanded] = useState(null);

  return (
    <View style={{ flex: 1, backgroundColor: C.bgPage }}>
      <View style={{ paddingHorizontal: rs(16), paddingVertical: rs(14) }}>
        <Text style={s.title}>Quick Reference 📐</Text>
      </View>

      <View style={s.switcher}>
        {[{ id:'hooks', label:'🪝 Hooks' }, { id:'needles', label:'🧶 Needles' }, { id:'fibres', label:'🐑 Fibres' }].map(sec => (
          <TouchableOpacity key={sec.id} onPress={() => { setSection(sec.id); haptic.selection(); setExpanded(null); }}
            style={[s.switchBtn, section===sec.id && s.switchBtnActive]} activeOpacity={0.8}>
            <Text style={[s.switchLabel, section===sec.id && s.switchLabelActive]}>{sec.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: rs(16), paddingBottom: rs(40) }} showsVerticalScrollIndicator={false}>

        {section === 'hooks' && (
          <View>
            <Text style={s.intro}>Match hook size to yarn weight. Going up a size loosens gauge; going down tightens it.</Text>
            {HOOKS.map(h => (
              <View key={h.mm} style={s.sizeRow}>
                <View style={[s.dot, { backgroundColor: h.color }]} />
                <View style={{ width: rs(72) }}>
                  <Text style={s.sizeMm}>{h.mm}mm</Text>
                  <Text style={s.sizeUs}>US {h.us}</Text>
                </View>
                <Text style={{ flex: 1, fontSize: fs(13), color: C.slate }}>{h.weight}</Text>
              </View>
            ))}
            <View style={s.tip}><Text style={s.tipText}>💡 Too many stitches per inch → go UP a hook size. Too few → go DOWN.</Text></View>
          </View>
        )}

        {section === 'needles' && (
          <View>
            <Text style={s.intro}>US and metric sizes vary slightly between brands. Use a needle gauge to verify.</Text>
            {NEEDLES.map(n => (
              <View key={n.mm} style={s.sizeRow}>
                <View style={[s.dot, { backgroundColor: n.color }]} />
                <View style={{ width: rs(72) }}>
                  <Text style={s.sizeMm}>{n.mm}mm</Text>
                  <Text style={s.sizeUs}>US {n.us}</Text>
                </View>
                <Text style={{ flex: 1, fontSize: fs(13), color: C.slate }}>{n.weight}</Text>
              </View>
            ))}
            <View style={s.tip}><Text style={s.tipText}>💡 Circular needles work for both flat AND in-the-round projects. Great all-purpose choice.</Text></View>
          </View>
        )}

        {section === 'fibres' && (
          <View>
            <Text style={s.intro}>Understanding fibre properties helps you choose the right yarn for every project. Tap to expand.</Text>
            {FIBRES.map((f, i) => (
              <TouchableOpacity key={f.name} onPress={() => { setExpanded(expanded===i ? null : i); haptic.light(); }}
                activeOpacity={0.85} style={[s.fibreCard, expanded===i && { borderColor: f.color, borderWidth: 1.5 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: fs(22), marginRight: rs(12) }}>{f.emoji}</Text>
                  <Text style={{ flex: 1, fontSize: fs(15), fontWeight: '700', color: C.slate }}>{f.name}</Text>
                  <Ionicons name={expanded===i ? 'chevron-up' : 'chevron-down'} size={rs(16)} color={C.slateLight} />
                </View>
                {expanded===i && (
                  <View style={{ marginTop: rs(14), paddingTop: rs(14), borderTopWidth: 1, borderTopColor: C.border }}>
                    <Text style={s.fibreDesc}>{f.desc}</Text>
                    {[['✅ Best for', f.best], ['🧺 Care', f.care], ['⚠️ Avoid', f.avoid]].map(([label, val]) => (
                      <View key={label} style={{ flexDirection: 'row', gap: rs(8), marginBottom: rs(8) }}>
                        <Text style={{ fontSize: fs(12), fontWeight: '700', color: C.slate, width: rs(80), flexShrink: 0 }}>{label}:</Text>
                        <Text style={{ fontSize: fs(12), color: C.slateMid, flex: 1, lineHeight: fs(18) }}>{val}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  title:           { fontSize: fs(26), fontWeight: '800', color: C.slate, fontFamily: FONTS.heading },
  switcher:        { flexDirection: 'row', marginHorizontal: rs(16), marginBottom: rs(16), backgroundColor: C.bgMuted, borderRadius: rs(12), padding: rs(4), gap: rs(4) },
  switchBtn:       { flex: 1, borderRadius: rs(10), paddingVertical: rs(8), alignItems: 'center' },
  switchBtnActive: { backgroundColor: C.bgCard, shadowColor: '#000', shadowOffset: { width:0, height:1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  switchLabel:     { fontSize: fs(12), fontWeight: '600', color: C.slateMid },
  switchLabelActive:{ color: C.slate, fontWeight: '700' },
  intro:           { fontSize: fs(13), color: C.slateMid, lineHeight: fs(20), marginBottom: rs(16) },
  sizeRow:         { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgCard, borderRadius: rs(12), padding: rs(12), marginBottom: rs(8), borderWidth: 1, borderColor: C.border, gap: rs(12) },
  dot:             { width: rs(14), height: rs(14), borderRadius: rs(7), flexShrink: 0 },
  sizeMm:          { fontSize: fs(14), fontWeight: '700', color: C.slate },
  sizeUs:          { fontSize: fs(11), color: C.slateMid },
  tip:             { backgroundColor: C.amberPale, borderRadius: rs(12), padding: rs(14), marginTop: rs(8) },
  tipText:         { fontSize: fs(13), color: C.amberDeep, lineHeight: fs(20) },
  fibreCard:       { backgroundColor: C.bgCard, borderRadius: rs(14), padding: rs(14), marginBottom: rs(10), borderWidth: 1, borderColor: C.border },
  fibreDesc:       { fontSize: fs(13), color: C.slate, lineHeight: fs(22), marginBottom: rs(12) },
});