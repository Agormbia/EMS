import { useState, useEffect, forwardRef } from 'react'
import { 
  Save, 
  X, 
  Package, 
  MapPin, 
  Calendar, 
  FileText,
  AlertCircle
} from 'lucide-react'
import axios from 'axios'

const EquipmentModal = forwardRef(({ isOpen, onClose, equipment = null, onSuccess }, ref) => {
  const isEditing = Boolean(equipment)
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    status: 'Available',
    location: '',
    purchaseDate: '',
    lastMaintenance: '',
    notes: ''
  })
  
  const [categories, setCategories] = useState([])
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      fetchFormData()
      if (equipment) {
        // Format dates for input fields
        setFormData({
          ...equipment,
          purchaseDate: equipment.purchaseDate ? equipment.purchaseDate.split('T')[0] : '',
          lastMaintenance: equipment.lastMaintenance ? equipment.lastMaintenance.split('T')[0] : ''
        })
      } else {
        // Reset form for new equipment
        setFormData({
          name: '',
          category: '',
          status: 'Available',
          location: '',
          purchaseDate: '',
          lastMaintenance: '',
          notes: ''
        })
      }
      setErrors({})
    }
  }, [isOpen, equipment])

  const fetchFormData = async () => {
    try {
      const [categoriesRes, locationsRes] = await Promise.all([
        axios.get('/api/equipment/categories'),
        axios.get('/api/equipment/locations')
      ])

      setCategories(categoriesRes.data)
      setLocations(locationsRes.data)
    } catch (error) {
      console.error('Error fetching form data:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Equipment name is required'
    }

    if (!formData.category) {
      newErrors.category = 'Category is required'
    }

    if (!formData.status) {
      newErrors.status = 'Status is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      if (isEditing) {
        await axios.put(`/api/equipment/${equipment.id}`, formData)
      } else {
        await axios.post('/api/equipment', formData)
      }
      
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error saving equipment:', error)
      alert('Failed to save equipment')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {isEditing ? 'Edit Equipment' : 'Add New Equipment'}
                </h3>
                <p className="text-sm text-gray-500">
                  {isEditing ? 'Update equipment information' : 'Add a new piece of equipment to your inventory'}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={loading}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4">
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Basic Information
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Equipment Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`input ${errors.name ? 'border-danger-500' : ''}`}
                      placeholder="Enter equipment name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-danger-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={`select ${errors.category ? 'border-danger-500' : ''}`}
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-1 text-sm text-danger-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.category}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className={`select ${errors.status ? 'border-danger-500' : ''}`}
                  >
                    <option value="Available">Available</option>
                    <option value="In Use">In Use</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Retired">Retired</option>
                  </select>
                  {errors.status && (
                    <p className="mt-1 text-sm text-danger-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.status}
                    </p>
                  )}
                </div>
              </div>

              {/* Location & Dates */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Location & Dates
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <select
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="select"
                    >
                      <option value="">Select a location</option>
                      {locations.map((location) => (
                        <option key={location.id} value={location.name}>
                          {location.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Purchase Date
                    </label>
                    <input
                      type="date"
                      name="purchaseDate"
                      value={formData.purchaseDate}
                      onChange={handleInputChange}
                      className="input"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Maintenance Date
                  </label>
                  <input
                    type="date"
                    name="lastMaintenance"
                    value={formData.lastMaintenance}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Additional Information
                </h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={4}
                    className="input resize-none"
                    placeholder="Enter any additional notes about the equipment..."
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary flex items-center space-x-2"
                disabled={loading}
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center space-x-2"
                disabled={loading}
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving...' : (isEditing ? 'Update Equipment' : 'Add Equipment')}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
})

EquipmentModal.displayName = 'EquipmentModal'

export default EquipmentModal
