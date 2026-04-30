import { useState, useEffect } from 'react';
import { forumAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import CreateForumModal from './CreateForumModal';
import ThreadList from './ThreadList';
import ThreadDetail from './ThreadDetail';
import toast from 'react-hot-toast';

const ForumList = ({ courseCode }) => {
  const { user } = useAuth();
  const [forums, setForums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedForum, setSelectedForum] = useState(null);
  const [selectedThread, setSelectedThread] = useState(null);

  useEffect(() => {
    fetchForums();
  }, [courseCode]);

  const fetchForums = async () => {
    try {
      const response = await forumAPI.getForums(courseCode);
      setForums(response.data);
    } catch (error) {
      toast.error('Failed to load forums');
    } finally {
      setLoading(false);
    }
  };

  if (selectedThread) {
    return (
      <ThreadDetail
        thread={selectedThread}
        onBack={() => setSelectedThread(null)}
        onReplyAdded={fetchForums}
      />
    );
  }

  if (selectedForum) {
    return (
      <ThreadList
        forum={selectedForum}
        onBack={() => setSelectedForum(null)}
        onSelectThread={setSelectedThread}
        onThreadCreated={fetchForums}
      />
    );
  }

  if (loading) {
    return <div className="text-center py-10">Loading forums...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Discussion Forums</h2>
        {(user?.role === 'lecturer' || user?.role === 'admin') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            + Create New Forum
          </button>
        )}
      </div>

      {forums.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">No forums available for this course yet.</p>
          {(user?.role === 'lecturer' || user?.role === 'admin') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Create the First Forum
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {forums.map((forum) => (
            <div
              key={forum.forum_id}
              onClick={() => setSelectedForum(forum)}
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-indigo-600">
                    Forum #{forum.forum_id}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Created by: {forum.user_name}
                  </p>
                </div>
                <div className="text-gray-400">
                  Click to view threads →
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateForumModal
          courseCode={courseCode}
          onClose={() => setShowCreateModal(false)}
          onForumCreated={fetchForums}
        />
      )}
    </div>
  );
};

export default ForumList;