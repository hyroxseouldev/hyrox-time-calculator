"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Loader2, CheckCircle2, XCircle, Camera } from "lucide-react";
import { WorkoutOCRResult } from "@/lib/workout-ocr";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  onDataExtracted: (data: WorkoutOCRResult) => void;
}

export function ImageUpload({ onDataExtracted }: ImageUploadProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [status, setStatus] = React.useState<{
    type: "idle" | "success" | "error";
    message?: string;
  }>({ type: "idle" });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsProcessing(true);
    setStatus({ type: "idle" });

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "이미지 처리에 실패했습니다");
      }

      const result: WorkoutOCRResult = await response.json();

      const confidenceText =
        result.confidence === "high"
          ? "높은"
          : result.confidence === "medium"
          ? "중간"
          : "낮은";
      setStatus({
        type: "success",
        message: `${confidenceText} 정확도로 데이터를 추출했습니다`,
      });

      onDataExtracted(result);

      setTimeout(() => {
        setIsOpen(false);
        resetState();
      }, 2000);
    } catch (error) {
      console.error("OCR 오류:", error);
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "이미지 처리 중 오류가 발생했습니다",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetState = () => {
    setPreview(null);
    setStatus({ type: "idle" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!isProcessing) {
      setIsOpen(open);
      if (!open) {
        resetState();
      }
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(true)}
        className="h-9 w-auto"
        title="운동 기록 사진 업로드"
      >
        <Camera className="h-4 w-4" />
        이미지 업로드(OCR)
      </Button>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>운동 기록 사진 업로드</DialogTitle>
            <DialogDescription>
              HYROX 운동 기록이 포함된 사진을 업로드하면 자동으로 시간을
              추출합니다
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center",
                preview ? "border-primary" : "border-muted",
                "transition-colors"
              )}
            >
              {preview ? (
                <div className="space-y-4">
                  <img
                    src={preview}
                    alt="미리보기"
                    className="max-h-64 mx-auto rounded-lg"
                  />
                  {!isProcessing && status.type === "idle" && (
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessing}
                    >
                      다른 사진 선택
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessing}
                    >
                      사진 선택
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      또는 파일을 드래그 앤 드롭
                    </p>
                  </div>
                </div>
              )}
            </div>

            {isProcessing && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  AI가 운동 기록을 분석하고 있습니다...
                </AlertDescription>
              </Alert>
            )}

            {status.type === "success" && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600 dark:text-green-400">
                  {status.message}
                </AlertDescription>
              </Alert>
            )}

            {status.type === "error" && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{status.message}</AlertDescription>
              </Alert>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
