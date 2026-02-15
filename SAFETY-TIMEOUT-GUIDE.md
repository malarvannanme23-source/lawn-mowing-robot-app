# SAFETY TIMEOUT WATCHDOG - INTEGRATION GUIDE

## 📋 Overview

This implements a **fail-safe heartbeat monitoring system** that automatically triggers EMERGENCY STOP if the ESP32 loses connection for more than 5 seconds.

**System Architecture:**
```
ESP32 (every 2-3s) → writes timestamp → Firebase /robot/lastHeartbeat
                     ↓
        Web Dashboard (every 200ms) ← reads timestamp ← Monitors staleness
                     ↓
        If > 5s old → Auto-trigger Emergency Stop
```

---

## 🛠️ PART 1: ESP32 SETUP (Arduino)

### Step 1.1: Install Required Libraries

**Arduino IDE:**
1. Open `Sketch → Include Library → Manage Libraries`
2. Search for `Firebase Arduino` (by Mobizt)
3. Click **Install** (choose latest version)
4. Search for `ArduinoJson` (by Benoit Blanchon)
5. Click **Install**

### Step 1.2: Configure WiFi & Firebase

Edit `esp32-heartbeat.ino`:

```cpp
// ❌ CHANGE THESE:
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"
#define FIREBASE_AUTH "YOUR_FIREBASE_API_KEY"

// ✓ TO YOUR VALUES:
#define WIFI_SSID "MyHome5G"           // Your WiFi name
#define WIFI_PASSWORD "SecurePass123"  // Your WiFi password
#define FIREBASE_AUTH "AIzaSyCcpMdxp7XTD9hCpJ3qLKF08ICZYNfNHWA"  // Copy from Firebase Console
```

**Find your Firebase API Key:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: `lawn-mower-pro-eac52`
3. Project Settings (⚙️ icon) → Service Accounts
4. Copy the API Key from the Web App section

### Step 1.3: Upload to ESP32

1. Connect ESP32 via USB
2. Select Board: `Tools → Board → ESP32 Dev Module`
3. Select Port: `Tools → Port → COM# (or /dev/ttyUSB0)`
4. Click **Upload** (Sketch → Upload)

### Step 1.4: Verify Heartbeat

Open **Serial Monitor** (`Tools → Serial Monitor`, 115200 baud):

```
✓ WiFi connected! IP: 192.168.1.100
✓ Firebase configured
✓ Setup complete. Starting heartbeat...

[#1] 💓 Heartbeat sent: 1704067200000 ms | WiFi: -45 dBm
[#2] 💓 Heartbeat sent: 1704067202500 ms | WiFi: -45 dBm
[#3] 💓 Heartbeat sent: 1704067205000 ms | WiFi: -42 dBm
```

**Expected every 2-3 seconds.** ✓ If you see this, ESP32 is working!

---

## 🖥️ PART 2: WEB DASHBOARD SETUP

### Step 2.1: Add UI Elements to index.html

Add **BEFORE** the closing `</section>` tag in the **HOME SECTION** (around line 100):

```html
<!-- HEARTBEAT COUNTDOWN & CONNECTION WARNING -->
<div class="heartbeat-status-card status-card">
    <div class="heartbeat-header">
        <div class="heartbeat-icon">💓</div>
        <div class="heartbeat-label">Heartbeat Health</div>
    </div>
    <div class="heartbeat-countdown normal">
        <span id="heartbeat-countdown">5.0s</span>
    </div>
    <div id="connection-warning" class="connection-warning" style="display: none;">
        <div class="warning-icon">⚠️</div>
        <div id="connection-status-text" class="warning-text">Weak Signal</div>
    </div>
</div>
```

### Step 2.2: Add Script Tags to index.html

Add **BEFORE** the closing `</body>` tag (at the very end, around line 610):

```html
    <!-- Safety Watchdog System -->
    <script src="js/safety-watchdog.js"></script>
```

### Step 2.3: Add CSS Styling

Add to `css/main.css` (at the end of the file):

