import { useState, useEffect } from 'react';
import { calendarAPI } from '../../services/api';
import toast from 'react-hot-toast';

const EventCalendar = ({ studentId, selectedDate, onDateChange }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [selectedDate, studentId]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await calendarAPI.getStudentEvents(studentId, selectedDate);
      setEvents(response.data);
    } catch (error) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <div className="bg-white rounded-lg shadow-md p-6">
          <label className="block text-gray-700 font-bold mb-2">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
      </div>

      <div className="md:col-span-2">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">
            Events for {new Date(selectedDate).toLocaleDateString()}
          </h3>
          {loading ? (
            <p>Loading events...</p>
          ) : events.length === 0 ? (
            <p className="text-gray-500">No events scheduled for this date</p>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.event_id} className="border-l-4 border-indigo-600 pl-4">
                  <h4 className="font-semibold">{event.title}</h4>
                  <p className="text-sm text-gray-600">Course: {event.course_code} - {event.course_title}</p>
                  {event.event_details && (
                    <p className="text-gray-700 mt-1">{event.event_details}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCalendar;