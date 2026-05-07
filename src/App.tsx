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
  Home, 
  Bell, 
  User, 
  CheckCircle, 
  FileText, 
  Lock, 
  Layers, 
  Smartphone,
  Play
} from 'lucide-react';

function App() {
  const theme = useAppSelector((state: RootState) => state.theme.mode);
  const dispatch = useAppDispatch();
  const { data: versions } = useGetAppVersionsQuery();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const latestVersion = Array.isArray(versions) ? versions[0] : null;

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

  const openModal = () => {
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = '';
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
              <a href="#queries">Queries</a>
              <a href="#download">Download</a>
            </div>
            <div className="nav-actions">
              <button 
                className="theme-toggle" 
                onClick={() => dispatch(toggleTheme())}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <a href="#download" className="btn btn-ghost nav-download">Download App</a>
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
        <a href="#queries" onClick={closeMobileMenu}>Queries</a>
        <a href="#download" onClick={closeMobileMenu}>Download</a>
        <a href="#download" className="btn btn-primary" onClick={closeMobileMenu}>
          <Download size={16} strokeWidth={2.5} />
          Download Now
        </a>
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
                <button className="btn btn-primary btn-hero" onClick={openModal}>
                  <Download size={18} strokeWidth={2.5} />
                  Get the App
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

        {/* MODULES GRID */}
        <section className="modules" aria-labelledby="modules-title">
          <div className="container">
            <div className="section-header reveal">
              <p className="section-tag">11 Powerful Modules</p>
              <h2 id="modules-title">Built for every corner of school life</h2>
              <p>From enrolment to exam results, every workflow is covered — securely and efficiently.</p>
            </div>
            <div className="modules-grid">
              <ModuleCard 
                icon={<Home size={20} />} 
                title="Organisation & Admin" 
                description="Create school organisations, manage profiles, run academic year rollups, and bulk promote students." 
              />
              <ModuleCard 
                icon={<Users size={20} />} 
                title="Teacher Management" 
                description="Teacher registration, join-request workflows, admin verification, and classroom ownership." 
              />
              <ModuleCard 
                icon={<User size={20} />} 
                title="Student Module" 
                description="Student enrolment, class browsing, join requests, and individual attendance & result views." 
              />
              <ModuleCard 
                icon={<Layers size={20} />} 
                title="Classroom & Academics" 
                description="Manage classrooms, subjects, lesson plans, completion tracking, and weekly timetables." 
              />
              <ModuleCard 
                icon={<CheckCircle size={20} />} 
                title="Join Requests" 
                description="Real-time pending request queues, automated approval engine, and full history for auditing." 
              />
              <ModuleCard 
                icon={<Calendar size={20} />} 
                title="Attendance & Leave" 
                description="Digital registers, attendance trends, leave applications with teacher review and FCM notifications." 
              />
              <ModuleCard 
                icon={<Bell size={20} />} 
                title="Notices & Notes" 
                description="Org-wide announcements, classroom notices with Cloudinary attachments, and teacher remarks." 
              />
              <ModuleCard 
                icon={<FileText size={20} />} 
                title="Examinations & Results" 
                description="CA templates, mark entry, feedback recording, and aggregated performance report generation." 
              />
              <ModuleCard 
                icon={<Bell size={20} />} 
                title="Push Notifications" 
                description="FCM-powered real-time alerts for join requests, leave status, and notices. Persistent in-app history." 
              />
              <ModuleCard 
                icon={<Lock size={20} />} 
                title="Security & Auth" 
                description="JWT sessions, Bcrypt password hashing, license gating (Standard/Active/Expired), and rate limiting." 
              />
              <ModuleCard 
                icon={<Smartphone size={20} />} 
                title="Multi-Tenant Architecture" 
                description="Strict data isolation — every user only sees data belonging to their own organisation. Fully scalable." 
              />
            </div>
          </div>
        </section>

        {/* ROLES */}
        <section className="roles" id="roles" aria-labelledby="roles-title">
          <div className="container">
            <div className="section-header reveal">
              <p className="section-tag">Three User Roles</p>
              <h2 id="roles-title">Built for everyone in your school</h2>
              <p>Each role gets a purpose-built experience tailored to their daily tasks.</p>
            </div>
            <div className="roles-grid">
              <RoleCard 
                icon="🏫" 
                iconBg="var(--color-primary-highlight)"
                title="Admin"
                description="Full control over your school's digital infrastructure — from setup to year-end rollup."
                list={[
                  "Create & manage the school organisation",
                  "Approve teachers & manage staff",
                  "Publish org-wide notices",
                  "Generate & manage license keys",
                  "View school-wide metrics & stats"
                ]}
              />
              <RoleCard 
                icon="👩‍🏫" 
                iconBg="#1a2a1a"
                title="Teacher"
                description="Manage classrooms, lessons, and student progress — all from the app."
                list={[
                  "Take & edit daily attendance",
                  "Manage subjects & lesson plans",
                  "Review & approve leave requests",
                  "Post classroom notices",
                  "Enter exam marks & feedback"
                ]}
              />
              <RoleCard 
                icon="🎒" 
                iconBg="#1a1a2a"
                title="Student"
                description="Stay on top of classes, attendance, leave, and exam results in one place."
                list={[
                  "Browse & join classes",
                  "View personal attendance record",
                  "Apply for leave with reasons",
                  "View exam results & reports",
                  "Receive real-time notifications"
                ]}
              />
            </div>
          </div>
        </section>

        <section className="download" id="download" aria-labelledby="download-title">
          <div className="container">
            <div className="download-card reveal">
              <div className="version-badge">
                <Play size={12} fill="currentColor" />
                Flutter App · {latestVersion ? `v${latestVersion.version}` : 'v1.0'}
              </div>
              <h2 id="download-title">Download SchoolSync Today</h2>
              <p>Get the full School Management System on your Android device — secure, fast, and ready to use.</p>
              <div className="download-buttons">
                <button 
                  className="download-btn primary" 
                  onClick={() => {
                    if (latestVersion?.downloadUrl) {
                      window.location.href = latestVersion.downloadUrl;
                    } else {
                      alert('APK link coming soon!');
                    }
                  }}
                >
                  <Smartphone size={24} />
                  <div className="download-btn-label">
                    <span>Download for</span>
                    <span>Android APK</span>
                  </div>
                </button>
                <button className="download-btn" onClick={openModal}>
                  <Layers size={22} />
                  <div className="download-btn-label">
                    <span>More options</span>
                    <span>All Versions</span>
                  </div>
                </button>
              </div>
              <p className="download-note">Secure Download · Android 6.0+ required · Organisation ID required</p>
            </div>
          </div>
        </section>

        {/* QUERY FORM */}
        <section className="queries" id="queries" aria-labelledby="queries-title">
          <div className="container">
            <div className="section-header reveal">
              <p className="section-tag">Have Questions?</p>
              <h2 id="queries-title">Send us a Query</h2>
              <p>Our team will get back to you within 24 hours to help you set up your school.</p>
            </div>
            <div className="query-card reveal">
              <form className="query-form" onSubmit={(e) => { e.preventDefault(); alert('Query sent successfully!'); }}>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input type="text" id="name" placeholder="John Doe" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Work Email</label>
                    <input type="email" id="email" placeholder="john@school.edu" required />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="school">School Name</label>
                  <input type="text" id="school" placeholder="Greenwood High School" required />
                </div>
                <div className="form-group">
                  <label htmlFor="message">How can we help?</label>
                  <textarea id="message" rows={4} placeholder="Tell us about your school's needs..." required></textarea>
                </div>
                <button type="submit" className="btn btn-primary btn-form">
                  Submit Request
                </button>
              </form>
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

      {/* DOWNLOAD MODAL */}
      {isModalOpen && (
        <div className={`modal-overlay ${isModalOpen ? 'open' : ''}`} role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <button className="modal-close" onClick={closeModal} aria-label="Close modal">×</button>
            <h3 id="modal-title">Download SchoolSync</h3>
            <p>Choose your preferred download option:</p>
            <div className="modal-options">
              <button 
                className="modal-option" 
                onClick={() => {
                  if (latestVersion?.downloadUrl) {
                    window.location.href = latestVersion.downloadUrl;
                  } else {
                    alert('APK download starting...');
                  }
                }}
              >
                <div className="modal-option-icon" aria-hidden="true">📱</div>
                <div className="modal-option-text">
                  <h4>Android APK</h4>
                  <p>Direct APK download for Android 6.0 and above. Enable "Install from unknown sources" in settings.</p>
                </div>
              </button>
              <button className="modal-option" onClick={() => alert('Coming soon on Play Store!')}>
                <div className="modal-option-icon" aria-hidden="true">🏪</div>
                <div className="modal-option-text">
                  <h4>Google Play Store</h4>
                  <p>Coming soon — one-tap install with auto-updates via Play Store.</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ModuleCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <article className="module-card reveal">
      <div className="module-card-icon" aria-hidden="true">
        {icon}
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}

function RoleCard({ icon, iconBg, title, description, list }: { icon: string, iconBg: string, title: string, description: string, list: string[] }) {
  return (
    <div className="role-card reveal">
      <div className="role-icon" style={{ background: iconBg }} aria-hidden="true">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      <ul className="role-list">
        {list.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}



export default App;
