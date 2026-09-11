import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import Loading from './Loading';

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [branchInventory, setBranchInventory] = useState([]);
  const [formData, setFormData] = useState({
    product_id: '',
    branch_id: '',
    customer_id: '',
    quantity_sold: '',
    unit_price: '',
    payment_method: 'cash',
    currency: 'TSH',
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showAddCustomerForm, setShowAddCustomerForm] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    contact: '',
    location: '',
    category: 'Farmer'
  });
  const [creatingCustomer, setCreatingCustomer] = useState(false);

  const customerCategories = ['Farmer', 'Agrovet', 'Plant Raiser', 'Company'];

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (formData.branch_id) {
      loadBranchInventory(formData.branch_id);
    }
  }, [formData.branch_id]);

  const loadBranchInventory = async (branchId) => {
    try {
      const response = await fetch(`http://localhost:8000/inventory/branch/${branchId}`);
      if (response.ok) {
        const data = await response.json();
        setBranchInventory(data);
      }
    } catch (err) {
      console.error('Failed to load branch inventory:', err);
    }
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [branchRes, prodRes, custRes, salesRes, summaryRes] = await Promise.all([
        fetch('http://localhost:8000/branches/'),
        fetch('http://localhost:8000/products/'),
        fetch('http://localhost:8000/api/admin/customers'),
        apiClient.getSales(),
        apiClient.getSalesSummary()
      ]);

      if (branchRes.ok) {
        const branchesData = await branchRes.json();
        setBranches(branchesData);
        // Auto-select first branch
        if (branchesData.length > 0) {
          setFormData(prev => ({ ...prev, branch_id: branchesData[0].id }));
        }
      }
      if (prodRes.ok) setProducts(await prodRes.json());
      if (custRes.ok) setCustomers(await custRes.json());
      if (salesRes.ok) setSales(salesRes.data);
      if (summaryRes.ok) setSummary(summaryRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredCustomers = () => {
    if (!customerSearch) return customers;
    const search = customerSearch.toLowerCase();
    return customers.filter(c =>
      (c.name || '').toLowerCase().includes(search) ||
      (c.contact || '').toLowerCase().includes(search) ||
      (c.category || '').toLowerCase().includes(search)
    );
  };

  const selectCustomer = (customer) => {
    setFormData(prev => ({
      ...prev,
      customer_id: customer.id
    }));
    setCustomerSearch(`${customer.name} (${customer.category})`);
    setShowCustomerDropdown(false);
  };

  const getSelectedBranch = () => {
    if (!formData.branch_id) return null;
    return branches.find(b => b.id === parseInt(formData.branch_id));
  };

  const getBranchProducts = () => {
    if (!formData.branch_id || branchInventory.length === 0) {
      return [];
    }
    // Filter products to only show those with inventory at selected branch
    return products.filter(product => {
      return branchInventory.some(inv => inv.product_id === product.id && inv.quantity_on_hand > 0);
    }).map(product => {
      const inventory = branchInventory.find(inv => inv.product_id === product.id);
      return {
        ...product,
        available_quantity: inventory?.quantity_on_hand || 0
      };
    });
  };

  const getFilteredBranchProducts = () => {
    const branchProducts = getBranchProducts();
    if (!productSearch) return branchProducts;
    const search = productSearch.toLowerCase();
    return branchProducts.filter(p =>
      p.name.toLowerCase().includes(search) ||
      p.sku.toLowerCase().includes(search)
    );
  };

  const handleAddNewCustomer = async () => {
    if (!newCustomerData.name || !newCustomerData.contact) {
      alert('Please enter customer name and contact');
      return;
    }

    setCreatingCustomer(true);
    try {
      const response = await fetch('http://localhost:8000/api/admin/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCustomerData)
      });

      if (response.ok) {
        const newCustomer = await response.json();
        setCustomers(prev => [...prev, newCustomer]);
        selectCustomer(newCustomer);
        setNewCustomerData({ name: '', contact: '', location: '', category: 'Farmer' });
        setShowAddCustomerForm(false);
        setSuccess('Customer added successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to add customer');
      }
    } catch (err) {
      setError('Failed to add customer: ' + err.message);
    } finally {
      setCreatingCustomer(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await apiClient.createSale({
        product_id: parseInt(formData.product_id),
        branch_id: parseInt(formData.branch_id),
        customer_id: formData.customer_id ? parseInt(formData.customer_id) : null,
        quantity_sold: parseInt(formData.quantity_sold),
        unit_price: parseFloat(formData.unit_price),
        payment_method: formData.payment_method,
        currency: formData.currency,
        notes: formData.notes
      });

      setSuccess('Sale recorded successfully!');
      setFormData({ product_id: '', branch_id: '', customer_id: '', quantity_sold: '', unit_price: '', payment_method: 'cash', currency: 'TSH', notes: '' });
      setCustomerSearch('');
      fetchInitialData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to record sale');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Sales Management</h2>
        <p className="text-gray-600">Record sales and manage inventory</p>
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow">
            <p className="text-green-100 text-sm">Total Sales (30 days)</p>
            <p className="text-3xl font-bold">TZS {summary.total_sales_amount?.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6 rounded-lg shadow">
            <p className="text-blue-100 text-sm">Units Sold</p>
            <p className="text-3xl font-bold">{summary.total_quantity_sold}</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow">
            <p className="text-purple-100 text-sm">Transactions</p>
            <p className="text-3xl font-bold">{summary.transaction_count}</p>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow">
            <p className="text-orange-100 text-sm">Avg Transaction</p>
            <p className="text-3xl font-bold">TZS {summary.average_transaction?.toLocaleString()}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Record a Sale</h3>

          {error && <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
          {success && <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch *</label>
              <select
                required
                value={formData.branch_id}
                onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select branch...</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              {getSelectedBranch() && (
                <div className="mt-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="text-sm font-medium text-gray-900">{getSelectedBranch().name}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    📍 {getSelectedBranch().location} • {getSelectedBranch().branch_type === 'warehouse' ? '🏭 Warehouse' : '🏪 Sub-branch'}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer (Type or Select)</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Type customer name, contact, or category..."
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setShowCustomerDropdown(true);
                  }}
                  onFocus={() => setShowCustomerDropdown(true)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  ▼
                </button>
              </div>
              {showCustomerDropdown && (
                <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto bg-white shadow-lg mb-2">
                  {getFilteredCustomers().length > 0 ? (
                    getFilteredCustomers().map(customer => (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => selectCustomer(customer)}
                        className="w-full text-left px-4 py-2 hover:bg-emerald-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-gray-600">{customer.contact}</div>
                        <div className="text-xs text-gray-500">{customer.category} {customer.location && `• ${customer.location}`}</div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-gray-500 text-sm text-center">No customers found</div>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowAddCustomerForm(!showAddCustomerForm)}
                    className="w-full text-left px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-t border-gray-200 font-medium text-sm"
                  >
                    + Add New Customer
                  </button>
                </div>
              )}

              {showAddCustomerForm && (
                <div className="border border-emerald-300 rounded-lg bg-emerald-50 p-4 mb-2 space-y-3">
                  <h4 className="font-medium text-gray-900">Add Customer During Sale</h4>
                  <input
                    type="text"
                    placeholder="Customer Name *"
                    value={newCustomerData.name}
                    onChange={(e) => setNewCustomerData({ ...newCustomerData, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    type="text"
                    placeholder="Contact (Phone/Email) *"
                    value={newCustomerData.contact}
                    onChange={(e) => setNewCustomerData({ ...newCustomerData, contact: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={newCustomerData.category}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, category: e.target.value })}
                      className="px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {customerCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Location"
                      value={newCustomerData.location}
                      onChange={(e) => setNewCustomerData({ ...newCustomerData, location: e.target.value })}
                      className="px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddNewCustomer}
                      disabled={creatingCustomer}
                      className="flex-1 px-3 py-2 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:bg-gray-400"
                    >
                      {creatingCustomer ? 'Adding...' : 'Add & Select'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddCustomerForm(false)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

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
                    {getFilteredBranchProducts().length > 0 ? (
                      getFilteredBranchProducts().map(p => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setFormData({
                              ...formData,
                              product_id: p.id,
                              unit_price: p.unit_price || ''
                            });
                            setProductSearch(`${p.name} (${p.sku})`);
                            setShowProductDropdown(false);
                          }}
                          className="px-4 py-2 hover:bg-emerald-50 cursor-pointer border-b last:border-b-0"
                        >
                          <p className="font-medium text-gray-900">{p.name}</p>
                          <p className="text-xs text-gray-500">
                            SKU: {p.sku} | Pack: {p.pack_size || 'N/A'} |
                            <span className="text-emerald-600 font-medium"> In Stock: {p.available_quantity}</span>
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-gray-500 text-center">
                        {formData.branch_id ? 'No products available at this branch' : 'Select a branch first'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Sold *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.quantity_sold}
                  onChange={(e) => setFormData({ ...formData, quantity_sold: e.target.value })}
                  placeholder="Units"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={formData.unit_price}
                  onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="cash">Cash</option>
                  <option value="mpesa">M-Pesa</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency *</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="TSH">TSH (Tanzanian Shilling)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional notes"
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Record Sale
            </button>
          </form>
        </div>

        {/* Recent Sales */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Sales</h3>
          <div className="overflow-y-auto max-h-96">
            {sales.length === 0 ? (
              <p className="text-gray-500">No sales recorded yet</p>
            ) : (
              <div className="space-y-2">
                {sales.slice(0, 10).map(sale => (
                  <div key={sale.id} className="border-l-4 border-green-500 pl-4 py-2 bg-gray-50 p-3 rounded">
                    <p className="font-semibold text-gray-900 text-sm">{sale.product?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-600">
                      {sale.quantity_sold} units @ TZS {sale.unit_price} = TZS {sale.total_amount?.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">{sale.branch?.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
