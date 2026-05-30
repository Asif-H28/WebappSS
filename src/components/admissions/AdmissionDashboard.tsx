import React, { useState } from 'react';
import { Users, UserCheck, UserX, Clock, Search, Plus, Trash2, Eye, Inbox, Percent, Calendar, History } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  useGetAdmissionStatsQuery,
  useGetAdmissionsQuery,
  useDeleteAdmissionMutation,
} from '../../store/apiSlice.ts';
import NewEnquiryModal from './NewEnquiryModal.tsx';
import EnquiryDetail from './EnquiryDetail.tsx';
import styles from './Admission.module.css';

interface AdmissionDashboardProps {
  onBreadcrumbChange?: (breadcrumbs: { title: string }[]) => void;
}

const AdmissionDashboard: React.FC<AdmissionDashboardProps> = ({ onBreadcrumbChange }) => {
  const [statusFilter, setStatusFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string | null>(null);

  const { data: statsData, isLoading: isLoadingStats } = useGetAdmissionStatsQuery();
  const { data: admissionsData, isLoading: isLoadingAdmissions, refetch: refetchAdmissions } = useGetAdmissionsQuery({
    status: statusFilter,
    search: searchQuery,
  });
  const [deleteAdmission] = useDeleteAdmissionMutation();

  const stats = statsData?.stats || { 
    totalEnquiries: 0, 
    statusCounts: { pending: 0, follow_up: 0, documents_submitted: 0, enrolled: 0, rejected: 0 },
    conversionRate: 0,
    trends: { thisMonth: 0, lastMonth: 0 }
  };
  const admissions = admissionsData?.enquiries || [];

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this enquiry?')) {
      try {
        await deleteAdmission(id).unwrap();
        toast.success('Enquiry deleted successfully');
      } catch (err: any) {
        toast.error(err?.data?.message || 'Failed to delete enquiry');
      }
    }
  };

  const getBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return styles.badgePending;
      case 'follow_up': return styles.badgeFollowUp;
      case 'documents_submitted': return styles.badgeDocs;
      case 'enrolled': return styles.badgeEnrolled;
      case 'rejected': return styles.badgeRejected;
      default: return styles.badgePending;
    }
  };

  React.useEffect(() => {
    if (onBreadcrumbChange) {
      if (selectedEnquiryId) {
        onBreadcrumbChange([
          { title: 'Home' },
          { title: 'Dashboard' },
          { title: 'Admissions' },
          { title: 'View Enquiry' }
        ]);
      } else {
        onBreadcrumbChange([
          { title: 'Home' },
          { title: 'Dashboard' },
          { title: 'Admissions' }
        ]);
      }
    }
  }, [selectedEnquiryId, onBreadcrumbChange]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  if (selectedEnquiryId) {
    return (
      <div className={styles.dashboard}>
        <EnquiryDetail enquiryId={selectedEnquiryId} onBack={() => setSelectedEnquiryId(null)} />
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiInfo}>
            <h3>Total</h3>
            <p>{isLoadingStats ? '...' : stats.totalEnquiries}</p>
          </div>
          <div className={`${styles.kpiIcon} ${styles.iconTotal}`}>
            <Users size={20} />
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiInfo}>
            <h3>Pending</h3>
            <p>{isLoadingStats ? '...' : stats.statusCounts.pending}</p>
          </div>
          <div className={`${styles.kpiIcon} ${styles.iconPending}`}>
            <Clock size={20} />
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiInfo}>
            <h3>This Month</h3>
            <p>{isLoadingStats ? '...' : stats.trends.thisMonth}</p>
          </div>
          <div className={`${styles.kpiIcon} ${styles.iconThisMonth}`}>
            <Calendar size={20} />
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiInfo}>
            <h3>Last Month</h3>
            <p>{isLoadingStats ? '...' : stats.trends.lastMonth}</p>
          </div>
          <div className={`${styles.kpiIcon} ${styles.iconLastMonth}`}>
            <History size={20} />
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiInfo}>
            <h3>Enrolled</h3>
            <p>{isLoadingStats ? '...' : stats.statusCounts.enrolled}</p>
          </div>
          <div className={`${styles.kpiIcon} ${styles.iconEnrolled}`}>
            <UserCheck size={20} />
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiInfo}>
            <h3>Rejected</h3>
            <p>{isLoadingStats ? '...' : stats.statusCounts.rejected}</p>
          </div>
          <div className={`${styles.kpiIcon} ${styles.iconRejected}`}>
            <UserX size={20} />
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiInfo}>
            <h3>Conversion</h3>
            <p>{isLoadingStats ? '...' : `${stats.conversionRate}%`}</p>
          </div>
          <div className={`${styles.kpiIcon} ${styles.iconConversion}`}>
            <Percent size={20} />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className={styles.tableContainer}>
        <div className={styles.filterBar}>
          <div className={styles.filterGroup}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '500px' }}>
              <Search size={18} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--color-text-faint)' }} />
              <input
                type="text"
                placeholder="Search by name or phone..."
                className={styles.searchInput}
                style={{ paddingLeft: '2.25rem', maxWidth: '100%', width: '100%' }}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <select
              className={styles.statusSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="follow_up">Follow Up</option>
              <option value="documents_submitted">Documents Submitted</option>
              <option value="enrolled">Enrolled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <button className={styles.newEnquiryBtn} onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> New Enquiry
          </button>
        </div>

        {isLoadingAdmissions ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading enquiries...</div>
        ) : admissions.length === 0 ? (
          <div className={styles.emptyState}>
            <Inbox size={48} opacity={0.5} />
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text)' }}>No enquiries yet</h3>
              <p style={{ margin: 0 }}>Click 'New Enquiry' to get started.</p>
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Guardian</th>
                  <th>Phone</th>
                  <th>Class</th>
                  <th>Source</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admissions.map((enquiry: any) => (
                  <tr key={enquiry._id}>
                    <td style={{ fontWeight: 500 }}>{enquiry.student?.fullName}</td>
                    <td>{enquiry.guardian?.name}</td>
                    <td>{enquiry.guardian?.phone || enquiry.guardian?.phoneNumber}</td>
                    <td>{enquiry.academic?.classAppliedFor}</td>
                    <td style={{ textTransform: 'capitalize' }}>{enquiry.metadata?.source || enquiry.source || 'N/A'}</td>
                    <td>{new Date(enquiry.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`${styles.badge} ${getBadgeClass(enquiry.status)}`}>
                        {enquiry.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <button className={styles.actionBtn} onClick={() => setSelectedEnquiryId(enquiry._id)}>
                        <Eye size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}/> View
                      </button>
                      <button className={`${styles.actionBtn} ${styles.actionBtnDelete}`} onClick={() => handleDelete(enquiry._id)}>
                        <Trash2 size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}/> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <NewEnquiryModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => refetchAdmissions()}
        />
      )}
    </div>
  );
};

export default AdmissionDashboard;
