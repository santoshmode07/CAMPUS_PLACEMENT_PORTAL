import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  // Retrieve the logged-in user details and the logout function from context
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  if (!user) {
    return <p className="loading-text">No user session found. Please log in.</p>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Student Dashboard</h1>
            <p className="dashboard-subtitle">Welcome back, {user.name}!</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link to="/jobs" className="nav-btn">
              View Jobs
            </Link>
            <button className="logout-btn" onClick={handleLogout}>
              Log Out
            </button>
          </div>
        </div>

        <div className="profile-section">
          <h2>Academic Profile</h2>
          <div className="profile-grid">
            <div className="profile-item">
              <span className="label">Student ID</span>
              <span className="value">{user.student_id}</span>
            </div>

            <div className="profile-item">
              <span className="label">Email Address</span>
              <span className="value">{user.email}</span>
            </div>

            <div className="profile-item">
              <span className="label">Branch</span>
              <span className="value">{user.branch}</span>
            </div>

            <div className="profile-item">
              <span className="label">Year of Study</span>
              <span className="value">{user.year} Year</span>
            </div>

            {user.role === 'student' && (
              <>
                <div className="profile-item">
                  <span className="label">CGPA</span>
                  <span className="value">{user.cgpa}/10</span>
                </div>

                <div className="profile-item full-width">
                  <span className="label">Skills</span>
                  <div className="skills-tags">
                    {user.skills && user.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="profile-item full-width">
                  <span className="label">Google Drive Resume Link</span>
                  <a href={user.resumeLink} target="_blank" rel="noopener noreferrer" className="resume-link">
                    View Resume (Google Drive)
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
