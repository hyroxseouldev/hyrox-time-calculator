'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TimeEntry } from '@/types/workout';
import { formatTime, parseTimeString } from '@/lib/time-utils';
import { cn } from '@/lib/utils';

interface TimeInputProps {
  label: string;
  value: TimeEntry;
  onChange: (time: TimeEntry) => void;
  className?: string;
  error?: string;
}

export function TimeInput({ label, value, onChange, className, error }: TimeInputProps) {
  const [inputValue, setInputValue] = React.useState(formatTime(value));
  const [isFocused, setIsFocused] = React.useState(false);

  React.useEffect(() => {
    if (!isFocused) {
      setInputValue(formatTime(value));
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    const parsed = parseTimeString(newValue);
    if (parsed) {
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Reformat to standard format on blur
    const parsed = parseTimeString(inputValue);
    if (parsed) {
      setInputValue(formatTime(parsed));
    } else {
      // Reset to previous valid value
      setInputValue(formatTime(value));
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={label} className="text-base font-medium">
        {label}
      </Label>
      <Input
        id={label}
        type="text"
        inputMode="numeric"
        pattern="[0-9:]*"
        placeholder="00:00"
        value={inputValue}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        className={cn(
          'text-lg h-12 text-center font-mono',
          error && 'border-destructive'
        )}
        aria-label={label}
        aria-invalid={!!error}
      />
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <p className="text-xs text-muted-foreground text-center">MM:SS 형식</p>
    </div>
  );
}
