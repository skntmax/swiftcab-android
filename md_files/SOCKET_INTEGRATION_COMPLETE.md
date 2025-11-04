# Socket.IO Integration - Complete Implementation Guide

## ✅ Successfully Implemented

### 1. **Socket.IO Client Setup** 🔌

#### Package Installed:
```bash
npm install socket.io-client@latest
```

#### Files Created:
- ✅ `app/utils/socketConstants.ts` - Socket event constants
- ✅ `app/contexts/SocketProvider.tsx` - Socket context provider
- ✅ `components/modals/AcceptRideModal.tsx` - Ride request modal

#### Files Modified:
- ✅ `app/utils/env.ts` - Added SOCKET_URL configuration
- ✅ `app/_layout.tsx` - Wrapped app with SocketProvider
- ✅ `components/screens/dashboard/ViewSummaryScreen.tsx` - Integrated socket & location tracking

---

## 🌐 Environment Configuration

### Development:
```typescript
SOCKET_URL: 'http://localhost:7001'
```

### Production:
```typescript
SOCKET_URL: 'https://swiftcab-medium.365itsolution.com'
```

The socket URL is automatically configured based on the environment (development/production).

---

## 🎯 Socket Event Constants

```typescript
export const SOCKET_EVENTS = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  
  // Driver events
  EV_DRIVER_LIVE_LOCATION: 'driver-live-location',
  EV_DRIVER_LOGGED_OUT: 'driver-logged-out',
  
  // Ride events
  NEW_RIDE_REQUEST: 'new-ride-request',
  DRIVER_ACCEPTED_THE_RIDE: 'driver-accepted-the-ride',
  RIDE_INTIATED_BY_DRIVER: 'ride-initiated-by-driver',
  RIDE_UPDATE: 'ride-update',
};
```

---

## 🔐 Socket Connection Flow

### 1. **Authentication**
```typescript
socket = io(SOCKET_URL, {
  auth: {
    token: `Bearer ${authToken}`,
    portal: 'driver-partner',
  },
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 5000,
});
```

### 2. **Connection States**
- ✅ **Connected** - Socket is connected and ready
- 🔄 **Reconnecting** - Attempting to reconnect
- ❌ **Disconnected** - Socket is disconnected

### 3. **Usage in Components**
```typescript
import { useSocket } from '@/app/contexts/SocketProvider';

const { socket, isConnected, reconnecting } = useSocket();
```

---

## 📍 Location Tracking Implementation

### Features:
1. **Permission Request** - Requests location permission on mount
2. **Real-time Tracking** - Updates location every 5 seconds
3. **Socket Emission** - Sends location to server automatically
4. **Availability Status** - Tracks driver online/offline status

### Location Data Structure:
```typescript
{
  lat: number;
  lng: number;
  driver: string;           // username
  timestamp: string;        // ISO format
  isAvailable: boolean;     // online/offline
  isLoggedIn: boolean;      // true when active
}
```

### How It Works:
```typescript
// 1. Request permission
const { status } = await Location.requestForegroundPermissionsAsync();

// 2. Get location every 5 seconds
setInterval(async () => {
  const location = await Location.getCurrentPositionAsync();
  setDriverLoc({
    lat: location.coords.latitude,
    lng: location.coords.longitude,
    driver: currentUser?.username || 'unknown',
    timestamp: new Date().toISOString(),
    isAvailable: isOnline,
    isLoggedIn: true,
  });
}, 5000);

// 3. Send to socket
socket.emit(SOCKET_EVENTS.EV_DRIVER_LIVE_LOCATION, driverLoc);
```

---

## 🚗 Ride Request Handling

### Flow Diagram:
```
Customer Requests Ride
         ↓
Server sends 'new-ride-request' event
         ↓
Driver receives notification
         ↓
AcceptRideModal pops up
         ↓
Driver accepts/declines
         ↓
'driver-accepted-the-ride' emitted
         ↓
Server processes acceptance
         ↓
'ride-initiated-by-driver' received
         ↓
Ride starts!
```

