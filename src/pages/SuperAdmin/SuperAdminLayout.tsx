import { useState } from 'react';
import { useNavigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks.ts';
import { logout } from '../../store/authSlice.ts';
import { 
  Shield, 
  Download, 
  Users, 
  Key, 
  LogOut, 
  Menu, 
  X, 
  Moon, 
  Sun
} from 'lucide-react';

const SuperAdminLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.getAttribute('data-theme') === 'dark');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname.includes('licenses')) return 'License Management';
    if (location.pathname.includes('dashboard')) return 'APK Version Manager';
    if (location.pathname.includes('config')) return 'Organisation Settings';
    return 'Super Admin Control';
  };

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    setIsDarkMode(!isDarkMode);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/whitehouse');
  };

  return (
    <div className="main-layout" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* SIDEBAR */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <button 
          className="btn sidebar-mobile-close" 
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <X size={18} />
        </button>
        
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Shield size={28} />
            <div>
              <div className="sidebar-logo-text">SchoolSync</div>
              <div className="sidebar-logo-badge">Super Admin</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/whitehouse/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Download size={16} />
            APK Versions
          </NavLink>
          <div className="nav-item" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
            <Users size={16} />
            Organizations
          </div>
          <NavLink to="/whitehouse/licenses" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Key size={16} />
            Licenses
          </NavLink>
          <NavLink to="/whitehouse/config" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Shield size={16} />
            Global Settings
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user" style={{ marginBottom: 'var(--space-2)' }}>
            <div className="sidebar-avatar">SA</div>
            <div>
              <div className="sidebar-user-name">Super Admin</div>
              <div className="sidebar-user-role">Control Center</div>
            </div>
          </div>
          <button 
            className="nav-item" 
            onClick={handleLogout} 
            style={{ width: '100%', border: 'none', background: 'transparent', marginTop: 'auto' }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={20} />
            </button>
            <span className="topbar-title">{getPageTitle()}</span>
          </div>
          <div className="topbar-right">
            <button className="theme-toggle" onClick={toggleTheme}>
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>

        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
