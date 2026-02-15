/* ========================================
   LAWN MOWER PRO - APPLICATION LOGIC
   ======================================== */

// ========================================
// GLOBAL STATE MANAGEMENT
// ========================================

var appState = {
    currentMode: 'manual',
    robotStatus: 'IDLE',
    isMoving: false,
    battery: 78,
    isConnected: true,
    emergencyActive: false,
    robotData: {
        speed: 0.0,
        motor: false,
        blade: false,
        distance: null
    },
    robotPosition: {
        x: 50,
        y: 50
    },
    usageHistory: {
        totalRuntime: 1450,
        totalDistance: 28340,
        totalArea: 385.6
    },
    gpsData: {
        latitude: -25.2345,
        longitude: 133.7654,
        accuracy: 2.8,
        active: true
    },
    safetyTimeout: {
        duration: 30,
        remaining: 30,
        timerId: null,
        isActive: false
    }
};

/* Authentication handled by Firebase Auth v9 modular in:
   - login.html: signInWithEmailAndPassword + setPersistence
   - index.html: onAuthStateChanged auth guard
   Do NOT use localStorage for login state. */

// ========================================
// SECTION 1: PAGE NAVIGATION
// ========================================

function initNavigation() {
    var navItems = document.querySelectorAll('.nav-item');
    for (var i = 0; i < navItems.length; i++) {
        navItems[i].addEventListener('click', function(e) {
            // Strict check: verify click is within THIS nav-item
            var clickedNavItem = e.target.closest('.nav-item');
            
            // Only activate if clicked element belongs to this nav-item
            if (clickedNavItem !== this) {
                return;
            }
            
            e.preventDefault();
            e.stopPropagation();
            
            var sectionId = this.getAttribute('data-section');
            if (sectionId) {
                switchSection(sectionId);
            }
        });
    }
}

function switchSection(sectionId) {
    var sections = document.querySelectorAll('.page-section');
    var navItems = document.querySelectorAll('.nav-item');
    
    // Remove active class from all sections
    for (var i = 0; i < sections.length; i++) {
        sections[i].classList.remove('active');
    }
    
    // Remove active class from all nav items
    for (var i = 0; i < navItems.length; i++) {
        navItems[i].classList.remove('active');
    }
    
    // Activate selected section
    var activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.classList.add('active');
    }
    
    // Activate corresponding nav item
    var activeNavItem = document.querySelector('[data-section="' + sectionId + '"]');
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }
}

// ========================================
// SECTION 2: MODE CONTROL (Manual/Autonomous)
// ========================================

function initModeToggle() {
    var manualBtn = document.getElementById('manual-mode');
    var autonomousBtn = document.getElementById('autonomous-mode');
    
    if (manualBtn) {
        manualBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            setMode('manual');
        });
    }
    
    if (autonomousBtn) {
        autonomousBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            setMode('autonomous');
        });
    }
}

function setMode(mode) {
    appState.currentMode = mode;
    
    var manualBtn = document.getElementById('manual-mode');
    var autonomousBtn = document.getElementById('autonomous-mode');
    
    if (mode === 'manual') {
        if (manualBtn) manualBtn.classList.add('active');
        if (autonomousBtn) autonomousBtn.classList.remove('active');
        updateModeDisplay('MANUAL');
        enableManualControls();
        stopSafetyTimeout();
        resetSafetyTimeout();
    } else {
        if (manualBtn) manualBtn.classList.remove('active');
        if (autonomousBtn) autonomousBtn.classList.add('active');
        updateModeDisplay('AUTONOMOUS');
        disableManualControls();
        resetSafetyTimeout();
        startSafetyTimeout();
    }
}

function updateModeDisplay(text) {
    var modeDisplay = document.getElementById('mode-display');
    if (modeDisplay) {
        modeDisplay.textContent = text;
    }
}

function disableManualControls() {
    var arrowBtns = document.querySelectorAll('.arrow-btn');
    for (var i = 0; i < arrowBtns.length; i++) {
        arrowBtns[i].disabled = true;
        arrowBtns[i].style.opacity = '0.3';
        arrowBtns[i].style.cursor = 'not-allowed';
    }
}

