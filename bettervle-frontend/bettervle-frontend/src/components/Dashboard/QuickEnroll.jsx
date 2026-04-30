import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const QuickEnroll = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAvailableCourses = async () => {
    setLoading(true);
    try {
      const enrolledRes = await api.get(`/courses/students/${user.user_id}`);
      const enrolledIds = enrolledRes.data.map(c => c.course_code);
      const allCoursesRes = await api.get('/courses');
      const available = allCoursesRes.data.filter(c => !enrolledIds.includes(c.course_code));
      setAvailableCourses(available);
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseCode) => {
    try {
      await api.post(`/courses/${courseCode}/register`, { student_id: user.user_id });
      toast.success(`Enrolled in ${courseCode}!`);
      setShowModal(false);
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Enrollment failed');
    }
  };

  return (
    <>
      <button
        onClick={() => {
          fetchAvailableCourses();
          setShowModal(true);
        }}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        + Enroll in New Course
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Enroll in a Course</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            {loading ? (
              <p>Loading available courses...</p>
            ) : availableCourses.length === 0 ? (
              <p className="text-gray-500">You are enrolled in all available courses!</p>
            ) : (
              <div className="space-y-3">
                {availableCourses.map(course => (
                  <div key={course.course_code} className="border rounded-lg p-3">
                    <h3 className="font-semibold">{course.course_title}</h3>
                    <p className="text-sm text-gray-600">{course.course_code}</p>
                    <button
                      onClick={() => handleEnroll(course.course_code)}
                      className="mt-2 bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
                    >
                      Enroll
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default QuickEnroll;