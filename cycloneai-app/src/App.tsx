import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { CoastalDangerEvacuationView } from './components/CoastalDangerEvacuationView';
import { SihInnovationView } from './components/SihInnovationView';
import { DetectionClassificationView } from './components/DetectionClassificationView';
import { TrackPredictionView } from './components/TrackPredictionView';
import { ExplainableAiView } from './components/ExplainableAiView';
import { AnalyticsLogsView } from './components/AnalyticsLogsView';
import { SheltersMapView } from './components/SheltersMapView';
import { EmergencyContactsView } from './components/EmergencyContactsView';
import { SirenTriggerModal } from './components/Modals/SirenTriggerModal';
import { BulletinGeneratorModal } from './components/Modals/BulletinGeneratorModal';
import { XaiReportModal } from './components/Modals/XaiReportModal';
import { SatelliteUploadModal } from './components/Modals/SatelliteUploadModal';
import { CoastalVoiceBroadcastModal } from './components/Modals/CoastalVoiceBroadcastModal';
import { 
  INITIAL_STORMS, 
  INITIAL_ALERTS, 
  INITIAL_LOGS 
} from './data/mockData';
import { 
  StormProfile, 
  TelemetryAlert, 
  SystemLog, 
  GisLayerSettings,
  SimulationScenario 
} from './types';
import { playRadarPingSound, playAlertWarningSound } from './utils/audio';
import { isDeviceOnline, syncPendingCheckinsToFirestore } from './utils/offlineStorage';
import { WifiOff, CheckCircle2 } from 'lucide-react';
import { APIProvider } from '@vis.gl/react-google-maps';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [allStorms, setAllStorms] = useState<StormProfile[]>(INITIAL_STORMS);
  const [activeStorm, setActiveStorm] = useState<StormProfile>(INITIAL_STORMS[0]);
  const [alerts, setAlerts] = useState<TelemetryAlert[]>(INITIAL_ALERTS);
  const [logs, setLogs] = useState<SystemLog[]>(INITIAL_LOGS);
  
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(isDeviceOnline());
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 1024 : true;
  });

  // Monitor network status and sync pending check-ins when reconnected
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      const syncedCount = await syncPendingCheckinsToFirestore();
      if (syncedCount > 0) {
        setSyncNotice(`Synced ${syncedCount} queued check-in(s) to State EOC Cloud`);
        setTimeout(() => setSyncNotice(null), 4000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // GIS Layer controls
  const [gisLayers, setGisLayers] = useState<GisLayerSettings>({
    tir108: true,
    dopplerDwr: true,
    sstAnomaly: false,
    windVectors: true,
    evacCone: true,
    radarSweep: true,
    rangeRings: true,
    gridLines: true,
  });

  // Modal triggers
  const [isSirenModalOpen, setIsSirenModalOpen] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isBulletinModalOpen, setIsBulletinModalOpen] = useState<boolean>(false);
  const [isXaiModalOpen, setIsXaiModalOpen] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  // Real-time telemetry simulation interval
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      // Periodically trigger a telemetry ping or subtle alert update
      const now = new Date();
      const timeStr = now.toISOString().slice(11, 19) + ' UTC';

      // 30% chance to add a realistic sensor log or alert
      const randomSeed = Math.random();
      if (randomSeed > 0.6) {
        const components: SystemLog['component'][] = ['RADAR_DWR', 'INSAT_3DR', 'NEURAL_CLASSIFIER', 'BUOY_NETWORK', 'XAI_ENGINE'];
        const comp = components[Math.floor(Math.random() * components.length)];
        
        let msg = '';
        if (comp === 'RADAR_DWR') msg = `DWR Paradip radar reflectivity update: +${(52 + Math.random() * 6).toFixed(1)} dBZ in eyewall feeder band.`;
        else if (comp === 'INSAT_3DR') msg = `INSAT-3DR TIR-1 rapid scan frame received. Radiative calibration delta < 0.02 K.`;
        else if (comp === 'NEURAL_CLASSIFIER') msg = `ConvNeXt-V2 real-time inference loop: Latency 210ms, category stability 99.4%.`;
        else if (comp === 'BUOY_NETWORK') msg = `INCOIS Buoy BD08 wave gauge: Significant wave height ${(7.0 + Math.random() * 1.5).toFixed(1)}m.`;
        else msg = `SHAP feature convergence: Eyewall angular momentum remains highest weighted factor (+0.84).`;

        const newLog: SystemLog = {
          id: `LOG-${Math.floor(94000 + Math.random() * 5000)}`,
          timestamp: `${now.toISOString().slice(0, 10)} ${timeStr}`,
          level: randomSeed > 0.88 ? 'HIGH' : 'INFO',
          component: comp,
          message: msg,
          details: { autoTelemetryTick: true, timestampUtc: timeStr }
        };

        setLogs(prev => [newLog, ...prev.slice(0, 49)]);

        if (audioEnabled) {
          playRadarPingSound();
        }
      }
    }, 7000);

    return () => clearInterval(interval);
  }, [isSimulating, audioEnabled]);

  const handleMarkAllAlertsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  const handleAddBroadcastAlert = (newAlert: TelemetryAlert) => {
    setAlerts(prev => [newAlert, ...prev]);
    const newLog: SystemLog = {
      id: `LOG-${Math.floor(95000 + Math.random() * 4000)}`,
      timestamp: newAlert.timestamp,
      level: 'CRITICAL',
      component: 'NDMA_CAP',
      message: `CAP LEVEL 4 ALERT BROADCASTED: ${newAlert.title}`,
      details: { priority: 'Immediate', alertId: newAlert.id }
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const handleAddManualLog = (newLog: SystemLog) => {
    setLogs(prev => [newLog, ...prev]);
    if (newLog.level === 'CRITICAL' || newLog.level === 'HIGH') {
      const newAlert: TelemetryAlert = {
        id: `alt-${Date.now()}`,
        timestamp: newLog.timestamp,
        severity: newLog.level === 'CRITICAL' ? 'critical' : 'high',
        title: `Manual Injection: ${newLog.component}`,
        description: newLog.message,
        source: 'User Manual Injection Bus',
        timeAgo: 'Just now',
        read: false,
        category: 'Rapid Intensification'
      };
      setAlerts(prev => [newAlert, ...prev]);
      if (audioEnabled) {
        playAlertWarningSound();
      }
    }
  };

  const handleLoadPresetStorm = (stormId: string) => {
    const target = allStorms.find(s => s.id === stormId);
    if (target) {
      setActiveStorm(target);
      if (audioEnabled) {
        playRadarPingSound();
      }
    }
  };

  const handleCustomFeedProcessed = (name: string, category: string, wind: number, pressure: number) => {
    const updatedStorm: StormProfile = {
      ...activeStorm,
      name: `Synthetic ${name}`,
      saffirCategory: 'CAT 4',
      maxWindsKts: wind,
      maxWindsKmh: Math.round(wind * 1.852),
      centralPressureHpa: pressure,
    };
    setActiveStorm(updatedStorm);
    setAllStorms(prev => [updatedStorm, ...prev.filter(s => s.id !== updatedStorm.id)]);
    if (audioEnabled) {
      playAlertWarningSound();
    }
  };

  const handleApplyScenario = (scenario: SimulationScenario) => {
    const updatedStorm: StormProfile = {
      ...activeStorm,
      name: scenario.cycloneName,
      category: scenario.category,
      landfallLocation: scenario.landfallTarget,
      maxWindsKmh: scenario.windGustKmh,
      maxWindsKts: Math.round(scenario.windGustKmh / 1.852),
      simulationScenarioName: scenario.name,
      realtimeGeneratedAt: new Date().toISOString().slice(0, 19).replace('T', ' ') + ' UTC (Real-Time Sensor Bus)',
      coastalDangerZones: activeStorm.coastalDangerZones?.map(zone => ({
        ...zone,
        stormSurgeHeightM: Number((zone.stormSurgeHeightM * (scenario.surgePeakM / 3.8)).toFixed(1)),
        peakWindGustKmh: Math.round(zone.peakWindGustKmh * (scenario.windGustKmh / 135)),
        threatLevel: scenario.category.includes('Super') || scenario.category.includes('Cat 5') 
          ? 'RED' 
          : zone.threatLevel
      }))
    };
    setActiveStorm(updatedStorm);
    setAllStorms(prev => [updatedStorm, ...prev.filter(s => s.id !== updatedStorm.id)]);
    if (audioEnabled) {
      playAlertWarningSound();
    }
  };

  const unreadAlertsCount = alerts.filter(a => !a.read).length;

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <div className="min-h-screen bg-[#060c18] text-slate-100 selection:bg-cyan-500 selection:text-black flex flex-col antialiased relative overflow-x-hidden">
      {/* Ambient background glow effects */}
      <div className="fixed top-0 right-1/4 w-[600px] h-[500px] bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="fixed bottom-10 right-10 w-[500px] h-[450px] bg-rose-600/8 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '10s' }}></div>
      <div className="fixed top-20 left-80 w-[400px] h-[400px] bg-indigo-600/8 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeStorm={activeStorm}
        allStorms={allStorms}
        onSelectStorm={setActiveStorm}
        isSimulating={isSimulating}
        setIsSimulating={setIsSimulating}
        audioEnabled={audioEnabled}
        setAudioEnabled={setAudioEnabled}
        unreadAlertsCount={unreadAlertsCount}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Header */}
      <Header
        activeStorm={activeStorm}
        allStorms={allStorms}
        onSelectStorm={setActiveStorm}
        alerts={alerts}
        onMarkAllAlertsRead={handleMarkAllAlertsRead}
        onOpenSirenModal={() => setIsSirenModalOpen(true)}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onOpenBulletinModal={() => setIsBulletinModalOpen(true)}
        audioEnabled={audioEnabled}
        setAudioEnabled={setAudioEnabled}
        onNavigateToTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content Area */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-72 ml-0' : 'ml-0'} mt-16 flex-1 overflow-y-auto pb-12`}>
        {/* Offline Disaster Notice Banner */}
        {!isOnline && (
          <div className="bg-amber-500 text-slate-950 px-6 py-2.5 flex items-center justify-between text-[12px] font-mono font-bold shadow-xs">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 animate-pulse" />
              <span>OFFLINE RESILIENCE ACTIVE: Zero network detected. Operating from local cache with complete shelter coordinates, offline maps, and emergency helplines.</span>
            </div>
            <span className="bg-amber-600/40 px-2 py-0.5 rounded text-[11px] uppercase">Cached</span>
          </div>
        )}

        {/* Sync Notice Notification */}
        {syncNotice && (
          <div className="bg-emerald-600 text-white px-6 py-2 flex items-center gap-2 text-[12px] font-mono shadow-xs animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{syncNotice}</span>
          </div>
        )}

        {activeTab === 'home' && (
          <HomeView
            activeStorm={activeStorm}
            allStorms={allStorms}
            onSelectStorm={setActiveStorm}
            alerts={alerts}
            onOpenSirenModal={() => setIsSirenModalOpen(true)}
            onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
            onOpenBulletinModal={() => setIsBulletinModalOpen(true)}
            onOpenXaiModal={() => setIsXaiModalOpen(true)}
            gisLayers={gisLayers}
            setGisLayers={setGisLayers}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onApplyScenario={handleApplyScenario}
          />
        )}

        {activeTab === 'coastal-danger' && (
          <CoastalDangerEvacuationView
            activeStorm={activeStorm}
            allStorms={allStorms}
            onSelectStorm={setActiveStorm}
            onOpenSirenModal={() => setIsSirenModalOpen(true)}
            onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
            onOpenBulletinModal={() => setIsBulletinModalOpen(true)}
            onNavigateToShelters={() => setActiveTab('shelters-map')}
            onNavigateToContacts={() => setActiveTab('emergency-contacts')}
            onNavigateToXai={() => setIsXaiModalOpen(true)}
            onApplyScenario={handleApplyScenario}
          />
        )}

        {activeTab === 'sih-innovation' && (
          <SihInnovationView
            onOpenSirenModal={() => setIsSirenModalOpen(true)}
            onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
            onOpenBulletinModal={() => setIsBulletinModalOpen(true)}
            onOpenXaiModal={() => setIsXaiModalOpen(true)}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'shelters-map' && (
          <SheltersMapView 
            activeStorm={activeStorm}
          />
        )}

        {activeTab === 'emergency-contacts' && (
          <EmergencyContactsView 
            activeStorm={activeStorm}
          />
        )}

        {activeTab === 'detection-classification' && (
          <DetectionClassificationView 
            activeStorm={activeStorm}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            onApplyStormAnalysis={(analyzedStorm: StormProfile) => {
              setActiveStorm(analyzedStorm);
              setAllStorms(prev => [analyzedStorm, ...prev.filter(s => s.id !== analyzedStorm.id)]);
            }}
          />
        )}

        {activeTab === 'track-intensity-prediction' && (
          <TrackPredictionView 
            activeStorm={activeStorm}
          />
        )}

        {activeTab === 'explainable-ai' && (
          <ExplainableAiView 
            activeStorm={activeStorm}
            onOpenReportModal={() => setIsXaiModalOpen(true)}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsLogsView 
            logs={logs}
            onAddLog={handleAddManualLog}
          />
        )}
      </main>

      {/* Modals & Dialogs */}
      <SirenTriggerModal 
        isOpen={isSirenModalOpen}
        onClose={() => setIsSirenModalOpen(false)}
        activeStorm={activeStorm}
        onAlertBroadcasted={handleAddBroadcastAlert}
      />

      <BulletinGeneratorModal 
        isOpen={isBulletinModalOpen}
        onClose={() => setIsBulletinModalOpen(false)}
        activeStorm={activeStorm}
      />

      <XaiReportModal 
        isOpen={isXaiModalOpen}
        onClose={() => setIsXaiModalOpen(false)}
        activeStorm={activeStorm}
      />

      <SatelliteUploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onLoadPreset={handleLoadPresetStorm}
        allStorms={allStorms}
        onCustomFeedProcessed={handleCustomFeedProcessed}
        onApplyAnalyzedStorm={(analyzedStorm: StormProfile) => {
          setActiveStorm(analyzedStorm);
          setAllStorms(prev => [analyzedStorm, ...prev.filter(s => s.id !== analyzedStorm.id)]);
        }}
      />

      <CoastalVoiceBroadcastModal 
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        activeStorm={activeStorm}
      />
    </div>
  </APIProvider>
  );
}
