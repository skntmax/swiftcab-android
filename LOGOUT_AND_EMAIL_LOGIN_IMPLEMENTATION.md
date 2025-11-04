# Logout & Email/Password Login Implementation

## ✅ Features Implemented

### 1. Email/Password Login
- **API Endpoint**: `https://swiftcab-api.365itsolution.com/v1/auth/login`
- **Static userType**: 22 (driver-partner)
- **Auto-redirect**: After successful login, user is redirected directly to Summary page

### 2. Logout Functionality
- **Logout button**: Added in ViewSummaryScreen header (accessible via profile menu)
- **Socket cleanup**: Emits `driver-logged-out` event before logout
- **Complete cleanup**: Clears AsyncStorage, Redux state, and redirects to login

---

## 📋 Implementation Details

### 1. Email/Password Login API

#### File: `app/lib/api/authApi.ts`

```typescript
// Email/Password Login Request
export interface EmailLoginRequest {
  emailOrUsername: string;
  password: string;
  userType: number; // 22 for driver-partner
}

// Email/Password Login Response
export interface EmailLoginResponse {
  data: {
    token: string;
    usersObj: {
      username: string;
      firstName?: string;
      lastName?: string;
      avatar?: string | null;
      roleTypeName: string;
    };
  };
  message: string;
  status: number;
  error: boolean;
}

// New endpoint
emailLogin: builder.mutation<EmailLoginResponse, EmailLoginRequest>({
  query: (credentials) => ({
    url: 'https://swiftcab-api.365itsolution.com/v1/auth/login',
    method: 'POST',
    body: {
      emailOrUsername: credentials.emailOrUsername,
      password: credentials.password,
      userType: 22, // Static value for driver-partner
    },
  }),
  invalidatesTags: ['Auth'],
}),
```

**Hook exported**: `useEmailLoginMutation`

---

### 2. Email Login in LoginScreen

#### File: `components/auth/LoginScreen.tsx`

```typescript
const [emailLogin, { isLoading, isSuccess, error }] = useEmailLoginMutation();

// Auto-redirect after successful login
useEffect(() => {
  if (isSuccess) {
    router.replace('/(drawer)/(tabs)');
  }
}, [isSuccess]);

const handleEmailLogin = async (data: LoginForm) => {
  try {
    const result = await emailLogin({
      emailOrUsername: data.email,
      password: data.password,
      userType: 22,
    }).unwrap();
    
    showDialog('Login Successful', result.message || 'Welcome back!');
  } catch (err: any) {
    const errorMessage = err?.data?.message || 'Invalid email/username or password';
    showDialog('Login Failed', errorMessage);
  }
};
```

**Features**:
- Accepts email or username
- Password field with show/hide toggle
- Form validation (email format, min password length)
- Error handling with user-friendly messages
- Auto-redirect to Summary page on success

---

### 3. Auth Slice - Email Login Handler

#### File: `app/lib/reducers/auth/authSlice.ts`

```typescript
// Email/Password Login
builder
  .addMatcher(authApi.endpoints.emailLogin.matchPending, (state) => {
    state.isLoading = true;
    state.error = null;
  })
  .addMatcher(authApi.endpoints.emailLogin.matchFulfilled, (state, action) => {
    state.isLoading = false;
    if (action.payload.data) {
      const { token, usersObj } = action.payload.data;
      
      if (token && usersObj) {
        state.token = token;
        state.user = {
          username: usersObj.username,
          firstName: usersObj.firstName || '',
          lastName: usersObj.lastName || '',
          avatar: usersObj.avatar,
          roleTypeName: usersObj.roleTypeName,
        };
        state.isAuthenticated = true;
        state.onboardingComplete = true; // Email login users are already registered
        
        // Save to AsyncStorage
        saveAuthData({ token, user: { ... } });
      }
    }
  })
  .addMatcher(authApi.endpoints.emailLogin.matchRejected, (state, action) => {
    state.isLoading = false;
    state.error = action.error.message || 'Email login failed';
  });
```

**Key behaviors**:
- Saves token and user info to Redux
- Persists to AsyncStorage
- Sets `onboardingComplete` to true (no onboarding for email login)
- Handles errors gracefully

---

### 4. Logout Functionality

