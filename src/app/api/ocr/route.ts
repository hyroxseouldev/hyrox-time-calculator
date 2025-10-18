import { NextRequest, NextResponse } from 'next/server';
import { extractWorkoutTimes } from '@/lib/workout-ocr';

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API 키가 설정되지 않았습니다. .env 파일을 확인해주세요.' },
        { status: 500 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json(
        { error: '이미지 파일이 필요합니다.' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!image.type.startsWith('image/')) {
      return NextResponse.json(
        { error: '이미지 파일만 업로드 가능합니다.' },
        { status: 400 }
      );
    }

    // Extract workout times using OCR
    const result = await extractWorkoutTimes(image, process.env.GEMINI_API_KEY);

    return NextResponse.json(result);
  } catch (error) {
    console.error('OCR API 오류:', error);

    const errorMessage = error instanceof Error ? error.message : '이미지 처리 중 오류가 발생했습니다.';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
