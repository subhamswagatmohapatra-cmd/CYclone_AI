import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  PhoneCall, 
  ShieldAlert, 
  Radio, 
  Users, 
  Search, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  MessageSquare, 
  Printer, 
  Share2, 
  AlertCircle, 
  LifeBuoy, 
  RadioTower, 
  Building,
  HeartHandshake,
  MapPin,
  ShieldCheck,
  Edit2,
  Navigation,
  Send,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Filter
} from 'lucide-react';
import { EmergencyContact, StormProfile, FamilySafetyStatus } from '../types';
import { INITIAL_EMERGENCY_CONTACTS, INITIAL_SHELTERS } from '../data/sheltersAndContacts';
import { 
  getCustomContacts, 
  saveCustomContact, 
  updateContactSafetyStatus,
  deleteCustomContact, 
  isDeviceOnline 
} from '../utils/offlineStorage';
import { auth } from '../lib/firebase';
import { OfficerCallModal, OfficerDetails } from './Modals/OfficerCallModal';
import { playSuccessChime } from '../utils/audio';

interface EmergencyContactsViewProps {
  activeStorm: StormProfile;
}

const RELATIONSHIP_OPTIONS = [
  'Parent / Elders',
  'Spouse / Partner',
  'Children',
  'Sibling',
  'Extended Family',
  'Trusted Neighbor',
  'Ward Volunteer / Sarpanch',
  'Family Doctor',
  'Community Relief Lead'
];

const COASTAL_DISTRICTS = [
  'All Districts',
  'Puri',
  'Ganjam',
  'Jagatsinghpur',
  'Kendrapara',
  'Balasore',
  'Bhadrak',
  'Srikakulam',
  'East Midnapore',
  'Khordha / Bhubaneswar'
];

