import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, data),
};

export const courseAPI = {
  getAll: () => api.get('/courses'),
  getStudentCourses: (studentId) => api.get(`/courses/students/${studentId}`),
  getLecturerCourses: (lecturerId) => api.get(`/courses/lecturers/${lecturerId}`),
  enroll: (courseCode, studentId) => api.post(`/courses/${courseCode}/register`, { student_id: studentId }),
  getMembers: (courseCode) => api.get(`/courses/${courseCode}/members`),
  getGrade: (studentId, courseCode) => api.get(`/courses/students/${studentId}/courses/${courseCode}/grade`),
};

export const forumAPI = {
  getForums: (courseCode) => api.get(`/forums/courses/${courseCode}/forums`),
  createForum: (courseCode) => api.post(`/forums/courses/${courseCode}/forums`),
  getThreads: (forumId) => api.get(`/forums/forums/${forumId}/threads`),
  createThread: (forumId, data) => api.post(`/forums/forums/${forumId}/threads`, data),
  getReplies: (threadId) => api.get(`/forums/threads/${threadId}/replies`),
  addReply: (threadId, data) => api.post(`/forums/threads/${threadId}/replies`, data),
};

export const contentAPI = {
  getCourseContent: (courseCode) => api.get(`/content/courses/${courseCode}/content`),
  createSection: (courseCode, data) => api.post(`/content/courses/${courseCode}/sections`, data),
  addLink: (sectionId, data) => api.post(`/content/sections/${sectionId}/links`, data),
  addSlide: (sectionId, data) => api.post(`/content/sections/${sectionId}/slides`, data),
  addFile: (sectionId, data) => api.post(`/content/sections/${sectionId}/files`, data),
};

export const assignmentAPI = {
  getSubmissions: (studentId) => api.get(`/assignments/students/${studentId}/submissions`),
  submitAssignment: (assignmentId, data) => api.post(`/assignments/assignments/${assignmentId}/submissions`, data),
  createAssignment: (courseCode, data) => api.post(`/assignments/courses/${courseCode}/assignments`, data),
  gradeSubmission: (assignmentId, studentId, data) =>
    api.put(`/assignments/assignments/${assignmentId}/submissions/${studentId}/grade`, data),
  getCourseAssignments: (courseCode) => api.get(`/users/courses/${courseCode}/assignments`),
  getAssignmentSubmissions: (assignmentId) => api.get(`/users/assignments/${assignmentId}/submissions`),
};

export const calendarAPI = {
  getCourseEvents: (courseCode) => api.get(`/calendar/courses/${courseCode}/events`),
  createEvent: (courseCode, data) => api.post(`/calendar/courses/${courseCode}/events`, data),
  getStudentEvents: (studentId, date) => api.get(`/calendar/students/${studentId}/events?date=${date}`),
};

export default api;