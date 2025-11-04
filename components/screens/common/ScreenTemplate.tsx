/**
 * Screen Template Component
 * Reusable template for all screen pages
 */

import { CONSTANTS } from '@/app/utils/const';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { ReactNode } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Surface, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import StylishBackground from '../../ui/StylishBackground';

interface ScreenTemplateProps {
  title: string;
  subtitle?: string;
  icon: string;
  children?: ReactNode;
  showBackButton?: boolean;
}

export const ScreenTemplate: React.FC<ScreenTemplateProps> = ({
  title,
  subtitle,
  icon,
  children,
  showBackButton = true,
}) => {
  return (
    <StylishBackground variant="dashboard">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {showBackButton && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
              </TouchableOpacity>
            )}
            <View style={styles.headerTitleContainer}>
              <Text variant="headlineSmall" style={styles.headerTitle}>
                {title}
              </Text>
              {subtitle && (
                <Text variant="bodySmall" style={styles.headerSubtitle}>
                  {subtitle}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {children ? (
            children
          ) : (
            <Card style={styles.comingSoonCard}>
              <Card.Content style={styles.comingSoonContent}>
                <Surface style={styles.iconContainer} elevation={2}>
                  <MaterialCommunityIcons
                    name={icon as any}
                    size={64}
                    color={CONSTANTS.theme.primaryColor}
                  />
                </Surface>
                <Text variant="headlineMedium" style={styles.comingSoonTitle}>
                  {title}
                </Text>
                <Text variant="bodyLarge" style={styles.comingSoonText}>
                  This feature is coming soon!
                </Text>
                <Text variant="bodyMedium" style={styles.comingSoonDescription}>
                  We're working hard to bring you this feature. Stay tuned for
                  updates.
                </Text>
              </Card.Content>
            </Card>
          )}
        </ScrollView>
      </SafeAreaView>
    </StylishBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(237, 137, 2, 0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    color: '#333',
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#666',
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  comingSoonCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginTop: 32,
  },
  comingSoonContent: {
    alignItems: 'center',
    padding: 48,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF8DC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  comingSoonTitle: {
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  comingSoonText: {
    color: CONSTANTS.theme.primaryColor,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  comingSoonDescription: {
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default ScreenTemplate;

