import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CourseMembers = ({ courseCode, onClose }) => {
  const { user } = useAuth();
  const [members, setMembers] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, [courseCode]);

  const fetchMembers = async () => {
    try {
      const response = await api.get(`/courses/${courseCode}/members`);
      setMembers(response.data);
    } catch (error) {
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
          <div className="text-center py-10">Loading members...</div>
        </div>
      </div>
    );
  }

  const isStudent = user?.role === 'student';
  const isLecturer = user?.role === 'lecturer';
  const isAdmin = user?.role === 'admin';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Course Members: {courseCode}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Lecturer Section */}
        {members?.lecturer && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-green-600 flex items-center">
              <span className="mr-2">👨‍🏫</span> Lecturer
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="font-medium">{members.lecturer.first_name} {members.lecturer.last_name}</p>
              <p className="text-sm text-gray-600">Department: {members.lecturer.department}</p>
              <p className="text-sm text-gray-500">ID: {members.lecturer.lecturer_id}</p>
            </div>
          </div>
        )}

        {!members?.lecturer && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-yellow-600">Lecturer</h3>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <p className="text-yellow-700">No lecturer assigned to this course yet.</p>
            </div>
          </div>
        )}

        {/* Students Section */}
        <div>
          <h3 className="text-lg font-semibold mb-2 text-blue-600 flex items-center">
            <span className="mr-2">👨‍🎓</span> Students ({members?.students?.length || 0})
          </h3>

          {members?.students?.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-gray-500">No students enrolled in this course yet.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {members?.students?.map((student, index) => (
                <div key={student.student_id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{student.first_name} {student.last_name}</p>
                      <p className="text-sm text-gray-600">Major: {student.major}</p>
                      <p className="text-sm text-gray-500">Department: {student.department}</p>
                      <p className="text-xs text-gray-400">ID: {student.student_id}</p>
                    </div>

                    {/* Only show grades to Lecturers and Admins */}
                    {(isLecturer || isAdmin) && student.grade && (
                      <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-semibold">
                        Grade: {student.grade}%
                      </div>
                    )}

                    {/* For students, show a placeholder or nothing */}
                    {isStudent && (
                      <div className="text-gray-400 text-sm">
                        {/* No grade visible to students */}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Privacy Notice for Students */}
        {isStudent && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-600">
            <p>🔒 Student grades are private and only visible to you and course lecturers.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseMembers;