import React, { useState, useEffect } from 'react';
import { 
  Map, 
  Marker, 
  InfoWindow, 
  Polygon, 
  Polyline, 
  Circle,
  useMap 
} from '@vis.gl/react-google-maps';
import { 
  AlertTriangle, 
  Waves, 
  ShieldAlert, 
  Navigation, 
  Layers, 
  Crosshair, 
  Wind 
} from 'lucide-react';
import { CoastalDangerZone, StormProfile } from '../../types';

interface CoastalInundationGoogleMapProps {
  zones: CoastalDangerZone[];
  selectedZone: CoastalDangerZone | null;
  onSelectZone: (zone: CoastalDangerZone) => void;
  activeStorm: StormProfile;
}

// Map geographical coordinates for each coastal district danger area
const DISTRICT_COORDINATES: Record<string, { lat: number; lng: number; surgePolygon: { lat: number; lng: number }[] }> = {
  Puri: {
    lat: 19.81,
    lng: 85.83,
    surgePolygon: [
      { lat: 19.72, lng: 85.60 },
      { lat: 19.78, lng: 85.70 },
      { lat: 19.85, lng: 85.95 },
      { lat: 19.98, lng: 86.25 },
      { lat: 19.90, lng: 86.30 },
      { lat: 19.74, lng: 85.85 },
      { lat: 19.68, lng: 85.65 }
    ]
  },
  Jagatsinghpur: {
    lat: 20.25,
    lng: 86.55,
    surgePolygon: [
      { lat: 20.10, lng: 86.35 },
      { lat: 20.22, lng: 86.45 },
      { lat: 20.35, lng: 86.72 },
      { lat: 20.28, lng: 86.78 },
      { lat: 20.15, lng: 86.55 },
      { lat: 20.08, lng: 86.42 }
    ]
  },
  Kendrapara: {
    lat: 20.55,
    lng: 86.80,
    surgePolygon: [
      { lat: 20.40, lng: 86.68 },
      { lat: 20.60, lng: 86.85 },
      { lat: 20.75, lng: 87.05 },
      { lat: 20.68, lng: 87.12 },
      { lat: 20.48, lng: 86.90 },
      { lat: 20.38, lng: 86.75 }
    ]
  },
  Ganjam: {
    lat: 19.35,
    lng: 84.95,
    surgePolygon: [
      { lat: 19.15, lng: 84.75 },
      { lat: 19.28, lng: 84.88 },
      { lat: 19.45, lng: 85.10 },
      { lat: 19.38, lng: 85.18 },
      { lat: 19.20, lng: 84.95 },
      { lat: 19.12, lng: 84.82 }
    ]
  },
  Balasore: {
    lat: 21.50,
    lng: 87.05,
    surgePolygon: [
      { lat: 21.30, lng: 86.90 },
      { lat: 21.48, lng: 87.02 },
      { lat: 21.65, lng: 87.25 },
      { lat: 21.58, lng: 87.32 },
      { lat: 21.40, lng: 87.12 },
      { lat: 21.28, lng: 86.98 }
    ]
  }
};

