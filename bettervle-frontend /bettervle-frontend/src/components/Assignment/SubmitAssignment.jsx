import { useState } from 'react';
import { assignmentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const SubmitAssignment = ({ assignmentId, onSubmitted, onClose }) => {
  const [submission, setSubmission] = useState({ submission_content: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submission.submission_content.trim()) {
      toast.error('Please enter your submission content');
      return;
    }

    setSubmitting(true);
    try {
      await assignmentAPI.submitAssignment(assignmentId, submission);
      toast.success('Assignment submitted successfully!');
      onSubmitted();
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Submit Assignment #{assignmentId}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Your Submission</label>
            <textarea
              value={submission.submission_content}
              onChange={(e) => setSubmission({ submission_content: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows="6"
              placeholder="Write your assignment submission here..."
              required
            />
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Assignment'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitAssignment;