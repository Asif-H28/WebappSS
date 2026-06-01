import { useState } from 'react';
import toast from 'react-hot-toast';
import { 
  useGetOrganizationsQuery,
  useToggleOrganizationStatusMutation,
  useGetOrganizationStatsQuery
} from '../../store/apiSlice.ts';
import { 
  RefreshCw, 
  Building, 
  MapPin,
  Search,
  Eye,
  X,
  Users,
  BookOpen,
  Trophy,
  Loader2
} from 'lucide-react';

const OrganizationDrawer = ({ org, onClose }: { org: any, onClose: () => void }) => {
  const { data: stats, isLoading } = useGetOrganizationStatsQuery(org.orgId);
  const [toggleStatus, { isLoading: isUpdating }] = useToggleOrganizationStatusMutation();

  const handleToggleStatus = async () => {
    try {
      await toggleStatus({ orgId: org.orgId, isActive: !org.isActive }).unwrap();
      toast.success(`Organization ${!org.isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to update organization status');
    }
  };

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer open">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 className="panel-title">Organization Details</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--color-surface-offset)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Building size={16} color="var(--color-primary)" />
            <span style={{ fontWeight: 700 }}>{org.name || 'Unnamed Org'}</span>
            {!org.isActive && (
               <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', marginLeft: 'auto' }}>Inactive</span>
            )}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
            ID: <span style={{ fontFamily: 'monospace' }}>{org.orgId}</span>
          </div>
          <div style={{ fontSize: '13px', marginBottom: '0.5rem' }}>
            Admin: {org.adminEmail}
          </div>
          {org.phone && (
            <div style={{ fontSize: '13px', marginBottom: '0.5rem' }}>
              Phone: {org.phone}
            </div>
          )}
          <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Location: {[org.city, org.state].filter(Boolean).join(', ') || 'Not set'}
          </div>
          
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--color-divider)', paddingTop: '1.5rem' }}>
             <h3 style={{ fontSize: '14px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <Trophy size={14} color="var(--color-primary)" />
               Platform Usage Stats
             </h3>
             {isLoading ? (
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-faint)' }}>
                 <Loader2 size={16} className="animate-spin" /> Loading stats...
               </div>
             ) : (
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                 <div className="stat-card" style={{ padding: '0.75rem' }}>
                   <div style={{ fontSize: '11px', color: 'var(--color-text-faint)', textTransform: 'uppercase', marginBottom: '4px' }}>Teachers</div>
                   <div style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                     <Users size={14} color="var(--color-text-muted)" /> {stats?.totalTeachers || 0}
                   </div>
                 </div>
                 <div className="stat-card" style={{ padding: '0.75rem' }}>
                   <div style={{ fontSize: '11px', color: 'var(--color-text-faint)', textTransform: 'uppercase', marginBottom: '4px' }}>Students</div>
                   <div style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                     <Users size={14} color="var(--color-text-muted)" /> {stats?.totalStudents || 0}
                   </div>
                 </div>
                 <div className="stat-card" style={{ padding: '0.75rem' }}>
                   <div style={{ fontSize: '11px', color: 'var(--color-text-faint)', textTransform: 'uppercase', marginBottom: '4px' }}>Classrooms</div>
                   <div style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                     <BookOpen size={14} color="var(--color-text-muted)" /> {stats?.totalClassrooms || 0}
                   </div>
                 </div>
                 <div className="stat-card" style={{ padding: '0.75rem' }}>
                   <div style={{ fontSize: '11px', color: 'var(--color-text-faint)', textTransform: 'uppercase', marginBottom: '4px' }}>Achievements</div>
                   <div style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                     <Trophy size={14} color="var(--color-accent)" /> {stats?.totalAchievements || 0}
                   </div>
                 </div>
               </div>
             )}
          </div>
          
        </div>
      </div>
    </>
  );
};

const Organizations = () => {
  const { data: orgs, isLoading, isFetching, refetch } = useGetOrganizationsQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<any>(null);

  const filteredOrgs = orgs?.filter((org: any) => 
    org.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    org.orgId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.adminEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const stats = {
    total: orgs?.length || 0,
    active: orgs?.filter((o: any) => o.isActive).length || 0,
    inactive: orgs?.filter((o: any) => !o.isActive).length || 0
  };

  return (
    <>
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Total Organizations</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-sub">Registered platform wide</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active</div>
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{stats.active}</div>
          <div className="stat-sub">Currently operational</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Inactive</div>
          <div className="stat-value" style={{ color: 'var(--color-accent)' }}>{stats.inactive}</div>
          <div className="stat-sub">Suspended or pending</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="panel-title">Organizations Directory</div>
            <div className="panel-sub">Manage all registered schools and institutions</div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="search-bar" style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search organizations..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.5rem', paddingRight: '1rem', height: '36px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
              />
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        <div className="table-wrap">
          {isLoading ? (
            <div className="empty-state">
              <RefreshCw size={32} className="animate-spin" style={{ color: 'var(--color-text-faint)' }} />
              <p>Loading organizations...</p>
            </div>
          ) : filteredOrgs.length === 0 ? (
            <div className="empty-state">
              <Building size={48} className="empty-icon" />
              <h3>No organizations found</h3>
              <p>Try adjusting your search criteria.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Organization</th>
                  <th>Contact</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrgs.map((org: any) => (
                  <tr key={org.orgId} className="clickable-row" onClick={() => setSelectedOrg(org)} style={{ cursor: 'pointer' }}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Building size={14} color="var(--color-text-muted)"/> {org.name || 'Unnamed Org'}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-faint)', fontFamily: 'monospace' }}>ID: {org.orgId}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '13px' }}>{org.adminEmail}</span>
                        {org.phone && <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{org.phone}</span>}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} color="var(--color-text-muted)"/>
                        {[org.city, org.state].filter(Boolean).join(', ') || 'Not set'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-ghost btn-sm"
                        onClick={(e) => { e.stopPropagation(); setSelectedOrg(org); }}
                        style={{ fontSize: '11px', padding: '0.25rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                      >
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedOrg && (
        <OrganizationDrawer org={selectedOrg} onClose={() => setSelectedOrg(null)} />
      )}
    </>
  );
};

export default Organizations;
