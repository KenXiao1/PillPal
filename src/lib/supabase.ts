import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables check:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    url: supabaseUrl,
  });
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Netlify dashboard. ' +
    'See NETLIFY_SETUP.md for instructions.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'patient' | 'caregiver';
  created_at: string;
}

export interface Medication {
  id: string;
  patient_id: string;
  name: string;
  dosage: string;
  instructions: string;
  active: boolean;
  created_at: string;
}

export interface Schedule {
  id: string;
  medication_id: string;
  time: string;
  days_of_week: number[];
  active: boolean;
  created_at: string;
}

export interface DoseLog {
  id: string;
  schedule_id: string;
  scheduled_time: string;
  taken_at: string | null;
  status: 'pending' | 'taken' | 'missed' | 'skipped';
  notes: string;
  created_at: string;
}

export interface CaregiverConnection {
  id: string;
  patient_id: string;
  caregiver_id: string;
  relationship: string;
  notify_missed_doses: boolean;
  created_at: string;
}

export interface Alert {
  id: string;
  dose_log_id: string;
  caregiver_id: string;
  type: 'missed_dose' | 'reminder';
  sent_at: string;
  read_at: string | null;
  created_at: string;
}

export interface HealthTopic {
  id: string;
  title: string;
  category: 'hypertension' | 'diabetes' | 'heart_health' | 'general' | 'exercise' | 'diet' | 'medication_safety';
  description: string;
  icon: string;
  order_index: number;
  created_at: string;
}

export interface HealthArticle {
  id: string;
  topic_id: string;
  title: string;
  content: string;
  summary: string;
  reading_time_minutes: number;
  published_at: string;
  created_at: string;
}

export interface UserArticleProgress {
  id: string;
  user_id: string;
  article_id: string;
  read_at: string;
  bookmarked: boolean;
  created_at: string;
}
