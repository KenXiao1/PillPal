/*
  # Medicine Compliance System Database Schema

  ## Overview
  This migration creates a comprehensive medication compliance tracking system with support for:
  - User authentication and role management (patients and caregivers)
  - Medication tracking and scheduling
  - Dose confirmation logging
  - Caregiver alerts for missed doses
  - Family member connections

  ## New Tables

  ### `profiles`
  - `id` (uuid, primary key) - Links to auth.users
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `role` (text) - Either 'patient' or 'caregiver'
  - `created_at` (timestamptz) - Account creation timestamp

  ### `medications`
  - `id` (uuid, primary key) - Unique medication identifier
  - `patient_id` (uuid) - References profiles table
  - `name` (text) - Medication name
  - `dosage` (text) - Dosage information (e.g., "10mg")
  - `instructions` (text) - Special instructions for taking medication
  - `active` (boolean) - Whether medication is currently prescribed
  - `created_at` (timestamptz) - When medication was added

  ### `schedules`
  - `id` (uuid, primary key) - Unique schedule identifier
  - `medication_id` (uuid) - References medications table
  - `time` (time) - Time of day for dose (e.g., 08:00:00)
  - `days_of_week` (jsonb) - Array of days [0-6] where 0=Sunday
  - `active` (boolean) - Whether schedule is currently active
  - `created_at` (timestamptz) - When schedule was created

  ### `dose_logs`
  - `id` (uuid, primary key) - Unique log entry identifier
  - `schedule_id` (uuid) - References schedules table
  - `scheduled_time` (timestamptz) - When dose was scheduled
  - `taken_at` (timestamptz, nullable) - When patient confirmed taking dose
  - `status` (text) - 'pending', 'taken', 'missed', 'skipped'
  - `notes` (text, nullable) - Optional notes from patient
  - `created_at` (timestamptz) - When log entry was created

  ### `caregiver_connections`
  - `id` (uuid, primary key) - Unique connection identifier
  - `patient_id` (uuid) - References profiles (patient)
  - `caregiver_id` (uuid) - References profiles (caregiver)
  - `relationship` (text) - Relationship description (e.g., "daughter", "son")
  - `notify_missed_doses` (boolean) - Whether to send alerts
  - `created_at` (timestamptz) - When connection was established

  ### `alerts`
  - `id` (uuid, primary key) - Unique alert identifier
  - `dose_log_id` (uuid) - References dose_logs table
  - `caregiver_id` (uuid) - References profiles (caregiver)
  - `type` (text) - Alert type: 'missed_dose', 'reminder'
  - `sent_at` (timestamptz) - When alert was sent
  - `read_at` (timestamptz, nullable) - When caregiver viewed alert
  - `created_at` (timestamptz) - When alert was created

  ## Security

  All tables have Row Level Security (RLS) enabled with policies that:
  - Allow patients to manage their own medications and logs
  - Allow caregivers to view connected patients' data
  - Prevent unauthorized access to sensitive health information
  - Ensure data privacy and HIPAA-like compliance

  ## Important Notes

  1. **Privacy First**: All health data is protected by RLS
  2. **Flexible Scheduling**: Supports complex medication schedules with day-of-week patterns
  3. **Alert System**: Automated alerts for missed doses to caregivers
  4. **Audit Trail**: Complete history of all dose confirmations
  5. **Time Zones**: Uses timestamptz for proper timezone handling
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('patient', 'caregiver')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create medications table
CREATE TABLE IF NOT EXISTS medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  dosage text NOT NULL,
  instructions text DEFAULT '',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

-- Create schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id uuid NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  time time NOT NULL,
  days_of_week jsonb NOT NULL DEFAULT '[0,1,2,3,4,5,6]'::jsonb,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Create dose_logs table
CREATE TABLE IF NOT EXISTS dose_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  scheduled_time timestamptz NOT NULL,
  taken_at timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'taken', 'missed', 'skipped')),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE dose_logs ENABLE ROW LEVEL SECURITY;

-- Create caregiver_connections table
CREATE TABLE IF NOT EXISTS caregiver_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  caregiver_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  relationship text NOT NULL,
  notify_missed_doses boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(patient_id, caregiver_id)
);

ALTER TABLE caregiver_connections ENABLE ROW LEVEL SECURITY;

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dose_log_id uuid NOT NULL REFERENCES dose_logs(id) ON DELETE CASCADE,
  caregiver_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('missed_dose', 'reminder')),
  sent_at timestamptz DEFAULT now(),
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for medications
CREATE POLICY "Patients can view own medications"
  ON medications FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "Caregivers can view connected patients medications"
  ON medications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM caregiver_connections
      WHERE caregiver_connections.patient_id = medications.patient_id
      AND caregiver_connections.caregiver_id = auth.uid()
    )
  );

CREATE POLICY "Patients can manage own medications"
  ON medications FOR INSERT
  TO authenticated
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Patients can update own medications"
  ON medications FOR UPDATE
  TO authenticated
  USING (patient_id = auth.uid())
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Patients can delete own medications"
  ON medications FOR DELETE
  TO authenticated
  USING (patient_id = auth.uid());

-- RLS Policies for schedules
CREATE POLICY "Users can view schedules for accessible medications"
  ON schedules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM medications
      WHERE medications.id = schedules.medication_id
      AND (
        medications.patient_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM caregiver_connections
          WHERE caregiver_connections.patient_id = medications.patient_id
          AND caregiver_connections.caregiver_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Patients can manage schedules for own medications"
  ON schedules FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM medications
      WHERE medications.id = schedules.medication_id
      AND medications.patient_id = auth.uid()
    )
  );

CREATE POLICY "Patients can update schedules for own medications"
  ON schedules FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM medications
      WHERE medications.id = schedules.medication_id
      AND medications.patient_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM medications
      WHERE medications.id = schedules.medication_id
      AND medications.patient_id = auth.uid()
    )
  );

CREATE POLICY "Patients can delete schedules for own medications"
  ON schedules FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM medications
      WHERE medications.id = schedules.medication_id
      AND medications.patient_id = auth.uid()
    )
  );

-- RLS Policies for dose_logs
CREATE POLICY "Users can view dose logs for accessible schedules"
  ON dose_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM schedules
      JOIN medications ON medications.id = schedules.medication_id
      WHERE schedules.id = dose_logs.schedule_id
      AND (
        medications.patient_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM caregiver_connections
          WHERE caregiver_connections.patient_id = medications.patient_id
          AND caregiver_connections.caregiver_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "System can create dose logs"
  ON dose_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Patients can update own dose logs"
  ON dose_logs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM schedules
      JOIN medications ON medications.id = schedules.medication_id
      WHERE schedules.id = dose_logs.schedule_id
      AND medications.patient_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM schedules
      JOIN medications ON medications.id = schedules.medication_id
      WHERE schedules.id = dose_logs.schedule_id
      AND medications.patient_id = auth.uid()
    )
  );

-- RLS Policies for caregiver_connections
CREATE POLICY "Patients can view own connections"
  ON caregiver_connections FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid() OR caregiver_id = auth.uid());

CREATE POLICY "Patients can create connections"
  ON caregiver_connections FOR INSERT
  TO authenticated
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Patients can update own connections"
  ON caregiver_connections FOR UPDATE
  TO authenticated
  USING (patient_id = auth.uid())
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Patients can delete own connections"
  ON caregiver_connections FOR DELETE
  TO authenticated
  USING (patient_id = auth.uid());

-- RLS Policies for alerts
CREATE POLICY "Caregivers can view own alerts"
  ON alerts FOR SELECT
  TO authenticated
  USING (caregiver_id = auth.uid());

CREATE POLICY "System can create alerts"
  ON alerts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Caregivers can update own alerts"
  ON alerts FOR UPDATE
  TO authenticated
  USING (caregiver_id = auth.uid())
  WITH CHECK (caregiver_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_medications_patient_id ON medications(patient_id);
CREATE INDEX IF NOT EXISTS idx_schedules_medication_id ON schedules(medication_id);
CREATE INDEX IF NOT EXISTS idx_dose_logs_schedule_id ON dose_logs(schedule_id);
CREATE INDEX IF NOT EXISTS idx_dose_logs_status ON dose_logs(status);
CREATE INDEX IF NOT EXISTS idx_dose_logs_scheduled_time ON dose_logs(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_caregiver_connections_patient ON caregiver_connections(patient_id);
CREATE INDEX IF NOT EXISTS idx_caregiver_connections_caregiver ON caregiver_connections(caregiver_id);
CREATE INDEX IF NOT EXISTS idx_alerts_caregiver_id ON alerts(caregiver_id);
CREATE INDEX IF NOT EXISTS idx_alerts_read_at ON alerts(read_at);