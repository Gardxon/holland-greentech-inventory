import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Loading from './Loading';

export default function Inventory() {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      loadInventory();
    }
  }, [selectedBranch]);

  const loadBranches = async () => {
    try {
      const response = await api.get('/branches');
      setBranches(response.data);
      if (response.data.length > 0) {
        setSelectedBranch(response.data[0].id);
      }
    } catch (err) {
      setError('Failed to load branches');
      console.error(err);
    }
  };

  const loadInventory = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/inventory/branch/${selectedBranch}`);
      setInventory(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load inventory');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !selectedBranch) return <Loading />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Stock Levels by Branch</h2>
        <p className="text-gray-600">Real-time inventory for each branch</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <label className="block text-sm font-medium text-gray-900 mb-2">Select Branch:</label>
        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Choose a branch...</option>
          {branches.map(branch => (
            <option key={branch.id} value={branch.id}>{branch.name}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md p-4">
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">SKU</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Product Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Quantity On Hand</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {inventory.filter(item => {
                    const sku = (item.product_sku || item.product?.sku || '').toLowerCase();
                    const name = (item.product_name || item.product?.name || '').toLowerCase();
                    const search = searchTerm.toLowerCase();
                    return sku.includes(search) || name.includes(search);
                  }).length > 0 ? (
                    inventory.filter(item => {
                      const sku = (item.product_sku || item.product?.sku || '').toLowerCase();
                      const name = (item.product_name || item.product?.name || '').toLowerCase();
                      const search = searchTerm.toLowerCase();
                      return sku.includes(search) || name.includes(search);
                    }).map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.product_sku || item.product?.sku || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{item.product_name || item.product?.name || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm font-bold text-emerald-600">{item.quantity_on_hand}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(item.last_updated).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                        {inventory.length === 0 ? 'No inventory data for this branch' : 'No products match your search'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
