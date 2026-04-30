import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { assignmentAPI } from '../services/api';
import toast from 'react-hot-toast';

const AssignmentsPage = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user.role === 'student') {
      fetchSubmissions();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchSubmissions = async () => {
    try {
      const response = await assignmentAPI.getSubmissions(user.user_id);
      setSubmissions(response.data);
    } catch (error) {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading assignments...</div>;
  }

  if (user.role !== 'student') {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500">Only students can view assignments.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Assignments</h1>
      {submissions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">No assignments submitted yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left">Course</th>
                <th className="px-6 py-3 text-left">Assignment ID</th>
                <th className="px-6 py-3 text-left">Weight</th>
                <th className="px-6 py-3 text-left">Grade</th>
                <th className="px-6 py-3 text-left">Submitted Date</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub.assign_id} className="border-t">
                  <td className="px-6 py-4">{sub.course_code}</td>
                  <td className="px-6 py-4">{sub.assign_id}</td>
                  <td className="px-6 py-4">{sub.weight}%</td>
                  <td className="px-6 py-4">
                    {sub.submission_grade ? `${sub.submission_grade}%` : 'Not graded'}
                  </td>
                  <td className="px-6 py-4">
                    {sub.submission_date ? new Date(sub.submission_date).toLocaleDateString() : 'Not submitted'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AssignmentsPage;