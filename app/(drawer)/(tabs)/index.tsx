import { Image, StyleSheet, Platform } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ViewSummaryScreen from '@/components/screens/dashboard/ViewSummaryScreen';

export default function HomeScreen() {
  return <ViewSummaryScreen />;
}

