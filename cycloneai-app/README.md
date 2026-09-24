# 🌀 CycloneAI: Real-Time Early Warning & Satellite Tracking Platform

An advanced, full-stack meteorological decision support system for tropical cyclone detection, intensity classification, multi-model ensemble trajectory forecasting, and coastal disaster mitigation.

Built for the **Bay of Bengal & Arabian Sea** basins (Odisha, Andhra Pradesh, West Bengal, Tamil Nadu, Gujarat) with real-time **Google Maps Platform** geospatial integration.

---

## 🌟 Key Features

### 1. 🛰️ AI Satellite Image Upload & Convective Eye Detection
- Upload multi-spectral satellite imagery (**INSAT-3DR TIR-1**, **Himawari-9 IR**, **GOES-16**, Doppler Radar CAPPI).
- Automatic **Eye Fix Pinpoint** with exact **Latitude & Longitude** coordinates.
- **Deep Learning Intensity Classification**:
  - IMD Classification (*Depression, Deep Depression, CS, SCS, VSCS, ESCS, Super Cyclone*).
  - Saffir-Simpson Hurricane Scale (*Category 1 to Category 5*).
  - Maximum Sustained Surface Winds (kts & km/h).
  - Estimated Central Barometric Pressure (hPa).
  - Automated Advanced Dvorak Technique (ADT) T-Number & CI score.
  - Eye Diameter and Convective Cloud Symmetry scoring.

### 2. 🗺️ Real Google Maps Platform GIS Integration
- **Synoptic GIS View (`SynopticGisGoogleMap.tsx`)**:
  - Realistic Satellite, Hybrid, Terrain, and Dark Radar map layers.
  - Live Doppler Weather Radar (DWR) station range buffers (Paradip & Visakhapatnam 100km & 250km rings).
  - 72-Hour Evacuation Cone of Uncertainty polygons.
  - Radius of Maximum Winds (RMW) and 34-knot gale wind swath radii.
- **Ensemble Trajectory & Spaghetti Map (`TrajectoryEnsembleGoogleMap.tsx`)**:
  - Consensus Deep Learning ensemble mean track.
  - Multi-model spaghetti member lines (IMD HWRF, ECMWF EPS, GFS Ensemble, NCMRWF NEPS).
  - Waypoint horizon navigation (`+06h`, `+12h`, `+24h`, `+48h`) with dynamic error margin circles.
- **Coastal Danger & Surge Inundation Footprint (`CoastalInundationGoogleMap.tsx`)**:
  - Real shoreline surge inundation polygons across vulnerable coastal districts (Puri, Jagatsinghpur, Kendrapara, Ganjam, Balasore).
  - Tiered alert zones (RED / ORANGE / YELLOW) with inland penetration risk depths.
- **Cyclone Shelters GIS Map (`SheltersGoogleMap.tsx`)**:
  - Accurate geospatial markers for Multi-Purpose Cyclone Shelters (MPCS).
  - Real-time live occupancy percentage & capacity status indicators.
  - One-click route navigation and check-in registration modal.

### 3. 🌐 Offline-First Resilience (IndexedDB & Service Worker)
- Works completely offline during coastal telecom and power tower failures.
- Caches shelters directory, emergency contacts, and maps data in IndexedDB.
- Queues family evacuation check-ins offline and auto-syncs to cloud Firestore when connectivity resumes.

### 4. 📢 Multilingual Coastal Voice Broadcasts & Sirens
- Real-time synthesized emergency audio alerts in regional coastal languages:
  - **Odia (ଓଡ଼ିଆ)**
  - **Telugu (తెలుగు)**
  - **Bengali (বাংলা)**
  - **Hindi (हिन्दी)**
  - **English**
- Web Audio API acoustic dual-tone siren synthesizer (300 Hz - 900 Hz oscillating evacuation sweep).

### 5. 🧠 Explainable AI (XAI) & Grad-CAM Heatmaps
- Meteorological visual explainability showing attention heatmaps on the primary convective spiral bands and eyewall cloud temperatures.
- Feature importance attribution for wind shear, sea surface temperature (SST), and atmospheric vorticity.

### 6. 📄 Official IMD / NDMA Weather Bulletin Generator
- Automated generation and export of standard national disaster management bulletins with synoptic telemetry, warning cones, and district emergency recommendations.

---

## 📂 Project Structure

