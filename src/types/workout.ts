export type StationExercise =
  | 'ski'
  | 'sledPush'
  | 'sledPull'
  | 'burpeeBroadJump'
  | 'rowing'
  | 'farmersCarry'
  | 'sandbagLunges'
  | 'wallBall';

export type ExerciseType = 'running' | StationExercise | 'roxzone';

export interface TimeEntry {
  minutes: number;
  seconds: number;
}

export interface WorkoutEntry {
  id: string;
  exercise: ExerciseType;
  time: TimeEntry;
}

export interface WorkoutSummary {
  runningTotal: number; // in seconds
  stationTotal: number; // in seconds
  roxzoneTime: number; // in seconds
  overallTotal: number; // in seconds
}

export const EXERCISE_LABELS: Record<ExerciseType, string> = {
  running: '달리기',
  ski: '스키 에르그',
  sledPush: '슬레드 푸시',
  sledPull: '슬레드 풀',
  burpeeBroadJump: '버피 브로드 점프',
  rowing: '로잉',
  farmersCarry: '파머스 캐리',
  sandbagLunges: '샌드백 런지',
  wallBall: '월볼',
  roxzone: '록스존'
};

export const STATION_EXERCISES: StationExercise[] = [
  'ski',
  'sledPush',
  'sledPull',
  'burpeeBroadJump',
  'rowing',
  'farmersCarry',
  'sandbagLunges',
  'wallBall'
];
