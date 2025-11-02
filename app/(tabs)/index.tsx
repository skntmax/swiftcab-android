import { CONSTANTS } from '@/app/utils/const';
import { Image } from 'expo-image';
import { Platform, StyleSheet, View } from 'react-native';
import { Button, Surface, Text } from 'react-native-paper';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <Surface style={styles.card} elevation={1}>
        <Text variant="titleMedium" style={styles.cardTitle}>Go Online</Text>
        <Text variant="bodyMedium" style={styles.cardText}>Start receiving ride requests.</Text>
        <Button mode="contained" buttonColor={CONSTANTS.theme.primaryColor}>Go Online</Button>
      </Surface>
      <Surface style={styles.card} elevation={1}>
        <Text variant="titleMedium" style={styles.cardTitle}>Incoming Request</Text>
        <Text variant="bodyMedium" style={styles.cardText}>Customer: Riya • 1.2 km away</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Button mode="outlined" textColor={CONSTANTS.theme.primaryColor}>Reject</Button>
          <Button mode="contained" buttonColor={CONSTANTS.theme.primaryColor}>Accept</Button>
        </View>
      </Surface>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