```css
/* ========================================
   SAFETY WATCHDOG STYLING
   ======================================== */

.heartbeat-status-card {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    background: linear-gradient(135deg, rgba(34, 211, 238, 0.08) 0%, rgba(0, 255, 200, 0.05) 100%);
    border: 1px solid var(--accent-border);
    border-radius: 12px;
    min-height: 140px;
}

.heartbeat-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
}

.heartbeat-icon {
    font-size: 24px;
    animation: heartbeat-pulse 1.2s ease-in-out infinite;
}

@keyframes heartbeat-pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.7; }
}

.heartbeat-label {
    font-size: 12px;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
}

.heartbeat-countdown {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 70px;
    padding: 16px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    border: 2px solid var(--accent-color);
    font-size: 32px;
    font-weight: 700;
    font-family: 'Courier New', monospace;
    transition: all 0.3s ease;
}

.heartbeat-countdown.normal {
    color: #4ade80;
    border-color: rgba(74, 222, 128, 0.5);
    background: rgba(74, 222, 128, 0.05);
}

.heartbeat-countdown.warning {
    color: #ffaa00;
    border-color: rgba(255, 170, 0, 0.7);
    background: rgba(255, 170, 0, 0.1);
    animation: warning-pulse 0.8s ease-in-out infinite;
}

@keyframes warning-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
}

.heartbeat-countdown.critical {
    color: #ff4444;
    border-color: rgba(255, 68, 68, 0.8);
    background: rgba(255, 68, 68, 0.15);
    animation: critical-pulse 0.4s ease-in-out infinite;
}

@keyframes critical-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.05); }
}

.connection-warning {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 12px;
    background: rgba(255, 68, 68, 0.15);
    border: 1px solid rgba(255, 68, 68, 0.5);
    border-radius: 6px;
    color: #ff4444;
    font-size: 14px;
    font-weight: 600;
    animation: warning-blink 1s ease-in-out infinite;
}

@keyframes warning-blink {
    0%, 100% { opacity: 0.8; }
    50% { opacity: 1; }
}

.connection-warning.active {
    display: flex;
}

.warning-icon {
    font-size: 18px;
    animation: icon-shake 0.3s ease-in-out infinite;
}

@keyframes icon-shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-2px); }
    75% { transform: translateX(2px); }
}

.warning-text {
    color: #ff4444;
}

/* Emergency Banner Styles */
#emergency-banner {
    display: none;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: linear-gradient(90deg, #ff4444 0%, #ff1111 100%);
    color: #fff;
    font-size: 16px;
    font-weight: 700;
    border-radius: 8px;
    margin-bottom: 16px;
    animation: emergency-pulse 1.5s ease-in-out infinite;
}

#emergency-banner.active {
    display: flex;
}

@keyframes emergency-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}

#btn-emergency-restart {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, #ff4444 0%, #ff1111 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    display: none;
    margin-top: 8px;
}

#btn-emergency-restart:hover {
    transform: scale(1.02);
    box-shadow: 0 0 20px rgba(255, 68, 68, 0.6);
}

#btn-emergency-restart:active {
    transform: scale(0.98);
}

/* Responsive adjustments */
@media (max-width: 599px) {
    .heartbeat-countdown {
        font-size: 24px;
        min-height: 60px;
    }
    
    .heartbeat-status-card {
        min-height: 110px;
    }
}

@media (min-width: 600px) and (max-width: 1023px) {
    .heartbeat-status-card {
        min-height: 130px;
    }
}
```

### Step 2.4: Verify Installation

1. **Refresh** the web dashboard in the browser
2. Open **Browser Console** (F12 → Console tab)
3. You should see:

```
🛡️ Initializing Safety Watchdog System...
✓ Heartbeat monitoring started
💓 Heartbeat received: 2026-02-05T14:23:45.000Z
```

4. Check the **HOME SECTION** – you should see a **Heartbeat Health** card with a countdown timer showing `5.0s` in green.

---

## 🔬 PART 3: TESTING THE SYSTEM

### Test 3.1: Verify Heartbeat is Working

**Expected Behavior:**
- Countdown timer in the Heartbeat Health card shows decreasing value (5.0s → 4.9s → 4.8s...)
- Color: **GREEN** (normal)
- No warnings displayed

### Test 3.2: Simulate Connection Loss

**On ESP32:**
1. Open Serial Monitor
2. Comment out this line in the code (around line 95):
   ```cpp
   // sendHeartbeat();  // COMMENTED OUT - SIMULATE NO HEARTBEAT
   ```
3. Upload the modified code

**Expected Behavior (on Web Dashboard):**
- After 4 seconds: Countdown timer turns **ORANGE** (warning)
- WARNING message appears: "⚠️ Weak Signal"
- After 5 seconds: Countdown timer turns **RED** (critical)
- WARNING message: "🔴 Connection Lost"
- **RED BANNER** appears: "⚠️ CONNECTION LOST — EMERGENCY STOP ACTIVATED"
- **All control buttons become DISABLED** (opacity 0.4, grayed out)
- **Emergency Restart button appears**

