import { useState } from 'react';
import { calendarAPI } from '../../services/api';
import toast from 'react-hot-toast';

const CreateEventModal = ({ courseCode, courseTitle, onClose, onEventCreated }) => {
  const [event, setEvent] = useState({
    title: '',
    event_details: '',
    event_date: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!event.title || !event.event_date) {
      toast.error('Title and date are required');
      return;
    }

    setSubmitting(true);
    try {
      await calendarAPI.createEvent(courseCode, {
        title: event.title,
        event_details: event.event_details,
        event_date: event.event_date
      });
      toast.success('Calendar event created successfully!');
      if (onEventCreated) onEventCreated();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Create Calendar Event</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          Course: <span className="font-semibold">{courseCode}</span> - {courseTitle}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Event Title *
            </label>
            <input
              type="text"
              value={event.title}
              onChange={(e) => setEvent({ ...event, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Midterm Exam, Guest Lecture, Assignment Due"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Event Date *
            </label>
            <input
              type="date"
              value={event.event_date}
              onChange={(e) => setEvent({ ...event, event_date: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Event Details (Optional)
            </label>
            <textarea
              value={event.event_details}
              onChange={(e) => setEvent({ ...event, event_details: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows="4"
              placeholder="Add additional information about this event..."
            />
          </div>

          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Event'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;