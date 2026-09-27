import type { Profile, EquipmentListing, StorageListing, ServiceRequest, UserRole } from '../types/database';

const KISAN_USERS_KEY = 'kisan_db_users';
const KISAN_EQUIPMENT_KEY = 'kisan_db_equipment';
const KISAN_STORAGE_KEY = 'kisan_db_storage';
const KISAN_WORKERS_KEY = 'kisan_db_workers';
const KISAN_REQUESTS_KEY = 'kisan_db_requests';
const KISAN_ACTIVE_SESSION_KEY = 'kisan_active_session';

export interface StoredUser {
  id: string;
  email: string;
  password?: string;
  full_name: string;
  role: UserRole;
  phone: string;
  address_line1?: string;
  address_line2?: string;
  place?: string;
  state?: string;
  pincode?: string;
  location?: {
    district: string;
    state: string;
    pincode: string;
  };
  metadata?: Record<string, any>;
  avatar_url?: string | null;
  onboarding_completed?: boolean;
  created_at: string;
}

const DEFAULT_USERS: StoredUser[] = [
  {
    id: 'usr_lender_1',
    email: 'lender@kisan.com',
    password: 'password123',
    full_name: 'Harish Equipment Rentals',
    role: 'tool_lender',
    phone: '+91 9895012345',
    address_line1: 'Agro Machinery Hub, Main Road',
    address_line2: 'Near Krishi Bhavan',
    place: 'Palakkad',
    state: 'Kerala',
    pincode: '678001',
    location: { district: 'Palakkad', state: 'Kerala', pincode: '678001' },
    metadata: { service_radius: 'Within 35 km' },
    onboarding_completed: true,
    created_at: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'usr_worker_1',
    email: 'worker@kisan.com',
    password: 'password123',
    full_name: 'Raju Selvam',
    role: 'job_seeker',
    phone: '+91 9876543211',
    address_line1: 'Farm Colony, Ward 4',
    place: 'Palakkad',
    state: 'Kerala',
    pincode: '678002',
    location: { district: 'Palakkad', state: 'Kerala', pincode: '678002' },
    metadata: {
      skills: ['Paddy Transplantation', 'Harvesting & Cutting', 'Weeding & Hoeing'],
      daily_wage: '700',
      hourly_wage: '100',
      travel_distance: 'Within 15 km',
      shift: 'Full Day (8 AM - 5 PM)',
      tools_owned: ['Sickle', 'Gumboots'],
      status: 'Available Today',
    },
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    onboarding_completed: true,
    created_at: new Date('2026-01-02').toISOString(),
  },
  {
    id: 'usr_storage_1',
    email: 'storage@kisan.com',
    password: 'password123',
    full_name: 'Suresh Cold Stores & Warehousing',
    role: 'storage_owner',
    phone: '+91 9847012345',
    address_line1: 'Industrial Development Area, Sector 2',
    place: 'Palakkad',
    state: 'Kerala',
    pincode: '678003',
    location: { district: 'Palakkad', state: 'Kerala', pincode: '678003' },
    metadata: { total_capacity: '500 Tons' },
    onboarding_completed: true,
    created_at: new Date('2026-01-03').toISOString(),
  },
  {
    id: 'usr_farmer_1',
    email: 'farmer@kisan.com',
    password: 'password123',
    full_name: 'Ramesh Kumar',
    role: 'farmer',
    phone: '+91 9895098765',
    address_line1: 'Green Acres Farm, Village Post',
    place: 'Palakkad',
    state: 'Kerala',
    pincode: '678001',
    location: { district: 'Palakkad', state: 'Kerala', pincode: '678001' },
    onboarding_completed: true,
    created_at: new Date('2026-01-04').toISOString(),
  },
];

const DEFAULT_EQUIPMENT: EquipmentListing[] = [
  {
    id: 'eq_seed_1',
    owner_id: 'usr_lender_1',
    title: 'Mahindra 575 DI Tractor (45 HP)',
    category: 'Tractor & Tillage',
    daily_rate: 2500,
    hourly_rate: 450,
    is_available: true,
    location_address: 'Palakkad, Kerala',
    location_coords: { district: 'Palakkad', state: 'Kerala', pincode: '678001' },
    images: ['https://images.unsplash.com/photo-1564868480822-32f714a0e763?auto=format&fit=crop&w=800&q=85'],
    description: 'High performance 45 HP Mahindra tractor suitable for ploughing, rotavating and trailer haulage.',
    specs: {
      distance_km: 'Within 25 km',
      operator_included: 'Yes, operator provided',
      fuel_policy: 'Fuel extra by farmer',
      power: '45 HP',
    },
    created_at: new Date('2026-02-01').toISOString(),
    updated_at: new Date('2026-02-01').toISOString(),
    owner: {
      id: 'usr_lender_1',
      full_name: 'Harish Equipment Rentals',
      phone: '+91 9895012345',
      role: 'tool_lender',
      language: 'en',
      location: { district: 'Palakkad', state: 'Kerala', pincode: '678001' },
      metadata: {},
      created_at: new Date('2026-01-01').toISOString(),
    },
  },
  {
    id: 'eq_seed_2',
    owner_id: 'usr_lender_1',
    title: 'Shaktiman Rotary Tiller / Rotavator',
    category: 'Tractor & Tillage',
    daily_rate: 1200,
    hourly_rate: 220,
    is_available: true,
    location_address: 'Palakkad, Kerala',
    location_coords: { district: 'Palakkad', state: 'Kerala', pincode: '678001' },
    images: ['https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=85'],
    description: 'Heavy duty 54 blades rotavator for fine seedbed preparation in wet & dry soil.',
    specs: {
      distance_km: 'Within 20 km',
      operator_included: 'Tool only (Tractor required)',
      fuel_policy: 'Not applicable',
    },
    created_at: new Date('2026-02-02').toISOString(),
    updated_at: new Date('2026-02-02').toISOString(),
    owner: {
      id: 'usr_lender_1',
      full_name: 'Harish Equipment Rentals',
      phone: '+91 9895012345',
      role: 'tool_lender',
      language: 'en',
      location: { district: 'Palakkad', state: 'Kerala', pincode: '678001' },
      metadata: {},
      created_at: new Date('2026-01-01').toISOString(),
    },
  },
  {
    id: 'eq_seed_3',
    owner_id: 'usr_lender_1',
    title: 'Preet Combine Harvester (Track Type)',
    category: 'Harvesting',
    daily_rate: 4500,
    hourly_rate: 950,
    is_available: true,
    location_address: 'Palakkad, Kerala',
    location_coords: { district: 'Palakkad', state: 'Kerala', pincode: '678001' },
    images: ['https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=85'],
    description: 'Rubber track combine harvester for wet paddy and wheat fields with minimum grain loss.',
    specs: {
      distance_km: 'Within 50 km',
      operator_included: 'Yes, operator provided',
      fuel_policy: 'Fuel included in rate',
    },
    created_at: new Date('2026-02-03').toISOString(),
    updated_at: new Date('2026-02-03').toISOString(),
    owner: {
      id: 'usr_lender_1',
      full_name: 'Harish Equipment Rentals',
      phone: '+91 9895012345',
      role: 'tool_lender',
      language: 'en',
      location: { district: 'Palakkad', state: 'Kerala', pincode: '678001' },
      metadata: {},
      created_at: new Date('2026-01-01').toISOString(),
    },
  },
  {
    id: 'eq_seed_4',
    owner_id: 'usr_lender_1',
    title: 'Submersible Water Pump (7.5 HP)',
    category: 'Irrigation',
    daily_rate: 600,
    hourly_rate: 90,
    is_available: true,
    location_address: 'Palakkad, Kerala',
    location_coords: { district: 'Palakkad', state: 'Kerala', pincode: '678001' },
    images: ['https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=85'],
    description: 'High discharge 7.5 HP pump with starter box and 50m heavy duty water delivery hose.',
    specs: {
      distance_km: 'Within 15 km',
      operator_included: 'Tool only',
      fuel_policy: 'Not applicable',
    },
    created_at: new Date('2026-02-04').toISOString(),
    updated_at: new Date('2026-02-04').toISOString(),
    owner: {
      id: 'usr_lender_1',
      full_name: 'Harish Equipment Rentals',
      phone: '+91 9895012345',
      role: 'tool_lender',
      language: 'en',
      location: { district: 'Palakkad', state: 'Kerala', pincode: '678001' },
      metadata: {},
      created_at: new Date('2026-01-01').toISOString(),
    },
  },
  {
    id: 'eq_seed_5',
    owner_id: 'usr_lender_1',
    title: 'Tractor-Mounted Boom Sprayer (600L)',
    category: 'Spraying & Protection',
    daily_rate: 1400,
    hourly_rate: 250,
    is_available: true,
    location_address: 'Palakkad, Kerala',
    location_coords: { district: 'Palakkad', state: 'Kerala', pincode: '678001' },
    images: ['https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=800&q=85'],
    description: '12-meter hydraulic boom sprayer for fast, uniform insecticide and nutrient application.',
    specs: {
      distance_km: 'Within 30 km',
      operator_included: 'Yes, operator provided',
      fuel_policy: 'Fuel extra by farmer',
    },
    created_at: new Date('2026-02-05').toISOString(),
    updated_at: new Date('2026-02-05').toISOString(),
    owner: {
      id: 'usr_lender_1',
      full_name: 'Harish Equipment Rentals',
      phone: '+91 9895012345',
      role: 'tool_lender',
      language: 'en',
      location: { district: 'Palakkad', state: 'Kerala', pincode: '678001' },
      metadata: {},
      created_at: new Date('2026-01-01').toISOString(),
    },
  },
];

