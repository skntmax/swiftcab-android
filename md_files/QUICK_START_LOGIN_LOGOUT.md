# Quick Start: Login & Logout Features

## 🚀 Quick Test

### Test Email/Password Login

1. **Start the app**:
```bash
npx expo start --clear
```

2. **Use these credentials**:
   - **Email**: `driver21@gm.com`
   - **Password**: `1234`

3. **Expected Result**:
   - ✅ Redirects to Summary page automatically
   - ✅ Shows driver name in header
   - ✅ Socket connects and starts tracking location

---

### Test Logout

1. **From Summary Screen**:
   - Tap the **orange avatar circle** (top right)
   - Select **"Logout"** from the menu

2. **Expected Result**:
   - ✅ Confirmation alert appears
   - ✅ After confirming, redirects to login page
   - ✅ Next app start requires login again

---

## 📱 Features

### Email/Password Login
- Enter email or username
- Password field with show/hide toggle
- Validates email format and password length
- Auto-redirects to Summary page on success
- Persists login (stays logged in after app restart)

### Logout
- Accessible via profile menu in header
- Confirms before logging out
- Cleans up socket connection
- Clears all saved data
- Redirects to login screen

---

## 🔧 API Details

**Login Endpoint**: `https://swiftcab-api.365itsolution.com/v1/auth/login`

**Request Body**:
```json
{
  "emailOrUsername": "driver21@gm.com",
  "password": "1234",
  "userType": 22
}
```

**Response**:
```json
{
  "data": {
    "token": "eyJhbGc...",
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

---

## 📍 Where to Find Features

### Login Screen
- **File**: `components/auth/LoginScreen.tsx`
- **Access**: Opens on app start (if not logged in)
- **Features**: Email/password form, OTP login button, social login placeholders

### Logout Menu
- **File**: `components/screens/dashboard/ViewSummaryScreen.tsx`
- **Access**: Summary page → Tap profile avatar (top right) → Logout
- **Features**: Profile, Settings, and Logout options

---

## ✅ Implementation Complete

- ✅ Email/password login with API integration
- ✅ Auto-redirect to Summary page after login
- ✅ Persistent login (AsyncStorage)
- ✅ Logout button with confirmation
- ✅ Socket cleanup on logout
- ✅ Complete state management (Redux + AsyncStorage)
- ✅ Error handling and user feedback

---

## 🎯 Next Steps

1. Test on physical device
2. Test with different email/username combinations
3. Verify socket events are emitted correctly
4. Check that location tracking works after login

---

**Ready to test!** 🚀

