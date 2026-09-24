export interface PresetSatellitePass {
  id: string;
  name: string;
  satellite: string;
  channel: string;
  dateStr: string;
  category: string;
  thumbnailUrl: string;
  defaultLat: number;
  defaultLon: number;
  description: string;
}

// High-quality SVG-based synthetic multi-spectral radiometer passes
const createSatelliteSvgDataUri = (
  vortexColor1: string,
  vortexColor2: string,
  eyeColor: string,
  eyeX: number,
  eyeY: number,
  eyeRadius: number,
  bandingTightness: number,
  label: string
) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
    <defs>
      <radialGradient id="vortexGlow" cx="${eyeX}%" cy="${eyeY}%" r="60%">
        <stop offset="0%" stop-color="${eyeColor}" stop-opacity="0.95"/>
        <stop offset="8%" stop-color="#020817" stop-opacity="0.9"/>
        <stop offset="18%" stop-color="${vortexColor1}" stop-opacity="0.85"/>
        <stop offset="35%" stop-color="${vortexColor2}" stop-opacity="0.75"/>
        <stop offset="60%" stop-color="#0369a1" stop-opacity="0.45"/>
        <stop offset="90%" stop-color="#08142b" stop-opacity="0.95"/>
      </radialGradient>
      <linearGradient id="gridGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0ea5e9" stop-opacity="0.15"/>
        <stop offset="100%" stop-color="#0284c7" stop-opacity="0.05"/>
      </linearGradient>
    </defs>
    <rect width="640" height="480" fill="#030816"/>
    <rect width="640" height="480" fill="url(#gridGrad)"/>
    
    <!-- Geostationary Grid Lines -->
    <g stroke="#38bdf8" stroke-width="0.5" stroke-opacity="0.25" stroke-dasharray="4 8">
      <line x1="0" y1="120" x2="640" y2="120"/>
      <line x1="0" y1="240" x2="640" y2="240"/>
      <line x1="0" y1="360" x2="640" y2="360"/>
      <line x1="160" y1="0" x2="160" y2="480"/>
      <line x1="320" y1="0" x2="320" y2="480"/>
      <line x1="480" y1="0" x2="480" y2="480"/>
    </g>

    <!-- Coastline Vector Contour (Bay of Bengal / Odisha coast) -->
    <path d="M 120 40 Q 180 140, 220 220 T 290 340 L 320 480" fill="none" stroke="#22d3ee" stroke-width="1.8" stroke-dasharray="3 3" opacity="0.6"/>
    <text x="140" y="80" fill="#38bdf8" font-family="monospace" font-size="10" opacity="0.7">INDIAN MAINLAND COAST</text>
    <text x="440" y="100" fill="#38bdf8" font-family="monospace" font-size="10" opacity="0.7">BAY OF BENGAL BASIN</text>

    <!-- Vortex Thermal Field -->
    <circle cx="${eyeX * 6.4}" cy="${eyeY * 4.8}" r="220" fill="url(#vortexGlow)"/>

    <!-- Convective Spiral Rainbands -->
    <g fill="none" stroke="${vortexColor1}" stroke-width="${bandingTightness * 3}" stroke-linecap="round" opacity="0.85">
      <path d="M ${eyeX * 6.4 - 180} ${eyeY * 4.8 + 120} C ${eyeX * 6.4 - 90} ${eyeY * 4.8 + 200}, ${eyeX * 6.4 + 140} ${eyeY * 4.8 + 140}, ${eyeX * 6.4 + 110} ${eyeY * 4.8 - 40} C ${eyeX * 6.4 + 90} ${eyeY * 4.8 - 140}, ${eyeX * 6.4 - 40} ${eyeY * 4.8 - 120}, ${eyeX * 6.4 - 70} ${eyeY * 4.8 - 30} C ${eyeX * 6.4 - 90} ${eyeY * 4.8 + 30}, ${eyeX * 6.4 - 30} ${eyeY * 4.8 + 50}, ${eyeX * 6.4} ${eyeY * 4.8}"/>
    </g>
    <g fill="none" stroke="${vortexColor2}" stroke-width="${bandingTightness * 2.2}" stroke-linecap="round" opacity="0.75">
      <path d="M ${eyeX * 6.4 - 230} ${eyeY * 4.8 - 60} C ${eyeX * 6.4 - 150} ${eyeY * 4.8 - 190}, ${eyeX * 6.4 + 160} ${eyeY * 4.8 - 180}, ${eyeX * 6.4 + 180} ${eyeY * 4.8 + 30} C ${eyeX * 6.4 + 180} ${eyeY * 4.8 + 170}, ${eyeX * 6.4 + 20} ${eyeY * 4.8 + 170}, ${eyeX * 6.4 - 10} ${eyeY * 4.8 + 80}"/>
    </g>

    <!-- Eyewall Ring -->
    <circle cx="${eyeX * 6.4}" cy="${eyeY * 4.8}" r="${eyeRadius * 2.2}" fill="none" stroke="#f43f5e" stroke-width="3" stroke-dasharray="6 3"/>
    <circle cx="${eyeX * 6.4}" cy="${eyeY * 4.8}" r="${eyeRadius}" fill="#020617" stroke="#38bdf8" stroke-width="2"/>

    <!-- Telemetry Overlay Banner -->
    <rect x="16" y="16" width="310" height="54" rx="8" fill="#020817" fill-opacity="0.85" stroke="#0ea5e9" stroke-width="1"/>
    <text x="28" y="36" fill="#38bdf8" font-family="monospace" font-size="11" font-weight="bold">INSAT-3DR TIR-1 (10.8µm)</text>
    <text x="28" y="54" fill="#94a3b8" font-family="monospace" font-size="10">${label} • RESOLUTION 4km/px</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const PRESET_SATELLITE_PASSES: PresetSatellitePass[] = [
  {
    id: 'pass-amphan-su-cs',
    name: 'INSAT-3DR: Super Cyclone Amphan (Cat 5)',
    satellite: 'INSAT-3DR Geostationary',
    channel: 'TIR-1 (10.8µm) Enhanced BD Curve',
    dateStr: '2020-05-18 12:00 UTC',
    category: 'Super Cyclonic Storm',
    defaultLat: 19.85,
    defaultLon: 86.92,
    description: 'Pin-hole circular eye surrounded by deep convective eyewall brightness temperatures (< -88°C). Sustained winds 145 kts (270 km/h).',
    thumbnailUrl: createSatelliteSvgDataUri('#f43f5e', '#f59e0b', '#ffffff', 52, 48, 14, 2.5, 'PASS: AMPHAN (SU-CS)')
  },
  {
    id: 'pass-dana-vscs',
    name: 'INSAT-3D: Cyclone Dana Rapid Landfall Pass',
    satellite: 'INSAT-3D Imager',
    channel: 'Clean IR Window (10.8µm)',
    dateStr: '2024-10-24 15:30 UTC',
    category: 'Severe Cyclonic Storm',
    defaultLat: 20.45,
    defaultLon: 87.20,
    description: 'Compact asymmetric CDO targeting the Odisha coast between Dhamra and Bhitarkanika. Convective spiral banding wrapping 1.25 turns.',
    thumbnailUrl: createSatelliteSvgDataUri('#ef4444', '#06b6d4', '#e2e8f0', 50, 46, 22, 2.0, 'PASS: DANA (SCS)')
  },
  {
    id: 'pass-fani-escs',
    name: 'Kalpana-1: Extremely Severe Cyclone Fani',
    satellite: 'Kalpana-1 VHRR',
    channel: 'Infrared & Water Vapor Composite',
    dateStr: '2019-05-02 09:00 UTC',
    category: 'Extremely Severe Cyclonic Storm',
    defaultLat: 18.90,
    defaultLon: 85.75,
    description: 'Classic Dvorak T6.0 structure with high-velocity central dense overcast, heading directly towards Puri beach corridor.',
    thumbnailUrl: createSatelliteSvgDataUri('#e11d48', '#3b82f6', '#f8fafc', 48, 52, 18, 2.2, 'PASS: FANI (ESCS)')
  },
  {
    id: 'pass-biparjoy-vscs',
    name: 'INSAT-3DR: Arabian Sea Cyclone Biparjoy',
    satellite: 'INSAT-3DR Radiometer',
    channel: 'Mid-Wave Infrared (3.9µm)',
    dateStr: '2023-06-12 18:00 UTC',
    category: 'Very Severe Cyclonic Storm',
    defaultLat: 19.80,
    defaultLon: 67.40,
    description: 'Extremely long-lived Arabian Sea system exhibiting recurvature towards Saurashtra and Kutch coastlines.',
    thumbnailUrl: createSatelliteSvgDataUri('#f97316', '#0284c7', '#ffffff', 54, 50, 24, 1.9, 'PASS: BIPARJOY (VSCS)')
  },
  {
    id: 'pass-mocha-escs',
    name: 'MODIS Aqua: Super Severe Cyclone Mocha',
    satellite: 'MODIS Aqua / Terra',
    channel: 'Multi-Spectral False Color 250m',
    dateStr: '2023-05-13 06:45 UTC',
    category: 'Extremely Severe Cyclonic Storm',
    defaultLat: 18.25,
    defaultLon: 90.80,
    description: 'Intense eye formation over East-Central Bay of Bengal prior to catastrophic landfall in Rakhine/Sittwe.',
    thumbnailUrl: createSatelliteSvgDataUri('#dc2626', '#eab308', '#ffffff', 56, 44, 16, 2.4, 'PASS: MOCHA (ESCS)')
  },
  {
    id: 'pass-depression-bob',
    name: 'INSAT-3D: Developing Deep Depression BOB-04',
    satellite: 'INSAT-3D Imager',
    channel: 'Visible Radiance (0.65µm)',
    dateStr: '2026-09-19 03:00 UTC',
    category: 'Deep Depression',
    defaultLat: 16.50,
    defaultLon: 88.30,
    description: 'Low-level cyclonic circulation center (LLCC) with curved convective cumulus bands, in early intensification stage.',
    thumbnailUrl: createSatelliteSvgDataUri('#0284c7', '#10b981', '#64748b', 46, 54, 34, 1.2, 'PASS: DEPRESSION BOB-04')
  }
];
