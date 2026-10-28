/**
 * Practical 11: Main Application Script - script.js
 * 
 * Demonstrates:
 * 1. ES6 Modules: 'import' of utilities, timers, and data from './timerModule.js'
 * 2. JavaScript Timers: setInterval() for real-time clock and countdowns
 * 3. JavaScript Timers: setTimeout() for scheduled alerts and notifications
 */

import {
    defaultSchedule,
    DAYS_OF_WEEK,
    formatTwoDigits,
    formatTime12Hour,
    calculateCountdown,
    getCurrentAndNextClass,
    createIntervalTimer,
    scheduleTimeoutAlert,
    playChime
} from './timerModule.js';

// Application State
const STORAGE_KEY = 'practical11_schedule_data';
let schedule = loadScheduleFromStorage();
let activeTarget = null;           // { name, date }
let isCustomCountdown = false;
let clockIntervalId = null;
let countdownIntervalId = null;
let scheduledAlertTimeoutId = null;
let currentDayFilter = 'all';

// DOM Element References
const clockDigitsEl = document.getElementById('clockDigits');
const clockDateEl = document.getElementById('clockDate');
const daysDigitEl = document.getElementById('daysDigit');
const hoursDigitEl = document.getElementById('hoursDigit');
const minutesDigitEl = document.getElementById('minutesDigit');
const secondsDigitEl = document.getElementById('secondsDigit');
const countdownTargetNameEl = document.getElementById('countdownTargetName');
const countdownTargetTimeEl = document.getElementById('countdownTargetTime');

// Ongoing Class Elements
const ongoingStatusBadgeEl = document.getElementById('ongoingStatusBadge');
const ongoingSubjectEl = document.getElementById('ongoingSubject');
const ongoingDetailsEl = document.getElementById('ongoingDetails');
const classProgressFillEl = document.getElementById('classProgressFill');
const classProgressTextEl = document.getElementById('classProgressText');
const classTimeRangeEl = document.getElementById('classTimeRange');

// Alert Banner Elements
const notificationBanner = document.getElementById('notificationBanner');
const bannerTitle = document.getElementById('bannerTitle');
const bannerMessage = document.getElementById('bannerMessage');
const bannerCloseBtn = document.getElementById('bannerCloseBtn');

// Timetable and Modal Elements
const classesGridEl = document.getElementById('classesGrid');
const dayFilterPills = document.querySelectorAll('.day-pill');
const openAddModalBtn = document.getElementById('openAddModalBtn');
const addClassModal = document.getElementById('addClassModal');
const closeAddModalBtn = document.getElementById('closeAddModalBtn');
const cancelAddBtn = document.getElementById('cancelAddBtn');
const addClassForm = document.getElementById('addClassForm');

// Timer Tool Elements
const reminderText = document.getElementById('reminderText');
const reminderDelay = document.getElementById('reminderDelay');
const scheduleReminderBtn = document.getElementById('scheduleReminderBtn');
const reminderStatusText = document.getElementById('reminderStatusText');
const cancelReminderBtn = document.getElementById('cancelReminderBtn');
const syncScheduleBtn = document.getElementById('syncScheduleBtn');

// Preset Buttons
const presetButtons = document.querySelectorAll('.preset-btn');
const resetCountdownBtn = document.getElementById('resetCountdownBtn');
const pauseCountdownBtn = document.getElementById('pauseCountdownBtn');

let isCountdownPaused = false;
let pausedRemainingMs = 0;

/**
 * Load timetable from localStorage or default ES6 export
 */
function loadScheduleFromStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.warn("Could not load from localStorage, using default ES6 schedule:", e);
    }
    return [...defaultSchedule];
}

/**
 * Save current timetable to localStorage
 */
function saveScheduleToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
    } catch (e) {
        console.warn("Could not save to localStorage:", e);
    }
}

/**
 * 1. REAL-TIME CLOCK (setInterval)
 * Updates the digital clock and evaluates class statuses every 1 second
 */
function initRealtimeClock() {
    const updateClock = () => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;

        clockDigitsEl.textContent = `${formatTwoDigits(displayHours)}:${formatTwoDigits(minutes)}:${formatTwoDigits(seconds)} ${ampm}`;

        const dayName = DAYS_OF_WEEK[now.getDay()];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        clockDateEl.textContent = `${dayName}, ${now.getDate()} ${monthNames[now.getMonth()]} ${now.getFullYear()}`;

        // Re-evaluate ongoing & upcoming classes
        updateOngoingClassState(now);
    };

    updateClock(); // Initial immediate call
    // Use the exported wrapper createIntervalTimer() for setInterval
    clockIntervalId = createIntervalTimer(updateClock, 1000);
}

