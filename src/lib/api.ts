import { supabase, isSupabaseConfigured } from './supabase';
import { localDb } from './localDatabase';
import type { Database } from '../types/database.generated';
import type {
  EquipmentListing,
  StorageListing,
  JobPosting,
  JobApplication,
  ServiceRequest,
  Review,
  CommunityMessage,
  Notification,
  GovernmentScheme,
} from '../types/database';

export const SAFE_PROFILE_COLUMNS = 'id, full_name, email, role, location, avatar_url';

// ============================================================
// 1. PROFILES API
// ============================================================
export async function fetchProfile(userId: string) {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase fetchProfile failed, checking localDb:', e);
    }
  }
  return localDb.getProfile(userId);
}

export async function updateProfile(
  userId: string,
  updates: Database['public']['Tables']['profiles']['Update']
) {
  // Always update local database for instantaneous cross-role visibility
  localDb.updateProfile(userId, updates as any);

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase updateProfile failed, saved locally:', e);
    }
  }
  return localDb.getProfile(userId);
}

export async function updatePersonalizationProfile(
  userId: string,
  personalization: {
    crops?: string[];
    farm_size_range?: string | null;
    interests?: string[];
    equipment_types?: string[];
    work_skills?: string[];
    storage_types?: string[];
    onboarding_completed?: boolean;
  }
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized profile modification.');
  }

  const { data, error } = await (supabase
    .from('profiles')
    .update as any)({
      ...personalization,
      onboarding_completed: personalization.onboarding_completed ?? true,
    })
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================================
// 2. EQUIPMENT MARKETPLACE API
// ============================================================
export async function fetchEquipmentListings(category?: string) {
  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from('equipment_listings')
        .select(`*, owner:profiles!owner_id(${SAFE_PROFILE_COLUMNS})`)
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (category && category !== 'All tools') {
        query = query.ilike('category', `%${category}%`);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as unknown as (EquipmentListing & { owner: Partial<Database['public']['Tables']['profiles']['Row']> })[];
      }
    } catch (e) {
      console.warn('Supabase fetchEquipmentListings error, falling back to localDb:', e);
    }
  }
  return localDb.getEquipmentListings(category) as any;
}

export async function createEquipmentListing(
  listing: Database['public']['Tables']['equipment_listings']['Insert']
) {
  // Always persist immediately to localDb for instant cross-dashboard access
  const localItem = localDb.addEquipmentListing(listing as any);

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('equipment_listings')
        .insert(listing)
        .select()
        .single();
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase createEquipmentListing error, persisted locally:', e);
    }
  }
  return localItem as any;
}

export async function fetchOwnerEquipmentListings(ownerId: string) {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('equipment_listings')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data as unknown as EquipmentListing[];
      }
    } catch (e) {
      console.warn('Supabase fetchOwnerEquipmentListings error, using localDb:', e);
    }
  }
  return localDb.getOwnerEquipmentListings(ownerId) as any;
}

export async function updateEquipmentListing(
  id: string,
  updates: Partial<Database['public']['Tables']['equipment_listings']['Update']>
) {
  localDb.updateEquipmentListing(id, updates as any);

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('equipment_listings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data as unknown as EquipmentListing;
    } catch (e) {
      console.warn('Supabase updateEquipmentListing error, updated locally:', e);
    }
  }
  return (localDb.getEquipmentListings().find(e => e.id === id) || updates) as any;
}

export async function deleteEquipmentListing(id: string) {
  localDb.deleteEquipmentListing(id);

  if (isSupabaseConfigured) {
    try {
      await supabase.from('equipment_listings').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteEquipmentListing error, deleted locally:', e);
    }
  }
  return true;
}

// ============================================================
// 3. STORAGE LISTINGS API
// ============================================================
export async function fetchStorageListings(type?: string) {
  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from('storage_listings')
        .select(`*, owner:profiles!owner_id(${SAFE_PROFILE_COLUMNS})`)
        .gt('available_capacity_tons', 0)
        .order('created_at', { ascending: false });

      if (type && type !== 'All storage') {
        query = query.eq('storage_type', type as any);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as unknown as (StorageListing & { owner: Partial<Database['public']['Tables']['profiles']['Row']> })[];
      }
    } catch (e) {
      console.warn('Supabase fetchStorageListings error, falling back to localDb:', e);
    }
  }
  return localDb.getStorageListings(type) as any;
}

export async function fetchOwnerStorageListings(ownerId: string) {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('storage_listings')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data as unknown as StorageListing[];
      }
    } catch (e) {
      console.warn('Supabase fetchOwnerStorageListings error, using localDb:', e);
    }
  }
  return localDb.getOwnerStorageListings(ownerId) as any;
}

export async function createStorageListing(
  listing: Database['public']['Tables']['storage_listings']['Insert']
) {
  const localItem = localDb.addStorageListing(listing as any);

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('storage_listings')
        .insert(listing)
        .select()
        .single();
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase createStorageListing error, persisted locally:', e);
    }
  }
  return localItem as any;
}

