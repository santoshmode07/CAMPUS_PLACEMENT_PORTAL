import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Register.css';

const Register = () => {
  // Initialize useNavigate hook for routing
  const navigate = useNavigate();

  // Access the register function from our custom Auth Hook
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    student_id: '',
    password: '',
    branch: 'CSE', // default branch
    year: '1',     // default year
    cgpa: '',
    skills: '',    // entered as comma-separated list
    resumeFile: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!formData.resumeFile) {
      setError('Please select a PDF resume file to upload.');
      setLoading(false);
      return;
    }

    if (formData.resumeFile.type !== 'application/pdf') {
      setError('Only PDF files (.pdf) are allowed for resume upload.');
      setLoading(false);
      return;
    }

    // Split comma-separated skills input into an array of trimmed strings
    const skillsArray = formData.skills
      .split(',')
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);

    const cgpaNum = parseFloat(formData.cgpa);
    if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) {
      setError('CGPA must be a number between 0 and 10');
      setLoading(false);
      return;
    }

    // Build multipart FormData payload
    const formDataPayload = new FormData();
    formDataPayload.append('name', formData.name);
    formDataPayload.append('email', formData.email);
    formDataPayload.append('student_id', formData.student_id);
    formDataPayload.append('password', formData.password);
    formDataPayload.append('role', 'student');
    formDataPayload.append('branch', formData.branch);
    formDataPayload.append('year', Number(formData.year));
    formDataPayload.append('cgpa', cgpaNum);
    formDataPayload.append('skills', JSON.stringify(skillsArray));
    formDataPayload.append('resume', formData.resumeFile);

    try {
      // Register via AuthContext. The backend automatically sets the cookie.
      await register(formDataPayload);

      setSuccess('Student Account Registered Successfully! Redirecting...');

      // Redirect to dashboard after a short delay so they see the success message
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
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
              <label htmlFor="resumeFile">Upload Resume (PDF format)</label>
              <input
                type="file"
                id="resumeFile"
                name="resume"
                accept=".pdf"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    resumeFile: e.target.files[0]
                  });
                }}
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
