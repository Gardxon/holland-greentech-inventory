import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Loading from './Loading';

export default function Branches() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      setLoading(true);
      const response = await api.get('/branches');
      setBranches(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load branches');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Branches Management</h2>
        <p className="text-gray-600">View all warehouse and sub-branch locations</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Branch Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Location</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {branches.map((branch) => (
                <tr key={branch.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-900">{branch.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{branch.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{branch.location}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-block px-3 py-1 rounded-full text-white text-xs font-semibold ${
                      branch.branch_type === 'warehouse'
                        ? 'bg-emerald-600'
                        : 'bg-orange-600'
                    }`}>
                      {branch.branch_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {branch.is_active ? (
                      <span className="text-green-600 font-semibold">✓ Active</span>
                    ) : (
                      <span className="text-red-600 font-semibold">✗ Inactive</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
