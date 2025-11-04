/**
 * Notifications Screen
 */

import React from 'react';
import { ScreenTemplate } from '../common/ScreenTemplate';

export default function NotificationsScreen() {
  return (
    <ScreenTemplate
      title="Notifications"
      subtitle="Stay updated with latest alerts"
      icon="bell"
      showBackButton={false}
    />
  );
}
