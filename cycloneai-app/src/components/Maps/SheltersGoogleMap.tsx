import React, { useState, useEffect, useCallback } from 'react';
import { 
  Map, 
  Marker, 
  InfoWindow, 
  Circle,
  useMap 
} from '@vis.gl/react-google-maps';
import { 
  Building2, 
  MapPin, 
  Users, 
  Zap, 
  Droplet, 
  Stethoscope, 
  Radio, 
  Navigation, 
  ExternalLink, 
  Crosshair, 
  Layers,
  Phone
} from 'lucide-react';
import { CycloneShelter, StormProfile } from '../../types';

interface SheltersGoogleMapProps {
  shelters: CycloneShelter[];
  selectedShelter: CycloneShelter | null;
  onSelectShelter: (shelter: CycloneShelter) => void;
  activeStorm: StormProfile;
  onOpenCheckinModal?: () => void;
}

export const SheltersGoogleMap: React.FC<SheltersGoogleMapProps> = ({
  shelters,
  selectedShelter,
  onSelectShelter,
  activeStorm,
  onOpenCheckinModal
}) => {
  const map = useMap();
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('hybrid');
  const [activePopupShelter, setActivePopupShelter] = useState<CycloneShelter | null>(null);

  const defaultCenter = { lat: 19.85, lng: 85.85 }; // Coastal Odisha (Puri - Jagatsinghpur)

  // Auto-pan to selected shelter when selected from list
  useEffect(() => {
    if (selectedShelter && map) {
      map.panTo({ lat: selectedShelter.lat, lng: selectedShelter.lon });
      map.setZoom(12);
      setActivePopupShelter(selectedShelter);
    }
  }, [selectedShelter, map]);

  const handleRecenterAll = useCallback(() => {
    if (!map || shelters.length === 0) return;
    if (typeof google !== 'undefined' && google.maps) {
      const bounds = new google.maps.LatLngBounds();
      shelters.forEach(s => bounds.extend({ lat: s.lat, lng: s.lon }));
      map.fitBounds(bounds, 50);
    }
  }, [map, shelters]);

  return (
    <div className="relative w-full h-[460px] rounded-xl overflow-hidden border border-slate-300 shadow-inner group">
      {/* Real Google Map Instance */}
      <Map
        defaultCenter={defaultCenter}
        defaultZoom={8}
        mapTypeId={mapType}
        disableDefaultUI={true}
        gestureHandling="greedy"
        internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
        className="w-full h-full"
      >
        {/* Active Cyclone Center Marker (Offshore in the Bay of Bengal) */}
        <Marker
          position={{ lat: activeStorm.lat || 18.2, lng: activeStorm.lon || 86.8 }}
          title={`Active Storm Center: ${activeStorm.name} (${activeStorm.category})`}
          icon={{
            path: 0, // SymbolPath.CIRCLE
            scale: 9,
            fillColor: '#ef4444',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2.5
          }}
        />

        {/* Shelter Pins on Real Geography */}
        {shelters.map(shelter => {
          const isSelected = selectedShelter?.id === shelter.id;
          const occupancyRate = shelter.capacity > 0 ? (shelter.currentOccupancy / shelter.capacity) : 0;
          const pinColor = 
            shelter.status !== 'Operational' 
              ? '#94a3b8' 
              : occupancyRate >= 0.95 
              ? '#ef4444' 
              : occupancyRate >= 0.8 
              ? '#f59e0b' 
              : '#10b981';

          return (
            <Marker
              key={shelter.id}
              position={{ lat: shelter.lat, lng: shelter.lon }}
              title={`${shelter.name} (${shelter.currentOccupancy}/${shelter.capacity})`}
              onClick={() => {
                onSelectShelter(shelter);
                setActivePopupShelter(shelter);
              }}
              icon={{
                path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 Z',
                fillColor: pinColor,
                fillOpacity: 1,
                strokeColor: isSelected ? '#ffffff' : '#040a17',
                strokeWeight: isSelected ? 2.5 : 1.2,
                scale: isSelected ? 1.2 : 0.95
              }}
            />
          );
        })}

        {/* Popup Card for Active Selected Shelter */}
        {activePopupShelter && (
          <InfoWindow
            position={{ lat: activePopupShelter.lat, lng: activePopupShelter.lon }}
            onCloseClick={() => setActivePopupShelter(null)}
          >
            <div className="p-1 text-slate-900 font-sans max-w-[240px]">
              <div className="flex items-center gap-1 text-[10px] font-bold text-sky-800 uppercase tracking-wider font-mono">
                <Building2 className="w-3 h-3 text-sky-600" />
                <span>{activePopupShelter.district}, {activePopupShelter.state}</span>
              </div>
              <h4 className="font-bold text-slate-900 text-[13px] leading-tight mt-0.5">
                {activePopupShelter.name}
              </h4>
              <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                {activePopupShelter.address}
              </p>

              {/* Occupancy Indicator */}
              <div className="mt-2 pt-1.5 border-t border-slate-200">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span>Occupancy:</span>
                  <span className="font-bold">
                    {activePopupShelter.currentOccupancy} / {activePopupShelter.capacity}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      (activePopupShelter.currentOccupancy / activePopupShelter.capacity) >= 0.95 
                        ? 'bg-red-500' 
                        : (activePopupShelter.currentOccupancy / activePopupShelter.capacity) >= 0.8 
                        ? 'bg-amber-500' 
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, (activePopupShelter.currentOccupancy / activePopupShelter.capacity) * 100)}%` }}
                  />
                </div>
              </div>

              {/* In-Charge Details */}
              <div className="mt-2 text-[10px] bg-slate-100 p-1.5 rounded font-mono">
                <div>In-Charge: <strong>{activePopupShelter.inChargeName}</strong></div>
                <div className="flex items-center gap-1 text-sky-700 font-bold mt-0.5">
                  <Phone className="w-2.5 h-2.5" />
                  <a href={`tel:${activePopupShelter.inChargePhone}`} className="hover:underline">
                    {activePopupShelter.inChargePhone}
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-2.5 flex items-center gap-1.5">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${activePopupShelter.lat},${activePopupShelter.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center py-1 px-2 rounded bg-sky-600 hover:bg-sky-700 text-white font-mono text-[10px] font-bold transition-colors flex items-center justify-center gap-1"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Directions</span>
                </a>
                {onOpenCheckinModal && (
                  <button
                    onClick={() => {
                      onSelectShelter(activePopupShelter);
                      onOpenCheckinModal();
                    }}
                    className="py-1 px-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[10px] font-bold transition-colors cursor-pointer"
                  >
                    Check-In
                  </button>
                )}
              </div>
            </div>
          </InfoWindow>
        )}
      </Map>

      {/* Top Map Controls Bar */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-slate-300 shadow-md z-10 text-xs font-mono">
        <button
          onClick={() => setMapType('hybrid')}
          className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
            mapType === 'hybrid' ? 'bg-sky-700 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
          title="Realistic Satellite Imagery with road network"
        >
          Satellite
        </button>
        <button
          onClick={() => setMapType('terrain')}
          className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
            mapType === 'terrain' ? 'bg-sky-700 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
          title="Topographic terrain and river elevation"
        >
          Terrain
        </button>
        <button
          onClick={() => setMapType('roadmap')}
          className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
            mapType === 'roadmap' ? 'bg-sky-700 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
          title="Standard road navigation"
        >
          Streets
        </button>
        <div className="w-[1px] h-4 bg-slate-300 mx-0.5" />
        <button
          onClick={handleRecenterAll}
          className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 cursor-pointer"
          title="Fit all shelters in view"
        >
          <Crosshair className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Status Legend Strip (Bottom-Left) */}
      <div className="absolute bottom-3 left-3 bg-white/95 border border-slate-300 p-2 rounded-xl text-[11px] font-mono backdrop-blur-md flex items-center gap-3 shadow-md text-slate-700 z-10">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available (&lt;80%)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Near Full (80-95%)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Full (&gt;95%)
        </span>
      </div>

      {/* Bottom-Right Location Count Watermark */}
      <div className="absolute bottom-3 right-3 bg-slate-900/80 text-white px-2.5 py-1 rounded-md text-[10px] font-mono flex items-center gap-1.5 z-10 shadow-xs">
        <MapPin className="w-3 h-3 text-cyan-400" />
        <span>{shelters.length} Shelters Geocoded</span>
      </div>
    </div>
  );
};
