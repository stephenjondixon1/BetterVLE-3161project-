import { useState, useEffect } from 'react';
import { calendarAPI } from '../../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const CourseEventList = ({ courseCode, onRefresh }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [courseCode]);

  const fetchEvents = async () => {
    try {
      const response = await calendarAPI.getCourseEvents(courseCode);
      setEvents(response.data);
    } catch (error) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading events...</div>;
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No events scheduled for this course yet.</p>
        <p className="text-sm mt-2">Click "Create Event" to add one.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {events.map((event) => (
        <div key={event.event_id} className="border-l-4 border-indigo-600 bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold text-lg">{event.title}</h4>
              <p className="text-sm text-gray-600 mt-1">
                📅 {format(new Date(event.event_date), 'MMMM d, yyyy')}
              </p>
              {event.event_details && (
                <p className="text-gray-700 mt-2 text-sm">{event.event_details}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CourseEventList;