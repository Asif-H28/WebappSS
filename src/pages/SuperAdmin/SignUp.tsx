import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSuperAdminSignUpMutation } from '../../store/apiSlice.ts';
import { useAppDispatch } from '../../store/hooks.ts';
import { setCredentials } from '../../store/authSlice.ts';
import { User, Mail, Lock, ShieldPlus, Loader2, ArrowRight } from 'lucide-react';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [signUp, { isLoading, error }] = useSuperAdminSignUpMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await signUp(formData).unwrap();
      dispatch(setCredentials({ token: result.token, user: result.admin }));
      navigate('/whitehouse/dashboard');
    } catch (err) {
      console.error('Failed to sign up:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">
            <ShieldPlus size={32} />
          </div>
          <h1>Establish Authority</h1>
          <p>Create a new Super Admin account</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="auth-error">
              Failed to create account. Email might already be in use.
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                type="text"
                id="name"
                placeholder="Admin Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Administrative Email</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                id="email"
                placeholder="admin@schoolsync.com"
                value={formData.email}
                onChange={handleChange}
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
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-auth" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/whitehouse">Access portal</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