#### File: `components/screens/dashboard/ViewSummaryScreen.tsx`

```typescript
const [menuVisible, setMenuVisible] = useState(false);
const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
const dispatch = useDispatch();

const handleLogout = async () => {
  Alert.alert(
    'Logout',
    'Are you sure you want to logout?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            // 1. Emit driver logged out event
            if (socket && isConnected && driverLoc) {
              socket.emit(SOCKET_EVENTS.EV_DRIVER_LOGGED_OUT, {
                ...driverLoc,
                isLoggedIn: false,
              });
            }

            // 2. Call logout API
            await logout().unwrap();
            
            // 3. Clear Redux state
            dispatch(clearAuth());
            
            // 4. Navigate to login screen
            router.replace('/');
          } catch (error) {
            console.error('Logout error:', error);
            // Still clear local auth even if API fails
            dispatch(clearAuth());
            router.replace('/');
          }
        },
      },
    ]
  );
};
```

**Logout Menu UI**:
```tsx
<Menu
  visible={menuVisible}
  onDismiss={() => setMenuVisible(false)}
  anchor={<TouchableOpacity onPress={() => setMenuVisible(true)}>
    <View style={styles.avatarContainer}>
      <Text style={styles.avatarText}>
        {(currentUser?.firstName?.[0] || 'D').toUpperCase()}
      </Text>
    </View>
  </TouchableOpacity>}
>
  <Menu.Item title="Profile" leadingIcon="account" />
  <Menu.Item title="Settings" leadingIcon="cog" />
  <Divider />
  <Menu.Item 
    onPress={() => { setMenuVisible(false); handleLogout(); }}
    title={isLoggingOut ? "Logging out..." : "Logout"}
    leadingIcon="logout"
    titleStyle={{ color: '#F44336' }}
    disabled={isLoggingOut}
  />
</Menu>
```

**Logout Steps**:
1. Shows confirmation alert
2. Emits `EV_DRIVER_LOGGED_OUT` socket event (sets `isLoggedIn: false`)
3. Calls logout API endpoint
4. Clears Redux auth state with `clearAuth()`
5. Clears AsyncStorage (handled in `authSlice`)
6. Redirects to login page (`/`)

---

## 🧪 Testing Guide

### Test Email/Password Login

1. **Start the app**:
```bash
npx expo start --clear
```

2. **On Login Screen**:
   - Enter email or username: `driver21@gm.com`
   - Enter password: `1234`
   - Click "Continue"

3. **Expected Flow**:
   - ✅ Loading indicator appears
   - ✅ Success dialog shows: "logged in"
   - ✅ Auto-redirects to Summary page
   - ✅ Shows driver's name in header
   - ✅ Socket connects automatically
   - ✅ Location tracking starts

4. **Verify Persistence**:
   - Close and reopen app
   - ✅ Should auto-login and show Summary page (no login screen)

---

### Test Logout

1. **From Summary Screen**:
   - Tap the profile avatar (top right)
   - Menu appears with options

2. **Click Logout**:
   - ✅ Confirmation alert appears
   - ✅ Tap "Logout"

3. **Expected Behavior**:
   - ✅ Socket emits `driver-logged-out` event
   - ✅ Redux state cleared
   - ✅ AsyncStorage cleared
   - ✅ Redirects to login screen
   - ✅ No auto-login on next app start

4. **Verify Cleanup**:
   - Check console: Should see `🔌 Disconnecting socket...`
   - Restart app: Should show login screen (not Summary)

---

## 📊 API Response Format

### Email/Password Login Response

```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usersObj": {
      "username": "driver21_master7308",
      "firstName": "",
      "lastName": "",
      "avatar": null,
      "roleTypeName": "driver-partner"
    }
  },
  "message": "logged in",
  "status": 200,
  "error": false
}
```

**Response handled in**:
- `authSlice.ts` → Saves to Redux + AsyncStorage
- `LoginScreen.tsx` → Shows success message + redirects

---

## 🔐 Authentication Flow

