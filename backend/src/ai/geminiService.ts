import dotenv from 'dotenv';
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash-lite',
  'gemini-3.7-flash',
  'gemini-flash-latest',
  'gemini-3.6-flash',
];

export interface GeminiQualityObservation {
  feature: string;
  status: 'DETECTED' | 'NOT_DETECTED' | 'NOT_ASSESSABLE';
  confidence: number;
  detail: string;
}

export interface GeminiQualityAnalysis {
  grade: 'GRADE_A' | 'GRADE_B' | 'GRADE_C';
  qualityScorePercent: number;
  ripenessPercent: number;
  visibleDamagePercent: number;
  uniformityPercent: number;
  colorIndexScore: string;
  firmnessDescription: string;
  defectsSummary: string;
  summaryInLanguage: string;
  observations?: GeminiQualityObservation[];
}

/**
 * Generate Multilingual Advisory via Gemini Flash with Model Fallback
 */
export async function callGeminiChat(
  userQuery: string,
  language: 'en' | 'hi' | 'mr',
  systemContext: string
): Promise<string | null> {
  const langInstructions = {
    mr: 'तुम्ही Farm2Market चे अधिकृत AI कृषी सल्लागार आहात. उत्तरे अस्खलित, सन्माननीय आणि सोप्या मराठीत द्या. शेतकऱ्याला योग्य भाव मिळवून देणे हा तुमचा मुख्य उद्देश आहे.',
    hi: 'आप Farm2Market के आधिकारिक AI कृषि सलाहकार हैं। उत्तर स्पष्ट, सम्मानजनक और सरल हिंदी में दें। किसान को उचित मूल्य दिलाना आपका प्राथमिक लक्ष्य है।',
    en: 'You are the official Farm2Market AI Agricultural Advisor for the Department of Consumer Affairs. Provide authoritative, helpful advice in clear English to protect farmers and eliminate unfair intermediary margins.',
  };

  const prompt = `${langInstructions[language]}\n\nContext:\n${systemContext}\n\nUser Question:\n${userQuery}\n\nProvide an insightful, helpful, and concise response formatted in clear bullet points.`;

  for (const model of MODELS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      const res = await fetch(url, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 600,
          },
        }),
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data: any = await res.json();
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) return reply;
      }
    } catch (e) {
      // Try next model or fallback
    }
  }

  return null;
}

/**
 * Real Camera Image Quality Inspection via Gemini Vision with Model Fallback
 */
export async function callGeminiVisionQuality(
  base64Image: string,
  cropName: string,
  language: 'en' | 'hi' | 'mr' = 'en'
): Promise<GeminiQualityAnalysis | null> {
  let mimeType = 'image/jpeg';
  if (base64Image.startsWith('data:image/png') || base64Image.startsWith('data:image/x-png')) {
    mimeType = 'image/png';
  } else if (base64Image.startsWith('data:image/webp')) {
    mimeType = 'image/webp';
  }

  const cleanBase64 = base64Image.includes('base64,')
    ? base64Image.split('base64,')[1].trim()
    : base64Image.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '').trim();

  const langDirective =
    language === 'mr'
      ? 'मराठीत उत्तर द्या (प्रतवारी, दृश्य दोष किंवा स्वच्छता, आणि योग्य भाव)'
      : language === 'hi'
      ? 'हिंदी में उत्तर दें (गुणवत्ता ग्रेड, दोष अथवा स्वच्छता, और उचित मंडी भाव)'
      : 'English (quality grade, observed defects or cleanliness, and fair mandi price rationale)';

  const prompt = `You are a certified Indian agricultural quality inspector and computer vision grading engine for Indian APMC Mandi produce: "${cropName}".
Analyze this real photograph of harvested produce provided by a farmer.
Inspect the visual evidence carefully:
1. Check for genuine defects: dark/black spots, mold, fungal spores, rot, discoloration, insect boreholes, shriveling, broken grains, mechanical damage, or immature green produce.
2. If significant rot, blackened fungal spots, or severe defects are present:
   - Assign GRADE_C (severe rot/mold, >10% damage, 30-69% optical score) or GRADE_B (moderate defects, 4-10% damage, 70-84% optical score).
   - Accurately describe the rot/defects in "defectsSummary" and in the "observations" array.
3. If the produce is clean, uniform, bright, and undamaged:
   - Assign GRADE_A (85-98% optical score, <3% visible defects).
4. Provide structured observations for 4 to 5 key visual characteristics (e.g. Surface Color & Luster, Size & Morphology Uniformity, Rot / Mold Presence, Pest Damage / Bruising, Moisture / Chemical Quality).
5. For each observation provide:
   - "feature": concise trait title
   - "status": "DETECTED" | "NOT_DETECTED" | "NOT_ASSESSABLE"
   - "confidence": number between 0.75 and 0.99
   - "detail": precise factual description of what is visible in the photograph.
6. Provide "summaryInLanguage": 2 clear sentences in ${langDirective}.

Return ONLY a valid JSON object matching this schema with no markdown fences:
{
  "grade": "GRADE_A" | "GRADE_B" | "GRADE_C",
  "qualityScorePercent": number,
  "ripenessPercent": number,
  "visibleDamagePercent": number,
  "uniformityPercent": number,
  "colorIndexScore": string,
  "firmnessDescription": string,
  "defectsSummary": string,
  "observations": [
    { "feature": string, "status": "DETECTED" | "NOT_DETECTED" | "NOT_ASSESSABLE", "confidence": number, "detail": string }
  ],
  "summaryInLanguage": string
}`;

  for (const model of MODELS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      const res = await fetch(url, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType,
                    data: cleanBase64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 900,
          },
        }),
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data: any = await res.json();
        const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textOutput) {
          const jsonMatch = textOutput.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return parsed as GeminiQualityAnalysis;
          }
        }
      }
    } catch (e) {
      // Fallback to next model
    }
  }

  return null;
}