export async function updateStorageListing(
  id: string,
  updates: Partial<Database['public']['Tables']['storage_listings']['Update']>
) {
  localDb.updateStorageListing(id, updates as any);

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('storage_listings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data as unknown as StorageListing;
    } catch (e) {
      console.warn('Supabase updateStorageListing error, updated locally:', e);
    }
  }
  return (localDb.getStorageListings().find(s => s.id === id) || updates) as any;
}

export async function deleteStorageListing(id: string) {
  localDb.deleteStorageListing(id);

  if (isSupabaseConfigured) {
    try {
      await supabase.from('storage_listings').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteStorageListing error, deleted locally:', e);
    }
  }
  return true;
}

// ============================================================
// 4. WORKERS (JOB SEEKERS) API
// ============================================================
export async function fetchWorkers() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'job_seeker')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase fetchWorkers error, using localDb:', e);
    }
  }
  return localDb.getWorkers();
}

// ============================================================
// 5. JOB POSTINGS & APPLICATIONS API
// ============================================================
export async function fetchJobPostings(status: string = 'open') {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('job_postings')
        .select(`*, farmer:profiles!farmer_id(${SAFE_PROFILE_COLUMNS})`)
        .eq('status', status)
        .order('created_at', { ascending: false });
      if (!error && data) return data as any;
    } catch (e) {
      console.warn('Supabase fetchJobPostings error:', e);
    }
  }
  return [];
}

export async function createJobPosting(
  posting: Database['public']['Tables']['job_postings']['Insert']
) {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('job_postings')
        .insert(posting)
        .select()
        .single();
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase createJobPosting error:', e);
    }
  }
  return { id: `job_${Date.now()}`, ...posting };
}

export async function applyForJob(jobId: string, workerId: string, notes?: string) {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          worker_id: workerId,
          notes: notes || null,
          status: 'pending',
        })
        .select()
        .single();
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase applyForJob error:', e);
    }
  }
  return { id: `app_${Date.now()}`, job_id: jobId, worker_id: workerId, notes, status: 'pending' };
}

export async function updateJobApplicationStatus(
  applicationId: string,
  status: 'accepted' | 'rejected' | 'withdrawn'
) {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .update({ status })
        .eq('id', applicationId)
        .select()
        .single();
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase updateJobApplicationStatus error:', e);
    }
  }
  return { id: applicationId, status };
}

export async function fetchWorkerApplications(workerId: string) {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`*, job:job_postings(*, farmer:profiles!farmer_id(${SAFE_PROFILE_COLUMNS}))`)
        .eq('worker_id', workerId)
        .order('created_at', { ascending: false });
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase fetchWorkerApplications error:', e);
    }
  }
  return [];
}

// ============================================================
// 6. SERVICE REQUESTS & BOOKINGS API
// ============================================================
export async function createServiceRequest(
  request: Database['public']['Tables']['service_requests']['Insert']
) {
  const localReq = localDb.addServiceRequest(request as any);

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .insert({
          ...request,
          status: request.status || 'pending',
        })
        .select()
        .single();
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase createServiceRequest error, persisted locally:', e);
    }
  }
  return localReq as any;
}

export async function updateServiceRequestStatus(
  requestId: string,
  status: 'confirmed' | 'completed' | 'cancelled'
) {
  localDb.updateServiceRequestStatus(requestId, status);

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .update({ status })
        .eq('id', requestId)
        .select()
        .single();
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase updateServiceRequestStatus error, updated locally:', e);
    }
  }
  return localDb.getServiceRequests().find(r => r.id === requestId) as any;
}

export async function fetchUserRequests(userId: string) {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select(`*, requester:profiles!requester_id(${SAFE_PROFILE_COLUMNS}), provider:profiles!provider_id(${SAFE_PROFILE_COLUMNS})`)
        .or(`requester_id.eq.${userId},provider_id.eq.${userId}`)
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase fetchUserRequests error, using localDb:', e);
    }
  }
  return localDb.getUserRequests(userId) as any;
}

