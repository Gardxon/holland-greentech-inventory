import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Loading from './Loading';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    loadProducts();
  }, [page]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products?skip=${page * 50}&limit=50`);
      setProducts(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Products Catalog</h2>
        <p className="text-gray-600">Browse all 197 products in the system</p>
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
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">SKU</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Product Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Pack Size</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Unit Price</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Reorder Level</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.sku || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{product.category || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{product.pack_size || '-'}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    {product.unit_price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{product.reorder_level}</td>
                  <td className="px-6 py-4 text-sm">
                    {product.is_active ? (
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
          disabled={products.length < 50}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg disabled:opacity-50 hover:bg-emerald-700 transition"
        >
          Next
        </button>
      </div>
    </div>
  );
}
