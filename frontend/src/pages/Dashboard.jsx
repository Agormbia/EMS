import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Package, 
  CheckCircle, 
  Clock, 
  Wrench, 
  AlertTriangle,
  TrendingUp,
  Activity,
  Plus,
  BarChart3
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import axios from 'axios'
import EquipmentModal from '../components/EquipmentModal'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [categoryData, setCategoryData] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, categoryRes, activityRes] = await Promise.all([
          axios.get('/api/dashboard/stats'),
          axios.get('/api/dashboard/equipment-by-category'),
          axios.get('/api/dashboard/recent-activity')
        ])

        setStats(statsRes.data)
        setCategoryData(categoryRes.data)
        setRecentActivity(activityRes.data)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const handleAddEquipment = () => {
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
  }

  const handleEquipmentSuccess = () => {
    // Refresh dashboard data after adding equipment
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Equipment',
      value: stats?.totalEquipment || 0,
      icon: Package,
      color: 'bg-primary-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Available',
      value: stats?.availableEquipment || 0,
      icon: CheckCircle,
      color: 'bg-success-500',
      change: '+5%',
      changeType: 'positive'
    },
    {
      title: 'In Use',
      value: stats?.inUseEquipment || 0,
      icon: Clock,
      color: 'bg-warning-500',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Maintenance',
      value: stats?.maintenanceEquipment || 0,
      icon: Wrench,
      color: 'bg-danger-500',
      change: '-3%',
      changeType: 'negative'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of your equipment management system</p>
        </div>
        <button
          onClick={handleAddEquipment}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Equipment</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div key={card.title} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className={`text-sm font-medium ${
                card.changeType === 'positive' ? 'text-success-600' : 'text-danger-600'
              }`}>
                {card.change}
              </span>
              <span className="text-sm text-gray-600 ml-2">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equipment by Category */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipment by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <Link to="/reports" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {recentActivity.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50">
                <div className={`p-2 rounded-lg ${
                  activity.action === 'CREATE' ? 'bg-success-100' :
                  activity.action === 'UPDATE' ? 'bg-warning-100' :
                  'bg-danger-100'
                }`}>
                  {activity.action === 'CREATE' && <Plus className="w-4 h-4 text-success-600" />}
                  {activity.action === 'UPDATE' && <TrendingUp className="w-4 h-4 text-warning-600" />}
                  {activity.action === 'DELETE' && <AlertTriangle className="w-4 h-4 text-danger-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.action === 'CREATE' && `Added new equipment: ${activity.equipmentName}`}
                    {activity.action === 'UPDATE' && `Updated equipment: ${activity.equipmentName}`}
                    {activity.action === 'DELETE' && `Deleted equipment: ${activity.equipmentName}`}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center hover:shadow-md transition-shadow cursor-pointer">
          <div className="p-4">
            <Package className="w-12 h-12 text-primary-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Equipment</h3>
            <p className="text-gray-600 mb-4">Add, edit, and organize your equipment inventory</p>
            <Link to="/equipment" className="btn-primary">
              Go to Equipment
            </Link>
          </div>
        </div>

        <div className="card text-center hover:shadow-md transition-shadow cursor-pointer">
          <div className="p-4">
            <BarChart3 className="w-12 h-12 text-success-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">View Reports</h3>
            <p className="text-gray-600 mb-4">Generate detailed reports and analytics</p>
            <Link to="/reports" className="btn-success">
              View Reports
            </Link>
          </div>
        </div>

        <div className="card text-center hover:shadow-md transition-shadow cursor-pointer">
          <div className="p-4">
            <Activity className="w-12 h-12 text-warning-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">System Status</h3>
            <p className="text-gray-600 mb-4">Monitor system health and performance</p>
            <Link to="/settings" className="btn-warning">
              System Settings
            </Link>
          </div>
        </div>
      </div>

      {/* Equipment Modal */}
      <EquipmentModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        equipment={null}
        onSuccess={handleEquipmentSuccess}
      />
    </div>
  )
}
