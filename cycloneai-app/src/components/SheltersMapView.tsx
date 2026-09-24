import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  PhoneCall,
  Users, 
  Zap, 
  Droplet, 
  Stethoscope, 
  Radio, 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  Filter, 
  Navigation, 
  CheckCircle2, 
  WifiOff, 
  Wifi, 
  Download, 
  Printer, 
  ExternalLink,
  ChevronRight,
  Info,
  UserCheck,
  Plus,
  Trash2,
  FileText,
  Clock
} from 'lucide-react';
import { CycloneShelter, StormProfile, ShelterCheckin } from '../types';
import { INITIAL_SHELTERS } from '../data/sheltersAndContacts';
import { SheltersGoogleMap } from './Maps/SheltersGoogleMap';
import { 
  getCachedShelters, 
  saveSheltersToCache, 
  getCachedCheckins, 
  deleteCheckin,
  isDeviceOnline 
} from '../utils/offlineStorage';
import { auth } from '../lib/firebase';
import { OfficerCallModal, OfficerDetails } from './Modals/OfficerCallModal';
import { EvacuationCheckinModal } from './Modals/EvacuationCheckinModal';

interface SheltersMapViewProps {
  activeStorm: StormProfile;
}

export const SheltersMapView: React.FC<SheltersMapViewProps> = ({ activeStorm }) => {
  const [shelters, setShelters] = useState<CycloneShelter[]>(() => getCachedShelters(INITIAL_SHELTERS));
  const [selectedShelter, setSelectedShelter] = useState<CycloneShelter | null>(shelters[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'map' | 'manifest'>('map');
  const [amenityFilter, setAmenityFilter] = useState<{
    powerBackup: boolean;
    roWater: boolean;
    medicalOfficer: boolean;
    livestockPen: boolean;
  }>({
    powerBackup: false,
    roWater: false,
    medicalOfficer: false,
    livestockPen: false,
  });

  const [isOnline, setIsOnline] = useState<boolean>(isDeviceOnline());
  const [checkins, setCheckins] = useState<ShelterCheckin[]>(() => getCachedCheckins());
  
  // Officer calling modal state
  const [isOfficerModalOpen, setIsOfficerModalOpen] = useState<boolean>(false);
  const [officerModalData, setOfficerModalData] = useState<OfficerDetails | null>(null);

  // Evacuation checkin modal state
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState<boolean>(false);
  const [shelterForCheckin, setShelterForCheckin] = useState<CycloneShelter | null>(null);

  // Sync online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Persist shelters to cache
  useEffect(() => {
    saveSheltersToCache(shelters);
  }, [shelters]);

  const districts = ['All', 'Puri', 'Ganjam', 'Jagatsinghpur', 'Kendrapara', 'Balasore', 'Srikakulam'];

  // Filtering
  const filteredShelters = useMemo(() => {
    return shelters.filter((s) => {
      const matchesSearch = 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.inChargeName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDistrict = selectedDistrict === 'All' || s.district === selectedDistrict;
      const matchesStatus = statusFilter === 'All' || s.status === statusFilter;

      const matchesPower = !amenityFilter.powerBackup || s.amenities.powerBackup;
      const matchesWater = !amenityFilter.roWater || s.amenities.roWater;
      const matchesMedical = !amenityFilter.medicalOfficer || s.amenities.medicalOfficer;
      const matchesLivestock = !amenityFilter.livestockPen || s.amenities.livestockPen;

      return matchesSearch && matchesDistrict && matchesStatus && matchesPower && matchesWater && matchesMedical && matchesLivestock;
    });
  }, [shelters, searchQuery, selectedDistrict, statusFilter, amenityFilter]);

  // Aggregate metrics
  const totalCapacity = shelters.reduce((acc, s) => acc + s.capacity, 0);
  const totalOccupancy = shelters.reduce((acc, s) => acc + s.currentOccupancy, 0);
  const remainingSpace = totalCapacity - totalOccupancy;
  const operationalCount = shelters.filter(s => s.status === 'Operational').length;

  const handleCallOfficer = (shelter: CycloneShelter) => {
    setOfficerModalData({
      name: shelter.inChargeName,
      role: `Shelter In-Charge • ${shelter.name}`,
      phone: shelter.inChargePhone,
      district: shelter.district,
      shelterName: shelter.name,
      badge: 'ODSMA-MPCS'
    });
    setIsOfficerModalOpen(true);
  };

  const handleOpenCheckin = (shelter?: CycloneShelter | null) => {
    setShelterForCheckin(shelter || selectedShelter || shelters[0]);
    setIsCheckinModalOpen(true);
  };

  const handleCheckinSuccess = (newCheckin: ShelterCheckin) => {
    setCheckins(prev => [newCheckin, ...prev.filter(c => c.id !== newCheckin.id)]);

    // Update shelter current occupancy locally
    setShelters(prev => prev.map(s => {
      if (s.id === newCheckin.shelterId) {
        const updatedOcc = Math.min(s.capacity, s.currentOccupancy + newCheckin.familyMembersCount);
        return {
          ...s,
          currentOccupancy: updatedOcc,
          status: updatedOcc >= s.capacity ? 'Full' : updatedOcc >= s.capacity * 0.85 ? 'Near Capacity' : 'Operational'
        };
      }
      return s;
    }));
  };

  const handleDeleteCheckin = async (checkinId: string) => {
    await deleteCheckin(checkinId);
    setCheckins(prev => prev.filter(c => c.id !== checkinId));
  };


  const handlePrintRunsheet = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>CycloneAI - Offline Emergency Shelter Directory</title>
        <style>
          body { font-family: sans-serif; padding: 24px; color: #1e293b; }
          h1 { color: #0284c7; margin-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
          th { background: #f1f5f9; }
          .badge { padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px; }
          .badge-op { background: #dcfce7; color: #166534; }
          .badge-near { background: #fef3c7; color: #92400e; }
        </style>
      </head>
      <body>
        <h1>CycloneAI - Coastal Emergency Shelter Directory</h1>
        <p>Target Storm: <strong>${activeStorm.name} (${activeStorm.saffirCategory})</strong> | Generated for Zero-Network Offline Field Use</p>
        <p>Total Capacity: ${totalCapacity.toLocaleString()} | Available Space: ${remainingSpace.toLocaleString()} | Shelters Listed: ${shelters.length}</p>
        <table>
          <thead>
            <tr>
              <th>Shelter Name</th>
              <th>District</th>
              <th>Coordinates</th>
              <th>Capacity</th>
              <th>Status</th>
              <th>In-Charge Contact</th>
              <th>Amenities</th>
            </tr>
          </thead>
          <tbody>
            ${shelters.map(s => `
              <tr>
                <td><strong>${s.name}</strong><br/><small>${s.address}</small></td>
                <td>${s.district}, ${s.state}</td>
                <td>${s.lat}°N, ${s.lon}°E</td>
                <td>${s.currentOccupancy} / ${s.capacity}</td>
                <td><span class="badge ${s.status === 'Operational' ? 'badge-op' : 'badge-near'}">${s.status}</span></td>
                <td>${s.inChargeName}<br/><strong>${s.inChargePhone}</strong></td>
                <td>
                  ${s.amenities.powerBackup ? '⚡DG ' : ''}
                  ${s.amenities.roWater ? '💧RO ' : ''}
                  ${s.amenities.medicalOfficer ? '🩺First-Aid ' : ''}
                  ${s.amenities.livestockPen ? '🐄Pen ' : ''}
                  ${s.amenities.helipad ? '🚁Helipad ' : ''}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Offline Status & Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-200">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-['Space_Grotesk'] text-xl font-bold text-slate-900 flex items-center gap-2">
                Cyclone Shelters & Evacuation Map
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">
                  Zero-Network Resilient
                </span>
              </h1>
              <p className="text-[12px] text-slate-500 font-mono">
                Multipurpose Coastal Cyclone Shelters (MPCS) • Live Capacity & Amenities Grid
              </p>
            </div>
          </div>
        </div>

        {/* Offline Badge & Export Button */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[12px] font-mono font-semibold ${
            isOnline 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4 text-emerald-600" />
                <span>ONLINE: CLOUD SYNCED</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-amber-600 animate-pulse" />
                <span>OFFLINE: LOCAL CACHE ACTIVE</span>
              </>
            )}
          </div>

          <button
            onClick={() => handleOpenCheckin(selectedShelter)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-[12px] font-bold font-mono transition-colors shadow-xs cursor-pointer"
            title="Register family evacuation check-in"
          >
            <UserCheck className="w-4 h-4" />
            <span>+ Evacuation Check-In</span>
          </button>

          <button
            onClick={handlePrintRunsheet}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 text-[12px] font-medium font-mono transition-colors shadow-xs"
            title="Print or save offline shelter directory"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Print Run-Sheet</span>
          </button>
        </div>
      </div>

      {/* Main View Mode Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'map'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Shelter Map & District Directory</span>
          </button>
          <button
            onClick={() => setActiveTab('manifest')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'manifest'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Registered Evacuees Manifest</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              activeTab === 'manifest' ? 'bg-white text-sky-800' : 'bg-slate-900 text-white'
            }`}>
              {checkins.length}
            </span>
          </button>
        </div>

        {activeTab === 'manifest' && (
          <button
            onClick={() => handleOpenCheckin(selectedShelter)}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Family Check-In</span>
          </button>
        )}
      </div>

      {/* Real-time Shelter Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-mono text-slate-500 uppercase">Operational Shelters</div>
          <div className="text-2xl font-bold font-['Space_Grotesk'] text-slate-900 mt-1">
            {operationalCount} <span className="text-sm font-normal text-slate-400">/ {shelters.length}</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-mono mt-1 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Structural Clearance
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-mono text-slate-500 uppercase">Total Space Capacity</div>
          <div className="text-2xl font-bold font-['Space_Grotesk'] text-slate-900 mt-1">
            {totalCapacity.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            Across {districts.length - 1} coastal districts
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-mono text-slate-500 uppercase">Current Evacuee Count</div>
          <div className="text-2xl font-bold font-['Space_Grotesk'] text-sky-700 mt-1">
            {totalOccupancy.toLocaleString()}
          </div>
          <div className="text-[11px] text-sky-600 font-mono mt-1 font-semibold">
            {Math.round((totalOccupancy / totalCapacity) * 100)}% Overall Inhabited
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-mono text-slate-500 uppercase">Remaining Safe Space</div>
          <div className="text-2xl font-bold font-['Space_Grotesk'] text-emerald-700 mt-1">
            {remainingSpace.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            Pucca masonry & storm-surge safe
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map (Left) & Shelter Directory (Right) */}
      {activeTab === 'map' && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive GIS Map */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-sky-600" />
              <h2 className="font-['Space_Grotesk'] text-base font-bold text-slate-900">
                Interactive Coastal Shelter GIS Plot
              </h2>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span className="flex items-center gap-1 text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available
              </span>
              <span className="flex items-center gap-1 text-amber-700">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Near Full
              </span>
              <span className="flex items-center gap-1 text-red-700">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Full
              </span>
            </div>
          </div>

          {/* Real Google Maps Shelters GIS Viewport */}
          <SheltersGoogleMap
            shelters={filteredShelters}
            selectedShelter={selectedShelter}
            onSelectShelter={setSelectedShelter}
            activeStorm={activeStorm}
            onOpenCheckinModal={() => handleOpenCheckin(selectedShelter)}
          />

          {/* Quick Shelter Search & Filters */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search shelter name, district, contact person..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* District Filter */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {districts.map(district => (
                  <button
                    key={district}
                    onClick={() => setSelectedDistrict(district)}
                    className={`px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors whitespace-nowrap ${
                      selectedDistrict === district 
                        ? 'bg-sky-600 text-white font-semibold shadow-xs' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {district}
                  </button>
                ))}
              </div>
            </div>

            {/* Amenity checkboxes */}
            <div className="flex flex-wrap items-center gap-3 text-[12px] font-medium text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-mono text-slate-500 uppercase font-semibold">Filter Facilities:</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={amenityFilter.powerBackup}
                  onChange={(e) => setAmenityFilter({ ...amenityFilter, powerBackup: e.target.checked })}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <Zap className="w-3.5 h-3.5 text-amber-500" /> Solar/DG Power
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={amenityFilter.roWater}
                  onChange={(e) => setAmenityFilter({ ...amenityFilter, roWater: e.target.checked })}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <Droplet className="w-3.5 h-3.5 text-sky-500" /> RO Water
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={amenityFilter.medicalOfficer}
                  onChange={(e) => setAmenityFilter({ ...amenityFilter, medicalOfficer: e.target.checked })}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <Stethoscope className="w-3.5 h-3.5 text-emerald-600" /> Medical Officer
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={amenityFilter.livestockPen}
                  onChange={(e) => setAmenityFilter({ ...amenityFilter, livestockPen: e.target.checked })}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <span>Livestock Pen</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Selected Shelter Details & Check-In Action */}
        <div className="lg:col-span-5 space-y-4">
          {selectedShelter ? (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                      {selectedShelter.district.toUpperCase()}, {selectedShelter.state}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      selectedShelter.status === 'Operational' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {selectedShelter.status}
                    </span>
                  </div>
                  <h3 className="font-['Space_Grotesk'] text-lg font-bold text-slate-900 leading-tight">
                    {selectedShelter.name}
                  </h3>
                  <div className="flex items-center gap-1 text-[12px] text-slate-500 mt-1 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-sky-600" />
                    <span>{selectedShelter.lat}°N, {selectedShelter.lon}°E • {selectedShelter.distanceKm} km from storm core</span>
                  </div>
                </div>
              </div>

              {/* Occupancy Progress Bar */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-[12px] font-mono mb-1.5">
                  <span className="text-slate-600">Live Shelter Occupancy:</span>
                  <span className="font-bold text-slate-900">
                    {selectedShelter.currentOccupancy} / {selectedShelter.capacity} ({Math.round((selectedShelter.currentOccupancy / selectedShelter.capacity) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      selectedShelter.currentOccupancy / selectedShelter.capacity > 0.85 
                        ? 'bg-amber-500' 
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, (selectedShelter.currentOccupancy / selectedShelter.capacity) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono">
                  <span>Available Beds: {selectedShelter.capacity - selectedShelter.currentOccupancy}</span>
                  <span>Pucca Multi-Level</span>
                </div>
              </div>

              {/* Verified Facilities Grid */}
              <div>
                <div className="text-[11px] font-mono text-slate-500 uppercase font-semibold mb-2">
                  Verified On-Site Disaster Facilities
                </div>
                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                    selectedShelter.amenities.powerBackup 
                      ? 'bg-amber-50/60 border-amber-200 text-amber-900' 
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    <Zap className="w-4 h-4 text-amber-600" />
                    <span>Solar DG Backup</span>
                  </div>

                  <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                    selectedShelter.amenities.roWater 
                      ? 'bg-sky-50/60 border-sky-200 text-sky-900' 
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    <Droplet className="w-4 h-4 text-sky-600" />
                    <span>RO Potable Water</span>
                  </div>

                  <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                    selectedShelter.amenities.medicalOfficer 
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' 
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    <Stethoscope className="w-4 h-4 text-emerald-600" />
                    <span>First-Aid Officer</span>
                  </div>

                  <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                    selectedShelter.amenities.radioStation 
                      ? 'bg-indigo-50/60 border-indigo-200 text-indigo-900' 
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    <Radio className="w-4 h-4 text-indigo-600" />
                    <span>VHF / HAM Radio Link</span>
                  </div>

                  <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                    selectedShelter.amenities.helipad 
                      ? 'bg-slate-100 border-slate-300 text-slate-800' 
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    <Navigation className="w-4 h-4 text-slate-600" />
                    <span>Air-Drop Helipad</span>
                  </div>

                  <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                    selectedShelter.amenities.livestockPen 
                      ? 'bg-slate-100 border-slate-300 text-slate-800' 
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    <Users className="w-4 h-4 text-slate-600" />
                    <span>Livestock Pen</span>
                  </div>
                </div>
              </div>

              {/* In-Charge Contact & Direct Call */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-mono text-slate-500">SHELTER IN-CHARGE</div>
                  <div className="text-[13px] font-bold text-slate-900">{selectedShelter.inChargeName}</div>
                  <div className="text-[12px] font-mono text-slate-600">{selectedShelter.inChargePhone}</div>
                </div>
                <button
                  onClick={() => handleCallOfficer(selectedShelter)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[12px] font-bold transition-all shadow-xs cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call Officer</span>
                </button>
              </div>

              {/* Check-In Action Button */}
              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => handleOpenCheckin(selectedShelter)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-['Space_Grotesk'] font-bold text-[13px] transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Check-In Family At This Shelter</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p>Select a cyclone shelter on the map or list to inspect capacity and facilities.</p>
            </div>
          )}

          {/* Filtered Shelter List Cards */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-[12px] font-mono text-slate-500 font-semibold mb-3">
              <span>ALL COASTAL SHELTERS ({filteredShelters.length})</span>
              <span>Sorted by District</span>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-1">
              {filteredShelters.map((shelter) => {
                const isSelected = selectedShelter?.id === shelter.id;
                return (
                  <div
                    key={shelter.id}
                    className={`w-full p-3 rounded-xl transition-all flex items-center justify-between gap-2 ${
                      isSelected 
                        ? 'bg-sky-50 border border-sky-200 text-slate-900 shadow-xs' 
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <button
                      onClick={() => setSelectedShelter(shelter)}
                      className="flex-1 text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[13px]">{shelter.name}</span>
                        <span className="text-[10px] font-mono text-slate-500 font-semibold">{shelter.district}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Capacity: {shelter.currentOccupancy} / {shelter.capacity} • {shelter.capacity - shelter.currentOccupancy} space left
                      </div>
                    </button>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleCallOfficer(shelter)}
                        className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Call shelter in-charge officer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Call</span>
                      </button>
                      <button
                        onClick={() => setSelectedShelter(shelter)}
                        className="p-1 text-slate-400 hover:text-slate-600"
                      >
                        <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-sky-600' : 'text-slate-400'}`} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Manifest View Tab: Full Registered Evacuees Log */}
      {activeTab === 'manifest' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-['Space_Grotesk'] text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-600" />
                <span>State Disaster Evacuee Headcount & Shelter Manifest</span>
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Real-time head of family registrations • Local offline storage with cloud synchronization
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[11px] font-mono text-slate-400 uppercase">Total Logged Evacuees: </span>
                <span className="text-lg font-mono font-bold text-sky-700">
                  {checkins.reduce((acc, c) => acc + (Number(c.familyMembersCount) || 1), 0)} Persons
                </span>
              </div>
              <button
                onClick={() => handleOpenCheckin(selectedShelter)}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Register Family</span>
              </button>
            </div>
          </div>

          {checkins.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-3">
              <UserCheck className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-700">
                No Evacuee Families Registered Yet
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Register yourself and family members at an official cyclone shelter to secure food rations, bedding, and medical assistance.
              </p>
              <button
                onClick={() => handleOpenCheckin(selectedShelter)}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-bold shadow-xs cursor-pointer"
              >
                + Register First Evacuee Check-In
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px]">
                <thead className="bg-slate-50 text-slate-600 font-mono text-[11px] border-b border-slate-200 uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Pass Token ID</th>
                    <th className="py-2.5 px-3">Head of Family</th>
                    <th className="py-2.5 px-3">Shelter Allocated</th>
                    <th className="py-2.5 px-3">Headcount</th>
                    <th className="py-2.5 px-3">Emergency Contact</th>
                    <th className="py-2.5 px-3">Special Needs</th>
                    <th className="py-2.5 px-3">Sync Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {checkins.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-sky-700">
                        {item.id}
                      </td>
                      <td className="py-3 px-3">
                        <strong className="text-slate-900">{item.userName}</strong>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-800">
                        {item.shelterName}
                      </td>
                      <td className="py-3 px-3 font-mono">
                        <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 font-bold">
                          {item.familyMembersCount} Member(s)
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700">
                        {item.contactNumber}
                      </td>
                      <td className="py-3 px-3">
                        {item.specialNeeds && item.specialNeeds !== 'None' ? (
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[11px]">
                            {item.specialNeeds}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px]">
                        {item.synced ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Cloud Synced
                          </span>
                        ) : (
                          <span className="text-amber-600 font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            Local Storage
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              const shelterMatch = shelters.find(s => s.id === item.shelterId) || selectedShelter;
                              if (shelterMatch) handleCallOfficer(shelterMatch);
                            }}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-mono font-medium flex items-center gap-1 cursor-pointer"
                            title="Call shelter in-charge"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCheckin(item.id)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-mono font-medium flex items-center gap-1 cursor-pointer"
                            title="Remove registration"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Universal Officer Call & Dispatch Modal */}
      <OfficerCallModal
        isOpen={isOfficerModalOpen}
        officer={officerModalData}
        onClose={() => setIsOfficerModalOpen(false)}
      />

      {/* Universal Evacuation Check-In Modal */}
      <EvacuationCheckinModal
        isOpen={isCheckinModalOpen}
        shelters={shelters}
        selectedShelter={shelterForCheckin}
        onClose={() => setIsCheckinModalOpen(false)}
        onCheckinSuccess={handleCheckinSuccess}
      />
    </div>
  );
};

