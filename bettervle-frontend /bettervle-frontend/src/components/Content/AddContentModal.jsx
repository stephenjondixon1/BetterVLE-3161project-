import { useState } from 'react';
import { contentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AddContentModal = ({ sectionId, sectionNum, contentType, onClose, onContentAdded }) => {
  const [formData, setFormData] = useState({
    item_name: '',
    link_name: '',
    url: '',
    slideset_name: '',
    slide_url: '',
    file_name: '',
    file_url: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const getContentTypeTitle = () => {
    switch (contentType) {
      case 'link': return 'Add Link';
      case 'slide': return 'Add Lecture Slide';
      case 'file': return 'Add File Resource';
      default: return 'Add Content';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.item_name) {
      toast.error('Item name is required');
      return;
    }

    setSubmitting(true);

    try {
      if (contentType === 'link') {
        if (!formData.link_name || !formData.url) {
          toast.error('Link name and URL are required');
          setSubmitting(false);
          return;
        }
        await contentAPI.addLink(sectionId, {
          item_name: formData.item_name,
          link_name: formData.link_name,
          url: formData.url
        });
        toast.success('Link added successfully!');
      }
      else if (contentType === 'slide') {
        if (!formData.slideset_name || !formData.slide_url) {
          toast.error('Slideset name and URL are required');
          setSubmitting(false);
          return;
        }
        await contentAPI.addSlide(sectionId, {
          item_name: formData.item_name,
          slideset_name: formData.slideset_name,
          slide_url: formData.slide_url
        });
        toast.success('Slide resource added successfully!');
      }
      else if (contentType === 'file') {
        if (!formData.file_name || !formData.file_url) {
          toast.error('File name and URL are required');
          setSubmitting(false);
          return;
        }
        await contentAPI.addFile(sectionId, {
          item_name: formData.item_name,
          file_name: formData.file_name,
          file_url: formData.file_url
        });
        toast.success('File resource added successfully!');
      }

      onContentAdded();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to add ${contentType}`);
    } finally {
      setSubmitting(false);
    }
  };

  const renderForm = () => {
    switch (contentType) {
      case 'link':
        return (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Item Name *</label>
              <input
                type="text"
                value={formData.item_name}
                onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., Week 1 Reading Materials"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Link Name *</label>
              <input
                type="text"
                value={formData.link_name}
                onChange={(e) => setFormData({ ...formData, link_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., Course Textbook"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">URL *</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="https://..."
                required
              />
            </div>
          </>
        );
      case 'slide':
        return (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Item Name *</label>
              <input
                type="text"
                value={formData.item_name}
                onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., Chapter 1 Slides"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Slideset Name *</label>
              <input
                type="text"
                value={formData.slideset_name}
                onChange={(e) => setFormData({ ...formData, slideset_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., Introduction to Programming"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Slide URL *</label>
              <input
                type="url"
                value={formData.slide_url}
                onChange={(e) => setFormData({ ...formData, slide_url: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="https://..."
                required
              />
            </div>
          </>
        );
      case 'file':
        return (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Item Name *</label>
              <input
                type="text"
                value={formData.item_name}
                onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., Assignment Resources"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">File Name *</label>
              <input
                type="text"
                value={formData.file_name}
                onChange={(e) => setFormData({ ...formData, file_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., Project Guidelines.pdf"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">File URL *</label>
              <input
                type="url"
                value={formData.file_url}
                onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="https://..."
                required
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{getContentTypeTitle()}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">
            ✕
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          Section <span className="font-semibold">{sectionNum}</span>
        </p>

        <form onSubmit={handleSubmit}>
          {renderForm()}

          <div className="flex space-x-2 mt-6">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Adding...' : `Add ${contentType}`}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddContentModal;