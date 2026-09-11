import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabase'

interface User {
  id: string
  email: string
  role: string
  created_at: string
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState('staff')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'staff',
  })
  const router = useRouter()

  useEffect(() => {
    checkAdminAccess()
    loadUsers()
  }, [])

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/')
      return
    }

    const { data } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (data?.role !== 'admin') {
      router.push('/dashboard')
    } else {
      setUserRole('admin')
    }
  }

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              role: formData.role,
            },
          },
        })

      if (signUpError) throw signUpError

      if (signUpData.user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([
            {
              id: signUpData.user.id,
              email: formData.email,
              role: formData.role,
            },
          ])

        if (profileError) throw profileError
      }

      await loadUsers()
      setFormData({
        email: '',
        password: '',
        role: 'staff',
      })
      setShowForm(false)
      alert('User created successfully. They will receive a confirmation email.')
    } catch (error: any) {
      console.error('Error creating user:', error)
      alert(error.message || 'Error creating user')
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error
      await loadUsers()
    } catch (error) {
      console.error('Error updating role:', error)
      alert('Error updating user role')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return

    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId)

      if (error) throw error
      await loadUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error deleting user')
    }
  }

  if (userRole !== 'admin') {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-red-600 font-semibold">
            You do not have permission to access this page
          </p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Users</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary"
          >
            + Add User
          </button>
        </div>

        {showForm && (
          <div className="card mb-6">
            <h2 className="text-xl font-bold mb-4">Add New User</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="input-field"
                    required
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button type="submit" className="btn-primary">
                  Create User
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
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Role</th>
                  <th className="px-4 py-2 text-left">Created</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-2 font-semibold">{user.email}</td>
                    <td className="px-4 py-2">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value)
                        }
                        className={`px-2 py-1 rounded text-sm font-semibold ${
                          user.role === 'admin'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="card mt-6 bg-blue-50 border border-blue-200">
          <h3 className="font-bold text-blue-900 mb-2">User Roles</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              <strong>Admin:</strong> Can manage products, users, and all system
              features
            </li>
            <li>
              <strong>Staff:</strong> Can record sales and stock movements, view
              reports
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  )
}
