import { useState, useEffect } from 'react';
import { forumAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const ThreadDetail = ({ thread, onBack, onReplyAdded }) => {
  const { user } = useAuth();
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState('');
  const [replyToId, setReplyToId] = useState(null);
  const [replyToName, setReplyToName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReplies();
  }, [thread.thread_id]);

  const fetchReplies = async () => {
    try {
      const response = await forumAPI.getReplies(thread.thread_id);
      setReplies(response.data);
    } catch (error) {
      toast.error('Failed to load replies');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!newReply.trim()) {
      toast.error('Reply content cannot be empty');
      return;
    }

    setSubmitting(true);
    try {
      await forumAPI.addReply(thread.thread_id, {
        content: newReply,
        parent_reply_id: replyToId
      });
      toast.success('Reply added successfully');
      setNewReply('');
      setReplyToId(null);
      setReplyToName(null);
      fetchReplies();
      if (onReplyAdded) onReplyAdded();
    } catch (error) {
      toast.error('Failed to add reply');
    } finally {
      setSubmitting(false);
    }
  };

  const buildReplyTree = (repliesList, parentId = null, depth = 0) => {
    const children = repliesList.filter(r => r.parent_reply_id === parentId);
    if (children.length === 0) return null;

    return (
      <div className={`${depth > 0 ? 'ml-8 mt-3 pl-4 border-l-2 border-gray-200' : 'space-y-4'}`}>
        {children.map(reply => (
          <div key={reply.reply_id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="font-semibold text-indigo-700">{reply.user_name}</span>
                <span className="text-xs text-gray-500 ml-2">
                  {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                </span>
              </div>
              <button
                onClick={() => {
                  setReplyToId(reply.reply_id);
                  setReplyToName(reply.user_name);
                }}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Reply
              </button>
            </div>
            <p className="text-gray-700">{reply.content}</p>
            {buildReplyTree(replies, reply.reply_id, depth + 1)}
          </div>
        ))}
      </div>
    );
  };

  const topLevelReplies = replies.filter(r => r.parent_reply_id === null);

  if (loading) {
    return <div className="text-center py-10">Loading replies...</div>;
  }

  return (
    <div>
      <button onClick={onBack} className="mb-4 text-indigo-600 hover:underline">
        ← Back to Threads
      </button>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4 text-indigo-800">{thread.title}</h1>
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-gray-700 whitespace-pre-wrap">{thread.starter_post}</p>
          <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
            <span>Posted by <span className="font-medium text-indigo-600">{thread.user_name}</span></span>
            <span>{formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">
            Replies ({topLevelReplies.length})
          </h3>
        </div>

        <form onSubmit={handleSubmitReply} className="mb-6">
          {replyToId && (
            <div className="mb-3 p-2 bg-yellow-50 rounded-lg text-sm flex justify-between items-center">
              <span className="text-yellow-800">
                Replying to <span className="font-semibold">{replyToName}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setReplyToId(null);
                  setReplyToName(null);
                }}
                className="text-red-600 hover:text-red-800 text-xs font-medium"
              >
                Cancel
              </button>
            </div>
          )}
          <textarea
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            placeholder={replyToId ? `Reply to ${replyToName}...` : "Write your reply here..."}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows="4"
            required
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Posting...' : 'Post Reply'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          {topLevelReplies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No replies yet. Be the first to reply!</p>
            </div>
          ) : (
            buildReplyTree(replies)
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreadDetail;