import { useState } from 'react';
import toast from 'react-hot-toast';
import { 
  useGetLicenseRequestsQuery, 
  useUpdateLicenseRequestMutation,
  useGetOrganizationQuery,
  useToggleOrganizationStatusMutation
} from '../../store/apiSlice.ts';
import { 
  RefreshCw, 
  Edit2, 
  History, 
  Calendar,
  X,
  CheckCircle,
  Clock,
  ShieldCheck,
  Building,
  User,
  Shield,
  ExternalLink,
  Loader2
} from 'lucide-react';

const OrganizationDetails = ({ orgId }: { orgId: string }) => {
  const { data: org, isLoading, isError } = useGetOrganizationQuery(orgId);
  const [toggleStatus, { isLoading: isUpdating }] = useToggleOrganizationStatusMutation();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!org) return;
    try {
      await toggleStatus({ orgId, isActive: !org.isActive }).unwrap();
      toast.success(`Organization ${!org.isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (err: any) {
      toast.error(err.data?.message || 'Status update failed');
    }
  };

  if (isLoading) return <div className="org-loader"><Loader2 className="animate-spin" /> Loading Organization...</div>;
  if (isError || !org) return null;

  return (
    <div className="org-card">
      <div className="org-card-header" onClick={() => setIsExpanded(!isExpanded)} style={{ cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Building size={16} />
          <h4>Linked Organization</h4>
        </div>
        <button className="btn-icon">
          {isExpanded ? <X size={14} /> : <ExternalLink size={14} />}
        </button>
      </div>
      
      <div className="org-card-body">
        <div className="org-info-row">
          <span className="label">Org ID</span>
          <span className="value" style={{ fontFamily: 'monospace' }}>{org.orgId}</span>
        </div>
        
        <div className="org-info-row">
          <span className="label">Access Status</span>
          <div className="status-toggle">
            <span className={`status-text ${org.isActive ? 'active' : 'inactive'}`}>
              {org.isActive ? 'Active' : 'Inactive'}
            </span>
            <button 
              className={`toggle-switch ${org.isActive ? 'on' : 'off'} ${isUpdating ? 'loading' : ''}`}
              onClick={handleToggle}
              disabled={isUpdating}
            >
              <div className="toggle-handle" />
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="org-expanded-content">
            <div className="org-detail-grid">
              <div className="detail-item">
                <span className="detail-label">Admin Name</span>
                <span className="detail-value">{org.name || '—'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Admin Email</span>
                <span className="detail-value">{org.adminEmail || '—'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">License Key</span>
                <span className="detail-value" style={{ color: 'var(--color-primary)', fontWeight: 700, letterSpacing: '1px' }}>
                  {org.licenseKey || '—'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Staff Count</span>
                <span className="detail-value">{org.teachers} Teachers / {org.nonTeaching} Non-Teaching</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Location</span>
                <span className="detail-value">
                  {[org.city, org.state, org.country].filter(Boolean).join(', ') || 'Not set'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phone</span>
                <span className="detail-value">{org.phone || '—'}</span>
              </div>
            </div>
            
            <div className="org-timestamps">
              <span>Created: {new Date(org.createdAt).toLocaleDateString()}</span>
              <span>Updated: {new Date(org.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        )}

        {!isExpanded && (
          <button 
            className="btn btn-ghost btn-sm" 
            style={{ width: '100%', marginTop: '0.5rem', fontSize: '11px' }}
            onClick={() => setIsExpanded(true)}
          >
            View Full Organization Profile
          </button>
        )}
      </div>
    </div>
  );
};

const Licenses = () => {
  const { data: requests, isLoading, isFetching, refetch } = useGetLicenseRequestsQuery();
  const [updateRequest] = useUpdateLicenseRequestMutation();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const [formData, setFormData] = useState({
    status: '',
    requestReviewed: false,
    isActive: false,
    expiryDate: ''
  });

  const handleEditClick = (req: any) => {
    setSelectedRequest(req);
    setFormData({
      status: req.status || 'pending',
      requestReviewed: req.requestReviewed || false,
      isActive: req.isActive || false,
      expiryDate: req.expiryDate ? new Date(req.expiryDate).toISOString().split('T')[0] : ''
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    const loadingToast = toast.loading('Updating request...');
    try {
      await updateRequest({ id: selectedRequest._id, ...formData }).unwrap();
      toast.success('License request updated successfully!', { id: loadingToast });
      setIsEditOpen(false);
    } catch (err: any) {
      toast.error(err.data?.message || 'Update failed.', { id: loadingToast });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="badge badge-latest"><span className="badge-dot"></span>Completed</span>;
      case 'rejected':
        return <span className="badge badge-old" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}><span className="badge-dot" style={{ background: '#ef4444' }}></span>Rejected</span>;
      default:
        return <span className="badge badge-old"><span className="badge-dot"></span>Pending</span>;
    }
  };

  const stats = {
    total: requests?.length || 0,
    pending: requests?.filter(r => r.status === 'pending').length || 0,
    active: requests?.filter(r => r.isActive).length || 0
  };

  return (
    <>
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Total Requests</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-sub">Across all organizations</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Review</div>
          <div className="stat-value" style={{ color: 'var(--color-accent)' }}>{stats.pending}</div>
          <div className="stat-sub">Needs attention</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Licenses</div>
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{stats.active}</div>
          <div className="stat-sub">System-wide active</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">License Management</div>
            <div className="panel-sub">Review and activate school license requests</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        <div className="table-wrap">
          {isLoading ? (
            <div className="empty-state">
              <RefreshCw size={32} className="animate-spin" style={{ color: 'var(--color-text-faint)' }} />
              <p>Loading requests...</p>
            </div>
          ) : !requests || requests.length === 0 ? (
            <div className="empty-state">
              <History size={48} className="empty-icon" />
              <h3>No requests found</h3>
              <p>License requests from the landing page will appear here.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>School & Contact</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Activity</th>
                  <th>Request Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr 
                    key={req._id} 
                    onClick={() => handleEditClick(req)}
                    style={{ cursor: 'pointer' }}
                    className="clickable-row"
                  >
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>{req.schoolName}</span>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{req.fullName} · {req.workEmail} · {req.phoneNumber}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px' }}>{req.role}</span>
                    </td>
                    <td>{getStatusBadge(req.status)}</td>
                    <td>
                      {req.isActive ? (
                        <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                          <ShieldCheck size={10} style={{ marginRight: '4px' }} /> Active
                        </span>
                      ) : (
                        <span className="badge" style={{ background: 'var(--color-surface-offset)', color: 'var(--color-text-faint)' }}>
                          Inactive
                        </span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {formatDate(req.createdAt)}
                      </span>
                    </td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => handleEditClick(req)}>
                          <Edit2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isEditOpen && (
        <>
          <div className="drawer-overlay" onClick={() => setIsEditOpen(false)} />
          <div className={`drawer ${isEditOpen ? 'open' : ''}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 className="panel-title">Manage License Request</h2>
              <button onClick={() => setIsEditOpen(false)}><X size={20} /></button>
            </div>

            {selectedRequest && (
              <div style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--color-surface-offset)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <Building size={16} color="var(--color-primary)" />
                  <span style={{ fontWeight: 700 }}>{selectedRequest.schoolName}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', fontSize: '13px' }}>
                  <User size={16} color="var(--color-text-muted)" />
                  <span>{selectedRequest.fullName} ({selectedRequest.role})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', fontSize: '13px' }}>
                  <Shield size={16} color="var(--color-text-muted)" />
                  <span>{selectedRequest.phoneNumber}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem', fontSize: '13px' }}>
                  <div>
                    <div style={{ color: 'var(--color-text-faint)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '2px' }}>City / Town</div>
                    <div style={{ fontWeight: 500 }}>{selectedRequest.cityTown || '—'}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--color-text-faint)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '2px' }}>Student Count</div>
                    <div style={{ fontWeight: 500 }}>{selectedRequest.studentCount || '—'}</div>
                  </div>
                </div>
                <div style={{ marginTop: '1rem', fontSize: '12px', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-divider)', paddingTop: '0.75rem' }}>
                   <div style={{ color: 'var(--color-text-faint)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>Additional Notes</div>
                   <div style={{ lineHeight: '1.6' }}>{selectedRequest.additionalNotes || 'No notes provided.'}</div>
                </div>
                <div style={{ marginTop: '1rem', fontSize: '11px', color: 'var(--color-text-faint)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Created: {formatDate(selectedRequest.createdAt)}</span>
                  {selectedRequest.expiryDate && <span>Expiry: {formatDate(selectedRequest.expiryDate)}</span>}
                </div>

                {/* ORGANIZATION DETAILS SECTION */}
                {selectedRequest.associatedOrgId && (
                  <div style={{ marginTop: '1.5rem', borderTop: '1px dashed var(--color-divider)', paddingTop: '1.5rem' }}>
                    <OrganizationDetails orgId={selectedRequest.associatedOrgId} />
                  </div>
                )}
              </div>
            )}
            
            <form onSubmit={handleUpdate} className="auth-form">
              <div className="form-group">
                <label className="form-label">Review Status</label>
                <div className="input-wrapper">
                  <CheckCircle size={18} className="input-icon" />
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    style={{ width: '100%', paddingLeft: '3rem' }}
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed / Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Expiry Date</label>
                <div className="input-wrapper">
                  <Calendar size={18} className="input-icon" />
                  <input 
                    type="date" 
                    value={formData.expiryDate}
                    onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={formData.requestReviewed}
                    onChange={e => setFormData({...formData, requestReviewed: e.target.checked})}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                  />
                  <span style={{ fontSize: '14px' }}>Mark as Reviewed</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={formData.isActive}
                    onChange={e => setFormData({...formData, isActive: e.target.checked})}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: 600, color: formData.isActive ? 'var(--color-primary)' : 'inherit' }}>
                    Activate License Key
                  </span>
                </label>
              </div>

              <button type="submit" className="btn btn-primary btn-auth" style={{ marginTop: '2rem' }}>
                Save Changes
              </button>
            </form>
          </div>
        </>
      )}
    </>
  );
};

export default Licenses;
