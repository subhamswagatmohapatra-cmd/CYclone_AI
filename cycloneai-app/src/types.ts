export type Severity = 'critical' | 'high' | 'warning' | 'info';

export type StormCategory = 'Depression' | 'Deep Depression' | 'Cyclonic Storm' | 'Severe Cyclonic Storm' | 'Very Severe Cyclonic Storm' | 'Extremely Severe Cyclonic Storm' | 'Super Cyclonic Storm' | 'Cat 1' | 'Cat 2' | 'Cat 3' | 'Cat 4' | 'Cat 5' | 'TD';

export interface CoastalDangerZone {
  id: string;
  district: string;
  state: 'Odisha' | 'West Bengal' | 'Andhra Pradesh' | 'Gujarat' | 'Tamil Nadu';
  threatLevel: 'RED' | 'ORANGE' | 'YELLOW';
  coastlineKm: number;
  vulnerablePopulation: number;
  stormSurgeHeightM: number;
  peakWindGustKmh: number;
  inundationRiskKmInland: number;
  landfallProximity: 'Direct Strike' | 'High Impact' | 'Peripheral Threat';
  evacuationProgressPercent: number;
  evacuatedCount: number;
  targetEvacuation: number;
  activeShelters: number;
  ndrfTeamsDeployed: number;
  odrafTeamsDeployed: number;
  criticalVulnerabilities: string[];
  safeEvacuationRoutes: string[];
  inundationHotspots: string[];
}

export interface EvacuationPhaseDetails {
  phaseNumber: number;
  title: string;
  targetBelt: string; // e.g. "0 - 5 km shoreline buffer"
  status: 'In Progress' | 'Completed' | 'Pending';
  completionPercent: number;
  evacuated: number;
  target: number;
  transportFleet: {
    busesActive: number;
    emergencyBoats: number;
    odrafTeams: number;
    ndrfTeams: number;
    reliefTrucks: number;
  };
  specialFocus: string;
}

export interface SihInnovationItem {
  id: string;
  title: string;
  category: 'Explainable AI' | 'Offline Mesh PWA' | 'Acoustic Siren' | 'Evacuation Routing' | 'Ensemble AI' | 'Two-Way SOS' | 'CAP Protocol';
  imdLimitation: string;
  cycloneAiAdvantage: string;
  techStack: string;
  juryImpactScore: string; // e.g. "9.8 / 10"
  badge: string;
  actionLabel: string;
  actionTab?: string;
  actionModal?: 'siren' | 'bulletin' | 'xai' | 'upload';
}

export interface SimulationScenario {
  id: string;
  name: string;
  subtitle: string;
  cycloneName: string;
  category: StormCategory;
  landfallTarget: string;
  surgePeakM: number;
  windGustKmh: number;
  description: string;
  triggerEvent: string;
}

export interface StormProfile {
  id: string;
  name: string;
  code: string;
  category: StormCategory;
  saffirCategory: string; // e.g. "CAT 5"
  basin: string; // e.g. "Bay of Bengal"
  lat: number;
  lon: number;
  maxWindsKts: number;
  maxWindsKmh: number;
  centralPressureHpa: number;
  movementVector: string; // e.g. "NNE @ 22 km/h"
  translationSpeedKts: number;
  translationDirection: string;
  eyeDiameterKm: number;
  dvorakCI: string; // e.g. "T6.5 / Banding WMG"
  status: 'Critical' | 'Severe' | 'Active' | 'Weakening';
  landfallWindow: string; // e.g. "18h 40m ±45m"
  landfallLocation: string; // e.g. "Puri – Gopalpur Belt"
  oceanHeatContent: number; // kJ/cm2
  sstTempC: number;
  evacuationPercentage: number;
  evacuationCount: number;
  evacuationTarget: number;
  forecastMatrix: ForecastHorizon[];
  coastalDangerZones?: CoastalDangerZone[];
  evacuationPhases?: EvacuationPhaseDetails[];
  realtimeGeneratedAt?: string;
  simulationScenarioName?: string;
}

export interface ForecastHorizon {
  horizon: string; // e.g. "+06 Hours"
  hoursAhead: number;
  coordinates: string;
  lat: number;
  lon: number;
  windSpeedKts: number;
  pressureHpa: number;
  translation: string;
  category: string;
  uncertaintyRadiusKm: number;
}

export interface TelemetryAlert {
  id: string;
  timestamp: string;
  severity: Severity;
  title: string;
  description: string;
  source: string;
  timeAgo: string;
  read: boolean;
  category: 'Rapid Intensification' | 'Track Shift' | 'Sensor Health' | 'Civil Defense' | 'Siren Alert' | 'Radar Scan';
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'CRITICAL' | 'HIGH' | 'WARN' | 'INFO' | 'DEBUG';
  component: 'RADAR_DWR' | 'INSAT_3DR' | 'NEURAL_CLASSIFIER' | 'ENSEMBLE_ENGINE' | 'NDMA_CAP' | 'BUOY_NETWORK' | 'XAI_ENGINE';
  message: string;
  details?: Record<string, any>;
}

