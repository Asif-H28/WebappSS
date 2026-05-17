import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from './store/hooks.ts';
import { useGetAppVersionsQuery } from './store/apiSlice.ts';
import type { RootState } from './store/index.ts';
import { toggleTheme } from './store/themeSlice.ts';
import { 
  Menu, 
  X, 
  Moon, 
  Sun, 
  Download, 
  Users, 
  Calendar, 
  Star, 

  Bell, 

  Send
} from 'lucide-react';
import toast from 'react-hot-toast';

function App() {
  const theme = useAppSelector((state: RootState) => state.theme.mode);
  const dispatch = useAppDispatch();
  const { data,isLoading, refetch } = useGetAppVersionsQuery();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    workEmail: '',
    phoneNumber: '',
    role: '',
    schoolName: '',
    cityTown: '',
    studentCount: '',
    additionalNotes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

console.log(data, "DATA");
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Scroll Reveal Logic
  useEffect(() => {
    const revealEls = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 60);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    document.body.style.overflow = '';
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    document.body.style.overflow = !isMobileMenuOpen ? 'hidden' : '';
  };

  const handleMainDownload = async () => {
    const loadingToast = toast.loading('Checking for updates...');
    try {
      const result = await refetch();
      const data = result.data;
      
      const version = (Array.isArray(data) && data.length > 0) ? data[0] : null;

      if (version?.downloadUrl) {
        toast.success(`SchoolSync v${version.version} downloading...`, { id: loadingToast });
        window.open(version.downloadUrl, '_blank');
      } else {
        toast.error('APK download link not found in system.', { id: loadingToast });
      }
    } catch (error) {
      toast.error('Failed to connect to update server.', { id: loadingToast });
    }
  };

  const handleLicenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/license-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const result = await response.json();
        toast.success(result.message || 'License request submitted successfully!');
        setFormData({
          fullName: '',
          workEmail: '',
          phoneNumber: '',
          role: '',
          schoolName: '',
          cityTown: '',
          studentCount: '',
          additionalNotes: ''
        });
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to submit request');
      }
    } catch (error) {
      toast.error('An error occurred. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className="app">
      <a href="#main" className="skip-link">Skip to content</a>

      {/* NAV */}
      <nav className="nav" role="navigation" aria-label="Main navigation">
        <div className="container--wide">
          <div className="nav-inner">
            <a href="#" className="nav-logo" aria-label="SchoolSync home">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <rect x="2" y="2" width="24" height="24" rx="7" fill="currentColor" opacity="0.15"/>
                <path d="M7 10.5L14 7L21 10.5V17.5L14 21L7 17.5V10.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                <path d="M14 7V21M7 10.5L21 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" opacity="0.5"/>
                <circle cx="14" cy="14" r="2" fill="currentColor"/>
              </svg>
              SchoolSync
            </a>
            <div className="nav-links" aria-label="Section links">
              <a href="#features">Features</a>
              <a href="#roles">Who It's For</a>
              <a href="#queries">Get License</a>
              <button onClick={handleMainDownload} className="nav-link-btn">Download</button>
            </div>
            <div className="nav-actions">
              <button 
                className="theme-toggle" 
                onClick={() => dispatch(toggleTheme())}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button onClick={handleMainDownload} className="btn btn-ghost nav-download">Download App</button>
            </div>
            <button 
              className="nav-hamburger" 
              onClick={toggleMobileMenu}
              aria-label="Open menu" 
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`} role="dialog" aria-modal="true" aria-label="Mobile navigation">
        <a href="#features" onClick={closeMobileMenu}>Features</a>
        <a href="#roles" onClick={closeMobileMenu}>Who It's For</a>
        <a href="#queries" onClick={closeMobileMenu}>Get License</a>
        <button onClick={() => { closeMobileMenu(); handleMainDownload(); }} className="mobile-nav-btn">Download</button>
        <button className="btn btn-primary" onClick={() => { closeMobileMenu(); handleMainDownload(); }}>
          <Download size={16} strokeWidth={2.5} />
          Download Now
        </button>
      </div>

      <main id="main">
        {/* HERO */}
        <section className="hero" aria-label="Hero section">
          <div className="hero-grid-bg" aria-hidden="true"></div>
          <div className="hero-glow" aria-hidden="true"></div>
          <div className="container" style={{ width: '100%' }}>
            <div className="hero-content">
              <div className="hero-badge">
                <span className="hero-badge-dot"></span>
                Built with Flutter · Enterprise Grade
              </div>
              <h1>The <span>Smarter</span> Way to Run Your School</h1>
              <p>SchoolSync brings admin, teachers, and students onto one unified platform — manage classes, attendance, exams, and communication with ease.</p>
              <div className="hero-ctas">
                <button className="btn btn-primary btn-hero" onClick={handleMainDownload}>
                  <Download size={18} strokeWidth={2.5} />
                  {isLoading ? 'Loading...' : 'Get the App'}
                </button>
                <a href="#features" className="btn btn-ghost btn-hero">See Features</a>
              </div>
              <div className="hero-stats">
                <div className="hero-stat">
                  <span className="hero-stat-num">11</span>
                  <span className="hero-stat-label">Core Modules</span>
                </div>
                <div className="hero-stat">
                  <span className="hero-stat-num">3</span>
                  <span className="hero-stat-label">User Roles</span>
                </div>
                <div className="hero-stat">
                  <span className="hero-stat-num">FCM</span>
                  <span className="hero-stat-label">Push Notifications</span>
                </div>
                <div className="hero-stat">
                  <span className="hero-stat-num">JWT</span>
                  <span className="hero-stat-label">Secure Auth</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PHONE MOCKUP + FEATURES */}
        <section className="mockup-section" id="features" aria-label="App features">
          <div className="container">
            <div className="mockup-inner">
              <div className="mockup-text reveal">
                <p className="section-tag">Built for Schools</p>
                <h2>Everything your school needs, in your pocket</h2>
                <p>A complete multi-tenant system designed for real schools — with strict data isolation and secure license-based access per organisation.</p>
                <div className="mockup-features">
                  <div className="mockup-feature">
                    <div className="mockup-feature-icon" aria-hidden="true">
                      <Users size={18} />
                    </div>
                    <div>
                      <h4>Multi-Role Access</h4>
                      <p>Separate dashboards for Admins, Teachers, and Students — each with role-specific permissions.</p>
                    </div>
                  </div>
                  <div className="mockup-feature">
                    <div className="mockup-feature-icon" aria-hidden="true">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <h4>Smart Attendance</h4>
                      <p>Digital register with leave management, approval workflows, and attendance analytics.</p>
                    </div>
                  </div>
                  <div className="mockup-feature">
                    <div className="mockup-feature-icon" aria-hidden="true">
                      <Star size={18} />
                    </div>
                    <div>
                      <h4>Exam & Results</h4>
                      <p>CA templates, mark entry, and comprehensive performance reports for every student.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="phone-wrap reveal">
                <div className="phone" role="img" aria-label="SchoolSync app screen mockup">
                  <div className="phone-notch"></div>
                  <div className="phone-screen">
                    <div className="phone-status">
                      <span>9:41</span>
                      <span>●●●</span>
                    </div>
                    <div className="phone-header">
                      <div className="phone-header-title">Good morning, Admin 👋</div>
                      <div className="phone-header-sub">Greenwood High School</div>
                    </div>
                    <div className="phone-cards">
                      <div className="phone-card">
                        <div className="phone-card-row">
                          <div className="phone-card-dot" style={{ background: '#4ecdc4' }}></div>
                          <span className="phone-card-label">Today's Attendance</span>
                        </div>
                        <div className="phone-card-val">87% Present</div>
                        <div className="phone-card-sub">Class 10A · 32 students</div>
                      </div>
                      <div className="phone-card">
                        <div className="phone-card-row">
                          <div className="phone-card-dot" style={{ background: '#f6a623' }}></div>
                          <span className="phone-card-label">Join Requests</span>
                        </div>
                        <div className="phone-card-val">4 Pending</div>
                        <div className="phone-card-sub">Awaiting approval</div>
                      </div>
                      <div className="phone-card">
                        <div className="phone-card-row">
                          <div className="phone-card-dot" style={{ background: '#7b68ee' }}></div>
                          <span className="phone-card-label">Upcoming Exam</span>
                        </div>
                        <div className="phone-card-val">Mathematics CA-2</div>
                        <div className="phone-card-sub">Tomorrow · 10:00 AM</div>
                      </div>
                      <div className="phone-card">
                        <div className="phone-card-row">
                          <div className="phone-card-dot" style={{ background: '#5cb85c' }}></div>
                          <span className="phone-card-label">New Notice</span>
                        </div>
                        <div className="phone-card-val">Annual Day 2025</div>
                        <div className="phone-card-sub">Posted 2 hrs ago</div>
                      </div>
                    </div>
                    <div className="phone-bottom">
                      <div className="phone-tab">
                        <div className="phone-tab-dot" style={{ background: 'var(--color-primary)' }}></div>
                        <span className="phone-tab-label">Home</span>
                      </div>
                      <div className="phone-tab">
                        <div className="phone-tab-dot" style={{ background: 'var(--color-text-faint)' }}></div>
                        <span className="phone-tab-label">Classes</span>
                      </div>
                      <div className="phone-tab">
                        <div className="phone-tab-dot" style={{ background: 'var(--color-text-faint)' }}></div>
                        <span className="phone-tab-label">Notices</span>
                      </div>
                      <div className="phone-tab">
                        <div className="phone-tab-dot" style={{ background: 'var(--color-text-faint)' }}></div>
                        <span className="phone-tab-label">Profile</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ROLES & FEATURES */}
        <section className="features-showcase" id="roles" aria-labelledby="roles-title">
          <div className="container">
            <div className="section-header reveal">
               <p className="section-tag">Comprehensive Portals</p>
               <h2 id="roles-title">Purpose-Built for Every Role</h2>
               <p>Explore the complete usage and flow of the application, categorized by user role.</p>
            </div>
            
            {/* Admin */}
            <div className="role-detail-section reveal">
               <div className="role-detail-header">
                  <div className="role-icon-large" style={{ background: 'var(--color-primary-highlight)', color: 'var(--color-primary)' }}>🏫</div>
                  <div>
                    <h3>1. Admin Role <span>(Supervision & Governance)</span></h3>
                    <p className="role-subtitle">The central hub for institutional oversight and configuration.</p>
                  </div>
               </div>
               <div className="role-feature-grid">
                  <FeatureBox title="Institutional Hierarchy" desc="Define administrative roles (Principal, Coordinator, etc.) and assign leadership personnel." />
                  <FeatureBox title="Organization Setup" desc="Manage school branding, basic details, and global settings." />
                  <FeatureBox title="Staff Governance" desc="Approve or reject Teacher join requests and manage the active staff roster." />
                  <FeatureBox title="Leave Management" desc="Review, approve, or reject leave applications submitted by Teachers." />
                  <FeatureBox title="Institutional Communication" desc="Broadcast school-wide notices and chat directly with any staff member in real-time." />
                  <FeatureBox title="Excellence Tracking" desc="Manage the school-wide Achievement Feed to recognize student and staff milestones." />
               </div>
            </div>

            {/* Teacher */}
            <div className="role-detail-section reveal">
               <div className="role-detail-header">
                  <div className="role-icon-large" style={{ background: 'oklch(0.3 0 0 / 0.12)' }}>👨‍🏫</div>
                  <div>
                    <h3>2. Teacher Role <span>(Academic & Classroom Management)</span></h3>
                    <p className="role-subtitle">The engine room for academic delivery and operational management.</p>
                  </div>
               </div>
               <div className="role-feature-grid">
                  <FeatureBox title="Smart Dashboard" desc="At-a-glance view of today’s schedule, attendance summaries, and recent activity." />
                  <FeatureBox title="Classroom Ecosystem" desc="Manage student rosters, organize subjects, and design complex weekly timetables." />
                  <FeatureBox title="Academic Excellence" desc="Record assessments, generate AI-powered quizzes instantly, and share digital study notes." />
                  <FeatureBox title="Operational Tools" desc="Mark live digital attendance, approve student leaves, and monitor live school bus GPS." />
                  <FeatureBox title="Communication" desc="Direct chat with students and parents, and seamless access to school-wide notice boards." />
               </div>
            </div>

            {/* Student */}
            <div className="role-detail-section reveal">
               <div className="role-detail-header">
                  <div className="role-icon-large" style={{ background: 'oklch(0.2 0 0 / 0.1)' }}>🎓</div>
                  <div>
                    <h3>3. Student Role <span>(Learning & Engagement)</span></h3>
                    <p className="role-subtitle">A personalized companion for student success and records.</p>
                  </div>
               </div>
               <div className="role-feature-grid">
                  <FeatureBox title="Learning Hub" desc="Personalized dashboard showing current attendance, next period, and upcoming tests." />
                  <FeatureBox title="Academic Records" desc="Detailed performance reports, interactive quizzes, and downloadable class resources." />
                  <FeatureBox title="Participation Tools" desc="Monitor visual attendance charts, digital timetables, and track leave approval statuses." />
                  <FeatureBox title="Stay Informed" desc="Instant push alerts, notice board access, and an achievement feed to celebrate success." />
               </div>
            </div>

            {/* Transport */}
            <div className="role-detail-section reveal">
               <div className="role-detail-header">
                  <div className="role-icon-large" style={{ background: 'oklch(0.85 0.15 80 / 0.3)' }}>🚌</div>
                  <div>
                    <h3>4. Transport Features <span>(Coordinators & Fleet)</span></h3>
                    <p className="role-subtitle">Specific tools for safety and logistics management.</p>
                  </div>
               </div>
               <div className="role-feature-grid">
                  <FeatureBox title="Fleet Management" desc="Create and maintain accurate vehicle records for buses, vans, and drivers." />
                  <FeatureBox title="Real-time Tracking" desc="Interactive map view showing live coordinates and movement of all school vehicles." />
                  <FeatureBox title="Security Access" desc="Secure PIN-based lookup system for drivers and transport coordinators." />
                  <FeatureBox title="Role-Based Access" desc="Specialized transport status flags for Teachers acting as dedicated transport coordinators." />
               </div>
            </div>

          </div>
        </section>

        {/* TECH HIGHLIGHTS */}
        <section className="tech-highlights" id="tech" aria-labelledby="tech-title">
          <div className="container">
            <div className="section-header reveal">
               <p className="section-tag">Demo Highlights</p>
               <h2 id="tech-title">🚀 Key Technical Features</h2>
            </div>
            <div className="highlights-grid">
               <HighlightCard icon={<Send size={24}/>} title="Real-Time Connectivity" desc="Socket.io integration for instant chat and live status badges." />
               <HighlightCard icon={<Download size={24}/>} title="Dynamic Updates" desc="OTA (Over-the-Air) app update system directly within the app." />
               <HighlightCard icon={<Star size={24}/>} title="Premium UI" desc="Clean, modern aesthetics using a teal-based professional color palette." />
               <HighlightCard icon={<Bell size={24}/>} title="Push Notifications" desc="Integrated FCM (Firebase Cloud Messaging) for all roles." />
            </div>
          </div>
        </section>


        {/* LICENSE REQUEST SECTION */}
        <section className="license-request" id="queries" aria-labelledby="license-title">
          <div className="container">
            <div className="license-grid">
              <div className="license-info reveal">
                <p className="section-tag">GET STARTED</p>
                <h2 id="license-title" className="license-title">Request a License <br />Key for Your School</h2>
                <p className="license-desc">SchoolSync is invite-only to ensure quality support. Submit a request and our team will issue your school's license key within 24 hours — unlocking the ability to register your organisation and onboard your staff.</p>
                
                <div className="license-steps">
                  <div className="step-item">
                    <div className="step-num">1</div>
                    <div className="step-content">
                      <h4>Submit this form</h4>
                      <p>Tell us about your school — name, size, and contact details.</p>
                    </div>
                  </div>
                  <div className="step-item">
                    <div className="step-num">2</div>
                    <div className="step-content">
                      <h4>Receive your license key</h4>
                      <p>We'll email a unique license key tied to your school within 24 hours.</p>
                    </div>
                  </div>
                  <div className="step-item">
                    <div className="step-num">3</div>
                    <div className="step-content">
                      <h4>Register your organisation</h4>
                      <p>Use the key during admin registration in the SchoolSync app to activate your school.</p>
                    </div>
                  </div>
                  <div className="step-item">
                    <div className="step-num">4</div>
                    <div className="step-content">
                      <h4>Onboard your team</h4>
                      <p>Add teachers, create classrooms, and invite students — you're live.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="license-form-card reveal">
                <h3>License Key Request</h3>
                <p>Fill in your school details and we'll send your activation key by email.</p>
                <div className="license-disclaimer">
                  <strong>Note:</strong> Request for license key is only for School Administrators. Students and Teachers are not eligible to request license keys.
                </div>
                
                <form className="license-form" onSubmit={handleLicenseSubmit}>
                  <div className="form-row">
                    <div className="form-field">
                      <label htmlFor="fullName">Full Name <span>*</span></label>
                      <input 
                        type="text" 
                        id="fullName" 
                        placeholder="John Doe" 
                        required 
                        value={formData.fullName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="workEmail">Work Email <span>*</span></label>
                      <input 
                        type="email" 
                        id="workEmail" 
                        placeholder="principal@school.edu" 
                        required 
                        value={formData.workEmail}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-field">
                      <label htmlFor="phoneNumber">Phone Number <span>*</span></label>
                      <input 
                        type="tel" 
                        id="phoneNumber" 
                        placeholder="+91 98765 43210" 
                        required 
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="role">Your Role <span>*</span></label>
                      <select id="role" required value={formData.role} onChange={handleInputChange}>
                        <option value="" disabled>Select your role</option>
                        <option value="Principal / Head">Principal / Head</option>
                        <option value="School Administrator">School Administrator</option>
                        <option value="Senior Teacher">Senior Teacher</option>
                        <option value="Trust / Management">Trust / Management</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-field">
                    <label htmlFor="schoolName">School Name <span>*</span></label>
                    <input 
                      type="text" 
                      id="schoolName" 
                      placeholder="Greenwood High School" 
                      required 
                      value={formData.schoolName}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-field">
                      <label htmlFor="cityTown">City / Town <span>*</span></label>
                      <input 
                        type="text" 
                        id="cityTown" 
                        placeholder="Bengaluru" 
                        required 
                        value={formData.cityTown}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="studentCount">Approx. Student Count <span>*</span></label>
                      <select id="studentCount" required value={formData.studentCount} onChange={handleInputChange}>
                        <option value="" disabled>Select range</option>
                        <option value="0-200">0-200</option>
                        <option value="200-500">200-500</option>
                        <option value="500-1000">500-1000</option>
                        <option value="1000+">1000+</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-field">
                    <label htmlFor="additionalNotes">Additional Notes</label>
                    <textarea 
                      id="additionalNotes" 
                      placeholder="Tell us about your school's needs, current systems, or any special requirements..."
                      value={formData.additionalNotes}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                  
                  <p className="form-footer-text">
                    Your details are used only to process this license request and will never be shared.
                  </p>
                  
                  <button type="submit" className="btn-submit" disabled={isSubmitting}>
                    <Send size={18} />
                    {isSubmitting ? 'Sending...' : 'Send Request'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>



        {/* FOOTER */}
        <footer>
          <div className="container">
            <div className="footer-inner">
              <div className="footer-brand">
                <svg width="20" height="20" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                  <rect x="2" y="2" width="24" height="24" rx="7" fill="currentColor" opacity="0.15"/>
                  <path d="M7 10.5L14 7L21 10.5V17.5L14 21L7 17.5V10.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                  <circle cx="14" cy="14" r="2" fill="currentColor"/>
                </svg>
                SchoolSync — School Management System
              </div>
              <p className="footer-copy">Powered by SchoolSync · All Rights Reserved</p>
            </div>
          </div>
        </footer>
      </main>

    </div>
  );
}

function FeatureBox({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="feature-box reveal">
      <h4>{title}</h4>
      <p>{desc}</p>
    </div>
  );
}

function HighlightCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="highlight-card reveal">
      <div className="highlight-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}



export default App;
