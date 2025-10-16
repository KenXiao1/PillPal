import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
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