export const CoastalInundationGoogleMap: React.FC<CoastalInundationGoogleMapProps> = ({
  zones,
  selectedZone,
  onSelectZone,
  activeStorm
}) => {
  const map = useMap();
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('hybrid');
  const [activePopupZone, setActivePopupZone] = useState<CoastalDangerZone | null>(null);

  // Auto-pan when selected zone changes
  useEffect(() => {
    if (selectedZone && map) {
      const coords = DISTRICT_COORDINATES[selectedZone.district];
      if (coords) {
        map.panTo({ lat: coords.lat, lng: coords.lng });
        map.setZoom(10);
      }
    }
  }, [selectedZone, map]);

  return (
    <div className="relative w-full h-[380px] rounded-xl overflow-hidden border border-sky-800/60 shadow-inner group">
      {/* Real Google Map Instance */}
      <Map
        defaultCenter={{ lat: 20.0, lng: 86.0 }}
        defaultZoom={8}
        mapTypeId={mapType}
        disableDefaultUI={true}
        gestureHandling="greedy"
        internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
        className="w-full h-full"
      >
        {/* Active Offshore Cyclone Storm Eye */}
        <Marker
          position={{ lat: activeStorm.lat || 18.2, lng: activeStorm.lon || 86.8 }}
          title={`Active Storm Eye: ${activeStorm.name} (${activeStorm.category})`}
          icon={{
            path: 0, // SymbolPath.CIRCLE
            scale: 9,
            fillColor: '#ef4444',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2.5
          }}
        />

        {/* Storm Eyewall Surge Swath Circle */}
        <Circle
          center={{ lat: activeStorm.lat || 18.2, lng: activeStorm.lon || 86.8 }}
          radius={180000} // 180km surge threat ring
          fillColor="#dc2626"
          fillOpacity={0.1}
          strokeColor="#ef4444"
          strokeOpacity={0.6}
          strokeWeight={1.5}
          clickable={false}
        />

        {/* Coastal Inundation Threat Footprint Polygons */}
        {zones.map(zone => {
          const districtGeo = DISTRICT_COORDINATES[zone.district];
          if (!districtGeo) return null;
          const isSelected = selectedZone?.id === zone.id;
          const fillColor = 
            zone.threatLevel === 'RED' 
              ? '#ef4444' 
              : zone.threatLevel === 'ORANGE' 
              ? '#f59e0b' 
              : '#10b981';

          return (
            <React.Fragment key={zone.id}>
              {/* Surge footprint polygon along the coast */}
              <Polygon
                paths={districtGeo.surgePolygon}
                fillColor={fillColor}
                fillOpacity={isSelected ? 0.45 : 0.25}
                strokeColor={fillColor}
                strokeOpacity={0.9}
                strokeWeight={isSelected ? 3 : 1.5}
                onClick={() => {
                  onSelectZone(zone);
                  setActivePopupZone(zone);
                }}
              />

              {/* District Center Marker */}
              <Marker
                position={{ lat: districtGeo.lat, lng: districtGeo.lng }}
                title={`${zone.district} Coast - Surge: +${zone.stormSurgeHeightM}m`}
                onClick={() => {
                  onSelectZone(zone);
                  setActivePopupZone(zone);
                }}
                icon={{
                  path: 0, // SymbolPath.CIRCLE
                  scale: isSelected ? 8 : 6,
                  fillColor,
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: isSelected ? 2.5 : 1.5
                }}
              />
            </React.Fragment>
          );
        })}

        {/* Popup Card for Active Zone */}
        {activePopupZone && DISTRICT_COORDINATES[activePopupZone.district] && (
          <InfoWindow
            position={{
              lat: DISTRICT_COORDINATES[activePopupZone.district].lat,
              lng: DISTRICT_COORDINATES[activePopupZone.district].lng
            }}
            onCloseClick={() => setActivePopupZone(null)}
          >
            <div className="p-1 text-slate-900 font-sans max-w-[210px]">
              <div className="flex items-center justify-between font-bold border-b pb-1 text-xs">
                <span className="text-slate-900 font-mono">{activePopupZone.district} Coast</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  activePopupZone.threatLevel === 'RED' 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {activePopupZone.threatLevel} ALERT
                </span>
              </div>
              <div className="text-[11px] mt-1.5 space-y-1 font-mono">
                <div>Storm Surge: <strong className="text-red-700">+{activePopupZone.stormSurgeHeightM}m</strong></div>
                <div>Peak Gusts: <strong>{activePopupZone.peakWindGustKmh} km/h</strong></div>
                <div>Inundation: <strong>{activePopupZone.inundationRiskKmInland} km inland</strong></div>
                <div>Evacuated: <strong>{activePopupZone.evacuatedCount.toLocaleString()} ({activePopupZone.evacuationProgressPercent}%)</strong></div>
                <div>NDRF/ODRAF: <strong>{activePopupZone.ndrfTeamsDeployed + activePopupZone.odrafTeamsDeployed} Teams</strong></div>
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
          title="Satellite imagery showing real coast and inlets"
        >
          Satellite
        </button>
        <button
          onClick={() => setMapType('terrain')}
          className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
            mapType === 'terrain' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-300 hover:text-white'
          }`}
          title="Topographic elevation for flood contours"
        >
          Terrain
        </button>
        <button
          onClick={() => setMapType('roadmap')}
          className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
            mapType === 'roadmap' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-300 hover:text-white'
          }`}
          title="Street and highway network"
        >
          Streets
        </button>
      </div>

      {/* Surge Inundation Footprint Legend (Bottom-Left) */}
      <div className="absolute bottom-3 left-3 bg-[#091224]/95 border border-sky-600/50 p-2.5 rounded-xl text-[11px] font-mono backdrop-blur-md flex items-center gap-3 shadow-2xl text-slate-200 z-10">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-2 rounded-xs bg-red-500/80 border border-red-400"></span>
          <span className="text-red-300 font-bold">Direct Surge &gt;3.5m</span>
        </span>
        <span className="flex items-center gap-1.5 border-l border-slate-700 pl-2.5">
          <span className="w-3 h-2 rounded-xs bg-amber-500/80 border border-amber-400"></span>
          <span className="text-amber-300 font-bold">Moderate Surge 2-3m</span>
        </span>
      </div>
    </div>
  );
};
