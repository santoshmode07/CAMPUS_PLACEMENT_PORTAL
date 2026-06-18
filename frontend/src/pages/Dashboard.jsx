import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  // Retrieve the logged-in user details and the logout function from context
  const { user, logout } = useAuth();

  const [myDrives, setMyDrives] = useState([]);
  const [drivesLoading, setDrivesLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const [jobData, setJobData] = useState({
    title: '',
    company: '',
    description: '',
    ctc: '',
    location: '',
    deadline: '',
    eligibleBranches: [],
    bannerImage: null,
    galleryImages: [],
    jdPdf: null
  });

  const fetchMyDrives = async () => {
    if (user && (user.role === 'admin' || user.role === 'company')) {
      setDrivesLoading(true);
      try {
        const response = await api.get('/jobs');
        const allJobs = response.data.jobs || [];
        const filtered = allJobs.filter(job => 
          job.createdBy?._id === user._id || job.createdBy === user._id
        );
        setMyDrives(filtered);
      } catch (err) {
        console.error('Error fetching drives:', err);
      } finally {
        setDrivesLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchMyDrives();
  }, [user]);

  const handleLogout = async () => {
    await logout();
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    setFormSuccess('');

    if (jobData.eligibleBranches.length === 0) {
      setFormError('Please select at least one eligible branch.');
      setFormLoading(false);
      return;
    }

    const payload = new FormData();
    payload.append('title', jobData.title);
    payload.append('company', jobData.company);
    payload.append('description', jobData.description);
    payload.append('ctc', Number(jobData.ctc));
    payload.append('location', jobData.location);
    payload.append('deadline', jobData.deadline);
    payload.append('eligibleBranches', JSON.stringify(jobData.eligibleBranches));

    if (jobData.bannerImage) {
      payload.append('bannerImage', jobData.bannerImage);
    }
    if (jobData.galleryImages && jobData.galleryImages.length > 0) {
      for (let i = 0; i < jobData.galleryImages.length; i++) {
        payload.append('galleryImages', jobData.galleryImages[i]);
      }
    }
    if (jobData.jdPdf) {
      payload.append('jdPdf', jobData.jdPdf);
    }

    try {
      await api.post('/jobs', payload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setFormSuccess('Placement Drive Created Successfully!');
      setJobData({
        title: '',
        company: '',
        description: '',
        ctc: '',
        location: '',
        deadline: '',
        eligibleBranches: [],
        bannerImage: null,
        galleryImages: [],
        jdPdf: null
      });
      e.target.reset();
      fetchMyDrives();
      setTimeout(() => setShowCreateForm(false), 1500);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to create placement drive.';
      setFormError(errMsg);
    } finally {
      setFormLoading(false);
    }
  };

  if (!user) {
    return <p className="loading-text">No user session found. Please log in.</p>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-card" style={{ maxWidth: (user.role === 'admin' || user.role === 'company') ? '950px' : '800px' }}>
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">
              {user.role === 'student' ? 'Student Dashboard' : 'Placement Dashboard'}
            </h1>
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

        {user.role === 'student' ? (
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
                <span className="label">Academic Resume (PDF)</span>
                {user.resumeLink ? (
                  <a href={user.resumeLink} target="_blank" rel="noopener noreferrer" className="resume-link">
                    📄 View Uploaded Resume PDF
                  </a>
                ) : (
                  <span className="no-resume-alert" style={{ color: '#f87171' }}>⚠️ No resume uploaded</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="profile-section">
              <h2>Recruiter Profile</h2>
              <div className="profile-grid">
                <div className="profile-item">
                  <span className="label">Recruiter Name</span>
                  <span className="value">{user.name}</span>
                </div>
                <div className="profile-item">
                  <span className="label">Email Address</span>
                  <span className="value">{user.email}</span>
                </div>
                <div className="profile-item">
                  <span className="label">Role / Affiliation</span>
                  <span className="value" style={{ textTransform: 'capitalize' }}>{user.role}</span>
                </div>
              </div>
            </div>

            <div className="drives-section" style={{ marginTop: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', borderLeft: '4px solid var(--accent)', paddingLeft: '14px', color: 'var(--text-h)' }}>Your Placement Drives</h2>
                <button 
                  className="nav-btn" 
                  style={{ background: 'var(--accent)', border: 'none', color: '#fff', cursor: 'pointer' }}
                  onClick={() => setShowCreateForm(!showCreateForm)}
                >
                  {showCreateForm ? 'Cancel' : 'Post New Drive'}
                </button>
              </div>

              {showCreateForm && (
                <div className="create-drive-card" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border)', padding: '28px', borderRadius: '16px', marginBottom: '32px' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', color: 'var(--text-h)' }}>Create New Placement Drive</h3>
                  {formError && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{formError}</div>}
                  {formSuccess && <div className="alert alert-success" style={{ marginBottom: '16px' }}>{formSuccess}</div>}
                  <form onSubmit={handleCreateJob}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div className="form-group">
                        <label htmlFor="title">Job Title</label>
                        <input
                          type="text"
                          id="title"
                          placeholder="e.g. Software Engineer"
                          value={jobData.title}
                          onChange={(e) => setJobData({ ...jobData, title: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="company">Company Name</label>
                        <input
                          type="text"
                          id="company"
                          placeholder="e.g. Google"
                          value={jobData.company}
                          onChange={(e) => setJobData({ ...jobData, company: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '16px' }}>
                      <label htmlFor="description">Job Description</label>
                      <textarea
                        id="description"
                        placeholder="Enter detailed job description, responsibilities, etc..."
                        value={jobData.description}
                        onChange={(e) => setJobData({ ...jobData, description: e.target.value })}
                        required
                        style={{ width: '100%', minHeight: '100px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', color: '#fff', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div className="form-group">
                        <label htmlFor="ctc">CTC (LPA)</label>
                        <input
                          type="number"
                          id="ctc"
                          placeholder="e.g. 12"
                          value={jobData.ctc}
                          onChange={(e) => setJobData({ ...jobData, ctc: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="location">Location</label>
                        <input
                          type="text"
                          id="location"
                          placeholder="e.g. Bangalore"
                          value={jobData.location}
                          onChange={(e) => setJobData({ ...jobData, location: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="deadline">Application Deadline</label>
                        <input
                          type="date"
                          id="deadline"
                          value={jobData.deadline}
                          onChange={(e) => setJobData({ ...jobData, deadline: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-h)' }}>Eligible Branches</label>
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        {['CSE', 'ECE', 'EEE', 'Mech', 'CIVIL'].map(branch => (
                          <label key={branch} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text)' }}>
                            <input
                              type="checkbox"
                              checked={jobData.eligibleBranches.includes(branch)}
                              onChange={(e) => {
                                const updated = e.target.checked
                                  ? [...jobData.eligibleBranches, branch]
                                  : jobData.eligibleBranches.filter(b => b !== branch);
                                setJobData({ ...jobData, eligibleBranches: updated });
                              }}
                            />
                            {branch}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                      <div className="form-group">
                        <label htmlFor="bannerImage">Banner Image (Optional)</label>
                        <input
                          type="file"
                          id="bannerImage"
                          accept="image/*"
                          onChange={(e) => setJobData({ ...jobData, bannerImage: e.target.files[0] })}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="galleryImages">Gallery Images (Optional)</label>
                        <input
                          type="file"
                          id="galleryImages"
                          accept="image/*"
                          multiple
                          onChange={(e) => setJobData({ ...jobData, galleryImages: Array.from(e.target.files) })}
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '24px' }}>
                      <label htmlFor="jdPdf">Upload JD Document (PDF Format)</label>
                      <input
                        type="file"
                        id="jdPdf"
                        accept=".pdf"
                        onChange={(e) => setJobData({ ...jobData, jdPdf: e.target.files[0] })}
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={formLoading}
                      style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'var(--accent)', border: 'none', color: '#fff', fontWeight: '700', fontSize: '16px', cursor: 'pointer' }}
                    >
                      {formLoading ? 'Creating Drive...' : 'Publish Placement Drive'}
                    </button>
                  </form>
                </div>
              )}

              {drivesLoading ? (
                <p>Loading your drives...</p>
              ) : myDrives.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border)', borderRadius: '12px', color: 'var(--text)' }}>
                  You haven't posted any placement drives yet.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {myDrives.map(drive => (
                    <div key={drive._id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', padding: '20px', borderRadius: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{drive.company}</span>
                        <h3 style={{ margin: '4px 0 12px 0', fontSize: '18px', color: 'var(--text-h)' }}>{drive.title}</h3>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text)' }}>
                          <span>💼 {drive.ctc} LPA</span>
                          <span>📍 {drive.location}</span>
                        </div>
                      </div>
                      <Link 
                        to={`/jobs/${drive._id}`} 
                        style={{ marginTop: '16px', padding: '10px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', color: '#fff', textDecoration: 'none', fontSize: '13px', fontWeight: '600', textAlign: 'center', display: 'block', border: '1px solid var(--border)' }}
                      >
                        View drive page
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
