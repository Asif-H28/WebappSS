import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { 
  useGetFeatureFlagDefinitionsQuery,
  useCreateFeatureFlagDefinitionMutation,
  useToggleFeatureFlagForOrgMutation,
  useGetOrganizationsQuery
} from '../../store/apiSlice.ts';
import { Plus, X, List, ToggleLeft, Building, Server } from 'lucide-react';

const FeatureFlags = () => {
  const { data: featuresData, isLoading, refetch } = useGetFeatureFlagDefinitionsQuery();
  const { data: orgs } = useGetOrganizationsQuery();

  const features = Array.isArray(featuresData) ? featuresData : (featuresData?.data || featuresData?.features || featuresData?.featureFlags || []);
  
  const [createFeature] = useCreateFeatureFlagDefinitionMutation();
  const [toggleFeature] = useToggleFeatureFlagForOrgMutation();
  
  // Create state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  
  // Manage state
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [toggleState, setToggleState] = useState(true);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey || !newName) {
      toast.error('Key and Name are required');
      return;
    }
    const toastId = toast.loading('Creating feature...');
    try {
      await createFeature({ key: newKey, name: newName, description: newDesc }).unwrap();
      toast.success('Feature created successfully!', { id: toastId });
      setIsCreateOpen(false);
      setNewKey('');
      setNewName('');
      setNewDesc('');
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.error || 'Failed to create feature', { id: toastId });
    }
  };

  const handleToggle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrgId || !selectedFeature) {
      toast.error('Please select an organization');
      return;
    }
    const toastId = toast.loading('Updating feature flag...');
    try {
      await toggleFeature({ 
        orgId: selectedOrgId, 
        featureKey: selectedFeature.key, 
        isEnabled: toggleState 
      }).unwrap();
      toast.success(`Feature successfully ${toggleState ? 'enabled' : 'disabled'} for organization!`, { id: toastId });
      setIsManageOpen(false);
      setSelectedOrgId('');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.error || 'Failed to toggle feature', { id: toastId });
    }
  };

  const openManageDrawer = (feature: any) => {
    setSelectedFeature(feature);
    setSelectedOrgId('');
    setToggleState(true);
    setIsManageOpen(true);
  };

  return (
    <>
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Total Features Defined</div>
          <div className="stat-value">{features?.length || 0}</div>
          <div className="stat-sub">Across system</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Organizations</div>
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{orgs?.length || 0}</div>
          <div className="stat-sub">Available for targeting</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">Feature Flags</div>
            <div className="panel-sub">Define system features and toggle them per organization</div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => refetch()} disabled={isLoading}>
              Refresh
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setIsCreateOpen(true)}>
              <Plus size={14} />
              Define Feature
            </button>
          </div>
        </div>

        <div className="table-wrap">
          {isLoading ? (
            <div className="empty-state">
              <Server size={32} className="animate-spin" style={{ color: 'var(--color-text-faint)' }} />
              <p>Loading features...</p>
            </div>
          ) : !features || features.length === 0 ? (
            <div className="empty-state">
              <List size={48} className="empty-icon" />
              <h3>No features defined</h3>
              <p>Create a new feature definition to get started.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Feature Name</th>
                  <th>Key</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature: any) => (
                  <tr key={feature.key || feature._id}>
                    <td>
                      <span style={{ fontWeight: 600 }}>{feature.name}</span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', background: 'var(--color-surface-offset)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>
                        {feature.key}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                        {feature.description || '—'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => openManageDrawer(feature)}>
                        <ToggleLeft size={14} />
                        Manage Orgs
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* CREATE FEATURE DRAWER */}
      {isCreateOpen && (
        <>
          <div className="drawer-overlay" onClick={() => setIsCreateOpen(false)} />
          <div className="drawer open">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 className="panel-title">Define New Feature</h2>
              <button onClick={() => setIsCreateOpen(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleCreate} className="auth-form">
              <div className="form-group">
                <label className="form-label">Feature Key</label>
                <div className="input-wrapper">
                  <Server size={18} className="input-icon" />
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. TUITION_SESSION"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                    required
                  />
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-faint)', marginTop: '4px' }}>
                  A unique, uppercase string identifier (no spaces).
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Feature Name</label>
                <div className="input-wrapper">
                  <List size={18} className="input-icon" />
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Tuition Sessions Tracker"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-input" 
                  placeholder="Enables the QR-based tuition session system..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={3}
                  style={{ padding: '0.75rem', width: '100%', resize: 'vertical' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                Create Feature Definition
              </button>
            </form>
          </div>
        </>
      )}

      {/* MANAGE FEATURE FOR ORG DRAWER */}
      {isManageOpen && selectedFeature && (
        <>
          <div className="drawer-overlay" onClick={() => setIsManageOpen(false)} />
          <div className="drawer open">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 className="panel-title">Manage Feature Access</h2>
              <button onClick={() => setIsManageOpen(false)}><X size={20} /></button>
            </div>

            <div style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--color-surface-offset)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>{selectedFeature.name}</div>
              <div style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--color-primary)', marginBottom: '8px' }}>
                {selectedFeature.key}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                {selectedFeature.description}
              </div>
            </div>

            <form onSubmit={handleToggle} className="auth-form">
              <div className="form-group">
                <label className="form-label">Select Organization</label>
                <div className="input-wrapper">
                  <Building size={18} className="input-icon" />
                  <select 
                    className="form-input" 
                    value={selectedOrgId}
                    onChange={(e) => setSelectedOrgId(e.target.value)}
                    required
                    style={{ paddingLeft: '2.5rem' }}
                  >
                    <option value="">-- Choose an Organization --</option>
                    {orgs?.map((org: any) => (
                      <option key={org.orgId} value={org.orgId}>
                        {org.name} ({org.orgId})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Feature Status for this Org</label>
                <div className="input-wrapper">
                  <ToggleLeft size={18} className="input-icon" />
                  <select 
                    className="form-input" 
                    value={toggleState ? 'true' : 'false'}
                    onChange={(e) => setToggleState(e.target.value === 'true')}
                    style={{ paddingLeft: '2.5rem' }}
                  >
                    <option value="true">Enable Feature</option>
                    <option value="false">Disable Feature</option>
                  </select>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-faint)', marginTop: '4px' }}>
                  Warning: The feature's current status is not displayed here. This action will explicitly override its status to the selected value.
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                Apply Settings
              </button>
            </form>
          </div>
        </>
      )}
    </>
  );
};

export default FeatureFlags;
