import { useState } from 'react';

const CreateThread = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [starterPost, setStarterPost] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !starterPost.trim()) {
      toast.error('Both title and content are required');
      return;
    }

    setSubmitting(true);
    await onSubmit(title, starterPost);
    setSubmitting(false);
    setTitle('');
    setStarterPost('');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-2 border-indigo-200">
      <h3 className="text-xl font-semibold mb-4 text-indigo-700">Create New Thread</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">
            Thread Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter a descriptive title"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">
            Post Content *
          </label>
          <textarea
            value={starterPost}
            onChange={(e) => setStarterPost(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows="6"
            placeholder="Write your post content here..."
            required
          />
        </div>
        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={submitting}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create Thread'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateThread;