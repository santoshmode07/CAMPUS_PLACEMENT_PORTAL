import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './JobsList.css';

const JobsList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Track loading state of individual application buttons: { [jobId]: true/false }
  const [applyLoading, setApplyLoading] = useState({});
  const [successMessages, setSuccessMessages] = useState({});

  useEffect(() => {
    fetchJobsAndApplications();
  }, []);

  const fetchJobsAndApplications = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch all placement jobs
      const jobsResponse = await api.get('/jobs');
      const allJobs = jobsResponse.data.jobs || [];
      setJobs(allJobs);

      // 2. Fetch student's existing applications to map "Already Applied" state
      if (user && user.role === 'student') {
        const appsResponse = await api.get('/applications/my-applications');
        const myApps = appsResponse.data.applications || [];
        
        // Extract job IDs from application array and load into a Set for O(1) checks
        const appliedIds = new Set(myApps.map((app) => app.job?._id).filter(Boolean));
        setAppliedJobIds(appliedIds);
      }
    } catch (err) {
      console.error('Error fetching jobs module data:', err);
      setError('Failed to fetch available placement jobs. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    // Enable loading state for this specific card
    setApplyLoading((prev) => ({ ...prev, [jobId]: true }));
    setError('');
    
    try {
      const response = await api.post(`/applications/${jobId}`);
      
      // Update success message for this card
      setSuccessMessages((prev) => ({ ...prev, [jobId]: 'Applied successfully!' }));
      
      // Add the jobId to our local state Set of applied jobs
      setAppliedJobIds((prev) => {
        const newSet = new Set(prev);
        newSet.add(jobId);
        return newSet;
      });

      // Clear the success message after a brief duration
      setTimeout(() => {
        setSuccessMessages((prev) => {
          const updated = { ...prev };
          delete updated[jobId];
          return updated;
        });
      }, 3000);
    } catch (err) {
      console.error('Error applying for job:', err);
      const msg = err.response?.data?.message || 'Failed to submit application. Please try again.';
      setError(msg);
    } finally {
      setApplyLoading((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  // Filter jobs based on company name or title search
  const filteredJobs = jobs.filter((job) => {
    const term = searchQuery.toLowerCase();
    return (
      job.title.toLowerCase().includes(term) ||
      job.company.toLowerCase().includes(term)
    );
  });

  return (
    <div className="jobs-container">
      <header className="jobs-header">
        <div className="jobs-title-section">
          <h1>Placement Drives</h1>
          <p>Explore opportunities and track your eligibility in real time</p>
        </div>
        <nav className="nav-links">
          <Link to="/dashboard" className="nav-btn">Dashboard</Link>
          <Link to="/jobs" className="nav-btn active">Jobs</Link>
        </nav>
      </header>

      {/* Search Input Filter */}
      <div className="filters-section">
        <input
          type="text"
          className="search-input"
          placeholder="Search by role or company (e.g. Google, Frontend Developer)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="jobs-grid">
          {[1, 2, 3].map((num) => (
            <div className="skeleton-card" key={num}>
              <div>
                <div className="skeleton-company skeleton-shimmer"></div>
                <div className="skeleton-title skeleton-shimmer"></div>
                <div className="skeleton-desc skeleton-shimmer"></div>
                <div className="skeleton-meta skeleton-shimmer"></div>
                <div className="skeleton-tags">
                  <div className="skeleton-tag skeleton-shimmer"></div>
                  <div className="skeleton-tag skeleton-shimmer"></div>
                </div>
              </div>
              <div className="skeleton-footer">
                <div className="skeleton-date skeleton-shimmer"></div>
                <div className="skeleton-btn skeleton-shimmer"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="jobs-empty">
          <p>No job placement drives found matching your search.</p>
        </div>
      ) : (
        <div className="jobs-grid">
          {filteredJobs.map((job) => {
            // Check student eligibility criteria
            const isEligibleBranch = user ? job.eligibleBranches.includes(user.branch) : false;
            const hasApplied = appliedJobIds.has(job._id);
            const isDeadlinePassed = new Date() > new Date(job.deadline);
            
            // Format dates cleanly
            const deadlineDate = new Date(job.deadline).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div 
                className="job-card" 
                key={job._id}
                onClick={() => navigate(`/jobs/${job._id}`)}
              >
                <div>
                  <div className="job-card-header">
                    <span className="job-company">{job.company}</span>
                    <h3 className="job-title">{job.title}</h3>
                  </div>

                  <p className="job-description">{job.description}</p>

                  <div className="job-details-meta">
                    <div className="meta-item">
                      <span className="meta-label">Package (CTC)</span>
                      <span className="meta-value">{job.ctc} LPA</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Location</span>
                      <span className="meta-value">{job.location}</span>
                    </div>
                  </div>

                  <div className="eligibility-meta">
                    <span className="eligibility-title">Eligible Branches</span>
                    <div className="branches-tags">
                      {job.eligibleBranches.map((br) => (
                        <span 
                          key={br} 
                          className={`branch-tag ${user && user.branch === br ? 'highlight' : ''}`}
                        >
                          {br} {user && user.branch === br ? ' (Yours)' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div>

                  <div className="job-action-section">
                    <div className="meta-item">
                      <span className="meta-label">Apply Before</span>
                      <span className="meta-value" style={{ fontSize: '13px', color: isDeadlinePassed ? '#f87171' : 'var(--text-h)' }}>
                        {deadlineDate}
                      </span>
                    </div>

                    <button
                      className="apply-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/jobs/${job._id}`);
                      }}
                    >
                      More Info
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default JobsList;
