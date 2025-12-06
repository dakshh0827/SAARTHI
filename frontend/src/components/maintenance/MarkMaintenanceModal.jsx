import { useState, useMemo } from 'react';
import { FaTimes, FaWrench, FaSearch } from 'react-icons/fa';
import api from '../../lib/axios';
import LoadingSpinner from '../common/LoadingSpinner';

export default function MarkMaintenanceModal({ 
  isOpen, 
  onClose, 
  equipment, // Can be null if triggered via Sidebar/+ button
  allEquipment = [], // List of equipment for the dropdown
  onSuccess 
}) {
  const [maintenanceType, setMaintenanceType] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Selection state for global trigger
  const [selectedEqId, setSelectedEqId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Determine which equipment we are acting on
  const targetEquipment = equipment || allEquipment.find(eq => eq.id === selectedEqId);

  // Filter equipment for the dropdown search
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return allEquipment;
    return allEquipment.filter(eq => 
      eq.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      eq.equipmentId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allEquipment, searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetEquipment) {
      setError('Please select equipment first');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await api.post(`/maintenance/mark/${targetEquipment.id}`, {
        maintenanceType,
        notes
      });

      onSuccess?.();
      onClose();
      // Reset states
      setMaintenanceType('');
      setNotes('');
      setSelectedEqId('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark maintenance');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
               <FaWrench className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">Mark Maintenance</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* CASE 1: Equipment Pre-selected (Table Action) */}
          {equipment ? (
            <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-100">
              <p className="text-sm font-bold text-gray-800">{equipment.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">ID: {equipment.equipmentId}</p>
            </div>
          ) : (
            /* CASE 2: Global Trigger (Sidebar/Button) - Show Search/Select */
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Equipment
              </label>
              
              {/* Search Box */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                <input 
                  type="text"
                  placeholder="Filter equipment..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 rounded-t-lg focus:outline-none focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Select Dropdown */}
              <select
                value={selectedEqId}
                onChange={(e) => setSelectedEqId(e.target.value)}
                className="w-full px-3 py-2 border border-t-0 border-gray-300 rounded-b-lg focus:ring-2 focus:ring-blue-500 bg-white"
                required
                size={5} // Shows multiple lines like a list
              >
                {filteredOptions.length === 0 ? (
                  <option disabled>No equipment found</option>
                ) : (
                  filteredOptions.map(eq => (
                    <option key={eq.id} value={eq.id} className="py-1">
                      {eq.name} ({eq.equipmentId})
                    </option>
                  ))
                )}
              </select>
              {selectedEqId && (
                <p className="text-xs text-emerald-600 font-medium text-right">
                  Selected: {allEquipment.find(e => e.id === selectedEqId)?.name}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maintenance Type
            </label>
            <select
              value={maintenanceType}
              onChange={(e) => setMaintenanceType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select type</option>
              <option value="Preventive Maintenance">Preventive Maintenance</option>
              <option value="Corrective Maintenance">Corrective Maintenance</option>
              <option value="Calibration">Calibration</option>
              <option value="Inspection">Inspection</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Parts Replacement">Parts Replacement</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Add details about the maintenance..."
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-medium"
              disabled={isSubmitting || (!equipment && !selectedEqId)}
            >
              {isSubmitting && <LoadingSpinner size="sm" />}
              Mark Complete
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}