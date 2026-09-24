import { CycloneShelter, ShelterCheckin, EmergencyContact, FamilySafetyStatus } from '../types';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, doc, setDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';

const STORAGE_KEYS = {
  SHELTERS: 'cyclone_ai_shelters_cache_v1',
  CHECKINS: 'cyclone_ai_checkins_cache_v1',
  CUSTOM_CONTACTS: 'cyclone_ai_custom_contacts_v2',
  LAST_SYNC: 'cyclone_ai_last_sync_timestamp'
};

export const INITIAL_FAMILY_CONTACTS: EmergencyContact[] = [
  {
    id: 'fam-puri-01',
    name: 'Maa & Papa (Puri Sea Beach Home)',
    category: 'Personal Family',
    number: '+91 94371 88421',
    alternateNumber: '+91 94370 12845',
    description: 'Elderly parents at Sea Beach Ward 3. Evacuation priority high.',
    relationship: 'Parent / Elders',
    district: 'Puri',
    location: 'Pentakota Fishermen Colony, Puri',
    assignedShelter: 'Pentakota Multipurpose Cyclone Shelter',
    available24x7: true,
    priority: 'critical',
    safetyStatus: 'safe',
    statusUpdatedAt: new Date().toISOString(),
    isCustom: true,
    synced: true
  },
  {
    id: 'fam-bala-02',
    name: 'Rohan Dash (Brother)',
    category: 'Personal Family',
    number: '+91 98610 54321',
    alternateNumber: '+91 6782 262000',
    description: 'Brother at Balasore Coastal Area. Has emergency utility vehicle.',
    relationship: 'Sibling',
    district: 'Balasore',
    location: 'Chandipur Coastal Village, Balasore',
    assignedShelter: 'Chandipur Integrated Missile Range Coastal Shelter',
    available24x7: true,
    priority: 'high',
    safetyStatus: 'safe',
    statusUpdatedAt: new Date().toISOString(),
    isCustom: true,
    synced: true
  },
  {
    id: 'fam-vol-03',
    name: 'Dr. Swagat Mohapatra (Family Physician / Red Cross)',
    category: 'Personal Family',
    number: '+91 94380 99120',
    alternateNumber: '+91 674 253 4177',
    description: 'Community physician and disaster first-aid volunteer.',
    relationship: 'Family Doctor',
    district: 'Puri',
    location: 'District Headquarter Hospital, Puri',
    assignedShelter: 'Brahmagiri Coastal Shelter (MPCS)',
    available24x7: true,
    priority: 'high',
    safetyStatus: 'safe',
    statusUpdatedAt: new Date().toISOString(),
    isCustom: true,
    synced: true
  }
];

// Check if browser is online
export const isDeviceOnline = (): boolean => {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
};

// Local cache methods
export const getCachedShelters = (fallback: CycloneShelter[]): CycloneShelter[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SHELTERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to read shelters from localStorage', e);
  }
  return fallback;
};

export const saveSheltersToCache = (shelters: CycloneShelter[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SHELTERS, JSON.stringify(shelters));
  } catch (e) {
    console.warn('Failed to save shelters to localStorage', e);
  }
};

export const getCachedCheckins = (): ShelterCheckin[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHECKINS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to read check-ins from localStorage', e);
  }
  return [];
};

export const saveCheckin = async (checkin: ShelterCheckin): Promise<{ success: boolean; synced: boolean; id: string }> => {
  const existing = getCachedCheckins();
  const validId = checkin.id && /^[a-zA-Z0-9_\-]+$/.test(checkin.id)
    ? checkin.id
    : `chk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  const updatedCheckin: ShelterCheckin = {
    ...checkin,
    id: validId,
    timestamp: checkin.timestamp || new Date().toISOString(),
    synced: false
  };
  
  // 1. Save to local cache first (guaranteed offline availability on any device)
  const newList = [updatedCheckin, ...existing.filter(c => c.id !== validId)];
  try {
    localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(newList));
  } catch (e) {
    console.warn('Local cache write error', e);
  }

  // 2. If online and authenticated, sync to Firestore
  if (isDeviceOnline() && auth.currentUser) {
    try {
      const checkinDocRef = doc(db, 'shelter_checkins', validId);
      const firestorePayload = {
        id: validId,
        shelterId: String(updatedCheckin.shelterId || 'default-shelter').substring(0, 64),
        shelterName: String(updatedCheckin.shelterName || 'Multi-Purpose Shelter').substring(0, 128),
        evacueeName: String(updatedCheckin.userName || 'Evacuee').substring(0, 128),
        contactPhone: String(updatedCheckin.contactNumber || '').substring(0, 32),
        familyMembersCount: Math.min(Math.max(Number(updatedCheckin.familyMembersCount) || 1, 1), 50),
        specialNeeds: String(updatedCheckin.specialNeeds || 'None').substring(0, 256),
        checkedInAt: updatedCheckin.timestamp,
        createdAt: new Date().toISOString(),
        userId: auth.currentUser.uid
      };

      await setDoc(checkinDocRef, firestorePayload);

      // Mark as synced locally
      const markedList = newList.map(c => c.id === validId ? { ...c, synced: true } : c);
      localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(markedList));
      return { success: true, synced: true, id: validId };
    } catch (e) {
      console.warn('Firestore sync fallback (saved offline):', e);
      return { success: true, synced: false, id: validId };
    }
  }

  return { success: true, synced: false, id: validId };
};

export const deleteCheckin = async (checkinId: string): Promise<boolean> => {
  const existing = getCachedCheckins();
  const filtered = existing.filter(c => c.id !== checkinId);
  try {
    localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(filtered));
  } catch (e) {
    console.warn('Failed to delete checkin from local cache', e);
  }

  if (isDeviceOnline() && auth.currentUser) {
    try {
      const checkinDocRef = doc(db, 'shelter_checkins', checkinId);
      await deleteDoc(checkinDocRef);
    } catch (e) {
      console.warn('Firestore checkin delete failed:', e);
    }
  }
  return true;
};

export const saveEvacueeCheckin = saveCheckin;

export const syncPendingCheckinsToFirestore = async (): Promise<number> => {
  if (!isDeviceOnline() || !auth.currentUser) return 0;
  const list = getCachedCheckins();
  const unsynced = list.filter(c => !c.synced);
  if (unsynced.length === 0) return 0;

  let syncedCount = 0;

  for (const item of unsynced) {
    try {
      const validId = item.id && /^[a-zA-Z0-9_\-]+$/.test(item.id)
        ? item.id
        : `chk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

      const checkinDocRef = doc(db, 'shelter_checkins', validId);
      await setDoc(checkinDocRef, {
        id: validId,
        shelterId: String(item.shelterId || 'default-shelter').substring(0, 64),
        shelterName: String(item.shelterName || 'Multi-Purpose Shelter').substring(0, 128),
        evacueeName: String(item.userName || 'Evacuee').substring(0, 128),
        contactPhone: String(item.contactNumber || '').substring(0, 32),
        familyMembersCount: Math.min(Math.max(Number(item.familyMembersCount) || 1, 1), 50),
        specialNeeds: String(item.specialNeeds || 'None').substring(0, 256),
        checkedInAt: item.timestamp || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        userId: auth.currentUser.uid
      });
      item.synced = true;
      item.id = validId;
      syncedCount++;
    } catch (e) {
      console.warn('Failed to sync item', item.id, e);
    }
  }

  localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(list));
  return syncedCount;
};


