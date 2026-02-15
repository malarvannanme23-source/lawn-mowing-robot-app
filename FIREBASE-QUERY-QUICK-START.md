# FIREBASE QUERY STORAGE - QUICK SETUP (5 Minutes)

## TL;DR Setup

### 1️⃣ Create Firebase Project
Visit: https://console.firebase.google.com → Create Project

### 2️⃣ Get Credentials
- Project Settings → Your Apps → Web App
- Copy the `firebaseConfig` object

### 3️⃣ Enable Database
- Left menu → Realtime Database (OR Firestore)
- Create Database
- Start in "Test Mode"
- Choose region: `us-central1`

### 4️⃣ Update Code
In `query-form-firebase.html` line ~110:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",                    // Replace
    authDomain: "YOUR_AUTH_DOMAIN",            // Replace
    databaseURL: "YOUR_DATABASE_URL",          // Replace
    projectId: "YOUR_PROJECT_ID",              // Replace
    storageBucket: "YOUR_STORAGE_BUCKET",      // Replace
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Replace
    appId: "YOUR_APP_ID"                       // Replace
};
```

### 5️⃣ Choose Database Type
Line ~130:
```javascript
const DATABASE_TYPE = "realtime"; // or "firestore"
```

### 6️⃣ Test
- Open `query-form-firebase.html` in browser
- Should show: "✓ Connected to Firebase"
- Fill form and submit
- Data appears in Firebase Console

---

## Credentials Locations

| Value | Where to Find |
|-------|---------------|
| `apiKey` | Firebase Console → Project Settings → Your apps → Web app config |
| `authDomain` | Same location, format: `yourproject.firebaseapp.com` |
| `databaseURL` | Realtime Database → Rules tab, at top, format: `https://yourproject.firebaseio.com` |
| `projectId` | Project Settings → General tab |
| `storageBucket` | Project Settings → General tab, format: `yourproject.appspot.com` |
| `messagingSenderId` | Project Settings → Cloud Messaging tab |
| `appId` | Project Settings → Your apps → Web app |

---

## Database Type Comparison

| Feature | Realtime DB | Firestore |
|---------|-------------|-----------|
| Real-time sync | ✓ | ✓ |
| Speed | Fast | Very Fast |
| Complexity | Simple | Advanced |
| Queries | Limited | Rich |
| Scaling | Medium | Large |
| Free tier | 100MB storage | 1GB storage |

**Recommendation:** Use **Realtime Database** for this project (simpler, faster for queries)

---

## File Structure Created

```
New Query Storage System
├── query-form-firebase.html (NEW - Use this!)
├── FIREBASE-QUERY-SETUP.md (Complete setup guide)
├── FIREBASE-QUERY-QUICK-START.md (YOU ARE HERE)
└── FIREBASE-QUERY-TECHNICAL.md (Technical reference)
```

---

## Expected Data Structure

After submitting a query:

**Realtime Database:**
```
queries/
└── -OmNa8kZxqK1a2b3c4d (auto-generated ID)
    ├── name: "John Smith"
    ├── email: "john@example.com"
    ├── message: "Help with blade calibration"
    ├── timestamp: 1707244245123
    └── status: "new"
```

**Cloud Firestore:**
```
queries/
└── OmNa8kZxqK1a2b3c4d (auto-generated ID)
    ├── name: "John Smith"
    ├── email: "john@example.com"
    ├── message: "Help with blade calibration"
    ├── timestamp: 2026-02-06T14:30:45.123Z
    └── status: "new"
```

---

## Common Issues & Fixes

| Problem | Solution |
|---------|----------|
| "Firebase not configured" warning | Replace placeholder credentials with real values |
| "Disconnected from Firebase" | Check credentials are correct, enable database in Console |
| Data not saving | Check DATABASE_TYPE matches your choice, verify credentials |
| Errors in browser console | Clear cache, refresh page, check Firebase SDK URL |

---

## Test Checklist

- [ ] Firebase project created
- [ ] Credentials copied into code
- [ ] Database enabled (Realtime or Firestore)
- [ ] Open form in browser
- [ ] Status shows "✓ Connected to Firebase"
- [ ] Fill test form
- [ ] Click "Save to Database"
- [ ] Form clears and success message shows
- [ ] Check Firebase Console → see data saved
- [ ] Verify timestamp is auto-populated
- [ ] Verify status is "new"

---

## Security: Test Mode vs Production

### Current Setup (Test Mode)
- Anyone can read/write
- Perfect for development
- **NOT SAFE for production**

### Before Going Live
1. Update Security Rules in Firebase Console
2. For Realtime DB:
```json
{
  "rules": {
    "queries": {
      ".write": "!data.exists()",
      ".read": true
    }
  }
}
```
3. Test again - should still work
4. Then deploy

---

## Pricing Check

**Free tier covers:**
- <5 queries/day ✓ Realtime DB
- <100 queries/day ✓ Firestore

**Current system expected:** <20 queries/month

**Status:** Fully within free tier

---

## Next Steps

1. Complete setup above (5 min)
2. Test the form (2 min)
3. Link from dashboard (1 min)
4. Update security rules when going live
5. Monitor usage monthly

---

## File Sizes

- `query-form-firebase.html`: ~13 KB
- Firebase SDK: CDN hosted (no local download needed)
- Per query storage: ~500 bytes
- 1000 queries: ~500 KB (well within limits)

---

## Support

- Setup issues: See `FIREBASE-QUERY-SETUP.md`
- Technical details: See `FIREBASE-QUERY-TECHNICAL.md`
- Firebase docs: https://firebase.google.com/docs

---

**Status:** Ready to deploy ✓