/**
 * Update the Ongoing Class hero section based on current time
 */
function updateOngoingClassState(now) {
    const { ongoingClass, nextClass, nextClassDate, classProgressPercent } = getCurrentAndNextClass(schedule, now);

    if (ongoingClass) {
        ongoingStatusBadgeEl.className = "status-pill pill-live";
        ongoingStatusBadgeEl.innerHTML = `<span class="pulse-dot"></span> Class in Session`;
        ongoingSubjectEl.textContent = ongoingClass.subject;
        ongoingDetailsEl.innerHTML = `
            <div><strong>Code:</strong> ${ongoingClass.code} &bull; <strong>Room:</strong> ${ongoingClass.room}</div>
            <div><strong>Instructor:</strong> ${ongoingClass.instructor}</div>
        `;
        classProgressFillEl.style.width = `${classProgressPercent}%`;
        classProgressTextEl.textContent = `${classProgressPercent}% Elapsed`;
        classTimeRangeEl.textContent = `${formatTime12Hour(ongoingClass.startTime)} - ${formatTime12Hour(ongoingClass.endTime)}`;
    } else {
        ongoingStatusBadgeEl.className = "status-pill pill-idle";
        ongoingStatusBadgeEl.textContent = "No Class Currently Active";
        ongoingSubjectEl.textContent = "Self Study & Lab Preparation";
        if (nextClass && nextClassDate) {
            ongoingDetailsEl.innerHTML = `
                <div>Next scheduled: <strong>${nextClass.subject}</strong></div>
                <div>${nextClass.day} at ${formatTime12Hour(nextClass.startTime)} (${nextClass.room})</div>
            `;
            classTimeRangeEl.textContent = `Starts at ${formatTime12Hour(nextClass.startTime)}`;
        } else {
            ongoingDetailsEl.textContent = "No more classes scheduled for the week.";
            classTimeRangeEl.textContent = "--:--";
        }
        classProgressFillEl.style.width = "0%";
        classProgressTextEl.textContent = "0% (Idle)";
    }

    // If no custom countdown is explicitly locked, track the next upcoming class
    if (!isCustomCountdown) {
        if (nextClass && nextClassDate) {
            activeTarget = {
                name: `Next: ${nextClass.subject} (${nextClass.code})`,
                date: nextClassDate
            };
        } else {
            activeTarget = null;
        }
    }
}

/**
 * 2. DYNAMIC COUNTDOWN TIMER (setInterval)
 * Calculates and updates days, hours, minutes, and seconds every 1000ms
 */