export const getCustomContacts = (): EmergencyContact[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_CONTACTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to read custom contacts from localStorage', e);
  }
  // Store and return initial presets so the user immediately has family contacts ready
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_CONTACTS, JSON.stringify(INITIAL_FAMILY_CONTACTS));
  } catch (e) {
    console.warn('Failed to cache initial family contacts', e);
  }
  return INITIAL_FAMILY_CONTACTS;
};

export const saveCustomContact = async (contact: EmergencyContact): Promise<boolean> => {
  try {
    const existing = getCustomContacts();
    // Normalize clean ID
    const validId = contact.id && /^[a-zA-Z0-9_\-]+$/.test(contact.id)
      ? contact.id
      : `cnt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const normalizedContact: EmergencyContact = {
      ...contact,
      id: validId,
      isCustom: true,
      category: 'Personal Family',
      statusUpdatedAt: new Date().toISOString(),
      synced: isDeviceOnline() && Boolean(auth.currentUser)
    };

    const updated = [normalizedContact, ...existing.filter(c => c.id !== validId)];
    localStorage.setItem(STORAGE_KEYS.CUSTOM_CONTACTS, JSON.stringify(updated));

    if (isDeviceOnline() && auth.currentUser) {
      try {
        const contactDocRef = doc(db, 'emergency_contacts', validId);
        await setDoc(contactDocRef, {
          id: validId,
          name: normalizedContact.name,
          category: 'Personal Family',
          number: normalizedContact.number,
          alternateNumber: normalizedContact.alternateNumber || '',
          description: normalizedContact.description || '',
          available24x7: true,
          priority: normalizedContact.priority || 'high',
          isCustom: true,
          relationship: normalizedContact.relationship || 'Family Member',
          location: normalizedContact.location || 'Coastal District',
          district: normalizedContact.district || 'Puri',
          assignedShelter: normalizedContact.assignedShelter || '',
          safetyStatus: normalizedContact.safetyStatus || 'safe',
          statusUpdatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          userId: auth.currentUser.uid
        });
      } catch (e) {
        console.warn('Firestore contact save fallback to local offline storage', e);
      }
    }
    return true;
  } catch (err) {
    console.error('saveCustomContact error:', err);
    return false;
  }
};

export const updateContactSafetyStatus = async (
  contactId: string, 
  newStatus: FamilySafetyStatus
): Promise<EmergencyContact[]> => {
  const existing = getCustomContacts();
  const updated = existing.map(c => {
    if (c.id === contactId) {
      return {
        ...c,
        safetyStatus: newStatus,
        statusUpdatedAt: new Date().toISOString()
      };
    }
    return c;
  });

  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_CONTACTS, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save status update locally', e);
  }

  if (isDeviceOnline() && auth.currentUser) {
    try {
      const contactDocRef = doc(db, 'emergency_contacts', contactId);
      await setDoc(contactDocRef, {
        safetyStatus: newStatus,
        statusUpdatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn('Remote safety status sync failed:', e);
    }
  }

  return updated;
};

export const deleteCustomContact = async (contactId: string): Promise<boolean> => {
  const existing = getCustomContacts();
  const filtered = existing.filter(c => c.id !== contactId);
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_CONTACTS, JSON.stringify(filtered));
  } catch (e) {
    console.warn('Failed to delete contact from cache', e);
  }

  if (isDeviceOnline() && auth.currentUser) {
    try {
      const contactDocRef = doc(db, 'emergency_contacts', contactId);
      await deleteDoc(contactDocRef);
    } catch (e) {
      console.warn('Firestore contact delete failed:', e);
    }
  }
  return true;
};
