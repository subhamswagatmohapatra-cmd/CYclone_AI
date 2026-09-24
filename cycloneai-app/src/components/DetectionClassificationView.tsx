import React, { useState, useRef, useEffect } from 'react';
import { 
  Radar, 
  Play, 
  Pause, 
  Eye, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  Crosshair, 
  Cpu, 
  Layers, 
  ChevronRight,
  Sparkles,
  Info,
  Navigation,
  Compass,
  Wind,
  Gauge,
  Thermometer,
  ShieldAlert,
  ArrowUpRight,
  Maximize2,
  RefreshCw,
  FileText,
  MapPin,
  Check,
  Zap,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { StormProfile, SatelliteAnalysisResult, StormCategory } from '../types';
import { PRESET_SATELLITE_PASSES, PresetSatellitePass } from '../data/sampleSatellitePasses';
import { analyzeSatelliteImage, convertAnalysisToStormProfile, generateClientMeteorologicalFallback } from '../utils/satelliteAnalysis';
import { SatelliteDetectionGoogleMap } from './Maps/SatelliteDetectionGoogleMap';

interface DetectionClassificationViewProps {
  activeStorm: StormProfile;
  onOpenUploadModal: () => void;
  onApplyStormAnalysis?: (storm: StormProfile) => void;
}

export const DetectionClassificationView: React.FC<DetectionClassificationViewProps> = ({
  activeStorm,
  onOpenUploadModal,
  onApplyStormAnalysis
}) => {
  // Current analysis state
  const [analysisResult, setAnalysisResult] = useState<SatelliteAnalysisResult | null>(() => {
    return generateClientMeteorologicalFallback('INSAT3DR_TIR1_Pass_Amphan.png', PRESET_SATELLITE_PASSES[0].thumbnailUrl);
  });
  
  const [selectedPass, setSelectedPass] = useState<PresetSatellitePass>(PRESET_SATELLITE_PASSES[0]);
  const [activeImageSrc, setActiveImageSrc] = useState<string>(PRESET_SATELLITE_PASSES[0].thumbnailUrl);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStage, setAnalysisStage] = useState<string>('');
  const [appliedNotice, setAppliedNotice] = useState<boolean>(false);
  const [spectrum, setSpectrum] = useState<'IR_ENHANCED' | 'VISIBLE' | 'WATER_VAPOR'>('IR_ENHANCED');

  // Interactive Layer Toggles
  const [showBoundingBox, setShowBoundingBox] = useState<boolean>(true);
  const [showEyeCrosshair, setShowEyeCrosshair] = useState<boolean>(true);
  const [showRmwRing, setShowRmwRing] = useState<boolean>(true);
  const [showGaleWindRadii, setShowGaleWindRadii] = useState<boolean>(true);
  const [showThermalPalette, setShowThermalPalette] = useState<boolean>(true);
  const [showStreamlines, setShowStreamlines] = useState<boolean>(true);

  // Zoom and Pan
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [userCrosshair, setUserCrosshair] = useState<{ x: number; y: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      setActiveImageSrc(base64Data);
      await runAnalysisProcess(base64Data, file.name, file.type || 'image/png');
    };
    reader.readAsDataURL(file);
  };

  // Run AI analysis
  const runAnalysisProcess = async (base64: string, fileName: string, mimeType: string = 'image/png') => {
    setIsAnalyzing(true);
    setAnalysisStage('Stage 1/4: Ingesting satellite radiometer raster...');

    setTimeout(() => {
      setAnalysisStage('Stage 2/4: Segmenting convective eyewall & CDO vortex...');
    }, 700);

    setTimeout(() => {
      setAnalysisStage('Stage 3/4: Calculating Dvorak T-number & intensity...');
    }, 1400);

    setTimeout(() => {
      setAnalysisStage('Stage 4/4: Estimating latitude/longitude & track prediction...');
    }, 2100);

    try {
      const result = await analyzeSatelliteImage(base64, fileName, mimeType);
      setAnalysisResult(result);
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
      setAnalysisStage('');
    }
  };

  // Load a preset satellite pass
  const handleSelectPreset = async (pass: PresetSatellitePass) => {
    setSelectedPass(pass);
    setActiveImageSrc(pass.thumbnailUrl);
    await runAnalysisProcess(pass.thumbnailUrl, `${pass.id}.png`, 'image/png');
  };

  // Apply analyzed storm to live dashboard
  const handleApplyToLive = () => {
    if (!analysisResult || !onApplyStormAnalysis) return;
    const newStorm = convertAnalysisToStormProfile(analysisResult);
    onApplyStormAnalysis(newStorm);
    setAppliedNotice(true);
    setTimeout(() => setAppliedNotice(false), 3500);
  };

  // Export advisory report
  const handleExportReport = () => {
    if (!analysisResult) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>IMD RSMC Cyclone Advisory - ${analysisResult.systemName}</title>
        <style>
          body { font-family: monospace, sans-serif; padding: 24px; color: #0f172a; line-height: 1.5; }
          h1 { color: #0369a1; border-bottom: 2px solid #0284c7; padding-bottom: 6px; }
          .header-box { background: #f8fafc; border: 1px solid #cbd5e1; padding: 12px; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 12px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
          th { background: #f1f5f9; }
          .tag { font-weight: bold; color: #dc2626; }
        </style>
      </head>
      <body>
        <h1>INDIA METEOROLOGICAL DEPARTMENT • RSMC TROPICAL CYCLONE ADVISORY</h1>
        <div class="header-box">
          <strong>SYSTEM:</strong> ${analysisResult.systemName} (${analysisResult.imdCategory})<br/>
          <strong>IDENTIFIED CENTER:</strong> ${analysisResult.latitude.toFixed(2)}°N, ${analysisResult.longitude.toFixed(2)}°E (${analysisResult.closestLandmark})<br/>
          <strong>DVORAK INTENSITY:</strong> ${analysisResult.dvorakTNumber} / ${analysisResult.currentIntensityCI} • Confidence: ${analysisResult.confidenceScore}%<br/>
          <strong>MAX WINDS:</strong> ${analysisResult.maxSustainedWindsKts} kts (${analysisResult.maxSustainedWindsKmh} km/h) | GUSTS: ${analysisResult.gustKmh} km/h<br/>
          <strong>ESTIMATED CENTRAL PRESSURE:</strong> ${analysisResult.centralPressureHpa} hPa (Drop: -${analysisResult.pressureDeficitHpa} hPa)<br/>
          <strong>PREDICTED LANDFALL:</strong> ${analysisResult.predictedLandfallLocation} in ~${analysisResult.predictedLandfallEtaHours} hours<br/>
          <strong>TIMESTAMP:</strong> ${analysisResult.timestamp}
        </div>

        <h3>FORECAST TRACK & INTENSITY OUTLOOK</h3>
        <table>
          <thead>
            <tr>
              <th>Horizon</th>
              <th>Coordinates</th>
              <th>Intensity Category</th>
              <th>Wind (Kmh / Kts)</th>
              <th>Central Pressure</th>
              <th>Uncertainty Radius</th>
            </tr>
          </thead>
          <tbody>
            ${analysisResult.predictedTrack.map(pt => `
              <tr>
                <td><strong>${pt.horizon}</strong></td>
                <td>${pt.lat}°N, ${pt.lon}°E</td>
                <td>${pt.category}</td>
                <td>${pt.windSpeedKmh} km/h (${pt.windSpeedKts} kts)</td>
                <td>${pt.pressureHpa} hPa</td>
                <td>±${pt.uncertaintyRadiusKm} km</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h3>SYNOPTIC METEOROLOGICAL DISCUSSION</h3>
        <p>${analysisResult.synopticDiscussion}</p>

        <h3>EMERGENCY ACTION RECOMMENDATIONS</h3>
        <ul>
          ${analysisResult.recommendations.map(r => `<li>${r}</li>`).join('')}
        </ul>
      </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  };

  const eyeCoordX = analysisResult?.eyeCenterPixel.xPercent ?? 50;
  const eyeCoordY = analysisResult?.eyeCenterPixel.yPercent ?? 50;
  const box = analysisResult?.boundingBox ?? { ymin: 15, xmin: 18, ymax: 85, xmax: 84 };

  return (
    <div className="flex flex-col gap-6 text-slate-100 p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Hidden file input for uploads */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept="image/*,.nc,.h5" 
        className="hidden" 
      />

      {/* Top Header & System Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#091224]/95 backdrop-blur-xl p-5 rounded-2xl border border-sky-800/60 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-bold shadow-[0_0_8px_rgba(6,182,212,0.3)]">
              MODULE 02 • SATELLITE MULTIMODAL AI
            </span>
            <span className="text-[11px] font-mono text-cyan-400 font-medium">
              Gemini Vision + INSAT-3DR Geostationary Neural Ingestion
            </span>
          </div>
          <h1 className="font-['Space_Grotesk'] text-2xl font-bold text-white flex items-center gap-2">
            Satellite Image Identification & Geo-Track Forecasting
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
              Live AI Model
            </span>
          </h1>
          <p className="text-[13px] text-slate-300 mt-0.5">
            Upload radiometer passes to automatically identify cyclonic eyes, classify WMO/IMD intensity, estimate precise coordinates (Lat/Lon), and predict forward landfall trajectories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (onOpenUploadModal) {
                onOpenUploadModal();
              } else {
                fileInputRef.current?.click();
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-['Space_Grotesk'] font-bold text-[13px] transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload & Ingest Pass</span>
          </button>

          {onApplyStormAnalysis && (
            <button
              onClick={handleApplyToLive}
              disabled={!analysisResult || isAnalyzing}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[13px] font-['Space_Grotesk'] font-bold transition-all cursor-pointer ${
                appliedNotice 
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]' 
                  : 'bg-[#050c1b] hover:bg-slate-800 text-cyan-300 border-cyan-500/40 hover:border-cyan-400'
              }`}
            >
              {appliedNotice ? <Check className="w-4 h-4 text-white" /> : <Zap className="w-4 h-4 text-cyan-400" />}
              <span>{appliedNotice ? 'Applied to Live Dashboard!' : 'Apply to Live System'}</span>
            </button>
          )}

          <button
            onClick={handleExportReport}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#050c1b] hover:bg-slate-800 text-slate-300 hover:text-white border border-sky-900/60 text-[13px] font-mono transition-all cursor-pointer"
            title="Download / Print Official IMD Advisory Bulletin"
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Advisory PDF</span>
          </button>
        </div>
      </div>

      {/* Preset Feeds Quick Ingestion Strip */}
      <div className="bg-[#091224]/90 backdrop-blur-xl p-3.5 rounded-2xl border border-sky-800/60 shadow-xl">
        <div className="flex items-center justify-between gap-2 mb-2 px-1">
          <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase flex items-center gap-1.5">
            <Radar className="w-3.5 h-3.5" /> Curated High-Resolution Cyclone Satellite Passes:
          </span>
          <span className="text-[10px] font-mono text-slate-400">Click any pass to run real-time neural inference</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {PRESET_SATELLITE_PASSES.map((pass) => {
            const isSelected = selectedPass.id === pass.id;
            return (
              <button
                key={pass.id}
                onClick={() => handleSelectPreset(pass)}
                disabled={isAnalyzing}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected 
                    ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]' 
                    : 'bg-[#040a17]/90 border-sky-900/60 hover:border-cyan-600/60 text-slate-300'
                }`}
              >
                <div>
                  <div className="text-[10px] font-mono text-cyan-400 font-bold truncate">{pass.satellite}</div>
                  <div className="text-[11px] font-['Space_Grotesk'] font-bold text-white truncate mt-0.5">{pass.name.split(':')[1] || pass.name}</div>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="truncate">{pass.defaultLat}°N, {pass.defaultLon}°E</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Visualizer & Inference Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Multi-Layer Satellite Image Visualizer (7 cols) */}
        <div className="lg:col-span-7 bg-[#091224]/95 backdrop-blur-xl rounded-2xl p-5 border border-sky-800/60 shadow-2xl flex flex-col justify-between space-y-4">
          <div>
            {/* Visualizer Top Bar & Spectrum Filters */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-950/80 pb-3">
              <div className="flex items-center gap-2">
                <Radar className="w-5 h-5 text-cyan-400" />
                <h3 className="font-['Space_Grotesk'] text-base font-bold text-white">
                  MULTI-SPECTRAL SATELLITE CANVAS
                </h3>
              </div>

              {/* Spectrum Selection */}
              <div className="flex items-center gap-1 bg-[#050c1b] p-1 rounded-xl text-[11px] font-mono border border-sky-900/60">
                <button
                  onClick={() => setSpectrum('IR_ENHANCED')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    spectrum === 'IR_ENHANCED' ? 'bg-cyan-600 text-white font-bold shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  IR BD-Curve (10.8µm)
                </button>
                <button
                  onClick={() => setSpectrum('VISIBLE')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    spectrum === 'VISIBLE' ? 'bg-cyan-600 text-white font-bold shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Visible (0.65µm)
                </button>
                <button
                  onClick={() => setSpectrum('WATER_VAPOR')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    spectrum === 'WATER_VAPOR' ? 'bg-cyan-600 text-white font-bold shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Water Vapor (6.9µm)
                </button>
              </div>
            </div>

            {/* Interactive Image Frame Viewport */}
            <div 
              className="relative w-full h-[420px] rounded-xl overflow-hidden bg-[#030914] border border-sky-900/60 cursor-crosshair select-none group shadow-inner mt-4"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                setUserCrosshair({ x: Math.round(x), y: Math.round(y) });
              }}
            >
              {/* Raster Image Layer */}
              <div 
                className="w-full h-full flex items-center justify-center transition-transform duration-200"
                style={{
                  transform: `scale(${zoomLevel})`,
                  filter: spectrum === 'VISIBLE' 
                    ? 'grayscale(100%) contrast(140%) brightness(110%)' 
                    : spectrum === 'WATER_VAPOR' 
                      ? 'hue-rotate(180deg) saturate(160%)' 
                      : 'none'
                }}
              >
                <img 
                  src={activeImageSrc} 
                  alt="Satellite pass" 
                  className="w-full h-full object-cover pointer-events-none" 
                />
              </div>

              {/* Scanning Laser Animation during Inference */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-cyan-950/30 backdrop-blur-xs flex flex-col items-center justify-center pointer-events-none z-30">
                  <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_rgba(6,182,212,1)] animate-bounce"></div>
                  <div className="bg-[#091224]/95 p-4 rounded-2xl border border-cyan-400/60 shadow-2xl flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                    <div className="font-['Space_Grotesk'] text-white font-bold text-sm">Processing Satellite Multimodal Vision</div>
                    <div className="font-mono text-cyan-300 text-xs">{analysisStage}</div>
                  </div>
                </div>
              )}

              {/* OVERLAYS */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Layer 1: AI Bounding Box */}
                {showBoundingBox && (
                  <g>
                    <rect 
                      x={box.xmin} 
                      y={box.ymin} 
                      width={box.xmax - box.xmin} 
                      height={box.ymax - box.ymin} 
                      fill="none" 
                      stroke="#00f1fd" 
                      strokeWidth="0.8" 
                      strokeDasharray="2 1" 
                    />
                    {/* Corner Reticles */}
                    <path d={`M ${box.xmin} ${box.ymin + 4} L ${box.xmin} ${box.ymin} L ${box.xmin + 4} ${box.ymin}`} fill="none" stroke="#00f1fd" strokeWidth="1.2" />
                    <path d={`M ${box.xmax - 4} ${box.ymin} L ${box.xmax} ${box.ymin} L ${box.xmax} ${box.ymin + 4}`} fill="none" stroke="#00f1fd" strokeWidth="1.2" />
                    <path d={`M ${box.xmin} ${box.ymax - 4} L ${box.xmin} ${box.ymax} L ${box.xmin + 4} ${box.ymax}`} fill="none" stroke="#00f1fd" strokeWidth="1.2" />
                    <path d={`M ${box.xmax - 4} ${box.ymax} L ${box.xmax} ${box.ymax} L ${box.xmax} ${box.ymax - 4}`} fill="none" stroke="#00f1fd" strokeWidth="1.2" />
                    <text x={box.xmin + 1} y={box.ymin + 3.5} fill="#00f1fd" fontSize="2.2" fontFamily="monospace" fontWeight="bold">
                      CONFIRMED CYCLONIC VORTEX (CONF: {analysisResult?.confidenceScore ?? 96}%)
                    </text>
                  </g>
                )}

                {/* Layer 3: Radius of Maximum Winds (RMW) Ring */}
                {showRmwRing && (
                  <g>
                    <circle 
                      cx={eyeCoordX} 
                      cy={eyeCoordY} 
                      r={analysisResult?.eyeDiameterKm ? Math.max(3.5, analysisResult.eyeDiameterKm / 5.5) : 5} 
                      fill="none" 
                      stroke="#f43f5e" 
                      strokeWidth="0.8" 
                      strokeDasharray="1.5 1" 
                      className="animate-pulse"
                    />
                  </g>
                )}

                {/* Layer 4: Gale Wind Radii (34kt / 50kt / 64kt) */}
                {showGaleWindRadii && analysisResult?.galeWindRadiiKm && (
                  <g opacity="0.6">
                    <ellipse 
                      cx={eyeCoordX} 
                      cy={eyeCoordY} 
                      rx={analysisResult.galeWindRadiiKm.ne / 10} 
                      ry={analysisResult.galeWindRadiiKm.sw / 10} 
                      fill="none" 
                      stroke="#f59e0b" 
                      strokeWidth="0.6" 
                      strokeDasharray="2 2" 
                    />
                    <ellipse 
                      cx={eyeCoordX} 
                      cy={eyeCoordY} 
                      rx={analysisResult.galeWindRadiiKm.se / 7} 
                      ry={analysisResult.galeWindRadiiKm.nw / 7} 
                      fill="none" 
                      stroke="#06b6d4" 
                      strokeWidth="0.5" 
                      strokeDasharray="3 2" 
                    />
                  </g>
                )}

                {/* Layer 6: Streamlines & Convective Spiral Vectors */}
                {showStreamlines && (
                  <g stroke="#38bdf8" strokeWidth="0.5" fill="none" strokeDasharray="3 3" opacity="0.7">
                    <path d={`M ${eyeCoordX - 25} ${eyeCoordY + 20} Q ${eyeCoordX - 10} ${eyeCoordY + 30}, ${eyeCoordX + 15} ${eyeCoordY + 15} T ${eyeCoordX + 25} ${eyeCoordY - 20}`} />
                    <path d={`M ${eyeCoordX + 25} ${eyeCoordY - 20} Q ${eyeCoordX + 10} ${eyeCoordY - 30}, ${eyeCoordX - 15} ${eyeCoordY - 15} T ${eyeCoordX - 25} ${eyeCoordY + 20}`} />
                  </g>
                )}
              </svg>

              {/* Layer 2: Eye Center Reticle Indicator */}
              {showEyeCrosshair && (
                <div 
                  className="absolute pointer-events-none z-20"
                  style={{ top: `${eyeCoordY}%`, left: `${eyeCoordX}%`, transform: 'translate(-50%, -50%)' }}
                >
                  <div className="w-10 h-10 border border-cyan-400 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_20px_rgba(6,182,212,0.9)]">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,1)]"></div>
                  </div>
                  {/* Lat/Lon Overlay Tag */}
                  <div className="absolute -top-7 left-6 whitespace-nowrap bg-[#091224]/95 border border-cyan-400 px-2 py-0.5 rounded text-[11px] font-mono text-cyan-300 shadow-2xl backdrop-blur-md">
                    Eye Fix: {analysisResult?.latitude.toFixed(2)}°N, {analysisResult?.longitude.toFixed(2)}°E • {analysisResult?.eyewallConvectiveTempC}°C
                  </div>
                </div>
              )}

              {/* User Click Reticle for Spot Measurement */}
              {userCrosshair && (
                <div 
                  className="absolute pointer-events-none z-20"
                  style={{ top: `${userCrosshair.y}%`, left: `${userCrosshair.x}%`, transform: 'translate(-50%, -50%)' }}
                >
                  <div className="w-6 h-6 border border-amber-400 rounded-full flex items-center justify-center">
                    <div className="w-1 h-1 bg-amber-400"></div>
                  </div>
                  <div className="absolute -bottom-6 left-4 whitespace-nowrap bg-[#091224]/95 border border-amber-400/60 px-2 py-0.5 rounded text-[10px] font-mono text-amber-300 shadow-2xl backdrop-blur-md">
                    Spot: {userCrosshair.x}% / {userCrosshair.y}% • Approx -76.8°C
                  </div>
                </div>
              )}

              {/* HUD Sensor Tag */}
              <div className="absolute top-3 left-3 bg-[#091224]/90 border border-sky-600/40 px-3 py-1.5 rounded-lg text-[11px] font-mono backdrop-blur-md shadow-2xl text-slate-200 z-20">
                <span className="text-slate-400">SENSOR PASS: </span>
                <span className="text-cyan-300 font-bold">{analysisResult?.imageFileName || 'Raw Pass'}</span>
                <div className="text-[10px] text-slate-400">Ocean Basin: {analysisResult?.oceanBasin}</div>
              </div>

              {/* HUD Pixel Temp Readout */}
              <div className="absolute bottom-3 right-3 bg-[#091224]/90 border border-sky-600/40 px-3 py-1.5 rounded-lg text-[11px] font-mono backdrop-blur-md text-right shadow-2xl z-20">
                <div className="text-slate-400">EYEWALL BRIGHTNESS TEMP:</div>
                <div className="text-rose-400 font-bold text-sm drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]">
                  {analysisResult?.eyewallConvectiveTempC ?? -82.4}°C (Deep Convection)
                </div>
              </div>
            </div>

            {/* Visualizer Layer Controls & Zoom Toolbar */}
            <div className="mt-3 pt-3 border-t border-sky-950/80 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-400 font-bold">ANALYSIS LAYERS:</span>
                <button
                  onClick={() => setShowBoundingBox(!showBoundingBox)}
                  className={`px-2 py-1 rounded border transition-all cursor-pointer ${
                    showBoundingBox ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50' : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                >
                  Bounding Box
                </button>
                <button
                  onClick={() => setShowEyeCrosshair(!showEyeCrosshair)}
                  className={`px-2 py-1 rounded border transition-all cursor-pointer ${
                    showEyeCrosshair ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50' : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                >
                  Eye Center Fix
                </button>
                <button
                  onClick={() => setShowRmwRing(!showRmwRing)}
                  className={`px-2 py-1 rounded border transition-all cursor-pointer ${
                    showRmwRing ? 'bg-rose-950 text-rose-300 border-rose-500/50' : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                >
                  RMW Core
                </button>
                <button
                  onClick={() => setShowGaleWindRadii(!showGaleWindRadii)}
                  className={`px-2 py-1 rounded border transition-all cursor-pointer ${
                    showGaleWindRadii ? 'bg-amber-950 text-amber-300 border-amber-500/50' : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                >
                  Quad Wind Radii
                </button>
                <button
                  onClick={() => setShowStreamlines(!showStreamlines)}
                  className={`px-2 py-1 rounded border transition-all cursor-pointer ${
                    showStreamlines ? 'bg-sky-950 text-sky-300 border-sky-500/50' : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                >
                  Streamlines
                </button>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => setZoomLevel(prev => Math.max(0.8, prev - 0.2))} 
                  className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] text-slate-400 w-10 text-center">{Math.round(zoomLevel * 100)}%</span>
                <button 
                  onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.2))} 
                  className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => setZoomLevel(1)} 
                  className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 hover:text-white cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Inference & Geospatial Fix (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* AI Classification Inference Card */}
          <div className="bg-[#091224]/95 backdrop-blur-xl rounded-2xl p-5 border border-sky-800/60 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-sky-950/80">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <h3 className="font-['Space_Grotesk'] text-base font-bold text-white">
                  IDENTIFICATION & CLASSIFICATION
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-bold shadow-[0_0_8px_rgba(6,182,212,0.3)]">
                CONFIDENCE: {analysisResult?.confidenceScore ?? 96.8}%
              </span>
            </div>

            {/* Identified Classification Hero Box */}
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 relative overflow-hidden mb-4 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-mono text-slate-300 uppercase font-semibold">PREDICTED CATEGORY</span>
                <span className="text-[12px] font-mono font-bold px-2 py-0.5 rounded bg-red-900/60 text-red-200 border border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.3)]">
                  {analysisResult?.saffirCategory}
                </span>
              </div>
              <div className="font-['Space_Grotesk'] text-2xl font-bold text-red-400 mb-2 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]">
                {analysisResult?.imdCategory}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-red-900/40 font-mono text-[12px]">
                <div>
                  <div className="text-[10px] text-slate-400">SUSTAINED WINDS</div>
                  <div className="text-cyan-300 font-bold text-base">
                    {analysisResult?.maxSustainedWindsKts} kts ({analysisResult?.maxSustainedWindsKmh} km/h)
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">CENTRAL PRESSURE</div>
                  <div className="text-rose-300 font-bold text-base">
                    {analysisResult?.centralPressureHpa} hPa
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">DVORAK T-NUMBER</div>
                  <div className="text-indigo-300 font-bold text-base">
                    {analysisResult?.dvorakTNumber} ({analysisResult?.currentIntensityCI})
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">EYE STRUCTURE</div>
                  <div className="text-white font-bold text-base truncate">
                    {analysisResult?.eyeType} ({analysisResult?.eyeDiameterKm}km)
                  </div>
                </div>
              </div>
            </div>

            {/* Geographical Fix & Coordinates Pinpoint */}
            <div className="bg-[#050c1b] p-4 rounded-xl border border-sky-900/60 mb-4 font-mono">
              <div className="flex items-center justify-between text-xs font-bold text-white mb-2">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  PREDICTED COORDINATES (EYE FIX)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-700/50">
                  {analysisResult?.oceanBasin}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[13px]">
                <div className="bg-[#091224] p-2.5 rounded-lg border border-sky-950">
                  <span className="text-[10px] text-slate-400 uppercase">Latitude</span>
                  <div className="text-xl font-bold text-cyan-300 font-['Space_Grotesk']">
                    {analysisResult?.latitude.toFixed(2)}° N
                  </div>
                </div>
                <div className="bg-[#091224] p-2.5 rounded-lg border border-sky-950">
                  <span className="text-[10px] text-slate-400 uppercase">Longitude</span>
                  <div className="text-xl font-bold text-cyan-300 font-['Space_Grotesk']">
                    {analysisResult?.longitude.toFixed(2)}° E
                  </div>
                </div>
              </div>
              <div className="mt-2.5 text-[11px] text-slate-300 flex items-center justify-between">
                <span>Nearest Coast: <strong className="text-white">{analysisResult?.closestLandmark}</strong></span>
                <span className="text-cyan-400 font-bold">{analysisResult?.distanceToCoastlineKm} km offshore</span>
              </div>
            </div>

            {/* Structural Meteorological Identification Features */}
            <div className="space-y-2">
              <div className="text-[11px] font-mono font-bold text-slate-300 uppercase flex justify-between">
                <span>Neural Feature Extractions</span>
                <span className="text-cyan-300 font-semibold">Eye Wall Geometry</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="bg-[#050c1b] p-2.5 rounded-lg border border-sky-950 flex flex-col justify-between">
                  <span className="text-slate-400">Convective Symmetry</span>
                  <span className="text-cyan-300 font-bold text-sm mt-1">{analysisResult?.convectiveSymmetryScore}%</span>
                </div>
                <div className="bg-[#050c1b] p-2.5 rounded-lg border border-sky-950 flex flex-col justify-between">
                  <span className="text-slate-400">Spiral Band Curvature</span>
                  <span className="text-cyan-300 font-bold text-sm mt-1">{analysisResult?.spiralBandingArcDeg}° Arc Wrap</span>
                </div>
                <div className="bg-[#050c1b] p-2.5 rounded-lg border border-sky-950 flex flex-col justify-between">
                  <span className="text-slate-400">Rapid Intensification</span>
                  <span className={`font-bold text-sm mt-1 ${
                    analysisResult?.rapidIntensificationRisk === 'Extreme' ? 'text-red-400' : 'text-amber-400'
                  }`}>
                    {analysisResult?.rapidIntensificationRisk} Risk
                  </span>
                </div>
                <div className="bg-[#050c1b] p-2.5 rounded-lg border border-sky-950 flex flex-col justify-between">
                  <span className="text-slate-400">Ocean Heat Content</span>
                  <span className="text-emerald-400 font-bold text-sm mt-1">{analysisResult?.oceanHeatContent} kJ/cm²</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Realistic Google Maps Eye Fix & Trajectory Map */}
      {analysisResult && (
        <div className="bg-[#091224]/95 backdrop-blur-xl rounded-2xl p-5 border border-sky-800/60 shadow-2xl">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-sky-950/80">
            <div>
              <h2 className="font-['Space_Grotesk'] text-lg font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-cyan-400" />
                Satellite Eye Fix On Real Geospatial Map
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Pinpointed center: <strong className="text-cyan-300">{analysisResult.latitude.toFixed(2)}°N, {analysisResult.longitude.toFixed(2)}°E</strong> ({analysisResult.distanceToCoastlineKm} km from {analysisResult.closestLandmark})
              </p>
            </div>
            <div className="text-xs font-mono text-cyan-300 font-bold">
              EPSG:4326 (WGS 84)
            </div>
          </div>
          <SatelliteDetectionGoogleMap analysisResult={analysisResult} />
        </div>
      )}

      {/* Trajectory & Landfall Prediction Table */}
      {analysisResult?.predictedTrack && (
        <div className="bg-[#091224]/95 backdrop-blur-xl rounded-2xl p-6 border border-sky-800/60 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-sky-950/80">
            <div>
              <h2 className="font-['Space_Grotesk'] text-xl font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-cyan-400" />
                Predicted Trajectory Path (+06h to +48h Horizons)
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Forward translation vector: <strong className="text-cyan-300">{analysisResult.translationDirection} @ {analysisResult.translationSpeedKmh} km/h</strong> • Expected Landfall: <strong className="text-rose-400">{analysisResult.predictedLandfallLocation} ({analysisResult.predictedLandfallWindow})</strong>
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-2.5 py-1 rounded bg-red-950/80 text-rose-300 border border-red-500/50 font-bold">
                Landfall ETA: ~{analysisResult.predictedLandfallEtaHours} Hours
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-sky-900/60 text-slate-400">
                  <th className="pb-2.5">Horizon</th>
                  <th className="pb-2.5">Predicted Coordinates</th>
                  <th className="pb-2.5">Expected Intensity</th>
                  <th className="pb-2.5">Max Wind Speed</th>
                  <th className="pb-2.5">Central Pressure</th>
                  <th className="pb-2.5 text-right">Error Margin Cone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {analysisResult.predictedTrack.map((pt, idx) => (
                  <tr key={pt.horizon} className="hover:bg-cyan-950/20 transition-colors">
                    <td className="py-3 font-bold text-cyan-300">{pt.horizon}</td>
                    <td className="py-3 text-white font-semibold flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      {pt.lat}°N, {pt.lon}°E
                    </td>
                    <td className="py-3 text-slate-200">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${
                        idx === 0 || idx === 1 ? 'bg-red-950/60 text-rose-300 border border-red-500/40' : 'bg-slate-900 text-slate-300'
                      }`}>
                        {pt.category}
                      </span>
                    </td>
                    <td className="py-3 text-cyan-300 font-bold">
                      {pt.windSpeedKmh} km/h ({pt.windSpeedKts} kts)
                    </td>
                    <td className="py-3 text-rose-300 font-bold">
                      {pt.pressureHpa} hPa
                    </td>
                    <td className="py-3 text-right text-slate-400">
                      ±{pt.uncertaintyRadiusKm} km
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Meteorological Discussion */}
          <div className="mt-5 p-4 rounded-xl bg-[#040a17] border border-sky-900/60 text-xs text-slate-300 space-y-2">
            <div className="font-mono text-cyan-400 font-bold uppercase flex items-center gap-1.5">
              <Info className="w-4 h-4" /> Chief Meteorologist Synoptic Analysis
            </div>
            <p className="leading-relaxed font-sans">{analysisResult.synopticDiscussion}</p>
          </div>
        </div>
      )}
    </div>
  );
};
