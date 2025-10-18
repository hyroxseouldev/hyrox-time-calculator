import { WorkoutEntry, WorkoutSummary, STATION_EXERCISES, StationExercise } from '@/types/workout';
import { timeToSeconds } from './time-utils';

/**
 * Calculate workout summary from entries
 */
export function calculateWorkoutSummary(
  entries: WorkoutEntry[],
  roxzoneSeconds: number
): WorkoutSummary {
  let runningTotal = 0;
  let stationTotal = 0;

  entries.forEach((entry) => {
    const seconds = timeToSeconds(entry.time);

    if (entry.exercise === 'running') {
      runningTotal += seconds;
    } else if (STATION_EXERCISES.includes(entry.exercise as StationExercise)) {
      stationTotal += seconds;
    }
  });

  const overallTotal = runningTotal + stationTotal + roxzoneSeconds;

  return {
    runningTotal,
    stationTotal,
    roxzoneTime: roxzoneSeconds,
    overallTotal
  };
}
