import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, rs, fs } from '../constants/theme';
import { haptic } from '../utils/haptics';

const TABS = [
  { id:'library',  label:'Library',  icon:'book-outline',      iconActive:'book' },
  { id:'projects', label:'Projects', icon:'construct-outline',  iconActive:'construct' },
  { id:'community',label:'Community', icon:'people-outline',     iconActive:'people' },
  { id:'tools',    label:'Tools',    icon:'grid-outline',       iconActive:'grid' },
  { id:'profile',  label:'Profile',  icon:'person-outline',     iconActive:'person' },
];

export default function TabBar({ tab, setTab, projectCount, profileAlert }) {
  return (
    <View style={s.bar}>
      {TABS.map(t => {
        const active = tab === t.id;
        const badge  = t.id === 'projects' && projectCount > 0;
        const dot    = t.id === 'profile' && profileAlert;
        return (
          <TouchableOpacity key={t.id} style={s.btn}
            onPress={() => { haptic.selection(); setTab(t.id); }}
            activeOpacity={0.7}>
            <View style={[s.iconWrap, active && s.iconWrapActive]}>
              <Ionicons name={active ? t.iconActive : t.icon} size={rs(23)}
                color={active ? C.rose : C.slateLight} />
              {badge && (
                <View style={s.badge}>
                  <Text style={s.badgeText}>{projectCount}</Text>
                </View>
              )}
              {dot && <View style={s.dot} />}
            </View>
            <Text style={[s.label, active && s.labelActive]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  bar:           { flexDirection:'row', backgroundColor:C.bgCard, paddingTop:rs(8), paddingBottom:Platform.OS==='ios'?rs(34):rs(10), shadowColor:'#000', shadowOffset:{width:0,height:-8}, shadowOpacity:0.06, shadowRadius:16, elevation:12 },
  btn:           { flex:1, alignItems:'center', gap:rs(3) },
  iconWrap:      { position:'relative', width:rs(44), height:rs(32), borderRadius:rs(16), alignItems:'center', justifyContent:'center' },
  iconWrapActive:{ backgroundColor:C.rosePale },
  badge:         { position:'absolute', top:rs(-2), right:rs(-2), backgroundColor:C.rose, borderRadius:rs(8), minWidth:rs(16), height:rs(16), alignItems:'center', justifyContent:'center', paddingHorizontal:rs(3) },
  badgeText:     { fontSize:fs(9), color:C.white, fontWeight:'800' },
  dot:           { position:'absolute', top:rs(2), right:rs(6), width:rs(9), height:rs(9), borderRadius:rs(5), backgroundColor:C.rose, borderWidth:1.5, borderColor:C.bgCard },
  label:         { fontSize:fs(9), color:C.slateLight, fontWeight:'500' },
  labelActive:   { color:C.rose, fontWeight:'700' },
});