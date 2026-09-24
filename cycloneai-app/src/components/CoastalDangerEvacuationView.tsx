import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Waves, 
  Wind, 
  MapPin, 
  Users, 
  Truck, 
  Anchor, 
  Building2, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Compass, 
  Clock, 
  Activity, 
  Play, 
  Sparkles, 
  PhoneCall, 
  Phone,
  Radio, 
  FileText,
  Navigation,
  Eye,
  Volume2,
  Square,
  Languages,
  UserCheck,
  Plus
} from 'lucide-react';
import { StormProfile, CoastalDangerZone, SimulationScenario, CycloneShelter, ShelterCheckin } from '../types';
import { SIMULATION_SCENARIOS } from '../data/mockData';
import { INITIAL_SHELTERS } from '../data/sheltersAndContacts';
import { getCachedShelters, getCachedCheckins } from '../utils/offlineStorage';
import { CoastalInundationGoogleMap } from './Maps/CoastalInundationGoogleMap';
import { 
  COASTAL_LANGUAGES, 
  CoastalLanguage, 
  speakCoastalAlert, 
  stopCoastalAlert,
  generateSpeechForLanguage 
} from '../utils/speechSynthesis';
import { OfficerCallModal, OfficerDetails } from './Modals/OfficerCallModal';
import { EvacuationCheckinModal } from './Modals/EvacuationCheckinModal';

interface CoastalDangerEvacuationViewProps {
  activeStorm: StormProfile;
  allStorms: StormProfile[];
  onSelectStorm: (storm: StormProfile) => void;
  onOpenSirenModal: () => void;
  onOpenVoiceModal?: () => void;
  onOpenBulletinModal: () => void;
  onNavigateToShelters: () => void;
  onNavigateToContacts: () => void;
  onNavigateToXai: () => void;
  onApplyScenario: (scenario: SimulationScenario) => void;
}

