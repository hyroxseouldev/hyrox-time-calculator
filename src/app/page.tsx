"use client";

import * as React from "react";
import Image from "next/image";
import {
  WorkoutCalculator,
  WorkoutCalculatorRef,
} from "@/components/workout-calculator";
import { ThemeToggle } from "@/components/theme-toggle";
import { ImageUpload } from "@/components/image-upload";
import { WorkoutOCRResult } from "@/lib/workout-ocr";
import { Camera } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

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
          <div className="flex items-center gap-3">
            <Image
              src="/xon_logo.webp"
              alt="XON Logo"
              width={40}
              height={40}
              className="object-contain rounded-full"
            />
            <h1 className="text-lg font-bold">Xtreame + ON</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <SignedIn>
              <UserButton />
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal" withSignUp={false}>
                <Button variant="default">
                  <span>로그인</span>
                </Button>
              </SignInButton>
            </SignedOut>
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
            <SignedIn>
              <ImageUpload onDataExtracted={handleDataExtracted} />
            </SignedIn>
            <SignedOut>
              <Button
                variant="outline"
                disabled
                className="h-9 w-auto"
                title="운동 기록 사진 업로드"
              >
                <Camera className="h-4 w-4" />
                이미지 업로드(OCR)
              </Button>
              <p className="text-xs text-mute-foreground">
                <span className="text-muted-foreground">
                  로그인 후 이미지 업로드(OCR)가 가능합니다.
                </span>
              </p>
            </SignedOut>
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
