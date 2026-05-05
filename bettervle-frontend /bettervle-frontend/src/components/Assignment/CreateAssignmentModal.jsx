import { useState } from 'react';
import { assignmentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const CreateAssignmentModal = ({ courseCode, onClose, onAssignmentCreated }) => {
  const [weight, setWeight] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0 || weightNum > 100) {
      toast.error('Please enter a valid weight between 1 and 100');
      return;
    }

    setSubmitting(true);
    try {
      await assignmentAPI.createAssignment(courseCode, { weight: weightNum });
      toast.success('Assignment created successfully!');
      onAssignmentCreated();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create assignment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Create Assignment</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">
            ✕
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          Course: <span className="font-semibold">{courseCode}</span>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Assignment Weight (% of final grade) *
            </label>
            <input
              type="number"
              step="0.01"
              min="1"
              max="100"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., 25"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              This determines how much this assignment contributes to the final grade
            </p>
          </div>

          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Assignment'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAssignmentModal;