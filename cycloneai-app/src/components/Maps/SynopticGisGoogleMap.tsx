import React, { useState, useEffect, useCallback } from 'react';
import { 
  Map, 
  Marker, 
  AdvancedMarker, 
  InfoWindow, 
  Polyline, 
  Polygon, 
  Circle,
  useMap 
} from '@vis.gl/react-google-maps';
import { 
  Compass, 
  Navigation, 
  Layers, 
  Maximize2, 
  RotateCw, 
  Wind, 
  Eye, 
  Radio, 
  AlertTriangle, 
  Thermometer, 
  ShieldAlert,
  MapPin,
  Crosshair
} from 'lucide-react';
import { StormProfile, GisLayerSettings } from '../../types';

interface SynopticGisGoogleMapProps {
  activeStorm: StormProfile;
  gisLayers: GisLayerSettings;
  onSelectWaypoint?: (horizon: string) => void;
}

// Dark tactical map style for high-contrast meteorological radar visualization
const DARK_RADAR_MAP_STYLE: google.maps.MapTypeStyle[] = [
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
    stylers: [{ color: '#0ea5e9' }, { weight: 0.8 }, { strokeOpacity: 0.5 }]
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#cbd5e1' }]
  },
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#172554' }, { weight: 0.5 }]
  },
  {
    featureType: 'road',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#020816' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }]
  }
];

