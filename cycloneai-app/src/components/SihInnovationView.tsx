import React from 'react';
import { 
  Award, 
  Sparkles, 
  BrainCircuit, 
  WifiOff, 
  Radio, 
  Waves, 
  Cpu, 
  Users, 
  FileText, 
  ExternalLink, 
  Check, 
  X, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  Activity
} from 'lucide-react';
import { SIH_INNOVATIONS } from '../data/mockData';
import { SihInnovationItem } from '../types';

interface SihInnovationViewProps {
  onOpenSirenModal: () => void;
  onOpenVoiceModal?: () => void;
  onOpenBulletinModal: () => void;
  onOpenXaiModal: () => void;
  onNavigateToTab: (tab: any) => void;
}

export const SihInnovationView: React.FC<SihInnovationViewProps> = ({
  onOpenSirenModal,
  onOpenVoiceModal,
  onOpenBulletinModal,
  onOpenXaiModal,
  onNavigateToTab,
}) => {
  const handleFeatureAction = (item: SihInnovationItem) => {
    if (item.id === 'sih-siren' && onOpenVoiceModal) {
      onOpenVoiceModal();
    } else if (item.actionModal === 'siren') {
      onOpenSirenModal();
    } else if (item.actionModal === 'bulletin') {
      onOpenBulletinModal();
    } else if (item.actionModal === 'xai') {
      onOpenXaiModal();
    } else if (item.actionTab) {
      onNavigateToTab(item.actionTab);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Explainable AI':
        return <BrainCircuit className="w-5 h-5 text-indigo-600" />;
      case 'Offline Mesh PWA':
        return <WifiOff className="w-5 h-5 text-emerald-600" />;
      case 'Acoustic Siren':
        return <Radio className="w-5 h-5 text-red-600" />;
      case 'Evacuation Routing':
        return <Waves className="w-5 h-5 text-cyan-600" />;
      case 'Ensemble AI':
        return <Cpu className="w-5 h-5 text-sky-600" />;
      case 'Two-Way SOS':
        return <Users className="w-5 h-5 text-amber-600" />;
      case 'CAP Protocol':
        return <FileText className="w-5 h-5 text-purple-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-sky-600" />;
    }
  };

  return (
    <div className="flex flex-col gap-6 text-slate-100 p-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[#091224]/95 backdrop-blur-xl rounded-2xl p-6 text-white shadow-2xl border border-sky-800/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/50 text-xs font-mono font-bold mb-3 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
              <Award className="w-4 h-4 text-amber-400" />
              SMART INDIA HACKATHON 2026 JURY EVALUATION MATRIX
            </div>

            <h1 className="font-['Space_Grotesk'] text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              7 Breakthrough Innovations Beyond IMD
            </h1>

            <p className="text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
              Why traditional India Meteorological Department (IMD) portals fall short during extreme landfall crises, and how CycloneAI’s neural architecture introduces life-saving capabilities missing from legacy government systems.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={onOpenSirenModal}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-['Space_Grotesk'] font-bold text-xs transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Radio className="w-4 h-4" />
              <span>Test Live Siren</span>
            </button>
            <button
              onClick={onOpenXaiModal}
              className="px-4 py-2.5 rounded-xl bg-[#040a17] hover:bg-slate-800 text-cyan-300 font-mono text-xs transition-all border border-cyan-500/40 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <BrainCircuit className="w-4 h-4 text-cyan-400" />
              <span>Inspect Neural XAI</span>
            </button>
          </div>
        </div>

        {/* Quantified Jury Impact Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-sky-950/80 font-mono text-xs">
          <div className="bg-[#040a17]/80 p-3 rounded-xl border border-sky-900/60">
            <div className="text-slate-400 text-[10px] uppercase">Warning Latency</div>
            <div className="text-xl font-bold text-emerald-400 font-['Space_Grotesk'] drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]">-85% Faster</div>
            <div className="text-[10px] text-slate-400">3 min vs 45 min manual bulletin</div>
          </div>
          <div className="bg-[#040a17]/80 p-3 rounded-xl border border-sky-900/60">
            <div className="text-slate-400 text-[10px] uppercase">Offline Mesh Survivability</div>
            <div className="text-xl font-bold text-cyan-400 font-['Space_Grotesk'] drop-shadow-[0_0_6px_rgba(6,182,212,0.5)]">100% Offline</div>
            <div className="text-[10px] text-slate-400">Works during coastal telecom collapse</div>
          </div>
          <div className="bg-[#040a17]/80 p-3 rounded-xl border border-sky-900/60">
            <div className="text-slate-400 text-[10px] uppercase">Language Inclusivity</div>
            <div className="text-xl font-bold text-amber-400 font-['Space_Grotesk']">4 Indian Dialects</div>
            <div className="text-[10px] text-slate-400">Odia, Bengali, Hindi & English voice</div>
          </div>
          <div className="bg-[#040a17]/80 p-3 rounded-xl border border-sky-900/60">
            <div className="text-slate-400 text-[10px] uppercase">Inference Cycle</div>
            <div className="text-xl font-bold text-purple-400 font-['Space_Grotesk']">15-Min Rapid</div>
            <div className="text-[10px] text-slate-400">vs IMD 6-hourly NWP updates</div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Matrix Table */}
      <div className="bg-[#091224]/95 backdrop-blur-xl rounded-2xl p-6 border border-sky-800/60 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-sky-950/80">
          <div>
            <h2 className="font-['Space_Grotesk'] text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Side-by-Side Architectural Comparison: IMD vs CycloneAI
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Direct comparison between existing Ministry of Earth Sciences/IMD systems and our AI-first disaster engine.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {SIH_INNOVATIONS.map((item, idx) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl border border-sky-900/60 hover:border-cyan-400/60 transition-all bg-[#040a17]/80 shadow-inner"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#081329] flex items-center justify-center border border-sky-800/80">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
                      INNOVATION #{idx + 1}: {item.category.toUpperCase()}
                    </span>
                    <h3 className="font-['Space_Grotesk'] text-base font-bold text-white mt-0.5">
                      {item.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400">SIH Impact Score</span>
                    <div className="text-sm font-bold font-mono text-amber-400">{item.juryImpactScore}</div>
                  </div>
                  <button
                    onClick={() => handleFeatureAction(item)}
                    className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-medium transition-all shadow-[0_0_12px_rgba(6,182,212,0.4)] flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Comparison Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                {/* Traditional IMD Column */}
                <div className="bg-red-950/30 p-3.5 rounded-xl border border-red-500/30 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-rose-300 uppercase flex items-center gap-1 mb-1.5 font-['Space_Grotesk']">
                      <X className="w-4 h-4 text-rose-400" />
                      Traditional IMD Website / RSMC Limitations
                    </div>
                    <p className="text-slate-300 font-sans text-xs leading-relaxed">
                      {item.imdLimitation}
                    </p>
                  </div>
                  <div className="mt-2 text-[10px] text-rose-400 font-mono font-semibold">
                    Status: Static / Legacy Architecture
                  </div>
                </div>

                {/* CycloneAI Advantage Column */}
                <div className="bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-500/40 flex flex-col justify-between shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                  <div>
                    <div className="text-[11px] font-bold text-emerald-300 uppercase flex items-center gap-1 mb-1.5 font-['Space_Grotesk']">
                      <Check className="w-4 h-4 text-emerald-400" />
                      CycloneAI Smart India Hackathon Breakthrough
                    </div>
                    <p className="text-slate-200 font-sans text-xs leading-relaxed">
                      {item.cycloneAiAdvantage}
                    </p>
                  </div>
                  <div className="mt-2 text-[10px] text-emerald-400 font-mono font-semibold flex items-center justify-between">
                    <span>Tech: {item.techStack}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
