import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { contentAPI } from '../../services/api';
import CourseMembers from './CourseMembers';
import CreateEventModal from '../Calendar/CreateEventModal';
import CourseEventList from '../Calendar/CourseEventList';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AssignmentList from '../Assignment/AssignmentList';

const CourseContent = ({ course, onBack }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState({ sections: [], links: [], slides: [], files: [] });
  const [loading, setLoading] = useState(true);
  const [showMembers, setShowMembers] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [refreshEvents, setRefreshEvents] = useState(0);
  const [showAssignments, setShowAssignments] = useState(false);

  useEffect(() => {
    fetchContent();
  }, [course.course_code]);

  const fetchContent = async () => {
    try {
      const response = await contentAPI.getCourseContent(course.course_code);
      console.log('Fetched content:', response.data);
      setContent(response.data);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Failed to load course content');
    } finally {
      setLoading(false);
    }
  };

  const handleEventCreated = () => {
    setRefreshEvents(prev => prev + 1);
  };

  if (loading) {
    return <div className="text-center py-10">Loading course content...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <button onClick={onBack} className="text-indigo-600 hover:underline">
          ← Back to Courses
        </button>

        <div className="flex gap-2">          
          <button
            onClick={() => setShowMembers(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            👥 View Members
          </button>

          <button
            onClick={() => navigate(`/forums/${course.course_code}`)}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            💬 Forums
          </button>

          {(user?.role === 'lecturer' || user?.role === 'admin') && (
            <button
              onClick={() => setShowCreateEvent(true)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              📅 Create Event
            </button>
          )}
          {user.role === 'student' || user.role === 'lecturer' ? (
            <button
              onClick={() => setShowAssignments(!showAssignments)}
              className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
            >
              📝 {showAssignments ? 'Hide' : 'View'} Assignments
            </button>
          ) : null}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold">{course.course_title}</h1>
        <p className="text-gray-600">Course Code: {course.course_code}</p>
        {course.lecturer_name && (
          <p className="text-sm text-gray-500 mt-1">Lecturer: {course.lecturer_name}</p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <span className="mr-2">📅</span> Upcoming Events
        </h2>
        <CourseEventList
          courseCode={course.course_code}
          key={refreshEvents}
        />
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-4">Course Materials</h2>

        {content.sections.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">No course content available yet.</p>
            {user?.role === 'lecturer' && (
              <button
                onClick={onBack}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Go back to add content
              </button>
            )}
          </div>
        ) : (
          content.sections.map((section) => {
            const sectionLinks = content.links?.filter(link => link.section_id === section.section_id) || [];
            const sectionSlides = content.slides?.filter(slide => slide.section_id === section.section_id) || [];
            const sectionFiles = content.files?.filter(file => file.section_id === section.section_id) || [];
            const hasContent = sectionLinks.length > 0 || sectionSlides.length > 0 || sectionFiles.length > 0;

            return (
              <div key={section.section_id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-indigo-600 px-6 py-3">
                  <h2 className="text-xl font-semibold text-white">
                    Section {section.section_num}
                  </h2>
                </div>

                <div className="p-6">
                  {!hasContent ? (
                    <p className="text-gray-500 text-center py-4">No content in this section yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {sectionLinks.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
                            <span className="text-xl mr-2">🔗</span> Links
                          </h3>
                          <div className="space-y-2 ml-6">
                            {sectionLinks.map(link => (
                              <div key={link.item_id} className="p-2 bg-gray-50 rounded hover:bg-gray-100">
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:underline font-medium"
                                >
                                  {link.link_name || link.item_name}
                                </a>
                                {link.link_name !== link.item_name && link.item_name && (
                                  <p className="text-sm text-gray-500">{link.item_name}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {sectionSlides.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
                            <span className="text-xl mr-2">📊</span> Lecture Slides
                          </h3>
                          <div className="space-y-2 ml-6">
                            {sectionSlides.map(slide => (
                              <div key={slide.item_id} className="p-2 bg-gray-50 rounded hover:bg-gray-100">
                                <a
                                  href={slide.slide_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:underline font-medium"
                                >
                                  {slide.slideset_name || slide.item_name}
                                </a>
                                {slide.slideset_name !== slide.item_name && slide.item_name && (
                                  <p className="text-sm text-gray-500">{slide.item_name}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {sectionFiles.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
                            <span className="text-xl mr-2">📁</span> Resource Files
                          </h3>
                          <div className="space-y-2 ml-6">
                            {sectionFiles.map(file => (
                              <div key={file.item_id} className="p-2 bg-gray-50 rounded hover:bg-gray-100">
                                <a
                                  href={file.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:underline font-medium"
                                >
                                  📄 {file.file_name || file.item_name}
                                </a>
                                {file.file_name !== file.item_name && file.item_name && (
                                  <p className="text-sm text-gray-500">{file.item_name}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {showAssignments && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <span className="mr-2">📝</span> Course Assignments
          </h2>
          <AssignmentList courseCode={course.course_code} />
        </div>
      )}

      {showMembers && (
        <CourseMembers
          courseCode={course.course_code}
          onClose={() => setShowMembers(false)}
        />
      )}

      {showCreateEvent && (
        <CreateEventModal
          courseCode={course.course_code}
          courseTitle={course.course_title}
          onClose={() => setShowCreateEvent(false)}
          onEventCreated={handleEventCreated}
        />
      )}
    </div>
  );
};

export default CourseContent;