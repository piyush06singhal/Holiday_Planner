import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AttendanceProvider } from './contexts/AttendanceContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CalculatorPage from './pages/CalculatorPage';
import OverviewPage from './pages/OverviewPage';
import ChatBot from './components/ChatBot';
import Footer from './components/Footer';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AttendanceProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 via-pink-50 to-rose-50 transition-colors duration-300">
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/calculator" element={<CalculatorPage />} />
              <Route path="/overview" element={<OverviewPage />} />
            </Routes>
            <ChatBot />
            <Footer />
            <Toaster />
          </div>
        </Router>
      </AttendanceProvider>
    </QueryClientProvider>
  );
}

export default App;
