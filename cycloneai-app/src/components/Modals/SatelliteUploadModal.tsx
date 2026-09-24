import React, { useState, useRef } from 'react';
import { CloudUpload, X, Check, Image, FileCode, Play, Sparkles, MapPin, Compass } from 'lucide-react';
import { StormProfile } from '../../types';
import { PRESET_SATELLITE_PASSES } from '../../data/sampleSatellitePasses';
import { analyzeSatelliteImage, convertAnalysisToStormProfile } from '../../utils/satelliteAnalysis';

interface SatelliteUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadPreset: (stormId: string) => void;
  allStorms: StormProfile[];
  onCustomFeedProcessed: (name: string, category: string, wind: number, pressure: number) => void;
  onApplyAnalyzedStorm?: (storm: StormProfile) => void;
}

export const SatelliteUploadModal: React.FC<SatelliteUploadModalProps> = ({
  isOpen,
  onClose,
  onLoadPreset,
  allStorms,
  onCustomFeedProcessed,
  onApplyAnalyzedStorm
}) => {
  const [selectedPassId, setSelectedPassId] = useState<string>(PRESET_SATELLITE_PASSES[0].id);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [customFile, setCustomFile] = useState<{ name: string; base64: string } | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCustomFile({
        name: file.name,
        base64: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCustomFile({
        name: file.name,
        base64: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRunInference = async () => {
    setIsProcessing(true);
    setAnalysisStatus('Segmenting storm vortex and geolocating...');

    try {
      if (customFile) {
        setAnalysisStatus('Running Gemini Vision & Dvorak classification...');
        const result = await analyzeSatelliteImage(customFile.base64, customFile.name);
        const newStorm = convertAnalysisToStormProfile(result);
        if (onApplyAnalyzedStorm) {
          onApplyAnalyzedStorm(newStorm);
        } else {
          onCustomFeedProcessed(newStorm.name, newStorm.category, newStorm.maxWindsKts, newStorm.centralPressureHpa);
        }
      } else {
        const pass = PRESET_SATELLITE_PASSES.find(p => p.id === selectedPassId) || PRESET_SATELLITE_PASSES[0];
        setAnalysisStatus(`Ingesting ${pass.name}...`);
        const result = await analyzeSatelliteImage(pass.thumbnailUrl, `${pass.id}.png`);
        const newStorm = convertAnalysisToStormProfile(result);
        if (onApplyAnalyzedStorm) {
          onApplyAnalyzedStorm(newStorm);
        } else {
          onCustomFeedProcessed(newStorm.name, newStorm.category, newStorm.maxWindsKts, newStorm.centralPressureHpa);
        }
      }
      setTimeout(() => {
        setIsProcessing(false);
        onClose();
      }, 600);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*,.nc,.h5" 
        className="hidden" 
      />

      <div className="relative w-full max-w-2xl bg-[#091224] border border-sky-800/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        {/* Header */}
        <div className="bg-[#040a17] p-4 border-b border-sky-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 flex items-center justify-center text-cyan-400 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
              <CloudUpload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-['Space_Grotesk'] text-base font-bold text-white flex items-center gap-2">
                Satellite Imagery Ingestion & AI Classifier
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  Multimodal
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Upload real satellite passes or select INSAT-3DR / Kalpana passes to predict Lat/Lon and intensity
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Drag & Drop Satellite Pass */}
          <div>
            <label className="block text-[12px] font-mono font-bold text-slate-200 mb-2">
              UPLOAD CUSTOM SATELLITE PASS (.PNG, .JPG, .TIFF, .NC, .H5)
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all ${
                dragOver 
                  ? 'border-cyan-400 bg-cyan-950/50' 
                  : customFile 
                    ? 'border-cyan-400 bg-cyan-950/30' 
                    : 'border-sky-900 hover:border-cyan-500/80 bg-[#040a17]'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-cyan-950 text-cyan-400 flex items-center justify-center mx-auto mb-2 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.4)]">
                <Image className="w-6 h-6" />
              </div>
              {customFile ? (
                <div>
                  <div className="text-[13px] font-bold text-cyan-300 flex items-center justify-center gap-1.5 font-mono">
                    <Check className="w-4 h-4 text-emerald-400" /> {customFile.name}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 font-mono">Image staged • Click or press run below to analyze</div>
                </div>
              ) : (
                <div>
                  <div className="text-[13px] text-white font-medium font-['Space_Grotesk']">
                    Click to browse or drag & drop satellite radiometer pass
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 font-mono">
                    Supports high-resolution PNG, JPEG, GeoTIFF, and NetCDF raster files
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preset Feed Selection */}
          <div>
            <label className="block text-[12px] font-mono font-bold text-slate-200 mb-2">
              OR SELECT CURATED SATELLITE PASS
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_SATELLITE_PASSES.map((pass) => {
                const isSelected = selectedPassId === pass.id && !customFile;
                return (
                  <button
                    key={pass.id}
                    type="button"
                    onClick={() => {
                      setSelectedPassId(pass.id);
                      setCustomFile(null);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]' 
                        : 'bg-[#040a17] border-sky-950 text-slate-300 hover:border-sky-800'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[12px] font-bold">
                      <span className="font-['Space_Grotesk'] text-white">{pass.name.split(':')[1] || pass.name}</span>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800/60">
                        {pass.category.split(' ')[0]}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 font-mono flex items-center justify-between">
                      <span>{pass.satellite}</span>
                      <span className="text-cyan-300 font-bold">{pass.defaultLat}°N, {pass.defaultLon}°E</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#040a17] p-4 border-t border-sky-900/60 flex justify-between items-center">
          <span className="text-[11px] font-mono text-slate-400">
            {isProcessing ? analysisStatus : 'CycloneNet-X9 Spatio-Temporal Pipeline'}
          </span>
          <div className="flex gap-2">
            <button 
              onClick={onClose} 
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl text-[12px] font-mono text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleRunInference}
              disabled={isProcessing}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-[12px] font-mono flex items-center gap-1.5 transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Classifying Pass...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Run Neural Inference</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
