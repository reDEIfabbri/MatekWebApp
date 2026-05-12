import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const RegistrationPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to register');
      }

      // On successful registration, redirect to the login page (or back to admin dashboard if logged in as admin)
      if (isAdmin) {
          navigate('/admin');
      } else {
          navigate('/login');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const isAdmin = localStorage.getItem('role') === 'ADMIN';

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Register {isAdmin ? 'New User' : ''}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border rounded-md"
              required
            />
          </div>
          {isAdmin && (
            <div>
              <label className="block text-sm font-medium">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 mt-1 border rounded-md"
              >
                <option value="STUDENT">Student</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" className="w-full py-2 text-white bg-green-500 rounded-md hover:bg-green-600 transition-colors">
            Register
          </button>
        </form>
        {!isAdmin && (
            <div className="text-center text-sm">
                Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Login here</Link>
            </div>
        )}
        {isAdmin && (
            <div className="text-center text-sm mt-4">
                <Link to="/admin" className="text-gray-500 hover:text-gray-700 hover:underline">← Back to Dashboard</Link>
            </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationPage;
