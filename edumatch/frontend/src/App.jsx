import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';

import Layout        from './components/Layout';
import Landing       from './pages/Landing';
import Auth          from './pages/Auth';
import NotFound      from './pages/NotFound';
import EtudiantDashboard from './pages/EtudiantDashboard';
import Profs             from './pages/Profs';
import Favoris           from './pages/Favoris';
import MesReservations   from './pages/MesReservations';
import Profile           from './pages/Profile';
import ProfDashboard     from './pages/ProfDashboard';
import Disponibilites    from './pages/Disponibilites';
import Admin             from './pages/Admin';
import Chatbot           from './pages/Chatbot';
import Paiement          from './pages/Paiement';

/* ── Garde : route privée avec vérification de rôle ── */
function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'var(--text2)' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:'2rem', marginBottom:12 }}>⏳</div>
        Chargement...
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

/* ── Route publique : redirige vers home si déjà connecté ── */
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) {
    if (user.role === 'professeur') return <Navigate to="/prof"  replace />;
    if (user.role === 'admin')      return <Navigate to="/admin" replace />;
    return <Navigate to="/home" replace />;
  }
  return children;
}

/* ── Route racine "/" : Landing si non connecté, redirect sinon ── */
function RootRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user)                      return <Landing />;
  if (user.role === 'professeur') return <Navigate to="/prof"  replace />;
  if (user.role === 'admin')      return <Navigate to="/admin" replace />;
  return <Navigate to="/home" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>

            {/* Pages sans sidebar */}
            <Route path="/" element={<RootRoute />} />
            <Route path="/login"    element={<PublicRoute><Auth mode="login"    /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Auth mode="register" /></PublicRoute>} />

            {/* Paiement — sans sidebar */}
            <Route path="/paiement/:id"
              element={<PrivateRoute roles={['étudiant']}><Paiement /></PrivateRoute>}
            />

            {/* Pages avec sidebar Layout */}
            <Route element={<Layout />}>

              {/* Dashboard étudiant */}
              <Route path="/home"
                element={<PrivateRoute roles={['étudiant']}><EtudiantDashboard /></PrivateRoute>}
              />

              {/* Étudiant */}
              <Route path="/profs"
                element={<PrivateRoute roles={['étudiant', 'admin']}><Profs /></PrivateRoute>}
              />
              <Route path="/favoris"
                element={<PrivateRoute roles={['étudiant']}><Favoris /></PrivateRoute>}
              />
              <Route path="/reservations"
                element={<PrivateRoute roles={['étudiant']}><MesReservations /></PrivateRoute>}
              />
              <Route path="/chatbot"
                element={<PrivateRoute roles={['étudiant']}><Chatbot /></PrivateRoute>}
              />

              {/* Professeur */}
              <Route path="/prof"
                element={<PrivateRoute roles={['professeur']}><ProfDashboard /></PrivateRoute>}
              />
              <Route path="/dispos"
                element={<PrivateRoute roles={['professeur']}><Disponibilites /></PrivateRoute>}
              />

              {/* Admin */}
              <Route path="/admin"
                element={<PrivateRoute roles={['admin']}><Admin /></PrivateRoute>}
              />

              {/* Commun */}
              <Route path="/profil"
                element={<PrivateRoute roles={['étudiant','professeur','admin']}><Profile /></PrivateRoute>}
              />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />

            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}