'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { WorkoutSummary } from '@/types/workout';
import { formatSeconds } from '@/lib/time-utils';
import { Timer, Activity, Zap, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkoutSummaryDisplayProps {
  summary: WorkoutSummary;
  className?: string;
}

export function WorkoutSummaryDisplay({ summary, className }: WorkoutSummaryDisplayProps) {
  const summaryItems = [
    {
      icon: Activity,
      label: '러닝 합계',
      value: summary.runningTotal,
      color: 'text-blue-500'
    },
    {
      icon: Timer,
      label: '스테이션 합계',
      value: summary.stationTotal,
      color: 'text-green-500'
    },
    {
      icon: Zap,
      label: '록스존',
      value: summary.roxzoneTime,
      color: 'text-orange-500'
    }
  ];

  return (
    <div className={cn('space-y-4', className)}>
      {/* Overall Total - Prominent Display */}
      <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary p-3">
                <Trophy className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">총 합계</p>
                <p className="text-4xl font-bold tabular-nums">
                  {formatSeconds(summary.overallTotal)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Summaries */}
      <div className="grid gap-3">
        {summaryItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className={cn('h-5 w-5', item.color)} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <span className="text-2xl font-bold tabular-nums">
                    {formatSeconds(item.value)}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
