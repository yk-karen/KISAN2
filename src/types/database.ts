export type UserRole = 'farmer' | 'tool_lender' | 'job_seeker' | 'storage_owner';

export type JobStatus = 'open' | 'filled' | 'completed' | 'cancelled';
export type JobApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';
export type ServiceRequestStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type ItemType = 'equipment' | 'storage';
export type StorageType = 'Cold Storage' | 'Dry Warehouse' | 'Silo' | 'Hermetic Bag/Bunker' | 'Open Shed';
export type CommunityChannel = 'farmer_forum' | 'worker_forum' | 'general';
export type NotificationType = 'info' | 'booking_request' | 'booking_status' | 'job_application' | 'job_status' | 'system';

export interface LocationCoords {
  lat?: number;
  lng?: number;
  district?: string;
  state?: string;
  pincode?: string;
}

export interface Profile {
  id: string;
  full_name: string;
  email?: string | null;
  phone: string | null;
  role: UserRole;
  language: string;
  avatar_url?: string | null;
  location: LocationCoords | null;
  metadata: Record<string, any>;
  crops?: string[];
  farm_size_range?: string | null;
  interests?: string[];
  equipment_types?: string[];
  work_skills?: string[];
  storage_types?: string[];
  onboarding_completed?: boolean;
  created_at: string;
}

export interface EquipmentListing {
  id: string;
  owner_id: string;
  title: string;
  category: string;
  description: string | null;
  daily_rate: number;
  hourly_rate: number | null;
  is_available: boolean;
  location_address: string | null;
  location_coords: LocationCoords | null;
  images: string[];
  specs: Record<string, any>;
  created_at: string;
  updated_at: string;
  owner?: Profile;
}

export interface StorageListing {
  id: string;
  owner_id: string;
  name: string;
  storage_type: StorageType;
  total_capacity_tons: number;
  available_capacity_tons: number;
  rate_per_ton_day: number;
  location_address: string | null;
  location_coords: LocationCoords | null;
  features: string[];
  images: string[];
  created_at: string;
  updated_at: string;
  owner?: Profile;
}

export interface JobPosting {
  id: string;
  farmer_id: string;
  title: string;
  description: string | null;
  skills_required: string[];
  workers_needed: number;
  workers_hired: number;
  daily_wage: number;
  date_required: string;
  location_address: string | null;
  location_coords: LocationCoords | null;
  status: JobStatus;
  created_at: string;
  updated_at: string;
  farmer?: Profile;
}

export interface JobApplication {
  id: string;
  job_id: string;
  worker_id: string;
  status: JobApplicationStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  job?: JobPosting;
  worker?: Profile;
}

export interface ServiceRequest {
  id: string;
  requester_id: string;
  provider_id: string;
  item_type: ItemType;
  item_id: string;
  start_date: string;
  end_date: string;
  quantity_tons: number | null;
  total_cost: number;
  status: ServiceRequestStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  requester?: Profile;
  provider?: Profile;
  equipment?: EquipmentListing;
  storage?: StorageListing;
}

export interface Review {
  id: string;
  target_user_id: string;
  reviewer_id: string;
  service_request_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer?: Profile;
  target_user?: Profile;
}

export interface CommunityMessage {
  id: string;
  sender_id: string;
  channel: CommunityChannel;
  content: string;
  media_url: string | null;
  created_at: string;
  sender?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  payload: Record<string, any>;
  created_at: string;
}

export interface GovernmentScheme {
  id: string;
  title: string;
  category: string;
  description: string;
  eligibility_criteria: Record<string, any>;
  benefits: string;
  official_link: string | null;
  official_apply_url?: string | null;
  application_method?: string | null;
  application_deadline?: string | null;
  source_url?: string | null;
  source_type?: string;
  source_hash?: string | null;
  source_checked_at?: string | null;
  source_updated_at?: string | null;
  verification_status?: 'unverified' | 'verified' | 'stale';
  active?: boolean;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at'> & { created_at?: string };
        Update: Partial<Profile>;
      };
      equipment_listings: {
        Row: EquipmentListing;
        Insert: Omit<EquipmentListing, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<EquipmentListing, 'id'>>;
      };
      storage_listings: {
        Row: StorageListing;
        Insert: Omit<StorageListing, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<StorageListing, 'id'>>;
      };
      job_postings: {
        Row: JobPosting;
        Insert: Omit<JobPosting, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<JobPosting, 'id'>>;
      };
      job_applications: {
        Row: JobApplication;
        Insert: Omit<JobApplication, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<JobApplication, 'id'>>;
      };
      service_requests: {
        Row: ServiceRequest;
        Insert: Omit<ServiceRequest, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ServiceRequest, 'id'>>;
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, 'id' | 'created_at'>;
        Update: Partial<Omit<Review, 'id'>>;
      };
      community_messages: {
        Row: CommunityMessage;
        Insert: Omit<CommunityMessage, 'id' | 'created_at'>;
        Update: Partial<Omit<CommunityMessage, 'id'>>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'>;
        Update: Partial<Omit<Notification, 'id'>>;
      };
      government_schemes: {
        Row: GovernmentScheme;
        Insert: Omit<GovernmentScheme, 'id' | 'created_at'>;
        Update: Partial<Omit<GovernmentScheme, 'id'>>;
      };
    };
  };
}
