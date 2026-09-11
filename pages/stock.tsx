import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'

interface StockMovement {
  id: string
  product_id: string
  movement_type: string
  quantity: number
  notes: string
  created_at: string
  product_name: string
}

export default function Stock() {
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    product_id: '',
    movement_type: 'in',
    quantity: 0,
    notes: '',
  })

  useEffect(() => {
    loadProducts()
    loadMovements()
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

  const loadMovements = async () => {
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const enrichedMovements = await Promise.all(
        (data || []).map(async (movement) => {
          const product = products.find((p) => p.id === movement.product_id)
          return {
            ...movement,
            product_name: product?.name || 'Unknown',
          }
        })
      )

      setMovements(enrichedMovements)
    } catch (error) {
      console.error('Error loading movements:', error)
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

    try {
      const adjustedQuantity =
        formData.movement_type === 'in'
          ? formData.quantity
          : -formData.quantity

      // Record movement
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert([
          {
            product_id: formData.product_id,
            movement_type: formData.movement_type,
            quantity: adjustedQuantity,
            notes: formData.notes,
          },
        ])

      if (movementError) throw movementError

      // Update product quantity
      const newQuantity = product.quantity + adjustedQuantity
      if (newQuantity < 0) {
        alert('Resulting stock cannot be negative')
        return
      }

      const { error: updateError } = await supabase
        .from('products')
        .update({ quantity: newQuantity })
        .eq('id', formData.product_id)

      if (updateError) throw updateError

      await loadProducts()
      await loadMovements()
      setFormData({
        product_id: '',
        movement_type: 'in',
        quantity: 0,
        notes: '',
      })
      setShowForm(false)
    } catch (error) {
      console.error('Error recording movement:', error)
      alert('Error recording movement')
    }
  }

  const totalInbound = movements
    .filter((m) => m.quantity > 0)
    .reduce((sum, m) => sum + m.quantity, 0)
  const totalOutbound = movements
    .filter((m) => m.quantity < 0)
    .reduce((sum, m) => sum + m.quantity, 0)

  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Stock Movements</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary"
          >
            + Record Movement
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="card border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm font-medium">Total Movements</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {movements.length}
            </p>
          </div>
          <div className="card border-l-4 border-green-500">
            <p className="text-gray-600 text-sm font-medium">Inbound</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              +{totalInbound}
            </p>
          </div>
          <div className="card border-l-4 border-red-500">
            <p className="text-gray-600 text-sm font-medium">Outbound</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {totalOutbound}
            </p>
          </div>
        </div>

        {showForm && (
          <div className="card mb-6">
            <h2 className="text-xl font-bold mb-4">Record Stock Movement</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Product *
                  </label>
                  <select
                    value={formData.product_id}
                    onChange={(e) =>
                      setFormData({ ...formData, product_id: e.target.value })
                    }
                    className="input-field"
                    required
                  >
                    <option value="">Select a product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Movement Type *
                  </label>
                  <select
                    value={formData.movement_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        movement_type: e.target.value,
                      })
                    }
                    className="input-field"
                    required
                  >
                    <option value="in">Stock In (Inbound)</option>
                    <option value="out">Stock Out (Outbound)</option>
                    <option value="adjustment">Adjustment</option>
                    <option value="damage">Damage/Loss</option>
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
                    Notes
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="input-field"
                    placeholder="e.g., Received from supplier, Damage inspection"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button type="submit" className="btn-primary">
                  Record Movement
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
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-right">Quantity</th>
                  <th className="px-4 py-2 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement) => (
                  <tr key={movement.id}>
                    <td className="px-4 py-2">
                      {new Date(movement.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 font-semibold">
                      {movement.product_name}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          movement.quantity > 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {movement.movement_type.toUpperCase()}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-2 text-right font-semibold ${
                        movement.quantity > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                    </td>
                    <td className="px-4 py-2">{movement.notes}</td>
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