// ============================================================
// 6. REVIEWS & COMMUNITY FORUM API
// ============================================================
export async function fetchUserReviews(targetUserId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select(`*, reviewer:profiles!reviewer_id(${SAFE_PROFILE_COLUMNS})`)
    .eq('target_user_id', targetUserId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createReview(
  review: Database['public']['Tables']['reviews']['Insert']
) {
  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchCommunityMessages(
  channel: 'farmer_forum' | 'worker_forum' | 'general' = 'general'
) {
  const { data, error } = await supabase
    .from('community_messages')
    .select(`*, sender:profiles!sender_id(${SAFE_PROFILE_COLUMNS})`)
    .eq('channel', channel)
    .order('created_at', { ascending: true })
    .limit(100);

  if (error) throw error;
  return data;
}

export async function sendCommunityMessage(
  senderId: string,
  channel: 'farmer_forum' | 'worker_forum' | 'general',
  content: string,
  mediaUrl?: string
) {
  const { data, error } = await supabase
    .from('community_messages')
    .insert({
      sender_id: senderId,
      channel,
      content,
      media_url: mediaUrl || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export function subscribeToCommunityMessages(
  channel: 'farmer_forum' | 'worker_forum' | 'general',
  callback: (payload: any) => void
) {
  return supabase
    .channel(`community-${channel}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'community_messages',
        filter: `channel=eq.${channel}`,
      },
      (payload) => callback(payload.new)
    )
    .subscribe();
}

// ============================================================
// 7. NOTIFICATIONS API
// ============================================================
export async function fetchUserNotifications(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function markNotificationAsRead(notificationId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export function subscribeToUserNotifications(
  userId: string,
  callback: (payload: any) => void
) {
  return supabase
    .channel(`notifications-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => callback(payload.new)
    )
    .subscribe();
}

// ============================================================
// 8. GOVERNMENT SCHEMES & GEMINI ADVISOR API
// ============================================================
export async function fetchGovernmentSchemes(category?: string) {
  let query = supabase.from('government_schemes').select('*');
  if (category) {
    query = query.eq('category', category);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data as GovernmentScheme[];
}

export async function consultSchemeAdvisor(profile: any, queryText: string) {
  const { data, error } = await supabase.functions.invoke('scheme-advisor', {
    body: {
      profile,
      query: queryText,
    },
  });

  if (error) throw error;
  return data;
}

// ============================================================
// 9. MEDIA STORAGE UPLOADS (kisan-media bucket)
// ============================================================
export async function uploadMedia(file: File, folder: string = 'general') {
  const fileExt = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('kisan-media')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from('kisan-media')
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

export async function uploadProfileAvatar(file: File) {
  // 1. Authenticated User Check
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('Authentication required to upload profile avatar.');
  }

  // 2. Validate File MIME type and map to extension
  const mimeExtensionMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };

  const fileExt = mimeExtensionMap[file.type];
  if (!fileExt) {
    throw new Error('Invalid file format. Only JPEG, PNG, WEBP, and GIF images are allowed.');
  }

  // 3. Validate File Size (Max 5 MB)
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error('File size exceeds maximum limit of 5MB.');
  }

  const uniqueId = Math.random().toString(36).substring(2, 8);
  const filePath = `avatars/${user.id}/${Date.now()}_${uniqueId}.${fileExt}`;

  // 4. Upload to kisan-media bucket
  const { data, error: uploadError } = await supabase.storage
    .from('kisan-media')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) throw uploadError;

  // 5. Get public URL
  const { data: publicUrlData } = supabase.storage
    .from('kisan-media')
    .getPublicUrl(data.path);

  const avatarUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

  // 6. Update profile record in database
  const { data: updatedProfile, error: profileError } = await (supabase
    .from('profiles')
    .update as any)({ avatar_url: avatarUrl })
    .eq('id', user.id)
    .select()
    .single();

  // Rollback storage upload if DB update fails
  if (profileError) {
    try {
      await supabase.storage.from('kisan-media').remove([filePath]);
    } catch (cleanupErr) {
      console.warn('Rollback upload cleanup failed:', cleanupErr);
    }
    throw profileError;
  }

  // 7. Clean up old avatar files in user's avatar directory (best effort)
  try {
    const { data: files } = await supabase.storage
      .from('kisan-media')
      .list(`avatars/${user.id}`);

    if (files && files.length > 1) {
      const currentFileName = filePath.split('/').pop();
      const filesToDelete = files
        .filter(f => f.name !== currentFileName)
        .map(f => `avatars/${user.id}/${f.name}`);

      if (filesToDelete.length > 0) {
        await supabase.storage.from('kisan-media').remove(filesToDelete);
      }
    }
  } catch (err) {
    console.warn('Old avatar cleanup skipped:', err);
  }

  return updatedProfile;
}

export async function removeProfileAvatar() {
  // 1. Authenticated User Check
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('Authentication required to remove profile avatar.');
  }

  // 2. Clear profile avatar_url in database
  const { data: updatedProfile, error: profileError } = await (supabase
    .from('profiles')
    .update as any)({ avatar_url: null })
    .eq('id', user.id)
    .select()
    .single();

  if (profileError) throw profileError;

  // 3. Remove owned files in user's avatars directory only
  try {
    const { data: files } = await supabase.storage
      .from('kisan-media')
      .list(`avatars/${user.id}`);

    if (files && files.length > 0) {
      const filesToDelete = files.map(f => `avatars/${user.id}/${f.name}`);
      await supabase.storage.from('kisan-media').remove(filesToDelete);
    }
  } catch (err) {
    console.warn('Avatar directory cleanup warning:', err);
  }

  return updatedProfile;
}
