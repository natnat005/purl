import { Platform } from 'react-native';

let Haptics = null;
try {
  Haptics = require('expo-haptics');
} catch (e) {}

export const haptic = {
  light: () => {
    try { Haptics?.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
  },
  medium: () => {
    try { Haptics?.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}
  },
  success: () => {
    try { Haptics?.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (e) {}
  },
  error: () => {
    try { Haptics?.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch (e) {}
  },
  selection: () => {
    try { Haptics?.selectionAsync(); } catch (e) {}
  },
};