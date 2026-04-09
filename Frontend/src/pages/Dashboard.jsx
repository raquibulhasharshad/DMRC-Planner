import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Select from 'react-select';
import './Dashboard.css';
import { API_BASE_URL } from '../config/api.config';

const getLineColor = (lineName) => {
  const name = lineName.toLowerCase();
  
  // Vibrant DMRC Palette optimized for Dark Mode
  if (name.includes('red')) return '#FF1744';     // Bright Red
  if (name.includes('yellow')) return '#FFD600';  // Vibrant Yellow
  if (name.includes('blue')) return '#0091EA';    // Sky Blue
  if (name.includes('green')) return '#00C853';   // Bright Green
  if (name.includes('voilet') || name.includes('violet')) return '#AA00FF'; // Purple/Violet
  if (name.includes('pink')) return '#FF4081';    // Bright Pink
  if (name.includes('magenta')) return '#D81B60'; // Deep Magenta/Raspberry
  if (name.includes('orange')) return '#FF9100';  // Bright Orange
  if (name.includes('aqua')) return '#00E5FF';    // Bright Cyan/Aqua
  if (name.includes('gray') || name.includes('grey')) return '#B0BEC5';   // Light Gray
  if (name.includes('rapid')) return '#00BFA5';   // Teal/Rapid
  
  return '#90A4AE'; // Default Slate
};

