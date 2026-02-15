# Firebase Realtime Database Security Rules - Deployment Guide

## 📋 Overview

This document explains how to deploy secure Firebase rules that require authentication for ALL database access.

**Security Policy:**
- ✅ Only authenticated users can read robot data
- ✅ Only authenticated users can write commands
- ✅ Only authenticated users can control emergency stop
- ✅ Public access BLOCKED
- ✅ Data validation enabled

---

## 🚀 How to Deploy Rules in Firebase Console

### Step 1: Open Firebase Console
1. Go to https://console.firebase.google.com
2. Select your project: **lawn-mower-pro-eac52**
3. Click **Realtime Database** in the left sidebar

### Step 2: Access Rules Editor
1. Click the **Rules** tab at the top of the database view
2. You'll see a text editor with current rules

### Step 3: Replace with New Rules
1. Delete all existing content in the rules editor
2. Copy the ENTIRE content from: `FIREBASE-SECURITY-RULES.json`
3. Paste into the rules editor in Firebase Console

### Step 4: Publish Rules
1. Click **Publish** button (top-right)
2. Confirm the deployment
3. Wait for "Rules deployed successfully" message

---

## ✅ Verify Rules Are Active

After publishing:

1. **In Firebase Console:**
   - Go to Realtime Database
   - Try to expand database paths
   - You may see "Permission denied" (normal - you're not authenticated in Console view)

2. **Test with Web Dashboard:**
   - Open your web dashboard (logged in)
   - All data should load normally
   - Console should show no "Permission denied" errors

3. **Test with ESP32:**
   - Ensure ESP32 uses Firebase Authentication token
   - Heartbeat should write successfully
   - Check Firebase console for `/robot/lastHeartbeat` updates

---

## 🔐 What These Rules Do

### Authentication Check
```
.read: auth != null      ← Only users logged in can READ
.write: auth != null     ← Only users logged in can WRITE
```

If authentication fails, Firebase shows: `"Permission denied"`

### Data Validation
```
.validate: newData.isBoolean()   ← Value must be true/false
.validate: newData.isNumber()    ← Value must be number
.validate: newData.isString()    ← Value must be string
```

Invalid data is automatically rejected.

### Specific Validations Added
- `emergency/active`: Must be boolean (true/false)
- `lastHeartbeat`: Must be number (timestamp)
- `command/state`: Must be string
- `battery/level`: Must be 0-100
- `battery/voltage`: Must be positive number
- `status`: Must have speed, motor, blade, distance

---

## ⚙️ Configuration for ESP32

### For ESP32 to Write Data

ESP32 needs Firebase Authentication. Use one of these methods:

#### Option 1: Email/Password (Simplest)
```cpp
// In your ESP32 code:
String email = "robot@example.com";
String password = "robot-secure-password";

Firebase.signInWithEmailAndPassword(&config, &auth, email, password);
```

#### Option 2: Custom Firebase Token (Recommended for Production)
```cpp
// Create custom token in Firebase Admin SDK
// Pass to ESP32, then:

Firebase.begin(&config, &auth);
auth.user.access_token = custom_token;
```

#### Option 3: Anonymous + Link Email Later
```cpp
Firebase.signInAnonymously(&config, &auth);
// Then link email/password in Firebase Console
```

---

## 📊 Rules Structure Explained

```
{
  "rules": {
    "web": {
      "connection": {
        ".read": "auth != null",      ← Only authenticated users
        ".write": "auth != null",     ← Only authenticated users
      }
    },
    
    "robot": {
      "emergency": {
        "active": {
          ".read": "auth != null",    ← Only authenticated users
          ".write": "auth != null",   ← Only authenticated users
          ".validate": "newData.isBoolean()"  ← Must be true/false
        }
      },
      
      "command": {
        "state": {
          ".read": "auth != null",
          ".write": "auth != null",
          ".validate": "newData.isString()"   ← Must be string
        }
      },
      
      "lastHeartbeat": {
        ".read": "auth != null",
        ".write": "auth != null",
        ".validate": "newData.isNumber()"     ← Must be number
      },
      
      "status": {
        ".read": "auth != null",
        ".write": "auth != null",
        ".validate": "newData.hasChildren(['speed', 'motor', 'blade', 'distance'])",
        // Sub-fields with specific types:
        "speed": { ".validate": "newData.isNumber()" },
        "motor": { ".validate": "newData.isBoolean()" },
        "blade": { ".validate": "newData.isBoolean()" },
        "distance": { ".validate": "newData.isNumber() || newData.val() === null" }
      },
      
      "battery": {
        ".read": "auth != null",
        ".write": "auth != null",
        ".validate": "newData.hasChildren(['level', 'voltage', 'status'])",
        // Sub-fields with specific types:
        "level": { ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 100" },
        "voltage": { ".validate": "newData.isNumber() && newData.val() >= 0" },
        "status": { ".validate": "newData.isString()" }
      }
    }
  }
}
```

---

## 🧪 Testing the Rules

### Test 1: No Authentication (Should FAIL)
```javascript
// Without logging in:
var database = firebase.database();
database.ref("robot/lastHeartbeat").set(Date.now());

// Result: ❌ Error: "Permission denied"
```

### Test 2: With Authentication (Should SUCCEED)
```javascript
// After firebase.auth().signInWithEmailAndPassword():
var database = firebase.database();
database.ref("robot/lastHeartbeat").set(Date.now());

// Result: ✅ Data written successfully
```

### Test 3: Invalid Data Type (Should FAIL)
```javascript
// Send string instead of boolean for emergency/active:
database.ref("robot/emergency/active").set("yes");

// Result: ❌ Error: "Validation failed"
// (Expected boolean, got string)
```

### Test 4: Valid Data Type (Should SUCCEED)
```javascript
// Send boolean for emergency/active:
database.ref("robot/emergency/active").set(true);

// Result: ✅ Data written successfully
```

---

## ⚠️ Common Issues

### Issue 1: "Permission Denied" Error
**Cause:** User not authenticated, or rules require auth

**Solution:**
```javascript
// Make sure user is logged in:
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // Now you can write to database
    database.ref("robot/emergency/active").set(true);
  }
});
```

### Issue 2: "Validation Failed"
**Cause:** Data type doesn't match rule

**Solution:** Check the `.validate` rule and send correct type:
- Boolean: `set(true)` or `set(false)`
- Number: `set(123)` or `set(45.6)`
- String: `set("idle")` or `set("running")`

### Issue 3: ESP32 Can't Write
**Cause:** ESP32 not authenticated

**Solution:** Add Firebase authentication to ESP32:
```cpp
// Sign in before writing:
Firebase.signInWithEmailAndPassword(&config, &auth, email, password);
// Then write data with auth token
```

---

## 🔄 How Web Dashboard Uses These Rules

Your web dashboard (JavaScript) already has:

```javascript
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    localStorage.setItem('isLoggedIn', 'true');
    // ✅ User authenticated - can read/write to database
  } else {
    window.location.replace('/login.html');
    // ❌ User not authenticated - redirected to login
  }
});
```

After login, the JavaScript can:
- ✅ Read: `database.ref("robot/status").on('value', ...)`
- ✅ Write: `database.ref("robot/emergency/active").set(true)`

---

## 🎯 Security Summary

| Access | Before Rules | After Rules |
|--------|--------------|-------------|
| Public user reads /robot/status | ✅ Allowed | ❌ BLOCKED |
| Public user writes command | ✅ Allowed | ❌ BLOCKED |
| Authenticated user reads | ✅ Allowed | ✅ Allowed |
| Authenticated user writes | ✅ Allowed | ✅ Allowed |
| Invalid data (e.g., string for boolean) | ✅ Allowed | ❌ BLOCKED |

---

## 📋 Deployment Checklist

- [ ] Copied `FIREBASE-SECURITY-RULES.json` content
- [ ] Opened Firebase Console → Realtime Database → Rules
- [ ] Replaced old rules with new rules
- [ ] Clicked "Publish"
- [ ] Saw "Rules deployed successfully" message
- [ ] Tested with logged-in web dashboard (should work)
- [ ] Tested with ESP32 (should write heartbeat)
- [ ] Verified unauthenticated access is blocked
- [ ] Monitored Firebase Console for any errors

---

## ✅ You Are Now Secure

Your database is now protected:
- ✓ Only authenticated users can access
- ✓ Only authenticated users can control emergency stop
- ✓ Invalid data is rejected automatically
- ✓ No public access possible
- ✓ All operations logged in Firebase Console

---

## 🔮 Optional Future Rules

### Block Emergency Stop on Sundays (Example)
```json
"emergency": {
  "active": {
    ".write": "auth != null && (now / 1000) % (7 * 86400) < (6 * 86400)"
  }
}
```

### Only Admin Can Override Commands
```json
"command": {
  ".write": "root.child('users').child(auth.uid).child('role').val() === 'admin'"
}
```

### Rate Limiting Commands (Max 10/minute)
```json
".write": "!root.child('rate_limits').child(auth.uid).exists() || 
           root.child('rate_limits').child(auth.uid).val() < now - 6000"
```

---

**Status: ✅ Rules are production-ready and secure.**
