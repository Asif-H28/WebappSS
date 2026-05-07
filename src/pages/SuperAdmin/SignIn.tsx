import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSuperAdminSignInMutation } from '../../store/apiSlice.ts';
import { useAppDispatch } from '../../store/hooks.ts';
import { setCredentials } from '../../store/authSlice.ts';
import { Lock, Mail, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signIn, { isLoading, error }] = useSuperAdminSignInMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await signIn({ email, password }).unwrap();
      dispatch(setCredentials({ token: result.token, user: result.admin }));
      navigate('/whitehouse/dashboard');
    } catch (err) {
      console.error('Failed to sign in:', err);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">
            <ShieldCheck size={32} />
          </div>
          <h1>Whitehouse Access</h1>
          <p>Super Admin Authentication Portal</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="auth-error">
              Invalid credentials. Please try again.
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email">Administrative Email</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                id="email"
                placeholder="admin@schoolsync.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Security Key</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-auth" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Authorizing...
              </>
            ) : (
              <>
                Initialize Session
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/whitehouse/signup">Create administrative record</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
