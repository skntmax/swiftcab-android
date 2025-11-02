import { CONSTANTS } from '@/app/utils/const';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Divider, Surface, Text } from 'react-native-paper';

interface MenuItem {
  id: string;
  title: string;
  icon: string;
  route: string;
  permission_id?: number;
}

interface MenuSection {
  navlabel?: boolean;
  subheader?: string;
  items: MenuItem[];
}

const MENU_STRUCTURE: MenuSection[] = [
  {
    navlabel: true,
    subheader: 'Dashboard',
    items: [
      {
        id: '1',
        title: 'View Summary',
        icon: 'view-dashboard',
        route: '/(tabs)',
      },
      {
        id: '2',
        title: 'Notifications',
        icon: 'bell',
        route: '/(tabs)',
      },
    ],
  },
  {
    navlabel: true,
    subheader: 'Documents',
    items: [
      {
        id: '3',
        title: 'Upload Documents',
        icon: 'upload',
        route: '/(tabs)',
      },
      {
        id: '4',
        title: 'View Documents',
        icon: 'file-document',
        route: '/(tabs)',
      },
      {
        id: '5',
        title: 'Document Status',
        icon: 'file-search',
        route: '/(tabs)',
      },
    ],
  },
  {
    navlabel: true,
    subheader: 'Earnings',
    items: [
      {
        id: '6',
        title: 'Daily Earnings',
        icon: 'currency-inr',
        route: '/(tabs)',
      },
      {
        id: '7',
        title: 'Monthly Earnings',
        icon: 'calendar-month',
        route: '/(tabs)',
      },
      {
        id: '8',
        title: 'Payment History',
        icon: 'history',
        route: '/(tabs)',
      },
    ],
  },
  {
    navlabel: true,
    subheader: 'My Rides',
    items: [
      {
        id: '9',
        title: 'Upcoming Rides',
        icon: 'calendar-clock',
        route: '/(tabs)',
      },
      {
        id: '10',
        title: 'Completed Rides',
        icon: 'check-circle',
        route: '/(tabs)',
      },
      {
        id: '11',
        title: 'Cancelled Rides',
        icon: 'cancel',
        route: '/(tabs)',
      },
    ],
  },
  {
    navlabel: true,
    subheader: 'Profile',
    items: [
      {
        id: '12',
        title: 'View Profile',
        icon: 'account',
        route: '/(tabs)',
      },
      {
        id: '13',
        title: 'Edit Profile',
        icon: 'account-edit',
        route: '/(tabs)',
      },
      {
        id: '14',
        title: 'Change Password',
        icon: 'lock',
        route: '/(tabs)',
      },
    ],
  },
  {
    navlabel: true,
    subheader: 'Ride History',
    items: [
      {
        id: '15',
        title: 'All Rides',
        icon: 'format-list-bulleted',
        route: '/(tabs)',
      },
      {
        id: '16',
        title: 'Filter by Date',
        icon: 'filter',
        route: '/(tabs)',
      },
    ],
  },
  {
    navlabel: true,
    subheader: 'Support',
    items: [
      {
        id: '17',
        title: 'Contact Support',
        icon: 'phone',
        route: '/(tabs)',
      },
      {
        id: '18',
        title: 'FAQs',
        icon: 'help-circle',
        route: '/(tabs)',
      },
    ],
  },
];

export const CustomDrawerContent = (props: any) => {
  const router = useRouter();

  const renderMenuItem = (item: MenuItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={() => router.push(item.route as any)}
    >
      <MaterialCommunityIcons
        name={item.icon as any}
        size={24}
        color={CONSTANTS.theme.primaryColor}
        style={styles.menuIcon}
      />
      <Text variant="bodyMedium" style={styles.menuTitle}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  const renderMenuSection = (section: MenuSection, index: number) => (
    <View key={index} style={styles.menuSection}>
      {section.navlabel && section.subheader && (
        <>
          <Text variant="labelLarge" style={styles.sectionHeader}>
            {section.subheader}
          </Text>
          <Divider style={styles.sectionDivider} />
        </>
      )}
      {section.items.map(renderMenuItem)}
    </View>
  );

  return (
    <DrawerContentScrollView {...props} style={styles.drawerContainer}>
      <Surface style={styles.drawerHeader} elevation={2}>
        <View style={styles.headerContent}>
          <MaterialCommunityIcons
            name="taxi"
            size={40}
            color={CONSTANTS.theme.primaryColor}
          />
          <Text variant="headlineSmall" style={styles.headerTitle}>
            SwiftCab Driver
          </Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            Drive • Earn • Grow
          </Text>
        </View>
      </Surface>

      <View style={styles.menuContainer}>
        {MENU_STRUCTURE.map(renderMenuSection)}
      </View>

      <Surface style={styles.drawerFooter} elevation={1}>
        <TouchableOpacity style={styles.logoutButton}>
          <MaterialCommunityIcons name="logout" size={20} color="#FF5252" />
          <Text variant="bodyMedium" style={styles.logoutText}>
            Logout
          </Text>
        </TouchableOpacity>
      </Surface>
    </DrawerContentScrollView>
  );
};

// Export menu structure for use in other components
export { MENU_STRUCTURE };

// This component is not needed anymore as we'll use expo-router's Drawer
const DrawerNavigation: React.FC = () => {
  return null;
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#FFF8DC',
  },
  drawerHeader: {
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#333',
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#666',
    fontStyle: 'italic',
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  menuSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    color: '#333',
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingVertical: 8,
    textTransform: 'uppercase',
  },
  sectionDivider: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#E0E0E0',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    borderRadius: 8,
  },
  menuIcon: {
    marginRight: 16,
    width: 24,
  },
  menuTitle: {
    color: '#333',
    flex: 1,
  },
  drawerFooter: {
    backgroundColor: 'white',
    padding: 16,
    marginTop: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  logoutText: {
    color: '#FF5252',
    marginLeft: 12,
    fontWeight: '500',
  },
});

export default DrawerNavigation;
