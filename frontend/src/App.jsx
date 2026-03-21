import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EditorPage from './pages/EditorPage';
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';
import Navbar from './components/Navbar';
import Breadcrumbs from './components/Breadcrumbs';
import { useState, useEffect } from 'react';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  return token ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  return token ? <Navigate to="/dashboard" /> : children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-indigo-500/30">
        <Navbar />
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {/* Global Background Elements */}
          <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
          </div>

          <Routes>
            <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/pricing" element={<PricingPage />} />
            
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <div className="container mx-auto px-6 py-12 relative z-10 max-w-6xl">
                    <Breadcrumbs />
                    <Dashboard />
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/editor/:projectId?"
              element={
                <PrivateRoute>
                  <div className="container mx-auto px-6 py-12 relative z-10 max-w-7xl h-full">
                    <Breadcrumbs />
                    <EditorPage />
                  </div>
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
