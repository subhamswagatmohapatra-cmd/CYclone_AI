import React, { useState } from 'react';
import { 
  UserCheck, 
  CheckCircle2, 
  Users, 
  Phone, 
  MapPin, 
  HeartPulse, 
  Printer, 
  ShieldCheck, 
  Download, 
  Building2,
  AlertCircle
} from 'lucide-react';
import { CycloneShelter, ShelterCheckin } from '../../types';
import { saveCheckin, isDeviceOnline } from '../../utils/offlineStorage';
import { auth } from '../../lib/firebase';
import { playSuccessChime } from '../../utils/audio';

interface EvacuationCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  shelters: CycloneShelter[];
  selectedShelter?: CycloneShelter | null;
  onCheckinSuccess: (checkin: ShelterCheckin) => void;
}

export const EvacuationCheckinModal: React.FC<EvacuationCheckinModalProps> = ({
  isOpen,
  onClose,
  shelters,
  selectedShelter,
  onCheckinSuccess
}) => {
  const [shelterId, setShelterId] = useState<string>(selectedShelter?.id || shelters[0]?.id || '');
  const [name, setName] = useState<string>(auth.currentUser?.displayName || '');
  const [phone, setPhone] = useState<string>('');
  const [familyCount, setFamilyCount] = useState<number>(1);
  const [specialNeeds, setSpecialNeeds] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [completedRecord, setCompletedRecord] = useState<ShelterCheckin | null>(null);

  // Sync selectedShelter prop when modal opens
  React.useEffect(() => {
    if (selectedShelter) {
      setShelterId(selectedShelter.id);
    } else if (shelters.length > 0 && !shelterId) {
      setShelterId(shelters[0].id);
    }
  }, [selectedShelter, shelters]);

  if (!isOpen) return null;

  const currentShelter = shelters.find(s => s.id === shelterId) || selectedShelter || shelters[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !currentShelter) return;

    setIsSubmitting(true);
    const generatedId = `ODSMA-EVAC-${Math.floor(100000 + Math.random() * 900000)}`;

    const newCheckin: ShelterCheckin = {
      id: generatedId,
      shelterId: currentShelter.id,
      shelterName: currentShelter.name,
      userId: auth.currentUser?.uid || 'offline-evacuee',
      userName: name.trim(),
      userEmail: auth.currentUser?.email || `${name.toLowerCase().replace(/\s+/g, '')}@offline.evacuee`,
      familyMembersCount: Math.max(1, Number(familyCount) || 1),
      contactNumber: phone.trim(),
      specialNeeds: specialNeeds.trim() || 'None',
      timestamp: new Date().toISOString(),
      synced: isDeviceOnline() && Boolean(auth.currentUser)
    };

    try {
      await saveCheckin(newCheckin);
      playSuccessChime();
      setCompletedRecord(newCheckin);
      onCheckinSuccess(newCheckin);
    } catch (err) {
      console.error('Checkin failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintPass = () => {
    if (!completedRecord || !currentShelter) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Evacuation Pass - ${completedRecord.id}</title>
        <style>
          body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 40px; color: #0f172a; max-width: 600px; margin: 0 auto; }
          .badge { display: inline-block; padding: 4px 10px; background: #0284c7; color: #fff; font-size: 11px; font-weight: bold; border-radius: 6px; }
          .pass-box { border: 2px solid #0284c7; border-radius: 12px; padding: 24px; margin-top: 16px; }
          h1 { margin: 0 0 8px 0; color: #0369a1; font-size: 22px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 6px; }
          .label { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; }
          .val { font-size: 14px; font-weight: 700; color: #0f172a; }
          .qr { width: 100px; height: 100px; border: 2px dashed #0284c7; margin: 16px auto; display: flex; align-items: center; justify-content: center; font-family: monospace; font-size: 11px; text-align: center; }
          .footer { font-size: 11px; color: #64748b; text-align: center; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="pass-box">
          <span class="badge">OFFICIAL EVACUATION PASS</span>
          <h1>${currentShelter.name}</h1>
          <p style="font-size: 12px; color: #64748b; margin-top: 0;">District: <strong>${currentShelter.district}</strong> | Authority: <strong>ODSMA / State EOC</strong></p>
          
          <div class="row">
            <span class="label">Pass Verification ID</span>
            <span class="val" style="font-family: monospace; color: #0284c7;">${completedRecord.id}</span>
          </div>
          <div class="row">
            <span class="label">Primary Evacuee / Head</span>
            <span class="val">${completedRecord.userName}</span>
          </div>
          <div class="row">
            <span class="label">Registered Family Count</span>
            <span class="val">${completedRecord.familyMembersCount} Member(s)</span>
          </div>
          <div class="row">
            <span class="label">Emergency Contact</span>
            <span class="val">${completedRecord.contactNumber}</span>
          </div>
          <div class="row">
            <span class="label">Medical / Special Needs</span>
            <span class="val">${completedRecord.specialNeeds || 'None'}</span>
          </div>
          <div class="row">
            <span class="label">Registered At</span>
            <span class="val">${new Date(completedRecord.timestamp).toLocaleString()}</span>
          </div>

          <div class="qr">
            [ VERIFIED<br/>ODSMA-PASS ]
          </div>

          <div class="footer">
            Present this pass to the Shelter In-Charge officer (${currentShelter.inChargeName} • ${currentShelter.inChargePhone}) for priority bedding, food distribution, and medical triage.
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleReset = () => {
    setCompletedRecord(null);
    setName(auth.currentUser?.displayName || '');
    setPhone('');
    setFamilyCount(1);
    setSpecialNeeds('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-900 via-sky-900 to-slate-900 text-white p-5 flex items-center justify-between border-b border-sky-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-['Space_Grotesk'] text-lg font-bold text-white">
                  Shelter Evacuee Check-In
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/40 font-bold">
                  OFFLINE RESILIENT
                </span>
              </div>
              <p className="text-[11px] text-cyan-200/80 font-mono">
                Immediate offline storage • Automatic State EOC synchronization
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Success Pass View */}
        {completedRecord ? (
          <div className="p-6 space-y-5 text-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-mono text-[11px] font-bold border border-emerald-200">
                CHECK-IN CONFIRMED & LOGGED
              </span>
              <h4 className="font-['Space_Grotesk'] text-2xl font-bold text-slate-900 mt-2">
                Registration Successful!
              </h4>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                Head of family <strong>{completedRecord.userName}</strong> and <strong>{completedRecord.familyMembersCount}</strong> member(s) have been checked in.
              </p>
            </div>

            {/* Official Pass Card */}
            <div className="p-4 bg-slate-50 border-2 border-sky-200 rounded-2xl text-left space-y-2.5 font-mono text-xs shadow-inner">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-bold">PASS TOKEN ID</span>
                <span className="text-sky-700 font-black text-sm">{completedRecord.id}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Target Shelter:</span>
                <span className="font-bold text-slate-800">{completedRecord.shelterName}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Contact Number:</span>
                <span className="font-bold text-slate-800">{completedRecord.contactNumber}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Registered Members:</span>
                <span className="font-bold text-slate-800">{completedRecord.familyMembersCount} Person(s)</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Special Needs:</span>
                <span className="font-bold text-amber-700">{completedRecord.specialNeeds || 'None'}</span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[11px]">
                <span className="text-slate-500">Sync Status:</span>
                <span className={isDeviceOnline() ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                  {isDeviceOnline() ? '🟢 Synced to Cloud' : '🟡 Stored in Offline Local Storage'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handlePrintPass}
                className="flex-1 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-['Space_Grotesk'] font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save Pass</span>
              </button>
              <button
                onClick={handleReset}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold transition-all cursor-pointer"
              >
                New Check-In
              </button>
            </div>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Shelter Selection Dropdown */}
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1">
                Target Cyclone Shelter Location
              </label>
              <div className="relative">
                <select
                  value={shelterId}
                  onChange={(e) => setShelterId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none"
                >
                  {shelters.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.district}) — {s.capacity - s.currentOccupancy} space left
                    </option>
                  ))}
                </select>
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* In-Charge Officer Notice */}
            {currentShelter && (
              <div className="p-3 bg-sky-50/80 rounded-xl border border-sky-200 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] font-mono text-sky-700 uppercase font-bold">Shelter In-Charge Officer</div>
                  <div className="font-bold text-slate-900">{currentShelter.inChargeName}</div>
                  <div className="text-slate-600 font-mono text-[11px]">{currentShelter.inChargePhone}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-slate-500">Live Space</div>
                  <div className="font-bold text-emerald-700 text-sm font-mono">
                    {currentShelter.capacity - currentShelter.currentOccupancy} / {currentShelter.capacity}
                  </div>
                </div>
              </div>
            )}

            {/* Evacuee Details */}
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1">
                Primary Contact / Head of Family <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Full Name (e.g. Ramesh Chandra Behera)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="+91 94370 12345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1">
                  Family Members Count <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={familyCount}
                    onChange={(e) => setFamilyCount(Math.max(1, Number(e.target.value)))}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                  <Users className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Special Needs & Triage */}
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
                <span>Special Medical / Mobility Needs (Optional)</span>
                <span className="text-[10px] text-slate-400 font-normal">Triage prioritization</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Elderly mobility assistance, insulin, pregnant, infant formula"
                  value={specialNeeds}
                  onChange={(e) => setSpecialNeeds(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <HeartPulse className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Submit Bar */}
            <div className="pt-3 flex items-center justify-between border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Zero-Net Offline Capable</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-[12px] font-mono text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-['Space_Grotesk'] font-bold text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{isSubmitting ? 'Registering...' : 'Confirm Evacuee Check-In'}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
