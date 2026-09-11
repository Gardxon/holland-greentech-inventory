import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Loading from './Loading';

export default function StockTransfer() {
  const [branches, setBranches] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    from_branch_id: '',
    to_branch_id: '',
    product_id: '',
    quantity: '',
    reference_number: '',
    notes: ''
  });
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    if (formData.from_branch_id) {
      loadAvailableProducts();
    }
  }, [formData.from_branch_id]);

  const loadBranches = async () => {
    try {
      setLoading(true);
      const response = await api.get('/branches');
      setBranches(response.data);
    } catch (err) {
      setError('Failed to load branches');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableProducts = async () => {
    try {
      const response = await api.get(`/inventory/branch/${formData.from_branch_id}`);
      setAvailableProducts(response.data.filter(item => item.quantity_on_hand > 0));
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || '' : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.from_branch_id || !formData.to_branch_id || !formData.product_id || !formData.quantity) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.quantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/movements?user_id=1', {
        product_id: parseInt(formData.product_id),
        from_branch_id: parseInt(formData.from_branch_id),
        to_branch_id: parseInt(formData.to_branch_id),
        quantity: parseInt(formData.quantity),
        movement_type: 'transfer',
        reference_number: formData.reference_number,
        notes: formData.notes
      });

      setSuccess('Transfer logged successfully!');
      setFormData({
        from_branch_id: '',
        to_branch_id: '',
        product_id: '',
        quantity: '',
        reference_number: '',
        notes: ''
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to log transfer');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Log Stock Transfer</h2>
        <p className="text-gray-600">Record inventory movements between branches</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">From Branch *</label>
            <select
              name="from_branch_id"
              value={formData.from_branch_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select branch...</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">To Branch *</label>
            <select
              name="to_branch_id"
              value={formData.to_branch_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select branch...</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Product * (Type or Select)</label>
            <div className="relative">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type product name or SKU..."
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setShowProductDropdown(true);
                  }}
                  onFocus={() => setShowProductDropdown(true)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowProductDropdown(!showProductDropdown)}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  ▼
                </button>
              </div>
              {showProductDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {(productSearch
                    ? availableProducts.filter(p =>
                        p.product_name?.toLowerCase().includes(productSearch.toLowerCase()) ||
                        p.product_sku?.toLowerCase().includes(productSearch.toLowerCase())
                      )
                    : availableProducts
                  ).map(item => (
                    <div
                      key={item.product_id}
                      onClick={() => {
                        setFormData({ ...formData, product_id: item.product_id });
                        setProductSearch(`${item.product_sku} - ${item.product_name}`);
                        setShowProductDropdown(false);
                      }}
                      className="px-4 py-2 hover:bg-emerald-50 cursor-pointer border-b last:border-b-0"
                    >
                      <p className="font-medium text-gray-900">{item.product_sku} - {item.product_name}</p>
                      <p className="text-xs text-gray-500">{item.quantity_on_hand} available</p>
                    </div>
                  ))}
                  {availableProducts.filter(p =>
                    productSearch ? p.product_name?.toLowerCase().includes(productSearch.toLowerCase()) ||
                      p.product_sku?.toLowerCase().includes(productSearch.toLowerCase()) : true
                  ).length === 0 && (
                    <div className="px-4 py-2 text-gray-500 text-center">No products found</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Quantity *</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter quantity"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Reference Number</label>
            <input
              type="text"
              name="reference_number"
              value={formData.reference_number}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g., TRF-001"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Optional notes about this transfer"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition"
        >
          {submitting ? 'Logging Transfer...' : 'Log Transfer'}
        </button>
      </form>
    </div>
  );
}
