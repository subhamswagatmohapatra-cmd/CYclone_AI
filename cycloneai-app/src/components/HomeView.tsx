import React, { useState } from 'react';
import { 
  Radar, 
  Clock, 
  Thermometer, 
  Radio, 
  ShieldAlert, 
  Waves, 
  Cpu, 
  Download, 
  Grid, 
  Maximize2, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight,
  TrendingUp,
  Wind,
  Award,
  Sparkles,
  ArrowRight,
  Navigation,
  Truck,
  Building2,
  PhoneCall,
  Eye,
  WifiOff,
  Volume2,
  Languages
} from 'lucide-react';
import { StormProfile, TelemetryAlert, GisLayerSettings, SimulationScenario } from '../types';
import { SIMULATION_SCENARIOS } from '../data/mockData';
import { SynopticGisGoogleMap } from './Maps/SynopticGisGoogleMap';

interface HomeViewProps {
  activeStorm: StormProfile;
  allStorms: StormProfile[];
  onSelectStorm: (storm: StormProfile) => void;
  alerts: TelemetryAlert[];
  onOpenSirenModal: () => void;
  onOpenVoiceModal?: () => void;
  onOpenBulletinModal: () => void;
  onOpenXaiModal?: () => void;
  gisLayers: GisLayerSettings;
  setGisLayers: React.Dispatch<React.SetStateAction<GisLayerSettings>>;
  onNavigateToTab?: (tab: any) => void;
  onApplyScenario?: (scenario: SimulationScenario) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  activeStorm,
  allStorms,
  onSelectStorm,
  alerts,
  onOpenSirenModal,
  onOpenVoiceModal,
  onOpenBulletinModal,
  onOpenXaiModal,
  gisLayers,
  setGisLayers,
  onNavigateToTab,
  onApplyScenario
}) => {
  const [activeAlertFilter, setActiveAlertFilter] = useState<'ALL' | 'CRITICAL' | 'TRACK' | 'SENSORS'>('ALL');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activePin, setActivePin] = useState<string | null>(activeStorm.id);
  const [activeScenarioId, setActiveScenarioId] = useState<string>('scenario-live-dana');

  const dangerZones = activeStorm.coastalDangerZones || [];
  const evacuationPhases = activeStorm.evacuationPhases || [];
  const redAlertCount = dangerZones.filter(z => z.threatLevel === 'RED').length;

  const handleScenarioChange = (scenario: SimulationScenario) => {
    setActiveScenarioId(scenario.id);
    if (onApplyScenario) {
      onApplyScenario(scenario);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (activeAlertFilter === 'CRITICAL') return a.severity === 'critical';
    if (activeAlertFilter === 'TRACK') return a.category === 'Track Shift' || a.category === 'Rapid Intensification';
    if (activeAlertFilter === 'SENSORS') return a.category === 'Sensor Health' || a.category === 'Radar Scan';
    return true;
  });

  return (
    <div className="flex flex-col gap-6 text-slate-100 p-6 max-w-7xl mx-auto">
      {/* SIH Jury Innovation Highlights Hero Banner */}
      <div className="bg-gradient-to-r from-[#09152b] via-[#0d1f42] to-[#09152b] rounded-2xl p-5.5 text-white shadow-[0_0_30px_rgba(6,182,212,0.15)] border border-amber-400/40 relative overflow-hidden">
        {/* Subtle decorative background beam */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 -bottom-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <Award className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                  SMART INDIA HACKATHON 2026 TOP SELECTION
                </span>
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                  7 Novel Breakthroughs Over Legacy IMD
                </span>
              </div>
              <h2 className="font-['Space_Grotesk'] text-lg sm:text-xl font-bold text-white tracking-tight">
                Live Disaster Platform: Neural XAI, Offline Zero-Net Mesh & Multilingual Siren Grid
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Traditional IMD portals rely on static 3-hourly PDF bulletins and crash during coastal grid blackouts. CycloneAI delivers 100% offline survivability, street-level evacuation routing, regional voice broadcasts, and explainable neural heatmaps.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center shrink-0">
            <button
              onClick={() => onNavigateToTab && onNavigateToTab('sih-innovation')}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-['Space_Grotesk'] font-bold text-xs transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)] flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>View 7 SIH Breakthroughs</span>
            </button>
            <button
              onClick={() => onNavigateToTab && onNavigateToTab('coastal-danger')}
              className="px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white font-mono text-xs transition-all border border-cyan-500/40 flex items-center gap-1.5 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
            >
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <span>Coastal Danger Board</span>
            </button>
            <button
              onClick={onOpenSirenModal}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)] flex items-center gap-1.5"
            >
              <Radio className="w-4 h-4" />
              <span>Test Siren</span>
            </button>
            {onOpenVoiceModal && (
              <button
                id="btn-home-voice-alert"
                onClick={onOpenVoiceModal}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-['Space_Grotesk'] font-bold text-xs transition-all shadow-[0_0_15px_rgba(245,158,11,0.35)] flex items-center gap-1.5"
                title="Speak coastal disaster awareness warning in regional Indian languages"
              >
                <Volume2 className="w-4 h-4 text-slate-950" />
                <span>Voice Warning</span>
                <span className="text-[10px] font-mono px-1 rounded bg-black/20 text-slate-950 font-extrabold">ଓଡ଼ିଆ/हिन्दी</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Real-Time Cyclone Telemetry & Danger Coast Line Strip */}
      <div className="bg-[#091224]/90 backdrop-blur-xl rounded-2xl p-5 border border-sky-800/60 shadow-2xl relative overflow-hidden text-slate-100">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-sky-950/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-red-950/70 border border-red-500/50 flex items-center justify-center text-red-400 shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.35)]">
              <Wind className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-mono font-bold animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]">
                  ACTIVE MONITORED CYCLONE
                </span>
                <span className="text-xs font-mono text-cyan-400">
                  {activeStorm.basin}
                </span>
              </div>
              <h3 className="font-['Space_Grotesk'] text-xl font-bold text-white mt-0.5 flex items-center gap-2">
                <span>{activeStorm.name}</span>
                <span className="text-sm font-mono text-red-400 font-semibold">({activeStorm.category})</span>
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <div className="bg-slate-900/90 px-3.5 py-2 rounded-xl border border-slate-800 shadow-inner">
              <span className="text-slate-400 text-[10px] block">LANDFALL SECTOR</span>
              <strong className="text-white font-bold">{activeStorm.landfallLocation}</strong>
            </div>
            <div className="bg-slate-900/90 px-3.5 py-2 rounded-xl border border-slate-800 shadow-inner">
              <span className="text-slate-400 text-[10px] block">EST. WINDOW</span>
              <strong className="text-amber-400 font-bold">{activeStorm.landfallWindow}</strong>
            </div>
            <div className="bg-slate-900/90 px-3.5 py-2 rounded-xl border border-slate-800 shadow-inner">
              <span className="text-slate-400 text-[10px] block">MAX SUSTAINED</span>
              <strong className="text-red-400 font-bold">{activeStorm.maxWindsKmh} km/h ({activeStorm.maxWindsKts} kts)</strong>
            </div>
            <div className="bg-slate-900/90 px-3.5 py-2 rounded-xl border border-slate-800 shadow-inner">
              <span className="text-slate-400 text-[10px] block">CENTRAL PRESSURE</span>
              <strong className="text-cyan-400 font-bold">{activeStorm.centralPressureHpa} hPa</strong>
            </div>
          </div>
        </div>

        {/* Coastal Danger Area Footprint Banner */}
        <div className="mt-4 pt-1">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span className="text-xs font-bold font-['Space_Grotesk'] text-white uppercase tracking-wide">
                Coastal Areas Coming Under Danger Area ({redAlertCount} Districts Under Emergency Red Alert)
              </span>
            </div>
            <button
              onClick={() => onNavigateToTab && onNavigateToTab('coastal-danger')}
              className="text-xs font-mono font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              <span>View Full Evacuation Breakdown & Corridors</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs font-mono">
            {dangerZones.slice(0, 6).map(zone => (
              <div 
                key={zone.id}
                onClick={() => onNavigateToTab && onNavigateToTab('coastal-danger')}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  zone.threatLevel === 'RED' 
                    ? 'bg-red-950/60 border-red-500/50 hover:border-red-400 text-red-100 shadow-[0_0_12px_rgba(239,68,68,0.25)]' 
                    : 'bg-amber-950/60 border-amber-500/50 hover:border-amber-400 text-amber-100 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white font-['Space_Grotesk'] text-[13px]">{zone.district}</span>
                  <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                    zone.threatLevel === 'RED' ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
                  }`}>
                    {zone.threatLevel}
                  </span>
                </div>
                <div className="text-[11px] text-red-300 font-semibold">
                  Surge: +{zone.stormSurgeHeightM}m
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Evac: {zone.evacuationProgressPercent}% ({Math.round(zone.evacuatedCount / 1000)}k)
                </div>
              </div>
            ))}
          </div>

          {/* Quick Scenario Selector for SIH Jury Testing */}
          <div className="mt-3.5 pt-3 border-t border-sky-950/80 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <strong className="text-amber-300">Jury Quick Simulation Switch:</strong>
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {SIMULATION_SCENARIOS.map(scen => (
                <button
                  key={scen.id}
                  onClick={() => handleScenarioChange(scen)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-mono transition-all border ${
                    activeScenarioId === scen.id
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800'
                  }`}
                >
                  {scen.cycloneName}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Banner / Bento Header Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Active Storm Systems */}
        <div className="glass-card-dark rounded-2xl p-4.5 flex flex-col justify-between relative overflow-hidden border border-red-500/40 hover:border-red-400 transition-all shadow-xl group glow-red">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
              Active Systems Monitored
            </span>
            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px] font-bold font-mono animate-pulse border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.4)]">
              CAT-5 CRITICAL
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <div>
              <span className="font-['Space_Grotesk'] text-4xl font-bold text-white drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                0{allStorms.length}
              </span>
              <span className="text-[12px] text-red-400 ml-2 font-mono font-semibold">
                {activeStorm.name.toUpperCase()} (T{activeStorm.dvorakCI.slice(1,4)})
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-red-950/70 flex items-center justify-center text-red-400 border border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.4)]">
              <Wind className="w-4.5 h-4.5 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-sky-950/80">
            <span>Bay of Bengal: <strong className="text-red-400 font-semibold">Cat 5</strong></span>
            <span className="text-amber-400 font-mono font-medium">Arabian Sea: Depr</span>
          </div>
          <div className="w-full bg-slate-900 h-2 rounded-full mt-2 overflow-hidden border border-slate-800">
            <div className="bg-gradient-to-r from-red-600 to-rose-500 h-full w-[88%] rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
          </div>
        </div>

        {/* Metric 2: Est. Landfall Window & Impact Vector */}
        <div className="glass-card-dark rounded-2xl p-4.5 flex flex-col justify-between relative overflow-hidden border border-cyan-500/40 hover:border-cyan-400 transition-all shadow-xl group glow-cyan">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
              Landfall Prediction Window
            </span>
            <Clock className="w-4.5 h-4.5 text-cyan-400 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-['Space_Grotesk'] text-3xl font-bold text-cyan-300 font-mono drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
              {activeStorm.landfallWindow.split('±')[0]}
            </span>
            <span className="text-[12px] text-cyan-400 font-mono font-semibold">±45m</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-sky-950/80">
            <span className="text-white font-semibold">{activeStorm.landfallLocation}</span>
            <span className="text-cyan-400 font-mono font-bold">145-165 KT</span>
          </div>
          <div className="w-full bg-slate-900 h-2 rounded-full mt-2 overflow-hidden border border-slate-800">
            <div className="bg-gradient-to-r from-cyan-500 to-sky-400 h-full w-[72%] rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
          </div>
        </div>

        {/* Metric 3: Ocean Thermal Energy Potential */}
        <div className="glass-card-dark rounded-2xl p-4.5 flex flex-col justify-between relative overflow-hidden border border-indigo-500/40 hover:border-indigo-400 transition-all shadow-xl group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
              Ocean Heat Content (TCHP)
            </span>
            <Thermometer className="w-4.5 h-4.5 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-['Space_Grotesk'] text-4xl font-bold text-indigo-200 font-mono drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]">
              {activeStorm.oceanHeatContent}
            </span>
            <span className="text-[11px] text-indigo-400 font-mono">kJ/cm² (&gt;SST {activeStorm.sstTempC}°C)</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-sky-950/80">
            <span>INCOIS Buoy BD10</span>
            <span className="text-indigo-400 font-mono font-semibold">High Intensification</span>
          </div>
          <div className="w-full bg-slate-900 h-2 rounded-full mt-2 overflow-hidden border border-slate-800">
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full w-[94%] rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
          </div>
        </div>

        {/* Metric 4: Automated Public Broadcast & Siren Grid */}
        <div className="glass-card-dark rounded-2xl p-4.5 flex flex-col justify-between relative overflow-hidden border border-emerald-500/40 hover:border-emerald-400 transition-all shadow-xl group glow-emerald">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
              Disaster Siren Grid & CAP
            </span>
            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.9)]"></span>LIVE
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-['Space_Grotesk'] text-3xl font-bold text-emerald-300 font-mono drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
              348/350
            </span>
            <span className="text-[11px] text-slate-400 font-mono font-medium">Towers Armed</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-sky-950/80">
            <span className="text-cyan-400 font-medium">NDMA CAP SMS Alert</span>
            <span className="text-emerald-300 font-mono font-bold">99.4% Deliv</span>
          </div>
          <div className="w-full bg-slate-900 h-2 rounded-full mt-2 overflow-hidden border border-slate-800">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full w-[98%] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
          </div>
        </div>
      </div>

      {/* Main Geospatial Map & Active Storms Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Geospatial Satellite Telemetry Command Viewport (8 cols) */}
        <div className="lg:col-span-8 bg-[#091224]/95 backdrop-blur-xl rounded-2xl p-4.5 flex flex-col relative overflow-hidden border border-sky-800/60 shadow-2xl">
          {/* Viewport Header Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-sky-950/80">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-950/80 border border-red-500/50 text-red-300 text-[11px] font-mono font-bold shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                DEFENSE GEOSPATIAL RADAR
              </div>
              <h2 className="font-['Space_Grotesk'] text-lg font-bold text-white flex items-center gap-2">
                Bay of Bengal Synoptic GIS
                <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
                  INSAT-3DR TIR-1
                </span>
              </h2>
            </div>

            {/* Tactical GIS Layer Toggles */}
            <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl text-[11px] font-mono border border-slate-800">
              <button 
                onClick={() => setGisLayers(p => ({ ...p, tir108: !p.tir108 }))}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  gisLayers.tir108 ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]' : 'text-slate-400 hover:text-white'
                }`}
              >
                TIR 10.8µm
              </button>
              <button 
                onClick={() => setGisLayers(p => ({ ...p, dopplerDwr: !p.dopplerDwr }))}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  gisLayers.dopplerDwr ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]' : 'text-slate-400 hover:text-white'
                }`}
              >
                Doppler DWR
              </button>
              <button 
                onClick={() => setGisLayers(p => ({ ...p, sstAnomaly: !p.sstAnomaly }))}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  gisLayers.sstAnomaly ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]' : 'text-slate-400 hover:text-white'
                }`}
              >
                SST Anomaly
              </button>
              <button 
                onClick={() => setGisLayers(p => ({ ...p, windVectors: !p.windVectors }))}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  gisLayers.windVectors ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]' : 'text-slate-400 hover:text-white'
                }`}
              >
                Wind Vectors
              </button>
              <button 
                onClick={() => setGisLayers(p => ({ ...p, evacCone: !p.evacCone }))}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  gisLayers.evacCone ? 'bg-red-950/80 text-red-300 border border-red-500/50 font-bold shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                Evac Cone
              </button>
            </div>
          </div>

          {/* Main Interactive Map Viewport */}
          <SynopticGisGoogleMap
            activeStorm={activeStorm}
            gisLayers={gisLayers}
          />

          {/* Sub-map Multi-Source Sensor Fusion Telemetry Strip */}
          <div className="mt-3 pt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] font-mono">
            <div className="bg-slate-900/90 p-2.5 rounded-lg flex items-center justify-between border-l-2 border-sky-500 border border-slate-800 shadow-inner">
              <span className="text-slate-400">INSAT-3DR IMAGER</span>
              <span className="text-cyan-400 font-bold">4m ago</span>
            </div>
            <div className="bg-slate-900/90 p-2.5 rounded-lg flex items-center justify-between border-l-2 border-cyan-500 border border-slate-800 shadow-inner">
              <span className="text-slate-400">DWR MACHILIPATNAM</span>
              <span className="text-cyan-300 font-bold">ONLINE</span>
            </div>
            <div className="bg-slate-900/90 p-2.5 rounded-lg flex items-center justify-between border-l-2 border-indigo-500 border border-slate-800 shadow-inner">
              <span className="text-slate-400">INCOIS BUOY BD08</span>
              <span className="text-indigo-300 font-bold">29.8°C SST</span>
            </div>
            <div className="bg-slate-900/90 p-2.5 rounded-lg flex items-center justify-between border-l-2 border-slate-500 border border-slate-800 shadow-inner">
              <span className="text-slate-400">ECMWF/GFS ENSEMBLE</span>
              <span className="text-emerald-400 font-bold">CONVERGED</span>
            </div>
          </div>
        </div>

        {/* Right Panel: Civil Defense Evacuation & Deep Learning Engine Suite (4 cols) */}
        <div className="lg:col-span-4 bg-[#091224]/95 backdrop-blur-xl rounded-2xl p-5 flex flex-col justify-between border border-sky-800/60 shadow-2xl text-slate-100">
          <div>
            {/* Section Header */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-sky-950/80">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-cyan-400" />
                <h3 className="font-['Space_Grotesk'] text-base font-bold text-white">
                  NDMA / Civil Defense
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px] font-mono font-bold border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.4)] animate-pulse">
                RED ALERT
              </span>
            </div>

            {/* Storm Surge Vulnerability Model */}
            <div className="bg-red-950/40 p-3.5 rounded-xl mb-4 border-l-4 border-red-500 border border-red-500/30 text-slate-200 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-red-400 uppercase flex items-center gap-1 font-mono">
                  <Waves className="w-4 h-4 text-red-400" /> Storm Surge Warning
                </span>
                <span className="text-[12px] text-red-400 font-mono font-bold">+4.2m Peak</span>
              </div>
              <p className="text-[12px] text-slate-300 leading-relaxed mb-3">
                Astronomical high tide + gale forcing surge for Ganjam, Puri & Srikakulam coastlines.
              </p>
              <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-[11px]">
                <div className="bg-slate-900/90 p-1.5 rounded-lg border border-red-500/30">
                  <div className="text-slate-400 text-[10px]">PURI</div>
                  <div className="text-red-400 font-bold">3.8m</div>
                </div>
                <div className="bg-slate-900/90 p-1.5 rounded-lg border border-red-500/30">
                  <div className="text-slate-400 text-[10px]">GANJAM</div>
                  <div className="text-red-400 font-bold">4.2m</div>
                </div>
                <div className="bg-slate-900/90 p-1.5 rounded-lg border border-red-500/30">
                  <div className="text-slate-400 text-[10px]">SRIKAKULAM</div>
                  <div className="text-cyan-400 font-bold">2.9m</div>
                </div>
              </div>
            </div>

            {/* Evacuation Readiness Index */}
            <div className="space-y-2.5 mb-4">
              <div className="text-[12px] text-slate-200 font-semibold flex items-center justify-between">
                <span>Coastal Evacuation Readiness</span>
                <span className="font-mono text-cyan-400 font-bold">
                  {Math.round((activeStorm.evacuationCount / activeStorm.evacuationTarget) * 100)}% Target Met
                </span>
              </div>

              {/* District 1: Puri */}
              <div className="bg-slate-900/90 p-2.5 rounded-xl text-[12px] border border-slate-800">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-white font-medium">Puri District (Odisha)</span>
                  <span className="text-cyan-400 font-mono font-semibold">142,500 Evacuated (82%)</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div className="bg-gradient-to-r from-cyan-500 to-sky-400 h-full w-[82%] rounded-full shadow-[0_0_8px_rgba(6,182,212,0.6)]"></div>
                </div>
              </div>

              {/* District 2: Ganjam */}
              <div className="bg-slate-900/90 p-2.5 rounded-xl text-[12px] border border-slate-800">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-white font-medium">Ganjam & Gopalpur</span>
                  <span className="text-rose-400 font-mono font-semibold">94,200 Evacuated (61%)</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div className="bg-gradient-to-r from-rose-500 to-red-500 h-full w-[61%] rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                </div>
              </div>

              {/* District 3: Srikakulam */}
              <div className="bg-slate-900/90 p-2.5 rounded-xl text-[12px] border border-slate-800">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-white font-medium">Srikakulam (Andhra Pradesh)</span>
                  <span className="text-indigo-300 font-mono font-semibold">58,100 Evacuated (54%)</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full w-[54%] rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
                </div>
              </div>
            </div>

            {/* Deep Learning Inference Engine Telemetry */}
            <div className="bg-sky-950/40 p-3 rounded-xl border-l-4 border-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-cyan-300 flex items-center gap-1 font-mono">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" /> AI Model Architecture
                </span>
                <span className="text-[10px] text-cyan-300 font-mono font-semibold">PyTorch v2.3</span>
              </div>
              <div className="text-[11px] font-mono text-slate-300 space-y-1 leading-snug">
                <div>• Backbone: <span className="text-white font-semibold">ConvNeXt-V2 + Spatio-Temporal TF</span></div>
                <div>• Uncertainty: <span className="text-cyan-300 font-bold">MC-Dropout ±8.2 kts (p=0.95)</span></div>
                <div>• IMD Dvorak Auto-Eval: <span className="text-red-400 font-bold">{activeStorm.dvorakCI}</span></div>
              </div>
            </div>
          </div>

          {/* Command Actions Button Group */}
          <div className="space-y-2 mt-4 pt-3 border-t border-sky-950/80">
            <button 
              id="btn-trigger-siren-panel"
              onClick={onOpenSirenModal}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-['Space_Grotesk'] font-bold text-[13px] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.4)] cursor-pointer"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Trigger State Warning Siren (CAP Level 4)</span>
            </button>
            <button 
              id="btn-generate-bulletin-panel"
              onClick={onOpenBulletinModal}
              className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-sky-700/60 font-mono text-[12px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Generate IMD Cyclone Bulletin (RSMC Format)</span>
              <ChevronRight className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Alerts & System Logs Section */}
      <div className="bg-[#091224]/95 backdrop-blur-xl rounded-2xl p-5 border border-sky-800/60 shadow-2xl text-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-sky-950/80">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
            <h3 className="font-['Space_Grotesk'] text-lg font-bold text-white">
              Live Disaster Response & Sensor Telemetry Feed
            </h3>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-cyan-300 font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.9)]"></span>
              SECURE DATA BUS (TLS 1.3)
            </div>
            
            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl text-[11px] font-mono border border-slate-800">
              {(['ALL', 'CRITICAL', 'TRACK', 'SENSORS'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveAlertFilter(filter)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    activeAlertFilter === filter ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredAlerts.slice(0, 3).map((alert) => (
            <div 
              key={alert.id}
              className={`bg-slate-900/85 p-4 rounded-xl border-l-4 border border-slate-800/80 relative overflow-hidden transition-all hover:bg-slate-800/90 shadow-lg ${
                alert.severity === 'critical' ? 'border-l-red-500' :
                alert.severity === 'high' ? 'border-l-amber-500' :
                alert.severity === 'warning' ? 'border-l-cyan-400' : 'border-l-indigo-500'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-mono font-bold flex items-center gap-1 ${
                  alert.severity === 'critical' ? 'text-red-400' :
                  alert.severity === 'high' ? 'text-amber-400' : 'text-cyan-400'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                  {alert.category.toUpperCase()}
                </span>
                <span className="text-[11px] font-mono text-slate-400">{alert.timeAgo}</span>
              </div>
              <h4 className="text-[14px] font-semibold text-white mb-1 leading-snug">{alert.title}</h4>
              <p className="text-[12px] text-slate-300 leading-relaxed line-clamp-3 mb-2">{alert.description}</p>
              <div className="text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800">
                Source: {alert.source}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
