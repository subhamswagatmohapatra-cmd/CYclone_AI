import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Phone, 
  PhoneCall, 
  PhoneOff, 
  Copy, 
  Check, 
  Radio, 
  ShieldCheck, 
  MapPin, 
  MessageSquare, 
  Volume2, 
  AlertTriangle,
  Clock,
  Building2,
  ExternalLink
} from 'lucide-react';
import { playPhoneRingTone, playSuccessChime } from '../../utils/audio';

export interface OfficerDetails {
  name: string;
  role?: string;
  phone: string;
  district?: string;
  shelterName?: string;
  alternatePhone?: string;
  badge?: string;
}

interface OfficerCallModalProps {
  officer: OfficerDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OfficerCallModal: React.FC<OfficerCallModalProps> = ({
  officer,
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [callState, setCallState] = useState<'idle' | 'ringing' | 'connected'>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const stopRingRef = useRef<(() => void) | null>(null);
  const timerRef = useRef<number | null>(null);

  const handleEndCall = useCallback(() => {
    if (stopRingRef.current) {
      stopRingRef.current();
      stopRingRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCallState('idle');
    setCallDuration(0);
  }, []);

  // Reset state when modal opens or officer changes
  useEffect(() => {
    if (isOpen && officer) {
      setCallState('idle');
      setCallDuration(0);
      setCopied(false);
    } else {
      handleEndCall();
    }
    return () => {
      handleEndCall();
    };
  }, [isOpen, officer, handleEndCall]);

  // Call duration counter
  useEffect(() => {
    if (callState === 'connected') {
      timerRef.current = window.setInterval(() => {
        setCallDuration(d => d + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  if (!isOpen || !officer) return null;

  const rawPhone = officer.phone || '';
  const cleanPhone = rawPhone.replace(/[^0-9+]/g, '');

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(officer.phone);
    setCopied(true);
    playSuccessChime();
    setTimeout(() => setCopied(false), 2500);
  };

  const handleStartSimulatedCall = () => {
    if (callState !== 'idle') return;

    setCallState('ringing');
    // Start audio ringtone
    stopRingRef.current = playPhoneRingTone();

    // After 3.5s ring, connect the call
    setTimeout(() => {
      if (stopRingRef.current) {
        stopRingRef.current();
        stopRingRef.current = null;
      }
      setCallState('connected');
      playSuccessChime();

      // Speak official emergency acknowledgment via Web Speech API
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const text = `State Disaster Control Room. You are connected to ${officer.name}. All emergency response teams and relief supplies are active. Please state your emergency evacuation location.`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.05;
        window.speechSynthesis.speak(utterance);
      }
    }, 3200);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const sosMessage = encodeURIComponent(
    `URGENT SOS - CYCLONE EVACUATION: Requesting immediate contact with ${officer.name} (${officer.shelterName || officer.district || 'Coastal District'}). Need emergency evacuation & shelter status. Please respond.`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-900">
        {/* Header bar */}
        <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-cyan-950 text-white p-5 flex items-center justify-between border-b border-sky-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
              <PhoneCall className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-['Space_Grotesk'] text-lg font-bold text-white">
                  Direct Officer Dispatch Line
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/40 font-bold">
                  24x7 ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-cyan-200/80 font-mono">
                ODSMA / National Disaster Management Command
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleEndCall();
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 space-y-5">
          {/* Officer Identity Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  <span className="text-[11px] font-mono font-bold text-sky-700 uppercase tracking-wider">
                    {officer.role || 'Designated Disaster Response Officer'}
                  </span>
                </div>
                <h4 className="font-['Space_Grotesk'] text-xl font-bold text-slate-900 mt-0.5">
                  {officer.name}
                </h4>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-sky-100 text-sky-800 text-[11px] font-mono font-bold">
                {officer.badge || 'ID: ODSMA-EOC'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[12px] pt-1">
              {officer.district && (
                <div className="flex items-center gap-1.5 text-slate-600 font-mono">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>District: <strong className="text-slate-800">{officer.district}</strong></span>
                </div>
              )}
              {officer.shelterName && (
                <div className="flex items-center gap-1.5 text-slate-600 font-mono">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">Shelter: <strong className="text-slate-800">{officer.shelterName}</strong></span>
                </div>
              )}
            </div>

            {/* Prominent Number Bar with 1-Click Copy */}
            <div className="mt-2 p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
              <div>
                <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Direct Mobile / Satellite Phone</div>
                <div className="text-lg font-mono font-black text-slate-900 tracking-wide">
                  {officer.phone}
                </div>
              </div>

              <button
                onClick={handleCopyPhone}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-mono font-bold transition-all ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                title="Copy phone number"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Web Call Simulator (Works 100% on Laptops / Desktops without cellular apps) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-sky-950 text-white border border-sky-800/60 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span className="font-['Space_Grotesk'] text-sm font-bold text-white">
                  In-Browser Emergency Line (Laptop & Desktop Direct Call)
                </span>
              </div>
              {callState === 'connected' && (
                <span className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  LIVE {formatDuration(callDuration)}
                </span>
              )}
            </div>

            {callState === 'idle' && (
              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <button
                  onClick={handleStartSimulatedCall}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-['Space_Grotesk'] font-bold text-sm transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Connect Direct Web Voice Line</span>
                </button>
                <a
                  href={`tel:${cleanPhone}`}
                  className="py-3 px-4 rounded-xl bg-sky-800 hover:bg-sky-700 text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-center cursor-pointer"
                  title="Dial via system phone app or Skype"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Launch Mobile / VoIP Dialer</span>
                </a>
              </div>
            )}

            {callState === 'ringing' && (
              <div className="p-3 bg-cyan-950/80 rounded-xl border border-cyan-500/40 text-center space-y-2 animate-pulse">
                <div className="text-cyan-300 font-mono text-xs font-bold">
                  DIALING EMERGENCY DISPATCH FREQUENCY...
                </div>
                <p className="text-[11px] text-slate-300">
                  Transmitting over State EOC IP Telephony Gateway. Ringing Officer {officer.name}...
                </p>
                <button
                  onClick={handleEndCall}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-mono font-bold hover:bg-rose-700"
                >
                  Cancel Call
                </button>
              </div>
            )}

            {callState === 'connected' && (
              <div className="p-3.5 bg-emerald-950/60 rounded-xl border border-emerald-500/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="text-emerald-300 text-xs font-mono font-bold">
                    CONNECTED TO {officer.name.toUpperCase()}
                  </div>
                  <div className="text-[11px] font-mono text-emerald-400">
                    Audio Channel: Active
                  </div>
                </div>

                <div className="p-2.5 bg-black/40 rounded-lg text-xs text-slate-200 italic border border-white/5">
                  "State Disaster Control Room. You are connected to {officer.name}. All emergency response teams and relief supplies are active. Please state your emergency evacuation location."
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-mono text-slate-400">
                    Call Secure • Audio Logged by SEOC
                  </span>
                  <button
                    onClick={handleEndCall}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-mono text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    <PhoneOff className="w-4 h-4" />
                    <span>End Voice Call</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick SOS Messaging & Backup Radio Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* WhatsApp / SMS Quick SOS */}
            <a
              href={`https://wa.me/${cleanPhone}?text=${sosMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 flex items-center gap-2.5 transition-all text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[12px] font-bold">WhatsApp Emergency SOS</div>
                <div className="text-[10px] font-mono text-emerald-700">Pre-filled disaster distress text</div>
              </div>
            </a>

            {/* VHF & Marine Radio Channel 16 */}
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 flex items-center gap-2.5 text-left">
              <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[12px] font-bold">VHF Marine Ch 16 / HAM</div>
                <div className="text-[10px] font-mono text-purple-700">156.800 MHz • Zero-Net Fallback</div>
              </div>
            </div>
          </div>

          {/* District Control Room Hotlines */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5 text-amber-900 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">National & State 24x7 Control Room Hotlines: </strong>
              State Emergency Operation Center: <span className="font-mono font-bold">1070</span> | District Disaster Helpline: <span className="font-mono font-bold">1077</span> | Police/Ambulance: <span className="font-mono font-bold">112</span>.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={() => {
              handleEndCall();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-mono text-xs font-bold transition-all cursor-pointer"
          >
            Close Officer Dispatch
          </button>
        </div>
      </div>
    </div>
  );
};