function initCountdownTimer() {
    const tickCountdown = () => {
        if (isCountdownPaused) return;

        if (!activeTarget || !activeTarget.date) {
            daysDigitEl.textContent = "00";
            hoursDigitEl.textContent = "00";
            minutesDigitEl.textContent = "00";
            secondsDigitEl.textContent = "00";
            countdownTargetNameEl.textContent = "No target set";
            countdownTargetTimeEl.textContent = "--:--";
            return;
        }

        countdownTargetNameEl.textContent = activeTarget.name;
        countdownTargetTimeEl.textContent = new Date(activeTarget.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        const breakdown = calculateCountdown(activeTarget.date);

        daysDigitEl.textContent = formatTwoDigits(breakdown.days);
        hoursDigitEl.textContent = formatTwoDigits(breakdown.hours);
        minutesDigitEl.textContent = formatTwoDigits(breakdown.minutes);
        secondsDigitEl.textContent = formatTwoDigits(breakdown.seconds);

        if (breakdown.isExpired) {
            // Target arrived! Trigger chime & banner
            playChime();
            showNotification("⏰ Target Time Reached!", `Countdown for "${activeTarget.name}" has completed.`);
            
            // Reset to auto upcoming class mode
            isCustomCountdown = false;
            updateOngoingClassState(new Date());
        }
    };

    tickCountdown();
    countdownIntervalId = createIntervalTimer(tickCountdown, 1000);
}

/**
 * 3. SCHEDULED REMINDERS (setTimeout)
 * Demonstrates scheduling a notification using setTimeout() with clearTimeout() support
 */
function setupReminderTools() {
    scheduleReminderBtn.addEventListener('click', () => {
        const text = reminderText.value.trim() || "Class Attendance Reminder";
        const delaySeconds = parseInt(reminderDelay.value, 10) || 5;
        const delayMs = delaySeconds * 1000;

        // Clear any previously active reminder timeout
        if (scheduledAlertTimeoutId) {
            clearTimeout(scheduledAlertTimeoutId);
        }

        reminderStatusText.textContent = `⏳ Reminder armed! Will fire in ${delaySeconds}s (setTimeout)...`;
        reminderStatusText.style.color = "#4f46e5";
        cancelReminderBtn.classList.remove('hidden');

        // Schedule notification using setTimeout via ES6 wrapper
        scheduledAlertTimeoutId = scheduleTimeoutAlert(() => {
            playChime();
            showNotification("🔔 Reminder Alert", text);
            reminderStatusText.textContent = `✅ Alert triggered at ${new Date().toLocaleTimeString()}!`;
            reminderStatusText.style.color = "#10b981";
            cancelReminderBtn.classList.add('hidden');
            scheduledAlertTimeoutId = null;
        }, delayMs);
    });

    cancelReminderBtn.addEventListener('click', () => {
        if (scheduledAlertTimeoutId) {
            clearTimeout(scheduledAlertTimeoutId);
            scheduledAlertTimeoutId = null;
            reminderStatusText.textContent = "❌ Scheduled reminder cancelled.";
            reminderStatusText.style.color = "#ef4444";
            cancelReminderBtn.classList.add('hidden');
        }
    });

    // Simulated Real-Time Sync using setTimeout()
    syncScheduleBtn.addEventListener('click', () => {
        syncScheduleBtn.disabled = true;
        const origText = syncScheduleBtn.innerHTML;
        syncScheduleBtn.innerHTML = `<span>⏳</span> Syncing...`;

        // Use setTimeout to simulate network roundtrip / asynchronous schedule reload
        scheduleTimeoutAlert(() => {
            schedule = loadScheduleFromStorage();
            renderTimetable(currentDayFilter);
            updateOngoingClassState(new Date());
            syncScheduleBtn.disabled = false;
            syncScheduleBtn.innerHTML = origText;
            showNotification("🔄 Timetable Synced", "Schedule records refreshed successfully in real-time.");
        }, 800);
    });
}

/**
 * Display a temporary Notification Banner
 * Uses setTimeout() to auto-dismiss after 6 seconds
 */
let bannerDismissTimeoutId = null;
function showNotification(title, message) {
    bannerTitle.textContent = title;
    bannerMessage.textContent = message;
    notificationBanner.classList.remove('hidden');

    if (bannerDismissTimeoutId) {
        clearTimeout(bannerDismissTimeoutId);
    }

    // Auto-dismiss using setTimeout
    bannerDismissTimeoutId = scheduleTimeoutAlert(() => {
        notificationBanner.classList.add('hidden');
    }, 6000);
}

bannerCloseBtn.addEventListener('click', () => {
    notificationBanner.classList.add('hidden');
    if (bannerDismissTimeoutId) clearTimeout(bannerDismissTimeoutId);
});

/**
 * Quick Timer Presets (+1 min, +5 min, +15 min, etc.)
 */
function setupPresetControls() {
    presetButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const minutes = parseInt(btn.getAttribute('data-minutes'), 10);
            const targetTime = new Date(Date.now() + minutes * 60 * 1000);

            isCustomCountdown = true;
            isCountdownPaused = false;
            pauseCountdownBtn.textContent = "⏸️ Pause";
            activeTarget = {
                name: `Custom Timer (+${minutes} Min)`,
                date: targetTime
            };

            showNotification("⏱️ Timer Started", `Countdown set for ${minutes} minute(s) from now.`);
        });
    });

    // Pause / Resume Countdown
    pauseCountdownBtn.addEventListener('click', () => {
        if (!activeTarget || !activeTarget.date) return;

        if (!isCountdownPaused) {
            // Pause
            isCountdownPaused = true;
            pausedRemainingMs = new Date(activeTarget.date).getTime() - Date.now();
            pauseCountdownBtn.textContent = "▶️ Resume";
            showNotification("⏸️ Timer Paused", "The countdown has been paused.");
        } else {
            // Resume
            isCountdownPaused = false;
            activeTarget.date = new Date(Date.now() + pausedRemainingMs);
            pauseCountdownBtn.textContent = "⏸️ Pause";
            showNotification("▶️ Timer Resumed", "The countdown has resumed.");
        }
    });

    // Reset Countdown back to Upcoming Class
    resetCountdownBtn.addEventListener('click', () => {
        isCustomCountdown = false;
        isCountdownPaused = false;
        pauseCountdownBtn.textContent = "⏸️ Pause";
        updateOngoingClassState(new Date());
        showNotification("🔄 Reset to Schedule", "Countdown now tracking the next upcoming lecture.");
    });
}