export const CoastalDangerEvacuationView: React.FC<CoastalDangerEvacuationViewProps> = ({
  activeStorm,
  onOpenSirenModal,
  onOpenVoiceModal,
  onOpenBulletinModal,
  onNavigateToShelters,
  onNavigateToContacts,
  onNavigateToXai,
  onApplyScenario
}) => {
  const [threatFilter, setThreatFilter] = useState<'ALL' | 'RED' | 'ORANGE' | 'YELLOW'>('ALL');
  const [selectedZone, setSelectedZone] = useState<CoastalDangerZone | null>(
    activeStorm.coastalDangerZones?.[0] || null
  );
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('scenario-live-dana');
  const [voiceLang, setVoiceLang] = useState<CoastalLanguage['id']>('or');
  const [isSpeakingAlert, setIsSpeakingAlert] = useState<boolean>(false);

  // Modals state
  const [shelters] = useState<CycloneShelter[]>(() => getCachedShelters(INITIAL_SHELTERS));
  const [checkins, setCheckins] = useState<ShelterCheckin[]>(() => getCachedCheckins());
  const [isOfficerModalOpen, setIsOfficerModalOpen] = useState<boolean>(false);
  const [officerModalData, setOfficerModalData] = useState<OfficerDetails | null>(null);
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState<boolean>(false);

  const handleCallDistrictOfficer = (zone?: CoastalDangerZone | null) => {
    const districtName = zone?.district || selectedZone?.district || 'Puri';
    setOfficerModalData({
      name: `Shri R. K. Nayak (IAS)`,
      role: `District Relief & Evacuation Controller • ${districtName} District`,
      phone: '+91 94370 12345',
      district: districtName,
      shelterName: `${districtName} Central Emergency Operation Center`,
      badge: `ODSMA-${districtName.toUpperCase().substring(0, 4)}`
    });
    setIsOfficerModalOpen(true);
  };

  const handleOpenCheckin = () => {
    setIsCheckinModalOpen(true);
  };

  const speechData = {
    cycloneName: activeStorm.name,
    category: activeStorm.category,
    landfallLocation: activeStorm.landfallLocation,
    surgeM: activeStorm.coastalDangerZones?.[0]?.stormSurgeHeightM || 3.8,
    windKmh: activeStorm.maxWindsKmh
  };


  const currentSpeech = generateSpeechForLanguage(voiceLang, speechData);

  const handleSpeakAlert = (langId?: CoastalLanguage['id']) => {
    const targetLang = langId || voiceLang;
    if (isSpeakingAlert) {
      stopCoastalAlert();
      setIsSpeakingAlert(false);
      return;
    }

    setIsSpeakingAlert(true);
    speakCoastalAlert({
      languageId: targetLang,
      cycloneData: speechData,
      onStart: () => setIsSpeakingAlert(true),
      onEnd: () => setIsSpeakingAlert(false),
      onError: () => setIsSpeakingAlert(false)
    });
  };

  const [activeScenarioId, setActiveScenarioId] = useState<string>('scenario-live-dana');
  const [isSimulatingSwitch, setIsSimulatingSwitch] = useState<boolean>(false);

  const dangerZones = activeStorm.coastalDangerZones || [];
  const evacuationPhases = activeStorm.evacuationPhases || [];

  const filteredZones = dangerZones.filter(zone => {
    if (threatFilter === 'ALL') return true;
    return zone.threatLevel === threatFilter;
  });

  const totalVulnerable = dangerZones.reduce((acc, z) => acc + z.vulnerablePopulation, 0);
  const totalEvacuated = dangerZones.reduce((acc, z) => acc + z.evacuatedCount, 0);
  const totalShelters = dangerZones.reduce((acc, z) => acc + z.activeShelters, 0);
  const totalNdrf = dangerZones.reduce((acc, z) => acc + z.ndrfTeamsDeployed, 0);
  const totalOdraf = dangerZones.reduce((acc, z) => acc + z.odrafTeamsDeployed, 0);
  const overallEvacPercent = totalVulnerable > 0 ? Math.round((totalEvacuated / totalVulnerable) * 100) : 0;

  const handleScenarioSelect = (scenario: SimulationScenario) => {
    setActiveScenarioId(scenario.id);
    setIsSimulatingSwitch(true);
    if (onApplyScenario) {
      onApplyScenario(scenario);
    }
    setTimeout(() => {
      setIsSimulatingSwitch(false);
    }, 600);
  };

  return (
    <div className="flex flex-col gap-6 text-slate-100 p-6 max-w-7xl mx-auto">
      {/* Real-Time Cyclone Telemetry & Scenario Generator Header Card */}
      <div className="bg-[#091224]/95 backdrop-blur-xl rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden border border-sky-800/60">
        {/* Decorative background radial effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-sky-950/80">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-red-950/80 text-red-300 border border-red-500/50 text-[11px] font-mono font-bold flex items-center gap-1.5 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.4)]">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                ACTIVE REAL-TIME CYCLONE TRACK
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 text-[11px] font-mono font-semibold">
                {activeStorm.basin}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Generated: {activeStorm.realtimeGeneratedAt || 'Real-Time Sensor Bus (Live)'}
              </span>
            </div>

            <h1 className="font-['Space_Grotesk'] text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>{activeStorm.name}</span>
              <span className="text-xl sm:text-2xl font-mono text-red-400 font-semibold drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">
                ({activeStorm.category})
              </span>
            </h1>

            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Target Landfall: <strong className="text-white font-semibold">{activeStorm.landfallLocation}</strong> | Window: <strong className="text-amber-300 font-mono font-semibold">{activeStorm.landfallWindow}</strong> | Forward Vector: <strong className="text-cyan-300 font-mono font-semibold">{activeStorm.movementVector}</strong>
            </p>
          </div>

          {/* Quick Metrics Badge Group */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="bg-[#040a17]/80 border border-sky-900/60 rounded-xl p-3 text-center shadow-inner">
              <div className="text-[10px] text-slate-400 uppercase">Max Sustained</div>
              <div className="text-2xl font-bold text-red-400 drop-shadow-[0_0_6px_rgba(244,63,94,0.5)]">{activeStorm.maxWindsKmh} <span className="text-xs font-normal text-slate-300">km/h</span></div>
              <div className="text-[10px] text-slate-400">{activeStorm.maxWindsKts} Knots</div>
            </div>
            <div className="bg-[#040a17]/80 border border-sky-900/60 rounded-xl p-3 text-center shadow-inner">
              <div className="text-[10px] text-slate-400 uppercase">Central Pressure</div>
              <div className="text-2xl font-bold text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.5)]">{activeStorm.centralPressureHpa} <span className="text-xs font-normal text-slate-300">hPa</span></div>
              <div className="text-[10px] text-slate-400">Dvorak {activeStorm.dvorakCI.slice(0, 4)}</div>
            </div>
            <div className="bg-[#040a17]/80 border border-sky-900/60 rounded-xl p-3 text-center shadow-inner">
              <div className="text-[10px] text-slate-400 uppercase">Eye Diameter</div>
              <div className="text-2xl font-bold text-amber-400">{activeStorm.eyeDiameterKm} <span className="text-xs font-normal text-slate-300">km</span></div>
              <div className="text-[10px] text-slate-400">SST {activeStorm.sstTempC}°C</div>
            </div>
            <div className="bg-[#040a17]/80 border border-sky-900/60 rounded-xl p-3 text-center shadow-inner">
              <div className="text-[10px] text-slate-400 uppercase">Current Position</div>
              <div className="text-lg font-bold text-emerald-400">{activeStorm.lat}°N</div>
              <div className="text-[10px] text-slate-400">{activeStorm.lon}°E</div>
            </div>
          </div>
        </div>

        {/* Real-Time Cyclone Scenario Simulator Strip */}
        <div className="mt-5 pt-1">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                SIH Jury Live Scenario Generator (Switch Storm Dynamic Conditions)
              </span>
            </div>
            {isSimulatingSwitch && (
              <span className="text-xs font-mono text-cyan-400 animate-pulse flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 animate-spin" /> Recalculating Coastal Danger & Evac Footprint...
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {SIMULATION_SCENARIOS.map((scen) => (
              <button
                key={scen.id}
                onClick={() => handleScenarioSelect(scen)}
                className={`p-3 rounded-xl text-left transition-all border text-xs flex flex-col justify-between cursor-pointer ${
                  activeScenarioId === scen.id
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] ring-2 ring-cyan-300/40'
                    : 'bg-[#040a17]/60 hover:bg-[#061026] text-slate-300 border-sky-900/50'
                }`}
              >
                <div>
                  <div className="font-semibold font-['Space_Grotesk'] text-[13px] mb-1 flex items-center justify-between">
                    <span>{scen.cycloneName}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                      scen.category.includes('Super') || scen.category.includes('Cat 5') ? 'bg-red-900/80 text-red-200 border border-red-500/50' : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                    }`}>
                      {scen.category}
                    </span>
                  </div>
                  <div className="text-[11px] opacity-85 leading-snug line-clamp-2 mb-2">
                    {scen.subtitle}
                  </div>
                </div>
                <div className="pt-2 border-t border-white/15 flex items-center justify-between font-mono text-[10px] opacity-90">
                  <span>Surge: +{scen.surgePeakM}m</span>
                  <span>Gusts: {scen.windGustKmh} km/h</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Evacuation Command Macro Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 font-mono">
        <div className="bg-[#091224]/95 backdrop-blur-xl rounded-2xl p-4 border border-sky-800/60 shadow-2xl">
          <div className="text-[11px] text-slate-400 mb-1 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Target Population</span>
          </div>
          <div className="text-2xl font-bold font-['Space_Grotesk'] text-white">
            {(totalVulnerable / 100000).toFixed(2)} Lakh
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across 8 Coastal Sectors</div>
        </div>

        <div className="bg-[#091224]/95 backdrop-blur-xl rounded-2xl p-4 border border-sky-800/60 shadow-2xl">
          <div className="text-[11px] text-slate-400 mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Evacuated to Date</span>
          </div>
          <div className="text-2xl font-bold font-['Space_Grotesk'] text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]">
            {(totalEvacuated / 100000).toFixed(2)} Lakh
          </div>
          <div className="text-[11px] text-emerald-300 font-semibold mt-1">
            {overallEvacPercent}% Target Relocated
          </div>
        </div>

        <div className="bg-[#091224]/95 backdrop-blur-xl rounded-2xl p-4 border border-sky-800/60 shadow-2xl">
          <div className="text-[11px] text-slate-400 mb-1 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span>Active Shelters</span>
          </div>
          <div className="text-2xl font-bold font-['Space_Grotesk'] text-white">
            {totalShelters}
          </div>
          <div className="text-[11px] text-cyan-300 font-semibold mt-1">DG Solar & RO Potable Water</div>
        </div>

        <div className="bg-[#091224]/95 backdrop-blur-xl rounded-2xl p-4 border border-sky-800/60 shadow-2xl">
          <div className="text-[11px] text-slate-400 mb-1 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Rescue Battalions</span>
          </div>
          <div className="text-2xl font-bold font-['Space_Grotesk'] text-rose-400 drop-shadow-[0_0_6px_rgba(244,63,94,0.5)]">
            {totalNdrf + totalOdraf} Teams
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{totalNdrf} NDRF + {totalOdraf} ODRAF</div>
        </div>

        <div className="bg-[#091224]/95 backdrop-blur-xl rounded-2xl p-4 border border-sky-800/60 shadow-2xl">
          <div className="text-[11px] text-slate-400 mb-1 flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-amber-400" />
            <span>Transport Fleet</span>
          </div>
          <div className="text-2xl font-bold font-['Space_Grotesk'] text-amber-400">
            850 Buses
          </div>
          <div className="text-[11px] text-slate-400 mt-1">184 Motorized Boats</div>
        </div>
      </div>

      {/* Main Section: Coastal Danger Zones & Evacuation Phases */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Coastal Danger Areas (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-[#091224]/95 backdrop-blur-xl rounded-2xl p-5 border border-sky-800/60 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-sky-950/80">
              <div>
                <h2 className="font-['Space_Grotesk'] text-lg font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  Coastal Danger Areas & Inundation Footprint
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Districts categorized by astronomical tide surge, wind swath, and breach risk.
                </p>
              </div>

              {/* Threat Level Filter Buttons */}
              <div className="flex items-center gap-1 bg-[#040a17] p-1 rounded-xl text-[11px] font-mono border border-sky-900/60">
                {(['ALL', 'RED', 'ORANGE', 'YELLOW'] as const).map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setThreatFilter(lvl)}
                    className={`px-2.5 py-1 rounded-lg transition-all font-semibold cursor-pointer ${
                      threatFilter === lvl 
                        ? 'bg-cyan-600 text-white shadow-[0_0_8px_rgba(6,182,212,0.5)]' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Real Google Maps Inundation Footprint & Surge GIS */}
            <div className="mb-4">
              <CoastalInundationGoogleMap
                zones={filteredZones}
                selectedZone={selectedZone}
                onSelectZone={setSelectedZone}
                activeStorm={activeStorm}
              />
            </div>

            {/* List of Danger Zones */}
            <div className="space-y-3">
              {filteredZones.map(zone => {
                const isSelected = selectedZone?.id === zone.id;
                return (
                  <div
                    key={zone.id}
                    onClick={() => setSelectedZone(zone)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/40 ring-1 ring-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                        : 'border-sky-900/50 bg-[#061026]/70 hover:border-sky-700 hover:bg-[#091738]'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                          zone.threatLevel === 'RED'
                            ? 'bg-red-950/80 text-red-300 border-red-500/50 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                            : zone.threatLevel === 'ORANGE'
                            ? 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                            : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                        }`}>
                          {zone.threatLevel} ALERT
                        </span>
                        <h3 className="font-['Space_Grotesk'] text-base font-bold text-white">
                          {zone.district} Coast
                        </h3>
                        <span className="text-xs text-slate-400 font-mono">({zone.state})</span>
                      </div>

                      <div className="text-xs font-mono font-bold text-cyan-400">
                        {zone.landfallProximity}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] mb-3">
                      <div className="bg-[#030914] p-2 rounded-lg border border-sky-950">
                        <div className="text-slate-400 text-[10px]">Storm Surge</div>
                        <div className="font-bold text-rose-400">+{zone.stormSurgeHeightM} Meters</div>
                      </div>
                      <div className="bg-[#030914] p-2 rounded-lg border border-sky-950">
                        <div className="text-slate-400 text-[10px]">Inundation Inland</div>
                        <div className="font-bold text-white">{zone.inundationRiskKmInland} km Deep</div>
                      </div>
                      <div className="bg-[#030914] p-2 rounded-lg border border-sky-950">
                        <div className="text-slate-400 text-[10px]">Peak Wind Gust</div>
                        <div className="font-bold text-amber-400">{zone.peakWindGustKmh} km/h</div>
                      </div>
                      <div className="bg-[#030914] p-2 rounded-lg border border-sky-950">
                        <div className="text-slate-400 text-[10px]">Shelters Ready</div>
                        <div className="font-bold text-cyan-300">{zone.activeShelters} Shelters</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono mb-1">
                        <span className="text-slate-300">
                          Evacuated: <strong className="text-white">{zone.evacuatedCount.toLocaleString()}</strong> / {zone.targetEvacuation.toLocaleString()}
                        </span>
                        <span className="font-bold text-cyan-300">{zone.evacuationProgressPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            zone.evacuationProgressPercent >= 90 
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]' 
                              : zone.evacuationProgressPercent >= 75 
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-500' 
                              : 'bg-gradient-to-r from-amber-500 to-orange-500'
                          }`}
                          style={{ width: `${zone.evacuationProgressPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* High-risk Hotspots preview */}
                    <div className="mt-2.5 pt-2 border-t border-sky-950/80 flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-400">
                      <span className="text-rose-400 font-semibold">Critical Vulnerabilities:</span>
                      {zone.criticalVulnerabilities.slice(0, 2).map((vuln, i) => (
                        <span key={i} className="bg-[#030914] px-2 py-0.5 rounded text-slate-300 border border-sky-950">
                          {vuln}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Zone Deep Dive Card */}
          {selectedZone && (
            <div className="bg-[#091224]/95 backdrop-blur-xl rounded-2xl p-5 border border-sky-800/60 shadow-2xl">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-sky-950/80">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-['Space_Grotesk'] text-sm font-bold text-white">
                    Evacuation Logistics & Safe Corridors: {selectedZone.district} ({selectedZone.state})
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  Coastline: {selectedZone.coastlineKm} km
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-[#040a17]/80 p-3.5 rounded-xl border border-sky-900/60 shadow-inner">
                  <div className="font-semibold text-white mb-2 flex items-center gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                    Designated Safe Evacuation Corridors
                  </div>
                  <ul className="space-y-1.5 text-slate-300 font-mono text-[11px]">
                    {selectedZone.safeEvacuationRoutes.map((route, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{route}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-red-950/30 p-3.5 rounded-xl border border-red-500/30 shadow-inner">
                  <div className="font-semibold text-red-200 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    Inundation Hotspots (High Tidal Ingress)
                  </div>
                  <ul className="space-y-1.5 text-rose-300 font-mono text-[11px]">
                    {selectedZone.inundationHotspots.map((hotspot, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-rose-500 font-bold">•</span>
                        <span>{hotspot} (Surge +{selectedZone.stormSurgeHeightM}m)</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-sky-950/80 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
                  <span>NDRF Deployed: <strong className="text-white font-bold">{selectedZone.ndrfTeamsDeployed}</strong></span>
                  <span>ODRAF Deployed: <strong className="text-white font-bold">{selectedZone.odrafTeamsDeployed}</strong></span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleOpenCheckin}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-[0_0_10px_rgba(16,185,129,0.4)] flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>+ Evacuee Check-In</span>
                  </button>
                  <button
                    onClick={() => handleCallDistrictOfficer(selectedZone)}
                    className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-bold transition-all shadow-[0_0_10px_rgba(2,132,199,0.4)] flex items-center gap-1.5 cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call District Officer</span>
                  </button>
                  <button
                    onClick={onNavigateToShelters}
                    className="px-3 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white font-mono text-xs font-medium transition-all shadow-[0_0_10px_rgba(6,182,212,0.3)] flex items-center gap-1 cursor-pointer"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>View {selectedZone.district} Shelters</span>
                  </button>
                  <button
                    onClick={onNavigateToContacts}
                    className="px-3 py-1.5 rounded-lg bg-[#040a17] hover:bg-slate-800 text-slate-200 font-mono text-xs transition-all border border-sky-900/60 flex items-center gap-1 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Helplines</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Evacuation Process & Rescue Fleet Command (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-[#091224]/95 backdrop-blur-xl rounded-2xl p-5 border border-sky-800/60 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-sky-950/80">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-cyan-400" />
                <h2 className="font-['Space_Grotesk'] text-lg font-bold text-white">
                  Evacuation Process & Phases
                </h2>
              </div>
              <span className="text-[11px] font-mono text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                ACTIVE PHASE 1 & 2
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Standard Operating Procedure (SOP) structured into 3 concentric perimeter buffers to ensure zero casualty risk before landfall eyewall ingress.
            </p>

            {/* 3-Phase Accordion / Cards */}
            <div className="space-y-3.5">
              {evacuationPhases.map((phase) => (
                <div 
                  key={phase.phaseNumber}
                  className="p-3.5 rounded-xl border border-sky-900/50 bg-[#040a17]/80"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                      PHASE 0{phase.phaseNumber}
                    </span>
                    <span className="text-xs font-mono font-bold text-cyan-300">
                      {phase.completionPercent}% Complete
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-1">
                    {phase.title}
                  </h4>
                  <p className="text-xs text-slate-300 mb-2 leading-relaxed">
                    {phase.targetBelt}
                  </p>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mb-2.5 border border-slate-800">
                    <div 
                      className={`h-full rounded-full ${
                        phase.completionPercent >= 90 ? 'bg-emerald-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${phase.completionPercent}%` }}
                    ></div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 font-mono text-[10px] bg-[#02060f] p-2 rounded-lg border border-sky-950 mb-2">
                    <div>
                      <span className="text-slate-400">Evacuated: </span>
                      <strong className="text-white">{phase.evacuated.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Target: </span>
                      <strong className="text-slate-300">{phase.target.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Buses: </span>
                      <strong className="text-cyan-300">{phase.transportFleet.busesActive}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Boats: </span>
                      <strong className="text-cyan-400">{phase.transportFleet.emergencyBoats}</strong>
                    </div>
                  </div>

                  <div className="text-[11px] text-amber-300 bg-amber-950/60 p-2 rounded border border-amber-500/40">
                    <strong className="font-semibold text-amber-200">Special Focus: </strong>{phase.specialFocus}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Multilingual Coastal Voice Awareness Broadcaster */}
          <div className="bg-gradient-to-br from-[#120d04] via-[#1a1205] to-[#0c0802] rounded-2xl p-5 border border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.2)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]">
                  <Volume2 className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-['Space_Grotesk'] text-base font-bold text-amber-300">
                    Coastal Public Voice Warning
                  </h3>
                  <span className="text-[10px] font-mono text-amber-400/80">
                    Acoustic Broadcast to Aware Coastal Residents
                  </span>
                </div>
              </div>
              {onOpenVoiceModal && (
                <button
                  onClick={onOpenVoiceModal}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-mono text-[11px] font-bold transition-all border border-amber-400/50 cursor-pointer shadow-xs"
                >
                  Full Console
                </button>
              )}
            </div>

            <p className="text-xs text-amber-200/90 leading-relaxed">
              Speaks out loud in native regional languages of the threatened coastline ({activeStorm.landfallLocation}) to direct citizens into cyclone shelters immediately.
            </p>

            {/* Language Quick Selector */}
            <div className="flex flex-wrap items-center gap-1.5">
              {COASTAL_LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => {
                    setVoiceLang(lang.id);
                    if (isSpeakingAlert) {
                      stopCoastalAlert();
                      setIsSpeakingAlert(false);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all border flex items-center gap-1 cursor-pointer ${
                    voiceLang === lang.id
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                      : 'bg-[#0a0702] text-amber-300 border-amber-500/30 hover:bg-amber-950/60'
                  }`}
                >
                  <span>{lang.flagIcon}</span>
                  <span>{lang.nativeName}</span>
                </button>
              ))}
            </div>

            {/* Subtitle Teleprompter */}
            <div className="p-3 bg-[#050301]/90 rounded-xl border border-amber-500/40 text-xs text-slate-200 space-y-1 shadow-inner">
              <div className="flex items-center justify-between text-[10px] font-mono text-amber-400">
                <span className="font-bold">{COASTAL_LANGUAGES.find(l => l.id === voiceLang)?.name} Broadcast Script:</span>
                {isSpeakingAlert && (
                  <span className="text-red-400 font-bold flex items-center gap-1 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    Speaking Live...
                  </span>
                )}
              </div>
              <p className="line-clamp-3 text-amber-100 font-sans leading-relaxed">
                {currentSpeech.nativeScript}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSpeakAlert()}
                className={`flex-1 py-2.5 rounded-xl font-['Space_Grotesk'] font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer ${
                  isSpeakingAlert
                    ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
                    : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white'
                }`}
              >
                {isSpeakingAlert ? (
                  <>
                    <Square className="w-4 h-4 fill-white" />
                    <span>Stop Voice Broadcast</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>Speak {COASTAL_LANGUAGES.find(l => l.id === voiceLang)?.name} Warning Out Loud</span>
                  </>
                )}
              </button>

              {onOpenVoiceModal && (
                <button
                  onClick={onOpenVoiceModal}
                  className="px-3 py-2.5 rounded-xl bg-[#0a0702] hover:bg-amber-950/60 text-amber-300 border border-amber-500/40 font-mono text-xs font-semibold cursor-pointer"
                  title="Multi-lingual sequence"
                >
                  Sequence
                </button>
              )}
            </div>
          </div>

          {/* Quick Action Trigger Panel */}
          <div className="bg-[#091224]/95 backdrop-blur-xl rounded-2xl p-5 text-white border border-red-500/40 shadow-2xl">
            <h3 className="font-['Space_Grotesk'] text-base font-bold mb-2 flex items-center gap-2">
              <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
              Civil Protection Emergency Actions
            </h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Authorized emergency operators can broadcast siren warnings, generate official RSMC bulletins, or inspect neural attention heatmaps.
            </p>

            <div className="space-y-2">
              <button
                onClick={onOpenSirenModal}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-['Space_Grotesk'] font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.4)] cursor-pointer"
              >
                <Radio className="w-4 h-4" />
                <span>Trigger Multilingual Acoustic Siren</span>
              </button>
              <button
                onClick={onOpenBulletinModal}
                className="w-full py-2.5 rounded-xl bg-[#040a17] hover:bg-slate-800 text-white font-mono text-xs transition-all border border-sky-900/60 flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Generate Common Alerting Protocol (CAP) Bulletin</span>
              </button>
              <button
                onClick={onNavigateToXai}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>View Neural XAI Eyewall Attribution</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Universal Officer Call & Dispatch Modal */}
      <OfficerCallModal
        isOpen={isOfficerModalOpen}
        officer={officerModalData}
        onClose={() => setIsOfficerModalOpen(false)}
      />

      {/* Universal Evacuation Check-In Modal */}
      <EvacuationCheckinModal
        isOpen={isCheckinModalOpen}
        shelters={shelters}
        selectedShelter={shelters[0]}
        onClose={() => setIsCheckinModalOpen(false)}
        onCheckinSuccess={(record) => {
          setCheckins(prev => [record, ...prev.filter(c => c.id !== record.id)]);
        }}
      />
    </div>
  );
};

