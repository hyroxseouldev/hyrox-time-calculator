"use client";

import * as React from "react";
import {
  WorkoutCalculator,
  WorkoutCalculatorRef,
} from "@/components/workout-calculator";
import { ThemeToggle } from "@/components/theme-toggle";
import { ImageUpload } from "@/components/image-upload";
import { WorkoutOCRResult } from "@/lib/workout-ocr";
import { Dumbbell } from "lucide-react";

export default function Home() {
  const calculatorRef = React.useRef<WorkoutCalculatorRef>(null);

  const handleDataExtracted = (data: WorkoutOCRResult) => {
    calculatorRef.current?.fillFromOCR(data);
  };

  return (
    <div className="min-h-screen bg-background w-full flex flex-col">
      {/* Header */}
      <header className="w-full flex items-center justify-between container max-w-screen-md mx-auto">
        <div className="flex h-14 items-center justify-between px-4 w-full">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold">Xtreame + ON</h1>
          </div>
          <div className="flex items-center gap-2">
            <ImageUpload onDataExtracted={handleDataExtracted} />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container max-w-screen-md mx-auto px-4 py-6 pb-20">
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">
              HYROX SIMULATION SCORE CARD
            </h2>
            <p className="text-muted-foreground">
              각 운동별 시간을 입력하면 자동으로 합계가 계산됩니다
            </p>
          </div>

          <WorkoutCalculator ref={calculatorRef} />
        </div>
      </main>

      {/* Footer - Fixed at bottom */}
      <footer className="w-full border-t bg-background fixed bottom-0 left-0 right-0">
        <div className="container max-w-screen-md mx-auto px-4 py-3">
          <p className="text-center text-sm text-muted-foreground">
            이 프로젝트는{" "}
            <a
              href="https://instagram.com/kxxclear"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              @kxxclear
            </a>{" "}
            그리고{" "}
            <a
              href="https://instagram.com/xon_training"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              @xon_training
            </a>{" "}
            과 함께 합니다.
          </p>
        </div>
      </footer>
    </div>
  );
}