function enableManualControls() {
    var arrowBtns = document.querySelectorAll('.arrow-btn');
    for (var i = 0; i < arrowBtns.length; i++) {
        arrowBtns[i].disabled = false;
        arrowBtns[i].style.opacity = '1';
        arrowBtns[i].style.cursor = 'pointer';
    }
}

// ========================================
// SECTION 2B: SAFETY TIMEOUT
// ========================================

function initSafetyTimeout() {
    updateSafetyTimeoutDisplay();
}

function startSafetyTimeout() {
    appState.safetyTimeout.isActive = true;
    appState.safetyTimeout.remaining = appState.safetyTimeout.duration;
    updateSafetyTimeoutDisplay();
    
    appState.safetyTimeout.timerId = setInterval(function() {
        appState.safetyTimeout.remaining--;
        updateSafetyTimeoutDisplay();
        
        if (appState.safetyTimeout.remaining <= 0) {
            stopSafetyTimeout();
            lockSafetyTimeout();
        }
    }, 1000);
}

function stopSafetyTimeout() {
    appState.safetyTimeout.isActive = false;
    if (appState.safetyTimeout.timerId) {
        clearInterval(appState.safetyTimeout.timerId);
        appState.safetyTimeout.timerId = null;
    }
}

function resetSafetyTimeout() {
    appState.safetyTimeout.remaining = appState.safetyTimeout.duration;
    updateSafetyTimeoutDisplay();
}

function lockSafetyTimeout() {
    var safetyTimeoutEl = document.getElementById('safety-timeout');
    if (safetyTimeoutEl) {
        safetyTimeoutEl.classList.remove('active', 'warning');
        safetyTimeoutEl.classList.add('locked');
    }
    
    var statusEl = document.getElementById('safety-status');
    if (statusEl) {
        statusEl.textContent = 'SYSTEM LOCKED';
    }
}

function updateSafetyTimeoutDisplay() {
    var safetyTimeoutEl = document.getElementById('safety-timeout');
    var timerEl = document.getElementById('safety-timer');
    var statusEl = document.getElementById('safety-status');
    
    if (!safetyTimeoutEl || !timerEl || !statusEl) return;
    
    var minutes = Math.floor(appState.safetyTimeout.remaining / 60);
    var seconds = appState.safetyTimeout.remaining % 60;
    var timeString = (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
    
    timerEl.textContent = timeString;
    
    if (appState.currentMode === 'manual' || !appState.safetyTimeout.isActive) {
        safetyTimeoutEl.classList.remove('active', 'warning', 'locked');
        statusEl.textContent = 'Ready';
    } else if (appState.safetyTimeout.remaining <= 0) {
        safetyTimeoutEl.classList.remove('active', 'warning');
        safetyTimeoutEl.classList.add('locked');
        statusEl.textContent = 'SYSTEM LOCKED';
    } else if (appState.safetyTimeout.remaining <= 10) {
        safetyTimeoutEl.classList.remove('active', 'locked');
        safetyTimeoutEl.classList.add('warning');
        statusEl.textContent = 'WARNING';
    } else {
        safetyTimeoutEl.classList.remove('warning', 'locked');
        safetyTimeoutEl.classList.add('active');
        statusEl.textContent = 'Active';
    }
}

// ========================================
// SECTION 3: DIRECTIONAL CONTROLS
// ========================================

function initDirectionControls() {
    var upBtn = document.getElementById('btn-up');
    var downBtn = document.getElementById('btn-down');
    var leftBtn = document.getElementById('btn-left');
    var rightBtn = document.getElementById('btn-right');
    var stopBtn = document.getElementById('btn-center');
    
    if (upBtn) upBtn.addEventListener('click', function(e) { e.preventDefault(); e.stopPropagation(); updateDirection('UP'); });
    if (downBtn) downBtn.addEventListener('click', function(e) { e.preventDefault(); e.stopPropagation(); updateDirection('DOWN'); });
    if (leftBtn) leftBtn.addEventListener('click', function(e) { e.preventDefault(); e.stopPropagation(); updateDirection('LEFT'); });
    if (rightBtn) rightBtn.addEventListener('click', function(e) { e.preventDefault(); e.stopPropagation(); updateDirection('RIGHT'); });
    if (stopBtn) stopBtn.addEventListener('click', function(e) { e.preventDefault(); e.stopPropagation(); updateDirection('STOP'); });
}

function updateDirection(direction) {
    if (appState.currentMode === 'manual') {
        var directionDisplay = document.getElementById('direction-display');
        if (directionDisplay) {
            directionDisplay.textContent = direction;
        }
    }
}

// ========================================
// SECTION 4: MAIN CONTROL BUTTONS
// ========================================

function initMainButtons() {
    var startBtn = document.getElementById('btn-start');
    var pauseBtn = document.getElementById('btn-pause');
    var stopBtn = document.getElementById('btn-stop');
    var homeBtn = document.getElementById('btn-home');
    
    if (startBtn) startBtn.addEventListener('click', function(e) { e.preventDefault(); e.stopPropagation(); updateStatus('RUNNING'); });
    if (pauseBtn) pauseBtn.addEventListener('click', function(e) { e.preventDefault(); e.stopPropagation(); updateStatus('PAUSED'); });
    if (stopBtn) stopBtn.addEventListener('click', function(e) { e.preventDefault(); e.stopPropagation(); updateStatus('STOPPED'); });
    if (homeBtn) homeBtn.addEventListener('click', function(e) { e.preventDefault(); e.stopPropagation(); updateStatus('RETURNING HOME'); });
}

function updateStatus(status) {
    appState.robotStatus = status;
    var statusDisplay = document.getElementById('status-display');
    if (statusDisplay) {
        statusDisplay.textContent = status;
    }
}

// ========================================
// SECTION 5: EMERGENCY STOP & RESTART
// ========================================

function initEmergencyStop() {
    var emergencyBtn = document.getElementById('btn-emergency-stop');
    var confirmBtn = document.getElementById('emergency-confirm');
    var cancelBtn = document.getElementById('emergency-cancel');
    var restartBtn = document.getElementById('btn-emergency-restart');
    
    // Restore emergency state on page load if it was previously active
    if (localStorage.getItem('emergencyActive') === 'true') {
        activateEmergency();
    }
    
    if (emergencyBtn) {
        emergencyBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Emergency button clicked - showing overlay');
            showEmergencyOverlay();
        });
    }
    
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Emergency confirmed');
            activateEmergency();
            hideEmergencyOverlay();
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Emergency cancelled');
            hideEmergencyOverlay();
        });
    }
    
    if (restartBtn) {
        restartBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Emergency restart clicked');
            deactivateEmergency();
        });
    } else {
        console.warn('⚠️ Emergency restart button not found!');
    }
}

