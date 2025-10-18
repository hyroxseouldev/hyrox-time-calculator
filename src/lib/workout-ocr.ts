// lib/workout-ocr.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { TimeEntry } from '@/types/workout';
import { parseTimeString } from './time-utils';

export interface WorkoutOCRResult {
  running: TimeEntry[];
  stations: {
    ski?: TimeEntry;
    sledPush?: TimeEntry;
    sledPull?: TimeEntry;
    burpeeBroadJump?: TimeEntry;
    rowing?: TimeEntry;
    farmersCarry?: TimeEntry;
    sandbagLunges?: TimeEntry;
    wallBall?: TimeEntry;
  };
  roxzone?: TimeEntry;
  rawText: string;
  confidence: 'high' | 'medium' | 'low';
}

export async function extractWorkoutTimes(
  imageFile: File,
  apiKey: string
): Promise<WorkoutOCRResult> {
  try {
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const imageData = await fileToBase64(imageFile);

    const prompt = `
이 이미지는 HYROX 운동 기록입니다. 다음 운동 항목들의 시간을 MM:SS 형식으로 추출해주세요.

**달리기 (Running)**: 최대 8개까지 있을 수 있습니다
**스테이션 운동**:
- 스키 에르그 (Ski Erg / SkiErg)
- 슬레드 푸시 (Sled Push)
- 슬레드 풀 (Sled Pull)
- 버피 브로드 점프 (Burpee Broad Jump)
- 로잉 (Rowing / Row)
- 파머스 캐리 (Farmers Carry)
- 샌드백 런지 (Sandbag Lunges)
- 월볼 (Wall Balls)
**록스존 (Roxzone)**: 전환 시간

반드시 다음 JSON 형식으로 응답해주세요. 시간이 없는 항목은 "00:00"으로 표시하세요:

{
  "running": ["04:30", "04:45", "00:00", "00:00", "00:00", "00:00", "00:00", "00:00"],
  "stations": {
    "ski": "03:20",
    "sledPush": "02:15",
    "sledPull": "02:30",
    "burpeeBroadJump": "03:45",
    "rowing": "04:10",
    "farmersCarry": "02:00",
    "sandbagLunges": "03:30",
    "wallBall": "05:15"
  },
  "roxzone": "08:30"
}

JSON만 반환하고 다른 설명은 포함하지 마세요.
`;

    const result = await model.generateContent([
      {
        inlineData: {
          data: imageData,
          mimeType: imageFile.type
        }
      },
      { text: prompt }
    ]);

    const responseText = result.response.text();

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('JSON 형식의 응답을 받지 못했습니다');
    }

    const parsedData = JSON.parse(jsonMatch[0]);

    const runningTimes: TimeEntry[] = (parsedData.running || []).map((time: string) => {
      const parsed = parseTimeString(time);
      return parsed || { minutes: 0, seconds: 0 };
    });

    while (runningTimes.length < 8) {
      runningTimes.push({ minutes: 0, seconds: 0 });
    }
    runningTimes.splice(8);

    const stations: WorkoutOCRResult['stations'] = {};
    const stationMapping: Record<string, keyof WorkoutOCRResult['stations']> = {
      ski: 'ski',
      sledPush: 'sledPush',
      sledPull: 'sledPull',
      burpeeBroadJump: 'burpeeBroadJump',
      rowing: 'rowing',
      farmersCarry: 'farmersCarry',
      sandbagLunges: 'sandbagLunges',
      wallBall: 'wallBall'
    };

    Object.entries(parsedData.stations || {}).forEach(([key, value]) => {
      const mappedKey = stationMapping[key];
      if (mappedKey && typeof value === 'string') {
        const parsed = parseTimeString(value);
        stations[mappedKey] = parsed || { minutes: 0, seconds: 0 };
      }
    });

    const roxzone = parsedData.roxzone
      ? parseTimeString(parsedData.roxzone) || { minutes: 0, seconds: 0 }
      : { minutes: 0, seconds: 0 };

    const hasRunning = runningTimes.some(t => t.minutes > 0 || t.seconds > 0);
    const stationCount = Object.keys(stations).length;
    const confidence = stationCount >= 6 && hasRunning ? 'high'
      : stationCount >= 3 ? 'medium'
      : 'low';

    return {
      running: runningTimes,
      stations,
      roxzone,
      rawText: responseText,
      confidence
    };

  } catch (error) {
    console.error('Workout OCR 오류:', error);
    throw error;
  }
}

async function fileToBase64(file: File): Promise<string> {
  // Node.js 환경 (API 라우트)에서 실행
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString('base64');
}
