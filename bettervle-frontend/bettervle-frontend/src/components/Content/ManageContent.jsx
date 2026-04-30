import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { contentAPI } from '../../services/api';
import CreateSectionModal from './CreateSectionModal';
import AddContentModal from './AddContentModal';
import toast from 'react-hot-toast';

const ManageContent = ({ courseCode, courseTitle, onBack }) => {
  const { user } = useAuth();
  const [content, setContent] = useState({ sections: [], links: [], slides: [], files: [] });
  const [loading, setLoading] = useState(true);
  const [showCreateSection, setShowCreateSection] = useState(false);
  const [showAddContent, setShowAddContent] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [contentType, setContentType] = useState('link');

  useEffect(() => {
    fetchContent();
  }, [courseCode]);

  const fetchContent = async () => {
    try {
      const response = await contentAPI.getCourseContent(courseCode);
      setContent(response.data);
    } catch (error) {
      toast.error('Failed to load course content');
    } finally {
      setLoading(false);
    }
  };

  const handleSectionCreated = () => {
    fetchContent();
    setShowCreateSection(false);
  };

  const handleContentAdded = () => {
    fetchContent();
    setShowAddContent(false);
    setSelectedSection(null);
  };

  if (loading) {
    return <div className="text-center py-10">Loading course content...</div>;
  }

  return (
    <div>
      <button onClick={onBack} className="mb-4 text-indigo-600 hover:underline">
        ← Back to Course
      </button>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2">{courseTitle}</h1>
        <p className="text-gray-600">Course Code: {courseCode}</p>
        <p className="text-sm text-green-600 mt-2">
          Role: Lecturer - You can add and manage course content
        </p>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setShowCreateSection(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Add New Section
        </button>
      </div>

      <div className="space-y-6">
        {content.sections.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">No content sections yet.</p>
            <button
              onClick={() => setShowCreateSection(true)}
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Create First Section
            </button>
          </div>
        ) : (
          content.sections.map((section) => (
            <div key={section.section_id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-3 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">
                  Section {section.section_num}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedSection(section);
                      setContentType('link');
                      setShowAddContent(true);
                    }}
                    className="bg-white text-indigo-600 px-3 py-1 rounded text-sm hover:bg-gray-100"
                  >
                    + Add Link
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSection(section);
                      setContentType('slide');
                      setShowAddContent(true);
                    }}
                    className="bg-white text-indigo-600 px-3 py-1 rounded text-sm hover:bg-gray-100"
                  >
                    + Add Slide
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSection(section);
                      setContentType('file');
                      setShowAddContent(true);
                    }}
                    className="bg-white text-indigo-600 px-3 py-1 rounded text-sm hover:bg-gray-100"
                  >
                    + Add File
                  </button>
                </div>
              </div>

              <div className="p-6">
                {content.links.filter(link => link.section_id === section.section_id).length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                      <span className="text-xl mr-2">🔗</span> Links
                    </h3>
                    <div className="space-y-2">
                      {content.links
                        .filter(link => link.section_id === section.section_id)
                        .map(link => (
                          <div key={link.item_id} className="p-3 bg-gray-50 rounded-lg">
                            <a href={link.url} target="_blank" rel="noopener noreferrer"
                              className="text-indigo-600 hover:underline font-medium">
                              {link.link_name}
                            </a>
                            <p className="text-sm text-gray-500 mt-1">{link.item_name}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {content.slides.filter(slide => slide.section_id === section.section_id).length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                      <span className="text-xl mr-2">📊</span> Lecture Slides
                    </h3>
                    <div className="space-y-2">
                      {content.slides
                        .filter(slide => slide.section_id === section.section_id)
                        .map(slide => (
                          <div key={slide.item_id} className="p-3 bg-gray-50 rounded-lg">
                            <a href={slide.slide_url} target="_blank" rel="noopener noreferrer"
                              className="text-indigo-600 hover:underline font-medium">
                              {slide.slideset_name}
                            </a>
                            <p className="text-sm text-gray-500 mt-1">{slide.item_name}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {content.files.filter(file => file.section_id === section.section_id).length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                      <span className="text-xl mr-2">📁</span> Resource Files
                    </h3>
                    <div className="space-y-2">
                      {content.files
                        .filter(file => file.section_id === section.section_id)
                        .map(file => (
                          <div key={file.item_id} className="p-3 bg-gray-50 rounded-lg">
                            <a href={file.file_url} target="_blank" rel="noopener noreferrer"
                              className="text-indigo-600 hover:underline font-medium">
                              📄 {file.file_name}
                            </a>
                            <p className="text-sm text-gray-500 mt-1">{file.item_name}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {content.links.filter(link => link.section_id === section.section_id).length === 0 &&
                  content.slides.filter(slide => slide.section_id === section.section_id).length === 0 &&
                  content.files.filter(file => file.section_id === section.section_id).length === 0 && (
                    <p className="text-gray-500 text-center py-6">No content in this section yet. Use the buttons above to add content.</p>
                  )}
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateSection && (
        <CreateSectionModal
          courseCode={courseCode}
          existingSections={content.sections}
          onClose={() => setShowCreateSection(false)}
          onSectionCreated={handleSectionCreated}
        />
      )}

      {showAddContent && selectedSection && (
        <AddContentModal
          sectionId={selectedSection.section_id}
          sectionNum={selectedSection.section_num}
          contentType={contentType}
          onClose={() => {
            setShowAddContent(false);
            setSelectedSection(null);
          }}
          onContentAdded={handleContentAdded}
        />
      )}
    </div>
  );
};

export default ManageContent;