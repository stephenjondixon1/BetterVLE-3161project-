import { useState } from 'react';
import { forumAPI } from '../../services/api';
import toast from 'react-hot-toast';

const CreateForumModal = ({ courseCode, onClose, onForumCreated }) => {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await forumAPI.createForum(courseCode);
      toast.success('Forum created successfully!');
      if (onForumCreated) onForumCreated();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create forum');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Create New Forum</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        <p className="text-gray-600 mb-2">
          Course: <span className="font-semibold">{courseCode}</span>
        </p>

        <p className="text-gray-600 mb-6">
          Creating a new discussion forum for this course. Students and lecturers can participate in discussions.
        </p>

        <div className="flex space-x-2">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create Forum'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateForumModal;