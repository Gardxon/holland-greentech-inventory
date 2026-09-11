import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import Loading from './Loading';

export default function StockRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [formData, setFormData] = useState({
    product_id: '',
    from_branch_id: '',
    to_branch_id: '',
    quantity: '',
    reason: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, [statusFilter]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [branchRes, prodRes, reqRes] = await Promise.all([
        fetch('http://localhost:8000/branches/'),
        fetch('http://localhost:8000/products/'),
        apiClient.getStockRequests(0, 100, null, statusFilter || null)
      ]);

      if (branchRes.ok) setBranches(await branchRes.json());
      if (prodRes.ok) setProducts(await prodRes.json());
      if (reqRes.ok) setRequests(reqRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.from_branch_id === formData.to_branch_id) {
      setError('From and To branches must be different');
      return;
    }

    try {
      await apiClient.createStockRequest({
        product_id: parseInt(formData.product_id),
        from_branch_id: parseInt(formData.from_branch_id),
        to_branch_id: parseInt(formData.to_branch_id),
        quantity: parseInt(formData.quantity),
        reason: formData.reason
      });

      setSuccess('Stock request created successfully!');
      setFormData({ product_id: '', from_branch_id: '', to_branch_id: '', quantity: '', reason: '' });
      fetchInitialData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create request');
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await apiClient.approveStockRequest(requestId);
      setSuccess('Request approved and stock transferred!');
      fetchInitialData();
    } catch (err) {
      setError('Failed to approve request');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await apiClient.rejectStockRequest(requestId);
      setSuccess('Request rejected');
      fetchInitialData();
    } catch (err) {
      setError('Failed to reject request');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-emerald-100 text-emerald-800',
      fulfilled: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Stock Requests</h2>
        <p className="text-gray-600">Request and manage stock transfers between branches</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Request Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Create Request</h3>

          {error && <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
          {success && <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product * (Type or Select)</label>
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
                      ? products.filter(p =>
                          p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                          p.sku.toLowerCase().includes(productSearch.toLowerCase())
                        )
                      : products
                    ).map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setFormData({ ...formData, product_id: p.id });
                          setProductSearch(`${p.name} (${p.sku})`);
                          setShowProductDropdown(false);
                        }}
                        className="px-4 py-2 hover:bg-emerald-50 cursor-pointer border-b last:border-b-0"
                      >
                        <p className="font-medium text-gray-900">{p.name}</p>
                        <p className="text-xs text-gray-500">SKU: {p.sku} | Pack: {p.pack_size || 'N/A'}</p>
                      </div>
                    ))}
                    {products.filter(p =>
                      productSearch ? p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                        p.sku.toLowerCase().includes(productSearch.toLowerCase()) : true
                    ).length === 0 && (
                      <div className="px-4 py-2 text-gray-500 text-center">No products found</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Branch *</label>
                <select
                  required
                  value={formData.from_branch_id}
                  onChange={(e) => setFormData({ ...formData, from_branch_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select...</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Branch *</label>
                <select
                  required
                  value={formData.to_branch_id}
                  onChange={(e) => setFormData({ ...formData, to_branch_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select...</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="Units needed"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Why do you need this stock?"
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Create Request
            </button>
          </form>
        </div>

        {/* Requests List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Requests</h3>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {requests.length === 0 ? (
              <p className="text-gray-500">No requests found</p>
            ) : (
              requests.map(req => (
                <div key={req.id} className="border border-gray-200 p-3 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{req.product?.name}</p>
                      <p className="text-xs text-gray-600">
                        {req.from_branch?.name} → {req.to_branch?.name}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded font-medium ${getStatusColor(req.status)}`}>
                      {req.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">Quantity: <strong>{req.quantity}</strong> units</p>

                  {req.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(req.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs py-1 rounded transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs py-1 rounded transition"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