export interface GisLayerSettings {
  tir108: boolean;
  dopplerDwr: boolean;
  sstAnomaly: boolean;
  windVectors: boolean;
  evacCone: boolean;
  radarSweep: boolean;
  rangeRings: boolean;
  gridLines: boolean;
}

export interface SensorStatus {
  id: string;
  name: string;
  type: 'Satellite' | 'Doppler Radar' | 'Ocean Buoy' | 'NWP Model' | 'Siren Grid';
  status: 'ONLINE' | 'STANDBY' | 'CALIBRATING' | 'OFFLINE';
  lastPing: string;
  latencyMs: number;
  details: string;
}

export interface ShelterAmenities {
  powerBackup: boolean; // Solar / Diesel DG set
  roWater: boolean; // Potable water supply
  medicalOfficer: boolean; // First-aid & triage
  livestockPen: boolean; // Livestock shelter
  helipad: boolean; // Air-drop & evacuation access
  radioStation: boolean; // VHF / HAM radio link
}

export interface CycloneShelter {
  id: string;
  name: string;
  district: string;
  state: string;
  lat: number;
  lon: number;
  capacity: number;
  currentOccupancy: number;
  status: 'Operational' | 'Near Capacity' | 'Full';
  amenities: ShelterAmenities;
  inChargeName: string;
  inChargePhone: string;
  address: string;
  distanceKm?: number;
}

export interface ShelterCheckin {
  id: string;
  shelterId: string;
  shelterName: string;
  userId: string;
  userName: string;
  userEmail: string;
  familyMembersCount: number;
  contactNumber: string;
  specialNeeds?: string;
  timestamp: string;
  synced?: boolean;
}

export type FamilySafetyStatus = 'safe' | 'evacuating' | 'needs_help' | 'unknown';

export interface EmergencyContact {
  id: string;
  name: string;
  category: 'National Command' | 'State EOC' | 'District EOC' | 'First Responders' | 'Radio & Marine' | 'Personal Family';
  number: string;
  alternateNumber?: string;
  description: string;
  available24x7: boolean;
  priority: 'critical' | 'high' | 'standard';
  isCustom?: boolean;
  userId?: string;
  relationship?: string;
  location?: string;
  district?: string;
  assignedShelter?: string;
  safetyStatus?: FamilySafetyStatus;
  statusUpdatedAt?: string;
  synced?: boolean;
}

export interface PredictedTrackPoint {
  horizon: string;
  hoursAhead: number;
  lat: number;
  lon: number;
  windSpeedKts: number;
  windSpeedKmh: number;
  pressureHpa: number;
  category: string;
  uncertaintyRadiusKm: number;
  bearingDeg?: number;
}

export interface SatelliteAnalysisResult {
  id: string;
  timestamp: string;
  imageFileName: string;
  imageDataUrl?: string;
  isCycloneDetected: boolean;
  eyeDetected: boolean;
  eyeType: 'Pinhole Eye' | 'Banded Eye' | 'Ragged CDO' | 'Cloud Covered Center' | 'Exposed LLCC' | 'None';
  eyeDiameterKm: number;
  eyewallConvectiveTempC: number;
  convectiveSymmetryScore: number;
  spiralBandingArcDeg: number;
  systemName: string;
  imdCategory: StormCategory;
  saffirCategory: string;
  dvorakTNumber: string;
  currentIntensityCI: string;
  confidenceScore: number;
  maxSustainedWindsKts: number;
  maxSustainedWindsKmh: number;
  gustKmh: number;
  centralPressureHpa: number;
  pressureDeficitHpa: number;
  latitude: number;
  longitude: number;
  closestLandmark: string;
  distanceToCoastlineKm: number;
  oceanBasin: 'Bay of Bengal' | 'Arabian Sea' | 'North Indian Ocean' | 'Other';
  boundingBox: {
    ymin: number;
    xmin: number;
    ymax: number;
    xmax: number;
  };
  eyeCenterPixel: {
    xPercent: number;
    yPercent: number;
  };
  radiusOfMaximumWindsKm: number;
  galeWindRadiiKm: {
    ne: number;
    se: number;
    sw: number;
    nw: number;
  };
  translationSpeedKmh: number;
  translationDirection: string;
  predictedLandfallLocation: string;
  predictedLandfallEtaHours: number;
  predictedLandfallWindow: string;
  predictedTrack: PredictedTrackPoint[];
  rapidIntensificationRisk: 'Low' | 'Moderate' | 'High' | 'Extreme';
  oceanHeatContent: number;
  estimatedSstC: number;
  verticalWindShearKts: number;
  synopticDiscussion: string;
  recommendations: string[];
}
