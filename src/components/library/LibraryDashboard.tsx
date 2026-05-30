import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, BookOpen, Undo2 } from 'lucide-react';
import { Modal } from 'antd';
import { toast } from 'react-hot-toast';
import {
  useGetLibraryIssuesQuery,
  useReturnBookMutation,
  useDeleteLibraryIssueMutation,
} from '../../store/apiSlice.ts';
import IssueBookModal from './IssueBookModal.tsx';
import styles from './Library.module.css';

interface LibraryDashboardProps {
  onBreadcrumbChange?: (breadcrumbs: { title: string }[]) => void;
}

const LibraryDashboard: React.FC<LibraryDashboardProps> = ({ onBreadcrumbChange }) => {
  const [statusFilter, setStatusFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: issuesData, isLoading, refetch } = useGetLibraryIssuesQuery({
    status: statusFilter,
    search: searchQuery,
  });

  const [returnBook, { isLoading: isReturning }] = useReturnBookMutation();
  const [deleteIssue] = useDeleteLibraryIssueMutation();

  const issues = issuesData?.issuedBooks || issuesData?.issues || [];

  useEffect(() => {
    if (onBreadcrumbChange) {
      onBreadcrumbChange([
        { title: 'Home' },
        { title: 'Dashboard' },
        { title: 'Library' }
      ]);
    }
  }, [onBreadcrumbChange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleReturn = (id: string) => {
    Modal.confirm({
      title: 'Mark this book as returned?',
      content: 'This will update the issue record status to Returned.',
      okText: 'Yes, Return',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await returnBook(id).unwrap();
          toast.success('Book marked as returned successfully');
        } catch (err: any) {
          toast.error(err?.data?.message || 'Failed to return book');
        }
      }
    });
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this issue record?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteIssue(id).unwrap();
          toast.success('Issue record deleted successfully');
        } catch (err: any) {
          toast.error(err?.data?.message || 'Failed to delete record');
        }
      }
    });
  };

  const getBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'issued': return styles.badgeIssued;
      case 'returned': return styles.badgeReturned;
      case 'overdue': return styles.badgeOverdue;
      default: return styles.badgeIssued;
    }
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h2>Library Management</h2>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.filterBar}>
          <div className={styles.filterGroup}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '500px' }}>
              <Search size={18} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--color-text-faint)' }} />
              <input
                type="text"
                placeholder="Search by book or student name..."
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
              <option value="Issued">Issued</option>
              <option value="Returned">Returned</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
          <button className={styles.primaryBtn} onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Issue Book
          </button>
        </div>

        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading library records...</div>
        ) : issues.length === 0 ? (
          <div className={styles.emptyState}>
            <BookOpen size={48} opacity={0.5} />
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text)' }}>No books issued</h3>
              <p style={{ margin: 0 }}>Click 'Issue Book' to create a new record.</p>
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Book Details</th>
                  <th>Student Info</th>
                  <th>Class</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue: any) => (
                  <tr key={issue._id || issue.issueId}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{issue.bookName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{issue.author}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{issue.studentName || issue.student?.fullName || issue.student?.name}</div>
                    </td>
                    <td>{issue.className || (issue.class?.className + ' ' + (issue.class?.section || ''))}</td>
                    <td>{new Date(issue.issuedDate || issue.issueDate).toLocaleDateString()}</td>
                    <td>{new Date(issue.expectedReturnDate || issue.dueDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`${styles.badge} ${getBadgeClass(issue.status)}`}>
                        {issue.status}
                      </span>
                    </td>
                    <td>
                      {issue.status?.toLowerCase() !== 'returned' && (
                        <button 
                          className={`${styles.actionBtn} ${styles.actionBtnReturn}`} 
                          onClick={() => handleReturn(issue._id || issue.issueId)}
                          disabled={isReturning}
                        >
                          <Undo2 size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}/> Return
                        </button>
                      )}
                      <button className={`${styles.actionBtn} ${styles.actionBtnDelete}`} onClick={() => handleDelete(issue._id || issue.issueId)}>
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
        <IssueBookModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
};

export default LibraryDashboard;