const DEFAULT_STORAGE: StorageListing[] = [
  {
    id: 'str_seed_1',
    owner_id: 'usr_storage_1',
    name: 'Palakkad Agro Cold Storage (Multi-Chamber)',
    storage_type: 'Cold Storage',
    total_capacity_tons: 500,
    available_capacity_tons: 220,
    rate_per_ton_day: 25,
    location_address: 'Palakkad Industrial Corridor, Kerala',
    location_coords: { district: 'Palakkad', state: 'Kerala', pincode: '678003' },
    features: [
      'Temperature Controlled (0°C to 4°C)',
      'Humidity Controlled',
      '24x7 Security & CCTV',
      'Forklift & Loading Labour',
      'Warehouse Receipt (e-NWR) eligible',
      'Insurance Coverage',
    ],
    images: ['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=85'],
    created_at: new Date('2026-02-01').toISOString(),
    updated_at: new Date('2026-02-01').toISOString(),
    owner: {
      id: 'usr_storage_1',
      full_name: 'Suresh Cold Stores & Warehousing',
      phone: '+91 9847012345',
      role: 'storage_owner',
      language: 'en',
      location: { district: 'Palakkad', state: 'Kerala', pincode: '678003' },
      metadata: {},
      created_at: new Date('2026-01-03').toISOString(),
    },
  },
  {
    id: 'str_seed_2',
    owner_id: 'usr_storage_1',
    name: 'Malabar Grain Silos & Agro Warehouse',
    storage_type: 'Silo',
    total_capacity_tons: 1200,
    available_capacity_tons: 450,
    rate_per_ton_day: 15,
    location_address: 'Sector 2, Agro Logistics Park, Palakkad',
    location_coords: { district: 'Palakkad', state: 'Kerala', pincode: '678003' },
    features: [
      'Pest Fumigated',
      '24x7 Security & CCTV',
      'Fire Safety System',
      'Forklift & Loading Labour',
      'Insurance Coverage',
    ],
    images: ['https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=800&q=85'],
    created_at: new Date('2026-02-02').toISOString(),
    updated_at: new Date('2026-02-02').toISOString(),
    owner: {
      id: 'usr_storage_1',
      full_name: 'Suresh Cold Stores & Warehousing',
      phone: '+91 9847012345',
      role: 'storage_owner',
      language: 'en',
      location: { district: 'Palakkad', state: 'Kerala', pincode: '678003' },
      metadata: {},
      created_at: new Date('2026-01-03').toISOString(),
    },
  },
  {
    id: 'str_seed_3',
    owner_id: 'usr_storage_1',
    name: 'Kerala Ventilated Onion & Potato Chawl',
    storage_type: 'Open Shed',
    total_capacity_tons: 250,
    available_capacity_tons: 95,
    rate_per_ton_day: 18,
    location_address: 'Palakkad Wholesale Market Yard, Kerala',
    location_coords: { district: 'Palakkad', state: 'Kerala', pincode: '678003' },
    features: [
      'Natural Aeration & Cross Ventilation',
      'Forklift & Loading Labour',
      '24x7 Security & CCTV',
    ],
    images: ['https://images.unsplash.com/photo-1590247813693-5541d1c609fd?auto=format&fit=crop&w=800&q=85'],
    created_at: new Date('2026-02-03').toISOString(),
    updated_at: new Date('2026-02-03').toISOString(),
    owner: {
      id: 'usr_storage_1',
      full_name: 'Suresh Cold Stores & Warehousing',
      phone: '+91 9847012345',
      role: 'storage_owner',
      language: 'en',
      location: { district: 'Palakkad', state: 'Kerala', pincode: '678003' },
      metadata: {},
      created_at: new Date('2026-01-03').toISOString(),
    },
  },
];

