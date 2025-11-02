// This file creates all the placeholder screens for the navigation

import { CONSTANTS } from '@/app/utils/const';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Surface, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PlaceholderScreenProps {
  title: string;
  description: string;
  icon: string;
  features?: string[];
}

const PlaceholderScreen: React.FC<PlaceholderScreenProps> = ({ title, description, icon, features }) => (
  <SafeAreaView style={styles.container}>
    <ScrollView contentContainerStyle={styles.content}>
      <Surface style={styles.header} elevation={2}>
        <MaterialCommunityIcons name={icon as any} size={48} color={CONSTANTS.theme.primaryColor} />
        <Text variant="headlineMedium" style={styles.title}>{title}</Text>
        <Text variant="bodyLarge" style={styles.description}>{description}</Text>
      </Surface>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>Coming Soon!</Text>
          <Text variant="bodyMedium" style={styles.cardText}>
            This feature is currently under development. We're working hard to bring you the best experience.
          </Text>
          
          {features && features.length > 0 && (
            <View style={styles.featuresSection}>
              <Text variant="titleSmall" style={styles.featuresTitle}>Planned Features:</Text>
              {features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <MaterialCommunityIcons name="check" size={16} color="#4CAF50" />
                  <Text variant="bodySmall" style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>Need Help?</Text>
          <Text variant="bodyMedium" style={styles.cardText}>
            If you have any questions or need assistance, please contact our support team.
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8DC',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#333',
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    color: '#666',
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  cardTitle: {
    color: '#333',
    fontWeight: '600',
    marginBottom: 8,
  },
  cardText: {
    color: '#666',
    lineHeight: 22,
  },
  featuresSection: {
    marginTop: 16,
  },
  featuresTitle: {
    color: '#333',
    fontWeight: '600',
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
});

// Export all placeholder screens
export const MonthlyEarningsScreen = () => (
  <PlaceholderScreen
    title="Monthly Earnings"
    description="View your monthly earnings breakdown"
    icon="calendar-month"
    features={[
      "Monthly earnings summary",
      "Earnings comparison with previous months", 
      "Detailed breakdown by weeks",
      "Performance analytics"
    ]}
  />
);

export const PaymentHistoryScreen = () => (
  <PlaceholderScreen
    title="Payment History"
    description="Track all your payment transactions"
    icon="history"
    features={[
      "Complete payment history",
      "Bank transfer details",
      "Transaction status tracking",
      "Download payment receipts"
    ]}
  />
);

export const UploadDocumentsScreen = () => (
  <PlaceholderScreen
    title="Upload Documents"
    description="Upload and manage your driver documents"
    icon="upload"
    features={[
      "Upload driving license",
      "Vehicle registration certificate",
      "Identity proof documents",
      "Insurance certificates"
    ]}
  />
);

export const ViewDocumentsScreen = () => (
  <PlaceholderScreen
    title="View Documents"
    description="View all your uploaded documents"
    icon="file-document"
    features={[
      "View uploaded documents",
      "Document thumbnails",
      "Re-upload expired documents",
      "Download document copies"
    ]}
  />
);

export const DocumentStatusScreen = () => (
  <PlaceholderScreen
    title="Document Status"
    description="Check verification status of your documents"
    icon="file-search"
    features={[
      "Real-time verification status",
      "Approval notifications",
      "Rejection reasons and corrections needed",
      "Re-submission options"
    ]}
  />
);

export const UpcomingRidesScreen = () => (
  <PlaceholderScreen
    title="Upcoming Rides"
    description="View your scheduled and upcoming rides"
    icon="calendar-clock"
    features={[
      "Scheduled ride bookings",
      "Customer pickup details",
      "Route information",
      "Estimated earnings"
    ]}
  />
);

export const CompletedRidesScreen = () => (
  <PlaceholderScreen
    title="Completed Rides"
    description="History of all your completed rides"
    icon="check-circle"
    features={[
      "Complete ride history",
      "Customer feedback and ratings",
      "Earnings per ride",
      "Route details and duration"
    ]}
  />
);

export const CancelledRidesScreen = () => (
  <PlaceholderScreen
    title="Cancelled Rides"
    description="View cancelled rides and reasons"
    icon="cancel"
    features={[
      "Cancelled ride history",
      "Cancellation reasons",
      "Impact on rating",
      "Cancellation fee details"
    ]}
  />
);

export const ViewProfileScreen = () => (
  <PlaceholderScreen
    title="View Profile"
    description="View your driver profile information"
    icon="account"
    features={[
      "Personal information display",
      "Driver rating and statistics",
      "Vehicle information",
      "Profile verification status"
    ]}
  />
);

export const EditProfileScreen = () => (
  <PlaceholderScreen
    title="Edit Profile"
    description="Update your profile information"
    icon="account-edit"
    features={[
      "Edit personal details",
      "Update contact information",
      "Change profile photo",
      "Vehicle information updates"
    ]}
  />
);

export const ChangePasswordScreen = () => (
  <PlaceholderScreen
    title="Change Password"
    description="Update your account password"
    icon="lock"
    features={[
      "Secure password change",
      "Current password verification",
      "Password strength indicator",
      "Security notifications"
    ]}
  />
);

export const AllRidesScreen = () => (
  <PlaceholderScreen
    title="All Rides"
    description="Complete history of all your rides"
    icon="format-list-bulleted"
    features={[
      "Complete ride history",
      "Search and filter options",
      "Export ride data",
      "Detailed ride information"
    ]}
  />
);

export const FilterRidesScreen = () => (
  <PlaceholderScreen
    title="Filter by Date"
    description="Filter rides by date range and other criteria"
    icon="filter"
    features={[
      "Date range filtering",
      "Filter by ride status",
      "Filter by earnings range",
      "Custom filter options"
    ]}
  />
);

export const ContactSupportScreen = () => (
  <PlaceholderScreen
    title="Contact Support"
    description="Get help from our support team"
    icon="phone"
    features={[
      "24/7 customer support",
      "Live chat assistance",
      "Phone support",
      "Email ticket system"
    ]}
  />
);

export const FAQsScreen = () => (
  <PlaceholderScreen
    title="FAQs"
    description="Frequently asked questions and answers"
    icon="help-circle"
    features={[
      "Common questions and answers",
      "Search functionality",
      "Category-wise organization",
      "Regular updates with new FAQs"
    ]}
  />
);
