import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthForm } from './components/AuthForm';
import { PatientDashboard } from './components/PatientDashboard';
import { CaregiverDashboard } from './components/CaregiverDashboard';
import { AdvertisementPage } from './components/AdvertisementPage';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [showApp, setShowApp] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user || !profile) {
    if (!showApp) {
      return <AdvertisementPage onGetStarted={() => setShowApp(true)} />;
    }
    return <AuthForm onBack={() => setShowApp(false)} />;
  }

  if (profile.role === 'patient') {
    return <PatientDashboard />;
  }

  if (profile.role === 'caregiver') {
    return <CaregiverDashboard />;
  }

  return null;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
