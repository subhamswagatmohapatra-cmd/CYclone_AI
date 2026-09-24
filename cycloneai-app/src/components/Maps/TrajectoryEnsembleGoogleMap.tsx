import React, { useState, useCallback } from 'react';
import { 
  Map, 
  Marker, 
  InfoWindow, 
  Polyline, 
  Polygon, 
  Circle,
  useMap 
} from '@vis.gl/react-google-maps';
import { 
  Navigation, 
  Layers, 
  RotateCw, 
  Crosshair, 
  Calendar, 
  Wind, 
  AlertTriangle 
} from 'lucide-react';
import { StormProfile, ForecastHorizon } from '../../types';

interface TrajectoryEnsembleGoogleMapProps {
  activeStorm: StormProfile;
  selectedHorizonIndex: number;
  onSelectHorizon: (index: number) => void;
  showSpaghetti: boolean;
  onToggleSpaghetti: () => void;
}

// Dark tactical map style for trajectory prediction
const DARK_TRACK_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#09152b' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#040a17' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#38bdf8' }, { weight: 1.5 }]
  },
  {
    featureType: 'administrative.province',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0ea5e9' }, { weight: 0.8 }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#020816' }]
  }
];

export const TrajectoryEnsembleGoogleMap: React.FC<TrajectoryEnsembleGoogleMapProps> = ({
  activeStorm,
  selectedHorizonIndex,
  onSelectHorizon,
  showSpaghetti,
  onToggleSpaghetti
}) => {
  const map = useMap();
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('hybrid');
  const [selectedWaypointInfo, setSelectedWaypointInfo] = useState<ForecastHorizon | null>(null);

  const horizons = activeStorm.forecastMatrix || [];
  const currentHorizon = horizons[selectedHorizonIndex] || horizons[0];

  const stormLat = activeStorm.lat || 18.2;
  const stormLng = activeStorm.lon || 86.8;

  // Consensus track points
  const consensusPoints = [
    { lat: stormLat, lng: stormLng },
    ...horizons.map(h => ({ lat: h.lat, lng: h.lon }))
  ];

  // Selected waypoint
  const activePt = horizons[selectedHorizonIndex] || { lat: stormLat, lng: stormLng, uncertaintyRadiusKm: 35 };

  // Spaghetti Ensemble Member trajectories with realistic atmospheric variance
  const spaghettiModels = [
    {
      id: 'imd_hwrf',
      name: 'IMD HWRF',
      color: '#f59e0b',
      points: [
        { lat: stormLat, lng: stormLng },
        { lat: stormLat + 0.45, lng: stormLng - 0.45 },
        { lat: stormLat + 0.95, lng: stormLng - 0.85 },
        { lat: stormLat + 1.48, lng: stormLng - 1.25 },
        { lat: 19.88, lng: 85.75 } // Landfall near Puri
      ]
    },
    {
      id: 'ecmwf_eps',
      name: 'ECMWF EPS',
      color: '#60a5fa',
      points: [
        { lat: stormLat, lng: stormLng },
        { lat: stormLat + 0.42, lng: stormLng - 0.38 },
        { lat: stormLat + 0.88, lng: stormLng - 0.72 },
        { lat: stormLat + 1.35, lng: stormLng - 1.05 },
        { lat: 19.72, lng: 85.55 } // Landfall near Chilika
      ]
    },
    {
      id: 'gfs_ensemble',
      name: 'GFS Ensemble',
      color: '#00dce6',
      points: [
        { lat: stormLat, lng: stormLng },
        { lat: stormLat + 0.48, lng: stormLng - 0.52 },
        { lat: stormLat + 1.05, lng: stormLng - 0.98 },
        { lat: stormLat + 1.62, lng: stormLng - 1.42 },
        { lat: 20.08, lng: 86.15 } // Landfall near Konark
      ]
    },
    {
      id: 'ncmrwf_neps',
      name: 'NCMRWF NEPS',
      color: '#e2e8f0',
      points: [
        { lat: stormLat, lng: stormLng },
        { lat: stormLat + 0.38, lng: stormLng - 0.35 },
        { lat: stormLat + 0.82, lng: stormLng - 0.68 },
        { lat: stormLat + 1.28, lng: stormLng - 0.95 },
        { lat: 19.62, lng: 85.35 } // Landfall near Ganjam border
      ]
    }
  ];

  // 48h Cone of Uncertainty Envelope (Broadens as prediction time increases)
  const uncertaintyConePolygon = [
    { lat: stormLat, lng: stormLng },
    { lat: stormLat + 0.5, lng: stormLng - 0.75 },
    { lat: 20.45, lng: 85.1 }, // West envelope boundary
    { lat: 20.85, lng: 86.7 }, // East envelope boundary
    { lat: stormLat + 0.6, lng: stormLng + 0.65 },
    { lat: stormLat, lng: stormLng }
  ];

  const handleRecenter = useCallback(() => {
    if (!map) return;
    map.panTo({ lat: (stormLat + 20.0) / 2, lng: (stormLng + 86.0) / 2 });
    map.setZoom(6);
  }, [map, stormLat, stormLng]);

  return (
    <div className="relative w-full h-[380px] rounded-xl overflow-hidden border border-sky-900/60 shadow-inner group">
      {/* Real Google Map Instance */}
      <Map
        defaultCenter={{ lat: 19.1, lng: 86.4 }}
        defaultZoom={6}
        mapTypeId={mapType}
        styles={mapType === 'roadmap' ? DARK_TRACK_MAP_STYLE : undefined}
        disableDefaultUI={true}
        gestureHandling="greedy"
        internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
        className="w-full h-full"
      >
        {/* Cone of Uncertainty Polygon */}
        <Polygon
          paths={uncertaintyConePolygon}
          fillColor="#ef4444"
          fillOpacity={0.15}
          strokeColor="#f87171"
          strokeOpacity={0.7}
          strokeWeight={1.5}
          clickable={false}
        />

        {/* Spaghetti Member Lines */}
        {showSpaghetti && spaghettiModels.map(model => (
          <Polyline
            key={model.id}
            path={model.points}
            strokeColor={model.color}
            strokeOpacity={0.75}
            strokeWeight={2}
            geodesic={true}
          />
        ))}

        {/* Consensus Ensemble Mean Track (Bold Glowing Cyan Line) */}
        <Polyline
          path={consensusPoints}
          strokeColor="#00f1fd"
          strokeOpacity={0.95}
          strokeWeight={4}
          geodesic={true}
        />

        {/* Dynamic Uncertainty Radius Circle for Current Selected Horizon */}
        <Circle
          center={{ lat: activePt.lat || stormLat, lng: activePt.lon || stormLng }}
          radius={(activePt.uncertaintyRadiusKm || 35) * 1000}
          fillColor="#06b6d4"
          fillOpacity={0.15}
          strokeColor="#00f1fd"
          strokeOpacity={0.8}
          strokeWeight={1.5}
          clickable={false}
        />

        {/* Current Storm Eye Marker */}
        <Marker
          position={{ lat: stormLat, lng: stormLng }}
          title={`Active Storm Eye: ${activeStorm.name}`}
          icon={{
            path: 0, // SymbolPath.CIRCLE
            scale: 8,
            fillColor: '#ef4444',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2
          }}
        />

        {/* Waypoint Horizon Markers */}
        {horizons.map((h, idx) => {
          const isSelected = selectedHorizonIndex === idx;
          return (
            <Marker
              key={h.horizon}
              position={{ lat: h.lat, lng: h.lon }}
              title={`${h.horizon}: ${h.windSpeedKts} kts (${h.coordinates})`}
              onClick={() => {
                onSelectHorizon(idx);
                setSelectedWaypointInfo(h);
              }}
              icon={{
                path: 0, // SymbolPath.CIRCLE
                scale: isSelected ? 8 : 6,
                fillColor: isSelected ? '#00f1fd' : '#38bdf8',
                fillOpacity: 1,
                strokeColor: '#09152b',
                strokeWeight: 2
              }}
            />
          );
        })}

        {/* Projected Landfall Target Location Marker */}
        <Marker
          position={{ lat: 19.81, lng: 85.83 }}
          title={`Estimated Landfall Strike: ${activeStorm.landfallLocation}`}
          icon={{
            path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 Z',
            fillColor: '#dc2626',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            scale: 1.1
          }}
        />

        {/* InfoWindow for Clicked Waypoint */}
        {selectedWaypointInfo && (
          <InfoWindow
            position={{ lat: selectedWaypointInfo.lat, lng: selectedWaypointInfo.lon }}
            onCloseClick={() => setSelectedWaypointInfo(null)}
          >
            <div className="p-1 text-slate-900 font-sans max-w-[200px]">
              <div className="font-bold border-b pb-1 text-xs text-sky-800 font-mono">
                {selectedWaypointInfo.horizon} Projection
              </div>
              <div className="text-[11px] mt-1 space-y-0.5 font-mono">
                <div>Coords: <strong>{selectedWaypointInfo.coordinates}</strong></div>
                <div>Wind Speed: <strong>{selectedWaypointInfo.windSpeedKts} kts</strong></div>
                <div>Pressure: <strong>{selectedWaypointInfo.pressureHpa} hPa</strong></div>
                <div>Class: <strong>{selectedWaypointInfo.category}</strong></div>
                <div>Error Radius: <strong>±{selectedWaypointInfo.uncertaintyRadiusKm} km</strong></div>
              </div>
            </div>
          </InfoWindow>
        )}
      </Map>

      {/* Top Map Controls Bar */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[#091224]/90 backdrop-blur-md p-1 rounded-xl border border-sky-700/60 shadow-xl z-10 text-xs font-mono">
        <button
          onClick={() => setMapType('hybrid')}
          className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
            mapType === 'hybrid' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-300 hover:text-white'
          }`}
          title="Satellite imagery with coastal highways"
        >
          Satellite
        </button>
        <button
          onClick={() => setMapType('terrain')}
          className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
            mapType === 'terrain' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-300 hover:text-white'
          }`}
          title="Terrain elevation view"
        >
          Terrain
        </button>
        <button
          onClick={() => setMapType('roadmap')}
          className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
            mapType === 'roadmap' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-300 hover:text-white'
          }`}
          title="Dark nautical GIS map"
        >
          Dark Map
        </button>
        <div className="w-[1px] h-4 bg-slate-700 mx-0.5" />
        <button
          onClick={handleRecenter}
          className="p-1 rounded-lg bg-sky-950/80 hover:bg-sky-900 text-cyan-300 border border-cyan-500/40 cursor-pointer"
          title="Recenter track"
        >
          <Crosshair className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* HUD Bottom-Left Model Attribution Legend */}
      <div className="absolute bottom-3 left-3 bg-[#091224]/95 border border-sky-600/50 p-2.5 rounded-xl text-[11px] font-mono backdrop-blur-md flex flex-wrap items-center gap-3 shadow-2xl text-slate-200 z-10">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-1.5 bg-cyan-400 rounded-xs shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
          <span className="text-cyan-300 font-bold">CycloneAI Consensus</span>
        </div>
        {showSpaghetti && (
          <>
            <div className="flex items-center gap-1.5 border-l border-slate-700 pl-2.5">
              <span className="w-3 h-1 bg-[#f59e0b] rounded-xs"></span>
              <span className="text-amber-400">IMD HWRF</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-[#60a5fa] rounded-xs"></span>
              <span className="text-blue-400">ECMWF EPS</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-[#e2e8f0] rounded-xs"></span>
              <span className="text-slate-300">NCMRWF</span>
            </div>
          </>
        )}
      </div>

      {/* Active Waypoint HUD Badge */}
      <div className="absolute top-3 left-3 bg-[#091224]/90 border border-cyan-500/50 px-3 py-1.5 rounded-xl text-[11px] font-mono backdrop-blur-md shadow-xl text-white flex items-center gap-2 z-10">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
        <span>Horizon: <strong className="text-cyan-300">{currentHorizon.horizon}</strong> ({currentHorizon.coordinates})</span>
      </div>
    </div>
  );
};
