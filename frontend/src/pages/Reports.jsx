import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  Download, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  Package,
  MapPin
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import axios from 'axios'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export default function Reports() {
  const [stats, setStats] = useState(null)
  const [categoryData, setCategoryData] = useState([])
  const [statusData, setStatusData] = useState([])
  const [locationData, setLocationData] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [maintenanceDue, setMaintenanceDue] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReportData()
  }, [])

  const fetchReportData = async () => {
    try {
      const [
        statsRes,
        categoryRes,
        statusRes,
        locationRes,
        activityRes,
        maintenanceRes
      ] = await Promise.all([
        axios.get('/api/dashboard/stats'),
        axios.get('/api/dashboard/equipment-by-category'),
        axios.get('/api/dashboard/equipment-by-status'),
        axios.get('/api/dashboard/equipment-by-location'),
        axios.get('/api/dashboard/recent-activity?limit=20'),
        axios.get('/api/dashboard/maintenance-due?days=90')
      ])

      setStats(statsRes.data)
      setCategoryData(categoryRes.data)
      setStatusData(statusRes.data)
      setLocationData(locationRes.data)
      setRecentActivity(activityRes.data)
      setMaintenanceDue(maintenanceRes.data)
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportReport = (type) => {
    // This would typically generate and download a CSV/PDF report
    alert(`${type} report export functionality would be implemented here`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into your equipment management</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleExportReport('Equipment Summary')}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Summary</span>
          </button>
          <button
            onClick={() => handleExportReport('Full Report')}
            className="btn-primary flex items-center space-x-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Full Report</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="p-4">
            <Package className="w-12 h-12 text-primary-600 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-gray-900">{stats?.totalEquipment || 0}</h3>
            <p className="text-sm text-gray-600">Total Equipment</p>
          </div>
        </div>
        <div className="card text-center">
          <div className="p-4">
            <TrendingUp className="w-12 h-12 text-success-600 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-gray-900">{stats?.availableEquipment || 0}</h3>
            <p className="text-sm text-gray-600">Available</p>
          </div>
        </div>
        <div className="card text-center">
          <div className="p-4">
            <AlertTriangle className="w-12 h-12 text-warning-600 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-gray-900">{maintenanceDue.length}</h3>
            <p className="text-sm text-gray-600">Maintenance Due</p>
          </div>
        </div>
        <div className="card text-center">
          <div className="p-4">
            <MapPin className="w-12 h-12 text-info-600 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-gray-900">{stats?.totalLocations || 0}</h3>
            <p className="text-sm text-gray-600">Locations</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equipment by Category */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Equipment by Category</h3>
            <button
              onClick={() => handleExportReport('Category Breakdown')}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Export
            </button>
          </div>
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

        {/* Equipment by Status */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Equipment by Status</h3>
            <button
              onClick={() => handleExportReport('Status Breakdown')}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Export
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Location Distribution */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Equipment by Location</h3>
          <button
            onClick={() => handleExportReport('Location Breakdown')}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Export
          </button>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={locationData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="location" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Maintenance Due */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-warning-600" />
            Maintenance Due (Next 90 Days)
          </h3>
          <button
            onClick={() => handleExportReport('Maintenance Schedule')}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Equipment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Maintenance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days Overdue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {maintenanceDue.map((item) => {
                const lastMaintenance = new Date(item.lastMaintenance)
                const daysOverdue = Math.floor((Date.now() - lastMaintenance) / (1000 * 60 * 60 * 24))
                
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">ID: {item.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.location || 'Not specified'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lastMaintenance.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${daysOverdue > 30 ? 'badge-danger' : 'badge-warning'}`}>
                        {daysOverdue} days
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {maintenanceDue.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No maintenance due in the next 90 days</p>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent System Activity</h3>
          <button
            onClick={() => handleExportReport('Activity Log')}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Export
          </button>
        </div>
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50">
              <div className={`p-2 rounded-lg ${
                activity.action === 'CREATE' ? 'bg-success-100' :
                activity.action === 'UPDATE' ? 'bg-warning-100' :
                'bg-danger-100'
              }`}>
                {activity.action === 'CREATE' && <Package className="w-4 h-4 text-success-600" />}
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
  )
}