/**
 * Render the timetable grid with current filter
 */
function renderTimetable(dayFilter = 'all') {
    currentDayFilter = dayFilter;
    classesGridEl.innerHTML = '';

    const filtered = dayFilter === 'all' 
        ? schedule 
        : schedule.filter(item => item.day.toLowerCase() === dayFilter.toLowerCase());

    if (filtered.length === 0) {
        classesGridEl.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #64748b;">
                No classes scheduled for <strong>${dayFilter}</strong>.
            </div>
        `;
        return;
    }

    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = `class-card border-${item.color || 'blue'}`;

        card.innerHTML = `
            <div class="class-top">
                <span class="class-day-tag">${item.day}</span>
                <span class="class-code">${item.code}</span>
            </div>
            <h4 class="class-subject">${item.subject}</h4>
            <div class="class-details">
                <div>👨‍🏫 <strong>Instructor:</strong> ${item.instructor}</div>
                <div>📍 <strong>Location:</strong> ${item.room}</div>
            </div>
            <div class="class-footer">
                <div class="class-time">⏰ ${formatTime12Hour(item.startTime)} - ${formatTime12Hour(item.endTime)}</div>
                <button type="button" class="btn-set-countdown" data-id="${item.id}">
                    🎯 Set Target
                </button>
            </div>
        `;

        // Button to set this specific class as the active countdown target
        card.querySelector('.btn-set-countdown').addEventListener('click', () => {
            setCountdownForClass(item);
        });

        classesGridEl.appendChild(card);
    });
}

/**
 * Set a specific class from the schedule as the countdown hero target
 */
function setCountdownForClass(item) {
    const now = new Date();
    const currentDayIndex = now.getDay();
    const itemDayIndex = DAYS_OF_WEEK.indexOf(item.day);
    const [startH, startM] = item.startTime.split(':').map(Number);
    const currentTotalMin = now.getHours() * 60 + now.getMinutes();
    const startTotalMin = startH * 60 + startM;

    let daysUntil = (itemDayIndex - currentDayIndex + 7) % 7;
    if (daysUntil === 0 && startTotalMin <= currentTotalMin) {
        daysUntil = 7;
    }

    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + daysUntil);
    targetDate.setHours(startH, startM, 0, 0);

    isCustomCountdown = true;
    isCountdownPaused = false;
    pauseCountdownBtn.textContent = "⏸️ Pause";

    activeTarget = {
        name: `${item.subject} (${item.code})`,
        date: targetDate
    };

    showNotification("🎯 Target Set", `Countdown tracking ${item.subject} on ${item.day} at ${formatTime12Hour(item.startTime)}.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Setup Day filter pills
 */
function setupDayFilters() {
    dayFilterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            dayFilterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            renderTimetable(pill.getAttribute('data-day'));
        });
    });
}

/**
 * Add Class Modal Form Handling
 */
function setupAddClassModal() {
    const openModal = () => addClassModal.classList.remove('hidden');
    const closeModal = () => {
        addClassModal.classList.add('hidden');
        addClassForm.reset();
    };

    openAddModalBtn.addEventListener('click', openModal);
    closeAddModalBtn.addEventListener('click', closeModal);
    cancelAddBtn.addEventListener('click', closeModal);

    addClassForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const subject = document.getElementById('subjectInput').value.trim();
        const code = document.getElementById('codeInput').value.trim();
        const instructor = document.getElementById('instructorInput').value.trim();
        const room = document.getElementById('roomInput').value.trim();
        const day = document.getElementById('dayInput').value;
        const startTime = document.getElementById('startTimeInput').value;
        const endTime = document.getElementById('endTimeInput').value;
        const color = document.getElementById('colorInput').value;

        if (!subject || !startTime || !endTime) {
            alert("Please fill in the required fields (Subject, Start & End Time).");
            return;
        }

        const newClass = {
            id: `CLS-${Date.now().toString().slice(-4)}`,
            subject,
            code: code || "CS-GEN",
            instructor: instructor || "Faculty Member",
            room: room || "Main Hall",
            day,
            startTime,
            endTime,
            color
        };

        schedule.push(newClass);
        saveScheduleToStorage();
        renderTimetable(currentDayFilter);
        updateOngoingClassState(new Date());

        closeModal();
        showNotification("🎉 Class Added", `"${subject}" added to timetable on ${day}.`);
    });
}

// Global Initialization
document.addEventListener('DOMContentLoaded', () => {
    initRealtimeClock();
    initCountdownTimer();
    setupReminderTools();
    setupPresetControls();
    setupDayFilters();
    setupAddClassModal();
    renderTimetable('all');
});
