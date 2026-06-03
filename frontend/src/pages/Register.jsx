import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Register.css';

const Register = () => {
  // State for student registration form inputs
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    student_id: '',
    password: '',
    branch: 'CSE', // default branch
    year: '1',     // default year
    cgpa: '',
    skills: '',    // entered as comma-separated list
    resumeLink: '',
  });

  // UI state management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle standard input updates
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Prepare the payload to match what the backend expects for a student
    const payload = {
      name: formData.name,
      email: formData.email,
      student_id: formData.student_id,
      password: formData.password,
      role: 'student', // Hardcoded student role
      branch: formData.branch,
      year: Number(formData.year), // Backend expects year as a number
    };

    // Validate CGPA
    const cgpaNum = parseFloat(formData.cgpa);
    if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) {
      setError('CGPA must be a number between 0 and 10');
      setLoading(false);
      return;
    }
    payload.cgpa = cgpaNum;

    // Split comma-separated skills input into an array of trimmed strings
    payload.skills = formData.skills
      .split(',')
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);

    // Validate Google Drive Resume Link
    if (!formData.resumeLink.includes('drive.google.com')) {
      setError('Resume Link must be a valid Google Drive link containing drive.google.com');
      setLoading(false);
      return;
    }
    payload.resumeLink = formData.resumeLink;

    try {
      // API call to register endpoint
      const response = await api.post('/auth/register', payload);

      const { token, user } = response.data;

      // Store credentials in localStorage on successful sign up
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setSuccess('Student Account Registered Successfully! Redirecting...');
      console.log('Registered Student Details:', user);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please check inputs.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="title">Student Registration</h2>
        <p className="subtitle">Create your placement profile to get started</p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form className="register-form" onSubmit={handleSubmit}>
          {/* Main Student Fields */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="student_id">Student ID</label>
              <input
                type="text"
                id="student_id"
                name="student_id"
                value={formData.student_id}
                onChange={handleChange}
                placeholder="e.g. S10124"
                required
              />
            </div>

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
          </div>

          <div className="form-row select-row">
            <div className="form-group">
              <label htmlFor="branch">Branch</label>
              <select id="branch" name="branch" value={formData.branch} onChange={handleChange}>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="Mech">Mech</option>
                <option value="CIVIL">CIVIL</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="year">Year of Study</label>
              <select id="year" name="year" value={formData.year} onChange={handleChange}>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
          </div>

          {/* Academic & Resume Details (Always visible and required for students) */}
          <div className="student-fields-box">
            <h3 className="section-title">Academic & Resume Details</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cgpa">CGPA (0 to 10)</label>
                <input
                  type="number"
                  step="0.01"
                  id="cgpa"
                  name="cgpa"
                  value={formData.cgpa}
                  onChange={handleChange}
                  placeholder="e.g. 8.5"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="skills">Skills (comma-separated)</label>
                <input
                  type="text"
                  id="skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="e.g. React, Node.js, MongoDB"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="resumeLink">Google Drive Resume Link</label>
              <input
                type="url"
                id="resumeLink"
                name="resumeLink"
                value={formData.resumeLink}
                onChange={handleChange}
                placeholder="https://drive.google.com/..."
                required
              />
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Creating Student Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="login-link">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
