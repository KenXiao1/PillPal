import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  supabase,
  Medication,
  Schedule,
  DoseLog,
  CaregiverConnection,
  Profile,
} from '../lib/supabase';
import {
  Clock,
  Pill,
  Check,
  X,
  Plus,
  Calendar,
  Users,
  LogOut,
  BookOpen,
  Mail,
  UserPlus,
  AlertCircle,
  Bell,
  Loader2,
  ToggleRight,
  ToggleLeft,
  Trash2,
} from 'lucide-react';
import { HealthEducation } from './HealthEducation';

interface MedicationWithSchedule extends Medication {
  schedules: Schedule[];
}

interface UpcomingDose {
  id: string;
  medication: Medication;
  schedule: Schedule;
  scheduledTime: Date;
  doseLog?: DoseLog;
}

interface CaregiverConnectionWithProfile extends CaregiverConnection {
  caregiver_profile?: Pick<Profile, 'full_name' | 'email'>;
}

export function PatientDashboard() {
  const { profile, signOut } = useAuth();
  const [medications, setMedications] = useState<MedicationWithSchedule[]>([]);
  const [upcomingDoses, setUpcomingDoses] = useState<UpcomingDose[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [showHealthEducation, setShowHealthEducation] = useState(false);
  const [caregivers, setCaregivers] = useState<CaregiverConnectionWithProfile[]>([]);
  const [caregiversLoading, setCaregiversLoading] = useState(true);
  const [showAddCaregiver, setShowAddCaregiver] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [caregiverActionId, setCaregiverActionId] = useState<string | null>(null);
  const [caregiverError, setCaregiverError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!profile?.id) return;

    const fetchCaregivers = () => loadCaregivers(profile.id);
    fetchCaregivers();

    const interval = setInterval(fetchCaregivers, 60000);
    return () => clearInterval(interval);
  }, [profile?.id]);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

    return () => clearInterval(id);
  }, []);

  const loadData = async () => {
    try {
      const { data: meds, error: medsError } = await supabase
        .from('medications')
        .select('*, schedules(*)')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (medsError) throw medsError;

      setMedications(meds || []);
      await generateUpcomingDoses(meds || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCaregivers = async (patientId: string) => {
    try {
      setCaregiversLoading(true);
      const { data, error } = await supabase
        .from('caregiver_connections')
        .select(`
          id,
          caregiver_id,
          relationship,
          notify_missed_doses,
          created_at,
          caregiver_profile:profiles!caregiver_connections_caregiver_id_fkey(
            full_name,
            email
          )
        `)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCaregivers((data ?? []) as CaregiverConnectionWithProfile[]);
      setCaregiverError(null);
    } catch (error) {
      console.error('Error loading caregivers:', error);
      setCaregiverError('Unable to load caregivers right now');
    } finally {
      setCaregiversLoading(false);
    }
  };

  const generateUpcomingDoses = async (meds: MedicationWithSchedule[]) => {
    const now = new Date();
    const today = now.getDay();
    const doses: UpcomingDose[] = [];

    for (const med of meds) {
      for (const schedule of med.schedules.filter(s => s.active)) {
        const daysOfWeek = schedule.days_of_week as number[];
        if (!daysOfWeek.includes(today)) continue;

        const [hours, minutes] = schedule.time.split(':');
        const scheduledTime = new Date(now);
        scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        const { data: existingLog } = await supabase
          .from('dose_logs')
          .select('*')
          .eq('schedule_id', schedule.id)
          .gte('scheduled_time', scheduledTime.toISOString())
          .lt('scheduled_time', new Date(scheduledTime.getTime() + 60000).toISOString())
          .maybeSingle();

        if (!existingLog && scheduledTime.getTime() - now.getTime() < 3600000) {
          const { data: newLog } = await supabase
            .from('dose_logs')
            .insert({
              schedule_id: schedule.id,
              scheduled_time: scheduledTime.toISOString(),
              status: 'pending',
            })
            .select()
            .single();

          doses.push({
            id: schedule.id + scheduledTime.getTime(),
            medication: med,
            schedule,
            scheduledTime,
            doseLog: newLog || undefined,
          });
        } else if (existingLog) {
          doses.push({
            id: schedule.id + scheduledTime.getTime(),
            medication: med,
            schedule,
            scheduledTime,
            doseLog: existingLog,
          });
        }
      }
    }

    doses.sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());
    setUpcomingDoses(doses.slice(0, 5));
  };

  const markDoseTaken = async (dose: UpcomingDose) => {
    if (!dose.doseLog) return;

    try {
      const { error } = await supabase
        .from('dose_logs')
        .update({
          status: 'taken',
          taken_at: new Date().toISOString(),
        })
        .eq('id', dose.doseLog.id);

      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error('Error marking dose taken:', error);
    }
  };

  const markDoseSkipped = async (dose: UpcomingDose) => {
    if (!dose.doseLog) return;

    try {
      const { error } = await supabase
        .from('dose_logs')
        .update({ status: 'skipped' })
        .eq('id', dose.doseLog.id);

      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error('Error marking dose skipped:', error);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const weeklyMedicationCounts = useMemo(() => {
    const counts: Record<number, number> = {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
    };

    medications.forEach((med) => {
      med.schedules
        ?.filter((schedule) => schedule.active)
        .forEach((schedule) => {
          const days = (schedule.days_of_week || []) as number[];
          days.forEach((day) => {
            counts[day] = (counts[day] || 0) + 1;
          });
        });
    });

    return counts;
  }, [medications]);

  const doseStatusStyles: Record<
    DoseLog['status'],
    {
      border: string;
      background: string;
      dot: string;
      label: string;
      labelColor: string;
    }
  > = {
    pending: {
      border: 'border-teal-200',
      background: 'bg-white',
      dot: 'bg-teal-500 animate-pulse',
      label: 'Upcoming',
      labelColor: 'text-teal-600',
    },
    taken: {
      border: 'border-emerald-200',
      background: 'bg-emerald-50',
      dot: 'bg-emerald-500',
      label: 'Taken',
      labelColor: 'text-emerald-600',
    },
    skipped: {
      border: 'border-amber-200',
      background: 'bg-amber-50',
      dot: 'bg-amber-500',
      label: 'Skipped',
      labelColor: 'text-amber-600',
    },
    missed: {
      border: 'border-rose-200',
      background: 'bg-rose-50',
      dot: 'bg-rose-500',
      label: 'Missed',
      labelColor: 'text-rose-600',
    },
  };

  const handleToggleCaregiverNotifications = async (connectionId: string, currentValue: boolean) => {
    if (!profile?.id) return;

    try {
      setCaregiverActionId(connectionId);
      setCaregiverError(null);

      const { error } = await supabase
        .from('caregiver_connections')
        .update({ notify_missed_doses: !currentValue })
        .eq('id', connectionId);

      if (error) throw error;

      await loadCaregivers(profile.id);
    } catch (error) {
      console.error('Error updating caregiver notifications:', error);
      setCaregiverError('Unable to update notification preference');
    } finally {
      setCaregiverActionId(null);
    }
  };

  const handleRemoveCaregiver = async (connectionId: string) => {
    if (!profile?.id) return;

    try {
      setCaregiverActionId(connectionId);
      setCaregiverError(null);

      const { error } = await supabase
        .from('caregiver_connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;

      await loadCaregivers(profile.id);
    } catch (error) {
      console.error('Error removing caregiver:', error);
      setCaregiverError('Unable to remove caregiver right now');
    } finally {
      setCaregiverActionId(null);
    }
  };

  const handleCaregiverAdded = async () => {
    if (!profile?.id) return;
    await loadCaregivers(profile.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-cyan-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-teal-500 p-2 rounded-lg">
                <Pill className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">MediTrack</h1>
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
        {showHealthEducation ? (
          <div>
            <button
              onClick={() => setShowHealthEducation(false)}
              className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <X className="w-5 h-5" />
              Back to Dashboard
            </button>
            <HealthEducation />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="text-sm text-teal-600 font-semibold uppercase tracking-wide">
                      Today's Schedule
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      {currentDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </h2>
                  </div>
                  <div className="bg-teal-50 border border-teal-100 rounded-xl px-4 py-3 flex items-center gap-3">
                    <Clock className="w-5 h-5 text-teal-600" />
                    <div>
                      <div className="text-xs uppercase text-teal-600 tracking-wide">Current Time</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {currentDate.toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <WeeklyOverview counts={weeklyMedicationCounts} currentDay={currentDate.getDay()} />

                {upcomingDoses.length === 0 ? (
                  <div className="text-center py-16">
                    <Calendar className="w-20 h-20 text-gray-200 mx-auto mb-6" />
                    <p className="text-lg text-gray-600">You’re all caught up for today.</p>
                    <p className="text-sm text-gray-500 mt-2">Check back later for upcoming doses.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingDoses.map((dose) => {
                      const status = dose.doseLog?.status ?? 'pending';
                      const statusStyles = doseStatusStyles[status];

                      return (
                        <div
                          key={dose.id}
                          className={`border-2 rounded-2xl p-5 transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${statusStyles.border} ${statusStyles.background}`}
                        >
                          <div className="flex items-start gap-4 flex-1">
                            <div className={`mt-1 h-3 w-3 rounded-full ${statusStyles.dot}`}></div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {dose.medication.name}
                                </h3>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusStyles.labelColor} bg-white/70`}> 
                                  {statusStyles.label}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{dose.medication.dosage}</p>
                              {dose.medication.instructions && (
                                <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                  {dose.medication.instructions}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-3xl font-bold text-gray-900">
                                {formatTime(dose.scheduledTime)}
                              </div>
                              <div className="text-xs text-gray-500 uppercase tracking-wide">
                                {dose.scheduledTime.toLocaleString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })}
                              </div>
                            </div>

                            {status === 'pending' && (
                              <div className="flex flex-col gap-3 w-full sm:w-auto sm:flex-row">
                                <button
                                  onClick={() => markDoseTaken(dose)}
                                  className="flex-1 sm:flex-none sm:px-5 bg-teal-500 text-white py-2.5 rounded-lg font-medium hover:bg-teal-600 transition flex items-center justify-center gap-2"
                                >
                                  <Check className="w-5 h-5" />
                                  Taken
                                </button>
                                <button
                                  onClick={() => markDoseSkipped(dose)}
                                  className="flex-1 sm:flex-none sm:px-5 border-2 border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
                                >
                                  <X className="w-5 h-5" />
                                  Skip
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">My Medications</h2>
                  <button
                    onClick={() => setShowAddMedication(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>

                {medications.length === 0 ? (
                  <div className="text-center py-8">
                    <Pill className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm">No medications yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {medications.map((med) => (
                      <div
                        key={med.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-teal-300 transition"
                      >
                        <h3 className="font-semibold text-gray-900">{med.name}</h3>
                        <p className="text-sm text-gray-600">{med.dosage}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {med.schedules.length} schedule{med.schedules.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <CaregiversPanel
                caregivers={caregivers}
                loading={caregiversLoading}
                onAdd={() => setShowAddCaregiver(true)}
                onToggleNotifications={handleToggleCaregiverNotifications}
                onRemove={handleRemoveCaregiver}
                actionId={caregiverActionId}
                error={caregiverError}
              />

              <div className="bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl shadow-sm p-6 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <BookOpen className="w-6 h-6" />
                  <h3 className="text-lg font-bold">Health Education</h3>
                </div>
                <p className="text-sm text-teal-50 mb-4">
                  Learn about managing your conditions, healthy living tips, diet advice, and safe exercise routines.
                </p>
                <button
                  onClick={() => setShowHealthEducation(true)}
                  className="w-full px-4 py-2 bg-white text-teal-600 rounded-lg font-medium hover:bg-teal-50 transition"
                >
                  Explore Articles
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {showAddMedication && (
        <AddMedicationModal
          onClose={() => setShowAddMedication(false)}
          onSuccess={loadData}
        />
      )}

      {showAddCaregiver && profile?.id && (
        <AddCaregiverModal
          onClose={() => setShowAddCaregiver(false)}
          onAdded={handleCaregiverAdded}
        />
      )}
    </div>
  );
}

function AddMedicationModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('');
  const [time, setTime] = useState('08:00');
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [loading, setLoading] = useState(false);

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const toggleDay = (day: number) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { data: medication, error: medError } = await supabase
        .from('medications')
        .insert({
          patient_id: user.id,
          name,
          dosage,
          instructions,
          active: true,
        })
        .select()
        .single();

      if (medError) throw medError;

      const { error: scheduleError } = await supabase
        .from('schedules')
        .insert({
          medication_id: medication.id,
          time,
          days_of_week: selectedDays,
          active: true,
        });

      if (scheduleError) throw scheduleError;

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding medication:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Medication</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medication Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dosage
            </label>
            <input
              type="text"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="e.g., 10mg, 1 tablet"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instructions
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Take with food, etc."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Days
            </label>
            <div className="flex gap-2">
              {days.map((day, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => toggleDay(index)}
                  className={`flex-1 py-2 rounded-lg font-medium transition ${
                    selectedDays.includes(index)
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Medication'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function WeeklyOverview({ counts, currentDay }: { counts: Record<number, number>; currentDay: number }) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Weekly Outlook</div>
        <div className="text-xs text-gray-500">Scheduled doses by day</div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {days.map((label, index) => {
          const count = counts[index] ?? 0;
          const isToday = currentDay === index;
          return (
            <div
              key={label}
              className={`rounded-xl border px-4 py-3 flex flex-col gap-2 transition ${
                isToday
                  ? 'border-teal-400 bg-teal-50 text-teal-800 shadow-sm'
                  : 'border-gray-200 bg-white text-gray-700'
              }`}
            >
              <div className="text-xs font-medium uppercase tracking-wide">{label}</div>
              <div className="text-2xl font-semibold">{count}</div>
              <div className="text-xs text-gray-500">doses</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface CaregiversPanelProps {
  caregivers: CaregiverConnectionWithProfile[];
  loading: boolean;
  onAdd: () => void;
  onToggleNotifications: (connectionId: string, currentValue: boolean) => Promise<void> | void;
  onRemove: (connectionId: string) => Promise<void> | void;
  actionId: string | null;
  error: string | null;
}

function CaregiversPanel({
  caregivers,
  loading,
  onAdd,
  onToggleNotifications,
  onRemove,
  actionId,
  error,
}: CaregiversPanelProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-gray-700" />
            <h2 className="text-xl font-bold text-gray-900">Caregivers</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Share your schedule to keep family informed and optionally notify them about missed doses.
          </p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-3 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600 transition"
        >
          <UserPlus className="w-4 h-4" />
          Add
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading caregivers...
        </div>
      ) : caregivers.length === 0 ? (
        <div className="text-center border-2 border-dashed border-gray-200 rounded-xl py-10 px-4 text-sm text-gray-500">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          No caregivers connected yet.
        </div>
      ) : (
        <div className="space-y-3">
          {caregivers.map((connection) => {
            const caregiver = connection.caregiver_profile;
            const isProcessing = actionId === connection.id;

            return (
              <div
                key={connection.id}
                className="border border-gray-200 rounded-xl px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">
                      {caregiver?.full_name ?? 'Caregiver'}
                    </p>
                    {connection.notify_missed_doses ? (
                      <span className="text-xs text-teal-600 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Bell className="w-3 h-3" /> Alerts on
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
                        Alerts off
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{caregiver?.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Relationship: {connection.relationship}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleNotifications(connection.id, connection.notify_missed_doses)}
                    disabled={isProcessing}
                    className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm font-medium transition ${
                      connection.notify_missed_doses
                        ? 'border-teal-200 text-teal-600 hover:bg-teal-50'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    } ${isProcessing ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {connection.notify_missed_doses ? (
                      <ToggleRight className="w-4 h-4" />
                    ) : (
                      <ToggleLeft className="w-4 h-4" />
                    )}
                    {connection.notify_missed_doses ? 'Disable Alerts' : 'Enable Alerts'}
                  </button>

                  <button
                    onClick={() => onRemove(connection.id)}
                    disabled={isProcessing}
                    className={`flex items-center gap-2 border border-red-200 text-red-600 rounded-lg px-3 py-2 text-sm font-medium hover:bg-red-50 transition ${
                      isProcessing ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                  >
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AddCaregiverModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('Family');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail) {
        setError('Please provide a caregiver email.');
        setLoading(false);
        return;
      }

      const { data: caregiverProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .eq('email', normalizedEmail)
        .eq('role', 'caregiver')
        .maybeSingle();

      if (profileError) throw profileError;

      if (!caregiverProfile) {
        setError('Caregiver account not found. Ask them to sign up first.');
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase.from('caregiver_connections').insert({
        patient_id: user.id,
        caregiver_id: caregiverProfile.id,
        relationship: relationship || 'Caregiver',
        notify_missed_doses: true,
      });

      if (insertError) {
        if ((insertError as any).code === '23505') {
          setError('This caregiver is already connected.');
        } else {
          throw insertError;
        }
        setLoading(false);
        return;
      }

      await onAdded();
      onClose();
    } catch (err) {
      console.error('Error adding caregiver:', err);
      setError('Unable to add caregiver right now. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <UserPlus className="w-5 h-5 text-teal-600" />
            <h2 className="text-xl font-semibold text-gray-900">Add Caregiver</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Invite a caregiver so they can monitor your medication schedule and receive notifications when doses are missed.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Caregiver Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="caregiver@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
            <input
              type="text"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="e.g., Daughter, Son, Nurse"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Add Caregiver
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
