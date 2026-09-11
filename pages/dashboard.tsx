import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    lowStockItems: 0,
    totalSales: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [products, sales] = await Promise.all([
          supabase.from('products').select('*'),
          supabase.from('sales').select('*'),
        ])

        if (products.data) {
          const lowStock = products.data.filter(
            (p: any) => p.quantity < 10
          ).length
          const totalStock = products.data.reduce(
            (sum: number, p: any) => sum + p.quantity,
            0
          )

          setStats({
            totalProducts: products.data.length,
            totalStock,
            lowStockItems: lowStock,
            totalSales: sales.data?.length || 0,
          })
        }
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const StatCard = ({
    icon,
    label,
    value,
    color,
  }: {
    icon: string
    label: string
    value: number
    color: string
  }) => (
    <div className={`card border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  )

  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Welcome to Holland Greentech Inventory System
        </h1>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon="📦"
              label="Total Products"
              value={stats.totalProducts}
              color="border-blue-500"
            />
            <StatCard
              icon="📊"
              label="Total Stock"
              value={stats.totalStock}
              color="border-green-500"
            />
            <StatCard
              icon="⚠️"
              label="Low Stock Items"
              value={stats.lowStockItems}
              color="border-red-500"
            />
            <StatCard
              icon="💰"
              label="Total Sales"
              value={stats.totalSales}
              color="border-yellow-500"
            />
          </div>
        )}

        <div className="card">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/products"
              className="btn-primary text-center py-3 rounded"
            >
              📦 Manage Products
            </a>
            <a
              href="/sales"
              className="btn-primary text-center py-3 rounded"
            >
              💰 Record Sale
            </a>
            <a
              href="/stock"
              className="btn-primary text-center py-3 rounded"
            >
              📈 Stock Movement
            </a>
            <a
              href="/reports"
              className="btn-primary text-center py-3 rounded"
            >
              📉 View Reports
            </a>
          </div>
        </div>

        <div className="mt-6 card">
          <h2 className="text-xl font-bold text-gray-800 mb-4">System Features</h2>
          <ul className="space-y-2 text-gray-700">
            <li>✅ Track product inventory in real-time</li>
            <li>✅ Record sales and stock movements</li>
            <li>✅ Generate detailed reports and analytics</li>
            <li>✅ Multi-user support with role-based access</li>
            <li>✅ Automatic backups and cloud storage</li>
            <li>✅ Access from any device with internet</li>
          </ul>
        </div>
      </div>
    </Layout>
  )
}