function showEmergencyOverlay() {
    var overlay = document.getElementById('emergency-overlay');
    if (overlay) {
        overlay.classList.remove('hidden');
    }
}

function hideEmergencyOverlay() {
    var overlay = document.getElementById('emergency-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

function activateEmergency() {
    console.log('🚨 ACTIVATING EMERGENCY STOP');
    
    appState.emergencyActive = true;
    appState.robotStatus = 'EMERGENCY STOP';
    
    // Save to localStorage for persistence on page refresh
    localStorage.setItem('emergencyActive', 'true');
    
    // Disable all controls
    disableAllControls();
    
    // Show emergency UI
    showEmergencyUI();
    
    // Update status display
    var statusDisplay = document.getElementById('status-display');
    if (statusDisplay) {
        statusDisplay.textContent = 'EMERGENCY STOP';
        statusDisplay.style.color = '#ff0000';
    }
    
    console.log('✓ EMERGENCY STOP ACTIVE');
}

function deactivateEmergency() {
    console.log('✓ RESTARTING FROM EMERGENCY STOP');
    
    appState.emergencyActive = false;
    appState.robotStatus = 'IDLE';
    
    // Clear emergency state from localStorage
    localStorage.removeItem('emergencyActive');
    
    // Enable all controls
    enableAllControls();
    
    // Hide emergency UI
    hideEmergencyUI();
    
    // Update status display
    var statusDisplay = document.getElementById('status-display');
    if (statusDisplay) {
        statusDisplay.textContent = 'IDLE';
        statusDisplay.style.color = '#00ff88';
    }
    
    console.log('✓ SYSTEMS RESTORED');
}

function showEmergencyUI() {
    var messageEl = document.getElementById('emergency-active-message');
    var restartBtn = document.getElementById('btn-emergency-restart');
    
    console.log('Showing emergency UI - Message:', messageEl, 'Restart:', restartBtn);
    
    if (messageEl) {
        messageEl.classList.remove('hidden');
        messageEl.style.display = 'block';
    }
    if (restartBtn) {
        restartBtn.classList.remove('hidden');
        restartBtn.style.display = 'block';
    }
}

function hideEmergencyUI() {
    var messageEl = document.getElementById('emergency-active-message');
    var restartBtn = document.getElementById('btn-emergency-restart');
    
    console.log('Hiding emergency UI - Message:', messageEl, 'Restart:', restartBtn);
    
    if (messageEl) {
        messageEl.classList.add('hidden');
        messageEl.style.display = 'none';
    }
    if (restartBtn) {
        restartBtn.classList.add('hidden');
        restartBtn.style.display = 'none';
    }
}

function disableAllControls() {
    // Disable Control Mode buttons (Manual, Autonomous)
    var controlModeIds = ['manual-mode', 'autonomous-mode'];
    for (var i = 0; i < controlModeIds.length; i++) {
        var el = document.getElementById(controlModeIds[i]);
        if (el) {
            el.disabled = true;
            el.style.opacity = '0.4';
            el.style.cursor = 'not-allowed';
        }
    }
    
    // Disable Robot Movement buttons (Up, Down, Left, Right, Center)
    var movementIds = ['btn-up', 'btn-down', 'btn-left', 'btn-right', 'btn-center'];
    for (var j = 0; j < movementIds.length; j++) {
        var el = document.getElementById(movementIds[j]);
        if (el) {
            el.disabled = true;
            el.style.opacity = '0.4';
            el.style.cursor = 'not-allowed';
        }
    }
    
    // Also disable main control buttons for safety
    var mainControlIds = ['btn-start', 'btn-pause', 'btn-stop', 'btn-home'];
    for (var k = 0; k < mainControlIds.length; k++) {
        var el = document.getElementById(mainControlIds[k]);
        if (el) {
            el.disabled = true;
            el.style.opacity = '0.4';
            el.style.cursor = 'not-allowed';
        }
    }
}

function enableAllControls() {
    // Enable Control Mode buttons (Manual, Autonomous)
    var controlModeIds = ['manual-mode', 'autonomous-mode'];
    for (var i = 0; i < controlModeIds.length; i++) {
        var el = document.getElementById(controlModeIds[i]);
        if (el) {
            el.disabled = false;
            el.style.opacity = '1';
            el.style.cursor = 'pointer';
        }
    }
    
    // Enable Robot Movement buttons (Up, Down, Left, Right, Center)
    var movementIds = ['btn-up', 'btn-down', 'btn-left', 'btn-right', 'btn-center'];
    for (var j = 0; j < movementIds.length; j++) {
        var el = document.getElementById(movementIds[j]);
        if (el) {
            el.disabled = false;
            el.style.opacity = '1';
            el.style.cursor = 'pointer';
        }
    }
    
    // Also enable main control buttons
    var mainControlIds = ['btn-start', 'btn-pause', 'btn-stop', 'btn-home'];
    for (var k = 0; k < mainControlIds.length; k++) {
        var el = document.getElementById(mainControlIds[k]);
        if (el) {
            el.disabled = false;
            el.style.opacity = '1';
            el.style.cursor = 'pointer';
        }
    }
}

// ========================================
// SECTION 6: TOGGLE SWITCHES
// ========================================

function initToggleSwitches() {
    var toggles = document.querySelectorAll('.toggle-input');
    for (var i = 0; i < toggles.length; i++) {
        toggles[i].addEventListener('change', function(e) {
            // Checkbox state is automatically managed by the browser
            // The CSS :checked pseudo-class handles the visual state
            var toggleId = this.id;
            var isChecked = this.checked;
            
            // Optionally log state changes for debugging
            if (toggleId) {
                console.log('Toggle ' + toggleId + ' changed to: ' + (isChecked ? 'ON' : 'OFF'));
            }
        });
    }
}

// ========================================
// SECTION 7: BATTERY STATUS
// ========================================

function initBatteryStatus() {
    setBatteryLevel(appState.battery);
}

function setBatteryLevel(percentage) {
    appState.battery = percentage;
    
    var batteryFill = document.querySelector('.battery-fill');
    var batteryDisplay = document.getElementById('battery-display');
    
    if (batteryFill) {
        batteryFill.style.width = percentage + '%';
    }
    
    if (batteryDisplay) {
        batteryDisplay.textContent = percentage + '%';
    }
}

function updateBatteryFromESP32(value) {
    if (value >= 0 && value <= 100) {
        setBatteryLevel(value);
    }
}

// ========================================
// SECTION 8: CONNECTION STATUS
// ========================================

function initConnectionStatus() {
    setConnectionStatus(appState.isConnected);
}

function setConnectionStatus(isConnected) {
    appState.isConnected = isConnected;
    
    var statusCards = document.querySelectorAll('.status-card');
    
    for (var i = 0; i < statusCards.length; i++) {
        var statusValue = statusCards[i].querySelector('.status-value');
        var statusLabel = statusCards[i].querySelector('.status-label');
        
        if (statusLabel && statusLabel.textContent.toLowerCase().includes('connection')) {
            if (isConnected) {
                statusValue.textContent = 'Wi-Fi Connected';
                statusValue.style.color = '#00ff88';
            } else {
                statusValue.textContent = 'Offline';
                statusValue.style.color = '#ff4444';
            }
        }
    }
}

function updateConnectionFromESP32(value) {
    setConnectionStatus(value);
}

// ========================================
// SECTION 9: LIVE ROBOT DATA
// ========================================

function initRobotData() {
    updateRobotSpeed(appState.robotData.speed);
    updateMotorStatus(appState.robotData.motor);
    updateBladeStatus(appState.robotData.blade);
    updateObstacleDistance(appState.robotData.distance);
}

function updateRobotSpeed(speed) {
    appState.robotData.speed = speed;
    
    var speedElement = document.getElementById('robot-speed');
    if (speedElement) {
        speedElement.textContent = speed.toFixed(1) + ' m/s';
        
        if (speed > 0) {
            speedElement.classList.remove('robot-off');
            speedElement.classList.add('robot-neutral');
        } else {
            speedElement.classList.remove('robot-neutral');
            speedElement.classList.add('robot-off');
        }
    }
}

function updateMotorStatus(isOn) {
    appState.robotData.motor = isOn;
    
    var motorElement = document.getElementById('motor-status');
    if (motorElement) {
        motorElement.textContent = isOn ? 'ON' : 'OFF';
        motorElement.classList.toggle('robot-on', isOn);
        motorElement.classList.toggle('robot-off', !isOn);
    }
}

function updateBladeStatus(isOn) {
    appState.robotData.blade = isOn;
    
    var bladeElement = document.getElementById('blade-status');
    if (bladeElement) {
        bladeElement.textContent = isOn ? 'ON' : 'OFF';
        bladeElement.classList.toggle('robot-on', isOn);
        bladeElement.classList.toggle('robot-off', !isOn);
    }
}

function updateObstacleDistance(distance) {
    appState.robotData.distance = distance;
    
    var distanceElement = document.getElementById('obstacle-distance');
    if (distanceElement) {
        if (distance === null || distance === undefined) {
            distanceElement.textContent = '-- cm';
            distanceElement.classList.remove('robot-on', 'robot-off');
            distanceElement.classList.add('robot-neutral');
        } else {
            distanceElement.textContent = distance + ' cm';
            
            if (distance < 30) {
                distanceElement.classList.remove('robot-neutral');
                distanceElement.classList.add('robot-off');
            } else {
                distanceElement.classList.remove('robot-off');
                distanceElement.classList.add('robot-neutral');
            }
        }
    }
}

// Future: WebSocket handler for ESP32 data
function handleESP32RobotData(data) {
    if (data.speed !== undefined) updateRobotSpeed(data.speed);
    if (data.motor !== undefined) updateMotorStatus(data.motor);
    if (data.blade !== undefined) updateBladeStatus(data.blade);
    if (data.distance !== undefined) updateObstacleDistance(data.distance);
}

// ========================================
// SECTION 10: LAWN COVERAGE MAP
// ========================================

function initLawnMap() {
    updateRobotIndicatorPosition();
}

function moveRobotUp() {
    if (appState.robotPosition.y > 5) {
        appState.robotPosition.y -= 5;
        updateRobotIndicatorPosition();
    }
}

function moveRobotDown() {
    if (appState.robotPosition.y < 95) {
        appState.robotPosition.y += 5;
        updateRobotIndicatorPosition();
    }
}

function moveRobotLeft() {
    if (appState.robotPosition.x > 5) {
        appState.robotPosition.x -= 5;
        updateRobotIndicatorPosition();
    }
}

function moveRobotRight() {
    if (appState.robotPosition.x < 95) {
        appState.robotPosition.x += 5;
        updateRobotIndicatorPosition();
    }
}

function resetRobotPosition() {
    appState.robotPosition.x = 50;
    appState.robotPosition.y = 50;
    updateRobotIndicatorPosition();
}

function updateRobotIndicatorPosition() {
    var robotIndicator = document.querySelector('.robot-indicator');
    
    if (robotIndicator) {
        robotIndicator.style.left = appState.robotPosition.x + '%';
        robotIndicator.style.top = appState.robotPosition.y + '%';
    }
}

function connectDirectionControlToMap() {
    var upBtn = document.getElementById('btn-up');
    var downBtn = document.getElementById('btn-down');
    var leftBtn = document.getElementById('btn-left');
    var rightBtn = document.getElementById('btn-right');
    var centerBtn = document.getElementById('btn-center');
    
    if (upBtn) upBtn.addEventListener('click', function(e) { e.preventDefault(); e.stopPropagation(); moveRobotUp(); });
    if (downBtn) downBtn.addEventListener('click', function(e) { e.preventDefault(); e.stopPropagation(); moveRobotDown(); });
    if (leftBtn) leftBtn.addEventListener('click', function(e) { e.preventDefault(); e.stopPropagation(); moveRobotLeft(); });
    if (rightBtn) rightBtn.addEventListener('click', function(e) { e.preventDefault(); e.stopPropagation(); moveRobotRight(); });
    if (centerBtn) centerBtn.addEventListener('click', function(e) { e.preventDefault(); e.stopPropagation(); resetRobotPosition(); });
}

// ========================================
// SECTION 11: SPEED CONTROL SLIDERS
// ========================================

function initSpeedControl() {
    var motorSpeedSlider = document.getElementById('motor-speed');
    var bladeSpeedSlider = document.getElementById('blade-speed');
    
    if (motorSpeedSlider) {
        motorSpeedSlider.addEventListener('input', function() {
            updateMotorSpeed(this.value);
        });
    }
    
    if (bladeSpeedSlider) {
        bladeSpeedSlider.addEventListener('input', function() {
            updateBladeSpeed(this.value);
        });
    }
}

function updateMotorSpeed(value) {
    appState.robotData.speed = parseFloat(value) / 100;
    
    var motorSpeedValue = document.getElementById('motor-speed-value');
    if (motorSpeedValue) {
        motorSpeedValue.textContent = value;
    }
}

function updateBladeSpeed(value) {
    var bladeSpeedValue = document.getElementById('blade-speed-value');
    if (bladeSpeedValue) {
        bladeSpeedValue.textContent = value;
    }
}

function getMotorSpeed() {
    var motorSpeedSlider = document.getElementById('motor-speed');
    return motorSpeedSlider ? parseInt(motorSpeedSlider.value) : 50;
}

function getBladeSpeed() {
    var bladeSpeedSlider = document.getElementById('blade-speed');
    return bladeSpeedSlider ? parseInt(bladeSpeedSlider.value) : 50;
}

function setMotorSpeed(value) {
    var motorSpeedSlider = document.getElementById('motor-speed');
    if (motorSpeedSlider && value >= 0 && value <= 100) {
        motorSpeedSlider.value = value;
        updateMotorSpeed(value);
    }
}

function setBladeSpeed(value) {
    var bladeSpeedSlider = document.getElementById('blade-speed');
    if (bladeSpeedSlider && value >= 0 && value <= 100) {
        bladeSpeedSlider.value = value;
        updateBladeSpeed(value);
    }
}

// ========================================
// SECTION 12: USAGE HISTORY
// ========================================

function initUsageHistory() {
    updateUsageHistoryDisplay();
}

function updateUsageHistoryDisplay() {
    updateTotalRuntime();
    updateTotalDistance();
    updateTotalArea();
}

function updateTotalRuntime(minutes) {
    if (minutes !== undefined) {
        appState.usageHistory.totalRuntime = minutes;
    }
    
    var totalRuntimeElement = document.getElementById('total-runtime');
    if (totalRuntimeElement) {
        totalRuntimeElement.textContent = appState.usageHistory.totalRuntime + ' min';
    }
}

function updateTotalDistance(meters) {
    if (meters !== undefined) {
        appState.usageHistory.totalDistance = meters;
    }
    
    var totalDistanceElement = document.getElementById('total-distance');
    if (totalDistanceElement) {
        totalDistanceElement.textContent = appState.usageHistory.totalDistance + ' m';
    }
}

function updateTotalArea(squareMeters) {
    if (squareMeters !== undefined) {
        appState.usageHistory.totalArea = squareMeters;
    }
    
    var totalAreaElement = document.getElementById('total-area');
    if (totalAreaElement) {
        totalAreaElement.textContent = appState.usageHistory.totalArea + ' mÂ²';
    }
}

function getTotalRuntime() {
    return appState.usageHistory.totalRuntime;
}

function getTotalDistance() {
    return appState.usageHistory.totalDistance;
}

function getTotalArea() {
    return appState.usageHistory.totalArea;
}

function addToRuntime(minutes) {
    appState.usageHistory.totalRuntime += minutes;
    updateTotalRuntime();
}

function addToDistance(meters) {
    appState.usageHistory.totalDistance += meters;
    updateTotalDistance();
}

function addToArea(squareMeters) {
    appState.usageHistory.totalArea += squareMeters;
    updateTotalArea();
}

// ========================================
// SECTION 13: GPS STATUS
// ========================================

function initGPSData() {
    updateGPSStatus(appState.gpsData.latitude, appState.gpsData.longitude, appState.gpsData.accuracy, appState.gpsData.active);
}

function updateGPSStatus(latitude, longitude, accuracy, active) {
    if (latitude !== undefined) appState.gpsData.latitude = latitude;
    if (longitude !== undefined) appState.gpsData.longitude = longitude;
    if (accuracy !== undefined) appState.gpsData.accuracy = accuracy;
    if (active !== undefined) appState.gpsData.active = active;
    
    var latElement = document.getElementById('gps-latitude');
    if (latElement) {
        latElement.textContent = appState.gpsData.latitude.toFixed(4) + 'Â°';
    }
    
    var lonElement = document.getElementById('gps-longitude');
    if (lonElement) {
        lonElement.textContent = appState.gpsData.longitude.toFixed(4) + 'Â°';
    }
    
    var accElement = document.getElementById('gps-accuracy');
    if (accElement) {
        accElement.textContent = appState.gpsData.accuracy.toFixed(1) + ' m';
    }
    
    var statusElement = document.getElementById('gps-status-indicator');
    if (statusElement) {
        if (appState.gpsData.active) {
            statusElement.textContent = 'Active';
            statusElement.classList.remove('inactive');
        } else {
            statusElement.textContent = 'Inactive';
            statusElement.classList.add('inactive');
        }
    }
}

function setGPSCoordinates(latitude, longitude) {
    updateGPSStatus(latitude, longitude, appState.gpsData.accuracy, appState.gpsData.active);
}

function setGPSAccuracy(accuracy) {
    updateGPSStatus(appState.gpsData.latitude, appState.gpsData.longitude, accuracy, appState.gpsData.active);
}

function setGPSActive(active) {
    updateGPSStatus(appState.gpsData.latitude, appState.gpsData.longitude, appState.gpsData.accuracy, active);
}

function getGPSData() {
    return appState.gpsData;
}

/* Page navigation handled by HTML links and Firebase Auth redirects */

function init() {
    initNavigation();
    initModeToggle();
    initSafetyTimeout();
    initDirectionControls();
    initMainButtons();
    initEmergencyStop();
    initToggleSwitches();
    initBatteryStatus();
    initConnectionStatus();
    initRobotData();
    initLawnMap();
    connectDirectionControlToMap();
    initSpeedControl();
    initUsageHistory();
    initGPSData();
    
    setMode('manual');
}

// Initialize dashboard UI (only runs if user is authenticated via index.html auth guard)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

