import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import CheckoutPage from './components/CheckoutPage';
import LoginForm from './components/LoginForm';
import { AdminSettings } from './types';

// Acessa a chave da API diretamente das variáveis de ambiente injetadas pelo Vite
const pixUpApiKey = process.env.PIXUP_API_KEY || '';

const App: React.FC = () => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('admin_session') === 'true';
  });

  const [settings, setSettings] = useState<AdminSettings>(() => {
    const saved = localStorage.getItem('app_settings');
    const existingSettings = saved ? JSON.parse(saved) : {};
    
    // Define a apiKey a partir do .env e mantém as outras configurações salvas
    return {
      ...existingSettings,
      apiKey: pixUpApiKey, // Sempre usa a chave do .env
      adminPassword: existingSettings.adminPassword || '7dbappe-staff'
    };
  });

  useEffect(() => {
    // Garante que a apiKey no estado sempre reflita a do .env
    const currentSettings = { ...settings, apiKey: pixUpApiKey };
    localStorage.setItem('app_settings', JSON.stringify(currentSettings));
  }, [settings.adminPassword]); // Dependência alterada para evitar salvar a chave antiga

  const handleLogin = (password: string) => {
    if (password === settings.adminPassword) {
      setIsAdminAuthenticated(true);
      localStorage.setItem('admin_session', 'true');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('admin_session');
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50">
        <Routes>
          <Route 
            path="/admin" 
            element={
              isAdminAuthenticated ? (
                <AdminDashboard 
                  settings={settings} 
                  setSettings={setSettings} 
                  onLogout={handleLogout} 
                />
              ) : (
                <LoginForm onLogin={handleLogin} />
              )
            } 
          />
          <Route path="/checkout/:intentId" element={<CheckoutPage settings={settings} />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default App;
