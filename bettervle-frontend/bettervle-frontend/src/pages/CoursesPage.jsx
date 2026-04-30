import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { courseAPI } from '../services/api';
import CourseContent from '../components/Course/CourseContent';
import AvailableCourses from '../components/Course/AvailableCourses';
import CourseMembers from '../components/Course/CourseMembers';
import ManageContent from '../components/Content/ManageContent';
import toast from 'react-hot-toast';

const CoursesPage = () => {
  const { courseCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my-courses');
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedCourseForMembers, setSelectedCourseForMembers] = useState(null);
  const [managingContent, setManagingContent] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, [user]);

  useEffect(() => {
    if (courseCode && courses.length > 0) {
      const course = courses.find(c => c.course_code === courseCode);
      setSelectedCourse(course);
    }
  }, [courseCode, courses]);

  const fetchCourses = async () => {
    try {
      let response;
      if (user.role === 'student') {
        response = await courseAPI.getStudentCourses(user.user_id);
      } else if (user.role === 'lecturer') {
        response = await courseAPI.getLecturerCourses(user.user_id);
      } else {
        response = await courseAPI.getAll();
      }
      setCourses(response.data);
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrolled = () => {
    fetchCourses();
    setActiveTab('my-courses');
  };

  if (loading) {
    return <div className="text-center py-10">Loading courses...</div>;
  }

  if (selectedCourse) {
    return <CourseContent course={selectedCourse} onBack={() => setSelectedCourse(null)} />;
  }

  if (managingContent) {
    return (
      <ManageContent
        courseCode={managingContent.course_code}
        courseTitle={managingContent.course_title}
        onBack={() => setManagingContent(null)}
      />
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Courses</h1>

      {user.role === 'student' && (
        <div className="flex space-x-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('my-courses')}
            className={`pb-2 px-4 ${activeTab === 'my-courses'
              ? 'text-indigo-600 border-b-2 border-indigo-600 font-semibold'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            My Courses ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className={`pb-2 px-4 ${activeTab === 'available'
              ? 'text-indigo-600 border-b-2 border-indigo-600 font-semibold'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Browse Available Courses
          </button>
        </div>
      )}

      {activeTab === 'my-courses' && (
        <>
          {courses.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500">You are not enrolled in any courses yet.</p>
              {user.role === 'student' && (
                <button
                  onClick={() => setActiveTab('available')}
                  className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                  Browse Available Courses
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course.course_code}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{course.course_title}</h3>
                    <p className="text-gray-600 mb-2">Code: {course.course_code}</p>
                    {course.lecturer_name && (
                      <p className="text-sm text-gray-500">Lecturer: {course.lecturer_name}</p>
                    )}
                    {course.grade && (
                      <p className="text-sm font-semibold mt-2 text-green-600">
                        Final Grade: {course.grade}%
                      </p>
                    )}

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => setSelectedCourse(course)}
                        className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 text-sm"
                      >
                        View Content
                      </button>
                      <button
                        onClick={() => navigate(`/forums/${course.course_code}`)}
                        className="bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 text-sm"
                        title="View Forums"
                      >
                        💬
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCourseForMembers(course);
                          setShowMembersModal(true);
                        }}
                        className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-sm"
                        title="View Course Members"
                      >
                        👥
                      </button>
                      {user.role === 'lecturer' && (
                        <button
                          onClick={() => setManagingContent(course)}
                          className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 text-sm"
                          title="Manage Course Content"
                        >
                          ✏️
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'available' && user.role === 'student' && (
        <AvailableCourses onEnrolled={handleEnrolled} />
      )}

      {showMembersModal && selectedCourseForMembers && (
        <CourseMembers
          courseCode={selectedCourseForMembers.course_code}
          onClose={() => {
            setShowMembersModal(false);
            setSelectedCourseForMembers(null);
          }}
        />
      )}
    </div>
  );
};

export default CoursesPage;