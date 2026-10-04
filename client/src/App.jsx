import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SimulatorProvider } from './context/SimulatorContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Groups from './pages/Groups';
import Matches from './pages/Matches';
import Knockout from './pages/Knockout';
import Leaderboard from './pages/Leaderboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <SimulatorProvider>
      <BrowserRouter>
        <div className="App">
          <Toaster position="top-right" />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/knockout" element={<Knockout />} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
      </SimulatorProvider>
    </AuthProvider>
  );
}

export default App;
