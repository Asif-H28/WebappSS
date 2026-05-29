import { useState } from 'react';
import toast from 'react-hot-toast';
import { 
  useGetTicketsQuery, 
  useUpdateTicketStatusMutation 
} from '../../store/apiSlice.ts';
import { 
  RefreshCw, 
  History, 
  CheckCircle,
  X,
  Edit2
} from 'lucide-react';

const Tickets = () => {
  const { data: tickets, isLoading, isFetching, refetch } = useGetTicketsQuery();
  const [updateStatus] = useUpdateTicketStatusMutation();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  const [status, setStatus] = useState('');

  const handleEditClick = (ticket: any) => {
    setSelectedTicket(ticket);
    setStatus(ticket.status || 'Open');
    setIsEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    const loadingToast = toast.loading('Updating ticket...');
    try {
      await updateStatus({ ticketId: selectedTicket._id, status, orgId: selectedTicket.orgId }).unwrap();
      toast.success('Ticket updated successfully!', { id: loadingToast });
      setIsEditOpen(false);
    } catch (err: any) {
      toast.error(err.data?.message || 'Update failed.', { id: loadingToast });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Resolved':
        return <span className="badge badge-latest"><span className="badge-dot"></span>Resolved</span>;
      case 'In Progress':
        return <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}><span className="badge-dot" style={{ background: '#f59e0b' }}></span>In Progress</span>;
      default:
        return <span className="badge badge-old" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}><span className="badge-dot" style={{ background: '#ef4444' }}></span>Open</span>;
    }
  };

  const stats = {
    total: tickets?.length || 0,
    open: tickets?.filter((t: any) => t.status === 'Open').length || 0,
    resolved: tickets?.filter((t: any) => t.status === 'Resolved').length || 0
  };

  return (
    <>
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Total Tickets</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-sub">Across all organizations</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Open Tickets</div>
          <div className="stat-value" style={{ color: 'var(--color-accent)' }}>{stats.open}</div>
          <div className="stat-sub">Needs attention</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Resolved</div>
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{stats.resolved}</div>
          <div className="stat-sub">Issues solved</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">Support Tickets</div>
            <div className="panel-sub">Manage and resolve user support requests</div>
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
              <p>Loading tickets...</p>
            </div>
          ) : !tickets || tickets.length === 0 ? (
            <div className="empty-state">
              <History size={48} className="empty-icon" />
              <h3>No tickets found</h3>
              <p>Support tickets will appear here.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>User / Org</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket: any) => (
                  <tr 
                    key={ticket._id} 
                    onClick={() => handleEditClick(ticket)}
                    style={{ cursor: 'pointer' }}
                    className="clickable-row"
                  >
                    <td>
                      <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{ticket.ticketId}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, fontSize: '13px' }}>{ticket.email || ticket.userId}</span>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Org: {ticket.orgId}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', display: 'block', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ticket.description}
                      </span>
                    </td>
                    <td>{getStatusBadge(ticket.status)}</td>
                    <td>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {formatDate(ticket.createdAt)}
                      </span>
                    </td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); handleEditClick(ticket); }}>
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

      {isEditOpen && selectedTicket && (
        <>
          <div className="drawer-overlay" onClick={() => setIsEditOpen(false)} />
          <div className={`drawer ${isEditOpen ? 'open' : ''}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 className="panel-title">Manage Ticket {selectedTicket.ticketId}</h2>
              <button onClick={() => setIsEditOpen(false)}><X size={20} /></button>
            </div>

            <div style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--color-surface-offset)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', fontSize: '13px' }}>
                <div><strong>User:</strong> {selectedTicket.email || selectedTicket.userId}</div>
                <div><strong>Phone:</strong> {selectedTicket.phoneNumber || '—'}</div>
                <div><strong>Org ID:</strong> {selectedTicket.orgId}</div>
              </div>
              <div style={{ marginTop: '1rem', fontSize: '13px', borderTop: '1px solid var(--color-divider)', paddingTop: '0.75rem' }}>
                <div style={{ color: 'var(--color-text-faint)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>Description</div>
                <div style={{ lineHeight: '1.6' }}>{selectedTicket.description}</div>
              </div>

              {selectedTicket.images && selectedTicket.images.length > 0 && (
                <div style={{ marginTop: '1rem', borderTop: '1px solid var(--color-divider)', paddingTop: '0.75rem' }}>
                  <div style={{ color: 'var(--color-text-faint)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>Attachments</div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {selectedTicket.images.map((img: string, idx: number) => (
                      <a key={idx} href={img} target="_blank" rel="noreferrer">
                        <img src={img} alt={`Attachment ${idx}`} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: '1rem', fontSize: '11px', color: 'var(--color-text-faint)', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-divider)', paddingTop: '0.75rem' }}>
                <span>Created: {formatDate(selectedTicket.createdAt)}</span>
                {selectedTicket.resolvedAt && <span>Resolved: {formatDate(selectedTicket.resolvedAt)}</span>}
              </div>
            </div>
            
            <form onSubmit={handleUpdate} className="auth-form">
              <div className="form-group">
                <label className="form-label">Ticket Status</label>
                <div className="input-wrapper">
                  <CheckCircle size={18} className="input-icon" />
                  <select 
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    style={{ width: '100%', paddingLeft: '3rem' }}
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
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

export default Tickets;
