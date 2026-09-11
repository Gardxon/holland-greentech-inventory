import React, { useState, useEffect } from 'react';
import api from './services/api';
import Dashboard from './components/Dashboard';
import Branches from './components/Branches';
import Products from './components/Products';
import Inventory from './components/Inventory';
import StockTransfer from './components/StockTransfer';
import History from './components/History';
import Sales from './components/Sales';
import StockRequests from './components/StockRequests';
import Admin from './components/Admin';

export default function App() {
  // Version 2.0 - Enhanced with Sales & Stock Requests
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ branches: 0, products: 0, movements: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [branchesRes, productsRes, movementsRes] = await Promise.all([
        api.get('/branches'),
        api.get('/products'),
        api.get('/movements')
      ]);

      setStats({
        branches: branchesRes.data.length,
        products: productsRes.data.length,
        movements: movementsRes.data.length
      });
      setError(null);
    } catch (err) {
      setError('Failed to load statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
    { id: 'branches', label: '🏢 Branches', icon: '🏢' },
    { id: 'products', label: '📦 Products', icon: '📦' },
    { id: 'inventory', label: '📈 Inventory', icon: '📈' },
    { id: 'sales', label: '🛒 Sales', icon: '🛒' },
    { id: 'requests', label: '📋 Requests', icon: '📋' },
    { id: 'transfers', label: '🔄 Transfers', icon: '🔄' },
    { id: 'history', label: '📜 History', icon: '📜' },
    { id: 'admin', label: '⚙️ Admin', icon: '⚙️' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-md">
              <img
                id="logo"
                src="/logo.png"
                alt="HGT Logo"
                className="w-14 h-14 object-contain"
              />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">📦 HGT Stock & Sales Management System</h1>
              <p className="text-green-100">HGT Inventory Control - Central Dashboard</p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-4 font-medium transition-colors whitespace-nowrap border-b-2 ${
                  activeTab === tab.id
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {activeTab === 'dashboard' && <Dashboard stats={stats} loading={loading} />}
        {activeTab === 'branches' && <Branches />}
        {activeTab === 'products' && <Products />}
        {activeTab === 'inventory' && <Inventory />}
        {activeTab === 'sales' && <Sales />}
        {activeTab === 'requests' && <StockRequests />}
        {activeTab === 'transfers' && <StockTransfer />}
        {activeTab === 'history' && <History />}
        {activeTab === 'admin' && <Admin />}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 text-center py-6 mt-12">
        <p>© 2025 Stock Management System. All rights reserved.</p>
      </footer>
    </div>
  );
}
