import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="text-center">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg p-12 mb-8">
        <h1 className="text-5xl font-bold mb-4">Welcome to BetterVLE</h1>
        <p className="text-xl mb-6">Your Modern Virtual Learning Environment</p>
        {!user && (
          <Link
            to="/register"
            className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100"
          >
            Get Started
          </Link>
        )}
        {user && (
          <Link
            to="/courses"
            className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100"
          >
            Go to Dashboard
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="text-xl font-semibold mb-2">Course Management</h3>
          <p className="text-gray-600">Access all your courses, materials, and grades in one place</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-4xl mb-4">💬</div>
          <h3 className="text-xl font-semibold mb-2">Discussion Forums</h3>
          <p className="text-gray-600">Engage with peers and instructors through threaded discussions</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-xl font-semibold mb-2">Assignments</h3>
          <p className="text-gray-600">Submit work, track grades, and monitor your progress</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;