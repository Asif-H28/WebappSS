
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  // Typically we would use RTK or context to pull user data
  // But for now, we just have a placeholder dummy dashboard
  
  return (
    <div style={{ padding: '2rem', fontFamily: 'var(--font-body)', backgroundColor: 'var(--color-bg)', minHeight: '100vh', color: 'var(--color-text)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', margin: 0, fontSize: '2rem' }}>Unified Dashboard</h1>
        <button 
          onClick={() => navigate('/')} 
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: 'var(--color-surface-2)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Sign Out
        </button>
      </header>
      <main>
        <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--color-border)' }}>
          <h2>Welcome!</h2>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
            You have successfully logged in. This is a dummy dashboard placeholder.
            Waiting for further instructions on what to display here.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
