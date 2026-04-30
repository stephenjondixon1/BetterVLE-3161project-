import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AvailableCourses = ({ onEnrolled }) => {
  const { user } = useAuth();
  const [availableCourses, setAvailableCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const enrolledRes = await api.get(`/courses/students/${user.user_id}`);
      const enrolledIds = enrolledRes.data.map(c => c.course_code);
      setEnrolledCourses(enrolledIds);

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
    setEnrolling(courseCode);
    try {
      await api.post(`/courses/${courseCode}/register`, {
        student_id: user.user_id
      });
      toast.success(`Successfully enrolled in ${courseCode}!`);
      fetchData();
      if (onEnrolled) onEnrolled();
    } catch (error) {
      const message = error.response?.data?.message || 'Enrollment failed';
      toast.error(message);
    } finally {
      setEnrolling(null);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading available courses...</div>;
  }

  if (availableCourses.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <p className="text-green-700">You are enrolled in all available courses!</p>
        <p className="text-green-600 text-sm mt-2">Maximum is 6 courses per student.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Available Courses to Enroll</h2>
      <p className="text-gray-600 mb-4">
        You are currently enrolled in {enrolledCourses.length} of 6 maximum courses.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableCourses.map((course) => (
          <div key={course.course_code} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">{course.course_title}</h3>
            <p className="text-gray-600 mb-2">Code: {course.course_code}</p>
            <p className="text-sm text-gray-500 mb-4">
              Lecturer: {course.lecturer_name || 'Not assigned yet'}
            </p>
            <button
              onClick={() => handleEnroll(course.course_code)}
              disabled={enrolling === course.course_code || enrolledCourses.length >= 6}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {enrolling === course.course_code ? 'Enrolling...' : 'Enroll'}
            </button>
          </div>
        ))}
      </div>

      {enrolledCourses.length >= 6 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
          <p className="text-yellow-700">
            You have reached the maximum of 6 courses. You cannot enroll in more courses.
          </p>
        </div>
      )}
    </div>
  );
};

export default AvailableCourses;