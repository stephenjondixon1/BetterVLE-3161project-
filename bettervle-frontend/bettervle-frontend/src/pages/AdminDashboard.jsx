import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [showAssignLecturer, setShowAssignLecturer] = useState(false);
  const [showEnrollStudent, setShowEnrollStudent] = useState(false);
  const [newCourse, setNewCourse] = useState({ course_code: '', course_title: '' });
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedLecturer, setSelectedLecturer] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('courses');
  const [courses50Plus, setCourses50Plus] = useState([]);
  const [students5Plus, setStudents5Plus] = useState([]);
  const [lecturers3Plus, setLecturers3Plus] = useState([]);
  const [top10Courses, setTop10Courses] = useState([]);
  const [top10Students, setTop10Students] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  
  const [expandedReports, setExpandedReports] = useState({
    courses50Plus: false,
    students5Plus: false,
    lecturers3Plus: false,
    top10Courses: false,
    top10Students: false
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    if (studentSearch) {
      setFilteredStudents(
        students.filter(s =>
          s.student_id.toString().includes(studentSearch) ||
          s.first_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
          s.last_name.toLowerCase().includes(studentSearch.toLowerCase())
        )
      );
    } else {
      setFilteredStudents(students);
    }
  }, [studentSearch, students]);

  const fetchData = async () => {
    try {
      const [coursesRes, lecturersRes, studentsRes] = await Promise.all([
        api.get('/courses'),
        api.get('/users/lecturers'),
        api.get('/users/students')
      ]);
      setCourses(coursesRes.data);
      setLecturers(lecturersRes.data || []);
      setStudents(studentsRes.data || []);
      setFilteredStudents(studentsRes.data || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchReport = async (reportName, setDataFunction) => {
    setReportsLoading(true);
    try {
      let endpoint = '';
      switch (reportName) {
        case 'courses50Plus':
          endpoint = '/reports/courses-50-plus';
          break;
        case 'students5Plus':
          endpoint = '/reports/students-5-plus';
          break;
        case 'lecturers3Plus':
          endpoint = '/reports/lecturers-3-plus';
          break;
        case 'top10Courses':
          endpoint = '/reports/top-10-courses';
          break;
        case 'top10Students':
          endpoint = '/reports/top-10-students';
          break;
        default:
          return;
      }
      const response = await api.get(endpoint);
      setDataFunction(response.data);
      toast.success(`Loaded ${response.data.length} records`);
    } catch (error) {
      console.error(`Failed to load ${reportName}:`, error);
      toast.error('Failed to load report');
    } finally {
      setReportsLoading(false);
    }
  };

  const toggleReport = async (reportName, dataFunction, currentData) => {
    setExpandedReports(prev => ({
      ...prev,
      [reportName]: !prev[reportName]
    }));

    if (!expandedReports[reportName] && currentData.length === 0) {
      await fetchReport(reportName, dataFunction);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await api.post('/courses', newCourse);
      toast.success('Course created successfully!');
      setShowCreateCourse(false);
      setNewCourse({ course_code: '', course_title: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create course');
    }
  };

  const handleAssignLecturer = async () => {
    if (!selectedCourse || !selectedLecturer) {
      toast.error('Please select both course and lecturer');
      return;
    }
    try {
      await api.post(`/courses/${selectedCourse}/assign-lecturer`, {
        lecturer_id: selectedLecturer
      });
      toast.success('Lecturer assigned successfully!');
      setShowAssignLecturer(false);
      setSelectedCourse('');
      setSelectedLecturer('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Assignment failed');
    }
  };

  const handleEnrollStudent = async () => {
    if (!selectedCourse || !selectedStudent) {
      toast.error('Please select both course and student');
      return;
    }
    try {
      await api.post(`/courses/${selectedCourse}/register`, {
        student_id: selectedStudent
      });
      toast.success('Student enrolled successfully!');
      setShowEnrollStudent(false);
      setSelectedCourse('');
      setSelectedStudent('');
      setStudentSearch('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Enrollment failed');
    }
  };

  if (user?.role !== 'admin') {
    return <div className="text-center py-10">Admin access only</div>;
  }

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="flex space-x-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('courses')}
          className={`pb-2 px-4 ${activeTab === 'courses'
              ? 'text-indigo-600 border-b-2 border-indigo-600 font-semibold'
              : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          Course Management
        </button>
        <button
          onClick={() => setActiveTab('enroll')}
          className={`pb-2 px-4 ${activeTab === 'enroll'
              ? 'text-indigo-600 border-b-2 border-indigo-600 font-semibold'
              : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          Student Enrollment
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-2 px-4 ${activeTab === 'reports'
              ? 'text-indigo-600 border-b-2 border-indigo-600 font-semibold'
              : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          📊 Reports & Analytics
        </button>
      </div>

      {activeTab === 'courses' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => setShowCreateCourse(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              + Create Course
            </button>
            <button
              onClick={() => setShowAssignLecturer(true)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Assign Lecturer to Course
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <h2 className="text-xl font-bold p-4 bg-gray-100">All Courses</h2>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left">Code</th>
                    <th className="px-4 py-2 text-left">Title</th>
                    <th className="px-4 py-2 text-left">Lecturer</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map(course => (
                    <tr key={course.course_code} className="border-t">
                      <td className="px-4 py-2">{course.course_code}</td>
                      <td className="px-4 py-2">{course.course_title}</td>
                      <td className="px-4 py-2">{course.lecturer_name || 'Not assigned'}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => {
                            setSelectedCourse(course.course_code);
                            setShowAssignLecturer(true);
                          }}
                          className="text-indigo-600 hover:underline text-sm"
                        >
                          Assign Lecturer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'enroll' && (
        <div>
          <button
            onClick={() => setShowEnrollStudent(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-6"
          >
            Enroll Student in Course
          </button>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <h2 className="text-xl font-bold p-4 bg-gray-100">All Students (First 50)</h2>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Major</th>
                    <th className="px-4 py-2 text-left">Department</th>
                    <th className="px-4 py-2 text-left">GPA</th>
                  </tr>
                </thead>
                <tbody>
                  {students.slice(0, 50).map(student => (
                    <tr key={student.student_id} className="border-t">
                      <td className="px-4 py-2">{student.student_id}</td>
                      <td className="px-4 py-2">{student.first_name} {student.last_name}</td>
                      <td className="px-4 py-2">{student.major}</td>
                      <td className="px-4 py-2">{student.department}</td>
                      <td className="px-4 py-2">{student.gpa}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <button
              onClick={() => toggleReport('courses50Plus', setCourses50Plus, courses50Plus)}
              className="w-full px-6 py-4 bg-indigo-50 hover:bg-indigo-100 flex justify-between items-center transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📚</span>
                <h2 className="text-lg font-semibold text-indigo-800">Courses with 50+ Students</h2>
                <span className="text-sm text-gray-500">
                  {courses50Plus.length > 0 && `(${courses50Plus.length} courses)`}
                </span>
              </div>
              <span className="text-2xl">{expandedReports.courses50Plus ? '▼' : '▶'}</span>
            </button>

            {expandedReports.courses50Plus && (
              <div className="p-4 border-t">
                {reportsLoading && courses50Plus.length === 0 ? (
                  <div className="text-center py-8">Loading...</div>
                ) : courses50Plus.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No courses with 50+ students.</p>
                ) : (
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left">Course Code</th>
                          <th className="px-4 py-2 text-left">Course Title</th>
                          <th className="px-4 py-2 text-left">Total Students</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courses50Plus.map((course, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-2">{course.course_code}</td>
                            <td className="px-4 py-2">{course.course_title}</td>
                            <td className="px-4 py-2 font-semibold text-green-600">{course.total_students}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <button
              onClick={() => toggleReport('students5Plus', setStudents5Plus, students5Plus)}
              className="w-full px-6 py-4 bg-green-50 hover:bg-green-100 flex justify-between items-center transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">👨‍🎓</span>
                <h2 className="text-lg font-semibold text-green-800">Students Enrolled in 5+ Courses</h2>
                <span className="text-sm text-gray-500">
                  {students5Plus.length > 0 && `(${students5Plus.length} students)`}
                </span>
              </div>
              <span className="text-2xl">{expandedReports.students5Plus ? '▼' : '▶'}</span>
            </button>

            {expandedReports.students5Plus && (
              <div className="p-4 border-t">
                {reportsLoading && students5Plus.length === 0 ? (
                  <div className="text-center py-8">Loading...</div>
                ) : students5Plus.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No students with 5+ courses.</p>
                ) : (
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left">Student ID</th>
                          <th className="px-4 py-2 text-left">Name</th>
                          <th className="px-4 py-2 text-left">Total Courses</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students5Plus.map((student, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-2">{student.student_id}</td>
                            <td className="px-4 py-2">{student.sf_name} {student.sl_name}</td>
                            <td className="px-4 py-2 font-semibold text-blue-600">{student.total_courses}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <button
              onClick={() => toggleReport('lecturers3Plus', setLecturers3Plus, lecturers3Plus)}
              className="w-full px-6 py-4 bg-purple-50 hover:bg-purple-100 flex justify-between items-center transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">👨‍🏫</span>
                <h2 className="text-lg font-semibold text-purple-800">Lecturers Teaching 3+ Courses</h2>
                <span className="text-sm text-gray-500">
                  {lecturers3Plus.length > 0 && `(${lecturers3Plus.length} lecturers)`}
                </span>
              </div>
              <span className="text-2xl">{expandedReports.lecturers3Plus ? '▼' : '▶'}</span>
            </button>

            {expandedReports.lecturers3Plus && (
              <div className="p-4 border-t">
                {reportsLoading && lecturers3Plus.length === 0 ? (
                  <div className="text-center py-8">Loading...</div>
                ) : lecturers3Plus.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No lecturers with 3+ courses.</p>
                ) : (
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left">Lecturer ID</th>
                          <th className="px-4 py-2 text-left">Name</th>
                          <th className="px-4 py-2 text-left">Total Courses</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lecturers3Plus.map((lecturer, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-2">{lecturer.lecturer_id}</td>
                            <td className="px-4 py-2">{lecturer.lf_name} {lecturer.ll_name}</td>
                            <td className="px-4 py-2 font-semibold text-purple-600">{lecturer.total_courses}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <button
              onClick={() => toggleReport('top10Courses', setTop10Courses, top10Courses)}
              className="w-full px-6 py-4 bg-yellow-50 hover:bg-yellow-100 flex justify-between items-center transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🏆</span>
                <h2 className="text-lg font-semibold text-yellow-800">Top 10 Most Enrolled Courses</h2>
                <span className="text-sm text-gray-500">
                  {top10Courses.length > 0 && `(${top10Courses.length} courses)`}
                </span>
              </div>
              <span className="text-2xl">{expandedReports.top10Courses ? '▼' : '▶'}</span>
            </button>

            {expandedReports.top10Courses && (
              <div className="p-4 border-t">
                {reportsLoading && top10Courses.length === 0 ? (
                  <div className="text-center py-8">Loading...</div>
                ) : top10Courses.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No data available.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left">Rank</th>
                          <th className="px-4 py-2 text-left">Course Code</th>
                          <th className="px-4 py-2 text-left">Course Title</th>
                          <th className="px-4 py-2 text-left">Total Students</th>
                        </tr>
                      </thead>
                      <tbody>
                        {top10Courses.map((course, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-2 font-bold">#{index + 1}</td>
                            <td className="px-4 py-2">{course.course_code}</td>
                            <td className="px-4 py-2">{course.course_title}</td>
                            <td className="px-4 py-2 font-semibold text-yellow-600">{course.total_students}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <button
              onClick={() => toggleReport('top10Students', setTop10Students, top10Students)}
              className="w-full px-6 py-4 bg-red-50 hover:bg-red-100 flex justify-between items-center transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">⭐</span>
                <h2 className="text-lg font-semibold text-red-800">Top 10 Students - Highest Overall Averages</h2>
                <span className="text-sm text-gray-500">
                  {top10Students.length > 0 && `(${top10Students.length} students)`}
                </span>
              </div>
              <span className="text-2xl">{expandedReports.top10Students ? '▼' : '▶'}</span>
            </button>

            {expandedReports.top10Students && (
              <div className="p-4 border-t">
                {reportsLoading && top10Students.length === 0 ? (
                  <div className="text-center py-8">Loading...</div>
                ) : top10Students.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No data available.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left">Rank</th>
                          <th className="px-4 py-2 text-left">Student ID</th>
                          <th className="px-4 py-2 text-left">Name</th>
                          <th className="px-4 py-2 text-left">Average Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {top10Students.map((student, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-2 font-bold">#{index + 1}</td>
                            <td className="px-4 py-2">{student.student_id}</td>
                            <td className="px-4 py-2">{student.sf_name} {student.sl_name}</td>
                            <td className="px-4 py-2 font-semibold text-green-600">{student.avg_grade}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {showCreateCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Create New Course</h2>
            <form onSubmit={handleCreateCourse}>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Course Code</label>
                <input
                  type="text"
                  value={newCourse.course_code}
                  onChange={(e) => setNewCourse({ ...newCourse, course_code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                  placeholder="e.g., CS101"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Course Title</label>
                <input
                  type="text"
                  value={newCourse.course_title}
                  onChange={(e) => setNewCourse({ ...newCourse, course_title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                  placeholder="e.g., Introduction to Programming"
                />
              </div>
              <div className="flex space-x-2">
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">Create</button>
                <button onClick={() => setShowCreateCourse(false)} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAssignLecturer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Assign Lecturer to Course</h2>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Select Course</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Choose a course...</option>
                {courses.map(course => (
                  <option key={course.course_code} value={course.course_code}>
                    {course.course_title} ({course.course_code})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Select Lecturer</label>
              <select
                value={selectedLecturer}
                onChange={(e) => setSelectedLecturer(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Choose a lecturer...</option>
                {lecturers.map(lecturer => (
                  <option key={lecturer.lecturer_id} value={lecturer.lecturer_id}>
                    {lecturer.first_name} {lecturer.last_name} (ID: {lecturer.lecturer_id})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex space-x-2">
              <button onClick={handleAssignLecturer} className="bg-green-600 text-white px-4 py-2 rounded">Assign</button>
              <button onClick={() => setShowAssignLecturer(false)} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showEnrollStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Enroll Student in Course</h2>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Select Course</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Choose a course...</option>
                {courses.map(course => (
                  <option key={course.course_code} value={course.course_code}>
                    {course.course_title} ({course.course_code})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Search Student</label>
              <input
                type="text"
                placeholder="Search by ID or name..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg mb-2"
              />
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                size="5"
              >
                <option value="">Choose a student...</option>
                {filteredStudents.map(student => (
                  <option key={student.student_id} value={student.student_id}>
                    ID: {student.student_id} - {student.first_name} {student.last_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex space-x-2">
              <button onClick={handleEnrollStudent} className="bg-blue-600 text-white px-4 py-2 rounded">Enroll</button>
              <button onClick={() => setShowEnrollStudent(false)} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;