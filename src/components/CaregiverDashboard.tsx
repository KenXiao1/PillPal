import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Medication, DoseLog, Alert, Profile } from '../lib/supabase';
import { Users, Bell, Clock, CheckCircle, XCircle, Pill, LogOut, AlertTriangle } from 'lucide-react';

interface PatientWithMedications extends Profile {
  medications?: Medication[];
  missedDoses?: number;
  todayCompliance?: number;
  relationship?: string;
}

interface AlertWithDetails extends Alert {
  dose_log?: DoseLog & {
    schedule?: {
      medication?: Medication;
    };
  };
  patient?: Profile;
}

export function CaregiverDashboard() {
  const { profile, signOut } = useAuth();
  const [patients, setPatients] = useState<PatientWithMedications[]>([]);
  const [alerts, setAlerts] = useState<AlertWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const { data: connections, error: connectionsError } = await supabase
        .from('caregiver_connections')
        .select(`
          patient_id,
          relationship,
          profiles!caregiver_connections_patient_id_fkey(*)
        `)
        .eq('caregiver_id', profile?.id);

      if (connectionsError) throw connectionsError;

      const patientsData: PatientWithMedications[] = [];

      for (const connection of connections || []) {
        const patient = (connection as any).profiles;
        const relationship = (connection as any).relationship;

        const { data: medications } = await supabase
          .from('medications')
          .select('*')
          .eq('patient_id', patient.id)
          .eq('active', true);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data: doseLogs } = await supabase
          .from('dose_logs')
          .select(`
            *,
            schedules!inner(
              medication_id,
              medications!inner(patient_id)
            )
          `)
          .gte('scheduled_time', today.toISOString())
          .eq('schedules.medications.patient_id', patient.id);

        const totalDoses = doseLogs?.length || 0;
        const takenDoses = doseLogs?.filter(log => log.status === 'taken').length || 0;
        const missedDoses = doseLogs?.filter(log => log.status === 'missed').length || 0;

        patientsData.push({
          ...patient,
          medications: medications || [],
          missedDoses,
          todayCompliance: totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100,
          relationship,
        });
      }

      setPatients(patientsData);

      const { data: alertsData, error: alertsError } = await supabase
        .from('alerts')
        .select(`
          *,
          dose_logs!inner(
            *,
            schedules!inner(
              *,
              medications(*)
            )
          )
        `)
        .eq('caregiver_id', profile?.id)
        .is('read_at', null)
        .order('sent_at', { ascending: false })
        .limit(10);

      if (alertsError) throw alertsError;

      const enrichedAlerts: AlertWithDetails[] = [];
      for (const alert of alertsData || []) {
        const doseLog = (alert as any).dose_logs;
        const medication = doseLog?.schedules?.medications;

        const { data: patientData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', medication?.patient_id)
          .maybeSingle();

        enrichedAlerts.push({
          ...alert,
          dose_log: doseLog ? {
            ...doseLog,
            schedule: {
              ...doseLog.schedules,
              medication: medication,
            },
          } : undefined,
          patient: patientData || undefined,
        });
      }

      setAlerts(enrichedAlerts);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAlertRead = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ read_at: new Date().toISOString() })
        .eq('id', alertId);

      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error('Error marking alert read:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-2 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">MediTrack Caregiver</h1>
                <p className="text-sm text-gray-600">{profile?.full_name}</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Patients Overview</h2>

              {patients.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No patients connected yet</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Ask a patient to add you as their caregiver
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {patients.map((patient) => (
                    <div
                      key={patient.id}
                      className="border-2 border-gray-200 rounded-xl p-5 hover:border-blue-300 transition"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {patient.full_name}
                          </h3>
                          <p className="text-sm text-gray-600">{patient.email}</p>
                          {patient.relationship && (
                            <p className="text-xs text-blue-600 font-medium mt-1">
                              Relationship: {patient.relationship}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            {patient.todayCompliance}%
                          </div>
                          <p className="text-xs text-gray-600">Compliance Today</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Pill className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700">
                              Medications
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-blue-600">
                            {patient.medications?.length || 0}
                          </div>
                        </div>

                        <div className={`rounded-lg p-3 ${
                          (patient.missedDoses || 0) > 0 ? 'bg-red-50' : 'bg-green-50'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            {(patient.missedDoses || 0) > 0 ? (
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                            <span className="text-sm font-medium text-gray-700">
                              Missed Today
                            </span>
                          </div>
                          <div className={`text-2xl font-bold ${
                            (patient.missedDoses || 0) > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {patient.missedDoses || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-5 h-5 text-gray-700" />
                <h2 className="text-xl font-bold text-gray-900">Alerts</h2>
                {alerts.length > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    {alerts.length}
                  </span>
                )}
              </div>

              {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm">All patients on track!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => {
                    const medication = alert.dose_log?.schedule?.medication;
                    const scheduledTime = alert.dose_log?.scheduled_time
                      ? new Date(alert.dose_log.scheduled_time)
                      : null;

                    return (
                      <div
                        key={alert.id}
                        className="border-l-4 border-red-500 bg-red-50 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              {alert.patient?.full_name}
                            </h3>
                            <p className="text-sm text-gray-700">
                              Missed: {medication?.name}
                            </p>
                            {scheduledTime && (
                              <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {scheduledTime.toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => markAlertRead(alert.id)}
                            className="text-gray-500 hover:text-gray-700 transition"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-sm p-6 text-white">
              <h3 className="text-lg font-bold mb-2">Stay Connected</h3>
              <p className="text-sm text-blue-50 mb-4">
                Monitor your loved ones' medication compliance and receive instant alerts when
                they miss a dose.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-5 h-5" />
                <span>Real-time notifications</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
