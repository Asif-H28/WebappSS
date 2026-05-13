import { useState } from 'react';
import toast from 'react-hot-toast';
import { 
  useGetGlobalConfigsQuery, 
  useUpdateGlobalConfigMutation,
  useGetOrganizationsQuery
} from '../../store/apiSlice.ts';
import { 
  Settings,
  Save,
  RefreshCw,
  Info,
  Shield,
  FileText,
  X,
  Plus,
  Building,
  Search,
  ChevronDown
} from 'lucide-react';
import { useEffect, useRef } from 'react';

const PREDEFINED_KEYS = [
  { key: 'QUIZ_LIMIT_PER_LESSON', description: 'Maximum quizzes allowed per lesson in a subject' },
  { key: 'MAINTENANCE_MODE', description: 'Enable/Disable system maintenance mode (true/false)' },
  { key: 'ALLOW_TEACHER_REGISTRATION', description: 'Control if new teachers can register (true/false)' },
  { key: 'MAX_ATTACHMENT_SIZE_MB', description: 'Maximum size for file uploads in MB' },
];

const GlobalConfig = () => {
  const { data: configs, isLoading, isFetching, refetch } = useGetGlobalConfigsQuery();
  const { data: organizations } = useGetOrganizationsQuery();
  const [updateConfig] = useUpdateGlobalConfigMutation();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<any>(null);
  const [isCustomKey, setIsCustomKey] = useState(false);

  const [formData, setFormData] = useState({
    key: '',
    value: '',
    description: '',
    orgId: '',
    pin: ''
  });

  const [orgSearch, setOrgSearch] = useState('');
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOrgDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOrgs = organizations?.filter((org: any) => 
    org.orgId.toLowerCase().includes(orgSearch.toLowerCase()) || 
    (org.schoolName || org.name || '').toLowerCase().includes(orgSearch.toLowerCase())
  ) || [];

  const selectedOrgLabel = formData.orgId === 'GLOBAL' 
    ? 'Global Default (All Schools)' 
    : formData.orgId 
      ? organizations?.find((org: any) => org.orgId === formData.orgId)?.schoolName || formData.orgId
      : 'Select Scope';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading('Updating configuration...');
    try {
      const submissionData = {
        ...formData,
        orgId: formData.orgId === 'GLOBAL' ? null : formData.orgId,
        value: isNaN(Number(formData.value)) ? formData.value : Number(formData.value)
      };

      await updateConfig(submissionData).unwrap();
      toast.success('Configuration updated successfully!', { id: loadingToast });
      resetForm();
    } catch (err: any) {
      toast.error(err.data?.message || 'Operation failed. Check PIN.', { id: loadingToast });
    }
  };

  const resetForm = () => {
    setFormData({
      key: '',
      value: '',
      description: '',
      orgId: '',
      pin: ''
    });
    setSelectedConfig(null);
    setIsFormOpen(false);
    setIsCustomKey(false);
  };

  const handleEdit = (config: any) => {
    setSelectedConfig(config);
    setFormData({
      key: config.key,
      value: config.value.toString(),
      description: config.description || '',
      orgId: config.orgId || 'GLOBAL',
      pin: ''
    });
    setIsFormOpen(true);
  };

  const handleKeyChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const val = e.target.value;
    if (val === 'CUSTOM') {
      setIsCustomKey(true);
      setFormData({ ...formData, key: '', description: '' });
    } else {
      setIsCustomKey(false);
      const predefined = PREDEFINED_KEYS.find(k => k.key === val);
      setFormData({ 
        ...formData, 
        key: val, 
        description: predefined?.description || formData.description 
      });
    }
  };

  return (
    <>
      {/* Header Info */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Active Settings</div>
          <div className="stat-value">{Array.isArray(configs) ? configs.length : 0}</div>
          <div className="stat-sub">Across all scopes</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Schools</div>
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>
            {organizations?.length || 0}
          </div>
          <div className="stat-sub">Eligible for overrides</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Control Mode</div>
          <div className="stat-value" style={{ fontSize: '1rem', color: 'var(--color-primary)' }}>
            Super Admin Only
          </div>
          <div className="stat-sub">Gated by Secure PIN</div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">Organisation & System Settings</div>
            <div className="panel-sub">Control global limits and school-specific overrides</div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setIsFormOpen(true)}>
              <Plus size={14} />
              Add Setting
            </button>
          </div>
        </div>

        <div className="table-wrap">
          {isLoading ? (
            <div className="empty-state">
              <RefreshCw size={32} className="animate-spin" style={{ color: 'var(--color-text-faint)' }} />
              <p>Fetching configurations...</p>
            </div>
          ) : !Array.isArray(configs) || configs.length === 0 ? (
            <div className="empty-state">
              <Settings size={48} className="empty-icon" />
              <h3>No configurations found</h3>
              <p>Global system settings will appear here once defined.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Configuration Key</th>
                  <th>Value</th>
                  <th>Scope</th>
                  <th className="hide-mobile">Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {configs.map((config: any) => (
                  <tr key={config._id || `${config.key}-${config.orgId}`}>
                    <td>
                      <span className="version-tag" style={{ background: 'var(--color-surface-offset)', color: 'var(--color-primary)', fontWeight: '600' }}>
                        {config.key}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{config.value}</span>
                    </td>
                    <td>
                      {config.orgId ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', fontSize: '10px' }}>
                            <Building size={10} />
                            {config.orgId}
                          </span>
                        </div>
                      ) : (
                        <span className="badge badge-latest" style={{ fontSize: '10px' }}>Global Default</span>
                      )}
                    </td>
                    <td className="hide-mobile">
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {config.description || '—'}
                      </span>
                    </td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(config)}>
                          <Settings size={13} />
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

      {/* Form Drawer */}
      {isFormOpen && (
        <>
          <div className="drawer-overlay" onClick={resetForm} />
          <div className={`drawer ${isFormOpen ? 'open' : ''}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 className="panel-title">{selectedConfig ? 'Edit Setting' : 'New Global Setting'}</h2>
              <button onClick={resetForm}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="dashboard-form">
              {/* Security PIN Field */}
              <div className="form-group" style={{ padding: 'var(--space-4)', background: 'var(--color-surface-offset)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-2)' }}>
                <label className="form-label">Security PIN *</label>
                <div className="input-wrapper">
                  <Shield size={18} className="input-icon" />
                  <input 
                    type="password" 
                    placeholder="Enter 6-digit PIN" 
                    value={formData.pin}
                    onChange={e => setFormData({...formData, pin: e.target.value})}
                    required 
                  />
                </div>
                <p style={{ fontSize: '10px', color: 'var(--color-text-faint)', marginTop: '6px' }}>Verification required to update global state</p>
              </div>

              <div className="form-group" ref={dropdownRef}>
                <label className="form-label">Scope / Organization *</label>
                <div className="searchable-select">
                  <Building size={18} className="input-icon" style={{ left: '14px', zIndex: 1 }} />
                  <button 
                    type="button"
                    className="search-dropdown-btn" 
                    onClick={() => !selectedConfig && setIsOrgDropdownOpen(!isOrgDropdownOpen)}
                    disabled={!!selectedConfig}
                  >
                    <span>{selectedOrgLabel}</span>
                    <ChevronDown size={16} style={{ transition: 'transform 0.2s', transform: isOrgDropdownOpen ? 'rotate(180deg)' : 'none' }} />
                  </button>

                  {isOrgDropdownOpen && (
                    <div className="search-dropdown-menu">
                      <div className="search-input-wrapper">
                        <Search size={14} className="search-icon" />
                        <input 
                          type="text" 
                          placeholder="Search school name or ID..." 
                          value={orgSearch}
                          onChange={e => setOrgSearch(e.target.value)}
                          autoFocus
                        />
                      </div>
                      <div className="search-options-list">
                        <div 
                          className={`search-option ${formData.orgId === 'GLOBAL' ? 'selected' : ''}`}
                          onClick={() => {
                            setFormData({ ...formData, orgId: 'GLOBAL' });
                            setIsOrgDropdownOpen(false);
                            setOrgSearch('');
                          }}
                        >
                          <span className="option-title">Global Default</span>
                          <span className="option-sub">Applies to all schools without specific limits</span>
                        </div>
                        
                        {filteredOrgs.length > 0 ? (
                          filteredOrgs.map((org: any) => (
                            <div 
                              key={org.orgId} 
                              className={`search-option ${formData.orgId === org.orgId ? 'selected' : ''}`}
                              onClick={() => {
                                setFormData({ ...formData, orgId: org.orgId });
                                setIsOrgDropdownOpen(false);
                                setOrgSearch('');
                              }}
                            >
                              <span className="option-title">{org.schoolName || org.name || 'Unnamed School'}</span>
                              <span className="option-sub">ID: {org.orgId}</span>
                            </div>
                          ))
                        ) : (
                          <div className="search-no-results">No organizations found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Config Key *</label>
                <div className="input-wrapper">
                  <Settings size={18} className="input-icon" />
                  {selectedConfig ? (
                    <input type="text" value={formData.key} disabled required />
                  ) : (
                    <select 
                      value={isCustomKey ? 'CUSTOM' : formData.key} 
                      onChange={handleKeyChange}
                      required
                    >
                      <option value="" disabled>Select a key</option>
                      {PREDEFINED_KEYS.map(k => (
                        <option key={k.key} value={k.key}>{k.key}</option>
                      ))}
                      <option value="CUSTOM">Custom Key...</option>
                    </select>
                  )}
                </div>
              </div>

              {isCustomKey && !selectedConfig && (
                <div className="form-group" style={{ marginTop: '-0.75rem' }}>
                  <div className="input-wrapper">
                    <Plus size={16} className="input-icon" />
                    <input 
                      type="text" 
                      placeholder="ENTER_CUSTOM_KEY" 
                      value={formData.key}
                      onChange={e => setFormData({...formData, key: e.target.value.toUpperCase().replace(/\s+/g, '_')})}
                      required 
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Config Value *</label>
                <div className="input-wrapper">
                  <Info size={18} className="input-icon" />
                  <input 
                    type="text" 
                    placeholder="e.g. 5" 
                    value={formData.value}
                    onChange={e => setFormData({...formData, value: e.target.value})}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <div className="input-wrapper">
                  <FileText size={18} className="input-icon" style={{ top: '14px' }} />
                  <textarea 
                    placeholder="Purpose of this setting..."
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-auth">
                <Save size={18} />
                Save Configuration
              </button>
            </form>
          </div>
        </>
      )}
    </>
  );
};

export default GlobalConfig;