```text
cycloneai-project/
├── index.html                       # HTML5 Single Page Application entry
├── vite.config.ts                   # Vite bundler configuration with Tailwind CSS v4
├── tsconfig.json                    # TypeScript compiler configuration & Google Maps types
├── package.json                     # NPM dependencies and run scripts
├── server.ts                        # Full-stack Node/Express server & API proxy
├── firestore.rules                  # Firebase Firestore security rules
├── firebase-blueprint.json          # Firestore collection schema blueprint
├── .env.example                     # Environment variable template
├── README.md                        # Documentation & setup guide
│
├── public/                          # Static assets and Web App Manifest
│   ├── sw.js                        # Offline caching Service Worker
│   └── cycloneai-complete-project.zip # Pre-packaged downloadable zip bundle
│
└── src/
    ├── main.tsx                     # React 19 application bootstrapping
    ├── App.tsx                      # Root layout, navigation tabs, and Google Maps APIProvider
    ├── index.css                    # Tailwind CSS v4 design tokens and theme styling
    ├── types.ts                     # TypeScript data contracts and meteorological interfaces
    │
    ├── components/                  # UI Views and Modals
    │   ├── HomeView.tsx             # Primary Synoptic Command Center & Telemetry HUD
    │   ├── DetectionClassificationView.tsx # AI Satellite Image Upload & Classification
    │   ├── TrackPredictionView.tsx  # Multi-Model Ensemble Trajectory & Landfall Matrix
    │   ├── CoastalDangerEvacuationView.tsx # Coastal Inundation & Threat Zones
    │   ├── SheltersMapView.tsx      # MPCS Cyclone Shelter Directory & Check-in
    │   ├── ExplainableAiView.tsx    # XAI Grad-CAM Convective Saliency Overlays
    │   ├── AnalyticsLogsView.tsx    # Audit logs and sensor telemetry graphs
    │   ├── EmergencyContactsView.tsx# District disaster response directory
    │   ├── SihInnovationView.tsx    # Innovation architecture documentation
    │   ├── Header.tsx               # Top navigational bar and threat ticker
    │   ├── Sidebar.tsx              # Application sidebar navigation
    │   │
    │   ├── Maps/                    # Real Google Maps Platform Components
    │   │   ├── SynopticGisGoogleMap.tsx        # Real-time Synoptic GIS Map
    │   │   ├── TrajectoryEnsembleGoogleMap.tsx # Spaghetti Track Prediction Map
    │   │   ├── SheltersGoogleMap.tsx           # Cyclone Shelters GIS Map
    │   │   ├── CoastalInundationGoogleMap.tsx  # Storm Surge Inundation Threat Map
    │   │   └── SatelliteDetectionGoogleMap.tsx # AI Predicted Eye Fix Map
    │   │
    │   └── Modals/                  # Interactive System Modals
    │       ├── SatelliteUploadModal.tsx        # Drag-and-drop satellite pass analyzer
    │       ├── SirenTriggerModal.tsx           # Acoustic siren evacuation alert
    │       ├── BulletinGeneratorModal.tsx      # Official IMD/NDMA PDF/Text bulletin
    │       ├── CoastalVoiceBroadcastModal.tsx  # Multilingual voice warning announcer
    │       └── XaiReportModal.tsx              # Deep neural network inference report
    │
    ├── data/
    │   ├── mockData.ts              # Historical cyclones (Mocha, Fani, Amphan, Biparjoy)
    │   ├── sampleSatellitePasses.ts # Satellite passes (INSAT-3DR, Himawari-9, Meteosat)
    │   └── sheltersAndContacts.ts   # Coastal Odisha & Andhra MPCS shelter database
    │
    └── utils/
        ├── audio.ts                 # Acoustic siren oscillator & radar audio synthesis
        ├── offlineStorage.ts        # IndexedDB storage and Firestore synchronization
        └── satelliteAnalysis.ts     # Meteorological feature extraction algorithms
```

---

## 🚀 Quickstart & Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **NPM** or **Bun**

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Set your Google Maps Platform API key in `.env`:
```env
VITE_GOOGLE_MAPS_API_KEY="YOUR_GOOGLE_MAPS_API_KEY"
```

### 3. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🛠️ Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion
- **Maps & GIS**: Google Maps Platform (`@vis.gl/react-google-maps`)
- **Backend / Server**: Node.js, Express, ESBuild, TSX
- **Database & Sync**: Firebase Firestore, IndexedDB (Offline Storage)
- **Audio & Media**: Web Audio API (Dual-Tone Acoustic Sirens & Pings), Web Speech API
- **Icons**: Lucide React
