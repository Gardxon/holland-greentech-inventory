import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'

interface Sale {
  id: string
  product_id: string
  quantity: number
  price: number
  total: number
  created_at: string
  product_name: string
}

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    product_id: '',
    quantity: 1,
    price: 0,
  })
  const [filter, setFilter] = useState({
    startDate: '',
    endDate: '',
  })

  useEffect(() => {
    loadProducts()
    loadSales()
  }, [])

  const loadProducts = async () => {
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('name')
      setProducts(data || [])
    } catch (error) {
      console.error('Error loading products:', error)
    }
  }

  const loadSales = async () => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const enrichedSales = await Promise.all(
        (data || []).map(async (sale) => {
          const product = products.find((p) => p.id === sale.product_id)
          return {
            ...sale,
            product_name: product?.name || 'Unknown',
          }
        })
      )

      setSales(enrichedSales)
    } catch (error) {
      console.error('Error loading sales:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.product_id) {
      alert('Please select a product')
      return
    }

    const product = products.find((p) => p.id === formData.product_id)
    if (!product) return

    if (formData.quantity > product.quantity) {
      alert('Insufficient stock')
      return
    }

    try {
      const { error: saleError } = await supabase
        .from('sales')
        .insert([
          {
            product_id: formData.product_id,
            quantity: formData.quantity,
            price: formData.price || product.selling_price,
            total: (formData.price || product.selling_price) * formData.quantity,
          },
        ])

      if (saleError) throw saleError

      // Update product quantity
      const newQuantity = product.quantity - formData.quantity
      const { error: updateError } = await supabase
        .from('products')
        .update({ quantity: newQuantity })
        .eq('id', formData.product_id)

      if (updateError) throw updateError

      // Log stock movement
      await supabase
        .from('stock_movements')
        .insert([
          {
            product_id: formData.product_id,
            movement_type: 'sale',
            quantity: -formData.quantity,
            notes: `Sale of ${formData.quantity} units`,
          },
        ])

      await loadProducts()
      await loadSales()
      setFormData({
        product_id: '',
        quantity: 1,
        price: 0,
      })
      setShowForm(false)
    } catch (error) {
      console.error('Error recording sale:', error)
      alert('Error recording sale')
    }
  }

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0)

  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Sales</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary"
          >
            + Record Sale
          </button>
        </div>

        {/* Summary Card */}
        <div className="card mb-6 bg-gradient-to-r from-hgt-green to-green-600 text-white">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm opacity-90">Total Sales</p>
              <p className="text-2xl font-bold">{sales.length}</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Total Revenue</p>
              <p className="text-2xl font-bold">TZS {totalRevenue.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Avg Sale Value</p>
              <p className="text-2xl font-bold">
                TZS {sales.length > 0 ? (totalRevenue / sales.length).toFixed(2) : '0.00'}
              </p>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="card mb-6">
            <h2 className="text-xl font-bold mb-4">Record New Sale</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Product *
                  </label>
                  <select
                    value={formData.product_id}
                    onChange={(e) => {
                      const product = products.find(
                        (p) => p.id === e.target.value
                      )
                      setFormData({
                        ...formData,
                        product_id: e.target.value,
                        price: product?.selling_price || 0,
                      })
                    }}
                    className="input-field"
                    required
                  >
                    <option value="">Select a product</option>
                    {products
                      .filter((p) => p.quantity > 0)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Stock: {p.quantity})
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: parseInt(e.target.value),
                      })
                    }
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Unit Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value),
                      })
                    }
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button type="submit" className="btn-primary">
                  Record Sale
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
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
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Product</th>
                  <th className="px-4 py-2 text-right">Quantity</th>
                  <th className="px-4 py-2 text-right">Unit Price</th>
                  <th className="px-4 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td className="px-4 py-2">
                      {new Date(sale.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 font-semibold">
                      {sale.product_name}
                    </td>
                    <td className="px-4 py-2 text-right">{sale.quantity}</td>
                    <td className="px-4 py-2 text-right">
                      {sale.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-right font-semibold">
                      {sale.total.toFixed(2)}
                    </td>
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