const DEFAULT_REQUESTS: ServiceRequest[] = [
  {
    id: 'req_seed_1',
    requester_id: 'usr_farmer_1',
    provider_id: 'usr_lender_1',
    item_type: 'equipment',
    item_id: 'eq_seed_1',
    start_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    end_date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    quantity_tons: null,
    total_cost: 2500,
    status: 'pending',
    notes: 'Need for 4 acres of paddy land preparation in Palakkad.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    requester: {
      id: 'usr_farmer_1',
      full_name: 'Ramesh Kumar',
      phone: '+91 9895098765',
      role: 'farmer',
      language: 'en',
      location: { district: 'Palakkad', state: 'Kerala', pincode: '678001' },
      metadata: {},
      created_at: new Date('2026-01-04').toISOString(),
    },
    equipment: DEFAULT_EQUIPMENT[0],
  },
];

const memoryFallback = new Map<string, string>();

function getStorageItem(key: string): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem(key);
  }
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(key);
  }
  return memoryFallback.get(key) || null;
}

function setStorageItem(key: string, val: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(key, val);
    return;
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(key, val);
    return;
  }
  memoryFallback.set(key, val);
}

function removeStorageItem(key: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(key);
    return;
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(key);
    return;
  }
  memoryFallback.delete(key);
}

