import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const majors_departments = [
  { major: "Computer Science", department: "Computing" },
  { major: "Information Technology", department: "Computing" },
  { major: "Software Engineering", department: "Computing" },
  { major: "Business Administration", department: "Business" },
  { major: "Accounting", department: "Business" },
  { major: "Marketing", department: "Business" },
  { major: "Mechanical Engineering", department: "Engineering" },
  { major: "Electrical Engineering", department: "Engineering" },
  { major: "Civil Engineering", department: "Engineering" },
  { major: "Biology", department: "Science" },
  { major: "Chemistry", department: "Science" },
  { major: "Physics", department: "Science" }
];

const uniqueDepartments = [...new Set(majors_departments.map(item => item.department))];

const Register = () => {
  const [formData, setFormData] = useState({
    user_name: '',
    password: '',
    role: 'student',
    first_name: '',
    last_name: '',
    major: '',
    department: '',
    gpa: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleMajorChange = (e) => {
    const selectedMajor = e.target.value;
    const selected = majors_departments.find(m => m.major === selectedMajor);
    setFormData({
      ...formData,
      major: selectedMajor,
      department: selected ? selected.department : ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let dataToSend = {};

    if (formData.role === 'student') {
      dataToSend = {
        user_name: formData.user_name,
        password: formData.password,
        role: formData.role,
        first_name: formData.first_name,
        last_name: formData.last_name,
        major: formData.major,
        department: formData.department,
        gpa: parseFloat(formData.gpa)
      };
    } else if (formData.role === 'lecturer') {
      dataToSend = {
        user_name: formData.user_name,
        password: formData.password,
        role: formData.role,
        first_name: formData.first_name,
        last_name: formData.last_name,
        department: formData.department
      };
    }

    console.log('=== SENDING REGISTRATION DATA ===');
    console.log('Full data being sent:', JSON.stringify(dataToSend, null, 2));
    console.log('Fields check:');
    console.log('- user_name:', dataToSend.user_name);
    console.log('- password:', dataToSend.password ? '***' : 'MISSING');
    console.log('- role:', dataToSend.role);
    console.log('- first_name:', dataToSend.first_name);
    console.log('- last_name:', dataToSend.last_name);
    if (dataToSend.role === 'student') {
      console.log('- major:', dataToSend.major);
      console.log('- department:', dataToSend.department);
      console.log('- gpa:', dataToSend.gpa);
    }

    const success = await register(dataToSend);
    console.log('Registration success:', success);

    setLoading(false);
    if (success) {
      navigate('/login');
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Register for BetterVLE</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Username *
              </label>
              <input
                type="text"
                value={formData.user_name}
                onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Password *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Role *
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="student">Student</option>
              <option value="lecturer">Lecturer</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                First Name *
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {formData.role === 'student' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Major *
                  </label>
                  <select
                    value={formData.major}
                    onChange={handleMajorChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select Major...</option>
                    {majors_departments.map((item, index) => (
                      <option key={index} value={item.major}>
                        {item.major}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Department *
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    readOnly
                    className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  GPA *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4.3"
                  value={formData.gpa}
                  onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </>
          )}

          {formData.role === 'lecturer' && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Department *
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Select Department...</option>
                {uniqueDepartments.map((dept, index) => (
                  <option key={index} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="text-center mt-4 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;