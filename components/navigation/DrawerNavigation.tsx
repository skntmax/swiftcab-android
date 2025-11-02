import { CONSTANTS } from '@/app/utils/const';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Divider, Surface, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import dashboard screens
import NotificationsScreen from '../screens/dashboard/NotificationsScreen';
import ViewSummaryScreen from '../screens/dashboard/ViewSummaryScreen';

// Import earnings screens
import DailyEarningsScreen from '../screens/earnings/DailyEarningsScreen';

// Import placeholder screens
import {
    AllRidesScreen,
    CancelledRidesScreen,
    ChangePasswordScreen,
    CompletedRidesScreen,
    ContactSupportScreen,
    DocumentStatusScreen,
    EditProfileScreen,
    FAQsScreen,
    FilterRidesScreen,
    MonthlyEarningsScreen,
    PaymentHistoryScreen,
    UpcomingRidesScreen,
    UploadDocumentsScreen,
    ViewDocumentsScreen,
    ViewProfileScreen,
} from '../screens/CreatePlaceholderScreens';

const Drawer = createDrawerNavigator();

interface MenuItem {
  id: string;
  title: string;
  icon: string;
  component: React.ComponentType<any>;
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
        component: ViewSummaryScreen,
      },
      {
        id: '2',
        title: 'Notifications',
        icon: 'bell',
        component: NotificationsScreen,
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
        component: UploadDocumentsScreen,
      },
      {
        id: '4',
        title: 'View Documents',
        icon: 'file-document',
        component: ViewDocumentsScreen,
      },
      {
        id: '5',
        title: 'Document Status',
        icon: 'file-search',
        component: DocumentStatusScreen,
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
        component: DailyEarningsScreen,
      },
      {
        id: '7',
        title: 'Monthly Earnings',
        icon: 'calendar-month',
        component: MonthlyEarningsScreen,
      },
      {
        id: '8',
        title: 'Payment History',
        icon: 'history',
        component: PaymentHistoryScreen,
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
        component: UpcomingRidesScreen,
      },
      {
        id: '10',
        title: 'Completed Rides',
        icon: 'check-circle',
        component: CompletedRidesScreen,
      },
      {
        id: '11',
        title: 'Cancelled Rides',
        icon: 'cancel',
        component: CancelledRidesScreen,
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
        component: ViewProfileScreen,
      },
      {
        id: '13',
        title: 'Edit Profile',
        icon: 'account-edit',
        component: EditProfileScreen,
      },
      {
        id: '14',
        title: 'Change Password',
        icon: 'lock',
        component: ChangePasswordScreen,
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
        component: AllRidesScreen,
      },
      {
        id: '16',
        title: 'Filter by Date',
        icon: 'filter',
        component: FilterRidesScreen,
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
        component: ContactSupportScreen,
      },
      {
        id: '18',
        title: 'FAQs',
        icon: 'help-circle',
        component: FAQsScreen,
      },
    ],
  },
];

const CustomDrawerContent = (props: any) => {
  const { navigation } = props;

  const renderMenuItem = (item: MenuItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={() => navigation.navigate(item.title)}
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
    <SafeAreaView style={styles.drawerContainer}>
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

      <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
        {MENU_STRUCTURE.map(renderMenuSection)}
      </ScrollView>

      <Surface style={styles.drawerFooter} elevation={1}>
        <TouchableOpacity style={styles.logoutButton}>
          <MaterialCommunityIcons name="logout" size={20} color="#FF5252" />
          <Text variant="bodyMedium" style={styles.logoutText}>
            Logout
          </Text>
        </TouchableOpacity>
      </Surface>
    </SafeAreaView>
  );
};

const DrawerNavigation: React.FC = () => {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerStyle: {
            backgroundColor: CONSTANTS.theme.primaryColor,
          },
          headerTintColor: 'white',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          drawerStyle: {
            backgroundColor: '#FFF8DC',
            width: 300,
          },
        }}
      >
        {MENU_STRUCTURE.map((section) =>
          section.items.map((item) => (
            <Drawer.Screen
              key={item.id}
              name={item.title}
              component={item.component}
              options={{
                drawerIcon: ({ color }) => (
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={22}
                    color={color}
                  />
                ),
              }}
            />
          ))
        )}
      </Drawer.Navigator>
    </NavigationContainer>
  );
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
