'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TimeInput } from './time-input';
import { WorkoutEntry, ExerciseType, EXERCISE_LABELS } from '@/types/workout';
import { emptyTime } from '@/lib/time-utils';
import { Trash2 } from 'lucide-react';

interface ExerciseEntryProps {
  entry: WorkoutEntry;
  onChange: (entry: WorkoutEntry) => void;
  onRemove?: () => void;
  showRemove?: boolean;
}

export function ExerciseEntry({
  entry,
  onChange,
  onRemove,
  showRemove = false
}: ExerciseEntryProps) {
  const label = EXERCISE_LABELS[entry.exercise];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <TimeInput
              label={label}
              value={entry.time}
              onChange={(time) => onChange({ ...entry, time })}
            />
          </div>
          {showRemove && onRemove && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="mt-8 shrink-0"
              aria-label={`${label} 제거`}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface ExerciseGroupProps {
  exercise: ExerciseType;
  entries: WorkoutEntry[];
  onChange: (entries: WorkoutEntry[]) => void;
  allowMultiple?: boolean;
}

export function ExerciseGroup({
  exercise,
  entries,
  onChange,
  allowMultiple = false
}: ExerciseGroupProps) {
  const label = EXERCISE_LABELS[exercise];

  const handleAdd = () => {
    const newEntry: WorkoutEntry = {
      id: `${exercise}-${Date.now()}`,
      exercise,
      time: emptyTime()
    };
    onChange([...entries, newEntry]);
  };

  const handleRemove = (id: string) => {
    onChange(entries.filter((e) => e.id !== id));
  };

  const handleChange = (id: string, updatedEntry: WorkoutEntry) => {
    onChange(entries.map((e) => (e.id === id ? updatedEntry : e)));
  };

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <ExerciseEntry
          key={entry.id}
          entry={entry}
          onChange={(updated) => handleChange(entry.id, updated)}
          onRemove={() => handleRemove(entry.id)}
          showRemove={allowMultiple && entries.length > 1}
        />
      ))}

      {allowMultiple && (
        <Button
          variant="outline"
          onClick={handleAdd}
          className="w-full"
          type="button"
        >
          + {label} 라운드 추가
        </Button>
      )}
    </div>
  );
}
