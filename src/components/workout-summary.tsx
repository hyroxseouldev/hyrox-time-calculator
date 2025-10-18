"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { WorkoutSummary } from "@/types/workout";
import { formatSeconds } from "@/lib/time-utils";
import { Timer, Activity, Zap, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkoutSummaryDisplayProps {
  summary: WorkoutSummary;
  className?: string;
}

export function WorkoutSummaryDisplay({
  summary,
  className,
}: WorkoutSummaryDisplayProps) {
  const summaryItems = [
    {
      icon: Activity,
      label: "러닝 합계",
      value: summary.runningTotal,
      color: "text-blue-500",
    },
    {
      icon: Timer,
      label: "스테이션 합계",
      value: summary.stationTotal,
      color: "text-green-500",
    },
    {
      icon: Zap,
      label: "록스존",
      value: summary.roxzoneTime,
      color: "text-orange-500",
    },
  ];

  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      {/* Individual Summaries */}
      {summaryItems.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label}>
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-col items-center text-center gap-2">
                <Icon className={cn("h-5 w-5", item.color)} />
                <span className="text-xs font-medium text-muted-foreground">
                  {item.label}
                </span>
                <span className="text-xl font-bold tabular-nums">
                  {formatSeconds(item.value)}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Overall Total - Spans 1 columns */}
      <Card className="col-span-1 border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="rounded-full bg-primary p-2">
              <Trophy className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              총 합계
            </span>
            <span className="text-3xl font-bold tabular-nums">
              {formatSeconds(summary.overallTotal)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
