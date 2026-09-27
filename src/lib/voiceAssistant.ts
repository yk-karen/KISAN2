import { supabase } from './supabase';

export type VoiceContext =
  | 'equipment_listing'
  | 'equipment_search'
  | 'job_posting'
  | 'job_search'
  | 'job_application'
  | 'storage_listing'
  | 'storage_search'
  | 'service_request'
  | 'community_post'
  | 'profile'
  | 'scheme_search';

export interface FormFieldSchema {
  name: string;
  type: 'string' | 'number' | 'date' | 'array';
  label: string;
}

export const FORM_SCHEMAS: Record<VoiceContext, FormFieldSchema[]> = {
  equipment_listing: [
    { name: 'title', type: 'string', label: 'Equipment Name' },
    { name: 'category', type: 'string', label: 'Category' },
    { name: 'daily_rate', type: 'number', label: 'Daily Rate' },
    { name: 'location_address', type: 'string', label: 'Location' },
    { name: 'description', type: 'string', label: 'Description' },
  ],
  equipment_search: [
    { name: 'search_query', type: 'string', label: 'Search Keyword' },
    { name: 'category', type: 'string', label: 'Equipment Category' },
  ],
  job_posting: [
    { name: 'title', type: 'string', label: 'Job Title' },
    { name: 'workers_needed', type: 'number', label: 'Workers Needed' },
    { name: 'daily_wage', type: 'number', label: 'Daily Wage' },
    { name: 'date_required', type: 'date', label: 'Date Required' },
    { name: 'description', type: 'string', label: 'Description' },
  ],
  job_search: [
    { name: 'search_query', type: 'string', label: 'Job Keyword' },
  ],
  job_application: [
    { name: 'notes', type: 'string', label: 'Application Notes' },
  ],
  storage_listing: [
    { name: 'title', type: 'string', label: 'Storage Facility Name' },
    { name: 'storage_type', type: 'string', label: 'Storage Type' },
    { name: 'total_capacity_tons', type: 'number', label: 'Capacity (Tons)' },
    { name: 'rate_per_ton_day', type: 'number', label: 'Daily Rate per Ton' },
    { name: 'location_address', type: 'string', label: 'Location' },
  ],
  storage_search: [
    { name: 'search_query', type: 'string', label: 'Storage Keyword' },
    { name: 'storage_type', type: 'string', label: 'Storage Type' },
  ],
  service_request: [
    { name: 'start_date', type: 'date', label: 'Start Date' },
    { name: 'end_date', type: 'date', label: 'End Date' },
    { name: 'quantity_tons', type: 'number', label: 'Quantity (Tons)' },
    { name: 'notes', type: 'string', label: 'Request Notes' },
  ],
  community_post: [
    { name: 'content', type: 'string', label: 'Message Content' },
  ],
  profile: [
    { name: 'firstName', type: 'string', label: 'First Name' },
    { name: 'lastName', type: 'string', label: 'Last Name' },
    { name: 'city', type: 'string', label: 'City/District' },
    { name: 'phone', type: 'string', label: 'Contact Phone' },
    { name: 'crops', type: 'array', label: 'Crops' },
    { name: 'farm_size_range', type: 'string', label: 'Farm Size' },
    { name: 'interests', type: 'array', label: 'Interests' },
    { name: 'equipment_types', type: 'array', label: 'Equipment Types' },
    { name: 'work_skills', type: 'array', label: 'Work Skills' },
    { name: 'storage_types', type: 'array', label: 'Storage Types' },
  ],
  scheme_search: [
    { name: 'query', type: 'string', label: 'Scheme Question' },
  ],
};

const BCP47_MAP: Record<string, string> = {
  ml: 'ml-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  en: 'en-IN',
};

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

