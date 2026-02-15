/* ========================================
   SAFETY TIMEOUT WATCHDOG SYSTEM
   Real-time Heartbeat Monitoring for Fail-Safe Control
   ======================================== */

// ========================================
// SAFETY WATCHDOG STATE
// ========================================

var safetyWatchdog = {
    lastHeartbeat: 0,
    heartbeatTimeout: 5000,           // 5 seconds (ESP32 writes every 2-3s)
    warningThreshold: 4000,           // Show warning at 4 seconds
    heartbeatCheckInterval: 200,      // Check every 200ms
    isMonitoring: false,
    emergencyActive: false,
    warningActive: false,
    countdownValue: 0,
    countdownTimerId: null,
    heartbeatListenerId: null
};

// ========================================
// FUNCTION 1: Initialize Heartbeat Monitoring
// ========================================

function initSafetyWatchdog() {
    console.log('🛡️ Initializing Safety Watchdog System...');
    
    // Get Firebase database reference
    var database = firebase.database();
    
    // Real-time listener for heartbeat
    safetyWatchdog.heartbeatListenerId = database.ref('robot/lastHeartbeat').on('value', 
        function(snapshot) {
            var timestamp = snapshot.val();
            
            if (timestamp) {
                safetyWatchdog.lastHeartbeat = timestamp;
                console.log('💓 Heartbeat received:', new Date(timestamp).toISOString());
                
                // Resume monitoring if it was paused
                if (!safetyWatchdog.isMonitoring) {
                    startHeartbeatMonitoring();
                }
            }
        },
        function(error) {
            console.error('❌ Error reading heartbeat:', error.message);
        }
    );
    
    // Start monitoring
    startHeartbeatMonitoring();
}

// ========================================
// FUNCTION 2: Start Heartbeat Monitoring Loop
// ========================================

function startHeartbeatMonitoring() {
    if (safetyWatchdog.isMonitoring) {
        return; // Already running
    }
    
    safetyWatchdog.isMonitoring = true;
    console.log('✓ Heartbeat monitoring started');
    
    // Check heartbeat status every 200ms
    var checkInterval = setInterval(function() {
        if (!safetyWatchdog.isMonitoring) {
            clearInterval(checkInterval);
            return;
        }
        
        var currentTime = Date.now();
        var timeSinceHeartbeat = currentTime - safetyWatchdog.lastHeartbeat;
        
        // ============================================
        // SAFETY LOGIC: STRICT FAIL-SAFE BEHAVIOR
        // ============================================
        
        if (timeSinceHeartbeat > safetyWatchdog.heartbeatTimeout) {
            // HEARTBEAT LOST - TRIGGER EMERGENCY
            if (!safetyWatchdog.emergencyActive) {
                triggerEmergencyStopFromWatchdog();
            }
            
            // Update UI with countdown
            updateHeartbeatCountdown(0);
            updateConnectionWarning(true, 'LOST');
            
        } else if (timeSinceHeartbeat > safetyWatchdog.warningThreshold) {
            // HEARTBEAT DEGRADING - SHOW WARNING
            safetyWatchdog.warningActive = true;
            var remainingMs = safetyWatchdog.heartbeatTimeout - timeSinceHeartbeat;
            updateHeartbeatCountdown(remainingMs);
            updateConnectionWarning(true, 'WEAK');
            
        } else {
            // NORMAL - HEARTBEAT HEALTHY
            safetyWatchdog.warningActive = false;
            safetyWatchdog.countdownValue = 0;
            updateHeartbeatCountdown(safetyWatchdog.heartbeatTimeout);
            updateConnectionWarning(false, 'CONNECTED');
            
            // Clear any pending emergency from watchdog
            // (But do NOT auto-clear manual emergency - that requires manual restart)
        }
        
    }, safetyWatchdog.heartbeatCheckInterval);
}

// ========================================
// FUNCTION 3: Trigger Emergency from Watchdog
// ========================================

function triggerEmergencyStopFromWatchdog() {
    safetyWatchdog.emergencyActive = true;
    
    console.log('🚨 EMERGENCY TRIGGERED: HEARTBEAT TIMEOUT (>5 seconds)');
    console.log('🛑 All motors STOPPED - Fail-safe engaged');
    
    // Get Firebase database reference
    var database = firebase.database();
    
    // Write emergency flag to Firebase (fail-safe)
    database.ref('robot/emergency/active').set(true)
        .then(function() {
            console.log('✓ Emergency state written to Firebase');
            displayEmergencyBanner('⚠️ CONNECTION LOST — EMERGENCY STOP ACTIVATED');
            disableAllControls();
        })
        .catch(function(error) {
            console.error('❌ Failed to write emergency flag:', error.message);
            // Still disable controls locally as backup
            disableAllControls();
        });
}

// ========================================
// FUNCTION 4: Update Heartbeat Countdown Display
// ========================================

function updateHeartbeatCountdown(remainingMs) {
    var countdownElement = document.getElementById('heartbeat-countdown');
    
    if (!countdownElement) {
        return; // Element not yet created
    }
    
    if (remainingMs <= 0) {
        countdownElement.textContent = '0.0s';
        countdownElement.parentElement.classList.add('critical');
    } else {
        var seconds = (remainingMs / 1000).toFixed(1);
        countdownElement.textContent = seconds + 's';
        
        // Color coding
        if (remainingMs > safetyWatchdog.warningThreshold) {
            countdownElement.parentElement.classList.remove('warning', 'critical');
            countdownElement.parentElement.classList.add('normal');
        } else if (remainingMs > 1000) {
            countdownElement.parentElement.classList.remove('normal', 'critical');
            countdownElement.parentElement.classList.add('warning');
        } else {
            countdownElement.parentElement.classList.remove('normal', 'warning');
            countdownElement.parentElement.classList.add('critical');
        }
    }
}

