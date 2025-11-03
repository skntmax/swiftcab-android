/**
 * MapDemoScreen - Web Fallback
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Surface, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MapDemoScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Surface style={styles.header} elevation={2}>
          <MaterialCommunityIcons name="map-marker-radius" size={48} color="#ED8902" />
          <Text variant="headlineMedium" style={styles.title}>
            Ola Maps Integration
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Map features are available on mobile devices
          </Text>
        </Surface>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.feature}>
              <MaterialCommunityIcons name="map-search" size={32} color="#ED8902" />
              <Text variant="titleMedium" style={styles.featureTitle}>
                Location Services
              </Text>
              <Text variant="bodySmall" style={styles.featureText}>
                Real-time location tracking and geocoding
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.feature}>
              <MaterialCommunityIcons name="directions" size={32} color="#ED8902" />
              <Text variant="titleMedium" style={styles.featureTitle}>
                Turn-by-Turn Directions
              </Text>
              <Text variant="bodySmall" style={styles.featureText}>
                Get optimized routes with distance and duration
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.feature}>
              <MaterialCommunityIcons name="map-marker-multiple" size={32} color="#ED8902" />
              <Text variant="titleMedium" style={styles.featureTitle}>
                Place Search
              </Text>
              <Text variant="bodySmall" style={styles.featureText}>
                Autocomplete search with nearby places
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Surface style={styles.notice} elevation={1}>
          <MaterialCommunityIcons name="information" size={24} color="#ED8902" />
          <Text variant="bodyMedium" style={styles.noticeText}>
            To use map features, please open this app on a mobile device (Android or iOS).
          </Text>
        </Surface>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8DC',
  },
  content: {
    padding: 16,
    alignItems: 'center',
  },
  header: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxWidth: 600,
    marginBottom: 24,
  },
  title: {
    marginTop: 16,
    color: '#111111',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    color: '#666666',
    textAlign: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 600,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  feature: {
    alignItems: 'center',
    padding: 16,
  },
  featureTitle: {
    marginTop: 12,
    marginBottom: 8,
    color: '#111111',
  },
  featureText: {
    color: '#666666',
    textAlign: 'center',
  },
  notice: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFF8DC',
    marginTop: 24,
    maxWidth: 600,
    alignItems: 'center',
    gap: 12,
  },
  noticeText: {
    flex: 1,
    color: '#111111',
  },
});

