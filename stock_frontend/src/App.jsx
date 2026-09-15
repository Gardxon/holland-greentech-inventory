import React, { useState, useEffect } from 'react';
import api from './services/api';
import ProfessionalLayout from './components/ProfessionalLayout';
import Dashboard from './components/Dashboard';
import Branches from './components/Branches';
import Products from './components/Products';
import Inventory from './components/Inventory';
import StockTransfer from './components/StockTransfer';
import History from './components/History';
import Sales from './components/Sales';
import StockRequests from './components/StockRequests';
import Admin from './components/Admin';
import Customers from './components/Customers';

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
        api.get('/movements/')
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
    { id: 'customers', label: '👥 Customers', icon: '👥' },
    { id: 'history', label: '📜 History', icon: '📜' },
    { id: 'admin', label: '⚙️ Admin', icon: '⚙️' }
  ];

  return (
    <ProfessionalLayout activeTab={activeTab} onTabChange={setActiveTab} stats={stats}>
      {error && (
        <div style={{ backgroundColor: 'var(--critical-soft)', border: '1px solid var(--critical)', color: 'var(--critical)', padding: '16px 12px', borderRadius: '8px', marginBottom: '24px' }}>
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
      {activeTab === 'customers' && <Customers />}
      {activeTab === 'history' && <History />}
      {activeTab === 'admin' && <Admin />}
    </ProfessionalLayout>
  );
}
