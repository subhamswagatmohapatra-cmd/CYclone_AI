import React from 'react';
import { 
  Home, 
  Radar, 
  Wind, 
  BrainCircuit, 
  BarChart3, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Activity,
  Layers,
  Building2,
  PhoneCall,
  WifiOff,
  ShieldAlert,
  Award
} from 'lucide-react';
import { StormProfile } from '../types';

export type NavTab = 
  | 'home' 
  | 'coastal-danger'
  | 'sih-innovation'
  | 'shelters-map'
  | 'emergency-contacts'
  | 'detection-classification' 
  | 'track-intensity-prediction' 
  | 'explainable-ai' 
  | 'analytics';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  activeStorm: StormProfile;
  allStorms: StormProfile[];
  onSelectStorm: (storm: StormProfile) => void;
  isSimulating: boolean;
  setIsSimulating: React.Dispatch<React.SetStateAction<boolean>>;
  audioEnabled: boolean;
  setAudioEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  unreadAlertsCount: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  activeStorm,
  allStorms,
  onSelectStorm,
  isSimulating,
  setIsSimulating,
  audioEnabled,
  setAudioEnabled,
  unreadAlertsCount,
  isOpen = true,
  onClose
}) => {
  const navItems = [
    { id: 'home' as NavTab, label: 'Home Dashboard', icon: Home },
    { id: 'coastal-danger' as NavTab, label: 'Coastal Danger & Evac', icon: ShieldAlert, badge: 'RED ALERT' },
    { id: 'sih-innovation' as NavTab, label: 'SIH Jury Showcase', icon: Award, badge: '7 NOVEL' },
    { id: 'shelters-map' as NavTab, label: 'Shelters & Evacuation', icon: Building2 },
    { id: 'emergency-contacts' as NavTab, label: 'Emergency Helplines', icon: PhoneCall },
    { id: 'detection-classification' as NavTab, label: 'Detection & Classification', icon: Radar },
    { id: 'track-intensity-prediction' as NavTab, label: 'Track & Intensity Prediction', icon: Wind },
    { id: 'explainable-ai' as NavTab, label: 'Explainable AI', icon: BrainCircuit },
    { id: 'analytics' as NavTab, label: 'Analytics & Logs', icon: BarChart3, badge: unreadAlertsCount > 0 ? unreadAlertsCount : undefined },
  ];

  return (
    <>
      {/* Mobile / Narrow screen backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden cursor-pointer animate-fade-in"
          aria-hidden="true"
        />
      )}

      <aside 
        id="main-sidebar"
        className={`fixed left-0 top-0 h-full w-72 bg-[#080f20] border-r border-sky-950/70 z-50 flex flex-col justify-between py-6 px-4 shadow-2xl text-slate-200 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand / Logo */}
          <div className="flex items-center justify-between px-2 mb-7">
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-2xl flex items-center justify-center bg-gradient-to-br from-sky-950 via-slate-900 to-indigo-950 border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.35)] overflow-hidden shrink-0">
                {/* Ambient inner glow */}
                <div className="absolute inset-0 bg-cyan-500/10 rounded-2xl animate-pulse"></div>
                {/* Animated glowing spiral SVG */}
                <svg viewBox="0 0 100 100" className="w-8 h-8 animate-spin" style={{ animationDuration: '7s' }}>
                  <circle cx="50" cy="50" r="9" fill="#ef4444" opacity="0.85" />
                  <path 
                    d="M 50 12 A 38 38 0 0 1 88 50 A 26 26 0 0 1 50 76 A 16 16 0 0 1 34 50 A 6 6 0 0 1 50 44" 
                    fill="none" 
                    stroke="#38bdf8" 
                    strokeWidth="4" 
                    strokeLinecap="round" 
                  />
                  <path 
                    d="M 50 88 A 38 38 0 0 1 12 50 A 26 26 0 0 1 50 24 A 16 16 0 0 1 66 50" 
                    fill="none" 
                    stroke="#06b6d4" 
                    strokeWidth="3.5" 
                    strokeLinecap="round" 
                  />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-['Space_Grotesk'] text-xl font-bold tracking-tight text-white">
                    Cyclone<span className="text-cyan-400 font-extrabold drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]">AI</span>
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-bold">
                    SIH-26
                  </span>
                </div>
                <p className="text-[10px] text-cyan-300/70 font-mono tracking-widest uppercase">DISASTER GIS COMMAND</p>
              </div>
            </div>

            {/* Mobile close button */}
            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Close Navigation Menu"
              >
                <span className="text-xl font-bold leading-none">&times;</span>
              </button>
            )}
          </div>

          {/* Navigation Menu */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (onClose && window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/25 via-sky-500/15 to-transparent text-cyan-300 font-bold border-l-4 border-cyan-400 shadow-[0_0_18px_rgba(6,182,212,0.2)]'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold animate-pulse ${
                    item.id === 'sih-innovation'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                      : 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Storm Switcher */}
        <div className="mt-6 px-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 font-semibold">
            <span>Tracked Cyclones</span>
            <span className="text-cyan-400 font-bold">{allStorms.length} Active</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {allStorms.map((storm) => {
              const isSelected = storm.id === activeStorm.id;
              return (
                <button
                  key={storm.id}
                  onClick={() => onSelectStorm(storm)}
                  className={`flex items-center justify-between p-2 rounded-xl text-left text-[12px] transition-all border ${
                    isSelected
                      ? 'bg-gradient-to-r from-sky-950/90 to-slate-900 border-cyan-500/50 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                      : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-800/70 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className={`w-2 h-2 rounded-full ${
                      storm.saffirCategory === 'CAT 5' ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.9)]' :
                      storm.saffirCategory === 'CAT 4' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'bg-cyan-500'
                    }`} />
                    <span className="font-semibold truncate text-slate-100">{storm.name}</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    storm.saffirCategory === 'CAT 5' ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
                    storm.saffirCategory === 'CAT 4' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  }`}>
                    {storm.saffirCategory}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Simulation & Telemetry Controls */}
      <div className="border-t border-sky-950/70 pt-4 px-1 space-y-2.5">
        {/* Offline Cache Indicator */}
        <div className="flex items-center justify-between bg-emerald-950/50 p-2 rounded-xl border border-emerald-500/30 text-emerald-300 text-[11px] font-mono font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span>OFFLINE ZERO-NET RESILIENCE</span>
          </div>
          <span className="text-[10px] text-emerald-200 bg-emerald-900/60 px-1.5 py-0.5 rounded border border-emerald-500/40 font-bold">
            READY
          </span>
        </div>

        <div className="flex items-center justify-between bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isSimulating ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
            <div>
              <div className="text-[11px] font-mono text-white font-bold">
                {isSimulating ? 'TELEMETRY LIVE' : 'FEED PAUSED'}
              </div>
              <div className="text-[10px] text-slate-400">IMD AWS @ 3s cycle</div>
            </div>
          </div>
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`p-1.5 rounded-lg border transition-all ${
              isSimulating
                ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                : 'bg-cyan-600 text-white border-cyan-500 font-bold hover:bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
            }`}
            title={isSimulating ? 'Pause Telemetry Simulation' : 'Resume Telemetry Simulation'}
          >
            {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center justify-between text-[12px] px-1 text-slate-400">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors"
          >
            {audioEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span className="text-[11px] font-mono text-cyan-300 font-semibold">Audio: Sound ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-500" />
                <span className="text-[11px] font-mono text-slate-500">Audio: Muted</span>
              </>
            )}
          </button>
          <span className="text-[10px] font-mono text-cyan-500/80">RSMC NEW DELHI</span>
        </div>
      </div>
    </aside>
    </>
  );
};
