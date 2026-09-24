import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  User as UserIcon, 
  AlertTriangle, 
  Radio, 
  FileText, 
  Volume2, 
  VolumeX, 
  CheckCircle,
  ExternalLink,
  ChevronDown,
  LogIn,
  LogOut,
  ShieldCheck,
  Award,
  Sparkles,
  Download,
  Menu
} from 'lucide-react';
import { StormProfile, TelemetryAlert } from '../types';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, User } from '../lib/firebase';

interface HeaderProps {
  activeStorm: StormProfile;
  allStorms: StormProfile[];
  onSelectStorm: (storm: StormProfile) => void;
  alerts: TelemetryAlert[];
  onMarkAllAlertsRead: () => void;
  onOpenSirenModal: () => void;
  onOpenVoiceModal: () => void;
  onOpenBulletinModal: () => void;
  audioEnabled: boolean;
  setAudioEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  onNavigateToTab?: (tab: any) => void;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeStorm,
  allStorms,
  onSelectStorm,
  alerts,
  onMarkAllAlertsRead,
  onOpenSirenModal,
  onOpenVoiceModal,
  onOpenBulletinModal,
  audioEnabled,
  setAudioEnabled,
  onNavigateToTab,
  sidebarOpen,
  onToggleSidebar,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [istTime, setIstTime] = useState<string>('');
  const [showAlertsDropdown, setShowAlertsDropdown] = useState<boolean>(false);
  const [showStormDropdown, setShowStormDropdown] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setAuthLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.warn('Google sign-in exception:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setShowUserDropdown(false);
    } catch (err) {
      console.warn('Sign-out error:', err);
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toUTCString().slice(17, 25) + ' UTC');
      // Format Indian Standard Time (UTC +5:30)
      const istDate = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
      setIstTime(istDate.toISOString().slice(11, 19) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <header 
      id="main-header"
      className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-[#0a1224]/95 backdrop-blur-xl border-b border-sky-900/50 z-40 flex items-center justify-between px-4 sm:px-6 shadow-xl text-slate-100"
    >
      {/* Left status chips & Mobile Menu Button */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl bg-slate-900/90 border border-sky-800 text-cyan-300 hover:text-white hover:border-cyan-400 transition-colors cursor-pointer"
            title="Toggle Navigation Menu"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* System nominal */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 text-emerald-300 text-[11px] font-mono border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.9)]"></span>
          <span className="text-emerald-200 font-bold tracking-wider">SYSTEM NOMINAL</span>
        </div>

        {/* Command Bus status */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/70 text-[11px] font-mono border border-sky-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="text-slate-300">IMD / NDMA BUS: <strong className="text-cyan-300">ONLINE</strong></span>
        </div>

        {/* SIH Grand Jury Trophy Pill */}
        {onNavigateToTab && (
          <button
            id="btn-header-sih-matrix"
            onClick={() => onNavigateToTab('sih-innovation')}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-amber-500/20 border border-amber-400/50 text-amber-300 text-[11px] font-mono font-bold hover:border-amber-300 transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] cursor-pointer"
            title="Click to view the 7 Smart India Hackathon Breakthrough Innovations"
          >
            <Award className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span>SIH 2026 JURY MATRIX</span>
            <span className="bg-amber-400/30 text-amber-200 px-1 rounded text-[9px] font-extrabold">7 NOVEL</span>
          </button>
        )}

        {/* Active storm dropdown badge */}
        <div className="relative">
          <button
            onClick={() => setShowStormDropdown(!showStormDropdown)}
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/50 text-red-200 text-[12px] font-mono hover:border-red-400 transition-all font-semibold shadow-[0_0_15px_rgba(239,68,68,0.3)]"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span className="uppercase tracking-wider font-bold text-red-100">{activeStorm.name} ({activeStorm.saffirCategory})</span>
            <ChevronDown className="w-3.5 h-3.5 text-red-400" />
          </button>

          {showStormDropdown && (
            <div className="absolute top-full left-0 mt-2 w-72 bg-[#0b162c] border border-sky-800/70 rounded-2xl shadow-2xl p-2.5 z-50 animate-fade-in backdrop-blur-2xl">
              <div className="text-[11px] font-mono text-cyan-400 px-2.5 py-1 uppercase font-bold tracking-wider border-b border-sky-900/50 mb-1">
                Switch Monitored Cyclone
              </div>
              {allStorms.map((storm) => (
                <button
                  key={storm.id}
                  onClick={() => {
                    onSelectStorm(storm);
                    setShowStormDropdown(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-colors ${
                    storm.id === activeStorm.id 
                      ? 'bg-gradient-to-r from-sky-950 to-slate-900 text-cyan-300 border border-cyan-500/40' 
                      : 'hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <div>
                    <div className="text-[13px] font-bold text-white">{storm.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{storm.basin} • {storm.maxWindsKts} kts</div>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    storm.saffirCategory === 'CAT 5' ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
                    storm.saffirCategory === 'CAT 4' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  }`}>
                    {storm.saffirCategory}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right actions and indicators */}
      <div className="flex items-center gap-2.5">
        {/* UTC Clock */}
        <div className="hidden lg:flex flex-col items-end text-right font-mono pr-2">
          <div className="text-[13px] text-cyan-400 font-bold tracking-wider drop-shadow-[0_0_6px_rgba(6,182,212,0.4)]">{currentTime}</div>
          <div className="text-[10px] text-slate-400">{istTime}</div>
        </div>

        {/* Audio Toggle */}
        <button
          onClick={() => setAudioEnabled(!audioEnabled)}
          className={`p-2 rounded-xl border transition-all ${
            audioEnabled 
              ? 'bg-cyan-950/70 text-cyan-300 border-cyan-500/40 hover:bg-cyan-900/60 shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
          title={audioEnabled ? 'Mute Alert Sound Effects' : 'Enable Alert Sound Effects'}
        >
          {audioEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Quick Bulletin Generator */}
        <button
          id="btn-quick-bulletin"
          onClick={onOpenBulletinModal}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-950/70 text-sky-200 hover:bg-sky-900/80 border border-sky-600/40 text-[12px] font-medium transition-all shadow-[0_0_10px_rgba(6,182,212,0.15)]"
        >
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          <span>IMD Bulletin</span>
        </button>

        {/* Quick Siren Broadcast */}
        <button
          id="btn-quick-siren"
          onClick={onOpenSirenModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white border border-red-500/40 text-[12px] font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)]"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-white animate-pulse" />
          <span className="hidden sm:inline">Trigger Siren</span>
          <span className="text-[10px] font-mono px-1 rounded bg-black/20 text-white">CAP-4</span>
        </button>

        {/* Coastal Voice Broadcast Alert (Odia/Bengali/Hindi/etc.) */}
        <button
          id="btn-voice-broadcast-modal"
          onClick={onOpenVoiceModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-[12px] font-bold transition-all shadow-[0_0_15px_rgba(245,158,11,0.35)]"
          title="Speak coastal disaster awareness warning in regional Indian languages"
        >
          <Volume2 className="w-3.5 h-3.5 text-slate-950" />
          <span className="hidden md:inline">Voice Alert</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/20 text-slate-950 font-extrabold">ଓଡ଼ିଆ/हिन्दी</span>
        </button>

        {/* Download Project Source Folder (.ZIP) */}
        <div className="flex items-center gap-1">
          <a
            href="/api/download/zip"
            download="cycloneai-complete-project.zip"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-[12px] font-bold transition-all shadow-[0_0_12px_rgba(6,182,212,0.25)]"
            title="Download the complete project folder as a Windows & Mac compatible ZIP archive"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline">Download Project</span>
            <span className="text-[10px] font-mono px-1 rounded bg-cyan-900/80 text-cyan-200">.ZIP</span>
          </a>
          <a
            href="/api/download/tar"
            download="cycloneai-complete-project.tar.gz"
            className="hidden xl:flex items-center gap-1 px-2 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-mono transition-all"
            title="Alternative format: download as .tar.gz archive"
          >
            <span>.tar.gz</span>
          </a>
        </div>

        {/* Alerts Bell with Dropdown */}
        <div className="relative">
          <button
            id="btn-alerts-bell"
            onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
            className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white font-bold font-mono text-[10px] flex items-center justify-center animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.9)]">
                {unreadCount}
              </span>
            )}
          </button>

          {showAlertsDropdown && (
            <div className="absolute right-0 top-full mt-2 w-96 bg-[#0b162c] border border-sky-800/70 rounded-2xl shadow-2xl overflow-hidden z-50 text-slate-200 backdrop-blur-2xl">
              <div className="p-3.5 border-b border-sky-900/60 flex items-center justify-between bg-slate-900/80">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="font-['Space_Grotesk'] font-bold text-[14px] text-white">Real-Time Alert Feed</span>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllAlertsRead}
                    className="text-[11px] font-mono text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <CheckCircle className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-sky-950/80">
                {alerts.slice(0, 5).map((alert) => (
                  <div 
                    key={alert.id}
                    className={`p-3 hover:bg-slate-800/40 transition-colors ${
                      !alert.read ? 'bg-cyan-950/20 border-l-2 border-cyan-400' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                      <span className={`font-bold ${
                        alert.severity === 'critical' ? 'text-red-400 drop-shadow-[0_0_6px_rgba(239,68,68,0.6)]' :
                        alert.severity === 'high' ? 'text-amber-400' : 'text-cyan-400'
                      }`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className="text-slate-400">{alert.timeAgo}</span>
                    </div>
                    <div className="text-[12px] font-semibold text-white mb-1">{alert.title}</div>
                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">{alert.description}</p>
                    <div className="mt-1 text-[10px] font-mono text-cyan-500/80">Source: {alert.source}</div>
                  </div>
                ))}
              </div>

              <div className="p-2.5 bg-slate-900/80 border-t border-sky-900/60 text-center">
                <button
                  onClick={() => setShowAlertsDropdown(false)}
                  className="text-[12px] text-cyan-400 hover:underline font-mono font-semibold"
                >
                  Close Tray
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Authentication & Profile Dropdown */}
        <div className="relative">
          {currentUser ? (
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-800 transition-colors text-slate-200"
            >
              {currentUser.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt={currentUser.displayName || 'User'} 
                  className="w-6 h-6 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white flex items-center justify-center text-[11px] font-bold">
                  {(currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-[12px] font-medium text-slate-200 max-w-[100px] truncate hidden sm:inline">
                {currentUser.displayName || currentUser.email?.split('@')[0]}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          ) : (
            <button
              onClick={handleGoogleSignIn}
              disabled={authLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-[12px] font-medium transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)] disabled:opacity-50"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{authLoading ? 'Signing in...' : 'Sign In'}</span>
            </button>
          )}

          {/* User profile dropdown modal */}
          {showUserDropdown && currentUser && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-[#0b162c] border border-sky-800/70 rounded-2xl shadow-2xl p-3 z-50 animate-fade-in text-slate-200 backdrop-blur-2xl">
              <div className="flex items-center gap-3 pb-3 border-b border-sky-900/60">
                {currentUser.photoURL ? (
                  <img 
                    src={currentUser.photoURL} 
                    alt={currentUser.displayName || 'User'} 
                    className="w-9 h-9 rounded-full object-cover border border-cyan-500/40"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-sm">
                    {(currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="overflow-hidden">
                  <div className="text-[13px] font-bold text-white truncate">
                    {currentUser.displayName || 'Disaster Responder'}
                  </div>
                  <div className="text-[11px] text-cyan-300/80 truncate font-mono">
                    {currentUser.email}
                  </div>
                </div>
              </div>

              <div className="py-2 space-y-1 text-[12px] font-mono text-slate-300">
                <div className="flex items-center justify-between px-1">
                  <span>Firebase Auth:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Authenticated
                  </span>
                </div>
                <div className="flex items-center justify-between px-1 text-[11px]">
                  <span>Cloud Persistence:</span>
                  <span className="text-cyan-400 font-bold">Firestore Active</span>
                </div>
              </div>

              <div className="pt-2 border-t border-sky-900/60">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-slate-900 hover:bg-red-950/60 hover:text-red-300 text-slate-300 font-mono text-[12px] font-semibold transition-colors border border-slate-800"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