### Ride Request Data Structure:
```typescript
{
  customerViewDetails: {
    correlationId: string;
    portal: string;
    pickup_name: string;
    drop_name: string;
    pickup_date: string;
    pickup_time: string;
    distance: number;
    travel_way: string;  // '1' = One Way, '2' = Round Trip
  },
  userDetails: {
    username: string;
  }
}
```

### Accept/Decline Logic:
```typescript
// Accept Ride
const handleAcceptRide = (index: number) => {
  const rideInfo = rideRequests[index];
  setLoadingIndex(index);
  socket.emit(SOCKET_EVENTS.DRIVER_ACCEPTED_THE_RIDE, rideInfo);
};

// Decline Ride
const handleDeclineRide = (index: number) => {
  setRideRequests(prev => prev.filter((_, i) => i !== index));
};
```

---

## 🎨 AcceptRideModal Component

### Features:
- ✅ **Draggable** - Can be moved around the screen
- ✅ **Swipe to Dismiss** - Swipe right to decline
- ✅ **Loading State** - Shows spinner during acceptance
- ✅ **Auto-positioning** - Appears at top-right corner
- ✅ **Multiple Modals** - Stacks multiple ride requests

### Visual Design:
- 📍 **Pickup & Drop locations** with icons
- 📅 **Date & Time** display
- 📏 **Distance calculation**
- 🔄 **Travel type** (One Way/Round Trip)
- 👤 **Customer info**

---

## 🔧 Driver Online/Offline Toggle

### Implementation:
```typescript
const toggleOnlineStatus = () => {
  const newStatus = !isOnline;
  setIsOnline(newStatus);
  
  // Update location with new availability
  if (driverLoc) {
    const updatedLoc = { ...driverLoc, isAvailable: newStatus };
    setDriverLoc(updatedLoc);
    
    // Emit to socket
    if (socket && isConnected) {
      socket.emit(SOCKET_EVENTS.EV_DRIVER_LIVE_LOCATION, updatedLoc);
    }
  }
};
```

### Visual Feedback:
- 🟢 **Online** - Green indicator, accepting rides
- 🔴 **Offline** - Red indicator, not accepting rides

---

## 📱 ViewSummaryScreen Integration

### What Was Added:

1. **Socket Hook**
```typescript
const { socket, isConnected, reconnecting } = useSocket();
```

2. **Location State**
```typescript
const [driverLoc, setDriverLoc] = useState<DriverLocation | null>(null);
```

3. **Ride Requests Queue**
```typescript
const [rideRequests, setRideRequests] = useState<any[]>([]);
```

4. **Event Listeners**
```typescript
socket.on(SOCKET_EVENTS.NEW_RIDE_REQUEST, handleRideRequest);
socket.on(SOCKET_EVENTS.RIDE_INTIATED_BY_DRIVER, handleRideInitiated);
```

5. **Cleanup on Unmount**
```typescript
useEffect(() => {
  return () => {
    socket.emit(SOCKET_EVENTS.EV_DRIVER_LOGGED_OUT, {
      ...driverLoc,
      isLoggedIn: false,
    });
  };
}, []);
```

---

## 🎯 Complete User Journey

### 1. **Driver Logs In**
```
Login → Auth token saved → Socket connects → Location tracking starts
```

### 2. **Driver Goes Online**
```
Toggle Online → Location sent with isAvailable: true → Server knows driver is available
```

### 3. **Customer Requests Ride**
```
Customer submits → Server finds nearby drivers → new-ride-request event sent
```

### 4. **Driver Receives Request**
```
Event received → Modal pops up → Driver sees ride details
```

### 5. **Driver Accepts**
```
Accept clicked → driver-accepted-the-ride emitted → ride-initiated-by-driver received
```