function readStorage<T>(key: string, defaultVal: T): T {
  try {
    const raw = getStorageItem(key);
    if (!raw) {
      setStorageItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Error reading storage ${key}:`, err);
    return defaultVal;
  }
}

function writeStorage<T>(key: string, val: T): void {
  try {
    setStorageItem(key, JSON.stringify(val));
  } catch (err) {
    console.warn(`Error writing storage ${key}:`, err);
  }
}

export const localDb = {
  // 1. Users & Authentication
  getUsers(): StoredUser[] {
    return readStorage<StoredUser[]>(KISAN_USERS_KEY, DEFAULT_USERS);
  },

  findUserByEmail(email: string): StoredUser | null {
    const normalized = email.trim().toLowerCase();
    const users = this.getUsers();
    return users.find((u) => u.email.trim().toLowerCase() === normalized) || null;
  },

  getUserById(id: string): StoredUser | null {
    const users = this.getUsers();
    return users.find((u) => u.id === id) || null;
  },

  saveUser(user: StoredUser): StoredUser {
    const users = this.getUsers();
    const existingIndex = users.findIndex(
      (u) => u.id === user.id || u.email.trim().toLowerCase() === user.email.trim().toLowerCase()
    );
    let updated: StoredUser[];
    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...user };
      updated = [...users];
    } else {
      updated = [user, ...users];
    }
    writeStorage(KISAN_USERS_KEY, updated);

    // If user is a job_seeker, also ensure they appear in the workers pool
    if (user.role === 'job_seeker') {
      this.syncWorkerProfile(user);
    }
    return user;
  },

  getProfile(id: string): Profile | null {
    const user = this.getUserById(id);
    if (!user) return null;
    return {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      language: 'en',
      location: user.location || { district: user.place || 'Palakkad', state: user.state || 'Kerala', pincode: user.pincode || '678001' },
      metadata: user.metadata || {},
      avatar_url: user.avatar_url,
      onboarding_completed: user.onboarding_completed,
      created_at: user.created_at,
    };
  },

  updateProfile(id: string, updates: Partial<Profile & { metadata?: any }>): Profile | null {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return null;

    users[index] = {
      ...users[index],
      full_name: updates.full_name || users[index].full_name,
      phone: updates.phone || users[index].phone,
      email: updates.email || users[index].email,
      avatar_url: updates.avatar_url !== undefined ? updates.avatar_url : users[index].avatar_url,
      metadata: { ...(users[index].metadata || {}), ...(updates.metadata || {}) },
      onboarding_completed: updates.onboarding_completed ?? users[index].onboarding_completed,
    };
    writeStorage(KISAN_USERS_KEY, users);

    if (users[index].role === 'job_seeker') {
      this.syncWorkerProfile(users[index]);
    }
    return this.getProfile(id);
  },

  // 2. Equipment Listings
  getEquipmentListings(category?: string): EquipmentListing[] {
    const list = readStorage<EquipmentListing[]>(KISAN_EQUIPMENT_KEY, DEFAULT_EQUIPMENT);
    if (!category || category === 'All tools' || category === 'All equipment') {
      return list;
    }
    return list.filter((item) =>
      item.category.toLowerCase().includes(category.toLowerCase()) ||
      item.title.toLowerCase().includes(category.toLowerCase())
    );
  },

  getOwnerEquipmentListings(ownerId: string): EquipmentListing[] {
    const list = readStorage<EquipmentListing[]>(KISAN_EQUIPMENT_KEY, DEFAULT_EQUIPMENT);
    return list.filter((item) => item.owner_id === ownerId);
  },

  addEquipmentListing(item: Partial<EquipmentListing>): EquipmentListing {
    const list = readStorage<EquipmentListing[]>(KISAN_EQUIPMENT_KEY, DEFAULT_EQUIPMENT);
    const owner = this.getProfile(item.owner_id || '');
    const newItem: EquipmentListing = {
      id: item.id || `eq_${Date.now()}`,
      owner_id: item.owner_id || 'usr_lender_1',
      title: item.title || 'Farm Machinery',
      category: item.category || 'Tractor & Tillage',
      description: item.description || null,
      daily_rate: Number(item.daily_rate) || 2000,
      hourly_rate: item.hourly_rate ? Number(item.hourly_rate) : null,
      is_available: item.is_available ?? true,
      location_address: item.location_address || owner?.location?.district || 'Palakkad, Kerala',
      location_coords: item.location_coords || owner?.location || null,
      images: item.images && item.images.length > 0 ? item.images : ['https://images.unsplash.com/photo-1564868480822-32f714a0e763?auto=format&fit=crop&w=800&q=85'],
      specs: item.specs || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      owner: owner || undefined,
    };
    const updated = [newItem, ...list];
    writeStorage(KISAN_EQUIPMENT_KEY, updated);
    return newItem;
  },

  updateEquipmentListing(id: string, updates: Partial<EquipmentListing>): EquipmentListing | null {
    const list = readStorage<EquipmentListing[]>(KISAN_EQUIPMENT_KEY, DEFAULT_EQUIPMENT);
    const index = list.findIndex((e) => e.id === id);
    if (index === -1) return null;
    list[index] = {
      ...list[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    writeStorage(KISAN_EQUIPMENT_KEY, list);
    return list[index];
  },

  deleteEquipmentListing(id: string): boolean {
    const list = readStorage<EquipmentListing[]>(KISAN_EQUIPMENT_KEY, DEFAULT_EQUIPMENT);
    const filtered = list.filter((e) => e.id !== id);
    writeStorage(KISAN_EQUIPMENT_KEY, filtered);
    return true;
  },

  // 3. Storage Facilities
  getStorageListings(type?: string): StorageListing[] {
    const list = readStorage<StorageListing[]>(KISAN_STORAGE_KEY, DEFAULT_STORAGE);
    if (!type || type === 'All storage') {
      return list;
    }
    return list.filter((item) => item.storage_type.toLowerCase().includes(type.toLowerCase()));
  },

  getOwnerStorageListings(ownerId: string): StorageListing[] {
    const list = readStorage<StorageListing[]>(KISAN_STORAGE_KEY, DEFAULT_STORAGE);
    return list.filter((item) => item.owner_id === ownerId);
  },

  addStorageListing(item: Partial<StorageListing>): StorageListing {
    const list = readStorage<StorageListing[]>(KISAN_STORAGE_KEY, DEFAULT_STORAGE);
    const owner = this.getProfile(item.owner_id || '');
    const newItem: StorageListing = {
      id: item.id || `str_${Date.now()}`,
      owner_id: item.owner_id || 'usr_storage_1',
      name: item.name || 'Agro Storage Unit',
      storage_type: item.storage_type || ('Cold Storage' as any),
      total_capacity_tons: Number(item.total_capacity_tons) || 100,
      available_capacity_tons: Number(item.available_capacity_tons) || Number(item.total_capacity_tons) || 100,
      rate_per_ton_day: Number(item.rate_per_ton_day) || 20,
      location_address: item.location_address || owner?.location?.district || 'Palakkad, Kerala',
      location_coords: item.location_coords || owner?.location || null,
      features: item.features || ['Temperature Controlled', '24x7 Security & CCTV'],
      images: item.images && item.images.length > 0 ? item.images : ['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=85'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      owner: owner || undefined,
    };
    const updated = [newItem, ...list];
    writeStorage(KISAN_STORAGE_KEY, updated);
    return newItem;
  },

  updateStorageListing(id: string, updates: Partial<StorageListing>): StorageListing | null {
    const list = readStorage<StorageListing[]>(KISAN_STORAGE_KEY, DEFAULT_STORAGE);
    const index = list.findIndex((s) => s.id === id);
    if (index === -1) return null;
    list[index] = {
      ...list[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    writeStorage(KISAN_STORAGE_KEY, list);
    return list[index];
  },

  deleteStorageListing(id: string): boolean {
    const list = readStorage<StorageListing[]>(KISAN_STORAGE_KEY, DEFAULT_STORAGE);
    const filtered = list.filter((s) => s.id !== id);
    writeStorage(KISAN_STORAGE_KEY, filtered);
    return true;
  },

  // 4. Workers (Job Seekers)
  getWorkers(): Profile[] {
    const users = this.getUsers();
    return users
      .filter((u) => u.role === 'job_seeker')
      .map((u) => ({
        id: u.id,
        full_name: u.full_name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        language: 'en',
        location: u.location || { district: u.place || 'Palakkad', state: u.state || 'Kerala', pincode: u.pincode || '678001' },
        metadata: u.metadata || {},
        avatar_url: u.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        created_at: u.created_at,
      }));
  },

  syncWorkerProfile(user: StoredUser): void {
    const workers = readStorage<any[]>(KISAN_WORKERS_KEY, []);
    const existingIndex = workers.findIndex((w) => w.id === user.id);
    const workerEntry = {
      id: user.id,
      full_name: user.full_name,
      phone: user.phone,
      location: user.location,
      metadata: user.metadata || {},
      avatar_url: user.avatar_url,
    };
    if (existingIndex >= 0) {
      workers[existingIndex] = workerEntry;
    } else {
      workers.unshift(workerEntry);
    }
    writeStorage(KISAN_WORKERS_KEY, workers);
  },

  // 5. Service Requests (Bookings)
  getServiceRequests(): ServiceRequest[] {
    return readStorage<ServiceRequest[]>(KISAN_REQUESTS_KEY, DEFAULT_REQUESTS);
  },

  getUserRequests(userId: string): ServiceRequest[] {
    const list = this.getServiceRequests();
    return list.filter((r) => r.requester_id === userId || r.provider_id === userId);
  },

  addServiceRequest(request: Partial<ServiceRequest>): ServiceRequest {
    const list = this.getServiceRequests();
    const requester = this.getProfile(request.requester_id || '');
    const provider = this.getProfile(request.provider_id || '');
    const equipment = request.item_id ? this.getEquipmentListings().find((e) => e.id === request.item_id) : undefined;
    const newReq: ServiceRequest = {
      id: request.id || `req_${Date.now()}`,
      requester_id: request.requester_id || 'usr_farmer_1',
      provider_id: request.provider_id || equipment?.owner_id || 'usr_lender_1',
      item_type: request.item_type || 'equipment',
      item_id: request.item_id || '',
      start_date: request.start_date || new Date().toISOString().split('T')[0],
      end_date: request.end_date || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      quantity_tons: request.quantity_tons || null,
      total_cost: Number(request.total_cost) || 2500,
      status: request.status || 'pending',
      notes: request.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      requester: requester || undefined,
      provider: provider || undefined,
      equipment: equipment || undefined,
    };
    const updated = [newReq, ...list];
    writeStorage(KISAN_REQUESTS_KEY, updated);
    return newReq;
  },

  updateServiceRequestStatus(id: string, status: 'confirmed' | 'completed' | 'cancelled'): ServiceRequest | null {
    const list = this.getServiceRequests();
    const index = list.findIndex((r) => r.id === id);
    if (index === -1) return null;
    list[index] = {
      ...list[index],
      status,
      updated_at: new Date().toISOString(),
    };
    writeStorage(KISAN_REQUESTS_KEY, list);
    return list[index];
  },

  // 6. Active Session Management
  getActiveSession(): { user: any; profile: any } | null {
    return readStorage<{ user: any; profile: any } | null>(KISAN_ACTIVE_SESSION_KEY, null);
  },

  setActiveSession(session: { user: any; profile: any }): void {
    writeStorage(KISAN_ACTIVE_SESSION_KEY, session);
  },

  clearActiveSession(): void {
    removeStorageItem(KISAN_ACTIVE_SESSION_KEY);
  },
};
