import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Store,
  Users,
  ChevronDown,
  Maximize2,
  Minimize2,
  RotateCcw,
  ArrowRight,
  Calculator,
  Bot
} from 'lucide-react';

import { sendChatMessageApi } from '../../services/api';
import { ChatMessage, SupportedLanguage, FairPriceCardData } from '../../types';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

export const MultilingualChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [language, setLanguage] = useState<SupportedLanguage>('mr');
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'calculator'>('chat');

  // Quick Offer Calculator State
  const [calcCrop, setCalcCrop] = useState('Tomato');
  const [calcPrice, setCalcPrice] = useState<number>(21);
  const [calcQty, setCalcQty] = useState<number>(2500);
  const [calcResult, setCalcResult] = useState<FairPriceCardData | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialPrompts: Record<SupportedLanguage, { welcome: string; chips: string[] }> = {
    mr: {
      welcome:
        "नमस्कार शेतकरी बंधूंनो! मी **Farm2Market SmartMandi फेअर प्राईस सल्लागार** आहे 🌾\n\nजेव्हा कोणताही खरेदीदार तुम्हाला पिकाचा दर ऑफर करतो, तेव्हा आम्ही तात्काळ घाऊक बाजारभाव आणि दर्जा तपासून **वाजवी भाव (Fair Price)** सांगतो. जर भाव कमी असेल, तर आम्ही तात्काळ सावध करतो जेणेकरून तुमची फसवणूक होणार नाही!",
      chips: [
        'टोमॅटोसाठी ₹२१ ची ऑफर योग्य आहे का?',
        'पुण्यातील कांदा खरेदीदार कोण आहेत?',
        'नाशिक vs मुंबई वाशी मंडई भाव तुलना',
        'FPO समूह वाहतूक कशी काम करते?',
      ],
    },
    hi: {
      welcome:
        "नमस्ते किसान भाइयों! मैं आपका **Farm2Market SmartMandi फेयर प्राइस सलाहकार** हूँ 🌾\n\nजब कोई खरीदार आपको किसी फसल की कीमत ऑफर करता है, तो हम तुरंत बाजार औसत, आसपास की मंडियों और क्वालिटी बेंचमार्क से तुलना करते हैं। यदि ऑफर अनुचित है, तो हम तुरंत अलर्ट करते हैं ताकि आप नुकसान से बच सकें!",
      chips: [
        'क्या टमाटर के लिए ₹21 का ऑफर सही है?',
        'पुणे के सत्यापित खरीदार दिखाएं',
        'नासिक बनाम मुंबई मंडी भाव में अंतर',
        'FPO साझा कोल्ड ट्रक के क्या लाभ हैं?',
      ],
    },
    en: {
      welcome:
        "Hello! I am your **Farm2Market SmartMandi Fair Price Advisor** 🌾\n\nWhere our AI adds real value is the **Fair Price Engine** — when a buyer makes an offer, we instantly compare it against market averages, nearby mandis, and quality benchmarks. If an offer is below fair value, we flag it in real time so you never accept a bad deal due to information asymmetry!",
      chips: [
        'Is ₹21/kg fair for Grade A Tomato?',
        'Find verified buyers in Pune and Mumbai',
        'Compare Nashik APMC vs Mumbai APMC prices',
        'How does the Fair Price Engine stop bad deals?',
      ],
    },
  };

  // Initialize welcome message upon language selection or mount
  useEffect(() => {
    const welcomeText = initialPrompts[language].welcome;
    const initialMsg: ChatMessage = {
      id: 'init-1',
      sender: 'bot',
      text: welcomeText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedQuestions: initialPrompts[language].chips,
    };
    setMessages([initialMsg]);
  }, [language]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Text to Speech
  const speakText = (text: string) => {
    if (!speechEnabled || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      // Strip markdown asterisks for cleaner audio
      const clean = text.replace(/[*_#•]/g, ' ');
      const utterance = new SpeechSynthesisUtterance(clean);
      if (language === 'mr') utterance.lang = 'mr-IN';
      else if (language === 'hi') utterance.lang = 'hi-IN';
      else utterance.lang = 'en-IN';
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      const res = await sendChatMessageApi(query, language);
      if (res && res.success) {
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: res.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          fairPriceCard: res.fairPriceCard,
          matchedEntities: res.matchedEntities,
          suggestedQuestions: res.suggestedQuestions,
        };
        setMessages((prev) => [...prev, botMsg]);
        speakText(res.reply);
      } else {
        throw new Error(res?.message || 'Server error');
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'bot',
        text:
          language === 'mr'
            ? 'क्षमस्व, नेटवर्क त्रुटी आली. कृपया पुन्हा प्रयत्न करा.'
            : language === 'hi'
            ? 'क्षमा करें, नेटवर्क में त्रुटि हुई। कृपया पुनः प्रयास करें।'
            : 'Sorry, I encountered a temporary connection issue. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Calculator Evaluation
  const runCalculator = async () => {
    setIsLoading(true);
    try {
      const query = `Offer for ${calcCrop} at ₹${calcPrice}/kg for ${calcQty} kg`;
      const res = await sendChatMessageApi(query, language);
      if (res && res.success && res.fairPriceCard) {
        setCalcResult(res.fairPriceCard);
        speakText(res.reply);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Circular Launcher Button: Saarthi (सारथी) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-emerald-800 via-emerald-600 to-teal-600 text-white rounded-full shadow-2xl hover:shadow-emerald-900/50 hover:scale-110 active:scale-95 transition-all border-2 border-white/80 group cursor-pointer"
          title="Saarthi AI (सारथी) - AI Agricultural Advisor (मराठी / हिंदी / English)"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-2.5 -right-2.5 px-1.5 py-0.5 rounded-full bg-amber-400 text-[9px] font-black text-slate-900 shadow-xs uppercase tracking-tighter">
              सारथी
            </span>
            <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
          </div>
        </button>
      )}

      {/* Interactive Chat Window */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-300 ${
            isExpanded
              ? 'inset-4 sm:inset-10 max-w-4xl max-h-[85vh] mx-auto my-auto'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[94vw] sm:w-[440px] h-[580px] max-h-[90vh]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-3.5 sm:p-4 flex flex-col gap-2.5 shrink-0 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-lg border border-white/20">
                  🤖
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                    <span>Saarthi AI Assistant (सारथी)</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                  </h3>
                  <p className="text-[10px] text-emerald-200">
                    Official Agro-Advisory & Fair Price Companion • मराठी | हिंदी | EN
                  </p>
                </div>
              </div>


              {/* Action Icons */}
              <div className="flex items-center gap-1">
                {/* Audio Toggle */}
                <button
                  onClick={() => setSpeechEnabled(!speechEnabled)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    speechEnabled
                      ? 'bg-amber-400 text-slate-900 font-bold'
                      : 'text-emerald-200 hover:bg-white/10'
                  }`}
                  title={speechEnabled ? 'Mute Speech Audio' : 'Enable Speech Audio in chosen language'}
                >
                  {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                {/* Expand / Minimize */}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 rounded-lg text-emerald-200 hover:bg-white/10 transition-colors hidden sm:block"
                  title={isExpanded ? 'Restore size' : 'Expand window'}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                {/* Close */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-emerald-200 hover:bg-white/10 transition-colors"
                  title="Close Assistant"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Language Switcher Tabs & Mode Switcher */}
            <div className="flex items-center justify-between pt-1 border-t border-white/10 text-xs">
              <div className="flex items-center gap-1 bg-black/20 p-0.5 rounded-lg border border-white/10">
                <button
                  onClick={() => setLanguage('mr')}
                  className={`px-2 py-0.5 rounded font-bold transition-all text-[11px] ${
                    language === 'mr' ? 'bg-white text-emerald-900 shadow-xs' : 'text-emerald-100 hover:text-white'
                  }`}
                >
                  🚩 मराठी
                </button>
                <button
                  onClick={() => setLanguage('hi')}
                  className={`px-2 py-0.5 rounded font-bold transition-all text-[11px] ${
                    language === 'hi' ? 'bg-white text-emerald-900 shadow-xs' : 'text-emerald-100 hover:text-white'
                  }`}
                >
                  🇮🇳 हिंदी
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-0.5 rounded font-bold transition-all text-[11px] ${
                    language === 'en' ? 'bg-white text-emerald-900 shadow-xs' : 'text-emerald-100 hover:text-white'
                  }`}
                >
                  🇬🇧 English
                </button>
              </div>

              {/* Chat vs Calculator toggle */}
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`px-2 py-0.5 rounded font-semibold transition-all ${
                    activeTab === 'chat' ? 'bg-emerald-500/40 text-white border border-emerald-300/40' : 'text-emerald-200'
                  }`}
                >
                  Chat
                </button>
                <button
                  onClick={() => setActiveTab('calculator')}
                  className={`px-2 py-0.5 rounded font-semibold transition-all flex items-center gap-1 ${
                    activeTab === 'calculator' ? 'bg-emerald-500/40 text-white border border-emerald-300/40' : 'text-emerald-200'
                  }`}
                >
                  <Calculator className="w-3 h-3" />
                  Offer Check
                </button>
              </div>
            </div>
          </div>

          {/* Body */}
          {activeTab === 'chat' ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/70">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs ${
                      msg.sender === 'user'
                        ? 'bg-emerald-700 text-white rounded-br-xs font-medium'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>

                    {/* Fair Price Evaluation Card (If present in bot message) */}
                    {msg.fairPriceCard && (
                      <div className="mt-3 p-3 rounded-xl border bg-slate-50 space-y-2 border-slate-200">
                        {/* Status Header */}
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                            Fair Price Audit ({msg.fairPriceCard.cropName})
                          </span>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              msg.fairPriceCard.status === 'BELOW_FAIR_PRICE'
                                ? 'bg-red-100 text-red-700 animate-pulse'
                                : msg.fairPriceCard.status === 'ABOVE_FAIR_PRICE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-sky-100 text-sky-800'
                            }`}
                          >
                            {msg.fairPriceCard.statusLabel}
                          </span>
                        </div>

                        {/* Price Gauges */}
                        <div className="grid grid-cols-3 gap-1.5 text-center text-[11px] pt-1">
                          <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                            <span className="text-[9px] text-slate-400 block font-semibold">Buyer Offer</span>
                            <strong className="text-base font-black text-slate-900">
                              ₹{msg.fairPriceCard.offeredPrice}/kg
                            </strong>
                          </div>
                          <div className="bg-emerald-50/80 p-1.5 rounded-lg border border-emerald-200">
                            <span className="text-[9px] text-emerald-700 block font-semibold">Fair Range</span>
                            <strong className="text-xs font-black text-emerald-800">
                              ₹{msg.fairPriceCard.fairPriceMin}–₹{msg.fairPriceCard.fairPriceMax}
                            </strong>
                          </div>
                          <div className="bg-sky-50/80 p-1.5 rounded-lg border border-sky-200">
                            <span className="text-[9px] text-sky-700 block font-semibold">Counter Target</span>
                            <strong className="text-xs font-black text-sky-800">
                              {msg.fairPriceCard.counterOfferSuggestion}
                            </strong>
                          </div>
                        </div>

                        {/* Loss Warning Banner */}
                        {msg.fairPriceCard.status === 'BELOW_FAIR_PRICE' && (
                          <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-800 text-[11px] flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                            <span>
                              <strong>नुकसान चेतावणी:</strong> या ऑफरवर तुमचे{' '}
                              <strong>₹{msg.fairPriceCard.potentialLossAmount.toLocaleString()}</strong> चे थेट नुकसान होईल!
                            </span>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="pt-1 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500">
                            Mandi Avg: ₹{msg.fairPriceCard.mandiComparison.localPrice}/kg
                          </span>
                          <button
                            onClick={() =>
                              handleSendMessage(
                                language === 'mr'
                                  ? `मी खरेदीदाराला ${msg.fairPriceCard?.counterOfferSuggestion} चा काउंटर ऑफर कसा पाठवू?`
                                  : language === 'hi'
                                  ? `मैं खरीदार को ${msg.fairPriceCard?.counterOfferSuggestion} का काउंटर ऑफर कैसे भेजूं?`
                                  : `How do I counter offer at ${msg.fairPriceCard?.counterOfferSuggestion}?`
                              )
                            }
                            className="px-2.5 py-1 text-[10px] font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors flex items-center gap-1"
                          >
                            <span>Send Counter</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Matched Entities Mini Cards */}
                    {msg.matchedEntities && msg.matchedEntities.items.length > 0 && (
                      <div className="mt-2.5 space-y-1.5">
                        {msg.matchedEntities.items.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-[11px] flex items-center justify-between"
                          >
                            <div>
                              <p className="font-bold text-slate-800">
                                {item.businessName || item.name} ({item.location || item.district})
                              </p>
                              <p className="text-[10px] text-slate-500">
                                {item.requirementCrop
                                  ? `Needs: ${item.requirementCrop} • Budget: ₹${item.budgetPerKg}/kg`
                                  : `Crops: ${item.primaryCrops || item.primaryCrop}`}
                              </p>
                            </div>
                            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              {item.phone}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400 px-1">{msg.timestamp}</span>

                  {/* Suggested Question Chips */}
                  {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1 max-w-[95%]">
                      {msg.suggestedQuestions.map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(chip)}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50 hover:border-emerald-300 transition-colors shadow-2xs text-left"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-slate-500 p-2">
                  <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  <span>
                    {language === 'mr'
                      ? 'AI वाजवी भावाची पडताळणी करत आहे...'
                      : language === 'hi'
                      ? 'AI उचित मूल्य की जांच कर रहा है...'
                      : 'AI is evaluating fair price benchmarks...'}
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            /* Offer Checker Calculator Tab */
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/80">
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Calculator className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-bold text-slate-800">
                    {language === 'mr'
                      ? 'खरेदीदार ऑफर पडताळणी कॅल्क्युलेटर'
                      : language === 'hi'
                      ? 'खरीदार ऑफर मूल्यांकन कैलकुलेटर'
                      : 'Buyer Offer Audit Calculator'}
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">
                      {language === 'mr' ? 'पीक निवडा' : language === 'hi' ? 'फसल चुनें' : 'Crop'}
                    </label>
                    <select
                      value={calcCrop}
                      onChange={(e) => setCalcCrop(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                    >
                      <option value="Tomato">Tomato (टोमॅटो)</option>
                      <option value="Onion">Onion (कांदा)</option>
                      <option value="Grapes">Grapes (द्राक्षे)</option>
                      <option value="Pomegranate">Pomegranate (डाळिंब)</option>
                      <option value="Banana">Banana (केळी)</option>
                      <option value="Sugarcane">Sugarcane (ऊस)</option>
                      <option value="Soybean">Soybean (सोयाबीन)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">
                      {language === 'mr' ? 'खरेदीदाराचा भाव (₹/किलो)' : language === 'hi' ? 'ऑफर दर (₹/किलो)' : 'Offered Price (₹/kg)'}
                    </label>
                    <input
                      type="number"
                      value={calcPrice}
                      onChange={(e) => setCalcPrice(Number(e.target.value))}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                      placeholder="e.g. 21"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                    <span>{language === 'mr' ? 'एकूण पीक वजन:' : language === 'hi' ? 'कुल वजन:' : 'Harvest Quantity:'}</span>
                    <span className="font-bold text-emerald-700">{calcQty.toLocaleString()} kg</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="10000"
                    step="500"
                    value={calcQty}
                    onChange={(e) => setCalcQty(Number(e.target.value))}
                    className="w-full h-1.5 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={runCalculator}
                  disabled={isLoading}
                  className="w-full font-bold text-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  {language === 'mr'
                    ? 'वाजवी भावाची तपासणी करा'
                    : language === 'hi'
                    ? 'उचित मूल्य की जांच करें'
                    : 'Evaluate Fair Price'}
                </Button>
              </div>

              {calcResult && (
                <div className="p-3.5 rounded-xl border bg-white shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      {calcResult.cropName} Audit
                    </span>
                    <Badge
                      variant={
                        calcResult.status === 'BELOW_FAIR_PRICE'
                          ? 'danger'
                          : calcResult.status === 'ABOVE_FAIR_PRICE'
                          ? 'success'
                          : 'info'
                      }
                    >
                      {calcResult.statusLabel}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-slate-50 border">
                      <span className="text-[10px] text-slate-500">Offered Rate</span>
                      <p className="text-base font-black text-slate-900">₹{calcResult.offeredPrice}/kg</p>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                      <span className="text-[10px] text-emerald-700">Fair Corridor</span>
                      <p className="text-base font-black text-emerald-800">
                        ₹{calcResult.fairPriceMin} - ₹{calcResult.fairPriceMax}
                      </p>
                    </div>
                  </div>

                  {calcResult.status === 'BELOW_FAIR_PRICE' && (
                    <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold">
                          {language === 'mr' ? 'नुकसान चेतावणी!' : language === 'hi' ? 'घाटे की चेतावनी!' : 'Bad Deal Flagged!'}
                        </strong>
                        <p className="text-[11px] mt-0.5">
                          {language === 'mr'
                            ? `तुम्ही ही ऑफर स्वीकारल्यास ₹${(calcResult.fairPriceTarget - calcResult.offeredPrice) * calcQty} चे नुकसान होईल. खरेदीदाराला ₹${calcResult.fairPriceMax}/किलो चा प्रति-प्रस्ताव द्या.`
                            : `Accepting this deal risks ₹${(calcResult.fairPriceTarget - calcResult.offeredPrice) * calcQty} in lost earnings. Counter-offer at ₹${calcResult.fairPriceMax}/kg.`}
                        </p>
                      </div>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setActiveTab('chat');
                      handleSendMessage(`How do I counter offer ${calcResult?.counterOfferSuggestion} for ${calcCrop}?`);
                    }}
                    className="w-full text-xs font-semibold"
                  >
                    Discuss this in Chat with AI
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Chat Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  language === 'mr'
                    ? 'उदा. खरेदीदार टोमॅटोसाठी ₹२२ देत आहे...'
                    : language === 'hi'
                    ? 'उदा. खरीदार टमाटर के लिए ₹22 ऑफर कर रहा है...'
                    : 'e.g. Buyer offering ₹22 for Tomato in Nashik...'
                }
                className="flex-1 px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="p-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white shadow-sm transition-colors cursor-pointer"
                title="Send query"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span>Fair Price Engine AI • Grounded in Maharashtra Mandi Data</span>
              <span className="font-mono">DoCA #26033</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MultilingualChatbot;
