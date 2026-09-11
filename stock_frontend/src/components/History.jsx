import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Loading from './Loading';

export default function History() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    loadHistory();
  }, [page]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/movements?skip=${page * 50}&limit=50`);
      setMovements(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load movement history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Stock Movement History</h2>
        <p className="text-gray-600">Complete transaction log with timestamps</p>
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
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">From Branch</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">To Branch</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Product</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Quantity</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {movements.length > 0 ? (
                movements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(movement.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">
                        {movement.movement_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{movement.from_branch?.name || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{movement.to_branch?.name || '-'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{movement.product?.sku}</td>
                    <td className="px-6 py-4 text-sm font-bold text-emerald-600">{movement.quantity}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{movement.reference_number || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No movement history available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page === 0}
          className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
        >
          Previous
        </button>
        <span className="px-4 py-2 text-gray-600">Page {page + 1}</span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={movements.length < 50}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg disabled:opacity-50 hover:bg-emerald-700 transition"
        >
          Next
        </button>
      </div>
    </div>
  );
}
