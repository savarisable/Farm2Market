import { callGeminiChat } from './ai/geminiService';

async function main() {
  console.log('Testing Gemini Flash API call...');
  const res = await callGeminiChat(
    'एक शेतकरी टोमॅटोसाठी ₹२१ ऑफर स्वीकारू का?',
    'mr',
    'Nashik mandi price is ₹26. Market average is ₹27.'
  );
  console.log('Gemini Response:\n', res);
}

main().catch(console.error);