### Test 3.3: Restore Connection

**On ESP32:**
1. Uncomment the line you commented in Test 3.2:
   ```cpp
   sendHeartbeat();  // RESTORED
   ```
2. Re-upload the code

**Expected Behavior (on Web Dashboard):**
- Heartbeat resumes
- Countdown timer returns to **GREEN**
- Warning message disappears
- Connection status shows "✓ Connected"
- Emergency banner STAYS (requires manual restart)
- **Emergency Restart button is available for user to click**

### Test 3.4: Manual Emergency Restart

1. Click **Emergency Restart** button
2. Check Browser Console

**Expected Output:**
```
🔄 EMERGENCY RESTART INITIATED BY USER
✓ Emergency flag cleared
✓ Controls re-enabled
```

**Expected UI Behavior:**
- Emergency banner disappears
- All control buttons become **ENABLED** again
- Restart button hides
- Heartbeat countdown continues in green

---

## 🔴 PART 4: FAIL-SAFE RULES

**CRITICAL SAFETY LOGIC:**

| Scenario | Duration | UI State | Controls | Action |
|----------|----------|----------|----------|--------|
| **Normal Operation** | < 4s | 🟢 Green | ENABLED | Continues |
| **Degraded (Weak Signal)** | 4-5s | 🟠 Orange | ENABLED | Show warning |
| **Connection Lost** | > 5s | 🔴 Red | DISABLED | Auto-Emergency Stop |
| **Restart from Lost** | User click | 🟢 Recovery* | Check connection | Manual only |

**KEY RULES:**
1. ✅ Heartbeat MUST be < 5 seconds old
2. ✅ Loss of heartbeat = AUTOMATIC EMERGENCY STOP (fail-safe)
3. ✅ Recovery of heartbeat = User must click "Emergency Restart"
4. ✅ NO auto-clearing emergency flags (manual reset only = safer)
5. ✅ All controls disabled during emergency

---

## 🐛 TROUBLESHOOTING

### Problem: Countdown timer not appearing

**Solution:**
- Verify `safety-watchdog.js` script is loaded (F12 → Network tab)
- Check HTML element IDs match: `heartbeat-countdown`, `connection-warning`, etc.
- Check browser console for errors

### Problem: Heartbeat not received

**Solution:**
- Verify ESP32 Serial output shows heartbeat being sent
- Check Firebase Rules allow writes to `/robot/lastHeartbeat`
  ```json
  {
    "rules": {
      "robot": {
        "lastHeartbeat": {
          ".write": true,
          ".read": true
        }
      }
    }
  }
  ```

### Problem: Emergency stops immediately

**Solution:**
- Check `lastHeartbeat` value in Firebase Console
- It should update every 2-3 seconds
- If not updating, ESP32 is not connected

### Problem: Controls don't re-enable after restart

**Solution:**
- Verify Emergency Restart button was clicked
- Check browser console for errors
- Manually refresh page as fallback

---

## 📊 MONITORING IN FIREBASE CONSOLE

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select `lawn-mower-pro-eac52`
3. Realtime Database → View data
4. Look for `robot/lastHeartbeat` 
5. Should show a **recent timestamp** (milliseconds since epoch)

**Example:**
```
robot
  └── lastHeartbeat: 1704067245000  ✓ (updates every 2-3s)
  └── emergency
      └── active: false             ✓ (true when emergency triggered)
```

---

## 🎯 SUMMARY

| Component | Status | Purpose |
|-----------|--------|---------|
| **ESP32 Code** | `esp32-heartbeat.ino` | Writes timestamp every 2-3s |
| **Web Watchdog JS** | `js/safety-watchdog.js` | Monitors heartbeat, triggers emergency |
| **HTML UI** | Added to `index.html` | Displays countdown & warnings |
| **CSS Styling** | Added to `css/main.css` | Colors, animations, responsiveness |

**System is now:**
- ✅ Fail-safe (loses connection → automatic stop)
- ✅ Real-time (checks every 200ms)
- ✅ User-friendly (clear warnings & countdown)
- ✅ Production-ready (tested edge cases)

---

## 🚀 NEXT STEPS (Optional Enhancements)

1. **Add NTP Time Sync** for accurate ESP32 timestamps
2. **Add Telemetry Dashboard** showing connection signal strength
3. **Multi-device Support** for multiple robots
4. **Data Logging** to Firestore for diagnostics
5. **Push Notifications** when emergency triggered

---

**Questions?** Check Firebase rules, ESP32 WiFi connection, and browser console.
