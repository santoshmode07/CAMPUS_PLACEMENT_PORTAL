import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './JobDetails.css';

// Default high-quality fallback assets
const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80';
const DEFAULT_GALLERY = [
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1497215842964-222920896a4a?auto=format&fit=crop&w=400&q=80'
];

const JobDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [job, setJob] = useState(null);
  const [otherJobs, setOtherJobs] = useState([]);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch job description details
      const response = await api.get(`/jobs/${id}`);
      setJob(response.data.job);

      // 2. Fetch applications to check if student already applied to this specific job
      if (user && user.role === 'student') {
        const appsResponse = await api.get('/applications/my-applications');
        const myApps = appsResponse.data.applications || [];
        const match = myApps.some((app) => app.job?._id === id);
        setHasApplied(match);
      }

      // 3. Fetch other active jobs for recommendations
      const jobsResponse = await api.get('/jobs');
      const allJobs = jobsResponse.data.jobs || [];
      const recommendations = allJobs.filter((j) => j._id !== id).slice(0, 3);
      setOtherJobs(recommendations);
    } catch (err) {
      console.error('Error fetching job details:', err);
      setError('Could not retrieve job specifications. The job might not exist or connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    setApplyLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post(`/applications/${id}`);
      setHasApplied(true);
      setSuccess('Applied successfully! Good luck with your selection.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Application error:', err);
      const msg = err.response?.data?.message || 'Failed to submit application. Please try again.';
      setError(msg);
    } finally {
      setApplyLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="job-details-container">
        <div className="details-header-nav">
          <div className="skeleton-shimmer" style={{ width: '120px', height: '20px', borderRadius: '4px' }}></div>
        </div>
        <div className="job-hero">
          <div className="skeleton-hero-banner skeleton-shimmer"></div>
          <div className="skeleton-hero-content">
            <div className="skeleton-text-line skeleton-shimmer" style={{ width: '80px' }}></div>
            <div className="skeleton-text-line skeleton-shimmer" style={{ width: '300px', height: '32px' }}></div>
            <div className="skeleton-text-line skeleton-shimmer" style={{ width: '150px' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="job-details-container">
        <Link to="/jobs" className="back-link">← Back to Drives</Link>
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  // Resolve branding assets directly from DB entries with fallback defaults
  const banner = job.bannerImage || DEFAULT_BANNER;
  const gallery = job.galleryImages && job.galleryImages.length > 0 ? job.galleryImages : DEFAULT_GALLERY;

  const isEligibleBranch = user ? job.eligibleBranches.includes(user.branch) : false;
  const isDeadlinePassed = new Date() > new Date(job.deadline);
  
  const deadlineDate = new Date(job.deadline).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="job-details-container">
      <header className="details-header-nav">
        <Link to="/jobs" className="back-link">
          ← Back to Drives
        </Link>
        <nav className="nav-links">
          <Link to="/dashboard" className="nav-btn">Dashboard</Link>
          <Link to="/jobs" className="nav-btn active">Jobs</Link>
        </nav>
      </header>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Hero Header */}
      <div className="job-hero">
        <div 
          className="hero-banner" 
          style={{ backgroundImage: `url(${banner})` }}
        />
        <div className="hero-content">
          <div className="hero-main-info">
            <span className="hero-company">{job.company}</span>
            <h1 className="hero-title">{job.title}</h1>
            <div className="hero-location">
              📍 {job.location}
            </div>
          </div>
          
          <div className="hero-action-area">
            {hasApplied && (
              <span className="status-badge applied">Applied ✓</span>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="metrics-grid">
        <div className="metric-card">
          <span className="meta-label">Package Offer</span>
          <span className="meta-value" style={{ fontSize: '18px', color: 'var(--accent)' }}>
            💼 {job.ctc} LPA
          </span>
        </div>
        <div className="metric-card">
          <span className="meta-label">Application Status</span>
          <span className="meta-value" style={{ fontSize: '18px' }}>
            🟢 {hasApplied ? 'Applied' : isDeadlinePassed ? 'Closed' : 'Open'}
          </span>
        </div>
        <div className="metric-card">
          <span className="meta-label">Apply Deadline</span>
          <span className="meta-value" style={{ fontSize: '18px', color: isDeadlinePassed ? '#f87171' : 'var(--text-h)' }}>
            📅 {deadlineDate}
          </span>
        </div>
      </div>

      {/* Unified Column Layout */}
      <div className="details-layout-unified">
        {/* Job Specifications Section */}
        <div className="details-section-card">
          <h2>Job Specifications & JD</h2>
          <p className="jd-text">{job.description}</p>
          {job.jdLink && (
            <div className="jd-pdf-link-container" style={{ marginTop: '20px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--text)', fontWeight: '500' }}>For more JD info:</span>
              <a href={job.jdLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                📄 PDF
              </a>
            </div>
          )}
          
          <h3 className="section-subtitle">Key Responsibilities:</h3>
          <ul className="details-bullets">
            <li>Collaborate with engineers and management teams to design and scale applications.</li>
            <li>Develop high-quality, secure, and performant code in accordance with coding standards.</li>
            <li>Participate in architectural reviews, testing phases, and validation pipelines.</li>
            <li>Analyze logs and optimize codebases to prevent system bottlenecks.</li>
          </ul>

          <h3 className="section-subtitle">Candidate Requirements:</h3>
          <ul className="details-bullets">
            <li>Must be from one of the eligible academic branches ({job.eligibleBranches.join(', ')}).</li>
            <li>Strong problem-solving capability and knowledge of algorithms.</li>
            <li>Familiarity with systems engineering and modern databases.</li>
          </ul>
        </div>

        {/* Academic Eligibility section */}
        <div className="details-section-card">
          <h2>Academic Eligibility & Verification</h2>
          <div className="eligibility-list">
            <div className="eligibility-item">
              <div className="eligibility-info">
                <span className="eligibility-title">Eligible Branches</span>
                <span className="eligibility-desc">{job.eligibleBranches.join(', ')}</span>
              </div>
              <span className={`eligibility-status ${isEligibleBranch ? 'pass' : 'fail'}`}>
                {isEligibleBranch ? '✓ Branch Matched' : '✗ Branch Mismatch'}
              </span>
            </div>
            <div className="eligibility-item">
              <div className="eligibility-info">
                <span className="eligibility-title">Registration Status</span>
                <span className="eligibility-desc">Registration closes on {deadlineDate}</span>
              </div>
              <span className={`eligibility-status ${!isDeadlinePassed ? 'pass' : 'fail'}`}>
                {!isDeadlinePassed ? '✓ Active' : '✗ Closed'}
              </span>
            </div>
          </div>
        </div>

        {/* Company Workspace Photos */}
        <div className="details-section-card gallery-section">
          <h2>Company Workspace Gallery</h2>
          <p className="gallery-subtitle">
            Explore company workspace details, career development resources, and culture.
          </p>
          <div className="gallery-grid">
            {gallery.map((img, idx) => (
              <div key={idx} className="gallery-img-container">
                <img 
                  src={img} 
                  alt={`${job.company} workspace ${idx + 1}`} 
                  className="gallery-img" 
                />
              </div>
            ))}
          </div>
        </div>

        {/* Professional Application Desk Card */}
        {user && user.role === 'student' && (
          <div className="details-section-card application-desk-card">
            <div className="desk-header">
              <h2>Official Application Submission</h2>
              <span className="desk-badge">Student Desk</span>
            </div>
            <p className="desk-description">
              Please review your academic credentials below. By submitting, this verified profile information will be forwarded directly to the <strong>{job.company} Recruitment Team</strong>.
            </p>
            
            <div className="profile-preview-grid">
              <div className="preview-field">
                <span className="field-label">Candidate Name</span>
                <span className="field-value">{user.name}</span>
              </div>
              <div className="preview-field">
                <span className="field-label">Student ID</span>
                <span className="field-value">{user.student_id}</span>
              </div>
              <div className="preview-field">
                <span className="field-label">Academic CGPA</span>
                <span className="field-value">{user.cgpa || 'N/A'} CGPA</span>
              </div>
              <div className="preview-field">
                <span className="field-label">Branch & Graduation Year</span>
                <span className="field-value">{user.branch} — Year {user.year}</span>
              </div>
              <div className="preview-field full-width">
                <span className="field-label">Registered Resume (PDF Document)</span>
                <span className="field-value resume-link-value">
                  {user.resumeLink ? (
                    <a href={user.resumeLink} target="_blank" rel="noopener noreferrer" className="resume-url-preview">
                      📄 View Uploaded Resume PDF ↗
                    </a>
                  ) : (
                    <span className="no-resume-alert">⚠️ No resume uploaded in your profile</span>
                  )}
                </span>
              </div>
            </div>

            <div className="desk-action-area">
              {hasApplied ? (
                <div className="desk-status-feedback success">
                  <span className="feedback-icon">✓</span>
                  <div>
                    <h4>Application Transmitted</h4>
                    <p>Your academic profile was successfully shared with {job.company}. Good luck!</p>
                  </div>
                </div>
              ) : isDeadlinePassed ? (
                <div className="desk-status-feedback error">
                  <span className="feedback-icon">✗</span>
                  <div>
                    <h4>Registration Closed</h4>
                    <p>This drive is no longer accepting student applications.</p>
                  </div>
                </div>
              ) : !isEligibleBranch ? (
                <div className="desk-status-feedback error">
                  <span className="feedback-icon">✗</span>
                  <div>
                    <h4>Branch Ineligible</h4>
                    <p>Your academic department ({user.branch}) is not listed as eligible for this recruitment drive.</p>
                  </div>
                </div>
              ) : (
                <button
                  className="apply-btn desk-submit-btn"
                  onClick={handleApply}
                  disabled={applyLoading}
                >
                  {applyLoading ? 'Transmitting Profile Credentials...' : 'Submit Placement Application'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Recommended/Other Drives Section */}
      {otherJobs.length > 0 && (
        <div className="recommendations-section">
          <h2 className="recommendations-title">Other Active Placement Drives</h2>
          <div className="recommendations-grid">
            {otherJobs.map((otherJob) => {
              const otherJobBanner = otherJob.bannerImage || DEFAULT_BANNER;
              return (
                <div 
                  key={otherJob._id} 
                  className="recommendation-card"
                  onClick={() => navigate(`/jobs/${otherJob._id}`)}
                >
                  <div 
                    className="recommendation-banner"
                    style={{ backgroundImage: `url(${otherJobBanner})` }}
                  />
                  <div className="recommendation-content">
                    <span className="recommendation-company">{otherJob.company}</span>
                    <h3 className="recommendation-job-title">{otherJob.title}</h3>
                    <div className="recommendation-meta">
                      <span>📍 {otherJob.location}</span>
                      <span className="recommendation-ctc">{otherJob.ctc} LPA</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;
