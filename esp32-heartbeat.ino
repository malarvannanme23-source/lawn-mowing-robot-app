/* ========================================
   ESP32 HEARTBEAT WRITER
   Firebase Realtime Database Integration
   
   PLATFORM: ESP32 (Arduino)
   LIBRARY: Firebase Realtime Database (Arduino)
   INTERVAL: 2-3 seconds
   PATH: robot/lastHeartbeat
   
   INSTALLATION:
   1. Install "Firebase Arduino Library" via Arduino IDE
      Sketch → Include Library → Manage Libraries
      Search: "Firebase Arduino"
      Install: Firebase Arduino Library (latest version)
   
   2. Install "ArduinoJson" via Arduino IDE (dependency)
   
   ======================================== */

#include <WiFi.h>
#include <FirebaseESP32.h>
#include <addons/TokenHelper.h>
#include <addons/RTDBHelper.h>

// ========================================
// CONFIGURATION
// ========================================

// WiFi Credentials
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// Firebase Configuration
#define FIREBASE_HOST "https://lawn-mower-pro-eac52-default-rtdb.asia-southeast1.firebasedatabase.app"
#define FIREBASE_AUTH "YOUR_FIREBASE_API_KEY"

// Firebase Object
FirebaseData firebaseData;
FirebaseConfig config;
FirebaseAuth auth;

// ========================================
// HEARTBEAT VARIABLES
// ========================================

unsigned long lastHeartbeatSent = 0;
const unsigned long HEARTBEAT_INTERVAL = 2500;  // 2.5 seconds (must be < 5000ms for watchdog)
int heartbeatCount = 0;
bool isConnectedToFirebase = false;

// ========================================
// SETUP FUNCTION
// ========================================

void setup() {
    Serial.begin(115200);
    delay(1000);
    
    Serial.println("\n\n");
    Serial.println("╔════════════════════════════════════════╗");
    Serial.println("║   LAWN MOWER PRO - ESP32 HEARTBEAT    ║");
    Serial.println("║   Connecting to WiFi & Firebase...     ║");
    Serial.println("╚════════════════════════════════════════╝");
    
    // Connect to WiFi
    connectToWiFi();
    
    // Configure Firebase
    configureFirebase();
    
    Serial.println("\n✓ Setup complete. Starting heartbeat...\n");
}

// ========================================
// MAIN LOOP
// ========================================

void loop() {
    unsigned long currentTime = millis();
    
    // Check if it's time to send heartbeat
    if (currentTime - lastHeartbeatSent >= HEARTBEAT_INTERVAL) {
        sendHeartbeat();
        lastHeartbeatSent = currentTime;
    }
    
    // Small delay to prevent watchdog timer
    delay(100);
}

// ========================================
// FUNCTION 1: Connect to WiFi
// ========================================

void connectToWiFi() {
    Serial.print("▾ Connecting to WiFi: ");
    Serial.println(WIFI_SSID);
    
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
        delay(500);
        Serial.print(".");
        attempts++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println();
        Serial.print("✓ WiFi connected! IP: ");
        Serial.println(WiFi.localIP());
    } else {
        Serial.println("\n❌ WiFi connection failed!");
    }
}

// ========================================
// FUNCTION 2: Configure Firebase
// ========================================

void configureFirebase() {
    Serial.print("▾ Configuring Firebase...");
    
    config.host = FIREBASE_HOST;
    config.api_key = FIREBASE_AUTH;
    config.token_status_callback = tokenStatusCallback;
    config.max_reconnect_timeout = 10 * 1000L;
    
    Firebase.reconnectNetwork(true);
    Firebase.setDoubleDigits(5);
    
    Firebase.begin(&config, &auth);
    
    Serial.println(" ✓");
}

// ========================================
// FUNCTION 3: Send Heartbeat
// ========================================

void sendHeartbeat() {
    // Check WiFi connection
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("⚠️ WiFi disconnected - attempting reconnect...");
        WiFi.reconnect();
        return;
    }
    
    // Create timestamp (milliseconds since epoch)
    unsigned long timestamp = millis() + 1704067200000UL; // Adjust to real time if needed
    // For production, use external RTC module or NTP time
    
    // Write timestamp to Firebase
    String path = "/robot/lastHeartbeat";
    
    if (Firebase.setLongLong(firebaseData, path, timestamp)) {
        heartbeatCount++;
        
        Serial.print("[#");
        Serial.print(heartbeatCount);
        Serial.print("] 💓 Heartbeat sent: ");
        Serial.print(timestamp);
        Serial.print(" ms | WiFi: ");
        Serial.print(WiFi.RSSI());
        Serial.println(" dBm");
        
        isConnectedToFirebase = true;
        
    } else {
        Serial.print("❌ Heartbeat failed: ");
        Serial.println(firebaseData.errorMessage());
        isConnectedToFirebase = false;
    }
}

// ========================================
// FUNCTION 4: Token Status Callback
// ========================================

void tokenStatusCallback(token_info_t info) {
    if (info.status == token_status_ready) {
        Serial.println("✓ Firebase token ready");
    } else if (info.status == token_status_expired) {
        Serial.println("⚠️ Firebase token expired - refreshing...");
    } else if (info.status == token_status_error) {
        Serial.print("❌ Firebase token error: ");
        Serial.println(info.error.message.c_str());
    }
}

// ========================================
// OPTIONAL: Emergency Stop Handler
// ========================================

/*
   Call this function from your main robot control logic
   to respond to emergency stop commands from Firebase
*/

void checkForEmergencyStop() {
    if (Firebase.getBool(firebaseData, "/robot/emergency/active")) {
        bool emergencyActive = firebaseData.boolData();
        
        if (emergencyActive) {
            Serial.println("🚨 EMERGENCY STOP DETECTED - HALTING ALL MOTORS");
            // TODO: Your motor stop code here
            // stopAllMotors();
            // stopBlade();
        }
    }
}

/* ========================================
   INTEGRATION WITH YOUR ROBOT CODE
   ======================================== */

/*
   In your main loop or control function:
   
   void robotControlLoop() {
       // Your existing motor control code...
       
       // Add this to check for emergency stop
       checkForEmergencyStop();
       
       // Heartbeat is automatically sent in main loop
   }
*/

/* ========================================
   TROUBLESHOOTING
   
   1. Heartbeat not appearing in Firebase Console:
      - Check WiFi connection (Serial output)
      - Verify FIREBASE_HOST URL is correct
      - Check Firebase rules allow write to /robot/lastHeartbeat
      
   2. "Token expired" messages:
      - This is normal, library will auto-refresh
      
   3. Timestamps seem wrong:
      - ESP32 RTC needs sync with NTP
      - Use configTime() after WiFi connects:
        configTime(0, 0, "pool.ntp.org", "time.nist.gov");
      
   4. Firebase connection drops:
      - Add delay between write attempts
      - Check HEARTBEAT_INTERVAL (currently 2.5s)
      - Reduce WiFi latency issues
   
   ======================================== */