export const SynopticGisGoogleMap: React.FC<SynopticGisGoogleMapProps> = ({
  activeStorm,
  gisLayers,
  onSelectWaypoint
}) => {
  const map = useMap();
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('hybrid');
  const [useDarkTheme, setUseDarkTheme] = useState<boolean>(true);
  const [isEyeInfoOpen, setIsEyeInfoOpen] = useState<boolean>(false);
  const [radarSweepAngle, setRadarSweepAngle] = useState<number>(0);

  const stormLat = activeStorm.lat || 18.2;
  const stormLng = activeStorm.lon || 86.8;

  // Radar sweep animation for Doppler simulation
  useEffect(() => {
    let animId: number;
    let angle = 0;
    const animate = () => {
      angle = (angle + 2) % 360;
      setRadarSweepAngle(angle);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Recenter map on active storm eye
  const handleRecenterEye = useCallback(() => {
    if (!map) return;
    map.panTo({ lat: stormLat, lng: stormLng });
    map.setZoom(7);
  }, [map, stormLat, stormLng]);

  // Landfall coordinates
  const landfallCoords = {
    lat: 19.81,
    lng: 85.83, // Puri Coast
    name: activeStorm.landfallLocation || 'Puri Coast, Odisha'
  };

  // Trajectory points from forecast matrix
  const trajectoryPath = [
    { lat: stormLat, lng: stormLng },
    ...(activeStorm.forecastMatrix || []).map(f => ({
      lat: f.lat,
      lng: f.lon
    }))
  ];

  // Uncertainty cone polygon points
  const uncertaintyConeCoords = [
    { lat: stormLat, lng: stormLng },
    { lat: stormLat + 0.8, lng: stormLng - 0.7 },
    { lat: 20.4, lng: 85.3 }, // West boundary
    { lat: 20.8, lng: 86.9 }, // East boundary
    { lat: stormLat + 0.5, lng: stormLng + 0.8 },
    { lat: stormLat, lng: stormLng }
  ];

  // Coastal Danger Zone Inundation Coordinates for East Coast India
  const coastalZones = [
    { id: 'puri', name: 'Puri Coast', lat: 19.80, lng: 85.82, surge: '+4.2m', color: '#ef4444' },
    { id: 'kendrapara', name: 'Kendrapara / Paradip', lat: 20.30, lng: 86.60, surge: '+3.9m', color: '#ef4444' },
    { id: 'ganjam', name: 'Gopalpur, Ganjam', lat: 19.26, lng: 84.90, surge: '+3.1m', color: '#f59e0b' },
    { id: 'balasore', name: 'Chandipur, Balasore', lat: 21.46, lng: 87.01, surge: '+2.8m', color: '#f59e0b' },
    { id: 'digha', name: 'Digha, West Bengal', lat: 21.62, lng: 87.52, surge: '+2.4m', color: '#eab308' }
  ];

  return (
    <div className="relative w-full h-[470px] rounded-xl overflow-hidden border border-sky-900/60 shadow-inner group">
      {/* Real Google Map Instance */}
      <Map
        defaultCenter={{ lat: stormLat, lng: stormLng }}
        defaultZoom={6}
        mapTypeId={mapType}
        styles={mapType === 'roadmap' && useDarkTheme ? DARK_RADAR_MAP_STYLE : undefined}
        disableDefaultUI={true}
        gestureHandling="greedy"
        internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
        className="w-full h-full"
      >
        {/* Trajectory Uncertainty Cone (Polygons) */}
        {gisLayers.evacCone && (
          <Polygon
            paths={uncertaintyConeCoords}
            fillColor="#ef4444"
            fillOpacity={0.15}
            strokeColor="#f87171"
            strokeOpacity={0.7}
            strokeWeight={1.5}
            clickable={false}
          />
        )}

        {/* Forecast Trajectory Polyline */}
        <Polyline
          path={trajectoryPath}
          strokeColor="#00f1fd"
          strokeOpacity={0.9}
          strokeWeight={3.5}
          geodesic={true}
        />

        {/* Doppler DWR Radar Beam Range Circles (Paradip Radar Station) */}
        {gisLayers.dopplerDwr && (
          <>
            {/* Paradip DWR Station (20.26°N, 86.68°E) */}
            <Circle
              center={{ lat: 20.264, lng: 86.685 }}
              radius={100000} // 100km core reflectivity
              fillColor="#06b6d4"
              fillOpacity={0.08}
              strokeColor="#06b6d4"
              strokeOpacity={0.6}
              strokeWeight={1}
              clickable={false}
            />
            <Circle
              center={{ lat: 20.264, lng: 86.685 }}
              radius={250000} // 250km surveillance range
              fillColor="#3b82f6"
              fillOpacity={0.04}
              strokeColor="#38bdf8"
              strokeOpacity={0.4}
              strokeWeight={1}
              clickable={false}
            />
            {/* Visakhapatnam DWR Station */}
            <Circle
              center={{ lat: 17.704, lng: 83.297 }}
              radius={250000}
              fillColor="#6366f1"
              fillOpacity={0.03}
              strokeColor="#818cf8"
              strokeOpacity={0.35}
              strokeWeight={1}
              clickable={false}
            />
          </>
        )}

        {/* Radius of Maximum Winds (RMW) Circle around Eye */}
        <Circle
          center={{ lat: stormLat, lng: stormLng }}
          radius={(activeStorm.eyeDiameterKm || 32) * 1000}
          fillColor="#dc2626"
          fillOpacity={0.25}
          strokeColor="#ef4444"
          strokeOpacity={0.9}
          strokeWeight={2}
          clickable={false}
        />

        {/* Gale Wind 34kt (63 km/h) Radius Circle */}
        {gisLayers.windVectors && (
          <Circle
            center={{ lat: stormLat, lng: stormLng }}
            radius={220000} // 220 km gale swath
            fillColor="#f59e0b"
            fillOpacity={0.06}
            strokeColor="#fbbf24"
            strokeOpacity={0.5}
            strokeWeight={1.5}
            clickable={false}
          />
        )}

        {/* Thermal IR / TIR-1 Cold Cloud Canopy Circle Simulation */}
        {gisLayers.tir108 && (
          <Circle
            center={{ lat: stormLat, lng: stormLng }}
            radius={340000}
            fillColor="#8b5cf6"
            fillOpacity={0.12}
            strokeColor="#a78bfa"
            strokeOpacity={0.5}
            strokeWeight={1}
            clickable={false}
          />
        )}

        {/* Coastal Danger Markers */}
        {coastalZones.map(zone => (
          <Marker
            key={zone.id}
            position={{ lat: zone.lat, lng: zone.lng }}
            title={`${zone.name} (Storm Surge: ${zone.surge})`}
            icon={{
              path: 0, // google.maps.SymbolPath.CIRCLE
              scale: 6,
              fillColor: zone.color,
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 1.5
            }}
          />
        ))}

        {/* Landfall Target Marker */}
        <Marker
          position={{ lat: landfallCoords.lat, lng: landfallCoords.lng }}
          title={`PROJECTED LANDFALL: ${landfallCoords.name}`}
          icon={{
            path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 Z',
            fillColor: '#dc2626',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            scale: 1
          }}
        />

        {/* Forecast Waypoint Markers */}
        {(activeStorm.forecastMatrix || []).map((point, idx) => (
          <Marker
            key={point.horizon}
            position={{ lat: point.lat, lng: point.lon }}
            title={`${point.horizon}: ${point.windSpeedKts} kts (${point.category})`}
            onClick={() => onSelectWaypoint && onSelectWaypoint(point.horizon)}
            icon={{
              path: 0, // google.maps.SymbolPath.CIRCLE
              scale: 5,
              fillColor: idx === 0 ? '#00f1fd' : '#38bdf8',
              fillOpacity: 0.9,
              strokeColor: '#09152b',
              strokeWeight: 2
            }}
          />
        ))}

        {/* Active Cyclone Eye Center Marker */}
        <Marker
          position={{ lat: stormLat, lng: stormLng }}
          title={`${activeStorm.name} (${activeStorm.category}) - Click for Details`}
          onClick={() => setIsEyeInfoOpen(true)}
          icon={{
            path: 0, // google.maps.SymbolPath.CIRCLE
            scale: 9,
            fillColor: '#ef4444',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2.5
          }}
        />

        {/* Eye InfoWindow popup */}
        {isEyeInfoOpen && (
          <InfoWindow
            position={{ lat: stormLat, lng: stormLng }}
            onCloseClick={() => setIsEyeInfoOpen(false)}
          >
            <div className="p-1 text-slate-900 font-sans max-w-[220px]">
              <div className="flex items-center justify-between font-bold border-b pb-1 text-xs">
                <span className="text-red-700 font-mono">{activeStorm.name}</span>
                <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-mono">
                  {activeStorm.saffirCategory}
                </span>
              </div>
              <div className="text-[11px] mt-1.5 space-y-1 font-mono">
                <div>Coords: <strong>{stormLat.toFixed(2)}°N, {stormLng.toFixed(2)}°E</strong></div>
                <div>Intensity: <strong>{activeStorm.maxWindsKts} kts ({activeStorm.maxWindsKmh} km/h)</strong></div>
                <div>Pressure: <strong>{activeStorm.centralPressureHpa} hPa</strong></div>
                <div>Eye Diameter: <strong>{activeStorm.eyeDiameterKm} km</strong></div>
                <div>Landfall: <strong>{activeStorm.landfallLocation}</strong></div>
              </div>
            </div>
          </InfoWindow>
        )}
      </Map>

      {/* Dynamic Animated Radar Sweep Overlay on Top of Real Map */}
      {gisLayers.dopplerDwr && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div 
            className="absolute w-[600px] h-[600px] rounded-full border border-cyan-400/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              background: `conic-gradient(from ${radarSweepAngle}deg at 50% 50%, rgba(6, 182, 212, 0.25) 0deg, rgba(6, 182, 212, 0.05) 45deg, transparent 60deg, transparent 360deg)`
            }}
          />
        </div>
      )}

      {/* Realistic Tactical HUD Controls Bar (Top-Right) */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[#091224]/90 backdrop-blur-md p-1 rounded-xl border border-sky-700/60 shadow-xl z-10 text-xs font-mono">
        <button
          onClick={() => setMapType('hybrid')}
          className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
            mapType === 'hybrid' ? 'bg-cyan-600 text-white font-bold shadow-xs' : 'text-slate-300 hover:text-white'
          }`}
          title="Satellite imagery with coastal highways and district boundaries"
        >
          Satellite
        </button>
        <button
          onClick={() => setMapType('terrain')}
          className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
            mapType === 'terrain' ? 'bg-cyan-600 text-white font-bold shadow-xs' : 'text-slate-300 hover:text-white'
          }`}
          title="Topographic elevation and river delta contours"
        >
          Terrain
        </button>
        <button
          onClick={() => {
            setMapType('roadmap');
            setUseDarkTheme(true);
          }}
          className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
            mapType === 'roadmap' && useDarkTheme ? 'bg-cyan-600 text-white font-bold shadow-xs' : 'text-slate-300 hover:text-white'
          }`}
          title="High-contrast defense GIS radar styling"
        >
          Radar Dark
        </button>
        <div className="w-[1px] h-4 bg-slate-700 mx-0.5" />
        <button
          onClick={handleRecenterEye}
          className="p-1 rounded-lg bg-sky-950/80 hover:bg-sky-900 text-cyan-300 border border-cyan-500/40 cursor-pointer"
          title="Recenter view on Cyclone Eye"
        >
          <Crosshair className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* HUD Telemetry Strip (Bottom-Left) */}
      <div className="absolute bottom-3 left-3 bg-[#091224]/95 border border-sky-600/50 p-2.5 rounded-xl text-[11px] font-mono backdrop-blur-md flex flex-wrap items-center gap-3 shadow-2xl text-slate-200 z-10">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
          <span className="text-white font-bold">{activeStorm.name}</span>
          <span className="text-red-400 font-semibold">{stormLat.toFixed(1)}°N, {stormLng.toFixed(1)}°E</span>
        </div>
        <div className="flex items-center gap-1.5 border-l border-slate-700 pl-2.5">
          <Wind className="w-3.5 h-3.5 text-cyan-400" />
          <span>{activeStorm.maxWindsKts} KT</span>
        </div>
        <div className="flex items-center gap-1.5 border-l border-slate-700 pl-2.5">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          <span className="text-rose-300 font-semibold">Landfall: {activeStorm.landfallLocation}</span>
        </div>
      </div>

      {/* Real-Time Live Status Watermark (Bottom-Right) */}
      <div className="absolute bottom-3 right-3 bg-[#040a17]/90 px-2 py-1 rounded-md border border-slate-800 text-[10px] font-mono text-cyan-400 flex items-center gap-1.5 z-10">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>Google Maps High-Res Telemetry</span>
      </div>
    </div>
  );
};
