# 🏗️ **SwiftCab Driver App - EAS Build Guide**

## 📱 **APK Build Options Available**

I've configured **4 different build profiles** for your SwiftCab Driver App:

### **1. 🧪 Development APK** (Test Build)
```bash
npm run build:dev
```
- **Environment**: Development (localhost APIs)
- **Use for**: Testing with local backend
- **File type**: APK
- **Distribution**: Internal testing

### **2. 🔍 Preview APK** (Demo Build)
```bash
npm run build:preview
```
- **Environment**: Development (localhost APIs)
- **Use for**: Demo and testing
- **File type**: APK
- **Distribution**: Share with testers

### **3. 🚀 Production App Bundle** (Play Store)
```bash
npm run build:prod
```
- **Environment**: Production (live APIs)
- **Use for**: Google Play Store upload
- **File type**: AAB (Android App Bundle)
- **Distribution**: Play Store

### **4. 🎯 Production APK** (Direct Install)
```bash
npm run build:prod:apk
```
- **Environment**: Production (live APIs)  
- **Use for**: Direct installation/sideloading
- **File type**: APK
- **Distribution**: Direct download

---

## 🚀 **Quick Start - Create Your First APK**

### **Step 1: Install EAS CLI (if needed)**
```bash
# Check if already installed
eas --version

# If not installed, install globally
npm install -g @expo/eas-cli
```

### **Step 2: Login to Expo**
```bash
eas login
```

### **Step 3: Build Your APK**

**For Testing (Recommended First Build):**
```bash
npm run build:preview
```

**For Production:**
```bash
npm run build:prod:apk
```

---

## 🔧 **Build Process Steps**

When you run a build command, EAS will:

1. **🔐 Authentication**: Login to your Expo account
2. **📋 Configuration**: Read your eas.json and app.json
3. **☁️ Upload**: Send your code to EAS servers
4. **🏗️ Build**: Compile your app with the specified profile
5. **📱 Generate**: Create the APK/AAB file
6. **📥 Download**: Provide download link when complete

---

## 📋 **Environment Configuration**

### **Development Builds** (`build:dev`, `build:preview`)
- API URL: `http://localhost:5000`
- Portal URL: `http://localhost:3001/callback`
- Cookie Portal: `http://localhost:3001`
- Medium URL: `http://localhost:7001`

### **Production Builds** (`build:prod`, `build:prod:apk`)
- API URL: `https://swiftcab-api.365itsolution.com`
- Portal URL: `https://swiftcab-client.365itsolution.com/callback`
- Cookie Portal: `https://swiftcab-client.365itsolution.com`
- Medium URL: `https://swiftcab-medium.365itsolution.com`

---

## 🎯 **Recommended Build Strategy**

### **For Development & Testing:**
```bash
# 1. First, create a preview APK for testing
npm run build:preview

# 2. Test on your device with localhost APIs
# 3. Once satisfied, create production APK
npm run build:prod:apk
```

### **For Production Release:**
```bash
# For Play Store submission
npm run build:prod

# For direct distribution/sideloading
npm run build:prod:apk
```

---

## 📱 **Build Profiles Explained**

| Profile | Environment | Output | APIs Used | Use Case |
|---------|------------|--------|-----------|----------|
| `development` | Dev | APK | localhost:5000 | Local testing |
| `preview` | Dev | APK | localhost:5000 | Demo/sharing |
| `production` | Prod | AAB | live APIs | Play Store |
| `production-apk` | Prod | APK | live APIs | Direct install |

---

## ⏱️ **Build Time Expectations**

- **First Build**: 10-15 minutes (includes dependencies)
- **Subsequent Builds**: 5-10 minutes
- **Build Status**: Check at https://expo.dev/builds

---

## 📥 **After Build Completes**

You'll receive:
1. **🔗 Download Link**: Direct APK/AAB download
2. **📧 Email Notification**: Build completion notice  
3. **🌐 Web Dashboard**: View at expo.dev/builds
4. **📱 QR Code**: For easy device installation

---

## 🐛 **Common Issues & Solutions**

### **Issue: "eas command not found"**
```bash
# Solution: Install EAS CLI
npm install -g @expo/eas-cli
```

### **Issue: "Authentication required"**
```bash
# Solution: Login to Expo
eas login
```

### **Issue: Build fails with environment errors**
```bash
# Solution: Environment variables are now properly configured in eas.json
# Just use the npm run commands as shown above
```

### **Issue: "Project not configured"**
```bash
# Solution: Configure EAS project
eas build:configure
```

---

## 🧪 **Test Your APK**

### **After Download:**
1. **📲 Install**: Transfer APK to Android device and install
2. **🔍 Test Features**:
   - Location permissions
   - Camera/gallery access for documents
   - OTP verification flow
   - File upload functionality
   - Navigation between screens

### **Verify Environment:**
- Open app console/logs
- Check API URLs being used
- Verify file uploads work with correct environment

---

## 🎯 **Ready to Build!**

**Start with a preview build:**
```bash
npm run build:preview
```

**This will create an APK with:**
- ✅ Development environment (safe for testing)
- ✅ All your app features
- ✅ Professional UI design
- ✅ File upload functionality
- ✅ Complete onboarding flow

**Your SwiftCab Driver App is ready to be built! 🚗💨**

---

## 📞 **Need Help?**

If you encounter any issues:
1. Check the EAS build logs at expo.dev
2. Verify your Expo account permissions
3. Ensure all dependencies are properly installed
4. Contact Expo support for build-specific issues

**Happy Building! 🎊**