const LegVisualizer = ({ leg, legIndex, isLastLeg, isOverallStartIdx, isOverallEndIdx, nextLeg }) => {
  const [expanded, setExpanded] = useState(false);
  const legColor = getLineColor(leg.lineName);

  const stations = leg.stations || [];
  const numIntermediate = stations.length > 2 ? stations.length - 2 : 0;
  const showAccordion = numIntermediate > 1;

  if (stations.length === 0) return null;

  return (
    <React.Fragment>
      <div className="route-leg" style={{ '--current-leg-color': legColor }}>
         {/* Render first station */}
         <div className="timeline-item">
            <div className="timeline-node"></div>
            <div className="timeline-line"></div>
            <div className="timeline-content">
              <div className="station-name">
                <span className="s-title">{stations[0].displayName}</span>
                <span className="leg-badge" style={{ backgroundColor: legColor }}>{leg.lineName}</span>
                { isOverallStartIdx && <span className="loc-badge loc-start">START</span> }
              </div>
            </div>
         </div>
         
         {/* Intermediate stations Toggle */}
         {showAccordion && (
           <div className="timeline-item accordion-item" onClick={() => setExpanded(!expanded)}>
             <div className="timeline-line"></div>
             <div className="timeline-content accordion-btn">
               {expanded ? 'Hide stations ' : `Show all ${numIntermediate} stations `}
               <span className="drop-icon">{expanded ? '▲' : '▼'}</span>
             </div>
           </div>
         )}

         {/* Intermediate stations List */}
         {(!showAccordion || expanded) && stations.slice(1, -1).map((st, i) => (
             <div key={i} className="timeline-item intermediate-item">
               <div className="timeline-node small"></div>
               <div className="timeline-line"></div>
               <div className="timeline-content">
                 <div className="station-name text-muted">{st.displayName}</div>
               </div>
             </div>
           ))}

         {/* Render last station of the leg */}
         {stations.length > 1 && (
           <div className="timeline-item">
              <div className="timeline-node"></div>
              { !isLastLeg && <div className="timeline-line"></div> }
              <div className="timeline-content">
                <div className="station-name">
                  <span className="s-title">{stations[stations.length - 1].displayName}</span>
                  { isLastLeg && <span className="leg-badge" style={{ backgroundColor: legColor }}>{leg.lineName}</span> }
                  { isOverallEndIdx && <span className="loc-badge loc-end">END</span> }
                </div>
              </div>
           </div>
         )}
      </div>
      
      {/* Render Interchange block if not the last leg */}
      {!isLastLeg && nextLeg && (
        <div className="interchange-block">
          <span className="interchange-icon">🔀</span>
          <span className="interchange-text">Change here (move towards {nextLeg.lineName} - 5 Min)</span>
        </div>
      )}
    </React.Fragment>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('metro_user') || 'Traveler';

  const [stations, setStations] = useState([]);
  const [sourceId, setSourceId] = useState('');
  const [destId, setDestId] = useState('');
  const [isSunday, setIsSunday] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [route, setRoute] = useState(null);
  const [error, setError] = useState('');

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [profileData, setProfileData] = useState({ name: '', email: '', phoneNumber: '' });
  const [editData, setEditData] = useState({ name: '', phoneNumber: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deleteAccountData, setDeleteAccountData] = useState({ email: '', password: '' });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ title: '', message: '', onConfirm: null });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/auth/me`);
      setProfileData(res.data);
      setEditData({ name: res.data.name, phoneNumber: res.data.phoneNumber });
      localStorage.setItem('metro_user', res.data.name);
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError('');
    setModalSuccess('');
    try {
      const res = await axios.put(`${API_BASE_URL}/api/auth/update-profile`, editData);
      setProfileData(res.data);
      localStorage.setItem('metro_user', res.data.name);
      setModalSuccess("Profile updated successfully!");
      setIsEditingProfile(false);
    } catch (err) {
      setModalError(err.response?.data || "Failed to update profile");
    } finally {
      setModalLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setModalError("New passwords do not match");
      return;
    }
    setModalLoading(true);
    setModalError('');
    setModalSuccess('');
    try {
      await axios.post(`${API_BASE_URL}/api/auth/change-password`, {
        email: profileData.email,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });
      setModalSuccess("Password changed successfully!");
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordChange(false);
    } catch (err) {
      setModalError(err.response?.data || "Failed to change password");
    } finally {
      setModalLoading(false);
    }
  };

  const triggerConfirmModal = (title, message, onConfirm) => {
    setConfirmConfig({ title, message, onConfirm });
    setShowConfirmModal(true);
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    triggerConfirmModal(
      "Are you absolutely sure?", 
      "This action is permanent and cannot be undone. All your data will be cleared.",
      async () => {
        setModalLoading(true);
        setModalError('');
        setModalSuccess('');
        
        try {
          await axios.post(`${API_BASE_URL}/api/auth/delete-account`, deleteAccountData);
          setModalSuccess("Account deleted successfully. Redirecting...");
          setTimeout(() => {
            localStorage.clear();
            navigate('/login');
          }, 2000);
        } catch (err) {
          setModalError(err.response?.data || "Failed to delete account. Check your credentials.");
        } finally {
          setModalLoading(false);
        }
      }
    );
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    // Fetch stations
    const fetchStations = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/stations`);
        setStations(res.data.sort((a,b) => a.name.localeCompare(b.name)));
      } catch (err) {
        if (err.response && err.response.status === 401) {
          localStorage.clear();
          navigate('/login');
        } else {
          console.error("Could not load stations:", err);
        }
      }
    };
    fetchStations();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/logout`);
    } catch (err) {
      console.error(err);
    }
    localStorage.clear();
    navigate('/login');
  };

  const calculateRoute = async (e) => {
    e.preventDefault();
    if (sourceId === destId) {
      setError("Source and destination cannot be the same.");
      return;
    }
    
    setLoading(true);
    setError('');
    setRoute(null);

    try {
      const res = await axios.get(`${API_BASE_URL}/api/route?startId=${sourceId}&endId=${destId}&isSunday=${isSunday}`);
      setRoute(res.data);
    } catch(err) {
      if (err.response && err.response.status === 401) {
        localStorage.clear();
        navigate('/login');
      } else {
        setError("Could not calculate route. Ensure stations are connected.");
      }
    } finally {
      setLoading(false);
    }
  };

  const stationOptions = stations.map(s => ({
    value: s.id,
    label: `${s.name} (${s.lines})`
  }));

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      borderColor: state.isFocused ? '#3b82f6' : 'rgba(255, 255, 255, 0.1)',
      padding: '2px',
      borderRadius: '8px',
      boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
      '&:hover': {
        borderColor: 'rgba(255, 255, 255, 0.3)'
      }
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#1a202c',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      zIndex: 100,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
      color: 'white',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: '#2563eb'
      }
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'white',
    }),
    input: (provided) => ({
      ...provided,
      color: 'white',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#94a3b8',
    }),
  };

  return (
    <div className={`dashboard-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Mobile Header */}
      <header className="mobile-header">
        <div className="branding">
          <span className="logo-icon">🚇</span>
          <h2>DMRC</h2>
        </div>
        <button className="menu-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? '✕' : '☰'}
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`sidebar glass-panel ${isSidebarOpen ? 'active' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-icon">🚇</div>
          <h2>DMRC Planner</h2>
        </div>
        
        <div className="user-profile">
          <div className="avatar">{profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U'}</div>
          <div className="user-details" style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="welcome">Welcome,</span>
            <span className="name">{profileData.name || 'Traveler'}</span>
          </div>
        </div>

        <form onSubmit={calculateRoute} className="route-form">
          <div className="form-group">
            <label>Source Station</label>
            <Select
              options={stationOptions}
              value={stationOptions.find(o => o.value === sourceId) || null}
              onChange={selected => setSourceId(selected ? selected.value : '')}
              placeholder="Select Starting Point..."
              styles={customSelectStyles}
              isSearchable
              isClearable
            />
          </div>

          <div className="form-group">
            <label>Destination Station</label>
            <Select
              options={stationOptions}
              value={stationOptions.find(o => o.value === destId) || null}
              onChange={selected => setDestId(selected ? selected.value : '')}
              placeholder="Select Destination..."
              styles={customSelectStyles}
              isSearchable
              isClearable
            />
          </div>

          <label className="checkbox-container">
            <input 
              type="checkbox" 
              checked={isSunday} 
              onChange={e => setIsSunday(e.target.checked)} 
            />
            <span className="checkmark"></span>
            Apply Sunday / Holiday Fare Discount
          </label>

          <button type="submit" className="primary-btn calculate-btn" disabled={loading}>
            {loading ? 'Finding Shortest Path...' : 'Calculate Route'}
          </button>
        </form>

        <div className="sidebar-footer">
          <button className="settings-btn" onClick={() => { setIsSettingsOpen(true); setModalError(''); setModalSuccess(''); }}>⚙️ Settings</button>
          <button className="logout-btn" onClick={handleLogout}>Log Out</button>
        </div>
      </aside>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="modal-overlay">
          <div className="modal-box glass-panel fade-in">
            <div className="modal-header">
              <h3>
                {showPasswordChange ? 'Change Password' : 
                 showDeleteAccount ? 'Delete Account' : 'User Settings'}
              </h3>
              <button className="close-btn" onClick={() => { 
                setIsSettingsOpen(false); 
                setIsEditingProfile(false); 
                setShowPasswordChange(false);
                setShowDeleteAccount(false);
              }}>&times;</button>
            </div>
            
            <div className="modal-body">
              {modalError && <div className="error-alert">{modalError}</div>}
              {modalSuccess && <div className="success-alert">{modalSuccess}</div>}

              {showPasswordChange ? (
                <form onSubmit={handlePasswordChange} className="password-form">
                  <div className="form-group">
                    <label>Current Password</label>
                    <input 
                      type="password" 
                      required 
                      value={passwordData.currentPassword}
                      onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="modal-input"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input 
                      type="password" 
                      required 
                      value={passwordData.newPassword}
                      onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="modal-input"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input 
                      type="password" 
                      required 
                      value={passwordData.confirmPassword}
                      onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="modal-input"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="modal-actions">
                    <button type="submit" className="save-btn" disabled={modalLoading}>
                      {modalLoading ? 'Updating...' : 'Update Password'}
                    </button>
                    <button type="button" className="cancel-btn" onClick={() => setShowPasswordChange(false)}>Back</button>
                  </div>
                </form>
              ) : showDeleteAccount ? (
                <form onSubmit={handleDeleteAccount} className="delete-account-form">
                  <div className="danger-zone-header">
                    <span className="warning-icon">⚠️</span>
                    <p>You are about to permanently delete your account. Please enter your credentials to confirm.</p>
                  </div>
                  
                  <div className="form-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      required 
                      value={deleteAccountData.email}
                      onChange={e => setDeleteAccountData({...deleteAccountData, email: e.target.value})}
                      className="modal-input"
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Password</label>
                    <input 
                      type="password" 
                      required 
                      value={deleteAccountData.password}
                      onChange={e => setDeleteAccountData({...deleteAccountData, password: e.target.value})}
                      className="modal-input"
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <div className="modal-actions">
                    <button type="submit" className="delete-confirm-btn" disabled={modalLoading}>
                      {modalLoading ? 'Deleting...' : 'Permanently Delete Account'}
                    </button>
                    <button type="button" className="cancel-btn" onClick={() => setShowDeleteAccount(false)}>Back</button>
                  </div>
                </form>
              ) : (
                <div className="profile-section">
                  <div className="info-group">
                    <label>Name</label>
                    {isEditingProfile ? (
                      <input 
                        type="text" 
                        value={editData.name} 
                        onChange={e => setEditData({...editData, name: e.target.value})}
                        className="modal-input"
                      />
                    ) : (
                      <div className="info-value">{profileData.name}</div>
                    )}
                  </div>

                  <div className="info-group">
                    <label>Email ID</label>
                    <div className="info-value readonly">{profileData.email}</div>
                    <small className="help-text">(Email cannot be changed)</small>
                  </div>

                  <div className="info-group">
                    <label>Phone Number</label>
                    {isEditingProfile ? (
                      <input 
                        type="text" 
                        value={editData.phoneNumber} 
                        onChange={e => setEditData({...editData, phoneNumber: e.target.value})}
                        className="modal-input"
                      />
                    ) : (
                      <div className="info-value">{profileData.phoneNumber}</div>
                    )}
                  </div>

                  <div className="modal-actions">
                    {isEditingProfile ? (
                      <>
                        <button className="save-btn" onClick={handleUpdateProfile} disabled={modalLoading}>
                          {modalLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button className="cancel-btn" onClick={() => setIsEditingProfile(false)}>Cancel</button>
                      </>
                    ) : (
                      <button className="edit-btn" onClick={() => setIsEditingProfile(true)}>Edit Profile</button>
                    )}
                  </div>

                  <hr className="modal-divider" />
                  
                  <div className="settings-extra-actions">
                    <button className="change-pass-trigger" onClick={() => { setShowPasswordChange(true); setModalError(''); setModalSuccess(''); }}>
                      🔒 Change Password
                    </button>
                    <button className="delete-account-trigger" onClick={() => { setShowDeleteAccount(true); setModalError(''); setModalSuccess(''); }}>
                      🗑️ Delete Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="main-content">
        {error && <div className="error-alert lg-alert">{error}</div>}

        {!route && !loading && !error && (
          <div className="empty-state">
            <div className="empty-icon">🗺️</div>
            <h3>Ready to Explore Delhi</h3>
            <p>Select your source and destination to map your journey.</p>
          </div>
        )}

        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Analyzing Metro Graph...</p>
          </div>
        )}

        {route && !loading && (
          <div className="route-results glass-panel fade-in">
            <div className="results-header">
              <h3>Journey Summary</h3>
            </div>
            
            <div className="metrics-grid">
              <div className="metric-card">
                <span className="icon">⏱️</span>
                <div className="metric-info">
                  <span className="value">{route.estimatedTimeMinutes} min</span>
                  <span className="label">Estimated Time</span>
                </div>
              </div>
              <div className="metric-card">
                <span className="icon">₹</span>
                <div className="metric-info">
                  <span className="value">Rs. {route.fare}</span>
                  <span className="label">Total Fare</span>
                </div>
              </div>
              <div className="metric-card">
                <span className="icon">🚉</span>
                <div className="metric-info">
                  <span className="value">{route.totalStations}</span>
                  <span className="label">Stations</span>
                </div>
              </div>
              <div className="metric-card">
                <span className="icon">🔄</span>
                <div className="metric-info">
                  <span className="value">{route.interchangesCount}</span>
                  <span className="label">Interchanges</span>
                </div>
              </div>
            </div>

            <div className="path-visualizer">
              <h4>Step-by-Step Route</h4>
              <div className="timeline">
                {route.legs && route.legs.map((leg, index) => {
                   return <LegVisualizer 
                     key={index} 
                     leg={leg} 
                     legIndex={index} 
                     isLastLeg={index === route.legs.length - 1} 
                     isOverallStartIdx={index === 0} 
                     isOverallEndIdx={index === route.legs.length - 1} 
                     nextLeg={route.legs[index + 1]} 
                   />
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Custom Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay confirm-overlay">
          <div className="modal-box confirm-box glass-panel fade-in">
            <div className="modal-header">
              <h3>{confirmConfig.title}</h3>
              <button className="close-btn" onClick={() => setShowConfirmModal(false)}>&times;</button>
            </div>
            <div className="modal-body confirm-body">
              <p>{confirmConfig.message}</p>
              <div className="modal-actions">
                <button className="delete-confirm-btn" onClick={() => { confirmConfig.onConfirm(); setShowConfirmModal(false); }}>
                  Confirm
                </button>
                <button className="cancel-btn" onClick={() => setShowConfirmModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
