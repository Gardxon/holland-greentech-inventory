import React, { useState, useEffect } from 'react';
import Loading from './Loading';
import { apiClient } from '../services/api';

export default function Dashboard({ stats, loading: initialLoading }) {
  const [dashStats, setDashStats] = useState(null);
  const [loading, setLoading] = useState(initialLoading);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getDashboardStats();
      setDashStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = (exportFn, filename) => {
    exportFn()
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.parentElement.removeChild(link);
      })
      .catch(error => console.error('Download failed:', error));
  };

  if (loading) return <Loading />;

  const statCards = [
    { label: 'Total Branches', value: stats?.branches || 0, color: 'from-emerald-500 to-emerald-600', icon: '🏢' },
    { label: 'Total Products', value: stats?.products || 0, color: 'from-green-500 to-green-600', icon: '📦' },
    { label: 'Stock Units', value: dashStats?.total_stock_units || 0, color: 'from-teal-500 to-teal-600', icon: '📊' },
    { label: 'Stock Value', value: `TZS ${dashStats?.total_stock_value?.toLocaleString() || 0}`, color: 'from-lime-500 to-lime-600', icon: '💰' },
    { label: 'Transfers', value: dashStats?.total_movements || 0, color: 'from-cyan-500 to-cyan-600', icon: '🔄' },
    { label: 'Sales', value: dashStats?.total_sales || 0, color: 'from-green-600 to-emerald-700', icon: '🛒' }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Stock Management</h2>
        <p className="text-gray-600">Real-time inventory, sales, and stock management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, idx) => (
          <div key={idx} className={`bg-gradient-to-r ${card.color} rounded-lg shadow-lg p-4 text-white text-center`}>
            <div className="text-3xl mb-2">{card.icon}</div>
            <p className="text-xs font-medium opacity-90">{card.label}</p>
            <p className="text-xl font-bold mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Low Stock Alert */}
      {dashStats?.low_stock_items && dashStats.low_stock_items.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded">
          <h3 className="text-lg font-bold text-yellow-800 mb-4">⚠️ Low Stock Alert</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dashStats.low_stock_items.slice(0, 6).map((item, idx) => (
              <div key={idx} className="bg-white p-3 rounded border border-yellow-200">
                <p className="font-semibold text-gray-900">{item.product_name}</p>
                <p className="text-sm text-gray-600">{item.sku}</p>
                <p className="text-sm mt-1">
                  <span className="text-red-600 font-bold">{item.quantity_on_hand}</span>
                  <span className="text-gray-600"> units (Reorder: {item.reorder_level})</span>
                </p>
                <p className="text-xs text-gray-500">at {item.branch}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">System Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border-l-4 border-emerald-500 pl-4">
            <h4 className="font-semibold text-gray-900 mb-2">📊 Inventory Tracking</h4>
            <p className="text-gray-600 text-sm">Real-time stock levels with product details and valuations</p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-semibold text-gray-900 mb-2">🛒 Sales Management</h4>
            <p className="text-gray-600 text-sm">Record sales, track revenue, and manage stock automatically</p>
          </div>
          <div className="border-l-4 border-purple-500 pl-4">
            <h4 className="font-semibold text-gray-900 mb-2">📦 Stock Requests</h4>
            <p className="text-gray-600 text-sm">Request and approve stock transfers between branches</p>
          </div>
        </div>
      </div>

      {/* Downloads */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">📥 Export Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => downloadCSV(apiClient.exportInventoryCSV, 'inventory_report.csv')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            Download Inventory Report
          </button>
          <button
            onClick={() => downloadCSV(() => apiClient.exportSalesCSV(30), 'sales_report_30days.csv')}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            Download Sales Report
          </button>
          <button
            onClick={() => downloadCSV(apiClient.exportMovementsCSV, 'movements_report.csv')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            Download Movements Report
          </button>
        </div>
      </div>
    </div>
  );
}
