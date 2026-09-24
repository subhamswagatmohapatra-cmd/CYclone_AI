import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Download, 
  Eye, 
  Layers, 
  Info, 
  Target, 
  CheckCircle, 
  ShieldCheck,
  ChevronRight,
  Flame
} from 'lucide-react';
import { StormProfile } from '../types';
import { FEATURE_IMPORTANCE_DATA, BASIN_DISTRIBUTION } from '../data/mockData';

interface ExplainableAiViewProps {
  activeStorm: StormProfile;
  onOpenReportModal: () => void;
}

export const ExplainableAiView: React.FC<ExplainableAiViewProps> = ({
  activeStorm,
  onOpenReportModal
}) => {
  const [activeHotspot, setActiveHotspot] = useState<number>(0);
  const [saliencyMode, setSaliencyMode] = useState<'GRAD_CAM' | 'RAW_INFRARED' | 'OVERLAY'>('OVERLAY');

  const hotspots = [
    {
      id: 0,
      title: 'Eyewall Convection Zone',
      attribution: '+0.84',
      type: 'Positive Weight',
      desc: 'Dominant latent feature contributing 44.8% of intensity classification score. Intense deep convective cloud towers with cloud tops < -84°C.',
      x: 52,
      y: 48,
    },
    {
      id: 1,
      title: 'Outer Rainband Vorticity',
      attribution: '+0.62',
      type: 'Positive Weight',
      desc: 'Secondary feeder band cyclonic curl. Drives peripheral angular momentum influx into central dense overcast.',
      x: 68,
      y: 36,
    },
    {
      id: 2,
      title: 'Dry Air Intrusion Baroclinicity',
      attribution: '-0.41',
      type: 'Negative Influx',
      desc: 'Mid-tropospheric dry air pocket detected on northwest quadrant slightly inhibiting explosive intensification rate.',
      x: 34,
      y: 32,
    }
  ];

  return (
    <div className="flex flex-col gap-6 text-slate-100 p-6 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#091224]/95 backdrop-blur-xl p-5 rounded-2xl border border-sky-800/60 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold">
              MODULE 04
            </span>
            <span className="text-[11px] font-mono text-cyan-400 font-medium">Explainable AI (XAI) & Basin Analytics</span>
          </div>
          <h1 className="font-['Space_Grotesk'] text-2xl font-bold text-white">
            Model Interpretability & Feature Attribution
          </h1>
          <p className="text-[13px] text-slate-300 mt-0.5">
            Transparent meteorological neural physics validation using Grad-CAM++ saliency activations and SHAP game-theoretic game values.
          </p>
        </div>

        <button
          onClick={onOpenReportModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-[13px] transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export XAI Audit Report</span>
        </button>
      </div>

      {/* Main Grid: Left Grad-CAM++ & Hotspot Inspector, Right SHAP & Basin Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Layer 14 Grad-CAM++ Saliency (7 cols) */}
        <div className="lg:col-span-7 bg-[#091224]/95 backdrop-blur-xl rounded-2xl p-5 border border-sky-800/60 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-sky-950/80">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-cyan-400" />
                <h3 className="font-['Space_Grotesk'] text-base font-bold text-white">
                  LAYER 14 GRAD-CAM++ SALIENCY MAP
                </h3>
              </div>

              {/* Mode toggles */}
              <div className="flex items-center gap-1 bg-[#040a17] p-1 rounded-xl text-[11px] font-mono border border-sky-900/60">
                <button
                  onClick={() => setSaliencyMode('OVERLAY')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    saliencyMode === 'OVERLAY' ? 'bg-cyan-600 text-white font-bold shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  XAI Overlay
                </button>
                <button
                  onClick={() => setSaliencyMode('GRAD_CAM')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    saliencyMode === 'GRAD_CAM' ? 'bg-cyan-600 text-white font-bold shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Saliency Only
                </button>
                <button
                  onClick={() => setSaliencyMode('RAW_INFRARED')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    saliencyMode === 'RAW_INFRARED' ? 'bg-cyan-600 text-white font-bold shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Raw TIR
                </button>
              </div>
            </div>

            {/* Saliency Heatmap Viewport */}
            <div className="relative w-full h-[360px] rounded-xl overflow-hidden bg-[#040e1f] border border-sky-900/60 group shadow-inner">
              {/* Heatmap Layer */}
              <div 
                className="absolute inset-0 transition-all duration-300"
                style={{
                  background: saliencyMode === 'RAW_INFRARED'
                    ? `radial-gradient(circle at 52% 48%, #ffffff 0%, #cbd5e1 20%, #475569 45%, #0f172a 75%)`
                    : saliencyMode === 'GRAD_CAM'
                      ? `radial-gradient(circle at 52% 48%, rgba(255, 0, 0, 0.95) 0%, rgba(255, 120, 0, 0.8) 22%, rgba(255, 230, 0, 0.7) 35%, rgba(0, 241, 253, 0.5) 55%, rgba(0, 0, 0, 0.95) 75%)`
                      : `radial-gradient(circle at 52% 48%, rgba(255, 30, 30, 0.8) 0%, rgba(255, 140, 0, 0.65) 20%, rgba(0, 241, 253, 0.45) 42%, rgba(10, 20, 50, 0.85) 70%)`
                }}
              >
                {/* Visual mesh & contour lines */}
                <svg className="w-full h-full pointer-events-none" viewBox="0 0 600 360">
                  <circle cx="312" cy="172" r="30" fill="none" stroke="#fff" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                  <circle cx="312" cy="172" r="75" fill="none" stroke="#00f1fd" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.6" />
                  <circle cx="312" cy="172" r="140" fill="none" stroke="#00f1fd" strokeWidth="1" strokeDasharray="5 5" strokeOpacity="0.3" />
                </svg>

                {/* Hotspot Nodes on Canvas */}
                {hotspots.map((node) => {
                  const isSelected = activeHotspot === node.id;
                  return (
                    <div
                      key={node.id}
                      onClick={() => setActiveHotspot(node.id)}
                      className="absolute cursor-pointer transition-transform hover:scale-125"
                      style={{ top: `${node.y}%`, left: `${node.x}%`, transform: 'translate(-50%, -50%)' }}
                    >
                      <div className="relative flex items-center justify-center">
                        <span className={`w-8 h-8 rounded-full border animate-ping absolute ${
                          node.attribution.startsWith('+') ? 'border-rose-400' : 'border-cyan-400'
                        }`} />
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold border-2 ${
                          isSelected 
                            ? 'bg-cyan-500 text-white border-white shadow-[0_0_12px_rgba(6,182,212,0.8)]' 
                            : node.attribution.startsWith('+')
                              ? 'bg-rose-600 text-white border-rose-300'
                              : 'bg-cyan-700 text-white border-cyan-300'
                        }`}>
                          {node.id + 1}
                        </div>
                        <div className={`absolute top-6 whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-mono font-bold shadow-lg border ${
                          isSelected ? 'bg-cyan-600 text-white border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'bg-[#040a17]/95 text-slate-200 border-sky-900/80'
                        }`}>
                          {node.attribution}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* HUD Saliency Indicator */}
              <div className="absolute top-3 left-3 bg-[#040a17]/90 border border-sky-900/80 p-2.5 rounded-xl text-[11px] font-mono backdrop-blur-md shadow-2xl text-slate-200">
                <div className="text-slate-400">TARGET LAYER: <span className="text-cyan-300 font-bold">ConvNeXt.Block4.Conv2d</span></div>
                <div className="text-slate-400">SALIENCY THRESHOLD: <span className="text-white font-bold">&gt; 0.65 Activation</span></div>
              </div>

              {/* HUD Heatmap Legend */}
              <div className="absolute bottom-3 left-3 bg-[#040a17]/90 border border-sky-900/80 p-2 rounded-xl text-[10px] font-mono backdrop-blur-md flex items-center gap-2 shadow-2xl text-slate-200">
                <span className="text-slate-400 font-semibold">Attribution:</span>
                <div className="w-28 h-2.5 rounded-full bg-gradient-to-r from-blue-700 via-yellow-400 to-red-600"></div>
                <div className="flex justify-between w-full text-[9px] text-slate-400">
                  <span>Low</span>
                  <span className="font-bold text-rose-400">Peak (+0.84)</span>
                </div>
              </div>
            </div>

            {/* Active Hotspot Inspector Card */}
            <div className="mt-4 p-4 rounded-xl bg-[#040a17]/80 border border-sky-900/60 shadow-inner">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 flex items-center justify-center text-[11px] font-mono font-bold">
                    {activeHotspot + 1}
                  </div>
                  <h4 className="font-['Space_Grotesk'] text-[14px] font-bold text-white">
                    {hotspots[activeHotspot].title}
                  </h4>
                </div>
                <span className={`text-[12px] font-mono font-bold px-2 py-0.5 rounded border ${
                  hotspots[activeHotspot].attribution.startsWith('+') 
                    ? 'bg-red-950 text-rose-300 border-rose-500/40' 
                    : 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
                }`}>
                  Activation: {hotspots[activeHotspot].attribution}
                </span>
              </div>
              <p className="text-[12px] text-slate-300 leading-relaxed mt-2">
                {hotspots[activeHotspot].desc}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-sky-950/80 grid grid-cols-3 gap-2 text-center font-mono text-[11px]">
            <div className="bg-[#040a17]/80 border border-sky-900/60 p-2 rounded-lg">
              <div className="text-slate-400 text-[10px]">CONVECTION TILT</div>
              <div className="text-cyan-300 font-bold">1.4° West</div>
            </div>
            <div className="bg-[#040a17]/80 border border-sky-900/60 p-2 rounded-lg">
              <div className="text-slate-400 text-[10px]">ROTATION MOMENTUM</div>
              <div className="text-rose-400 font-bold drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]">84.2 Knots</div>
            </div>
            <div className="bg-[#040a17]/80 border border-sky-900/60 p-2 rounded-lg">
              <div className="text-slate-400 text-[10px]">MODEL FIDELITY</div>
              <div className="text-emerald-400 font-bold drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">99.2%</div>
            </div>
          </div>
        </div>

        {/* Right Column: SHAP Feature Rankings & Basin Distribution (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* SHAP Feature Importance */}
          <div className="bg-[#091224]/95 backdrop-blur-xl rounded-2xl p-5 border border-sky-800/60 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-sky-950/80">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-400" />
                <h3 className="font-['Space_Grotesk'] text-base font-bold text-white">
                  SHAP FEATURE ATTRIBUTION
                </h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-300 font-semibold">N=2000 Iterations</span>
            </div>

            <div className="space-y-3 font-mono text-[11px]">
              {FEATURE_IMPORTANCE_DATA.map((item: { name: string; percentage: number; color: string; detail: string }) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="text-slate-200 font-medium">{item.name}</span>
                    <span className="text-cyan-300 font-bold">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-[#040a17] h-2.5 rounded-full overflow-hidden border border-sky-950">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400">{item.detail}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Global Basin Activation Distribution */}
          <div className="bg-[#091224]/95 backdrop-blur-xl rounded-2xl p-5 border border-sky-800/60 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-sky-950/80">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-cyan-400" />
                <h3 className="font-['Space_Grotesk'] text-base font-bold text-white">
                  GLOBAL BASIN DISTRIBUTION SHARE
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">2026 Archive</span>
            </div>

            {/* Stacked bar representation */}
            <div className="w-full h-4 rounded-full overflow-hidden flex mb-4 border border-sky-950">
              {BASIN_DISTRIBUTION.map((basin: { name: string; percentage: number; color: string; count: number }) => (
                <div 
                  key={basin.name}
                  style={{ width: `${basin.percentage}%`, backgroundColor: basin.color }}
                  title={`${basin.name}: ${basin.percentage}%`}
                />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              {BASIN_DISTRIBUTION.map((basin: { name: string; percentage: number; color: string; count: number }) => (
                <div key={basin.name} className="p-2.5 rounded-lg bg-[#040a17]/80 border border-sky-900/60 flex items-center justify-between border-l-4" style={{ borderLeftColor: basin.color }}>
                  <div>
                    <div className="text-white font-semibold">{basin.name.split('(')[0]}</div>
                    <div className="text-[10px] text-slate-400">{basin.count} Storms Logged</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] font-bold" style={{ color: basin.color }}>{basin.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
