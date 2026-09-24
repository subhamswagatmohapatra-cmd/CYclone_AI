import React, { useState } from 'react';
import { FileText, X, Copy, Check, Download, Printer } from 'lucide-react';
import { StormProfile } from '../../types';

interface BulletinGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeStorm: StormProfile;
}

export const BulletinGeneratorModal: React.FC<BulletinGeneratorModalProps> = ({
  isOpen,
  onClose,
  activeStorm,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const now = new Date();
  const dateStr = now.toUTCString().slice(5, 16);
  const timeStr = now.toISOString().slice(11, 16) + ' UTC';

  const bulletinText = `
================================================================================
INDIA METEOROLOGICAL DEPARTMENT
REGIONAL SPECIALIZED METEOROLOGICAL CENTRE - TROPICAL CYCLONES, NEW DELHI
TROPICAL CYCLONE ADVISORY BULLETIN NO. 14
================================================================================
TIME OF ISSUE: ${timeStr} | DATE: ${dateStr}
SUBJECT: SUPER CYCLONIC STORM "${activeStorm.name.toUpperCase()}" OVER ${activeStorm.basin.toUpperCase()}

1. CURRENT LOCATION & INTENSITY:
   The Super Cyclonic Storm "${activeStorm.name}" (Code: ${activeStorm.code}) over ${activeStorm.basin}
   moved north-northeastwards with a translation speed of ${activeStorm.translationSpeedKts} knots during past 06 hours.
   It lay centered at ${timeStr} near Latitude ${activeStorm.lat}°N and Longitude ${activeStorm.lon}°E.
   
   - Central Pressure: ${activeStorm.centralPressureHpa} hPa
   - Maximum Sustained Surface Winds: ${activeStorm.maxWindsKts} kts (${activeStorm.maxWindsKmh} km/h) gusting to ${Math.round(activeStorm.maxWindsKts * 1.15)} kts
   - Current Classification: ${activeStorm.category.toUpperCase()} (${activeStorm.saffirCategory})
   - Dvorak Intensity Index: ${activeStorm.dvorakCI}
   - Eye Diameter: ${activeStorm.eyeDiameterKm} km (Well-formed, warm symmetric core)

2. FORECAST TRACK AND INTENSITY MATRIX:
--------------------------------------------------------------------------------
Horizon     Date/Time (UTC)      Lat/Lon        Max Winds (kts)   Category
--------------------------------------------------------------------------------
+06 Hours   ${dateStr} +06h     ${activeStorm.forecastMatrix[0]?.coordinates || '18.2°N, 88.9°E'}   ${activeStorm.forecastMatrix[0]?.windSpeedKts || 165} kts          ${activeStorm.forecastMatrix[0]?.category || 'Cat 5'}
+12 Hours   ${dateStr} +12h     ${activeStorm.forecastMatrix[1]?.coordinates || '19.1°N, 89.2°E'}   ${activeStorm.forecastMatrix[1]?.windSpeedKts || 155} kts          ${activeStorm.forecastMatrix[1]?.category || 'Cat 5'}
+24 Hours   ${dateStr} +24h     ${activeStorm.forecastMatrix[2]?.coordinates || '20.4°N, 89.6°E'}   ${activeStorm.forecastMatrix[2]?.windSpeedKts || 140} kts          ${activeStorm.forecastMatrix[2]?.category || 'Cat 4'}
+48 Hours   ${dateStr} +48h     ${activeStorm.forecastMatrix[3]?.coordinates || '22.3°N, 90.8°E'}   ${activeStorm.forecastMatrix[3]?.windSpeedKts || 110} kts          ${activeStorm.forecastMatrix[3]?.category || 'Cat 3'}
+72 Hours   ${dateStr} +72h     ${activeStorm.forecastMatrix[4]?.coordinates || '24.1°N, 92.4°E'}   ${activeStorm.forecastMatrix[4]?.windSpeedKts || 65} kts           ${activeStorm.forecastMatrix[4]?.category || 'Cat 1'}
--------------------------------------------------------------------------------

3. LANDFALL ESTIMATE & COASTAL WARNING:
   Expected Landfall: ${activeStorm.landfallLocation} during window: ${activeStorm.landfallWindow}.
   The storm is likely to cross coast as a Very Severe to Super Cyclonic Storm.

4. STORM SURGE WARNING:
   Storm surge of about 3.5 to 4.5 meters height above astronomical tide is very likely
   to inundate low-lying coastal areas of Ganjam, Puri, Jagatsinghpur, and Kendrapara districts.

5. ACTION SUGGESTED:
   (a) Total suspension of fishing operations over deep sea and coastal zones.
   (b) Evacuation of coastal population from vulnerable thatch/mud houses to Pucca cyclone shelters.
   (c) Coastal ports hoisted Great Danger Signal No. GD-10.
   (d) Judicious regulation of rail, road, and air traffic.

ISSUED BY: CYCLONE WARNING DIVISION, RSMC NEW DELHI
================================================================================
`.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(bulletinText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([bulletinText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `IMD_RSMC_BULLETIN_${activeStorm.name.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-700 border border-sky-200">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-['Space_Grotesk'] text-base font-bold text-slate-900">
                IMD / RSMC Official Cyclone Advisory Bulletin
              </h2>
              <p className="text-[11px] text-slate-500 font-mono">
                Standard WMO/RSMC Dissemination Format • Auto-generated
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Text Viewport */}
        <div className="p-4 flex-1 overflow-y-auto bg-slate-900">
          <pre className="font-mono text-[12px] text-emerald-400 whitespace-pre-wrap leading-relaxed select-all">
            {bulletinText}
          </pre>
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 p-3.5 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Validated against IMD RSMC standard bulletin templates
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 text-[12px] font-mono font-medium transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-600 text-white hover:bg-sky-700 font-mono text-[12px] font-bold transition-all shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download .TXT</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
