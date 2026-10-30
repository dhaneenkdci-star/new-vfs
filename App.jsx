import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

const GlobalHome = lazy(() => import('./pages/GlobalHome'));
const CentreDetails = lazy(() => import('./pages/CentreDetails'));
const InfoPage = lazy(() => import('./pages/InfoPage'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const BookAppointment = lazy(() => import('./pages/BookAppointment'));
const TrackApplication = lazy(() => import('./pages/TrackApplication'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AgentDashboard = lazy(() => import('./pages/AgentDashboard'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));

const LoadingFallback = () => (
  <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    Loading page...
  </div>
);

function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main style={{ flexGrow: 1 }}>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<GlobalHome />} />
            <Route path="/attend-centre/:city" element={<CentreDetails />} />
            <Route path="/attend-centre" element={<CentreDetails />} />
            <Route path="/attend-centre/" element={<CentreDetails />} />
            <Route path="/info/:pageKey" element={<InfoPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/book" element={<BookAppointment />} />
            <Route path="/track" element={<TrackApplication />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin-dashboard" element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/agent-dashboard" element={
              <ProtectedRoute>
                <AgentDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default App;
