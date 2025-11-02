import { CONSTANTS } from '@/app/utils/const';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Chip, Surface, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'ride' | 'earnings' | 'document';
  timestamp: Date;
  read: boolean;
  actionRequired?: boolean;
}

const NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'New Ride Request',
    message: 'You have a new ride request from Priya. Pickup location: MG Road, Bangalore.',
    type: 'ride',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    read: false,
    actionRequired: true,
  },
  {
    id: '2',
    title: 'Document Verification Complete',
    message: 'Your driving license has been successfully verified. You can now start accepting rides.',
    type: 'document',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false,
  },
  {
    id: '3',
    title: 'Daily Earnings Summary',
    message: 'You earned ₹450 today! Great job. Keep up the good work.',
    type: 'earnings',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    read: true,
  },
  {
    id: '4',
    title: 'Rating Improved!',
    message: 'Congratulations! Your rating has improved to 4.7 stars. Excellent service!',
    type: 'success',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    read: true,
  },
  {
    id: '5',
    title: 'Document Expiry Warning',
    message: 'Your vehicle insurance will expire in 15 days. Please renew it to continue driving.',
    type: 'warning',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    read: true,
    actionRequired: true,
  },
  {
    id: '6',
    title: 'Weekly Bonus Earned',
    message: 'You completed 25 rides this week and earned a bonus of ₹500!',
    type: 'earnings',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    read: true,
  },
];

const NotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread' | 'ride' | 'earnings' | 'document'>('all');

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'ride':
        return 'car';
      case 'earnings':
        return 'currency-inr';
      case 'document':
        return 'file-document';
      case 'success':
        return 'check-circle';
      case 'warning':
        return 'alert';
      case 'error':
        return 'close-circle';
      default:
        return 'information';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'ride':
        return CONSTANTS.theme.primaryColor;
      case 'earnings':
        return '#4CAF50';
      case 'document':
        return '#2196F3';
      case 'success':
        return '#4CAF50';
      case 'warning':
        return '#FF9800';
      case 'error':
        return '#F44336';
      default:
        return '#666';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      onPress={() => markAsRead(item.id)}
      activeOpacity={0.7}
    >
      <Card style={[styles.notificationCard, !item.read && styles.unreadCard]}>
        <Card.Content style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name={getNotificationIcon(item.type) as any}
                size={24}
                color={getNotificationColor(item.type)}
              />
            </View>
            <View style={styles.notificationText}>
              <Text variant="titleSmall" style={styles.notificationTitle}>
                {item.title}
              </Text>
              <Text variant="bodySmall" style={styles.notificationMessage}>
                {item.message}
              </Text>
            </View>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
          
          <View style={styles.notificationFooter}>
            <Text variant="bodySmall" style={styles.timestamp}>
              {formatTimestamp(item.timestamp)}
            </Text>
            {item.actionRequired && (
              <Chip
                style={styles.actionChip}
                textStyle={styles.actionChipText}
                compact
              >
                Action Required
              </Chip>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <Chip
        selected={filter === 'all'}
        onPress={() => setFilter('all')}
        style={[styles.filterChip, filter === 'all' && styles.selectedChip]}
        textStyle={filter === 'all' ? styles.selectedChipText : styles.chipText}
      >
        All
      </Chip>
      <Chip
        selected={filter === 'unread'}
        onPress={() => setFilter('unread')}
        style={[styles.filterChip, filter === 'unread' && styles.selectedChip]}
        textStyle={filter === 'unread' ? styles.selectedChipText : styles.chipText}
      >
        Unread ({unreadCount})
      </Chip>
      <Chip
        selected={filter === 'ride'}
        onPress={() => setFilter('ride')}
        style={[styles.filterChip, filter === 'ride' && styles.selectedChip]}
        textStyle={filter === 'ride' ? styles.selectedChipText : styles.chipText}
      >
        Rides
      </Chip>
      <Chip
        selected={filter === 'earnings'}
        onPress={() => setFilter('earnings')}
        style={[styles.filterChip, filter === 'earnings' && styles.selectedChip]}
        textStyle={filter === 'earnings' ? styles.selectedChipText : styles.chipText}
      >
        Earnings
      </Chip>
    </View>
  );

  const renderHeader = () => (
    <Surface style={styles.header} elevation={1}>
      <View style={styles.headerContent}>
        <View>
          <Text variant="headlineSmall" style={styles.headerTitle}>
            Notifications
          </Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>
    </Surface>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderFilters()}
      
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificationItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="bell-off" size={48} color="#999" />
            <Text variant="titleMedium" style={styles.emptyTitle}>
              No notifications
            </Text>
            <Text variant="bodyMedium" style={styles.emptyMessage}>
              You'll see notifications here when you have new updates
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8DC',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#333',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#666',
    marginTop: 4,
  },
  markAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  markAllText: {
    color: CONSTANTS.theme.primaryColor,
    fontWeight: '600',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    backgroundColor: 'white',
  },
  selectedChip: {
    backgroundColor: CONSTANTS.theme.primaryColor,
  },
  chipText: {
    color: '#666',
    fontSize: 12,
  },
  selectedChipText: {
    color: 'white',
    fontSize: 12,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  notificationCard: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: CONSTANTS.theme.primaryColor,
  },
  notificationContent: {
    padding: 16,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    color: '#333',
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationMessage: {
    color: '#666',
    lineHeight: 20,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: CONSTANTS.theme.primaryColor,
    marginTop: 4,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    color: '#999',
  },
  actionChip: {
    backgroundColor: '#FFF3E0',
  },
  actionChipText: {
    color: '#FF9800',
    fontSize: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    color: '#666',
    textAlign: 'center',
  },
});

export default NotificationsScreen;
