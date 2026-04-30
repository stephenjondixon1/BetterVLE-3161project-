import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-indigo-600 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-white text-xl font-bold">
            BetterVLE
          </Link>

          {user ? (
            <div className="flex items-center space-x-4">
              <Link to="/courses" className="text-white hover:text-indigo-200">
                Courses
              </Link>
              <Link to="/calendar" className="text-white hover:text-indigo-200">
                Calendar
              </Link>
              <Link to="/assignments" className="text-white hover:text-indigo-200">
                Assignments
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="text-white hover:text-indigo-200">
                  Admin
                </Link>
              )}
              <div className="text-white border-l border-indigo-400 pl-4">
                <span className="text-sm">{user.user_name}</span>
                <span className="ml-2 px-2 py-1 bg-indigo-500 rounded text-xs">
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-indigo-700 text-white px-3 py-1 rounded hover:bg-indigo-800"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="space-x-2">
              <Link to="/login" className="text-white hover:text-indigo-200">
                Login
              </Link>
              <Link to="/register" className="bg-white text-indigo-600 px-3 py-1 rounded hover:bg-indigo-50">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;