'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExerciseGroup } from './exercise-entry';
import { TimeInput } from './time-input';
import { WorkoutSummaryDisplay } from './workout-summary';
import { WorkoutEntry, STATION_EXERCISES } from '@/types/workout';
import { calculateWorkoutSummary } from '@/lib/workout-calculations';
import { emptyTime, timeToSeconds } from '@/lib/time-utils';

export function WorkoutCalculator() {
  // Running entries (multiple rounds allowed)
  const [runningEntries, setRunningEntries] = React.useState<WorkoutEntry[]>([
    { id: 'running-1', exercise: 'running', time: emptyTime() }
  ]);

  // Station entries (one per station)
  const [stationEntries, setStationEntries] = React.useState<WorkoutEntry[]>(
    STATION_EXERCISES.map((exercise) => ({
      id: `station-${exercise}`,
      exercise,
      time: emptyTime()
    }))
  );

  // Roxzone time
  const [roxzoneTime, setRoxzoneTime] = React.useState(emptyTime());

  // Calculate summary
  const summary = React.useMemo(() => {
    const allEntries = [...runningEntries, ...stationEntries];
    const roxzoneSeconds = timeToSeconds(roxzoneTime);
    return calculateWorkoutSummary(allEntries, roxzoneSeconds);
  }, [runningEntries, stationEntries, roxzoneTime]);

  return (
    <div className="space-y-6">
      {/* Summary - Always visible at top on mobile */}
      <WorkoutSummaryDisplay summary={summary} />

      <Separator />

      {/* Input Sections */}
      <Tabs defaultValue="running" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="running">달리기</TabsTrigger>
          <TabsTrigger value="stations">스테이션</TabsTrigger>
          <TabsTrigger value="roxzone">록스존</TabsTrigger>
        </TabsList>

        {/* Running Tab */}
        <TabsContent value="running" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">달리기 기록</CardTitle>
            </CardHeader>
            <CardContent>
              <ExerciseGroup
                exercise="running"
                entries={runningEntries}
                onChange={setRunningEntries}
                allowMultiple={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stations Tab */}
        <TabsContent value="stations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">스테이션 기록</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {STATION_EXERCISES.map((exercise) => {
                const entry = stationEntries.find((e) => e.exercise === exercise);
                if (!entry) return null;

                return (
                  <ExerciseGroup
                    key={exercise}
                    exercise={exercise}
                    entries={[entry]}
                    onChange={(updated) => {
                      setStationEntries((prev) =>
                        prev.map((e) => (e.exercise === exercise ? updated[0] : e))
                      );
                    }}
                    allowMultiple={false}
                  />
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roxzone Tab */}
        <TabsContent value="roxzone" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">록스존 시간</CardTitle>
            </CardHeader>
            <CardContent>
              <TimeInput
                label="전환 시간 (Roxzone)"
                value={roxzoneTime}
                onChange={setRoxzoneTime}
              />
              <p className="mt-3 text-sm text-muted-foreground">
                운동 간 전환 시간을 입력하세요
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