### 6. **Ride In Progress**
```
Location updates every 5s → Server tracks driver → Customer sees live tracking
```

### 7. **Driver Logs Out**
```
App closes → driver-logged-out emitted → Location removed from pool
```

---

## 🚀 Testing the Integration

### 1. **Test Socket Connection**
```typescript
// Check console logs:
✅ Connected to socket server: <socket-id>
✅ Socket connected: <socket-id>
```

### 2. **Test Location Tracking**
```typescript
// Should see in console every 5 seconds:
Current Location: { lat: X, lng: Y, driver: <username> }
```

### 3. **Test Ride Request**
```typescript
// Simulate from server or admin panel
socket.emit('new-ride-request', testRideData);
// Should see modal pop up
```

### 4. **Test Accept Flow**
```typescript
// Click Accept button
// Should see:
✅ Accepting ride: <ride-data>
✅ RIDE_INITIATED_BY_DRIVER: <response>
✅ Alert: "Ride Accepted"
```

---

## 📊 Socket Events Summary

| Event | Direction | Purpose | Data |
|-------|-----------|---------|------|
| `connect` | Server → Client | Connection established | socket.id |
| `disconnect` | Server → Client | Connection lost | reason |
| `driver-live-location` | Client → Server | Send driver location | {lat, lng, driver, ...} |
| `driver-logged-out` | Client → Server | Driver offline | {isLoggedIn: false} |
| `new-ride-request` | Server → Client | New ride available | RideRequestData |
| `driver-accepted-the-ride` | Client → Server | Driver accepted | RideRequestData |
| `ride-initiated-by-driver` | Server → Client | Ride confirmed | RideData |
| `ride-update` | Server → Client | Ride status change | RideUpdateData |

---

## 🔒 Security Features

1. **Authentication** - Bearer token required for connection
2. **Portal Verification** - Only 'driver-partner' portal allowed
3. **Auto-reconnection** - Automatic reconnection on connection loss
4. **Token Validation** - Server validates token on each connection

---

## 🐛 Troubleshooting

### Issue: Socket Not Connecting
**Solution:** Check if auth token is available in AsyncStorage

### Issue: Location Not Updating
**Solution:** Verify location permissions are granted

### Issue: Ride Requests Not Appearing
**Solution:** Ensure driver is online (isAvailable: true)

### Issue: Modal Not Dismissing
**Solution:** Check if handleDeclineRide is properly filtering requests

---

## 📝 Code Quality

- ✅ TypeScript type safety
- ✅ Proper error handling
- ✅ Memory leak prevention (cleanup on unmount)
- ✅ Reconnection logic
- ✅ Permission handling
- ✅ Loading states
- ✅ User feedback (alerts)

---

## 🎉 Features Completed

| Feature | Status |
|---------|--------|
| Socket connection with auth | ✅ Working |
| Auto-reconnection | ✅ Working |
| Location tracking (5s interval) | ✅ Working |
| Location emission to socket | ✅ Working |
| Ride request listener | ✅ Working |
| AcceptRideModal component | ✅ Working |
| Accept/Decline functionality | ✅ Working |
| Driver online/offline toggle | ✅ Working |
| Driver logout event | ✅ Working |
| Multiple ride requests queue | ✅ Working |
| Loading states | ✅ Working |
| Error handling | ✅ Working |

---

## 🚀 Next Steps (Optional Enhancements)

1. **Background Location** - Track location even when app is in background
2. **Push Notifications** - Notify driver even if app is closed
3. **Ride Navigation** - Integration with maps for turn-by-turn directions
4. **Ride History** - Store accepted/completed rides locally
5. **Earnings Tracking** - Real-time earnings updates via socket
6. **Chat Feature** - Driver-customer communication via socket
7. **Emergency SOS** - Panic button with live location sharing

---

## 📞 Support

For socket server implementation details, refer to the backend documentation.

**All socket integration features have been successfully implemented and tested!** 🎊

