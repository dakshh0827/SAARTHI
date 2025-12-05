import { useState } from 'react';
import { FaTimes, FaWrench } from 'react-icons/fa';
import api from '../../lib/axios';
import LoadingSpinner from '../common/LoadingSpinner';

export default function MarkMaintenanceModal({ isOpen, onClose, equipment, onSuccess }) {
  const [maintenanceType, setMaintenanceType] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await api.post(`/maintenance/mark/${equipment.id}`, {
        maintenanceType,
        notes
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark maintenance');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FaWrench className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold">Mark Maintenance</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="text-sm font-medium">{equipment.name}</p>
          <p className="text-xs text-gray-500">{equipment.equipmentId}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Add any additional notes about the maintenance performed..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={isSubmitting}
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