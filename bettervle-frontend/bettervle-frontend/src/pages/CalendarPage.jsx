import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { calendarAPI } from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const CalendarPage = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'student') {
      fetchEvents();
    }
  }, [selectedDate, user]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await calendarAPI.getStudentEvents(user.user_id, selectedDate);
      setEvents(response.data);
    } catch (error) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'student') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
        <p className="text-yellow-700">Calendar view is only available for students.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Calendar</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <label className="block text-gray-700 font-bold mb-2">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">
              Events for {format(new Date(selectedDate), 'MMMM d, yyyy')}
            </h3>

            {loading ? (
              <p className="text-center py-8">Loading events...</p>
            ) : events.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No events scheduled for this date.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.event_id} className="border-l-4 border-indigo-600 pl-4 py-2">
                    <h4 className="font-semibold text-lg">{event.title}</h4>
                    <p className="text-sm text-gray-600">
                      Course: {event.course_code} - {event.course_title}
                    </p>
                    {event.event_details && (
                      <p className="text-gray-700 mt-2">{event.event_details}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;