export const EmergencyContactsView: React.FC<EmergencyContactsViewProps> = ({ activeStorm }) => {
  const [contacts] = useState<EmergencyContact[]>(INITIAL_EMERGENCY_CONTACTS);
  const [customContacts, setCustomContacts] = useState<EmergencyContact[]>(() => getCustomContacts());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All Districts');
  const [isCallModalOpen, setIsCallModalOpen] = useState<boolean>(false);
  const [activeOfficerModalData, setActiveOfficerModalData] = useState<OfficerDetails | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add / Edit contact modal state
  const [showContactModal, setShowContactModal] = useState<boolean>(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formNumber, setFormNumber] = useState('');
  const [formAltNumber, setFormAltNumber] = useState('');
  const [formRelationship, setFormRelationship] = useState(RELATIONSHIP_OPTIONS[0]);
  const [formDistrict, setFormDistrict] = useState('Puri');
  const [formLocation, setFormLocation] = useState('');
  const [formAssignedShelter, setFormAssignedShelter] = useState(INITIAL_SHELTERS[0]?.name || '');
  const [formSafetyStatus, setFormSafetyStatus] = useState<FamilySafetyStatus>('safe');
  const [formPriority, setFormPriority] = useState<'critical' | 'high' | 'standard'>('high');
  const [formNotes, setFormNotes] = useState('');

  // Mass Broadcast Modal state
  const [showBroadcastModal, setShowBroadcastModal] = useState<boolean>(false);
  const [broadcastCopied, setBroadcastCopied] = useState<boolean>(false);

  // SOS SMS Generator state
  const [showSosModal, setShowSosModal] = useState<boolean>(false);
  const [sosLocation, setSosLocation] = useState<string>('Puri Coastal Belt');
  const [sosPeopleCount, setSosPeopleCount] = useState<number>(4);
  const [sosCondition, setSosCondition] = useState<string>('Flooding / High Winds');
  const [sosGpsCoords, setSosGpsCoords] = useState<string>('');
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);

  const categories = [
    'All',
    'Personal Family',
    'National Command',
    'State EOC',
    'District EOC',
    'First Responders',
    'Radio & Marine'
  ];

  // Refresh custom contacts from storage on mount
  useEffect(() => {
    setCustomContacts(getCustomContacts());
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopyNumber = (id: string, num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedId(id);
    playSuccessChime();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenAddModal = () => {
    setEditingContactId(null);
    setFormName('');
    setFormNumber('');
    setFormAltNumber('');
    setFormRelationship(RELATIONSHIP_OPTIONS[0]);
    setFormDistrict('Puri');
    setFormLocation('');
    setFormAssignedShelter(INITIAL_SHELTERS[0]?.name || '');
    setFormSafetyStatus('safe');
    setFormPriority('high');
    setFormNotes('');
    setShowContactModal(true);
  };

  const handleOpenEditModal = (contact: EmergencyContact) => {
    setEditingContactId(contact.id);
    setFormName(contact.name);
    setFormNumber(contact.number);
    setFormAltNumber(contact.alternateNumber || '');
    setFormRelationship(contact.relationship || RELATIONSHIP_OPTIONS[0]);
    setFormDistrict(contact.district || 'Puri');
    setFormLocation(contact.location || '');
    setFormAssignedShelter(contact.assignedShelter || INITIAL_SHELTERS[0]?.name || '');
    setFormSafetyStatus(contact.safetyStatus || 'safe');
    setFormPriority(contact.priority || 'high');
    setFormNotes(contact.description || '');
    setShowContactModal(true);
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = formName.trim();
    const trimmedNumber = formNumber.trim();

    if (!trimmedName || !trimmedNumber) {
      alert('Please provide both the contact name and primary phone number.');
      return;
    }

    const contactToSave: EmergencyContact = {
      id: editingContactId || `fam-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: trimmedName,
      number: trimmedNumber,
      alternateNumber: formAltNumber.trim() || undefined,
      category: 'Personal Family',
      relationship: formRelationship,
      district: formDistrict,
      location: formLocation.trim() || undefined,
      assignedShelter: formAssignedShelter.trim() || undefined,
      safetyStatus: formSafetyStatus,
      priority: formPriority,
      description: formNotes.trim() || `${formRelationship} residing in ${formDistrict}. Cyclone emergency contact.`,
      available24x7: true,
      isCustom: true,
      statusUpdatedAt: new Date().toISOString(),
      userId: auth.currentUser?.uid
    };

    await saveCustomContact(contactToSave);
    const updatedList = getCustomContacts();
    setCustomContacts(updatedList);

    setShowContactModal(false);
    playSuccessChime();
    setActiveCategory('Personal Family'); // Switch automatically so user sees it right away!
    setSearchQuery('');

    showToast(
      editingContactId 
        ? `✅ Updated contact for ${contactToSave.name}` 
        : `✅ Added ${contactToSave.name} to Family Emergency Directory`
    );
  };

  const handleDeleteContact = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from your emergency directory?`)) {
      return;
    }
    await deleteCustomContact(id);
    const updatedList = getCustomContacts();
    setCustomContacts(updatedList);
    showToast(`Removed ${name} from directory.`);
  };

  const handleUpdateStatus = async (contactId: string, status: FamilySafetyStatus) => {
    const updated = await updateContactSafetyStatus(contactId, status);
    setCustomContacts(updated);
    playSuccessChime();
    showToast(`Family status updated: ${status.toUpperCase()}`);
  };

  // Mass broadcast message generator
  const generateBroadcastMessage = () => {
    const shelterList = customContacts
      .filter(c => c.assignedShelter)
      .map(c => `• ${c.name} (${c.relationship}): ${c.assignedShelter}`)
      .join('\n');

    return `🚨 CYCLONE ${activeStorm.name.toUpperCase()} EMERGENCY FAMILY ADVISORY 🚨
Status: ${activeStorm.category} (${activeStorm.saffirCategory})
Peak Winds: ${activeStorm.maxWindsKmh} km/h | Landfall Window: ${activeStorm.landfallWindow}
Target Belt: ${activeStorm.landfallLocation}

DEAR FAMILY:
All coastal families are advised to move to reinforced concrete shelters immediately. Power grid shut-off is expected shortly.

Designated Family Safe Shelters:
${shelterList || '• Multi-Purpose Cyclone Shelter Pentakota / Brahmagiri'}

State 24x7 Disaster Helpline: 1070 | Police/Medical SOS: 112 | Coast Guard: 1554.
Please reply confirming you are safe!`;
  };

  const handleFetchGps = () => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      setGpsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = `${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°E (Acc: ±${Math.round(pos.coords.accuracy)}m)`;
          setSosGpsCoords(coords);
          setSosLocation(prev => prev.includes('GPS') ? prev : `${prev} [GPS: ${coords}]`);
          setGpsLoading(false);
          playSuccessChime();
        },
        (err) => {
          console.warn('Geolocation failed', err);
          setGpsLoading(false);
          alert('Could not auto-fetch GPS coordinates. Please type your landmark manually.');
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const generateSosMessage = () => {
    const gpsPart = sosGpsCoords ? ` Exact GPS: ${sosGpsCoords}.` : '';
    return `[EMERGENCY SOS - CYCLONE ${activeStorm.name.toUpperCase()}] Immediate rescue needed! Location: ${sosLocation}.${gpsPart} Persons trapped: ${sosPeopleCount}. Condition: ${sosCondition}. Please dispatch NDRF/ODRAF rescue unit immediately.`;
  };

  // All combined contacts
  const allCombinedContacts = [...customContacts, ...contacts];

  // Filtered contacts based on search, category, and district
  const filteredContacts = allCombinedContacts.filter((c) => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.relationship && c.relationship.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.assignedShelter && c.assignedShelter.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.location && c.location.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = activeCategory === 'All' || c.category === activeCategory;

    const matchesDistrict = 
      selectedDistrict === 'All Districts' || 
      c.category === 'National Command' || // Always show National Command helplines
      (c.district && c.district.toLowerCase().includes(selectedDistrict.toLowerCase())) ||
      c.name.toLowerCase().includes(selectedDistrict.toLowerCase()) ||
      c.description.toLowerCase().includes(selectedDistrict.toLowerCase());

    return matchesSearch && matchesCategory && matchesDistrict;
  });

  // Family status counts
  const familyCount = customContacts.length;
  const safeCount = customContacts.filter(c => c.safetyStatus === 'safe').length;
  const evacuatingCount = customContacts.filter(c => c.safetyStatus === 'evacuating').length;
  const needsHelpCount = customContacts.filter(c => c.safetyStatus === 'needs_help').length;

  const handlePrintDirectory = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>CycloneAI - Emergency Pocket Run-Sheet</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; color: #0f172a; }
          h1 { color: #dc2626; margin: 0 0 4px 0; font-size: 20px; }
          .sub { color: #64748b; font-size: 12px; margin-bottom: 16px; }
          .section-title { background: #0f172a; color: white; padding: 6px 10px; font-size: 13px; font-weight: bold; margin-top: 16px; border-radius: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 11px; }
          th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
          th { background: #f1f5f9; }
          .phone { font-family: monospace; font-weight: bold; color: #dc2626; font-size: 12px; }
          .safe { color: #16a34a; font-weight: bold; }
          .warn { color: #ea580c; font-weight: bold; }
          .danger { color: #dc2626; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>CYCLONE ${activeStorm.name.toUpperCase()} EMERGENCY WALLET RUN-SHEET</h1>
        <div class="sub">Generated on ${new Date().toLocaleString()} • 100% Offline Reference for Disaster Response</div>

        <div class="section-title">1. PERSONAL FAMILY & KIN WELFARE DIRECTORY</div>
        <table>
          <thead>
            <tr>
              <th>Contact Name</th>
              <th>Relationship</th>
              <th>District & Address</th>
              <th>Assigned Shelter</th>
              <th>Phone / WhatsApp</th>
              <th>Safety Status</th>
            </tr>
          </thead>
          <tbody>
            ${customContacts.map(c => `
              <tr>
                <td><strong>${c.name}</strong></td>
                <td>${c.relationship || 'Family Member'}</td>
                <td>${c.location || c.district || 'Coastal Ward'}</td>
                <td><strong>${c.assignedShelter || 'Designated Shelter'}</strong></td>
                <td><span class="phone">${c.number}</span>${c.alternateNumber ? '<br/>Alt: ' + c.alternateNumber : ''}</td>
                <td><span class="${c.safetyStatus === 'safe' ? 'safe' : c.safetyStatus === 'needs_help' ? 'danger' : 'warn'}">${(c.safetyStatus || 'UNKNOWN').toUpperCase()}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="section-title">2. 24x7 GOVERNMENT & RESCUE DISPATCH HELPLINES</div>
        <table>
          <thead>
            <tr>
              <th>Agency / Service</th>
              <th>Category</th>
              <th>Helpline Number</th>
              <th>Alternate Phone</th>
              <th>Operational Function</th>
            </tr>
          </thead>
          <tbody>
            ${INITIAL_EMERGENCY_CONTACTS.map(c => `
              <tr>
                <td><strong>${c.name}</strong></td>
                <td>${c.category}</td>
                <td><span class="phone">${c.number}</span></td>
                <td>${c.alternateNumber || '-'}</td>
                <td>${c.description}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="section-title">3. RADIO FREQUENCIES (DURING TELECOM TOWER BLACKOUT)</div>
        <table>
          <thead>
            <tr>
              <th>Channel Name</th>
              <th>Frequency / Mode</th>
              <th>Protocol & Liaison</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>VHF Marine Channel 16</strong></td>
              <td>156.800 MHz FM</td>
              <td>International distress, calling & Indian Coast Guard maritime hailing.</td>
            </tr>
            <tr>
              <td><strong>Disaster HAM Net (40m)</strong></td>
              <td>7.050 MHz / 7.100 MHz LSB</td>
              <td>State disaster amateur radio repeater coordination.</td>
            </tr>
            <tr>
              <td><strong>National Command HAM (20m)</strong></td>
              <td>14.150 MHz USB</td>
              <td>Inter-state emergency liaison with NDMA New Delhi HQ.</td>
            </tr>
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
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-sky-500/50 flex items-center gap-3 animate-slide-up">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-mono font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.3)]">
            <PhoneCall className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-['Space_Grotesk'] text-xl font-bold text-slate-900">
                Disaster Emergency Helplines & Family Safety Directory
              </h1>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                100% Offline Ready
              </span>
            </div>
            <p className="text-[12px] text-slate-500 font-mono mt-0.5">
              Unified National Command (112) • State EOC (1070) • Coast Guard (1554) • Personal Next-of-Kin Tracking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Add Family Contact Button (Prominent) */}
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-['Space_Grotesk'] font-bold text-[13px] shadow-[0_0_12px_rgba(2,132,199,0.35)] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Family Contact</span>
          </button>

          {/* Broadcast to Family Button */}
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-['Space_Grotesk'] font-bold text-[12px] transition-all cursor-pointer shadow-xs"
            title="Broadcast emergency advisory to all family contacts"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Family Broadcast</span>
          </button>

          {/* SOS Dispatcher Button */}
          <button
            onClick={() => setShowSosModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 text-[12px] font-bold font-mono transition-colors shadow-xs cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>SOS SMS</span>
          </button>

          {/* Print / Wallet Run-Sheet */}
          <button
            onClick={handlePrintDirectory}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 text-[12px] font-medium font-mono transition-colors cursor-pointer"
            title="Print emergency wallet run-sheet"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Print Card</span>
          </button>
        </div>
      </div>

      {/* Critical First Responder Instant Speed Dial Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-red-50/90 border border-red-200 p-3 rounded-2xl flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="text-[10px] font-mono text-red-600 font-bold uppercase">National Emergency</div>
            <div className="text-xl font-bold font-['Space_Grotesk'] text-red-700">112</div>
            <div className="text-[10px] text-red-600/80 font-mono">Police / Fire / Rescue</div>
          </div>
          <a
            href="tel:112"
            className="mt-2 py-1.5 px-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-mono text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
          >
            <Phone className="w-3 h-3" />
            <span>Call 112</span>
          </a>
        </div>

        <div className="bg-sky-50/90 border border-sky-200 p-3 rounded-2xl flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="text-[10px] font-mono text-sky-700 font-bold uppercase">State EOC Helpline</div>
            <div className="text-xl font-bold font-['Space_Grotesk'] text-sky-800">1070</div>
            <div className="text-[10px] text-sky-600/80 font-mono">Odisha / AP / WB Toll-Free</div>
          </div>
          <a
            href="tel:1070"
            className="mt-2 py-1.5 px-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-mono text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
          >
            <Phone className="w-3 h-3" />
            <span>Call 1070</span>
          </a>
        </div>

        <div className="bg-amber-50/90 border border-amber-200 p-3 rounded-2xl flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="text-[10px] font-mono text-amber-700 font-bold uppercase">District Disaster Desk</div>
            <div className="text-xl font-bold font-['Space_Grotesk'] text-amber-800">1077</div>
            <div className="text-[10px] text-amber-600/80 font-mono">Collectorate Control Room</div>
          </div>
          <a
            href="tel:1077"
            className="mt-2 py-1.5 px-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-mono text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
          >
            <Phone className="w-3 h-3" />
            <span>Call 1077</span>
          </a>
        </div>

        <div className="bg-indigo-50/90 border border-indigo-200 p-3 rounded-2xl flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="text-[10px] font-mono text-indigo-700 font-bold uppercase">NDRF National HQ</div>
            <div className="text-xl font-bold font-['Space_Grotesk'] text-indigo-800">1078</div>
            <div className="text-[10px] text-indigo-600/80 font-mono">Disaster Rescue Dispatch</div>
          </div>
          <a
            href="tel:1078"
            className="mt-2 py-1.5 px-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
          >
            <Phone className="w-3 h-3" />
            <span>Call 1078</span>
          </a>
        </div>

        <div className="bg-emerald-50/90 border border-emerald-200 p-3 rounded-2xl flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="text-[10px] font-mono text-emerald-700 font-bold uppercase">Coast Guard MRCC</div>
            <div className="text-xl font-bold font-['Space_Grotesk'] text-emerald-800">1554</div>
            <div className="text-[10px] text-emerald-600/80 font-mono">Deep-Sea Marine Rescue</div>
          </div>
          <a
            href="tel:1554"
            className="mt-2 py-1.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
          >
            <Phone className="w-3 h-3" />
            <span>Call 1554</span>
          </a>
        </div>

        <div className="bg-rose-50/90 border border-rose-200 p-3 rounded-2xl flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="text-[10px] font-mono text-rose-700 font-bold uppercase">Medical Ambulance</div>
            <div className="text-xl font-bold font-['Space_Grotesk'] text-rose-800">108</div>
            <div className="text-[10px] text-rose-600/80 font-mono">Trauma & Patient Transfer</div>
          </div>
          <a
            href="tel:108"
            className="mt-2 py-1.5 px-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-mono text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
          >
            <Phone className="w-3 h-3" />
            <span>Call 108</span>
          </a>
        </div>
      </div>

      {/* Personal Family Safety Status Command Strip (Visible if any family contacts exist) */}
      <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-indigo-950 p-4 sm:p-5 rounded-2xl border border-sky-800/40 text-white shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-cyan-300">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-['Space_Grotesk'] text-base font-bold text-white">
                  Family Safety & Shelter Tracking Hub
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                  {familyCount} REGISTERED
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-mono">
                Real-time welfare check-ins, shelter allocation, and 1-touch distress dispatch for your loved ones
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              {safeCount} Safe in Shelter
            </span>

            {evacuatingCount > 0 && (
              <span className="px-2.5 py-1 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                {evacuatingCount} Evacuating
              </span>
            )}

            {needsHelpCount > 0 && (
              <span className="px-2.5 py-1 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-mono font-bold flex items-center gap-1.5 animate-bounce">
                <AlertTriangle className="w-3 h-3 text-red-400" />
                {needsHelpCount} Needs Rescue SOS
              </span>
            )}

            <button
              onClick={handleOpenAddModal}
              className="px-3 py-1 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Text Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by contact name, phone, relationship, shelter, or agency..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Coastal District Selector */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 shrink-0">
              <MapPin className="w-3.5 h-3.5 text-sky-600" />
              <span>District:</span>
            </div>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
            >
              {COASTAL_DISTRICTS.map((dist) => (
                <option key={dist} value={dist}>{dist}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
          {categories.map((cat) => {
            const isFamily = cat === 'Personal Family';
            const count = isFamily ? customContacts.length : null;

            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-[12px] font-medium transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  activeCategory === cat 
                    ? 'bg-sky-600 text-white font-bold shadow-xs' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {isFamily && <Users className="w-3.5 h-3.5" />}
                <span>{cat}</span>
                {count !== null && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    activeCategory === cat ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 p-6 space-y-3">
            <Users className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-800">
              No contacts match your filter criteria
            </h3>
            <p className="text-xs text-slate-500 font-mono max-w-md mx-auto">
              Try clearing your search query or switching to another category. You can also add a new family contact.
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDistrict('All Districts');
                  setActiveCategory('All');
                }}
                className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-bold"
              >
                Reset Filters
              </button>
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-mono font-bold"
              >
                Add Family Contact
              </button>
            </div>
          </div>
        ) : (
          filteredContacts.map((contact) => {
            const isCopied = copiedId === contact.id;
            const isMarineRadio = contact.category === 'Radio & Marine';
            const isCustom = contact.isCustom;
            const cleanPhone = (contact.number || '').replace(/[^0-9+]/g, '');

            const welfareMessage = encodeURIComponent(
              `🚨 CYCLONE ${activeStorm.name.toUpperCase()} WELFARE CHECK: Hello ${contact.name}, storm winds are at ${activeStorm.maxWindsKmh} km/h. Please confirm you and family are safe. Are you currently at ${contact.assignedShelter || 'a concrete cyclone shelter'}? Please reply with your status immediately.`
            );

            const sosToFamily = encodeURIComponent(
              `[URGENT SOS] Hello ${contact.name}, I am reporting our emergency status during Cyclone ${activeStorm.name}. Location: ${sosLocation}. Trapped: ${sosPeopleCount}. Condition: ${sosCondition}. Please notify local rescue team!`
            );

            return (
              <div
                key={contact.id}
                className={`p-4 rounded-2xl border transition-all bg-white shadow-xs flex flex-col justify-between space-y-3.5 ${
                  isCustom 
                    ? 'border-sky-300/80 hover:border-sky-400 ring-1 ring-sky-500/10'
                    : contact.priority === 'critical' 
                      ? 'border-red-200/90 hover:border-red-300' 
                      : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        contact.category === 'National Command' ? 'bg-red-100 text-red-800' :
                        contact.category === 'State EOC' ? 'bg-sky-100 text-sky-800' :
                        contact.category === 'District EOC' ? 'bg-indigo-100 text-indigo-800' :
                        contact.category === 'Radio & Marine' ? 'bg-purple-100 text-purple-800' :
                        contact.category === 'Personal Family' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {contact.category.toUpperCase()}
                      </span>

                      {contact.relationship && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-bold border border-sky-200">
                          {contact.relationship}
                        </span>
                      )}

                      {contact.district && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          📍 {contact.district}
                        </span>
                      )}
                    </div>

                    {isCustom && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(contact)}
                          className="text-slate-400 hover:text-sky-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Edit contact"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteContact(contact.id, contact.name)}
                          className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Delete contact"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-900">
                      {contact.name}
                    </h3>

                    {contact.assignedShelter && (
                      <div className="mt-1 flex items-center gap-1 text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        <Building className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate">Shelter: <strong>{contact.assignedShelter}</strong></span>
                      </div>
                    )}

                    {contact.location && (
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{contact.location}</span>
                      </p>
                    )}

                    <p className="text-[12px] text-slate-600 mt-1 line-clamp-2">
                      {contact.description}
                    </p>
                  </div>

                  {/* Safety Status Pill Switcher for Family Contacts */}
                  {isCustom && (
                    <div className="pt-1">
                      <div className="text-[10px] font-mono uppercase text-slate-400 font-bold mb-1">
                        Family Welfare Status:
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <button
                          onClick={() => handleUpdateStatus(contact.id, 'safe')}
                          className={`py-1 px-1.5 rounded-lg text-[10px] font-mono font-bold transition-all text-center cursor-pointer ${
                            contact.safetyStatus === 'safe'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                        >
                          ✓ Safe
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(contact.id, 'evacuating')}
                          className={`py-1 px-1.5 rounded-lg text-[10px] font-mono font-bold transition-all text-center cursor-pointer ${
                            contact.safetyStatus === 'evacuating'
                              ? 'bg-amber-500 text-slate-950 shadow-xs'
                              : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                          }`}
                        >
                          ⚡ Evacuating
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(contact.id, 'needs_help')}
                          className={`py-1 px-1.5 rounded-lg text-[10px] font-mono font-bold transition-all text-center cursor-pointer ${
                            contact.safetyStatus === 'needs_help'
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'bg-red-50 text-red-800 hover:bg-red-100 border border-red-200'
                          }`}
                        >
                          🚨 SOS Need Help
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Number and Actions */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-mono text-base font-bold text-slate-900">
                        {contact.number}
                      </div>
                      {contact.alternateNumber && (
                        <div className="text-[10px] font-mono text-slate-500">
                          Alt: {contact.alternateNumber}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopyNumber(contact.id, contact.number)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                        title="Copy phone number"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      {!isMarineRadio && (
                        <button
                          onClick={() => {
                            setActiveOfficerModalData({
                              name: contact.name,
                              role: `${contact.relationship || contact.category} • ${contact.description || 'Emergency Duty'}`,
                              phone: contact.number,
                              alternatePhone: contact.alternateNumber,
                              badge: isCustom ? 'PERSONAL KIN' : contact.priority === 'critical' ? 'PRIORITY: CRITICAL' : '24x7 ACTIVE'
                            });
                            setIsCallModalOpen(true);
                          }}
                          className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[12px] font-bold transition-all shadow-xs cursor-pointer"
                          title="Call line via web simulator or phone"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quick WhatsApp & SOS message triggers for family contacts */}
                  {isCustom && (
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <a
                        href={`https://wa.me/${cleanPhone}?text=${welfareMessage}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-1.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-mono font-bold flex items-center justify-center gap-1 border border-emerald-200 transition-colors"
                        title="Send WhatsApp Welfare Check"
                      >
                        <MessageSquare className="w-3 h-3 text-emerald-600" />
                        <span>WhatsApp Check</span>
                      </a>

                      <a
                        href={`sms:${cleanPhone}?body=${sosToFamily}`}
                        className="py-1.5 px-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-800 text-[11px] font-mono font-bold flex items-center justify-center gap-1 border border-red-200 transition-colors"
                        title="Send SOS SMS to this contact"
                      >
                        <ShieldAlert className="w-3 h-3 text-red-600" />
                        <span>Send SOS SMS</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Radio & Marine Frequency Protocol Guidance */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <RadioTower className="w-5 h-5 text-purple-600" />
          <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-900">
            Zero-Network Marine & HAM Radio Emergency Frequency Guide
          </h3>
        </div>
        <p className="text-[12px] text-slate-600 leading-relaxed">
          During category 3+ cyclone landfall, land telecommunication towers and fiber backhauls routinely experience grid blackouts. The National Disaster Management guidelines mandate falling back to high-frequency and very-high-frequency coastal radios.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-[12px]">
          <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200 text-purple-950 font-mono">
            <div className="font-bold text-purple-900 mb-0.5">VHF Marine Channel 16</div>
            <div>Freq: 156.800 MHz FM</div>
            <div className="text-[11px] text-purple-700 mt-1">Continuous distress, emergency hailing, and naval bridge-to-bridge link.</div>
          </div>

          <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200 text-purple-950 font-mono">
            <div className="font-bold text-purple-900 mb-0.5">Amateur Radio (HAM) 40m</div>
            <div>Freq: 7.050 MHz / 7.100 MHz LSB</div>
            <div className="text-[11px] text-purple-700 mt-1">Odisha & Andhra coastal disaster ham net repeater frequencies.</div>
          </div>

          <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200 text-purple-950 font-mono">
            <div className="font-bold text-purple-900 mb-0.5">Amateur Radio (HAM) 20m</div>
            <div>Freq: 14.150 MHz USB</div>
            <div className="text-[11px] text-purple-700 mt-1">Inter-state coordination with NDMA New Delhi and Armed Forces liaison.</div>
          </div>
        </div>
      </div>

      {/* Add / Edit Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-900">
                    {editingContactId ? 'Edit Family Contact' : 'Add Family & Emergency Kin Contact'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Stores offline immediately & syncs to cloud disaster directory
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowContactModal(false)} 
                className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1">
                  Full Name / Contact Tag *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maa & Papa / Sunita Dash / Brother Ramesh"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1">
                    Primary Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 94371 88421"
                    value={formNumber}
                    onChange={(e) => setFormNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1">
                    Alternate / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98610 54321"
                    value={formAltNumber}
                    onChange={(e) => setFormAltNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1">
                    Relationship
                  </label>
                  <select
                    value={formRelationship}
                    onChange={(e) => setFormRelationship(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    {RELATIONSHIP_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1">
                    Coastal District
                  </label>
                  <select
                    value={formDistrict}
                    onChange={(e) => setFormDistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    {COASTAL_DISTRICTS.filter(d => d !== 'All Districts').map(dist => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1">
                  Specific Coastal Village / Ward / Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pentakota Fishermen Colony, Sea Beach Road, Puri"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1">
                  Assigned Evacuation Shelter
                </label>
                <div className="space-y-2">
                  <select
                    value={formAssignedShelter}
                    onChange={(e) => setFormAssignedShelter(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    {INITIAL_SHELTERS.map(sh => (
                      <option key={sh.id} value={sh.name}>
                        {sh.name} ({sh.district})
                      </option>
                    ))}
                    <option value="Custom Shelter">Other / Custom Shelter Location</option>
                  </select>
                  {formAssignedShelter === 'Custom Shelter' && (
                    <input
                      type="text"
                      placeholder="Type custom shelter name..."
                      onChange={(e) => setFormAssignedShelter(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1">
                    Current Safety Status
                  </label>
                  <select
                    value={formSafetyStatus}
                    onChange={(e) => setFormSafetyStatus(e.target.value as FamilySafetyStatus)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    <option value="safe">🟢 Safe in Shelter / Concrete Home</option>
                    <option value="evacuating">🟡 Evacuating / Moving to Shelter</option>
                    <option value="needs_help">🔴 Trapped / Needs Rescue SOS</option>
                    <option value="unknown">⚪ Awaiting Status / Checking</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1">
                    Kin Priority Level
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    <option value="critical">Critical (Primary Next-of-Kin / Elders)</option>
                    <option value="high">High (Immediate Family)</option>
                    <option value="standard">Standard (Extended Relative / Neighbor)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1">
                  Emergency Medical / Evacuation Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Has diabetic medications; elderly grandmother requires wheelchair; has tractor"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="px-4 py-2.5 text-xs font-mono font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-['Space_Grotesk'] font-bold text-sm shadow-[0_0_15px_rgba(2,132,199,0.35)] transition-all cursor-pointer"
                >
                  {editingContactId ? 'Save Contact Changes' : 'Save to Family Directory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mass Family Broadcast Advisory Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-900">
                    Cyclone Emergency Family Advisory Broadcast
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Dispatches coordinated storm alerts to all {customContacts.length} family contacts
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowBroadcastModal(false)} 
                className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  This pre-composed advisory formats official IMD storm metrics with each family member's designated shelter location so everyone knows where to assemble.
                </div>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 text-slate-100 font-mono text-xs whitespace-pre-wrap leading-relaxed shadow-inner max-h-60 overflow-y-auto">
                {generateBroadcastMessage()}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(generateBroadcastMessage())}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-['Space_Grotesk'] font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Share via WhatsApp Broadcast</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(generateBroadcastMessage());
                    setBroadcastCopied(true);
                    playSuccessChime();
                    setTimeout(() => setBroadcastCopied(false), 2500);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {broadcastCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{broadcastCopied ? 'Copied Advisory!' : 'Copy Advisory Text'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SOS SMS Generator Modal */}
      {showSosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-red-600">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-900">
                  Pre-Formatted Emergency SOS Distress Dispatcher
                </h3>
              </div>
              <button 
                onClick={() => setShowSosModal(false)} 
                className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-mono font-bold text-slate-700 uppercase">
                    Your Current Landmark / Address
                  </label>
                  <button
                    type="button"
                    onClick={handleFetchGps}
                    disabled={gpsLoading}
                    className="text-[11px] font-mono text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Navigation className={`w-3 h-3 ${gpsLoading ? 'animate-spin' : ''}`} />
                    <span>{gpsLoading ? 'Acquiring GPS...' : 'Auto-Fetch GPS Coordinates'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={sosLocation}
                  onChange={(e) => setSosLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1">
                    Persons Count Trapped
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={sosPeopleCount}
                    onChange={(e) => setSosPeopleCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1">
                    Urgent Hazard / Condition
                  </label>
                  <input
                    type="text"
                    value={sosCondition}
                    onChange={(e) => setSosCondition(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-red-50 rounded-2xl border border-red-200 space-y-1">
                <div className="text-[11px] font-mono font-bold text-red-800 uppercase">
                  Formatted Distress SMS Text:
                </div>
                <div className="text-[12px] text-red-950 font-mono select-all">
                  {generateSosMessage()}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <a
                  href={`sms:112?body=${encodeURIComponent(generateSosMessage())}`}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-red-600 text-white font-mono text-[12px] font-bold text-center hover:bg-red-700 transition-colors shadow-xs"
                >
                  Send SMS to 112
                </a>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(generateSosMessage())}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 text-white font-mono text-[12px] font-bold text-center hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  Share to WhatsApp
                </a>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(generateSosMessage());
                    showToast('SOS message copied to clipboard!');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-mono text-[12px] font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Copy Text
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Direct Officer / Family Dispatch Voice Call Modal */}
      <OfficerCallModal
        isOpen={isCallModalOpen}
        officer={activeOfficerModalData}
        onClose={() => setIsCallModalOpen(false)}
      />
    </div>
  );
};
