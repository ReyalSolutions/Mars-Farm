import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MissionProvider } from './context/MissionContext';
import { AudioProvider } from './context/AudioContext';
import { ToastProvider } from './components/ui/Toast';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MissionLayout } from './components/layout/MissionLayout';

import { LandingPage } from './pages/LandingPage';
import { LocationSelect } from './pages/LocationSelect';
import { MissionSetup } from './pages/MissionSetup';
import { CropSelection } from './pages/CropSelection';
import { FarmBuilder } from './pages/FarmBuilder';
import { SimulationView } from './pages/SimulationView';
import { ResultsPage } from './pages/ResultsPage';
import { SciencePage } from './pages/SciencePage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { SolarSystemView } from './pages/SolarSystemView';
import { AiFarmAdvisorFab } from './components/ui/AiFarmAdvisorFab';

export const App: React.FC = () => {
  return (
    <ToastProvider>
    <AudioProvider>
      <MissionProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-space-950 text-slate-100 font-sans selection:bg-mars-500 selection:text-white">
            <Navbar />
            <div className="flex-1">
              <Routes>
                {/* Landing & Public Pages */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/solar-system" element={<SolarSystemView />} />
                <Route path="/science" element={<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><SciencePage /></div>} />
                <Route path="/leaderboard" element={<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><LeaderboardPage /></div>} />

                {/* Mission Wizard Routes */}
                <Route path="/mission" element={<MissionLayout />}>
                  <Route index element={<Navigate to="/mission/location" replace />} />
                  <Route path="location" element={<LocationSelect />} />
                  <Route path="setup" element={<MissionSetup />} />
                  <Route path="crops" element={<CropSelection />} />
                  <Route path="farm" element={<FarmBuilder />} />
                  <Route path="simulation" element={<SimulationView />} />
                  <Route path="results" element={<ResultsPage />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
            <AiFarmAdvisorFab />
            <Footer />
          </div>
        </BrowserRouter>
      </MissionProvider>
    </AudioProvider>
    </ToastProvider>
  );
};

export default App;
