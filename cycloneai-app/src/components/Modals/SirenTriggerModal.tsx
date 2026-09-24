import React, { useState } from 'react';
import { 
  AlertTriangle, 
  X, 
  Radio, 
  Volume2, 
  Send, 
  CheckCircle, 
  ShieldAlert, 
  MessageSquare, 
  Building,
  Languages,
  Square
} from 'lucide-react';
import { StormProfile, TelemetryAlert } from '../../types';
import { playDisasterSirenLoop } from '../../utils/audio';
import { 
  COASTAL_LANGUAGES, 
  CoastalLanguage, 
  speakCoastalAlert, 
  stopCoastalAlert,
  generateSpeechForLanguage 
} from '../../utils/speechSynthesis';

interface SirenTriggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeStorm: StormProfile;
  onAlertBroadcasted: (alert: TelemetryAlert) => void;
}

export const SirenTriggerModal: React.FC<SirenTriggerModalProps> = ({
  isOpen,
  onClose,
  activeStorm,
  onAlertBroadcasted
}) => {
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([
    'Puri District (Odisha)',
    'Ganjam & Gopalpur (Odisha)',
    'Srikakulam (Andhra Pradesh)'
  ]);
  const [selectedVoiceLang, setSelectedVoiceLang] = useState<CoastalLanguage['id']>('or');
  const [isPlayingSiren, setIsPlayingSiren] = useState<boolean>(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState<boolean>(false);
  const [isDispatched, setIsDispatched] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);

  if (!isOpen) return null;

  const availableDistricts = [
    'Puri District (Odisha)',
    'Ganjam & Gopalpur (Odisha)',
    'Srikakulam (Andhra Pradesh)',
    'Kendrapara & Jagatsinghpur',
    'Balasore Coastline',
    'Bhadrak Coastal Belt'
  ];

  const speechData = {
    cycloneName: activeStorm.name,
    category: activeStorm.category,
    landfallLocation: activeStorm.landfallLocation,
    surgeM: activeStorm.coastalDangerZones?.[0]?.stormSurgeHeightM || 3.8,
    windKmh: activeStorm.maxWindsKmh
  };

  const previewContent = generateSpeechForLanguage(selectedVoiceLang, speechData);

  const toggleDistrict = (district: string) => {
    if (selectedDistricts.includes(district)) {
      setSelectedDistricts(selectedDistricts.filter(d => d !== district));
    } else {
      setSelectedDistricts([...selectedDistricts, district]);
    }
  };

  const handleTestSirenSound = () => {
    setIsPlayingSiren(true);
    const stopFn = playDisasterSirenLoop(5);
    setTimeout(() => {
      setIsPlayingSiren(false);
    }, 5000);
  };

  const handleTestVoiceSpeech = () => {
    if (isPlayingVoice) {
      stopCoastalAlert();
      setIsPlayingVoice(false);
      return;
    }

    setIsPlayingVoice(true);
    speakCoastalAlert({
      languageId: selectedVoiceLang,
      cycloneData: speechData,
      onStart: () => setIsPlayingVoice(true),
      onEnd: () => setIsPlayingVoice(false),
      onError: () => setIsPlayingVoice(false)
    });
  };

  const handleDispatchBroadcast = () => {
    setIsDispatched(true);
    playDisasterSirenLoop(6);

    // Speak coastal alert in selected language
    speakCoastalAlert({
      languageId: selectedVoiceLang,
      cycloneData: speechData
    });

    const newAlert: TelemetryAlert = {
      id: `siren-${Date.now()}`,
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' ') + ' UTC',
      severity: 'critical',
      title: `STATE EMERGENCY BROADCAST: CAP LEVEL 4 DISPATCHED`,
      description: `Disaster warning sirens and multilingual voice alert (${selectedVoiceLang.toUpperCase()}) activated across ${selectedDistricts.length} coastal districts for ${activeStorm.name}. Evacuation sirens sounding; cell-broadcast SMS alert dispatched.`,
      source: 'NDMA / SEOC State Command',
      timeAgo: 'Just now',
      read: false,
      category: 'Siren Alert'
    };

    onAlertBroadcasted(newAlert);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white border border-red-200 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-red-50 p-5 border-b border-red-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-700 border border-red-300 shadow-xs">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-['Space_Grotesk'] text-lg font-bold text-red-900">
                  DISASTER SIREN GRID & CAP BROADCAST
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-200 font-bold">
                  LEVEL 4 EMERGENCY
                </span>
              </div>
              <p className="text-[12px] text-slate-600">
                Preemptive State Early Warning System • Target: {activeStorm.name} ({activeStorm.saffirCategory})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white text-slate-500 hover:text-slate-800 border border-red-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {isDispatched ? (
            <div className="p-6 rounded-xl bg-slate-50 border border-emerald-300 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-300">
                <CheckCircle className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-['Space_Grotesk'] text-slate-900">
                  SIREN GRID ARMED & BROADCAST INITIATED
                </h3>
                <p className="text-[13px] text-slate-600 mt-1 max-w-md mx-auto">
                  348 siren towers in {selectedDistricts.length} districts are sounding warble alert tones. CAP SMS packets broadcasted via cell towers with tone override.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 bg-white border border-slate-200 rounded-xl text-left font-mono text-[12px]">
                <div>
                  <div className="text-slate-500 text-[10px]">TOWERS DISPATCHED</div>
                  <div className="text-sky-700 font-bold text-base">348 / 350</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px]">SMS DELIVERY STATUS</div>
                  <div className="text-emerald-600 font-bold text-base">99.8% Active</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px]">ACK RECEIVED</div>
                  <div className="text-red-600 font-bold text-base">SEOC Confirmed</div>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsDispatched(false);
                  onClose();
                }}
                className="px-6 py-2.5 rounded-xl bg-sky-600 text-white font-bold text-sm hover:bg-sky-700 transition-all shadow-xs"
              >
                Close Command Dialog
              </button>
            </div>
          ) : (
            <>
              {/* Target Districts Selection */}
              <div>
                <label className="block text-[12px] font-mono font-bold text-slate-900 mb-2 flex items-center justify-between">
                  <span>SELECT TARGET COASTAL EVACUATION ZONES ({selectedDistricts.length} Selected)</span>
                  <span className="text-sky-700 font-semibold text-[11px]">Grid: 348 Towers Online</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableDistricts.map((district) => {
                    const isChecked = selectedDistricts.includes(district);
                    return (
                      <button
                        key={district}
                        type="button"
                        onClick={() => toggleDistrict(district)}
                        className={`p-3 rounded-xl border text-left text-[12px] flex items-center justify-between transition-all ${
                          isChecked 
                            ? 'bg-sky-50 border-sky-400 text-slate-900 shadow-xs' 
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span className="font-semibold">{district}</span>
                        <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                          isChecked ? 'bg-sky-600 border-sky-600 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isChecked && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message Payload Preview */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="flex items-center gap-1.5 text-sky-700 font-semibold">
                    <MessageSquare className="w-3.5 h-3.5" />
                    COMMON ALERTING PROTOCOL (CAP v1.2) PAYLOAD
                  </span>
                  <span className="text-red-600 font-bold">URGENT: IMMEDIATE</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-[12px] text-slate-800 leading-relaxed shadow-inner">
                  [EMERGENCY WARNING - NDMA/IMD]: {activeStorm.name} ({activeStorm.saffirCategory}) maximum sustained winds {activeStorm.maxWindsKts} kts ({activeStorm.maxWindsKmh} km/h). Landfall window: {activeStorm.landfallWindow} in {activeStorm.landfallLocation}. High tide storm surge +4.2m forecasted. Evacuate low-lying zones immediately to Pucca Cyclone Shelters. All coastal fishing prohibited.
                </div>
              </div>

              {/* Audio Test & Instructions */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-sky-600" />
                  <div>
                    <div className="text-[12px] font-semibold text-slate-900">Siren Audio Synthesizer Test</div>
                    <div className="text-[11px] text-slate-500">Simulate 450Hz-850Hz dual-frequency oscillating coastal horn</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleTestSirenSound}
                  disabled={isPlayingSiren}
                  className={`px-3 py-1.5 rounded-lg border text-[12px] font-mono font-bold transition-all ${
                    isPlayingSiren
                      ? 'bg-red-50 text-red-700 border-red-300 animate-pulse'
                      : 'bg-white text-sky-700 border-slate-300 hover:bg-slate-100 shadow-xs'
                  }`}
                >
                  {isPlayingSiren ? 'Siren Sounding...' : 'Play Test Tone (5s)'}
                </button>
              </div>

              {/* Multilingual Voice Broadcast Engine */}
              <div className="p-4 rounded-xl bg-sky-50/50 border border-sky-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Languages className="w-4 h-4 text-sky-700" />
                    <span className="text-xs font-bold font-['Space_Grotesk'] text-sky-950 uppercase">
                      Coastal Loudspeaker Spoken Voice Announcement
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-sky-700 font-bold bg-sky-100 px-2 py-0.5 rounded">
                    Web Speech API
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {COASTAL_LANGUAGES.map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => {
                        setSelectedVoiceLang(lang.id);
                        if (isPlayingVoice) {
                          stopCoastalAlert();
                          setIsPlayingVoice(false);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all border flex items-center gap-1 ${
                        selectedVoiceLang === lang.id
                          ? 'bg-sky-600 text-white font-bold border-sky-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>{lang.flagIcon}</span>
                      <span>{lang.nativeName}</span>
                    </button>
                  ))}
                </div>

                {/* Subtitle Teleprompter Preview */}
                <div className="p-2.5 rounded-lg bg-white border border-sky-100 text-xs font-sans text-slate-800 line-clamp-2">
                  <strong className="text-sky-700 font-mono text-[11px] block mb-0.5">Spoken Alert Text:</strong>
                  {previewContent.nativeScript}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-mono text-slate-500">
                    Will speak alongside acoustic sirens upon dispatch
                  </span>
                  <button
                    type="button"
                    onClick={handleTestVoiceSpeech}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border flex items-center gap-1.5 ${
                      isPlayingVoice
                        ? 'bg-red-600 text-white border-red-700 animate-pulse'
                        : 'bg-sky-600 hover:bg-sky-700 text-white border-sky-600 shadow-xs'
                    }`}
                  >
                    {isPlayingVoice ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-white" />
                        <span>Stop Voice</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Audition {COASTAL_LANGUAGES.find(l => l.id === selectedVoiceLang)?.name} Voice</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-[13px] font-mono text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDispatchBroadcast}
                  disabled={selectedDistricts.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-['Space_Grotesk'] font-bold text-sm hover:bg-red-700 transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>ARM TOWERS & DISPATCH CAP ALERT</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
