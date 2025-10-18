import { WorkoutCalculator } from "@/components/workout-calculator";
import { ThemeToggle } from "@/components/theme-toggle";
import { Dumbbell } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background w-full flex flex-col items-center justify-center">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-4 container">
        <div className="flex h-14 items-center justify-between px-4 w-full">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold">HYROX 기록 계산기</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-screen-md px-4 py-6 pb-20">
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">
              운동 기록 입력
            </h2>
            <p className="text-muted-foreground">
              각 운동별 시간을 입력하면 자동으로 합계가 계산됩니다
            </p>
          </div>

          <WorkoutCalculator />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full flex items-center justify-between px-4 container border-t">
        <div className="container px-4 py-3 w-full">
          <p className="text-center text-sm text-muted-foreground">
            모바일에 최적화된 HYROX 운동 기록 계산기
          </p>
        </div>
      </footer>
    </div>
  );
}
