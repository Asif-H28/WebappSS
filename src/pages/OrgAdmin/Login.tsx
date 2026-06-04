import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck, GraduationCap } from 'lucide-react';
import {
  useWebDashboardLoginMutation,
  useForgotPasswordRequestOTPMutation,
  useVerifyOTPMutation,
  useResetPasswordMutation,
} from '../../store/apiSlice';
import './Login.css';

type Step = 'login' | 'requestOtp' | 'verifyOtp' | 'resetPassword';

const OrgAdminLogin = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [resetToken, setResetToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [webDashboardLogin, { isLoading: isLoginLoading }] = useWebDashboardLoginMutation();
  const [requestOTP, { isLoading: isRequestLoading }] = useForgotPasswordRequestOTPMutation();
  const [verifyOTP, { isLoading: isVerifyLoading }] = useVerifyOTPMutation();
  const [resetPassword, { isLoading: isResetLoading }] = useResetPasswordMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const loginRes = await webDashboardLogin({ email, password }).unwrap();
      if (loginRes.success || loginRes.token) {
        localStorage.setItem('webToken', loginRes.token);
        localStorage.setItem('webUser', JSON.stringify(loginRes.user));
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        toast.error(loginRes.message || 'Invalid credentials');
      }
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMsg = err?.data?.message || err?.data?.error || err?.message || 'Invalid credentials';
      toast.error(errorMsg);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await requestOTP({ email }).unwrap();
      toast.success('OTP sent to your email');
      setStep('verifyOtp');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await verifyOTP({ email, otp }).unwrap();
      toast.success(response.message || 'OTP verified');
      setResetToken(response.resetToken);
      setStep('resetPassword');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Invalid OTP');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    try {
      await resetPassword({ email, resetToken, newPassword }).unwrap();
      toast.success('Password reset successfully! Please login.');
      setStep('login');
      setPassword('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to reset password');
    }
  };

  return (
    <div className="login-page">
      <section className="login-sidebar">
        <div className="login-brand">
          <div className="login-brand-logo">
            <div className="login-logo-icon">
              <GraduationCap size={28} />
            </div>
            <h1>SchoolSync</h1>
          </div>
          <p>Manage your school smarter</p>
        </div>
        <div className="login-illustration">
           <img src="/login-illustration.png" alt="School Management System Illustration" className="illustration-image" />
        </div>
      </section>

      <section className="login-content">
        <div className="login-form-wrapper">
          <div className="login-mobile-brand">
            <div className="login-mobile-logo-icon">
              <GraduationCap size={24} />
            </div>
            <h1>SchoolSync</h1>
          </div>

          <div className="login-card">
            
            {step === 'login' && (
              <>
                <div className="login-header">
                  <h2>Sign in to SchoolSync</h2>
                  <p>Enter your credentials to access the admin dashboard</p>
                </div>
                <form onSubmit={handleLogin} className="login-form">
                  <div className="form-group">
                    <label>Email Address</label>
                    <div className="input-icon-wrapper">
                      <Mail className="input-icon" size={20} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="login-input"
                        placeholder="admin@school.edu"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <div className="input-icon-wrapper">
                      <Lock className="input-icon" size={20} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="login-input"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="password-toggle"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep('requestOtp')}
                      className="forgot-password-link"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoginLoading}
                    className="btn-primary"
                  >
                    {isLoginLoading ? 'Signing in...' : 'Sign In'}
                    {!isLoginLoading && <ArrowRight size={18} />}
                  </button>
                </form>
              </>
            )}

            {step === 'requestOtp' && (
              <>
                <div className="login-header">
                  <h2>Reset Password</h2>
                  <p>Enter your email and we'll send you an OTP to reset your password.</p>
                </div>
                <form onSubmit={handleRequestOtp} className="login-form">
                  <div className="form-group">
                    <label>Email Address</label>
                    <div className="input-icon-wrapper">
                      <Mail className="input-icon" size={20} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="login-input"
                        placeholder="admin@school.edu"
                      />
                    </div>
                  </div>
                  <div className="btn-group">
                    <button
                      type="button"
                      onClick={() => setStep('login')}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isRequestLoading}
                      className="btn-primary flex-1"
                    >
                      {isRequestLoading ? 'Sending...' : 'Send OTP'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {step === 'verifyOtp' && (
              <>
                <div className="login-header">
                  <h2>Enter OTP</h2>
                  <p>We've sent a 4-digit code to <strong>{email}</strong>.</p>
                </div>
                <form onSubmit={handleVerifyOtp} className="login-form">
                  <div className="form-group">
                    <label>One-Time Password</label>
                    <div className="input-icon-wrapper">
                      <input
                        type="text"
                        required
                        maxLength={4}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        className="login-input otp-input"
                        placeholder="1234"
                      />
                    </div>
                  </div>
                  <div className="btn-group">
                    <button
                      type="button"
                      onClick={() => setStep('requestOtp')}
                      className="btn-secondary"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isVerifyLoading || otp.length < 4}
                      className="btn-primary flex-1"
                    >
                      {isVerifyLoading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {step === 'resetPassword' && (
              <>
                <div className="login-header">
                  <h2>Create New Password</h2>
                  <p>Please enter a new, secure password for your account.</p>
                </div>
                <form onSubmit={handleResetPassword} className="login-form">
                  <div className="form-group">
                    <label>New Password</label>
                    <div className="input-icon-wrapper">
                      <Lock className="input-icon" size={20} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="login-input"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="password-toggle"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <div className="input-icon-wrapper">
                      <Lock className="input-icon" size={20} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="login-input"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isResetLoading}
                    className="btn-primary"
                  >
                    {isResetLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </>
            )}

            <div className="secure-portal-badge">
              <ShieldCheck size={16} />
              <span>Secure Administrator Portal</span>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default OrgAdminLogin;
