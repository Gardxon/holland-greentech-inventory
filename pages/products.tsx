import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'

interface Product {
  id: string
  name: string
  quantity: number
  cost_price: number
  selling_price: number
  location: string
  supplier: string
  sku?: string
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    quantity: 0,
    cost_price: 0,
    selling_price: 0,
    location: '',
    supplier: '',
    sku: '',
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState('staff')

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (data) {
          setUserRole(data.role)
        }
      }
    }

    getUser()
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name')

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingId) {
        const { error } = await supabase
          .from('products')
          .update(formData)
          .eq('id', editingId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('products')
          .insert([formData])

        if (error) throw error
      }

      await loadProducts()
      setFormData({
        name: '',
        quantity: 0,
        cost_price: 0,
        selling_price: 0,
        location: '',
        supplier: '',
        sku: '',
      })
      setShowForm(false)
      setEditingId(null)
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Error saving product')
    }
  }

  const handleEdit = (product: Product) => {
    setFormData(product)
    setEditingId(product.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (userRole !== 'admin') {
      alert('Only admins can delete products')
      return
    }

    if (!window.confirm('Are you sure?')) return

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error
      await loadProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Error deleting product')
    }
  }

  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Products</h1>
          {userRole === 'admin' && (
            <button
              onClick={() => {
                setShowForm(!showForm)
                setEditingId(null)
                setFormData({
                  name: '',
                  quantity: 0,
                  cost_price: 0,
                  selling_price: 0,
                  location: '',
                  supplier: '',
                  sku: '',
                })
              }}
              className="btn-primary"
            >
              + Add Product
            </button>
          )}
        </div>

        {showForm && userRole === 'admin' && (
          <div className="card mb-6">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: parseFloat(e.target.value),
                      })
                    }
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Cost Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cost_price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cost_price: parseFloat(e.target.value),
                      })
                    }
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Selling Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.selling_price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        selling_price: parseFloat(e.target.value),
                      })
                    }
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Supplier *
                  </label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) =>
                      setFormData({ ...formData, supplier: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button type="submit" className="btn-primary">
                  {editingId ? 'Update Product' : 'Add Product'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full table-striped">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left">Product Name</th>
                  <th className="px-4 py-2 text-left">SKU</th>
                  <th className="px-4 py-2 text-right">Quantity</th>
                  <th className="px-4 py-2 text-right">Cost Price</th>
                  <th className="px-4 py-2 text-right">Selling Price</th>
                  <th className="px-4 py-2 text-left">Location</th>
                  <th className="px-4 py-2 text-left">Supplier</th>
                  {userRole === 'admin' && (
                    <th className="px-4 py-2 text-left">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-2 font-semibold">{product.name}</td>
                    <td className="px-4 py-2">{product.sku}</td>
                    <td className="px-4 py-2 text-right">{product.quantity}</td>
                    <td className="px-4 py-2 text-right">
                      {product.cost_price.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {product.selling_price.toFixed(2)}
                    </td>
                    <td className="px-4 py-2">{product.location}</td>
                    <td className="px-4 py-2">{product.supplier}</td>
                    {userRole === 'admin' && (
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:underline mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}
