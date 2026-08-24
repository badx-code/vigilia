import { ScheduleMoment, VigiliaConfig } from '../types';

/**
 * Converts HH:mm string to minutes from 00:00 (0 to 1439)
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

/**
 * Converts total minutes from 00:00 to HH:mm string (00:00 to 23:59)
 */
export function minutesToTime(minutes: number): string {
  // Normalize negative or oversized minutes into 0-1439 range
  let norm = minutes % 1440;
  if (norm < 0) norm += 1440;
  const h = Math.floor(norm / 60);
  const m = Math.floor(norm % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Normalizes minutes for an overnight vigil starting at vigilStartMinutes.
 * E.g., if vigil starts at 21:00 (1260 min), 01:30 (90 min) becomes 90 + 1440 = 1530 min.
 */
export function normalizeVigilMinutes(minutes: number, vigilStartMinutes: number = 21 * 60): number {
  // If the time is before 12:00 PM (720 min) and the vigil started in the evening (> 12:00 PM), it's next day.
  if (minutes < 720 && vigilStartMinutes >= 720) {
    return minutes + 1440;
  }
  return minutes;
}

/**
 * Calculates duration in minutes between two HH:mm strings (overnight aware)
 */
export function calculateDurationMinutes(
  startTimeStr: string,
  endTimeStr: string,
  vigilStartTimeStr: string = '21:00'
): number {
  const startM = timeToMinutes(startTimeStr);
  const endM = timeToMinutes(endTimeStr);
  const vigilStartM = timeToMinutes(vigilStartTimeStr);

  const normStart = normalizeVigilMinutes(startM, vigilStartM);
  let normEnd = normalizeVigilMinutes(endM, vigilStartM);

  if (normEnd <= normStart) {
    normEnd += 1440;
  }

  return Math.max(1, normEnd - normStart);
}

/**
 * Adds minutes to an HH:mm string safely handling 24h wraps
 */
export function addMinutesToTime(timeStr: string, minutesToAdd: number): string {
  const currentM = timeToMinutes(timeStr);
  return minutesToTime(currentM + minutesToAdd);
}

/**
 * Recalculates all moments in the schedule by applying a delay in minutes.
 * Preserves the exact duration of each moment while cascading updated start and end times.
 */
export function recalculateScheduleWithDelay(
  moments: ScheduleMoment[],
  delayMinutes: number,
  vigilStartTimeStr: string = '21:00'
): ScheduleMoment[] {
  if (!moments || moments.length === 0) return [];

  const vigilStartM = timeToMinutes(vigilStartTimeStr);

  // Sort moments chronologically based on original times
  const sorted = [...moments].map((m) => {
    const origStart = m.originalStartTime || m.startTime;
    const origEnd = m.originalEndTime || m.endTime;
    const duration = calculateDurationMinutes(origStart, origEnd, vigilStartTimeStr);
    return {
      ...m,
      originalStartTime: origStart,
      originalEndTime: origEnd,
      _duration: duration,
      _normStart: normalizeVigilMinutes(timeToMinutes(origStart), vigilStartM),
    };
  }).sort((a, b) => a._normStart - b._normStart);

  if (delayMinutes === 0) {
    // Return original times
    return sorted.map((m) => {
      const { _duration, _normStart, ...rest } = m;
      return {
        ...rest,
        startTime: rest.originalStartTime || rest.startTime,
        endTime: rest.originalEndTime || rest.endTime,
      };
    });
  }

  // Cascade with delay
  let currentStartMinutes = normalizeVigilMinutes(timeToMinutes(sorted[0].originalStartTime || sorted[0].startTime), vigilStartM) + delayMinutes;

  return sorted.map((m) => {
    const newStart = minutesToTime(currentStartMinutes);
    const newEnd = minutesToTime(currentStartMinutes + m._duration);
    currentStartMinutes += m._duration;

    const { _duration, _normStart, ...rest } = m;
    return {
      ...rest,
      startTime: newStart,
      endTime: newEnd,
    };
  });
}

export interface CurrentMomentStatus {
  activeMoment: ScheduleMoment | null;
  nextMoment: ScheduleMoment | null;
  upcomingMoments: ScheduleMoment[];
  previousMoment: ScheduleMoment | null;
  progressPercent: number; // 0 to 100
  minutesRemaining: number;
  totalDurationMinutes: number;
  isBeforeVigil: boolean;
  isAfterVigil: boolean;
  currentIndex: number;
}

export function getCurrentMomentStatus(
  moments: ScheduleMoment[],
  currentTimeStr: string,
  vigilStartTimeStr: string = '21:00',
  vigilEndTimeStr: string = '05:00'
): CurrentMomentStatus {
  if (!moments || moments.length === 0) {
    return {
      activeMoment: null,
      nextMoment: null,
      upcomingMoments: [],
      previousMoment: null,
      progressPercent: 0,
      minutesRemaining: 0,
      totalDurationMinutes: 0,
      isBeforeVigil: false,
      isAfterVigil: false,
      currentIndex: -1,
    };
  }

  const vigilStartM = timeToMinutes(vigilStartTimeStr);
  const vigilEndM = timeToMinutes(vigilEndTimeStr);
  const normVigilStart = normalizeVigilMinutes(vigilStartM, vigilStartM);
  const normVigilEnd = normalizeVigilMinutes(vigilEndM, vigilStartM);

  const currentM = timeToMinutes(currentTimeStr);
  const normCurrent = normalizeVigilMinutes(currentM, vigilStartM);

  const isBefore = normCurrent < normVigilStart;
  const isAfter = normCurrent >= normVigilEnd;

  // Sort moments chronologically according to vigil normalized time
  const sorted = [...moments].sort((a, b) => {
    const na = normalizeVigilMinutes(timeToMinutes(a.startTime), vigilStartM);
    const nb = normalizeVigilMinutes(timeToMinutes(b.startTime), vigilStartM);
    return na - nb;
  });

  let activeMoment: ScheduleMoment | null = null;
  let nextMoment: ScheduleMoment | null = null;
  let previousMoment: ScheduleMoment | null = null;
  const upcomingMoments: ScheduleMoment[] = [];
  let progressPercent = 0;
  let minutesRemaining = 0;
  let totalDurationMinutes = 0;
  let currentIndex = -1;

  for (let i = 0; i < sorted.length; i++) {
    const m = sorted[i];
    const mStart = normalizeVigilMinutes(timeToMinutes(m.startTime), vigilStartM);
    const mEnd = normalizeVigilMinutes(timeToMinutes(m.endTime), vigilStartM);

    if (normCurrent >= mStart && normCurrent < mEnd) {
      activeMoment = m;
      currentIndex = i;
      previousMoment = i > 0 ? sorted[i - 1] : null;
      totalDurationMinutes = Math.max(1, mEnd - mStart);
      const elapsed = normCurrent - mStart;
      progressPercent = Math.min(100, Math.max(0, Math.round((elapsed / totalDurationMinutes) * 100)));
      minutesRemaining = Math.max(0, mEnd - normCurrent);
      nextMoment = sorted[i + 1] || null;

      // Fill next 2-3 upcoming moments
      for (let j = i + 1; j < Math.min(sorted.length, i + 4); j++) {
        upcomingMoments.push(sorted[j]);
      }
      break;
    }

    if (normCurrent < mStart && !nextMoment) {
      nextMoment = m;
      for (let j = i; j < Math.min(sorted.length, i + 3); j++) {
        upcomingMoments.push(sorted[j]);
      }
    }
  }

  // If no active moment was found, pick nearest upcoming
  if (!activeMoment && sorted.length > 0) {
    for (let i = 0; i < sorted.length; i++) {
      const mStart = normalizeVigilMinutes(timeToMinutes(sorted[i].startTime), vigilStartM);
      if (normCurrent < mStart) {
        nextMoment = sorted[i];
        currentIndex = i - 1;
        previousMoment = i > 0 ? sorted[i - 1] : null;
        for (let j = i; j < Math.min(sorted.length, i + 3); j++) {
          if (!upcomingMoments.includes(sorted[j])) {
            upcomingMoments.push(sorted[j]);
          }
        }
        break;
      }
    }
  }

  return {
    activeMoment,
    nextMoment,
    upcomingMoments,
    previousMoment,
    progressPercent,
    minutesRemaining,
    totalDurationMinutes,
    isBeforeVigil: isBefore,
    isAfterVigil: isAfter,
    currentIndex,
  };
}

export function formatCountdown(targetDateStr: string, targetTimeStr: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  totalSeconds: number;
} {
  try {
    const targetDateTime = new Date(`${targetDateStr}T${targetTimeStr}:00`);
    const now = new Date();
    const diffMs = targetDateTime.getTime() - now.getTime();

    if (diffMs <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true, totalSeconds: 0 };
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { days, hours, minutes, seconds, isPast: false, totalSeconds };
  } catch {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true, totalSeconds: 0 };
  }
}

/**
 * Checks if the vigil should display the Waiting Room Screen
 */
export function isVigilInWaitingMode(config: VigiliaConfig): boolean {
  if (config.waitingMode === 'always') return true;
  if (config.waitingMode === 'disabled') return false;

  // Auto mode: check if target date/time is in the future
  const countdown = formatCountdown(config.date, config.startTime);
  return !countdown.isPast;
}

/**
 * Calculates duration in hours between start and end time (overnight aware)
 */
export function calculateVigilDurationHours(startTime: string = '21:00', endTime: string = '05:00'): number {
  const startM = timeToMinutes(startTime);
  const endM = timeToMinutes(endTime);
  const normEnd = normalizeVigilMinutes(endM, startM);
  const diffMinutes = Math.max(0, normEnd - startM);
  return Math.round((diffMinutes / 60) * 10) / 10;
}

/**
 * Formats full human-readable date in Portuguese
 */
export function formatFullDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-');
    const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
    return dateObj.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Generates Google Calendar Web Link
 */
export function getGoogleCalendarUrl(config: VigiliaConfig): string {
  try {
    const startDateClean = config.date.replace(/-/g, '');
    const startTimeClean = config.startTime.replace(/:/g, '') + '00';

    // Calculate end date
    const [sh, sm] = config.startTime.split(':').map(Number);
    const [eh, em] = config.endTime.split(':').map(Number);
    const isOvernight = eh < sh || (eh === sh && em < sm);

    let endDateClean = startDateClean;
    if (isOvernight) {
      const [y, m, d] = config.date.split('-').map(Number);
      const nextDay = new Date(y, m - 1, d + 1);
      const ny = nextDay.getFullYear();
      const nm = String(nextDay.getMonth() + 1).padStart(2, '0');
      const nd = String(nextDay.getDate()).padStart(2, '0');
      endDateClean = `${ny}${nm}${nd}`;
    }
    const endTimeClean = config.endTime.replace(/:/g, '') + '00';

    const dates = `${startDateClean}T${startTimeClean}/${endDateClean}T${endTimeClean}`;
    const text = encodeURIComponent(config.vigilName || 'Vigília de Oração');
    const details = encodeURIComponent(
      `${config.theme || ''}\n\nTema: "${config.keyVerse}" (${config.verseReference})\n\nLocal: ${config.location}, ${config.city}\n\nCódigo do Membro: ${config.memberCode || config.accessCode}`
    );
    const location = encodeURIComponent(`${config.location}, ${config.city}`);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${location}`;
  } catch {
    return '#';
  }
}

/**
 * Downloads .ics calendar file for Apple/Outlook/Android
 */
export function downloadIcsFile(config: VigiliaConfig): void {
  try {
    const startDateClean = config.date.replace(/-/g, '');
    const startTimeClean = config.startTime.replace(/:/g, '') + '00';

    const [sh, sm] = config.startTime.split(':').map(Number);
    const [eh, em] = config.endTime.split(':').map(Number);
    const isOvernight = eh < sh || (eh === sh && em < sm);

    let endDateClean = startDateClean;
    if (isOvernight) {
      const [y, m, d] = config.date.split('-').map(Number);
      const nextDay = new Date(y, m - 1, d + 1);
      const ny = nextDay.getFullYear();
      const nm = String(nextDay.getMonth() + 1).padStart(2, '0');
      const nd = String(nextDay.getDate()).padStart(2, '0');
      endDateClean = `${ny}${nm}${nd}`;
    }
    const endTimeClean = config.endTime.replace(/:/g, '') + '00';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Vigilia Planner//PT-BR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:vigilia-${config.accessCode}-${Date.now()}@vigilia.app`,
      `DTSTAMP:${startDateClean}T000000Z`,
      `DTSTART:${startDateClean}T${startTimeClean}`,
      `DTEND:${endDateClean}T${endTimeClean}`,
      `SUMMARY:${config.vigilName || 'Vigília de Oração'}`,
      `DESCRIPTION:${config.theme || ''} - "${config.keyVerse}" (${config.verseReference})`,
      `LOCATION:${config.location}, ${config.city}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `vigilia-${(config.memberCode || config.accessCode).toLowerCase()}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (e) {
    console.error('Error creating ics file:', e);
  }
}
