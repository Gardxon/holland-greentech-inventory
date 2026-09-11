import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'

export default function Reports() {
  const [products, setProducts] = useState<any[]>([])
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [reportType, setReportType] = useState('stock')
  const [dateFilter, setDateFilter] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [productsData, salesData] = await Promise.all([
        supabase.from('products').select('*').order('name'),
        supabase
          .from('sales')
          .select('*')
          .order('created_at', { ascending: false }),
      ])

      setProducts(productsData.data || [])
      setSales(salesData.data || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStockReport = () => {
    const lowStock = products.filter((p) => p.quantity < 10)
    const outOfStock = products.filter((p) => p.quantity === 0)
    const overStock = products.filter((p) => p.quantity > 100)

    return {
      totalProducts: products.length,
      totalValue: products.reduce((sum, p) => sum + p.quantity * p.cost_price, 0),
      lowStock: lowStock.length,
      outOfStock: outOfStock.length,
      overStock: overStock.length,
    }
  }

  const getSalesReport = () => {
    const filteredSales = sales.filter((s) => {
      const saleDate = new Date(s.created_at).toISOString().split('T')[0]
      return saleDate >= dateFilter.startDate && saleDate <= dateFilter.endDate
    })

    return {
      totalSales: filteredSales.length,
      totalRevenue: filteredSales.reduce((sum, s) => sum + s.total, 0),
      averageValue:
        filteredSales.length > 0
          ? filteredSales.reduce((sum, s) => sum + s.total, 0) / filteredSales.length
          : 0,
      topProducts: Object.entries(
        filteredSales.reduce((acc: any, s) => {
          acc[s.product_id] = (acc[s.product_id] || 0) + s.quantity
          return acc
        }, {})
      )
        .sort((a, b) => (b[1] as number) - (a[1] as number))
        .slice(0, 5),
    }
  }

  const getProductValueReport = () => {
    return products
      .map((p) => ({
        ...p,
        totalValue: p.quantity * p.cost_price,
        profit: (p.selling_price - p.cost_price) * p.quantity,
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 10)
  }

  const stockReport = getStockReport()
  const salesReport = getSalesReport()
  const productValueReport = getProductValueReport()

  const ReportCard = ({
    icon,
    label,
    value,
    color,
  }: {
    icon: string
    label: string
    value: string | number
    color: string
  }) => (
    <div className={`card border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-800 mt-2">{value}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  )

  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Reports & Analytics</h1>

        {/* Report Type Selector */}
        <div className="card mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setReportType('stock')}
              className={`px-4 py-2 rounded font-semibold ${
                reportType === 'stock'
                  ? 'bg-hgt-green text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              Stock Report
            </button>
            <button
              onClick={() => setReportType('sales')}
              className={`px-4 py-2 rounded font-semibold ${
                reportType === 'sales'
                  ? 'bg-hgt-green text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              Sales Report
            </button>
            <button
              onClick={() => setReportType('values')}
              className={`px-4 py-2 rounded font-semibold ${
                reportType === 'values'
                  ? 'bg-hgt-green text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              Product Value Report
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : reportType === 'stock' ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <ReportCard
                icon="📦"
                label="Total Products"
                value={stockReport.totalProducts}
                color="border-blue-500"
              />
              <ReportCard
                icon="💰"
                label="Total Stock Value"
                value={`TZS ${stockReport.totalValue.toFixed(2)}`}
                color="border-green-500"
              />
              <ReportCard
                icon="⚠️"
                label="Low Stock Items"
                value={stockReport.lowStock}
                color="border-yellow-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-bold mb-4">Low Stock Items</h3>
                <div className="space-y-2">
                  {products
                    .filter((p) => p.quantity < 10 && p.quantity > 0)
                    .slice(0, 5)
                    .map((p) => (
                      <div key={p.id} className="flex justify-between text-sm">
                        <span>{p.name}</span>
                        <span className="text-yellow-600 font-semibold">
                          {p.quantity} left
                        </span>
                      </div>
                    ))}
                  {products.filter((p) => p.quantity < 10 && p.quantity > 0)
                    .length === 0 && (
                    <p className="text-gray-500">No low stock items</p>
                  )}
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-bold mb-4">Out of Stock Items</h3>
                <div className="space-y-2">
                  {products
                    .filter((p) => p.quantity === 0)
                    .slice(0, 5)
                    .map((p) => (
                      <div key={p.id} className="text-sm text-red-600">
                        {p.name}
                      </div>
                    ))}
                  {products.filter((p) => p.quantity === 0).length === 0 && (
                    <p className="text-gray-500">No out of stock items</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : reportType === 'sales' ? (
          <div>
            <div className="card mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={dateFilter.startDate}
                    onChange={(e) =>
                      setDateFilter({ ...dateFilter, startDate: e.target.value })
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={dateFilter.endDate}
                    onChange={(e) =>
                      setDateFilter({ ...dateFilter, endDate: e.target.value })
                    }
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <ReportCard
                icon="🛒"
                label="Total Sales"
                value={salesReport.totalSales}
                color="border-blue-500"
              />
              <ReportCard
                icon="💵"
                label="Total Revenue"
                value={`TZS ${salesReport.totalRevenue.toFixed(2)}`}
                color="border-green-500"
              />
              <ReportCard
                icon="📊"
                label="Average Sale"
                value={`TZS ${salesReport.averageValue.toFixed(2)}`}
                color="border-purple-500"
              />
            </div>

            <div className="card">
              <h3 className="text-lg font-bold mb-4">Top Selling Products</h3>
              <table className="w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left">Product</th>
                    <th className="px-4 py-2 text-right">Units Sold</th>
                  </tr>
                </thead>
                <tbody>
                  {salesReport.topProducts.map(([productId, quantity]) => {
                    const product = products.find((p) => p.id === productId)
                    return (
                      <tr key={productId} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2">{product?.name}</td>
                        <td className="px-4 py-2 text-right font-semibold">
                          {quantity}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div>
            <div className="card overflow-x-auto">
              <table className="w-full table-striped">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left">Product</th>
                    <th className="px-4 py-2 text-right">Stock</th>
                    <th className="px-4 py-2 text-right">Unit Cost</th>
                    <th className="px-4 py-2 text-right">Total Value</th>
                    <th className="px-4 py-2 text-right">Unit Profit</th>
                    <th className="px-4 py-2 text-right">Total Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {productValueReport.map((p) => (
                    <tr key={p.id}>
                      <td className="px-4 py-2 font-semibold">{p.name}</td>
                      <td className="px-4 py-2 text-right">{p.quantity}</td>
                      <td className="px-4 py-2 text-right">
                        {p.cost_price.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-right font-semibold">
                        {p.totalValue.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-right text-green-600">
                        {(p.selling_price - p.cost_price).toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-right font-semibold text-green-600">
                        {p.profit.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
