import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, rs, fs, FONTS } from '../constants/theme';
import { haptic } from '../utils/haptics';
import YarnCalculatorScreen from './YarnCalculatorScreen';
import DifficultyQuizScreen from './DifficultyQuizScreen';
import AIAssistantScreen    from './AIAssistantScreen';
import StashTrackerScreen   from './StashTrackerScreen';
import ReferenceScreen      from './ReferenceScreen';
import RowCounterScreen     from './RowCounterScreen';
import LearnScreen          from './LearnScreen';
import GaugeCalculatorScreen from './GaugeCalculatorScreen';
import GetStartedScreen     from './GetStartedScreen';
import PatternSeederScreen  from './PatternSeederScreen';

const TOOLS = [
  { id:'getstarted', title:'How to Get Started',  desc:'New to crafting and don\'t know where to begin? Answer 2 questions and we\'ll pick your first project, what to buy, and how to actually start.',      icon:'compass',          color:C.rose },
  { id:'learn',      title:'Learn & Guides',      desc:'Cast on, bind off, stitch guides, terminology, and tips for crochet, knitting & sewing.',         icon:'book',             color:C.lavender },
  { id:'ai',         title:'AI Craft Assistant',  desc:'Ask anything about crochet, knitting, or sewing. Get instant expert advice.',                    icon:'sparkles',         color:C.rose },
  { id:'calculator', title:'Yarn Calculator',     desc:'Find out exactly how much yarn you need before you start any project.',                           icon:'calculator',       color:C.teal },
  { id:'gauge',      title:'Gauge Calculator',    desc:'Check your tension and work out how many stitches to cast on for the perfect fit.',               icon:'resize',           color:C.rose },
  { id:'quiz',       title:'Find Your Level',     desc:'Answer 5 questions to get personalised pattern recommendations for your skill level.',            icon:'ribbon',           color:C.amber },
  { id:'counter',    title:'Row Counter',         desc:'Tap to count your rows and pattern repeats. Set goals and never lose your place again.',          icon:'add-circle',       color:C.rose },
  { id:'stash',      title:'Stash Tracker',       desc:'Log your yarn collection. Track weight, fibre, colour, and quantity. Never buy duplicates again.', icon:'layers',           color:C.sage },
  { id:'reference',  title:'Quick Reference',     desc:'Hook & needle size charts, fibre guide. Everything you need at your fingertips.',                  icon:'grid',             color:C.lavender },
  { id:'seeder',     title:'Pattern Uploader',    desc:'Admin: re-upload the local patterns to Firestore. Use when patterns.js has new patterns or icons that need to sync up.', icon:'cloud-upload', color:C.slate },
];

function BackHeader({ title, onBack }) {
  return (
    <View style={{ flexDirection:'row', alignItems:'center', paddingHorizontal:rs(16), paddingVertical:rs(14), borderBottomWidth:1, borderBottomColor:C.border + '60' }}>
      <TouchableOpacity onPress={() => { haptic.light(); onBack(); }} style={{ marginRight:rs(12), padding:rs(4) }}>
        <Ionicons name="arrow-back" size={rs(22)} color={C.rose} />
      </TouchableOpacity>
      <Text style={{ fontSize:fs(17), fontWeight:'800', color:C.slate }}>{title}</Text>
    </View>
  );
}

export default function ToolsScreen({ homeSignal, onOpenPattern }) {
  const [active, setActive] = useState(null);

  // When the Tools tab is tapped again, return to the tools list
  useEffect(() => {
    if (homeSignal) setActive(null);
  }, [homeSignal]);

  if (active === 'getstarted') return <View style={{flex:1}}><BackHeader title="How to Get Started" onBack={()=>setActive(null)} /><GetStartedScreen onOpenPattern={onOpenPattern} /></View>;
  if (active === 'learn')      return <View style={{flex:1}}><BackHeader title="Learn & Guides" onBack={()=>setActive(null)} /><LearnScreen /></View>;
  if (active === 'ai')         return <View style={{flex:1}}><BackHeader title="AI Assistant"   onBack={()=>setActive(null)} /><AIAssistantScreen /></View>;
  if (active === 'calculator') return <View style={{flex:1}}><BackHeader title="Yarn Calculator" onBack={()=>setActive(null)} /><YarnCalculatorScreen /></View>;
  if (active === 'gauge')      return <View style={{flex:1}}><BackHeader title="Gauge Calculator" onBack={()=>setActive(null)} /><GaugeCalculatorScreen /></View>;
  if (active === 'seeder')     return <View style={{flex:1}}><BackHeader title="Pattern Uploader" onBack={()=>setActive(null)} /><PatternSeederScreen /></View>;
  if (active === 'quiz')       return <View style={{flex:1}}><BackHeader title="Find Your Level" onBack={()=>setActive(null)} /><DifficultyQuizScreen /></View>;
  if (active === 'counter')    return <View style={{flex:1}}><BackHeader title="Row Counter"    onBack={()=>setActive(null)} /><RowCounterScreen /></View>;
  if (active === 'stash')      return <View style={{flex:1}}><BackHeader title="Stash Tracker"  onBack={()=>setActive(null)} /><StashTrackerScreen /></View>;
  if (active === 'reference')  return <View style={{flex:1}}><BackHeader title="Quick Reference" onBack={()=>setActive(null)} /><ReferenceScreen /></View>;

  return (
    <ScrollView style={{ flex:1, backgroundColor:C.bgPage }}
      contentContainerStyle={{ padding:rs(16), paddingBottom:rs(48) }}
      showsVerticalScrollIndicator={false}>

      <Text style={s.title}>Tools</Text>
      <Text style={{ fontSize:fs(13), color:C.slateMid, marginBottom:rs(24) }}>Everything you need to plan and improve your craft</Text>

      {TOOLS.map(tool => (
        <TouchableOpacity key={tool.id} onPress={() => { haptic.light(); setActive(tool.id); }}
          activeOpacity={0.88} style={s.toolCard}>
          <View style={[s.toolIcon, { backgroundColor:tool.color+'18' }]}>
            <Ionicons name={tool.icon} size={rs(26)} color={tool.color} />
          </View>
          <View style={{ flex:1 }}>
            <Text style={s.toolTitle}>{tool.title}</Text>
            <Text style={s.toolDesc}>{tool.desc}</Text>
          </View>
          <Ionicons name="chevron-forward" size={rs(20)} color={C.slateLight} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  title:    { fontSize:fs(28), fontWeight:'800', color:C.slate, marginBottom:rs(4), fontFamily:FONTS.heading },
  toolCard: { backgroundColor:C.bgCard, borderRadius:rs(16), padding:rs(16), borderWidth:1, borderColor:C.border, marginBottom:rs(12), flexDirection:'row', alignItems:'center', gap:rs(14) },
  toolIcon: { width:rs(60), height:rs(60), borderRadius:rs(16), alignItems:'center', justifyContent:'center', flexShrink:0 },
  toolTitle:{ fontSize:fs(16), fontWeight:'700', color:C.slate, marginBottom:rs(4) },
  toolDesc: { fontSize:fs(12), color:C.slateMid, lineHeight:fs(18) },
});