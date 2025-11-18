import { CustomDrawerContent } from '@/components/navigation/DrawerNavigation';
import { CONSTANTS } from '@/app/utils/const';
import { Drawer } from 'expo-router/drawer';
import React from 'react';

export default function DrawerLayout() {
  return (
    <Drawer
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
      <Drawer.Screen
        name="(tabs)"
        options={{
          headerTitle: 'SwiftCab',
          drawerLabel: 'Home',
        }}
      />
    </Drawer>
  );
}

