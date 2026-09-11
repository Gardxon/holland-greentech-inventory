import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Loading from './Loading';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('add-product');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['Seeds', 'Irrigation Equipment', 'Peatmoss', 'Pest Management/IPM', 'Greenhouse Supplies']);
  const [file, setFile] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: '',
    pack_size: '',
    unit_price: '',
    reorder_level: 10,
    description: ''
  });

  const [stockData, setStockData] = useState({
    branch_id: '',
    product_id: '',
    quantity: ''
  });

  // Hybrid SKU selection states
  const [skuSearch, setSkuSearch] = useState('');
  const [showSkuDropdown, setShowSkuDropdown] = useState(false);

  useEffect(() => {
    loadBranches();
    loadProducts();
  }, []);

  const loadBranches = async () => {
    try {
      const response = await api.get('/branches');
      setBranches(response.data);
    } catch (err) {
      console.error('Failed to load branches', err);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await api.get('/products?skip=0&limit=1000');
      setProducts(response.data);

      const uniqueCategories = [...new Set(response.data
        .map(p => p.category)
        .filter(c => c && c.trim())
      )];

      if (uniqueCategories.length > 0) {
        setCategories(prev => {
          const merged = [...new Set([...prev, ...uniqueCategories])];
          return merged.sort();
        });
      }
    } catch (err) {
      console.error('Failed to load products', err);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await api.post('/api/admin/products', {
        ...formData,
        unit_price: parseFloat(formData.unit_price),
        reorder_level: parseInt(formData.reorder_level)
      });

      setMessage({ type: 'success', text: 'Product added successfully!' });
      setFormData({
        sku: '',
        name: '',
        category: '',
        pack_size: '',
        unit_price: '',
        reorder_level: 10,
        description: ''
      });
      loadProducts();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to add product' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await api.post('/api/admin/stock/add', null, {
        params: {
          branch_id: parseInt(stockData.branch_id),
          product_id: parseInt(stockData.product_id),
          quantity: parseInt(stockData.quantity)
        }
      });

      setMessage({ type: 'success', text: 'Stock added successfully!' });
      setStockData({ branch_id: '', product_id: '', quantity: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to add stock' });
    } finally {
      setLoading(false);
    }
  };

  const handleExcelImport = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage({ type: 'error', text: 'Please select an Excel file' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const formDataObj = new FormData();
      formDataObj.append('file', file);

      const response = await api.post('/api/admin/products/import-excel', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage({
        type: 'success',
        text: `Imported ${response.data.count} products! Errors: ${response.data.errors.length}`
      });
      setFile(null);
      loadProducts();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Import failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkuSearch = (value) => {
    setSkuSearch(value);
    setFormData(prev => ({ ...prev, sku: value }));
  };

  const selectProduct = (product) => {
    setFormData(prev => ({
      ...prev,
      sku: product.sku,
      name: product.name,
      category: product.category || '',
      pack_size: product.pack_size || '',
      unit_price: product.unit_price || ''
    }));
    setSkuSearch(product.sku);
    setShowSkuDropdown(false);
  };

  const handleCategoryChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, category: value }));
  };

  const generateNextSku = () => {
    if (!products || products.length === 0) return 'HGT-001';
    const skus = products.map(p => p.sku).filter(s => s && s.startsWith('HGT-'));
    if (skus.length === 0) return 'HGT-001';
    const numbers = skus.map(s => parseInt(s.split('-')[1] || 0));
    const maxNum = Math.max(...numbers);
    return `HGT-${String(maxNum + 1).padStart(3, '0')}`;
  };

  const getFilteredProducts = () => {
    if (!skuSearch) return products;
    const search = skuSearch.toLowerCase();
    return products.filter(p =>
      (p.sku || '').toLowerCase().includes(search) ||
      (p.name || '').toLowerCase().includes(search)
    );
  };

  const handleStockInputChange = (e) => {
    const { name, value } = e.target;
    setStockData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h2>
        <p className="text-gray-600">Manage products, stock, and inventory</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md">
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('add-product')}
            className={`px-6 py-4 font-medium border-b-2 ${activeTab === 'add-product' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-600'}`}
          >
            Add Product
          </button>
          <button
            onClick={() => setActiveTab('add-stock')}
            className={`px-6 py-4 font-medium border-b-2 ${activeTab === 'add-stock' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-600'}`}
          >
            Add Stock
          </button>
          <button
            onClick={() => setActiveTab('import-excel')}
            className={`px-6 py-4 font-medium border-b-2 ${activeTab === 'import-excel' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-600'}`}
          >
            Import Excel
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'add-product' && (
            <form onSubmit={handleAddProduct} className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SKU * (Search or type new)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={skuSearch}
                    onChange={(e) => handleSkuSearch(e.target.value)}
                    placeholder="Type SKU or product name..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSkuDropdown(!showSkuDropdown)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    ▼
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newSku = generateNextSku();
                      handleSkuSearch(newSku);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                    title="Auto-generate new SKU"
                  >
                    ✨
                  </button>
                </div>
                {showSkuDropdown && (
                  <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto bg-white shadow-lg">
                    {getFilteredProducts().length > 0 ? (
                      getFilteredProducts().map(product => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => selectProduct(product)}
                          className="w-full text-left px-4 py-2 hover:bg-emerald-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium">{product.sku}</div>
                          <div className="text-sm text-gray-600">{product.name}</div>
                          {product.pack_size && <div className="text-xs text-gray-500">Pack: {product.pack_size}</div>}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-gray-500 text-sm">No matching products</div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., Welding Rod 30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleCategoryChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select a category...</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pack Size</label>
                  <input
                    type="text"
                    name="pack_size"
                    value={formData.pack_size}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g., 1kg, 50 pcs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price *</label>
                  <input
                    type="number"
                    name="unit_price"
                    value={formData.unit_price}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level</label>
                  <input
                    type="number"
                    name="reorder_level"
                    value={formData.reorder_level}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows="3"
                  placeholder="Optional product description"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 disabled:bg-gray-400"
              >
                {loading ? 'Adding...' : 'Add Product'}
              </button>
            </form>
          )}

          {activeTab === 'add-stock' && (
            <form onSubmit={handleAddStock} className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Branch *</label>
                <select
                  name="branch_id"
                  value={stockData.branch_id}
                  onChange={handleStockInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Choose a branch...</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Product *</label>
                <select
                  name="product_id"
                  value={stockData.product_id}
                  onChange={handleStockInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Choose a product...</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>{product.sku} - {product.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity to Add *</label>
                <input
                  type="number"
                  name="quantity"
                  value={stockData.quantity}
                  onChange={handleStockInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="0"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 disabled:bg-gray-400"
              >
                {loading ? 'Adding Stock...' : 'Add Stock'}
              </button>
            </form>
          )}

          {activeTab === 'import-excel' && (
            <div className="space-y-4 max-w-2xl">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Excel Format Required:</h3>
                <p className="text-emerald-800 text-sm mb-2">Your Excel file should have these columns:</p>
                <ul className="text-emerald-800 text-sm space-y-1 ml-4 list-disc">
                  <li><strong>SKU</strong> (e.g., HGT-001)</li>
                  <li><strong>Name</strong> (e.g., Welding Rod 30)</li>
                  <li><strong>Category</strong> (e.g., Welding Supplies) - Optional</li>
                  <li><strong>Pack Size</strong> (e.g., 1kg) - Optional</li>
                  <li><strong>Unit Price</strong> (e.g., 2500)</li>
                  <li><strong>Reorder Level</strong> (e.g., 10) - Optional</li>
                </ul>
              </div>

              <form onSubmit={handleExcelImport} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Excel File</label>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !file}
                  className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 disabled:bg-gray-400"
                >
                  {loading ? 'Importing...' : 'Import Products'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
