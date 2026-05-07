import { useState } from 'react';
import toast from 'react-hot-toast';
import { 
  useGetAppVersionsQuery, 
  useCreateAppVersionMutation, 
  useUpdateAppVersionMutation, 
  useDeleteAppVersionMutation 
} from '../../store/apiSlice.ts';
import { 
  Plus, 
  RefreshCw, 
  Edit2, 
  Trash2, 
  History, 
  Calendar,
  Link as LinkIcon,
  FileText,
  AlertCircle,
  X
} from 'lucide-react';

const Dashboard = () => {
  const { data: versions, isLoading, isFetching, refetch } = useGetAppVersionsQuery();
  const [createAppVersion] = useCreateAppVersionMutation();
  const [deleteVersion] = useDeleteAppVersionMutation();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    version: '',
    downloadUrl: '',
    deployedDate: new Date().toISOString().split('T')[0],
    notes: '',
    pin: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading('Publishing version...');
    try {
      await createAppVersion(formData).unwrap();
      toast.success('Version updated successfully!', { id: loadingToast });
      resetForm();
    } catch (err: any) {
      toast.error(err.data?.message || 'Operation failed. Check PIN.', { id: loadingToast });
    }
  };

  const resetForm = () => {
    setFormData({
      version: '',
      downloadUrl: '',
      deployedDate: new Date().toISOString().split('T')[0],
      notes: '',
      pin: ''
    });
    setIsFormOpen(false);
  };

  const handleEdit = (v: any) => {
    setFormData({
      version: v.version,
      downloadUrl: v.downloadUrl,
      deployedDate: v.deployedDate.split('T')[0],
      notes: v.notes || '',
      pin: '' // Require re-entry for security
    });
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (deletingId) {
      const loadingToast = toast.loading('Deleting version...');
      try {
        await deleteVersion(deletingId).unwrap();
        toast.success('Version deleted successfully!', { id: loadingToast });
        setDeletingId(null);
      } catch (err: any) {
        toast.error(err.data?.message || 'Delete failed.', { id: loadingToast });
      }
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const currentVersion = Array.isArray(versions) ? versions[0] : null;

  return (
    <>
      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">System State</div>
          <div className="stat-value">{currentVersion ? 'Active' : 'Empty'}</div>
          <div className="stat-sub">{currentVersion ? 'Version data live' : 'No record found'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Current Live</div>
          <div className="stat-value" style={{ fontSize: '1.25rem', fontFamily: 'monospace' }}>
            {currentVersion ? `v${currentVersion.version}` : 'None'}
          </div>
          <div className="stat-sub">{currentVersion ? `Deployed ${formatDate(currentVersion.deployedDate)}` : 'No version set'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Security Mode</div>
          <div className="stat-value" style={{ fontSize: '1rem', color: 'var(--color-primary)' }}>
            Gated + PIN
          </div>
          <div className="stat-sub">Verification active</div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">APK Release Management (Singleton)</div>
            <div className="panel-sub">Manage the unique application version record</div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setIsFormOpen(true)}>
              {currentVersion ? <Edit2 size={14} /> : <Plus size={14} />}
              {currentVersion ? 'Update Version' : 'New Version'}
            </button>
          </div>
        </div>

        <div className="table-wrap">
          {isLoading ? (
            <div className="empty-state">
              <RefreshCw size={32} className="animate-spin" style={{ color: 'var(--color-text-faint)' }} />
              <p>Loading records...</p>
            </div>
          ) : !currentVersion ? (
            <div className="empty-state">
              <History size={48} className="empty-icon" />
              <h3>No release found</h3>
              <p>Start by publishing your first APK version to the system.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Version</th>
                  <th>Deployed</th>
                  <th>Download URL</th>
                  <th className="hide-mobile">Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr key={currentVersion._id}>
                  <td>
                    <span className="badge badge-latest">
                      <span className="badge-dot"></span>
                      Active
                    </span>
                  </td>
                  <td>
                    <span className="version-tag">v{currentVersion.version}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {formatDate(currentVersion.deployedDate)}
                    </span>
                  </td>
                  <td className="td-url">
                    <a href={currentVersion.downloadUrl} target="_blank" rel="noreferrer">
                      {currentVersion.downloadUrl}
                    </a>
                  </td>
                  <td className="hide-mobile">
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)' }}>
                      {currentVersion.notes || '—'}
                    </span>
                  </td>
                  <td>
                    <div className="td-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(currentVersion)}>
                        <Edit2 size={13} />
                      </button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-error)' }} onClick={() => setDeletingId(currentVersion._id)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Form Drawer */}
      {isFormOpen && (
        <>
          <div className="drawer-overlay" onClick={resetForm} />
          <div className={`drawer ${isFormOpen ? 'open' : ''}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 className="panel-title">{currentVersion ? 'Update Version' : 'Publish New Version'}</h2>
              <button onClick={resetForm}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="auth-form">
              {/* Security PIN Field */}
              <div className="form-group" style={{ padding: 'var(--space-3)', background: 'var(--color-surface-offset)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-4)' }}>
                <label className="form-label" style={{ color: 'var(--color-primary)' }}>Security PIN *</label>
                <div className="input-wrapper">
                  <Plus size={18} className="input-icon" style={{ color: 'var(--color-primary)' }} />
                  <input 
                    type="password" 
                    placeholder="Enter 6-digit PIN" 
                    value={formData.pin}
                    onChange={e => setFormData({...formData, pin: e.target.value})}
                    required 
                    style={{ borderColor: 'var(--color-primary)' }}
                  />
                </div>
                <p style={{ fontSize: '10px', color: 'var(--color-text-faint)', marginTop: '4px' }}>Required for any state modification</p>
              </div>

              <div className="form-group">
                <label className="form-label">Version Number *</label>
                <div className="input-wrapper">
                  <History size={18} className="input-icon" />
                  <input 
                    type="text" 
                    placeholder="e.g. 1.0.4" 
                    value={formData.version}
                    onChange={e => setFormData({...formData, version: e.target.value})}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Deployed Date *</label>
                <div className="input-wrapper">
                  <Calendar size={18} className="input-icon" />
                  <input 
                    type="date" 
                    value={formData.deployedDate}
                    onChange={e => setFormData({...formData, deployedDate: e.target.value})}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Download URL *</label>
                <div className="input-wrapper">
                  <LinkIcon size={18} className="input-icon" />
                  <input 
                    type="url" 
                    placeholder="https://github.com/..." 
                    value={formData.downloadUrl}
                    onChange={e => setFormData({...formData, downloadUrl: e.target.value})}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Release Notes</label>
                <div className="input-wrapper" style={{ alignItems: 'flex-start' }}>
                  <FileText size={18} className="input-icon" style={{ marginTop: '0.75rem' }} />
                  <textarea 
                    placeholder="Describe changes..."
                    style={{ minHeight: '120px', paddingTop: '0.75rem' }}
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-auth" style={{ background: currentVersion ? 'var(--color-accent)' : 'var(--color-primary)' }}>
                {currentVersion ? 'Apply Updates' : 'Deploy Version'}
              </button>
            </form>
          </div>
        </>
      )}

      {/* Delete Confirmation */}
      {deletingId && (
        <>
          <div className="modal-overlay" onClick={() => setDeletingId(null)} />
          <div className="modal">
            <div style={{ color: 'var(--color-error)', marginBottom: '1rem' }}><AlertCircle size={48} /></div>
            <h3>Delete version record?</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: '1rem 0' }}>
              This action will permanently remove this version entry from the database.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setDeletingId(null)}>Cancel</button>
              <button className="btn btn-primary btn-sm" style={{ background: 'var(--color-error)' }} onClick={handleDelete}>Delete Permanently</button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Dashboard;
