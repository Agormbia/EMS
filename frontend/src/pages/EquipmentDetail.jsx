import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Edit, 
  Trash2, 
  ArrowLeft, 
  Package, 
  MapPin, 
  Calendar, 
  FileText,
  AlertTriangle,
  Clock,
  Wrench,
  CheckCircle
} from 'lucide-react'
import axios from 'axios'
import EquipmentModal from '../components/EquipmentModal'

export default function EquipmentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [equipment, setEquipment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    fetchEquipment()
  }, [id])

  const fetchEquipment = async () => {
    try {
      const response = await axios.get(`/api/equipment/${id}`)
      setEquipment(response.data)
    } catch (error) {
      console.error('Error fetching equipment:', error)
      alert('Failed to load equipment details')
      navigate('/equipment')
    } finally {
      setLoading(false)
    }
  }

  const handleEditEquipment = () => {
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
  }

  const handleEquipmentSuccess = () => {
    fetchEquipment() // Refresh the equipment data
    setModalOpen(false)
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      try {
        await axios.delete(`/api/equipment/${id}`)
        navigate('/equipment')
      } catch (error) {
        console.error('Error deleting equipment:', error)
        alert('Failed to delete equipment')
      }
    }
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
      'Available': CheckCircle,
      'In Use': Clock,
      'Maintenance': Wrench,
      'Retired': AlertTriangle
    }
    return iconConfig[status] || CheckCircle
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified'
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!equipment) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Equipment not found</h3>
        <p className="text-gray-600 mb-4">The equipment you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/equipment')} className="btn-primary">
          Back to Equipment
        </button>
      </div>
    )
  }

  const StatusIcon = getStatusIcon(equipment.status)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/equipment')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{equipment.name}</h1>
            <p className="text-gray-600">Equipment ID: {equipment.id}</p>
          </div>
        </div>
        <button
          onClick={handleEditEquipment}
          className="btn-primary flex items-center space-x-2"
        >
          <Edit className="w-4 h-4" />
          <span>Edit Equipment</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Details */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                <p className="text-sm text-gray-900">{equipment.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Category</label>
                <p className="text-sm text-gray-900">{equipment.category}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                <span className={`${getStatusBadge(equipment.status)} flex items-center space-x-1`}>
                  <StatusIcon className="w-3 h-3" />
                  <span>{equipment.status}</span>
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Location</label>
                <div className="flex items-center text-sm text-gray-900">
                  <MapPin className="w-4 h-4 mr-1" />
                  {equipment.location || 'Not specified'}
                </div>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Important Dates
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Purchase Date</label>
                <p className="text-sm text-gray-900">{formatDate(equipment.purchaseDate)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Last Maintenance</label>
                <p className="text-sm text-gray-900">{formatDate(equipment.lastMaintenance)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Added to System</label>
                <p className="text-sm text-gray-900">{formatDate(equipment.createdAt)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Last Updated</label>
                <p className="text-sm text-gray-900">{formatDate(equipment.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {equipment.notes && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Notes
              </h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{equipment.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handleEditEquipment}
                className="w-full btn-primary text-center"
              >
                Edit Equipment
              </button>
              <button className="w-full btn-warning">
                Schedule Maintenance
              </button>
              <button
                onClick={handleDelete}
                className="w-full btn-danger"
              >
                Delete Equipment
              </button>
            </div>
          </div>

          {/* Status History */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status History</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Current Status</span>
                <span className={`${getStatusBadge(equipment.status)}`}>
                  {equipment.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Last Updated</span>
                <span className="text-gray-900">{formatDate(equipment.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Equipment Modal */}
      <EquipmentModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        equipment={equipment}
        onSuccess={handleEquipmentSuccess}
      />
    </div>
  )
}