// ========================================
// FUNCTION 5: Update Connection Warning Display
// ========================================

function updateConnectionWarning(showWarning, status) {
    var warningElement = document.getElementById('connection-warning');
    var statusElement = document.getElementById('connection-status-text');
    
    if (warningElement) {
        if (showWarning) {
            warningElement.style.display = 'flex';
            warningElement.classList.add('active');
        } else {
            warningElement.style.display = 'none';
            warningElement.classList.remove('active');
        }
    }
    
    if (statusElement) {
        if (status === 'CONNECTED') {
            statusElement.textContent = '✓ Connected';
            statusElement.style.color = '#4ade80'; // Green
            statusElement.parentElement.style.opacity = '0.7';
        } else if (status === 'WEAK') {
            statusElement.textContent = '⚠️ Weak Signal';
            statusElement.style.color = '#ffaa00'; // Orange
            statusElement.parentElement.style.opacity = '1';
        } else if (status === 'LOST') {
            statusElement.textContent = '🔴 Connection Lost';
            statusElement.style.color = '#ff4444'; // Red
            statusElement.parentElement.style.opacity = '1';
        }
    }
}

// ========================================
// FUNCTION 6: Display Emergency Banner
// ========================================

function displayEmergencyBanner(message) {
    var banner = document.getElementById('emergency-banner');
    var statusText = document.getElementById('emergency-status-text');
    
    if (banner) {
        banner.style.display = 'flex';
        banner.classList.add('active');
    }
    
    if (statusText) {
        statusText.textContent = message;
    }
    
    // Disable emergency restart button initially if lost connection triggered it
    var restartBtn = document.getElementById('btn-emergency-restart');
    if (restartBtn) {
        // Allow manual restart
        restartBtn.style.display = 'block';
        restartBtn.disabled = false;
    }
}

// ========================================
// FUNCTION 7: Disable All Controls
// ========================================

function disableAllControls() {
    // Disable main control buttons
    var controlButtons = [
        'btn-start', 'btn-pause', 'btn-stop', 'btn-home',
        'btn-forward', 'btn-backward', 'btn-left', 'btn-right',
        'btn-manual', 'btn-autonomous'
    ];
    
    controlButtons.forEach(function(btnId) {
        var btn = document.getElementById(btnId);
        if (btn) {
            btn.disabled = true;
            btn.classList.add('disabled');
            btn.style.opacity = '0.4';
            btn.style.cursor = 'not-allowed';
            btn.style.pointerEvents = 'none';
        }
    });
    
    console.log('🔒 All controls LOCKED - Emergency mode active');
}

// ========================================
// FUNCTION 8: Manual Emergency Restart
// ========================================

function restartFromEmergency() {
    console.log('🔄 EMERGENCY RESTART INITIATED BY USER');
    
    var database = firebase.database();
    
    // Verify heartbeat is present before allowing restart
    var timeSinceHeartbeat = Date.now() - safetyWatchdog.lastHeartbeat;
    
    if (timeSinceHeartbeat > safetyWatchdog.heartbeatTimeout) {
        // Still lost - don't allow restart
        console.error('⛔ Cannot restart: Heartbeat still lost');
        alert('⛔ Cannot restart. Heartbeat still lost. Check robot connection.');
        return false;
    }
    
    // User confirmed restart - clear emergency flag
    database.ref('robot/emergency/active').set(false)
        .then(function() {
            console.log('✓ Emergency flag cleared');
            
            // Re-enable controls after 500ms
            setTimeout(function() {
                enableAllControls();
                safetyWatchdog.emergencyActive = false;
                console.log('✓ Controls re-enabled');
            }, 500);
        })
        .catch(function(error) {
            console.error('❌ Failed to clear emergency flag:', error.message);
        });
    
    return true;
}

// ========================================
// FUNCTION 9: Re-enable Controls
// ========================================

function enableAllControls() {
    var controlButtons = [
        'btn-start', 'btn-pause', 'btn-stop', 'btn-home',
        'btn-forward', 'btn-backward', 'btn-left', 'btn-right',
        'btn-manual', 'btn-autonomous'
    ];
    
    controlButtons.forEach(function(btnId) {
        var btn = document.getElementById(btnId);
        if (btn) {
            btn.disabled = false;
            btn.classList.remove('disabled');
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
            btn.style.pointerEvents = 'auto';
        }
    });
    
    // Hide emergency banner and restart button
    var banner = document.getElementById('emergency-banner');
    var restartBtn = document.getElementById('btn-emergency-restart');
    
    if (banner) {
        banner.style.display = 'none';
        banner.classList.remove('active');
    }
    
    if (restartBtn) {
        restartBtn.style.display = 'none';
    }
}

// ========================================
// FUNCTION 10: Cleanup and Stop Monitoring
// ========================================

function stopSafetyWatchdog() {
    safetyWatchdog.isMonitoring = false;
    
    if (safetyWatchdog.heartbeatListenerId) {
        firebase.database().ref('robot/lastHeartbeat').off();
    }
    
    console.log('✓ Safety Watchdog stopped');
}

// ========================================
// AUTO-INITIALIZE ON PAGE LOAD
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Wait for Firebase to be ready
    setTimeout(function() {
        if (typeof firebase !== 'undefined' && firebase.database) {
            initSafetyWatchdog();
        }
    }, 500);
});
