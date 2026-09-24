import React, { useState } from 'react';
import { 
  Wind, 
  RotateCw, 
  Layers, 
  Navigation, 
  TrendingDown, 
  TrendingUp, 
  Compass, 
  Calendar,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { StormProfile } from '../types';
import { TrajectoryEnsembleGoogleMap } from './Maps/TrajectoryEnsembleGoogleMap';

interface TrackPredictionViewProps {
  activeStorm: StormProfile;
}

export const TrackPredictionView: React.FC<TrackPredictionViewProps> = ({
  activeStorm
}) => {
  const [isRecomputing, setIsRecomputing] = useState<boolean>(false);
  const [selectedHorizon, setSelectedHorizon] = useState<number>(0);
  const [showSpaghetti, setShowSpaghetti] = useState<boolean>(true);

  const handleRecompute = () => {
    setIsRecomputing(true);
    setTimeout(() => {
      setIsRecomputing(false);
    }, 1200);
  };

  const horizons = activeStorm.forecastMatrix;
  const currentHorizon = horizons[selectedHorizon] || horizons[0];

  return (
    <div className="flex flex-col gap-6 text-slate-100 p-6 max-w-7xl mx-auto">
      {/* Module Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#091224]/95 backdrop-blur-xl p-5 rounded-2xl border border-sky-800/60 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-bold shadow-[0_0_8px_rgba(6,182,212,0.3)]">
              MODULE 03
            </span>
            <span className="text-[11px] font-mono text-cyan-400 font-medium">Meteorological AI Forecast Engine v4.2</span>
          </div>
          <h1 className="font-['Space_Grotesk'] text-2xl font-bold text-white">
            Multi-Horizon Ensemble Trajectory & Intensity Prediction
          </h1>
          <p className="text-[13px] text-slate-300 mt-0.5">
            42-member physics-guided neural network ensemble predicting cyclonic track cone, forward velocity, and central pressure deepening.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRecompute}
            disabled={isRecomputing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-['Space_Grotesk'] font-bold text-[13px] transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] disabled:opacity-50 cursor-pointer"
          >
            <RotateCw className={`w-4 h-4 ${isRecomputing ? 'animate-spin' : ''}`} />
            <span>{isRecomputing ? 'Computing 50 MC Passes...' : 'Recompute Ensembles'}</span>
          </button>
        </div>
      </div>

      {/* Multi-Horizon Forecast Matrix Table */}
      <div className="bg-[#091224]/95 backdrop-blur-xl rounded-2xl p-5 border border-sky-800/60 shadow-2xl">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-sky-950/80">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <h3 className="font-['Space_Grotesk'] text-base font-bold text-white">
              MULTI-HORIZON INTENSITY & LANDFALL MATRIX
            </h3>
          </div>
          <span className="text-[11px] font-mono text-cyan-300 font-semibold">
            Active Target: {activeStorm.name} ({activeStorm.saffirCategory})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[12px]">
            <thead>
              <tr className="border-b border-sky-950/80 text-slate-400 text-[11px]">
                <th className="pb-2">HORIZON</th>
                <th className="pb-2">COORDINATES</th>
                <th className="pb-2">WIND SPEED</th>
                <th className="pb-2">PRESSURE</th>
                <th className="pb-2">TRANSLATION</th>
                <th className="pb-2">INTENSITY CLASS</th>
                <th className="pb-2 text-right">UNCERTAINTY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {horizons.map((h, idx) => {
                const isSelected = selectedHorizon === idx;
                return (
                  <tr 
                    key={h.horizon}
                    onClick={() => setSelectedHorizon(idx)}
                    className={`cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-cyan-950/80 text-cyan-200 font-medium border-l-2 border-cyan-400' 
                        : 'hover:bg-slate-900/60 text-slate-300'
                    }`}
                  >
                    <td className="py-2.5 font-bold flex items-center gap-2 pl-2">
                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]' : 'bg-slate-600'}`} />
                      {h.horizon}
                    </td>
                    <td className="py-2.5 text-slate-200">{h.coordinates}</td>
                    <td className="py-2.5 font-bold text-cyan-300">{h.windSpeedKts} kts</td>
                    <td className="py-2.5 text-rose-300 font-bold">{h.pressureHpa} hPa</td>
                    <td className="py-2.5 text-slate-400">{h.translation}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        h.category === 'Cat 5' ? 'bg-red-950/80 text-red-300 border border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.3)]' :
                        h.category === 'Cat 4' ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50' : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {h.category}
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-slate-400">±{h.uncertaintyRadiusKm} km</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Grid: Ensemble Spaghetti Map & Intensity Splines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Ensemble Trajectory Map (7 cols) */}
        <div className="lg:col-span-7 bg-[#091224]/95 backdrop-blur-xl rounded-2xl p-5 border border-sky-800/60 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-sky-950/80">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-cyan-400" />
                <h3 className="font-['Space_Grotesk'] text-base font-bold text-white">
                  ENSEMBLE CONE & SPAGHETTI PLOT
                </h3>
              </div>
              <button
                onClick={() => setShowSpaghetti(!showSpaghetti)}
                className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  showSpaghetti 
                    ? 'bg-cyan-950/80 border-cyan-400/80 text-cyan-300 font-semibold shadow-[0_0_8px_rgba(6,182,212,0.3)]' 
                    : 'border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Spaghetti Models: {showSpaghetti ? 'Visible' : 'Hidden'}
              </button>
            </div>

            {/* Real Google Maps Trajectory & Ensemble Spaghetti Viewport */}
            <TrajectoryEnsembleGoogleMap
              activeStorm={activeStorm}
              selectedHorizonIndex={selectedHorizon}
              onSelectHorizon={setSelectedHorizon}
              showSpaghetti={showSpaghetti}
              onToggleSpaghetti={() => setShowSpaghetti(!showSpaghetti)}
            />
          </div>

          <div className="mt-4 pt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Selected Waypoint: <strong className="text-cyan-300">{currentHorizon.horizon}</strong> ({currentHorizon.coordinates})</span>
            <span className="text-rose-400 font-semibold">Landfall Deviation: ±18 km</span>
          </div>
        </div>

        {/* Right Column: Future Wind Speed & Central Pressure Splines (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Wind Speed Forecast Curve */}
          <div className="bg-[#091224]/95 backdrop-blur-xl rounded-2xl p-5 border border-sky-800/60 shadow-2xl">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-sky-950/80">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <h3 className="font-['Space_Grotesk'] text-base font-bold text-white">
                  Intensity Spline (Wind Speed kts)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-rose-400 font-bold">Peak: 165 kts</span>
            </div>

            {/* SVG Spline Chart */}
            <div className="relative w-full h-[140px] bg-[#030914] rounded-xl p-3 border border-sky-900/60 shadow-inner">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 320 100">
                {/* Horizontal reference grid lines */}
                <line x1="0" y1="20" x2="320" y2="20" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="50" x2="320" y2="50" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="80" x2="320" y2="80" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />

                {/* Spline area */}
                <path 
                  d="M 10 20 L 70 15 L 140 28 L 220 55 L 300 85 L 300 100 L 10 100 Z" 
                  fill="url(#windGrad)" 
                />
                {/* Spline stroke */}
                <path 
                  d="M 10 20 L 70 15 L 140 28 L 220 55 L 300 85" 
                  fill="none" 
                  stroke="#00f1fd" 
                  strokeWidth="2.5" 
                />

                {/* Markers */}
                <circle cx="10" cy="20" r="3.5" fill="#00f1fd" />
                <circle cx="70" cy="15" r="4.5" fill="#ef4444" />
                <circle cx="140" cy="28" r="3.5" fill="#00f1fd" />
                <circle cx="220" cy="55" r="3.5" fill="#00f1fd" />
                <circle cx="300" cy="85" r="3.5" fill="#00f1fd" />

                <defs>
                  <linearGradient id="windGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#00f1fd" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#00f1fd" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-2">
              <span>Current (160kt)</span>
              <span className="text-cyan-400 font-bold">+06h (165kt)</span>
              <span>+12h (155kt)</span>
              <span>+24h (140kt)</span>
              <span>+48h (110kt)</span>
            </div>
          </div>

          {/* Central Pressure Deepening Curve */}
          <div className="bg-[#091224]/95 backdrop-blur-xl rounded-2xl p-5 border border-sky-800/60 shadow-2xl">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-sky-950/80">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-rose-400" />
                <h3 className="font-['Space_Grotesk'] text-base font-bold text-white">
                  Central Pressure (hPa) Deepening
                </h3>
              </div>
              <span className="text-[11px] font-mono text-cyan-300 font-bold">Min: 908 hPa</span>
            </div>

            {/* SVG Spline Chart */}
            <div className="relative w-full h-[140px] bg-[#030914] rounded-xl p-3 border border-sky-900/60 shadow-inner">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 320 100">
                <line x1="0" y1="20" x2="320" y2="20" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="50" x2="320" y2="50" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="80" x2="320" y2="80" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />

                {/* Deepening pressure: drops down then rises after landfall */}
                <path 
                  d="M 10 30 L 70 15 L 140 35 L 220 65 L 300 90 L 300 100 L 10 100 Z" 
                  fill="url(#pressGrad)" 
                />
                <path 
                  d="M 10 30 L 70 15 L 140 35 L 220 65 L 300 90" 
                  fill="none" 
                  stroke="#ef4444" 
                  strokeWidth="2.5" 
                />

                <circle cx="10" cy="30" r="3.5" fill="#ef4444" />
                <circle cx="70" cy="15" r="4.5" fill="#00f1fd" />
                <circle cx="140" cy="35" r="3.5" fill="#ef4444" />
                <circle cx="220" cy="65" r="3.5" fill="#ef4444" />
                <circle cx="300" cy="90" r="3.5" fill="#ef4444" />

                <defs>
                  <linearGradient id="pressGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-2">
              <span>912 hPa</span>
              <span className="text-rose-400 font-bold">908 hPa</span>
              <span>915 hPa</span>
              <span>928 hPa</span>
              <span>952 hPa</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
