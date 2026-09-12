import { evaluateFairPrice, FairPriceEvaluation } from './fairPriceEngine';
import { callGeminiChat } from './geminiService';
import {
  MAHARASHTRA_FARMERS,
  MAHARASHTRA_BUYERS,
  MAHARASHTRA_FPOS,
  MAHARASHTRA_ADMINS,
  FarmerRecord,
  BuyerRecord,
  FPORecord,
} from '../data/maharashtraDirectory';

export type SupportedLanguage = 'en' | 'hi' | 'mr';

export interface ChatResponse {
  reply: string;
  language: SupportedLanguage;
  fairPriceCard?: {
    cropName: string;
    offeredPrice: number;
    fairPriceMin: number;
    fairPriceMax: number;
    fairPriceTarget: number;
    status: 'BELOW_FAIR_PRICE' | 'FAIR_PRICE' | 'ABOVE_FAIR_PRICE';
    statusLabel: string;
    potentialLossAmount: number;
    counterOfferSuggestion: string;
    explanation: string;
    mandiComparison: {
      localMandi: string;
      localPrice: number;
      bestMetroMandi: string;
      bestMetroPrice: number;
    };
  };
  matchedEntities?: {
    type: 'BUYER' | 'FARMER' | 'FPO';
    items: Array<any>;
  };
  suggestedQuestions: string[];
}

// Multi-language Crop Dictionary
const CROP_DICTIONARY: Record<string, string> = {
  // English
  tomato: 'Tomato',
  tomatoes: 'Tomato',
  onion: 'Onion',
  onions: 'Onion',
  potato: 'Potato',
  potatoes: 'Potato',
  grape: 'Grapes',
  grapes: 'Grapes',
  pomegranate: 'Pomegranate',
  pomegranates: 'Pomegranate',
  banana: 'Banana',
  bananas: 'Banana',
  sugarcane: 'Sugarcane',
  cotton: 'Cotton',
  wheat: 'Wheat',
  soybean: 'Soybean',
  turmeric: 'Turmeric',

  // Marathi
  टोमॅटो: 'Tomato',
  टोमॅटोचे: 'Tomato',
  टोमॅटोस: 'Tomato',
  कांदा: 'Onion',
  कांद्याला: 'Onion',
  कांद्यासाठी: 'Onion',
  कांदे: 'Onion',
  द्राक्षे: 'Grapes',
  द्राक्षांना: 'Grapes',
  द्राक्षांसाठी: 'Grapes',
  द्राक्ष: 'Grapes',
  डाळिंब: 'Pomegranate',
  डाळिंबाला: 'Pomegranate',
  केळी: 'Banana',
  केळीला: 'Banana',
  ऊस: 'Sugarcane',
  उसाला: 'Sugarcane',
  कापूस: 'Cotton',
  कापसाला: 'Cotton',
  बटाटा: 'Potato',
  बटाटे: 'Potato',
  सोयाबीन: 'Soybean',
  हळद: 'Turmeric',
  गहू: 'Wheat',

  // Hindi
  टमाटर: 'Tomato',
  प्याज: 'Onion',
  आलू: 'Potato',
  अंगूर: 'Grapes',
  अनार: 'Pomegranate',
  केला: 'Banana',
  केले: 'Banana',
  गन्ना: 'Sugarcane',
  कपास: 'Cotton',
  सोयाबीन_hi: 'Soybean',
  हल्दी: 'Wheat',
};

// Extract price from text (e.g. "₹22", "22 rs", "22 रुपये", "22/-")
function extractOfferedPrice(text: string): number | null {
  const match = text.match(/(?:₹|rs\.?|inr|रुपये|रु\.?)?\s*(\d+(?:\.\d+)?)\s*(?:₹|rs\.?|inr|रुपये|रु\.?|\/-\s*|\/kg|\/किलो|\/क्विंटल)?/i);
  if (match && match[1]) {
    const val = parseFloat(match[1]);
    // reasonable per kg check (1 to 500)
    if (val > 0 && val <= 500) return val;
  }
  return null;
}

function detectCrop(text: string): string | null {
  const lower = text.toLowerCase();
  for (const [key, crop] of Object.entries(CROP_DICTIONARY)) {
    if (lower.includes(key.toLowerCase())) {
      return crop;
    }
  }
  return null;
}

