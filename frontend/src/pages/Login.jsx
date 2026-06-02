import React, { useState } from 'react';
import api from '../services/api';
import './Login.css';

const Login = () => {
  // State to hold the form inputs (email and password)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // State to manage loading spinners or button disabled state during API call
  const [loading, setLoading] = useState(false);

  // States to hold message strings for success feedback or error notifications
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /**
   * Handle changes in form input fields dynamically.
   * By using [e.target.name], we can update both 'email' and 'password'
   * in a single event handler.
   */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /**
   * Form submit handler that performs the API call to Node.js backend.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default page refresh on form submit
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Send POST request to http://localhost:3000/api/auth/login
      const response = await api.post('/auth/login', formData);

      // Extract token and user details from backend response
      const { token, user } = response.data;

      // Store the JWT token securely in localStorage for authentication persistence
      localStorage.setItem('token', token);
      
      // Store user info (e.g. role, name) for display/role authorization check
      localStorage.setItem('user', JSON.stringify(user));

      setSuccess('Login Successful! Redirecting...');
      console.log('Login success user details:', user);

      // NOTE: Navigation to the dashboard (React Router) will be implemented here later
    } catch (err) {
      // Capture detailed error message from backend if available, else generic message
      const errorMessage = err.response?.data?.message || 'Login failed. Please verify credentials.';
      setError(errorMessage);
    } finally {
      // Set loading back to false so the user can interact with the submit button again
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="title">Welcome Back</h2>
        <p className="subtitle">Sign in to your Campus Placement Portal account</p>

        {/* Display Alert Messages */}
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          {/* Email Input Field */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. name@student.com"
              required
            />
          </div>

          {/* Password Input Field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          {/* Submit Button with Loading State */}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <span className="spinner-text">Verifying Credentials...</span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
