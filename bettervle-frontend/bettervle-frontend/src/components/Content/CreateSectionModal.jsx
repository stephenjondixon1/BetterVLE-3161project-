import { useState } from 'react';
import { contentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const CreateSectionModal = ({ courseCode, existingSections, onClose, onSectionCreated }) => {
  const [sectionNum, setSectionNum] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getNextSectionNumber = () => {
    if (existingSections.length === 0) return 1;
    const maxNum = Math.max(...existingSections.map(s => s.section_num));
    return maxNum + 1;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const num = parseInt(sectionNum);

    if (isNaN(num) || num < 1) {
      toast.error('Section number must be a positive number');
      return;
    }

    if (existingSections.some(s => s.section_num === num)) {
      toast.error(`Section ${num} already exists. Please use a different number.`);
      return;
    }

    setSubmitting(true);
    try {
      await contentAPI.createSection(courseCode, { section_num: num });
      toast.success(`Section ${num} created successfully!`);
      onSectionCreated();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create section');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Create New Section</h2>
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
              Section Number *
            </label>
            <input
              type="number"
              min="1"
              value={sectionNum}
              onChange={(e) => setSectionNum(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={`Suggested: ${getNextSectionNumber()}`}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Existing sections: {existingSections.map(s => s.section_num).join(', ') || 'None'}
            </p>
          </div>

          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Section'}
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

export default CreateSectionModal;