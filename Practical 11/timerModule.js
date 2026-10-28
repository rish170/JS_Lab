/**
 * Practical 11: ES6 Module - timerModule.js
 * 
 * Demonstrates:
 * 1. ES6 Modules: 'export' of constants, utility functions, and timer wrappers
 * 2. JavaScript Timers: setInterval() and setTimeout() abstraction
 */

// Default timetable data for university lectures & labs
export const defaultSchedule = [
    {
        id: "CLS-101",
        subject: "JavaScript Programming Lab",
        code: "CS-504P",
        instructor: "Prof. Vikram Malhotra",
        room: "Lab 3B (Computing Hub)",
        day: "Monday",
        startTime: "09:00",
        endTime: "11:00",
        color: "blue"
    },
    {
        id: "CLS-102",
        subject: "Data Structures & Algorithms",
        code: "CS-501",
        instructor: "Dr. Ananya Sen",
        room: "Room 402, Block A",
        day: "Monday",
        startTime: "11:30",
        endTime: "13:00",
        color: "purple"
    },
    {
        id: "CLS-103",
        subject: "Operating Systems",
        code: "CS-502",
        instructor: "Dr. Rajesh Iyer",
        room: "Room 305, Block B",
        day: "Tuesday",
        startTime: "10:00",
        endTime: "11:30",
        color: "emerald"
    },
    {
        id: "CLS-104",
        subject: "Computer Networks & Security",
        code: "CS-503",
        instructor: "Prof. Sneha Deshmukh",
        room: "Room 201, Block C",
        day: "Tuesday",
        startTime: "13:30",
        endTime: "15:00",
        color: "amber"
    },
    {
        id: "CLS-105",
        subject: "Web Development & ES6 Frameworks",
        code: "CS-505",
        instructor: "Prof. Vikram Malhotra",
        room: "Lab 2A (Software Lab)",
        day: "Wednesday",
        startTime: "09:30",
        endTime: "12:00",
        color: "indigo"
    },
    {
        id: "CLS-106",
        subject: "Artificial Intelligence & ML",
        code: "CS-506",
        instructor: "Dr. Kabir Roy",
        room: "Seminar Hall 1",
        day: "Wednesday",
        startTime: "14:00",
        endTime: "15:30",
        color: "rose"
    },
    {
        id: "CLS-107",
        subject: "Database Management Systems",
        code: "CS-507",
        instructor: "Prof. Priya Nair",
        room: "Room 104, Block A",
        day: "Thursday",
        startTime: "10:30",
        endTime: "12:30",
        color: "cyan"
    },
    {
        id: "CLS-108",
        subject: "Cloud Computing & DevOps",
        code: "CS-508",
        instructor: "Mr. Arjun Mehta",
        room: "Lab 1 (Cloud Center)",
        day: "Friday",
        startTime: "11:00",
        endTime: "13:00",
        color: "teal"
    }
];

export const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Utility: Pads a single digit number with a leading zero
 * @param {number} num 
 * @returns {string}
 */
export function formatTwoDigits(num) {
    return num.toString().padStart(2, '0');
}

/**
 * Utility: Converts 24-hour time "14:30" to 12-hour format "02:30 PM"
 * @param {string} time24 
 * @returns {string}
 */
export function formatTime12Hour(time24) {
    if (!time24) return "";
    const [hoursStr, minutesStr] = time24.split(":");
    let hours = parseInt(hoursStr, 10);
    const minutes = minutesStr;
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 becomes 12
    return `${formatTwoDigits(hours)}:${minutes} ${ampm}`;
}

/**
 * Utility: Calculates time difference (countdown breakdown) to a future target timestamp
 * @param {Date|number} targetDate 
 * @returns {Object} { totalMs, days, hours, minutes, seconds, isExpired }
 */
export function calculateCountdown(targetDate) {
    const targetMs = new Date(targetDate).getTime();
    const nowMs = Date.now();
    const diffMs = targetMs - nowMs;

    if (diffMs <= 0) {
        return {
            totalMs: 0,
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            isExpired: true
        };
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
        totalMs: diffMs,
        days,
        hours,
        minutes,
        seconds,
        isExpired: false
    };
}

/**
 * Evaluates current schedule and returns the active ongoing class (if any)
 * and the next upcoming class, including its scheduled Date object.
 * @param {Array} schedule 
 * @param {Date} now 
 * @returns {Object} { ongoingClass, nextClass, nextClassDate, classProgressPercent }
 */
export function getCurrentAndNextClass(schedule, now = new Date()) {
    const currentDayIndex = now.getDay();
    const currentDayName = DAYS_OF_WEEK[currentDayIndex];
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTotalMinutes = currentHours * 60 + currentMinutes;

    let ongoingClass = null;
    let classProgressPercent = 0;
    let candidateClasses = [];

    // Evaluate all classes to find timestamps relative to current week
    schedule.forEach(item => {
        const itemDayIndex = DAYS_OF_WEEK.indexOf(item.day);
        if (itemDayIndex === -1) return;

        const [startH, startM] = item.startTime.split(':').map(Number);
        const [endH, endM] = item.endTime.split(':').map(Number);
        const startTotalMin = startH * 60 + startM;
        const endTotalMin = endH * 60 + endM;

        // Check if currently ongoing on the same day
        if (item.day === currentDayName) {
            if (currentTotalMinutes >= startTotalMin && currentTotalMinutes < endTotalMin) {
                ongoingClass = item;
                const totalDuration = endTotalMin - startTotalMin;
                const elapsed = currentTotalMinutes - startTotalMin;
                classProgressPercent = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
            }
        }

        // Calculate next occurrence date of this class
        let daysUntil = (itemDayIndex - currentDayIndex + 7) % 7;
        if (daysUntil === 0 && startTotalMin <= currentTotalMinutes) {
            // Already passed today, next occurrence is in 7 days
            daysUntil = 7;
        }

        const classDate = new Date(now);
        classDate.setDate(now.getDate() + daysUntil);
        classDate.setHours(startH, startM, 0, 0);

        candidateClasses.push({
            classItem: item,
            date: classDate,
            diffMs: classDate.getTime() - now.getTime()
        });
    });

    // Sort future classes by earliest date
    candidateClasses.sort((a, b) => a.diffMs - b.diffMs);

    const nextUpcoming = candidateClasses.length > 0 ? candidateClasses[0] : null;

    return {
        ongoingClass,
        classProgressPercent,
        nextClass: nextUpcoming ? nextUpcoming.classItem : null,
        nextClassDate: nextUpcoming ? nextUpcoming.date : null
    };
}

/**
 * JavaScript Timer: Wrapper for setInterval()
 * Runs a callback repeatedly at the given interval with error safety.
 * @param {Function} callback 
 * @param {number} intervalMs 
 * @returns {number} Timer ID for clearInterval()
 */
export function createIntervalTimer(callback, intervalMs = 1000) {
    if (typeof callback !== 'function') {
        throw new TypeError("callback must be a function");
    }
    return setInterval(callback, intervalMs);
}

/**
 * JavaScript Timer: Wrapper for setTimeout()
 * Schedules a one-time callback after a delay with visual or sound trigger.
 * @param {Function} callback 
 * @param {number} delayMs 
 * @returns {number} Timer ID for clearTimeout()
 */
export function scheduleTimeoutAlert(callback, delayMs) {
    if (typeof callback !== 'function') {
        throw new TypeError("callback must be a function");
    }
    return setTimeout(callback, delayMs);
}

/**
 * Uses Web Audio API to play a gentle notification chime without external mp3 files.
 */
export function playChime() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        
        // Two-tone cheerful chime
        const playTone = (freq, start, duration) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
            gain.gain.setValueAtTime(0.15, ctx.currentTime + start);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + start);
            osc.stop(ctx.currentTime + start + duration);
        };

        playTone(587.33, 0.0, 0.25); // D5
        playTone(880.00, 0.15, 0.4);  // A5
    } catch (e) {
        console.log("Audio alert playback skipped:", e);
    }
}