### Email/Password Login Flow
```
User enters email/password
       ↓
POST /v1/auth/login { emailOrUsername, password, userType: 22 }
       ↓
Response: { token, usersObj }
       ↓
authSlice saves: token + user → Redux + AsyncStorage
       ↓
LoginScreen: isSuccess = true
       ↓
Auto-redirect: router.replace('/(drawer)/(tabs)')
       ↓
Summary Screen loads
       ↓
Socket connects with token
       ↓
Location tracking starts
```

### Logout Flow
```
User clicks Logout in menu
       ↓
Confirmation Alert
       ↓
User confirms
       ↓
Socket emits: EV_DRIVER_LOGGED_OUT { isLoggedIn: false }
       ↓
API call: POST /v1/auth/logout
       ↓
Redux: dispatch(clearAuth())
       ↓
AsyncStorage cleared
       ↓
Socket disconnects
       ↓
router.replace('/') → Login Screen
```

---

## 🎯 Key Features

### Email/Password Login
- ✅ Supports both email and username
- ✅ Password visibility toggle
- ✅ Form validation (email format, min length)
- ✅ Error handling with user-friendly messages
- ✅ Auto-redirect to Summary page
- ✅ Persistent login (AsyncStorage)
- ✅ Socket auto-connects after login
- ✅ userType = 22 (driver-partner) sent automatically

### Logout
- ✅ Accessible via profile menu in header
- ✅ Confirmation alert before logout
- ✅ Socket cleanup (emits logged-out event)
- ✅ Complete state cleanup (Redux + AsyncStorage)
- ✅ Redirects to login page
- ✅ Loading state during logout
- ✅ Graceful error handling

---

## 🔧 Configuration

### API Endpoint
**Production**: `https://swiftcab-api.365itsolution.com/v1/auth/login`

### userType
**Static value**: `22` (driver-partner)

Set in `authApi.ts`:
```typescript
body: {
  emailOrUsername: credentials.emailOrUsername,
  password: credentials.password,
  userType: 22, // Hardcoded as requested
},
```

---

## 📝 Files Modified

1. **`app/lib/api/authApi.ts`**
   - Added `EmailLoginRequest` and `EmailLoginResponse` interfaces
   - Added `emailLogin` mutation endpoint
   - Exported `useEmailLoginMutation` hook

2. **`components/auth/LoginScreen.tsx`**
   - Integrated `useEmailLoginMutation`
   - Added auto-redirect logic with `useEffect`
   - Implemented `handleEmailLogin` function
   - Added error handling

3. **`app/lib/reducers/auth/authSlice.ts`**
   - Added email login matchers (pending/fulfilled/rejected)
   - Integrated AsyncStorage save on successful login
   - Set `onboardingComplete = true` for email login

4. **`components/screens/dashboard/ViewSummaryScreen.tsx`**
   - Imported `useLogoutMutation`, `clearAuth`, `useDispatch`, `router`
   - Added `menuVisible` state and `Menu` component
   - Implemented `handleLogout` function
   - Updated header with profile menu (Profile, Settings, Logout)
   - Added socket cleanup on logout

---

## 🐛 Error Handling

### Login Errors
- Network errors → "Invalid email/username or password"
- Wrong credentials → Shows server error message
- Missing fields → Form validation prevents submission

### Logout Errors
- API fails → Still clears local data and redirects
- Socket disconnect fails → Logs error, continues logout
- Always ensures user is logged out locally

---

## ✅ Success Indicators

When everything is working:

### After Email Login:
```
✅ Console: "✅ Login successful: logged in"
✅ Console: "Auth data saved successfully."
✅ Console: "🔌 Initializing socket connection..."
✅ Console: "✅ Socket connected: <socket-id>"
✅ UI: Summary screen loads
✅ UI: Driver name shows in header
✅ UI: Online/offline toggle appears
```

### After Logout:
```
✅ Console: "🔌 Disconnecting socket..."
✅ Console: "Auth data cleared successfully."
✅ UI: Redirects to login screen
✅ UI: Next app start shows login screen (not auto-login)
```

---

## 🎉 Completion Status

**Email/Password Login**: ✅ Complete
**Logout Functionality**: ✅ Complete
**Auto-redirect on Login**: ✅ Complete
**Socket Cleanup on Logout**: ✅ Complete
**Persistent Login**: ✅ Complete (via AsyncStorage)

---

**Next Steps**: Test on real device with production API!

