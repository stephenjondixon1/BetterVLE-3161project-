import { useState, useEffect } from 'react';
import { assignmentAPI } from '../../services/api';
import GradeAssignment from './GradeAssignment';
import toast from 'react-hot-toast';

const GradeAssignmentModal = ({ assignmentId, assignmentWeight, students, courseCode, onClose, onGradeSuccess }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showGradeForm, setShowGradeForm] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, [assignmentId]);

  const fetchSubmissions = async () => {
    try {
      const response = await assignmentAPI.getAssignmentSubmissions(assignmentId);
      setSubmissions(response.data);
    } catch (error) {
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const getSubmissionForStudent = (studentId) => {
    return submissions.find(s => s.student_id == studentId);
  };

  const handleGradeSuccess = () => {
    fetchSubmissions();
    onGradeSuccess();
    setShowGradeForm(false);
    setSelectedStudent(null);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full">
          <div className="text-center py-10">Loading submissions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Grade Assignment #{assignmentId}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">
            ✕
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-gray-700">Weight: <span className="font-semibold">{assignmentWeight}%</span> of final grade</p>
          <p className="text-sm text-gray-500 mt-1">Course: {courseCode}</p>
        </div>

        {/* Submissions List */}
        <h3 className="font-semibold text-gray-800 mb-3">Student Submissions</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Student</th>
                <th className="px-4 py-2 text-left">Submission Date</th>
                <th className="px-4 py-2 text-left">Current Grade</th>
                <th className="px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => {
                const submission = getSubmissionForStudent(student.student_id);
                return (
                  <tr key={student.student_id} className="border-t">
                    <td className="px-4 py-3">
                      {student.first_name} {student.last_name}
                      <div className="text-xs text-gray-500">ID: {student.student_id}</div>
                    </td>
                    <td className="px-4 py-3">
                      {submission?.submission_date ? new Date(submission.submission_date).toLocaleDateString() : 'Not submitted'}
                    </td>
                    <td className="px-4 py-3">
                      {submission?.submission_grade ? (
                        <span className="font-semibold text-green-600">{submission.submission_grade}%</span>
                      ) : (
                        <span className="text-gray-400">Not graded</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                          setShowGradeForm(true);
                        }}
                        className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
                      >
                        {submission?.submission_grade ? 'Update Grade' : 'Grade'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            📝 Note: When you submit a grade, the student's final course average will be automatically recalculated
            based on all graded assignments and their weights.
          </p>
        </div>

        {/* Your existing GradeAssignment component */}
        {showGradeForm && selectedStudent && (
          <GradeAssignment
            assignmentId={assignmentId}
            studentId={selectedStudent.student_id}
            onGraded={handleGradeSuccess}
            onClose={() => {
              setShowGradeForm(false);
              setSelectedStudent(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default GradeAssignmentModal;