import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, Lock, User, ShieldCheck } from 'lucide-react';
import {
  useRegisterSupportStaffMutation,
  useWebDashboardLoginMutation
} from '../../store/apiSlice.ts';
import './Signup.css';

const SupportStaffSignup: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  
  const [registerSupportStaff, { isLoading: isRegistering }] = useRegisterSupportStaffMutation();
  const [webDashboardLogin, { isLoading: isLoggingIn }] = useWebDashboardLoginMutation();

  useEffect(() => {
    if (!token || !emailParam) {
      toast.error('Invalid or missing invitation token.');
    }
  }, [token, emailParam]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token || !emailParam) {
      toast.error('Invalid invitation link. Cannot register.');
      return;
    }

    try {
      // 1. Register Account
      await registerSupportStaff({ 
        token, 
        email: emailParam, 
        name, 
        password 
      }).unwrap();
      
      toast.success('Account created successfully!');

      // 2. Perform Login Immediately
      const loginRes = await webDashboardLogin({ 
        email: emailParam, 
        password 
      }).unwrap();
      
      if (loginRes.success) {
        localStorage.setItem('webToken', loginRes.token);
        localStorage.setItem('webUser', JSON.stringify(loginRes.user));
        toast.success('Logged in successfully!');
        navigate('/dashboard');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to complete registration.');
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-content">
        <div className="signup-form-wrapper">
          <div className="signup-card">
            <div className="signup-header">
              <ShieldCheck size={48} color="var(--color-primary)" style={{ margin: '0 auto 1rem auto' }} />
              <h2>Support Staff Setup</h2>
              <p>Create your account to join the organization support team</p>
            </div>

            <form className="signup-form" onSubmit={handleSignup}>
              
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-icon-wrapper">
                  <Mail className="input-icon" size={20} />
                  <input
                    id="email"
                    type="email"
                    className="signup-input"
                    value={emailParam || ''}
                    disabled
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <div className="input-icon-wrapper">
                  <User className="input-icon" size={20} />
                  <input
                    id="name"
                    type="text"
                    className="signup-input"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-icon-wrapper">
                  <Lock className="input-icon" size={20} />
                  <input
                    id="password"
                    type="password"
                    className="signup-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                disabled={isRegistering || isLoggingIn || !token || !emailParam}
              >
                {isRegistering ? 'Creating Account...' : isLoggingIn ? 'Logging in...' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportStaffSignup;
