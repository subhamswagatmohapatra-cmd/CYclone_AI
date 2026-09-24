import React, { useState } from 'react';
import { 
  Map, 
  Marker, 
  InfoWindow, 
  Polyline, 
  Circle 
} from '@vis.gl/react-google-maps';
import { SatelliteAnalysisResult } from '../../types';

interface SatelliteDetectionGoogleMapProps {
  analysisResult: SatelliteAnalysisResult;
}

export const SatelliteDetectionGoogleMap: React.FC<SatelliteDetectionGoogleMapProps> = ({
  analysisResult
}) => {
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('hybrid');
  const [showInfo, setShowInfo] = useState<boolean>(true);

  const centerLat = analysisResult.latitude;
  const centerLng = analysisResult.longitude;

  // Trajectory points from predicted track
  const trackPath = [
    { lat: centerLat, lng: centerLng },
    ...(analysisResult.predictedTrack || []).map(p => ({ lat: p.lat, lng: p.lon }))
  ];

  return (
    <div className="relative w-full h-[320px] rounded-xl overflow-hidden border border-sky-800/60 shadow-inner group">
      <Map
        defaultCenter={{ lat: centerLat, lng: centerLng }}
        defaultZoom={6}
        mapTypeId={mapType}
        disableDefaultUI={true}
        gestureHandling="greedy"
        internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
        className="w-full h-full"
      >
        {/* Forecast Trajectory Line */}
        <Polyline
          path={trackPath}
          strokeColor="#00f1fd"
          strokeOpacity={0.9}
          strokeWeight={3.5}
          geodesic={true}
        />

        {/* Radius of Maximum Winds (RMW) Circle */}
        <Circle
          center={{ lat: centerLat, lng: centerLng }}
          radius={(analysisResult.eyeDiameterKm || 30) * 1000}
          fillColor="#ef4444"
          fillOpacity={0.25}
          strokeColor="#ef4444"
          strokeOpacity={0.9}
          strokeWeight={2}
          clickable={false}
        />

        {/* Gale Wind 34kt Radii Circle */}
        <Circle
          center={{ lat: centerLat, lng: centerLng }}
          radius={180000}
          fillColor="#f59e0b"
          fillOpacity={0.08}
          strokeColor="#fbbf24"
          strokeOpacity={0.6}
          strokeWeight={1.5}
          clickable={false}
        />

        {/* Predicted Storm Center Marker */}
        <Marker
          position={{ lat: centerLat, lng: centerLng }}
          title={`Detected Eye Fix: ${analysisResult.latitude.toFixed(2)}°N, ${analysisResult.longitude.toFixed(2)}°E`}
          onClick={() => setShowInfo(true)}
          icon={{
            path: 0, // SymbolPath.CIRCLE
            scale: 9,
            fillColor: '#ef4444',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2.5
          }}
        />

        {/* Waypoint Markers */}
        {(analysisResult.predictedTrack || []).map((pt) => (
          <Marker
            key={pt.horizon}
            position={{ lat: pt.lat, lng: pt.lon }}
            title={`${pt.horizon}: ${pt.lat}°N, ${pt.lon}°E (${pt.category})`}
            icon={{
              path: 0, // SymbolPath.CIRCLE
              scale: 5,
              fillColor: '#38bdf8',
              fillOpacity: 1,
              strokeColor: '#09152b',
              strokeWeight: 1.5
            }}
          />
        ))}

        {/* InfoWindow popup */}
        {showInfo && (
          <InfoWindow
            position={{ lat: centerLat, lng: centerLng }}
            onCloseClick={() => setShowInfo(false)}
          >
            <div className="p-1 text-slate-900 font-sans max-w-[200px]">
              <div className="text-[11px] font-bold text-red-600 font-mono">
                {analysisResult.imdCategory} ({analysisResult.saffirCategory})
              </div>
              <div className="text-[12px] font-bold mt-0.5">
                {analysisResult.latitude.toFixed(2)}° N, {analysisResult.longitude.toFixed(2)}° E
              </div>
              <div className="text-[11px] text-slate-600 mt-1 font-mono">
                Winds: <strong>{analysisResult.maxSustainedWindsKts} kts</strong> • {analysisResult.centralPressureHpa} hPa
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {analysisResult.distanceToCoastlineKm} km offshore from {analysisResult.closestLandmark}
              </div>
            </div>
          </InfoWindow>
        )}
      </Map>

      {/* Map Type Switcher */}
      <div className="absolute top-2 right-2 flex items-center gap-1 bg-[#091224]/90 backdrop-blur-md p-1 rounded-lg border border-sky-800/60 z-10 text-[10px] font-mono">
        <button
          onClick={() => setMapType('hybrid')}
          className={`px-2 py-0.5 rounded cursor-pointer ${
            mapType === 'hybrid' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Satellite
        </button>
        <button
          onClick={() => setMapType('terrain')}
          className={`px-2 py-0.5 rounded cursor-pointer ${
            mapType === 'terrain' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Terrain
        </button>
      </div>

      {/* Coordinates HUD Overlay */}
      <div className="absolute bottom-2 left-2 bg-[#091224]/95 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-sky-700/60 text-[10px] font-mono text-slate-200 z-10 shadow-lg">
        <span className="text-cyan-400 font-bold">REALISTIC GIS FIX: </span>
        <span>{analysisResult.latitude.toFixed(2)}° N, {analysisResult.longitude.toFixed(2)}° E</span>
        <span className="text-slate-400 ml-2">({analysisResult.closestLandmark})</span>
      </div>
    </div>
  );
};