export async function processMultilingualQuery(
  rawMessage: string,
  lang: SupportedLanguage = 'mr',
  userContext?: { role?: string; name?: string; location?: string }
): Promise<ChatResponse> {
  const message = rawMessage.trim();
  const lower = message.toLowerCase();

  const detectedCrop = detectCrop(message);
  const detectedPrice = extractOfferedPrice(message);

  // 1. OFFER EVALUATION & FAIR PRICE ENGINE
  // Triggers when user asks about an offer or mentions a price with crop
  const isOfferQuery =
    detectedPrice !== null ||
    lower.includes('offer') ||
    lower.includes('fair price') ||
    lower.includes('योग्य भाव') ||
    lower.includes('दाम') ||
    lower.includes('किंमत') ||
    lower.includes('खरेदीदार देत आहे') ||
    lower.includes('ऑफर') ||
    lower.includes('भाव') ||
    lower.includes('रेट');

  if (isOfferQuery && (detectedCrop || detectedPrice)) {
    const crop = detectedCrop || 'Tomato';
    const price = detectedPrice || 21.0;
    const qty = 2500; // default harvest batch

    const evalResult = evaluateFairPrice(crop, price, qty, 'GRADE_A', 'Nashik');

    const statusLabels: Record<SupportedLanguage, Record<string, string>> = {
      en: {
        BELOW_FAIR_PRICE: '⚠️ BELOW FAIR VALUE — BAD DEAL FLAGGED',
        FAIR_PRICE: '✅ FAIR PRICE RANGE',
        ABOVE_FAIR_PRICE: '🎉 PREMIUM OFFER — ABOVE MARKET VALUE',
      },
      mr: {
        BELOW_FAIR_PRICE: '⚠️ हमीभावापेक्षा कमी — फसवणूक रोखा (नुकसान चेतावणी)',
        FAIR_PRICE: '✅ वाजवी व योग्य भाव',
        ABOVE_FAIR_PRICE: '🎉 नफ्याचा सर्वोत्तम भाव (प्रिमियम ऑफर)',
      },
      hi: {
        BELOW_FAIR_PRICE: '⚠️ उचित मूल्य से कम — नुकसान की चेतावनी (गलत सौदा)',
        FAIR_PRICE: '✅ उचित एवं संतुलित मूल्य',
        ABOVE_FAIR_PRICE: '🎉 बेहतरीन प्रीमियम ऑफर — तुरंत स्वीकारें',
      },
    };

    let reply = '';

    if (lang === 'mr') {
      if (evalResult.evaluationStatus === 'BELOW_FAIR_PRICE') {
        reply = `🚨 **सावधान! खरेदीदाराची ऑफर ₹${price}/किलो वाजवी बाजाराभावापेक्षा कमी आहे.**\n\n` +
          `• **सध्याचा रास्त भाव पट्टा**: ₹${evalResult.fairPriceMin} ते ₹${evalResult.fairPriceMax}/किलो\n` +
          `• **पुणे / मुंबई मंडई भाव**: ₹${evalResult.fairPriceTarget}/किलो पर्यंत सुरु आहे.\n` +
          `• **संभाव्य नुकसान**: जर तुम्ही ही ऑफर स्वीकारली, तर ${qty} किलो मालावर तुमचे सुमारे **₹${evalResult.potentialAdditionalRealization.toLocaleString()} चे नुकसान** होईल!\n\n` +
          `💡 **आमचा AI सल्ला**: खरेदीदाराला **₹${evalResult.fairPriceMax}/किलो** चा काउंटर ऑफर (प्रति-प्रस्ताव) द्या. गुणवत्ता अ-दर्जा (Grade A) असल्यामुळे तुम्हाला अधिक दर मिळण्याचा पूर्ण हक्क आहे.`;
      } else if (evalResult.evaluationStatus === 'ABOVE_FAIR_PRICE') {
        reply = `🎉 **उत्कृष्ट ऑफर! खरेदीदाराचा दर ₹${price}/किलो बाजारातील सरासरीपेक्षा जास्त आहे.**\n\n` +
          `• **वाजवी भाव पट्टा**: ₹${evalResult.fairPriceMin} ते ₹${evalResult.fairPriceMax}/किलो\n` +
          `• तुम्हाला बाजारापेक्षा **₹${(price - evalResult.fairPriceMax).toFixed(1)}/किलो जास्त** मिळत आहेत.\n\n` +
          `💡 **आमचा AI सल्ला**: ही ऑफर त्वरित स्वीकारा आणि डिजिटल एस्क्रो पेमेंट द्वारे रक्कम सुरक्षित करा.`;
      } else {
        reply = `✅ **खरेदीदाराची ऑफर ₹${price}/किलो वाजवी आणि योग्य भावाच्या पट्ट्यात आहे.**\n\n` +
          `• **बाजारातील वाजवी पट्टा**: ₹${evalResult.fairPriceMin} ते ₹${evalResult.fairPriceMax}/किलो.\n` +
          `• ही ऑफर स्वीकारण्यायोग्य आहे. तुम्ही वाहतूक खर्चासाठी +₹१/किलो ची वाढ मागू शकता.`;
      }
    } else if (lang === 'hi') {
      if (evalResult.evaluationStatus === 'BELOW_FAIR_PRICE') {
        reply = `🚨 **सावधान! खरीदार द्वारा दी गई ₹${price}/किलो की पेशकश उचित बाजार मूल्य से काफी कम है।**\n\n` +
          `• **वर्तमान उचित मूल्य सीमा**: ₹${evalResult.fairPriceMin} से ₹${evalResult.fairPriceMax}/किलो\n` +
          `• **पुणे/मुंबई मंडी औसत**: ₹${evalResult.fairPriceTarget}/किलो पर व्यापार हो रहा है।\n` +
          `• **अनुमानित नुकसान**: यदि आप इसे स्वीकार करते हैं, तो ${qty} किलो उपज पर आपको **₹${evalResult.potentialAdditionalRealization.toLocaleString()} का सीधा घाटा** होगा!\n\n` +
          `💡 **हमारा AI सुझाव**: खरीदार को कम से कम **₹${evalResult.fairPriceMax}/किलो** का काउंटर-ऑफर दें। आपका माल 'Grade A' प्रमाणित है, इसलिए कम दाम पर न बेचें।`;
      } else if (evalResult.evaluationStatus === 'ABOVE_FAIR_PRICE') {
        reply = `🎉 **शानदार ऑफर! खरीदार का भाव ₹${price}/किलो मौजूदा मंडी दरों से अधिक है।**\n\n` +
          `• **उचित मूल्य सीमा**: ₹${evalResult.fairPriceMin} से ₹${evalResult.fairPriceMax}/किलो\n` +
          `• आपको बाजार से **₹${(price - evalResult.fairPriceMax).toFixed(1)}/किलो अधिक** मिल रहे हैं।\n\n` +
          `💡 **हमारा AI सुझाव**: इस सौदे को तुरंत स्वीकार करें और डिजिटल एस्क्रो के माध्यम से अपनी राशि सुरक्षित करें।`;
      } else {
        reply = `✅ **खरीदार की ₹${price}/किलो की पेशकश निष्पक्ष और बाजार के अनुकूल है।**\n\n` +
          `• **उचित मूल्य सीमा**: ₹${evalResult.fairPriceMin} से ₹${evalResult.fairPriceMax}/किलो\n` +
          `• यह सौदा संतोषजनक है। आप ढुलाई शुल्क में ₹1/किलो की अतिरिक्त रियायत मांग सकते हैं।`;
      }
    } else {
      // English
      if (evalResult.evaluationStatus === 'BELOW_FAIR_PRICE') {
        reply = `🚨 **ALERT: The offered price of ₹${price}/kg is BELOW FAIR MARKET VALUE!**\n\n` +
          `• **Fair Price Corridor**: ₹${evalResult.fairPriceMin} – ₹${evalResult.fairPriceMax} / kg\n` +
          `• **Nearby Consumption Mandi (Pune/Mumbai)**: Trading around ₹${evalResult.fairPriceTarget} / kg\n` +
          `• **Risk of Lost Income**: Accepting this offer leaves **₹${evalResult.potentialAdditionalRealization.toLocaleString()}** on the table on ${qty} kg!\n\n` +
          `💡 **AI Recommendation**: Do NOT accept this offer. Counter at **₹${evalResult.fairPriceMax}/kg**. Your Grade A batch commands high retail demand.`;
      } else if (evalResult.evaluationStatus === 'ABOVE_FAIR_PRICE') {
        reply = `🎉 **EXCELLENT DEAL: The offered price of ₹${price}/kg includes a premium above market average!**\n\n` +
          `• **Fair Price Corridor**: ₹${evalResult.fairPriceMin} – ₹${evalResult.fairPriceMax} / kg\n` +
          `• You are securing a **+₹${(price - evalResult.fairPriceMax).toFixed(1)}/kg premium** over terminal mandis.\n\n` +
          `💡 **AI Recommendation**: Lock in this contract immediately through digital escrow.`;
      } else {
        reply = `✅ **The offered price of ₹${price}/kg is within the Fair Agricultural Valuation Corridor.**\n\n` +
          `• **Corridor**: ₹${evalResult.fairPriceMin} – ₹${evalResult.fairPriceMax} / kg\n` +
          `• This represents an equitable return. You may request an extra +₹1/kg freight offset.`;
      }
    }

    const suggestedQuestions: Record<SupportedLanguage, string[]> = {
      en: [
        `Show verified buyers for ${crop} in Pune/Mumbai`,
        `Compare Nashik APMC vs Mumbai APMC prices`,
        `How do I send a counter-offer to the buyer?`,
        `Check FPO bulk aggregation for ${crop}`,
      ],
      mr: [
        `पुणे आणि मुंबईमधील ${crop} खरेदीदार दाखवा`,
        `नाशिक मंडई आणि मुंबई वाशी मंडई दरांची तुलना करा`,
        `खरेदीदाराला काउंटर ऑफर कसा पाठवायचा?`,
        `जवळची शेतकरी उत्पादक कंपनी (FPO) कोणती आहे?`,
      ],
      hi: [
        `पुणे और मुंबई में ${crop} के खरीदार दिखाएं`,
        `नासिक मंडी और मुंबई वाशी मंडी भाव की तुलना करें`,
        `खरीदार को काउंटर-ऑफर कैसे भेजें?`,
        `निकटतम FPO से जुड़कर बड़ा ट्रक कैसे बुक करें?`,
      ],
    };

    return {
      reply,
      language: lang,
      fairPriceCard: {
        cropName: crop,
        offeredPrice: price,
        fairPriceMin: evalResult.fairPriceMin,
        fairPriceMax: evalResult.fairPriceMax,
        fairPriceTarget: evalResult.fairPriceTarget,
        status: evalResult.evaluationStatus,
        statusLabel: statusLabels[lang][evalResult.evaluationStatus],
        potentialLossAmount: evalResult.potentialAdditionalRealization,
        counterOfferSuggestion: `₹${evalResult.fairPriceMax}/kg`,
        explanation: evalResult.explanation,
        mandiComparison: {
          localMandi: 'Nashik APMC',
          localPrice: evalResult.marketAveragePrice,
          bestMetroMandi: 'Mumbai / Pune Direct Hub',
          bestMetroPrice: evalResult.demandAdjustedPrice,
        },
      },
      suggestedQuestions: suggestedQuestions[lang],
    };
  }

  // 2. FIND BUYERS QUERY
  if (lower.includes('buyer') || lower.includes('खरेदीदार') || lower.includes('खरीदार') || lower.includes('व्यापारी') || lower.includes('trader')) {
    let matchedBuyers = MAHARASHTRA_BUYERS;
    if (detectedCrop) {
      matchedBuyers = MAHARASHTRA_BUYERS.filter((b) => b.requirementCrop.toLowerCase() === detectedCrop.toLowerCase());
    }

    if (matchedBuyers.length === 0) matchedBuyers = MAHARASHTRA_BUYERS.slice(0, 4);

    let reply = '';
    if (lang === 'mr') {
      reply = `📋 **महाराष्ट्रातील पडताळणी केलेले प्रमुख खरेदीदार:**\n\n` +
        matchedBuyers
          .slice(0, 4)
          .map(
            (b) =>
              `• **${b.businessName}** (${b.location}) — **${b.requirementCrop}** दरमहा ${b.volumeKgPerMonth.toLocaleString()} किलो, अंदाजे बजेट: **₹${b.budgetPerKg}/किलो** (रेटिंग: ⭐${b.rating})`
          )
          .join('\n') +
        `\n\n💡 तुम्ही या खरेदीदारांना थेट अॅपवरून मागणी पाठवू शकता. मध्यस्थांची कोणतीही गरज नाही!`;
    } else if (lang === 'hi') {
      reply = `📋 **महाराष्ट्र के सत्यापित विश्वसनीय खरीदार:**\n\n` +
        matchedBuyers
          .slice(0, 4)
          .map(
            (b) =>
              `• **${b.businessName}** (${b.location}) — **${b.requirementCrop}** प्रति माह ${b.volumeKgPerMonth.toLocaleString()} किलो, बजट: **₹${b.budgetPerKg}/किलो** (रेटिंग: ⭐${b.rating})`
          )
          .join('\n') +
        `\n\n💡 आप सीधे ऐप के माध्यम से इन खरीदारों से संपर्क कर सकते हैं और बिना दलाल के माल बेच सकते हैं।`;
    } else {
      reply = `📋 **Verified Buyers in Maharashtra Network:**\n\n` +
        matchedBuyers
          .slice(0, 4)
          .map(
            (b) =>
              `• **${b.businessName}** (${b.location}) — Seeking **${b.requirementCrop}** (${b.volumeKgPerMonth.toLocaleString()} kg/mo), Budget: **₹${b.budgetPerKg}/kg** (Rating: ⭐${b.rating})`
          )
          .join('\n') +
        `\n\n💡 You can directly engage with these institutional buyers without any middlemen commissions.`;
    }

    return {
      reply,
      language: lang,
      matchedEntities: {
        type: 'BUYER',
        items: matchedBuyers.slice(0, 4),
      },
      suggestedQuestions:
        lang === 'mr'
          ? ['टोमॅटोसाठी वाजवी भाव काय आहे?', 'जवळची FPO कशी शोधायची?', 'नाशिक ते मुंबई वाहतूक खर्च किती?']
          : lang === 'hi'
          ? ['टमाटर का उचित भाव क्या होना चाहिए?', 'निकटतम FPO कैसे खोजें?', 'नासिक से मुंबई ढुलाई खर्च कितना है?']
          : ['Check fair price for Tomato at ₹24', 'How to pool harvest with an FPO?', 'Compare mandi transport rates'],
    };
  }

  // 3. FPO / AGGREGATION QUERY
  if (lower.includes('fpo') || lower.includes('उत्पादक कंपनी') || lower.includes('एकत्रीकरण') || lower.includes('aggregation') || lower.includes('समूह')) {
    let reply = '';
    if (lang === 'mr') {
      reply = `🤝 **महाराष्ट्रातील मान्यताप्राप्त शेतकरी उत्पादक कंपन्या (FPOs):**\n\n` +
        MAHARASHTRA_FPOS.map(
          (f) => `• **${f.name}** (${f.district}) — सदस्य: ${f.memberFarmers} शेतकरी | मुख्य पिके: ${f.primaryCrops} | संपर्क: ${f.contactPerson} (${f.phone})`
        ).join('\n') +
        `\n\n🚚 **FPO फायदा**: लहान शेतकरी एकत्र येऊन पूर्ण ट्रक लोड (FTL) करतात, ज्यामुळे वाहतूक खर्च **₹८ वरून थेट ₹२.८/किलो** वर येतो.`;
    } else if (lang === 'hi') {
      reply = `🤝 **महाराष्ट्र के प्रमुख किसान उत्पादक संगठन (FPO):**\n\n` +
        MAHARASHTRA_FPOS.map(
          (f) => `• **${f.name}** (${f.district}) — सदस्य: ${f.memberFarmers} किसान | मुख्य फसलें: ${f.primaryCrops} | संपर्क: ${f.contactPerson} (${f.phone})`
        ).join('\n') +
        `\n\n🚚 **FPO का लाभ**: छोटे किसान मिलकर साझा कोल्ड ट्रक बुक करते हैं, जिससे ढुलाई खर्च **65% कम** हो जाता है।`;
    } else {
      reply = `🤝 **Registered Farmer Producer Organizations (FPOs) in Maharashtra:**\n\n` +
        MAHARASHTRA_FPOS.map(
          (f) => `• **${f.name}** (${f.district}) — ${f.memberFarmers} members | Crops: ${f.primaryCrops} | Contact: ${f.contactPerson} (${f.phone})`
        ).join('\n') +
        `\n\n🚚 **The FPO Advantage**: Smallholders aggregate volume into Full Truckloads (FTL), slashing transport from ₹8/kg to ₹2.8/kg.`;
    }

    return {
      reply,
      language: lang,
      matchedEntities: {
        type: 'FPO',
        items: MAHARASHTRA_FPOS,
      },
      suggestedQuestions:
        lang === 'mr'
          ? ['खरेदीदाराची ₹२२ ऑफर योग्य आहे का?', 'पुण्यातील कांदा खरेदीदार', 'डिजिटल पीक पासपोर्ट कसा मिळतो?']
          : lang === 'hi'
          ? ['क्या ₹22 की पेशकश उचित है?', 'पुणे में प्याज के खरीदार', 'डिजिटल क्रॉप पासपोर्ट कैसे प्राप्त करें?']
          : ['Evaluate Tomato offer at ₹22/kg', 'Find onion buyers in Pune', 'How Digital Crop Passport works'],
    };
  }

  // 4. INFORMATION ASYMMETRY & PROBLEM STATEMENT EXPLANATION
  if (
    lower.includes('information asymmetry') ||
    lower.includes('fair price engine') ||
    lower.includes('problem statement') ||
    lower.includes('मध्यस्थ') ||
    lower.includes('दलाल') ||
    lower.includes('फायदा') ||
    lower.includes('26033')
  ) {
    let reply = '';
    if (lang === 'mr') {
      reply = `🎯 **आमच्या AI चे खरे सामर्थ्य: फेअर प्राईस इंजिन (Fair Price Engine)**\n\n` +
        `पारंपारिक व्यवस्थेत शेतकऱ्यांना इतर शहरांमधील नेमके बाजारभाव ठाऊक नसतात, ज्याचा गैरफायदा मध्यस्थ घेतात. **Farm2Market SmartMandi ही माहितीची दरी (Information Asymmetry) कायमची मिटवते:**\n\n` +
        `1️⃣ **रिअल-टाइम पडताळणी**: खरेदीदाराने ऑफर देताच आमचे AI तात्काळ घाऊक सरासरी, लगतच्या मेट्रो मंडई दर आणि अ-दर्जा गुणवत्तेशी तुलना करते.\n` +
        `2️⃣ **नुकसान चेतावणी**: जर ऑफर वाजवी मूल्यापेक्षा कमी असेल, तर शेतकऱ्याला त्वरित **लाल चेतावणी (Alert)** देऊन नेमके किती रुपयांचे नुकसान होईल हे दाखवले जाते.\n` +
        `3️⃣ **अचूक प्रति-प्रस्ताव**: शेतकरी कधीही अज्ञानापोटी वाईट सौदा स्वीकारत नाही, कारण AI त्याला योग्य भाव मागण्याचा आत्मविश्वास देते!`;
    } else if (lang === 'hi') {
      reply = `🎯 **हमारे AI का असली मूल्य: फेयर प्राइस इंजन (Fair Price Engine)**\n\n` +
        `पारंपरिक मंडियों में किसानों को महानगरों की वास्तविक मांग और सही दरों की जानकारी नहीं होती, जिससे बिचौलिए उनका शोषण करते हैं। **Farm2Market SmartMandi इसी सूचना विषमता (Information Asymmetry) का समाधान करता है:**\n\n` +
        `1️⃣ **तुरंत तुलना**: जब कोई खरीदार बोली लगाता है, हमारा AI तुरंत उसकी तुलना बाजार औसत, आसपास की मंडियों और क्वालिटी बेंचमार्क से करता है।\n` +
        `2️⃣ **घाटे का अलर्ट**: यदि ऑफर सही मूल्य से कम है, तो किसान को तुरंत सचेत किया जाता है कि वह कितना नुकसान उठाने जा रहा है।\n` +
        `3️⃣ **उचित सौदे की गारंटी**: किसान अब जानकारी के अभाव में कभी भी घाटे का सौदा स्वीकार नहीं करेगा!`;
    } else {
      reply = `🎯 **Where our AI adds real value: The Fair Price Engine**\n\n` +
        `When a buyer makes an offer, we instantly compare it against the wholesale market average, nearby terminal consumption hub spot prices, and quality-adjusted benchmarks.\n\n` +
        `• **Real-Time Bad Deal Flagging**: If an offer is below fair value, we flag it to the farmer in real time with the exact rupee loss calculated.\n` +
        `• **Actionable Counter-Offer Rationale**: Gives the farmer the data-backed confidence to negotiate higher realization.\n` +
        `• **Eliminating Information Asymmetry**: Farmers never have to accept a poor deal simply because they didn't know better!`;
    }

    return {
      reply,
      language: lang,
      suggestedQuestions:
        lang === 'mr'
          ? ['टोमॅटोसाठी ₹२२ योग्य आहे का?', 'पुण्यातील खरेदीदार कोण आहेत?', 'सह्याद्री FPO माहिती']
          : lang === 'hi'
          ? ['टमाटर के लिए ₹22 की पेशकश कैसी है?', 'पुणे के खरीदार कौन हैं?', 'FPO एकत्रीकरण कैसे काम करता है?']
          : ['Evaluate ₹22 offer for Tomato', 'Who are the top buyers in Pune?', 'How milk-run logistics saves 33%'],
    };
  }

  // 5. DEFAULT WELCOME / INTRO IN RESPECTIVE LANGUAGE
  if (lang === 'mr') {
    return {
      reply: `नमस्कार! मी **Farm2Market SmartMandi सल्लागार** आहे 🌾\n\n` +
        `मी तुम्हाला खरेदीदारांच्या ऑफर्स वाजवी आहेत की नाही हे तपासण्यात, योग्य भाव (Fair Price) मिळवण्यात, आणि जवळचे खरेदीदार व FPOs शोधण्यात मदत करतो.\n\n` +
        `💡 **तुम्ही मला विचारू शकता:**\n` +
        `• *"खरेदीदार टोमॅटोसाठी ₹२२ देत आहे, योग्य भाव आहे का?"*\n` +
        `• *"नाशिक व मुंबई मंडई भावांची तुलना करा"*\n` +
        `• *"माझ्या द्राक्षांसाठी पुणे किंवा मुंबईमध्ये खरेदीदार शोधा"*\n` +
        `• *"जवळच्या शेतकरी उत्पादक कंपनी (FPO) ची माहिती द्या"*`,
      language: 'mr',
      suggestedQuestions: [
        'टोमॅटोसाठी ₹२२ ची ऑफर योग्य आहे का?',
        'कांद्यासाठी आजचा रास्त भाव काय?',
        'पुण्यातील पडताळणी केलेले खरेदीदार',
        'FPO समूह वाहतुकीचे फायदे',
      ],
    };
  } else if (lang === 'hi') {
    return {
      reply: `नमस्ते! मैं आपका **Farm2Market SmartMandi कृषि सलाहकार** हूँ 🌾\n\n` +
        `मैं आपको खरीदारों के ऑफर की निष्पक्षता जांचने, सही भाव (Fair Price) पाने, और सत्यापित खरीदारों व FPO से जुड़ने में मदद करता हूँ।\n\n` +
        `💡 **आप मुझसे पूछ सकते हैं:**\n` +
        `• *"एक खरीदार टमाटर के लिए ₹22 ऑफर कर रहा है, क्या यह सही दाम है?"*\n` +
        `• *"नासिक और मुंबई मंडी भाव में क्या अंतर है?"*\n` +
        `• *"मेरे अंगूर या प्याज के लिए नजदीकी खरीदार खोजें"*\n` +
        `• *"FPO के साथ मिलकर ट्रक कैसे साझा करें?"*`,
      language: 'hi',
      suggestedQuestions: [
        'टमाटर के लिए ₹22 की पेशकश कैसी है?',
        'प्याज का आज का उचित मूल्य क्या है?',
        'पुणे के सत्यापित खरीदार दिखाएं',
        'फेयर प्राइस इंजन कैसे मदद करता है?',
      ],
    };
  } else {
    return {
      reply: `Hello! I am your **Farm2Market AI Fair Price Advisor** 🌾\n\n` +
        `I help farmers, buyers, and FPOs eliminate information asymmetry. Whenever a buyer makes an offer, I instantly benchmark it against real-time wholesale averages, nearby terminal hubs, and certified quality grades.\n\n` +
        `💡 **Try asking me:**\n` +
        `• *"A buyer is offering ₹22/kg for Tomato in Nashik. Is this fair?"*\n` +
        `• *"Compare Nashik APMC vs Mumbai Vashi APMC prices"*\n` +
        `• *"Find verified buyers for Grapes or Pomegranate"*\n` +
        `• *"How does the Fair Price Engine eliminate bad deals?"*`,
      language: 'en',
      suggestedQuestions: [
        'Is ₹22/kg fair for Grade A Tomato?',
        'What is the fair price corridor for Onion?',
        'Find verified buyers in Pune and Mumbai',
        'Explain how the Fair Price Engine works',
      ],
    };
  }
}
