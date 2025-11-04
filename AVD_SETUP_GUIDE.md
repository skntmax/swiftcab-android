# 📱 AVD Setup & Troubleshooting Guide

## ✅ Your Current Status:
- **AVD Connected:** ✅ `emulator-5554` detected
- **Command Running:** `npm run android`

---

## 🚀 Quick Start Commands

### **Option 1: Start with Android (Recommended)**
```bash
npm run android
```

### **Option 2: Start Dev Server First, Then Android**
```bash
# Terminal 1: Start Metro bundler
npm run start

# Terminal 2: Press 'a' or run:
npm run android
```

### **Option 3: Start with Environment**
```bash
# Development mode
npm run dev

# Then press 'a' for Android
```

---

## 🔧 Common Issues & Solutions

### **Issue 1: "Metro Bundler Not Running"**

**Solution:**
```bash
# Start Metro bundler
npm start

# In another terminal or press 'a'
npm run android
```

---

### **Issue 2: "No Android Device Connected"**

**Check if AVD is running:**
```bash
adb devices
```

**Expected Output:**
```
List of devices attached
emulator-5554   device
```

**If empty, start your AVD:**
1. Open Android Studio
2. Go to **Tools > Device Manager**
3. Click ▶️ on your emulator
4. Wait for it to boot
5. Run `adb devices` again

---

### **Issue 3: "App Crashes on Launch"**

**Clear cache and restart:**
```bash
# Clear Metro cache
npx expo start --clear

# Or clear everything
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
npm start
```

---

### **Issue 4: "Build Failed"**

**Install/Update dependencies:**
```bash
npm install
```

**Check for Expo updates:**
```bash
npx expo install --check
```

---

### **Issue 5: "Port Already in Use"**

**Kill processes on port 8081:**
```powershell
# Find process on port 8081
netstat -ano | findstr :8081

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Restart
npm start
```

---

### **Issue 6: "Unable to Connect to Metro"**

**Solution:**
```bash
# Reset Metro
npx expo start --clear

# Or with tunnel
npx expo start --tunnel
```

---

## 📱 AVD Setup (If Needed)

### **1. Install Android Studio:**
Download from: https://developer.android.com/studio

### **2. Create AVD:**
1. Open Android Studio
2. **Tools** > **Device Manager**
3. Click **Create Device**
4. Select **Phone** > **Pixel 5** (or similar)
5. Select **System Image** > **Tiramisu (API 33)** or higher
6. Click **Finish**

### **3. Start AVD:**
1. Open **Device Manager**
2. Click ▶️ **Play** button
3. Wait for emulator to boot
4. Verify with `adb devices`

---

## 🎯 Step-by-Step: First Time Setup

```bash
# 1. Make sure you're in the project directory
cd C:\Users\skntj\Desktop\switcab-android\expo_app

# 2. Install dependencies (if not done)
npm install

# 3. Start your AVD from Android Studio
# (Click play button in Device Manager)

# 4. Verify AVD is connected
adb devices
# Should show: emulator-5554   device

# 5. Start Expo with Android
npm run android

# Wait for build and installation...
```

---

## 🔍 Debugging Commands

### **Check if Metro is running:**
```bash
# Open in browser
start http://localhost:8081
```

### **Check ADB connection:**
```bash
# List devices
adb devices

# Restart ADB if needed
adb kill-server
adb start-server
adb devices
```

### **Check Expo installation:**
```bash
npx expo --version
```

### **View logs:**
```bash
# React Native logs
npx react-native log-android

# Or in Expo
# Press 'j' to open debugger
```

---

## 📊 Port Usage

| Port | Service | URL |
|------|---------|-----|
| **8081** | Metro Bundler | http://localhost:8081 |
| **19000** | Expo Dev Server | http://localhost:19000 |
| **19001** | Expo Dev Tools | http://localhost:19001 |

---

## ✅ Success Checklist

Before running the app, make sure:

- [ ] Android Studio installed
- [ ] AVD created and started
- [ ] `adb devices` shows your emulator
- [ ] Node modules installed (`npm install`)
- [ ] Port 8081 is free
- [ ] Internet connection active
- [ ] Sufficient disk space (2GB+)

---

## 🎬 Complete Workflow

### **Every Time You Start:**

```bash
# 1. Start AVD (in Android Studio)
#    Device Manager > Click ▶️

# 2. Verify connection
adb devices

# 3. Start app
npm run android
```

**Expected Output:**
```
✔ Metro bundler started
✔ Building app...
✔ Installing app...
✔ Opening on emulator-5554...
✔ App launched!
```

---

## 🆘 Still Not Working?

### **Try the Nuclear Option:**

```bash
# 1. Kill all processes
taskkill /IM node.exe /F

# 2. Clear all caches
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force $env:TEMP\metro-* -ErrorAction SilentlyContinue

# 3. Restart ADB
adb kill-server
adb start-server

# 4. Fresh start
npm start -- --reset-cache
```

Then press `a` for Android.

---

## 📱 Alternative: Run on Physical Device

### **1. Enable USB Debugging on Phone:**
- Settings > About Phone
- Tap "Build Number" 7 times
- Settings > Developer Options
- Enable "USB Debugging"

### **2. Connect via USB:**
```bash
# Check if detected
adb devices

# Should show your device
```

### **3. Run app:**
```bash
npm run android
```

---

## 🌐 Alternative: Run on Web (For Testing)

```bash
npm run web
```

Opens in browser at http://localhost:19006

---

## 📚 Helpful Resources

- **Expo Docs:** https://docs.expo.dev/
- **React Native Docs:** https://reactnative.dev/
- **Android Studio Setup:** https://developer.android.com/studio
- **Expo Forums:** https://forums.expo.dev/

---

## 🎉 Quick Reference Card

```
╔════════════════════════════════════╗
║     EXPO + ANDROID COMMANDS        ║
╠════════════════════════════════════╣
║                                    ║
║  npm start         Start Metro     ║
║  npm run android   Launch Android  ║
║  npm run dev       Dev mode        ║
║                                    ║
║  Press 'a'         Open Android    ║
║  Press 'r'         Reload app      ║
║  Press 'j'         Debugger        ║
║  Press 'c'         Clear cache     ║
║                                    ║
║  adb devices       Check AVD       ║
║  adb logcat        View logs       ║
║                                    ║
╚════════════════════════════════════╝
```

---

## ⚡ Pro Tips

1. **Keep AVD Running:** Start your emulator once, keep it running all day
2. **Use Hot Reload:** Press `r` to reload instead of restarting
3. **Check Logs:** Press `j` to open Chrome debugger
4. **Clear Cache:** When things get weird: `npx expo start --clear`
5. **Physical Device:** Faster than emulator for testing

---

**Your AVD is connected! The app should be launching now.** 🚀

Check the emulator screen - the app should appear shortly!

---

**Last Updated:** January 2025  
**Status:** ✅ Ready to Run