export async function processVoiceInput(
  context: VoiceContext,
  transcript: string,
  appLanguage: string = 'en'
): Promise<{ candidateFields: Record<string, any>; unresolved: string[] }> {
  const allowedSchemas = FORM_SCHEMAS[context] || [];
  const allowedFieldNames = allowedSchemas.map(s => s.name);
  const lang = BCP47_MAP[appLanguage] || 'en-IN';

  try {
    const { data, error } = await supabase.functions.invoke('voice-extractor', {
      body: {
        context,
        language: lang,
        transcript,
        allowedFields: allowedFieldNames,
      },
    });

    if (!error && data?.fields && Object.keys(data.fields).length > 0) {
      return sanitizeExtractedFields(data.fields, allowedSchemas);
    }
  } catch (err) {
    console.warn('Edge function voice extraction fallback to local parser:', err);
  }

  // Client-side rule-based fallback parser if Edge Function is unavailable or unconfigured
  return fallbackRuleBasedExtraction(context, transcript, allowedSchemas);
}

function sanitizeExtractedFields(
  rawFields: Record<string, any>,
  schemas: FormFieldSchema[]
): { candidateFields: Record<string, any>; unresolved: string[] } {
  const candidateFields: Record<string, any> = {};
  const unresolved: string[] = [];

  for (const schema of schemas) {
    const val = rawFields[schema.name];
    if (val === undefined || val === null || val === '') continue;

    if (schema.type === 'number') {
      const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^\d.]/g, ''));
      if (!isNaN(num) && num >= 0) {
        candidateFields[schema.name] = num;
      } else {
        unresolved.push(schema.label);
      }
    } else if (schema.type === 'date') {
      const dateStr = String(val).trim();
      const parsed = Date.parse(dateStr);
      if (!isNaN(parsed)) {
        candidateFields[schema.name] = new Date(parsed).toISOString().split('T')[0];
      } else {
        candidateFields[schema.name] = dateStr;
      }
    } else if (schema.type === 'array') {
      if (Array.isArray(val)) {
        candidateFields[schema.name] = val.map(item => String(item).trim()).filter(Boolean);
      } else if (typeof val === 'string') {
        candidateFields[schema.name] = val.split(',').map(s => s.trim()).filter(Boolean);
      }
    } else {
      candidateFields[schema.name] = String(val).trim();
    }
  }

  return { candidateFields, unresolved };
}

function fallbackRuleBasedExtraction(
  context: VoiceContext,
  text: string,
  schemas: FormFieldSchema[]
): { candidateFields: Record<string, any>; unresolved: string[] } {
  const candidateFields: Record<string, any> = {};
  const numbers = text.match(/\d+(?:\.\d+)?/g);

  if (context === 'equipment_listing') {
    candidateFields.title = text.slice(0, 50);
    if (numbers && numbers[0]) candidateFields.daily_rate = parseFloat(numbers[0]);
  } else if (context === 'equipment_search') {
    candidateFields.search_query = text.slice(0, 100);
  } else if (context === 'job_posting') {
    candidateFields.title = text.slice(0, 50);
    if (numbers && numbers[0]) candidateFields.workers_needed = parseInt(numbers[0], 10);
    if (numbers && numbers[1]) candidateFields.daily_wage = parseFloat(numbers[1]);
  } else if (context === 'job_search') {
    candidateFields.search_query = text.slice(0, 100);
  } else if (context === 'job_application') {
    candidateFields.notes = text.slice(0, 200);
  } else if (context === 'storage_listing') {
    candidateFields.title = text.slice(0, 50);
    if (numbers && numbers[0]) candidateFields.total_capacity_tons = parseFloat(numbers[0]);
    if (numbers && numbers[1]) candidateFields.rate_per_ton_day = parseFloat(numbers[1]);
  } else if (context === 'storage_search') {
    candidateFields.search_query = text.slice(0, 100);
  } else if (context === 'service_request') {
    candidateFields.notes = text.slice(0, 200);
  } else if (context === 'community_post') {
    candidateFields.content = text.slice(0, 500);
  } else if (context === 'profile') {
    const words = text.split(' ').filter(Boolean);
    if (words[0]) candidateFields.firstName = words[0];
    if (words[1]) candidateFields.lastName = words[1];
  } else if (context === 'scheme_search') {
    candidateFields.query = text.slice(0, 300);
  }

  return sanitizeExtractedFields(candidateFields, schemas);
}
