import { TimeEntry } from '@/types/workout';

/**
 * Convert TimeEntry to total seconds
 */
export function timeToSeconds(time: TimeEntry): number {
  return time.minutes * 60 + time.seconds;
}

/**
 * Convert total seconds to TimeEntry
 */
export function secondsToTime(totalSeconds: number): TimeEntry {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return { minutes, seconds };
}

/**
 * Format time as MM:SS string
 */
export function formatTime(time: TimeEntry): string {
  const mins = String(time.minutes).padStart(2, '0');
  const secs = String(time.seconds).padStart(2, '0');
  return `${mins}:${secs}`;
}

/**
 * Format seconds as MM:SS string
 */
export function formatSeconds(totalSeconds: number): string {
  return formatTime(secondsToTime(totalSeconds));
}

/**
 * Parse MM:SS string to TimeEntry
 * Returns null if invalid format
 */
export function parseTimeString(timeStr: string): TimeEntry | null {
  const cleanStr = timeStr.trim();

  // Match MM:SS or M:SS format
  const match = cleanStr.match(/^(\d{1,2}):(\d{2})$/);

  if (!match) {
    return null;
  }

  const minutes = parseInt(match[1], 10);
  const seconds = parseInt(match[2], 10);

  // Validate seconds range
  if (seconds >= 60 || seconds < 0 || minutes < 0) {
    return null;
  }

  return { minutes, seconds };
}

/**
 * Validate time entry
 */
export function isValidTime(time: TimeEntry): boolean {
  return (
    Number.isInteger(time.minutes) &&
    Number.isInteger(time.seconds) &&
    time.minutes >= 0 &&
    time.seconds >= 0 &&
    time.seconds < 60
  );
}

/**
 * Create empty time entry
 */
export function emptyTime(): TimeEntry {
  return { minutes: 0, seconds: 0 };
}
