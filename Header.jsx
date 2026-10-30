import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Globe, LogOut, Building2, KeyRound } from 'lucide-react';
import {
  selectCurrentUser,
  selectCurrentAdmin,
  selectIsSuperAdmin,
  logout,
} from '../features/auth/authSlice';

const STATUS_COLORS = {
  Active: '#10b981',
  Pending: '#dfa015',
  'Verification Pending': '#dfa015',
  'Subscription Expired': '#ef4444',
  Expired: '#ef4444',
  Blocked: '#7f1d1d',
};

export default function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector(selectCurrentUser);
  const admin = useSelector(selectCurrentAdmin);
  const isSuperAdmin = useSelector(selectIsSuperAdmin);

  const getStatusColor = (status) => STATUS_COLORS[status] || '#64748b';

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleAdminLogout = () => {
    dispatch(logout());
    navigate('/admin-login');
  };

  return (
    <header className="main-header">
      <div className="top-bar">
        <div className="top-bar-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Globe size={14} />
            <span>B2B Portal</span>
          </div>
          <div className="top-bar-links">
            <a href="#benefits">Agent Benefits</a>
            <a href="#pricing">Portal Pricing</a>
            {isSuperAdmin ? (
              <span style={{ marginLeft: '20px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <KeyRound size={14} style={{ color: '#dfa015' }} />
                <span style={{ fontWeight: 'bold' }}>Super Admin Panel</span>
              </span>
            ) : user ? (
              <span style={{ marginLeft: '20px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <Building2 size={14} />
                <span style={{ fontWeight: 'bold' }}>{user.agencyName}</span>
                <span style={{
                  backgroundColor: getStatusColor(user.status),
                  color: '#ffffff',
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '12px',
                  marginLeft: '5px',
                  fontWeight: '600',
                }}>
                  {user.status || 'Pending'}
                </span>
              </span>
            ) : (
              <>
                <Link to="/login" style={{ marginLeft: '20px', fontWeight: '600' }}>Agent Login</Link>
                <Link to="/register" style={{ marginLeft: '20px', fontWeight: '600', color: '#dfa015' }}>Register Agency</Link>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="header-container">
        <div className="logo">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <img
              src="/logo_emblem.png"
              alt="Dream Catcher Logo"
              className="logo-emblem-animate"
              style={{ height: '38px', width: '38px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
              <span style={{ fontSize: '16px', fontWeight: '800', color: '#0c2340', fontFamily: "'Outfit', 'Inter', sans-serif", letterSpacing: '-0.2px' }}>
                Dream Catcher <span style={{ color: '#dfa015', fontWeight: '700', fontSize: '15px' }}>Immigrations</span>
              </span>
              <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                B2B VISA BOOKING PORTAL
              </span>
            </div>
          </Link>
        </div>
        <nav className="main-nav">
          {isSuperAdmin ? (
            <>
              <NavLink to="/admin-dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Admin Dashboard
              </NavLink>
              <NavLink to="/track" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Track Applications
              </NavLink>
              <button
                onClick={handleAdminLogout}
                className="nav-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', padding: '0', fontWeight: '600' }}
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : user ? (
            <>
              <NavLink to="/agent-dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Agent Dashboard
              </NavLink>
              <NavLink to="/book" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Book Appointment
              </NavLink>
              <NavLink to="/track" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Track Applications
              </NavLink>
              <button
                onClick={handleLogout}
                className="nav-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', padding: '0', fontWeight: '600' }}
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} end>
                Home
              </NavLink>
              <NavLink
                to="/attend-centre/delhi"
                className={() => (window.location.pathname.startsWith('/attend-centre/') ? 'nav-link active' : 'nav-link')}
              >
                Find a Centre
              </NavLink>
              <NavLink to="/login" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Agent Portal
              </NavLink>
              <NavLink to="/admin-login" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Admin Panel
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}