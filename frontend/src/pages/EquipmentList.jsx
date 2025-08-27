import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Package,
  MapPin,
  Calendar,
  AlertTriangle,
  X
} from 'lucide-react'
import axios from 'axios'
import EquipmentModal from '../components/EquipmentModal'

export default function EquipmentList() {
  const [equipment, setEquipment] = useState([])
  const [categories, setCategories] = useState([])
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEquipment, setEditingEquipment] = useState(null)
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    location: '',
    search: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [equipmentRes, categoriesRes, locationsRes] = await Promise.all([
        axios.get('/api/equipment'),
        axios.get('/api/equipment/categories'),
        axios.get('/api/equipment/locations')
      ])

      setEquipment(equipmentRes.data)
      setCategories(categoriesRes.data)
      setLocations(locationsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter and search equipment
  const filteredEquipment = useMemo(() => {
    return equipment.filter(item => {
      // Search filter
      if (filters.search && !item.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }
      
      // Status filter
      if (filters.status && item.status !== filters.status) {
        return false
      }
      
      // Category filter
      if (filters.category && item.category !== filters.category) {
        return false
      }
      
      // Location filter
      if (filters.location && item.location !== filters.location) {
        return false
      }
      
      return true
    })
  }, [equipment, filters])

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      try {
        await axios.delete(`/api/equipment/${id}`)
        setEquipment(equipment.filter(item => item.id !== id))
      } catch (error) {
        console.error('Error deleting equipment:', error)
        alert('Failed to delete equipment')
      }
    }
  }

  const handleAddEquipment = () => {
    setEditingEquipment(null)
    setModalOpen(true)
  }

  const handleEditEquipment = (equipment) => {
    setEditingEquipment(equipment)
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setEditingEquipment(null)
  }

  const handleEquipmentSuccess = () => {
    fetchData() // Refresh the data
  }

  const clearFilters = () => {
    setFilters({
      status: '',
      category: '',
      location: '',
      search: ''
    })
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Available': 'badge-success',
      'In Use': 'badge-info',
      'Maintenance': 'badge-warning',
      'Retired': 'badge-danger'
    }
    return statusConfig[status] || 'badge-info'
  }

  const getStatusIcon = (status) => {
    const iconConfig = {
      'Available': Package,
      'In Use': Calendar,
      'Maintenance': AlertTriangle,
      'Retired': Trash2
    }
    return iconConfig[status] || Package
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
          <h1 className="text-2xl font-bold text-gray-900">Equipment Management</h1>
          <p className="text-gray-600">Manage your equipment inventory</p>
        </div>
        <button
          onClick={handleAddEquipment}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Equipment</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            {(filters.status || filters.category || filters.location || filters.search) && (
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-800 flex items-center space-x-1"
              >
                <X className="w-4 h-4" />
                <span>Clear</span>
              </button>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {filteredEquipment.length} of {equipment.length} items
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="select"
            >
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="In Use">In Use</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Retired">Retired</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="select"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <select
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="select"
            >
              <option value="">All Locations</option>
              {locations.map((location) => (
                <option key={location.id} value={location.name}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search equipment..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="input pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Equipment List */}
      <div className="card">
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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Maintenance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEquipment.map((item) => {
                const StatusIcon = getStatusIcon(item.status)
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">
                          ID: {item.id} • Added {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{item.category}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`${getStatusBadge(item.status)} flex items-center space-x-1`}>
                        <StatusIcon className="w-3 h-3" />
                        <span>{item.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="w-4 h-4 mr-1" />
                        {item.location || 'Not specified'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.lastMaintenance ? (
                        new Date(item.lastMaintenance).toLocaleDateString()
                      ) : (
                        'Never'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/equipment/${item.id}`}
                          className="text-primary-600 hover:text-primary-900 p-1 rounded hover:bg-primary-50"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleEditEquipment(item)}
                          className="text-warning-600 hover:text-warning-900 p-1 rounded hover:bg-warning-50"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-danger-600 hover:text-danger-900 p-1 rounded hover:bg-danger-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredEquipment.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {equipment.length === 0 ? 'No equipment found' : 'No equipment matches your filters'}
            </h3>
            <p className="text-gray-600 mb-4">
              {equipment.length === 0 
                ? 'Get started by adding your first piece of equipment.'
                : 'Try adjusting your filters or search terms.'
              }
            </p>
            {equipment.length === 0 && (
              <button onClick={handleAddEquipment} className="btn-primary">
                Add Equipment
              </button>
            )}
          </div>
        )}
      </div>

      {/* Equipment Modal */}
      <EquipmentModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        equipment={editingEquipment}
        onSuccess={handleEquipmentSuccess}
      />
    </div>
  )
}
