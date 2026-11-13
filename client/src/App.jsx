import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { FarmProvider } from './context/FarmContext';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';

import { Dashboard } from './pages/Dashboard';
import { CropRecommendation } from './pages/CropRecommendation';
import { SoilHealth } from './pages/SoilHealth';
import { FertilizerAdvisory } from './pages/FertilizerAdvisory';
import { IrrigationAdvisory } from './pages/IrrigationAdvisory';
import { DiseaseDetection } from './pages/DiseaseDetection';
import { WeatherStation } from './pages/WeatherStation';
import { AIChatAssistant } from './pages/AIChatAssistant';
import { FarmingCalendarPage } from './pages/FarmingCalendarPage';
import { FarmManagement } from './pages/FarmManagement';
import { AdvisoryHistoryPage } from './pages/AdvisoryHistoryPage';
import { FarmerProfile } from './pages/FarmerProfile';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <LanguageProvider>
      <AuthProvider>
        <FarmProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col bg-stone-50 font-sans antialiased text-stone-900">
              {/* Top Navigation Bar */}
              <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

              {/* Main App Layout */}
              <div className="flex-1 flex overflow-hidden">
                {/* Desktop & Mobile Responsive Sidebar */}
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                {/* Primary Content Scroll Area */}
                <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/crop-recommendation" element={<CropRecommendation />} />
                    <Route path="/soil-health" element={<SoilHealth />} />
                    <Route path="/fertilizer" element={<FertilizerAdvisory />} />
                    <Route path="/irrigation" element={<IrrigationAdvisory />} />
                    <Route path="/disease-detection" element={<DiseaseDetection />} />
                    <Route path="/weather" element={<WeatherStation />} />
                    <Route path="/chat" element={<AIChatAssistant />} />
                    <Route path="/calendar" element={<FarmingCalendarPage />} />
                    <Route path="/farms" element={<FarmManagement />} />
                    <Route path="/history" element={<AdvisoryHistoryPage />} />
                    <Route path="/profile" element={<FarmerProfile />} />
                  </Routes>
                </main>
              </div>

              {/* Mobile Bottom Navigation Bar */}
              <BottomNav />
            </div>
          </BrowserRouter>
        </FarmProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
