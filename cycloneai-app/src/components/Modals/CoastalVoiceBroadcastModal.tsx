import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Square, 
  Languages, 
  X, 
  ShieldAlert, 
  Radio, 
  PhoneCall, 
  CheckCircle2, 
  Flame, 
  Sparkles,
  Waves,
  Wind
} from 'lucide-react';
import { StormProfile } from '../../types';
import { 
  COASTAL_LANGUAGES, 
  CoastalLanguage, 
  generateSpeechForLanguage, 
  speakCoastalAlert, 
  stopCoastalAlert,
  isCoastalAlertSpeaking 
} from '../../utils/speechSynthesis';

interface CoastalVoiceBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeStorm: StormProfile;
}

export const CoastalVoiceBroadcastModal: React.FC<CoastalVoiceBroadcastModalProps> = ({
  isOpen,
  onClose,
  activeStorm
}) => {
  const [selectedLang, setSelectedLang] = useState<CoastalLanguage['id']>('or'); // Default to Odia for Bay of Bengal / Dana
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(0.92);
  const [isContinuousLoop, setIsContinuousLoop] = useState<boolean>(false);
  const [loopCurrentIndex, setLoopCurrentIndex] = useState<number>(0);
  const [availableVoicesCount, setAvailableVoicesCount] = useState<number>(0);

  // Sync available voices from browser
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const updateVoices = () => {
      const v = window.speechSynthesis.getVoices();
      setAvailableVoicesCount(v.length);
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Cleanup on unmount or close
  useEffect(() => {
    if (!isOpen) {
      stopCoastalAlert();
      setIsSpeaking(false);
      setIsContinuousLoop(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentLangConfig = COASTAL_LANGUAGES.find(l => l.id === selectedLang) || COASTAL_LANGUAGES[0];

  const speechData = {
    cycloneName: activeStorm.name,
    category: activeStorm.category,
    landfallLocation: activeStorm.landfallLocation,
    surgeM: activeStorm.coastalDangerZones?.[0]?.stormSurgeHeightM || 3.8,
    windKmh: activeStorm.maxWindsKmh
  };

  const speechContent = generateSpeechForLanguage(selectedLang, speechData);

  const handleSpeakSingle = (langId?: CoastalLanguage['id']) => {
    const targetLang = langId || selectedLang;
    setIsContinuousLoop(false);
    setIsSpeaking(true);

    speakCoastalAlert({
      languageId: targetLang,
      cycloneData: speechData,
      speed,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false)
    });
  };

  const handleStop = () => {
    stopCoastalAlert();
    setIsSpeaking(false);
    setIsContinuousLoop(false);
  };

  // Multi-lingual sequence (Odia -> Bengali -> Hindi -> English)
  const sequenceLangs: CoastalLanguage['id'][] = ['or', 'bn', 'hi', 'en'];

  const handleStartSequence = (index: number = 0) => {
    if (index >= sequenceLangs.length) {
      setIsSpeaking(false);
      setIsContinuousLoop(false);
      return;
    }

    const currentLang = sequenceLangs[index];
    setSelectedLang(currentLang);
    setLoopCurrentIndex(index);
    setIsSpeaking(true);
    setIsContinuousLoop(true);

    speakCoastalAlert({
      languageId: currentLang,
      cycloneData: speechData,
      speed,
      onStart: () => setIsSpeaking(true),
      onEnd: () => {
        // Pause 1.5 seconds between languages and proceed to next
        setTimeout(() => {
          handleStartSequence(index + 1);
        }, 1500);
      },
      onError: () => {
        setIsSpeaking(false);
        setIsContinuousLoop(false);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#091224] border border-cyan-500/40 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden flex flex-col max-h-[92vh] text-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-950 via-[#0a1733] to-slate-950 p-5 text-white flex items-center justify-between shrink-0 border-b border-sky-800/60">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <Volume2 className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold border border-amber-400/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                  COASTAL LOUDSPEAKER & SPEECH SYNTHESIZER
                </span>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                  Active Sensor Voice Bus
                </span>
              </div>
              <h2 className="font-['Space_Grotesk'] text-lg font-bold text-white mt-0.5">
                Multilingual Voice Broadcast: {activeStorm.name}
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              handleStop();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Active Storm Context Banner */}
          <div className="p-3.5 bg-slate-900/90 border border-sky-800/60 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
              <strong className="text-white font-['Space_Grotesk'] text-sm">{activeStorm.name}</strong>
              <span className="text-slate-400">({activeStorm.category})</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-slate-300">
              <span>Winds: <strong className="text-red-400 font-bold">{activeStorm.maxWindsKmh} km/h</strong></span>
              <span>Landfall: <strong className="text-white font-bold">{activeStorm.landfallLocation}</strong></span>
              <span>Surge: <strong className="text-cyan-400 font-bold">+{speechData.surgeM}m</strong></span>
            </div>
          </div>

          {/* Language Selection Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold font-['Space_Grotesk'] text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Languages className="w-4 h-4 text-cyan-400" />
                Select Coastal Language for Public Awareness
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                {COASTAL_LANGUAGES.length} Regional Coastal Dialects
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COASTAL_LANGUAGES.map((lang) => {
                const isSelected = selectedLang === lang.id;
                return (
                  <button
                    key={lang.id}
                    id={`btn-lang-${lang.id}`}
                    onClick={() => {
                      setSelectedLang(lang.id);
                      if (isSpeaking) {
                        handleSpeakSingle(lang.id);
                      }
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-br from-cyan-950/90 to-blue-950/90 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400 text-white'
                        : 'bg-slate-900/80 border-slate-800 hover:border-sky-700/60 hover:bg-slate-850 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-['Space_Grotesk'] font-bold text-sm text-white flex items-center gap-1.5">
                        <span>{lang.flagIcon}</span>
                        <span>{lang.nativeName}</span>
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                        isSelected ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {lang.id}
                      </span>
                    </div>
                    <div className="text-[11px] font-medium text-slate-200">{lang.name}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{lang.region}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Teleprompter / Speech Transcript Box */}
          <div className="bg-[#030914] text-white rounded-2xl p-5 border border-sky-800/60 relative overflow-hidden shadow-inner">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-sky-950/80">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-mono text-xs font-bold uppercase">
                  {currentLangConfig.nativeName} ({currentLangConfig.name}) Broadcast Text
                </span>
                {isSpeaking && (
                  <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-mono font-bold flex items-center gap-1 animate-pulse border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                    SPEAKING LIVE ON LOUDSPEAKER
                  </span>
                )}
              </div>
              <span className="text-xs font-mono text-cyan-400">
                {currentLangConfig.region.split('(')[0]}
              </span>
            </div>

            {/* Headline */}
            <div className="text-amber-300 font-['Space_Grotesk'] font-bold text-base mb-2">
              {speechContent.headline}
            </div>

            {/* Native script speech paragraph */}
            <p className="text-sm text-slate-100 leading-relaxed font-sans mb-3 bg-white/5 p-3.5 rounded-xl border border-white/10">
              {speechContent.nativeScript}
            </p>

            {/* Phonetic Pronunciation transliteration for pan-India accessibility */}
            <div className="text-[11px] font-mono text-slate-400 bg-black/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-cyan-400 font-bold block mb-1">Acoustic Pronunciation Guide (Latin Transliteration):</span>
              <span className="italic text-slate-300">{speechContent.phoneticLatin}</span>
            </div>

            {/* Sound Wave Animation when speaking */}
            {isSpeaking && (
              <div className="flex items-center justify-center gap-1 mt-3 py-1">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-gradient-to-t from-cyan-400 to-amber-400 rounded-full animate-bounce shadow-[0_0_6px_rgba(6,182,212,0.8)]"
                    style={{
                      height: `${12 + (i % 6) * 6}px`,
                      animationDuration: `${0.35 + (i % 4) * 0.12}s`,
                      animationDelay: `${(i % 6) * 0.06}s`
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Action Instructions Checklist Spoken in Warning */}
          <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-4">
            <div className="text-xs font-bold font-['Space_Grotesk'] text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              Core Action Commands Communicated to Coastal Residents:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-amber-100 font-mono">
              {speechContent.keyInstructions.map((instruction, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-slate-900/80 p-2 rounded-xl border border-amber-500/20">
                  <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 shadow-[0_0_6px_rgba(245,158,11,0.5)]">
                    {idx + 1}
                  </span>
                  <span>{instruction}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Voice Controls: Pace & Multi-lingual Sequential Loop */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-300 font-semibold">Speech Pace:</span>
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
                <button
                  onClick={() => setSpeed(0.82)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    speed === 0.82 ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-[0_0_8px_rgba(6,182,212,0.4)]' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Clear (0.8x)
                </button>
                <button
                  onClick={() => setSpeed(0.92)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    speed === 0.92 ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-[0_0_8px_rgba(6,182,212,0.4)]' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Measured (0.9x)
                </button>
                <button
                  onClick={() => setSpeed(1.1)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    speed === 1.1 ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-[0_0_8px_rgba(6,182,212,0.4)]' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Urgent (1.1x)
                </button>
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-400">
              Audio Engine: <strong className="text-emerald-400">Web Speech API + Web Audio Chime</strong>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-950/90 border-t border-sky-900/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {!isSpeaking ? (
              <button
                id="btn-speak-coastal-alert"
                onClick={() => handleSpeakSingle()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-['Space_Grotesk'] font-bold text-sm transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center gap-2 cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>Speak {currentLangConfig.name} Alert Out Loud</span>
              </button>
            ) : (
              <button
                id="btn-stop-coastal-alert"
                onClick={handleStop}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-['Space_Grotesk'] font-bold text-sm transition-all shadow-[0_0_20px_rgba(239,68,68,0.5)] flex items-center gap-2 animate-pulse cursor-pointer"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Stop Announcement</span>
              </button>
            )}

            <button
              id="btn-continuous-coastal-broadcast"
              onClick={() => {
                if (isContinuousLoop) {
                  handleStop();
                } else {
                  handleStartSequence(0);
                }
              }}
              className={`px-4 py-2.5 rounded-xl font-['Space_Grotesk'] font-bold text-xs transition-all border flex items-center gap-2 cursor-pointer ${
                isContinuousLoop
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse'
                  : 'bg-slate-900 text-slate-200 border-sky-800/60 hover:bg-slate-800'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>
                {isContinuousLoop 
                  ? `Broadcasting Sequence (${sequenceLangs[loopCurrentIndex].toUpperCase()})...`
                  : 'Multi-Lingual Broadcast (Odia → Bengali → Hindi → English)'}
              </span>
            </button>
          </div>

          <button
            onClick={() => {
              handleStop();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-mono transition-colors cursor-pointer"
          >
            Close Console
          </button>
        </div>
      </div>
    </div>
  );
};
