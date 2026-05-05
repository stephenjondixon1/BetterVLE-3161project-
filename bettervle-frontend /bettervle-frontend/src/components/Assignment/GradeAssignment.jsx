import { useState } from 'react';
import { assignmentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const GradeAssignment = ({ assignmentId, studentId, onGraded, onClose }) => {
  const [grade, setGrade] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const gradeNum = parseFloat(grade);
    if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 100) {
      toast.error('Please enter a valid grade between 0 and 100');
      return;
    }

    setSubmitting(true);
    try {
      console.log('Submitting grade:', { assignmentId, studentId, grade: gradeNum });
      const response = await assignmentAPI.gradeSubmission(assignmentId, studentId, { submission_grade: gradeNum });
      console.log('Grade response:', response);
      toast.success('Grade submitted successfully! Final course average will be updated automatically.');
      onGraded();
      onClose();
    } catch (error) {
      console.error('Grade error:', error);
      console.error('Error response:', error.response);
      toast.error(error.response?.data?.message || 'Failed to submit grade');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Grade Assignment #{assignmentId}</h2>
        <p className="mb-4 text-gray-600">Student ID: {studentId}</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Grade (0-100)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="flex space-x-2">
            <button type="submit" disabled={submitting} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50">
              {submitting ? 'Saving...' : 'Save Grade'}
            </button>
            <button type="button" onClick={onClose} className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GradeAssignment;