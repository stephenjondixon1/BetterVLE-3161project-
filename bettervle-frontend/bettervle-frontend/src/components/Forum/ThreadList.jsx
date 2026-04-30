import { useState, useEffect } from 'react';
import { forumAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import CreateThread from './CreateThread';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const ThreadList = ({ forum, onBack, onSelectThread, onThreadCreated }) => {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchThreads();
  }, [forum.forum_id]);

  const fetchThreads = async () => {
    try {
      const response = await forumAPI.getThreads(forum.forum_id);
      setThreads(response.data);
    } catch (error) {
      toast.error('Failed to load threads');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateThread = async (title, starter_post) => {
    try {
      await forumAPI.createThread(forum.forum_id, { title, starter_post });
      toast.success('Thread created successfully');
      setShowCreateForm(false);
      fetchThreads();
      if (onThreadCreated) onThreadCreated();
    } catch (error) {
      toast.error('Failed to create thread');
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading threads...</div>;
  }

  return (
    <div>
      <button onClick={onBack} className="mb-4 text-indigo-600 hover:underline">
        ← Back to Forums
      </button>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Forum #{forum.forum_id}</h2>
            <p className="text-gray-600 text-sm mt-1">Created by: {forum.user_name}</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            + New Thread
          </button>
        </div>
      </div>

      {showCreateForm && (
        <CreateThread
          onSubmit={handleCreateThread}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      <div className="space-y-4">
        {threads.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">No threads yet.</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Create the First Thread
            </button>
          </div>
        ) : (
          threads.map((thread) => (
            <div
              key={thread.thread_id}
              onClick={() => onSelectThread(thread)}
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2 text-indigo-600">{thread.title}</h3>
              <p className="text-gray-600 mb-3 line-clamp-2">{thread.starter_post}</p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Posted by <span className="font-medium">{thread.user_name}</span></span>
                <span>{formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ThreadList;