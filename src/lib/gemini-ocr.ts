// lib/gemini-ocr.ts
import { GoogleGenAI, Part } from "@google/genai";

// Gemini OCR 설정 인터페이스
interface GeminiOCRConfig {
  apiKey: string;
  model?: string;
  language?: "ko" | "en" | "auto";
  outputFormat?: "text" | "json" | "markdown";
}

// OCR 결과 인터페이스
interface OCRResult {
  text: string;
  confidence?: number;
  language?: string;
  error?: string;
}

// 이미지 소스 타입
type ImageSource = File | Blob | string | ArrayBuffer;

/**
 * 이미지를 Gemini API용 Part 객체로 변환
 */
async function imageToGenerativePart(
  imageSource: ImageSource,
  mimeType?: string
): Promise<Part> {
  let imageData: string;
  let detectedMimeType: string;

  if (typeof imageSource === "string") {
    // Base64 문자열인 경우
    if (imageSource.startsWith("data:")) {
      const [header, data] = imageSource.split(",");
      detectedMimeType = header.match(/:(.*?);/)?.[1] || "image/jpeg";
      imageData = data;
    } else {
      // 일반 base64 문자열
      imageData = imageSource;
      detectedMimeType = mimeType || "image/jpeg";
    }
  } else if (imageSource instanceof File || imageSource instanceof Blob) {
    // File 또는 Blob 객체
    detectedMimeType = imageSource.type || mimeType || "image/jpeg";
    const arrayBuffer = await imageSource.arrayBuffer();
    imageData = Buffer.from(arrayBuffer).toString("base64");
  } else if (imageSource instanceof ArrayBuffer) {
    // ArrayBuffer
    detectedMimeType = mimeType || "image/jpeg";
    imageData = Buffer.from(imageSource).toString("base64");
  } else {
    throw new Error("지원하지 않는 이미지 형식입니다.");
  }

  return {
    inlineData: {
      data: imageData,
      mimeType: detectedMimeType,
    },
  };
}

/**
 * Gemini를 사용한 기본 OCR 함수
 */
export async function extractTextFromImage(
  imageSource: ImageSource,
  config: GeminiOCRConfig
): Promise<OCRResult> {
  try {
    const ai = new GoogleGenAI({ apiKey: config.apiKey });

    // 이미지를 Gemini Part로 변환
    const imagePart = await imageToGenerativePart(imageSource);

    // 모델 설정 (기본값: gemini-2.0-flash-exp)
    const model = config.model || "gemini-2.0-flash-exp";

    // 언어별 프롬프트 설정
    const languagePrompts = {
      ko: "이미지에서 한국어 텍스트를 추출해주세요. 텍스트만 반환하고 다른 설명은 포함하지 마세요.",
      en: "Extract all English text from this image. Return only the text content without any additional explanation.",
      auto: "이미지에서 모든 텍스트를 추출해주세요. 텍스트만 반환하고 다른 설명은 포함하지 마세요. Extract all text from this image. Return only the text content.",
    };

    const prompt = languagePrompts[config.language || "auto"];

    // Gemini API 호출
    const response = await ai.models.generateContent({
      model,
      contents: [imagePart, prompt],
    });

    const extractedText = response.text || "";

    return {
      text: extractedText.trim(),
      language: config.language,
    };
  } catch (error) {
    console.error("Gemini OCR 오류:", error);
    return {
      text: "",
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

/**
 * 구조화된 데이터 추출을 위한 고급 OCR 함수
 */
export async function extractStructuredDataFromImage(
  imageSource: ImageSource,
  config: GeminiOCRConfig & {
    dataType?: "receipt" | "business-card" | "document" | "form" | "table";
    extractionRules?: string;
  }
): Promise<OCRResult> {
  try {
    const ai = new GoogleGenAI({ apiKey: config.apiKey });

    const imagePart = await imageToGenerativePart(imageSource);
    const model = config.model || "gemini-2.0-flash-exp";

    // 데이터 타입별 특화 프롬프트
    const dataTypePrompts = {
      receipt: `
        이 영수증 이미지에서 다음 정보를 JSON 형식으로 추출해주세요:
        - 상호명 (storeName)
        - 주소 (address)  
        - 전화번호 (phone)
        - 날짜 (date)
        - 시간 (time)
        - 구매 항목들 (items: [{name, quantity, price}])
        - 총액 (total)
        - 결제방법 (paymentMethod)
      `,
      "business-card": `
        이 명함 이미지에서 다음 정보를 JSON 형식으로 추출해주세요:
        - 이름 (name)
        - 직책 (title)
        - 회사명 (company)
        - 전화번호 (phone)
        - 이메일 (email)
        - 주소 (address)
        - 웹사이트 (website)
      `,
      document: `
        이 문서 이미지에서 모든 텍스트를 구조화하여 추출해주세요. 
        제목, 본문, 목록 등을 구분하여 마크다운 형식으로 반환해주세요.
      `,
      form: `
        이 양식 이미지에서 필드명과 값을 JSON 형식으로 추출해주세요.
        각 입력 필드의 라벨과 해당 값을 매핑해주세요.
      `,
      table: `
        이 표 이미지에서 데이터를 추출하여 JSON 배열 형식으로 반환해주세요.
        첫 번째 행을 헤더로 사용하고, 각 행의 데이터를 객체로 구성해주세요.
      `,
    };

    let prompt = dataTypePrompts[config.dataType || "document"];

    // 사용자 정의 추출 규칙이 있는 경우
    if (config.extractionRules) {
      prompt += `\n\n추가 요구사항: ${config.extractionRules}`;
    }

    const response = await ai.models.generateContent({
      model,
      contents: [imagePart, prompt],
    });

    const extractedText = response.text || "";

    return {
      text: extractedText.trim(),
      language: config.language,
    };
  } catch (error) {
    console.error("Gemini 구조화 OCR 오류:", error);
    return {
      text: "",
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

/**
 * Next.js API Route에서 사용할 수 있는 헬퍼 함수
 */
export async function handleOCRRequest(
  imageFile: File,
  options: {
    apiKey: string;
    language?: "ko" | "en" | "auto";
    structured?: boolean;
    dataType?: "receipt" | "business-card" | "document" | "form" | "table";
  }
): Promise<Response> {
  try {
    const config: GeminiOCRConfig = {
      apiKey: options.apiKey,
      language: options.language || "auto",
    };

    let result: OCRResult;

    if (options.structured) {
      result = await extractStructuredDataFromImage(imageFile, {
        ...config,
        dataType: options.dataType,
      });
    } else {
      result = await extractTextFromImage(imageFile, config);
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        text: "",
        error:
          error instanceof Error ? error.message : "서버 오류가 발생했습니다.",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

/**
 * 클라이언트 사이드에서 사용할 수 있는 OCR 함수
 */
export async function performOCR(
  file: File,
  options: {
    endpoint?: string;
    language?: "ko" | "en" | "auto";
    structured?: boolean;
    dataType?: "receipt" | "business-card" | "document" | "form" | "table";
  } = {}
): Promise<OCRResult> {
  try {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("language", options.language || "auto");
    formData.append("structured", String(options.structured || false));
    if (options.dataType) {
      formData.append("dataType", options.dataType);
    }

    const response = await fetch(options.endpoint || "/api/ocr", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    return {
      text: "",
      error:
        error instanceof Error
          ? error.message
          : "네트워크 오류가 발생했습니다.",
    };
  }
}
