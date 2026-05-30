import React, { useState } from 'react';
import { ArrowLeft, User, Phone, Mail, GraduationCap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  useGetAdmissionByIdQuery,
  useUpdateAdmissionStatusMutation,
  useAddAdmissionNoteMutation,
} from '../../store/apiSlice.ts';
import styles from './Admission.module.css';

interface EnquiryDetailProps {
  enquiryId: string;
  onBack: () => void;
}

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

const EnquiryDetail: React.FC<EnquiryDetailProps> = ({ enquiryId, onBack }) => {
  const { data: response, isLoading, isError } = useGetAdmissionByIdQuery(enquiryId);
  const [updateStatus, { isLoading: isUpdating }] = useUpdateAdmissionStatusMutation();
  const [addNote, { isLoading: isAddingNote }] = useAddAdmissionNoteMutation();

  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [generalNote, setGeneralNote] = useState('');

  const enquiry = response?.enquiry;

  if (isLoading) return <div style={{ padding: '2rem' }}>Loading details...</div>;
  if (isError || !enquiry) return <div style={{ padding: '2rem' }}>Error loading enquiry details.</div>;

  const handleUpdateStatus = async () => {
    if (!newStatus) {
      toast.error('Please select a status to update');
      return;
    }
    try {
      await updateStatus({
        id: enquiryId,
        payload: { status: newStatus, note: statusNote },
      }).unwrap();
      toast.success('Status updated successfully');
      setNewStatus('');
      setStatusNote('');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update status');
    }
  };

  const handleAddNote = async () => {
    if (!generalNote.trim()) {
      toast.error('Please enter a note');
      return;
    }
    try {
      await addNote({ id: enquiryId, note: generalNote }).unwrap();
      toast.success('Note added successfully');
      setGeneralNote('');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to add note');
    }
  };

  return (
    <div>
      <div className={styles.detailHeader}>
        <button onClick={onBack} className={styles.backBtn} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <ArrowLeft size={20} /> Back
        </button>
        <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>
          {enquiry.student?.fullName}
        </h2>
        <span className={`${styles.badge} ${getBadgeClass(enquiry.status)}`}>
          {enquiry.status.replace('_', ' ')}
        </span>
      </div>

      <div className={styles.infoCardsGrid}>
        <div className={styles.infoCard}>
          <h3><User size={18} /> Student Details</h3>
          <ul className={styles.infoList}>
            <li><span className={styles.infoLabel}>DOB</span> <span className={styles.infoValue}>{new Date(enquiry.student?.dateOfBirth).toLocaleDateString()}</span></li>
            <li><span className={styles.infoLabel}>Gender</span> <span className={styles.infoValue}>{enquiry.student?.gender}</span></li>
            <li><span className={styles.infoLabel}>Class Applied For</span> <span className={styles.infoValue}>{enquiry.academic?.classAppliedFor}</span></li>
            <li><span className={styles.infoLabel}>Academic Year</span> <span className={styles.infoValue}>{enquiry.academic?.academicYear}</span></li>
          </ul>
        </div>
        
        <div className={styles.infoCard}>
          <h3><Phone size={18} /> Guardian Details</h3>
          <ul className={styles.infoList}>
            <li><span className={styles.infoLabel}>Name</span> <span className={styles.infoValue}>{enquiry.guardian?.name} ({enquiry.guardian?.relationship})</span></li>
            <li><span className={styles.infoLabel}>Phone</span> <span className={styles.infoValue}>{enquiry.guardian?.phone || enquiry.guardian?.phoneNumber}</span></li>
            <li><span className={styles.infoLabel}>Email</span> <span className={styles.infoValue}>{enquiry.guardian?.email || 'N/A'}</span></li>
            <li><span className={styles.infoLabel}>Enquiry Source</span> <span className={styles.infoValue} style={{ textTransform: 'capitalize' }}>{enquiry.metadata?.source || enquiry.source}</span></li>
          </ul>
        </div>
      </div>

      <div className={styles.actionPanel}>
        <div className={styles.panelBox}>
          <h3 style={{ marginTop: 0 }}>Update Status</h3>
          <div className={styles.inputGroup} style={{ marginBottom: '1rem' }}>
            <label>New Status</label>
            <select 
              className={styles.statusSelect} 
              value={newStatus} 
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="">-- Select Status --</option>
              <option value="pending">Pending</option>
              <option value="follow_up">Follow Up</option>
              <option value="documents_submitted">Documents Submitted</option>
              <option value="enrolled">Enrolled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className={styles.inputGroup} style={{ marginBottom: '1rem' }}>
            <label>Optional Note</label>
            <textarea 
              className={styles.inputField} 
              rows={3} 
              placeholder="Reason for change..."
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
            />
          </div>
          <button 
            className={styles.newEnquiryBtn} 
            onClick={handleUpdateStatus} 
            disabled={isUpdating}
          >
            {isUpdating ? 'Updating...' : 'Update Status'}
          </button>

          <h3 style={{ marginTop: '2rem' }}>Status History</h3>
          <div className={styles.timeline}>
            {enquiry.statusHistory?.map((historyItem: any, index: number) => (
              <div key={index} className={styles.timelineItem}>
                <div className={styles.timelineDot} />
                <div className={styles.timelineContent}>
                  <div className={styles.timelineHeader}>
                    <span className={`${styles.badge} ${getBadgeClass(historyItem.newStatus)}`}>
                      {historyItem.newStatus?.replace('_', ' ')}
                    </span>
                    <span className={styles.timelineDate}>
                      {new Date(historyItem.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {historyItem.note && <div style={{ marginTop: '0.5rem', color: 'var(--color-text)' }}>{historyItem.note}</div>}
                  {historyItem.changedByName && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)', marginTop: '0.25rem' }}>By: {historyItem.changedByName}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.panelBox}>
          <h3 style={{ marginTop: 0 }}>Follow-up Notes</h3>
          <div className={styles.inputGroup} style={{ marginBottom: '1rem' }}>
            <textarea 
              className={styles.inputField} 
              rows={4} 
              placeholder="Add a new follow up note..."
              value={generalNote}
              onChange={(e) => setGeneralNote(e.target.value)}
            />
          </div>
          <button 
            className={styles.newEnquiryBtn} 
            style={{ marginBottom: '2rem' }} 
            onClick={handleAddNote}
            disabled={isAddingNote}
          >
            {isAddingNote ? 'Adding...' : 'Add Note'}
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {enquiry.followUpNotes?.map((note: any, index: number) => (
              <div key={index} style={{ padding: '1rem', backgroundColor: 'var(--color-bg)', borderRadius: '0.5rem', border: '1px solid var(--color-border)' }}>
                <div style={{ color: 'var(--color-text)' }}>{note.note}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-faint)', marginTop: '0.5rem' }}>
                  <span>{new Date(note.timestamp || note.createdAt).toLocaleString()}</span>
                  <span>{note.addedByName || note.createdBy?.name || 'System'}</span>
                </div>
              </div>
            ))}
            {(!enquiry.followUpNotes || enquiry.followUpNotes.length === 0) && (
              <div style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem 0' }}>No follow-up notes yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnquiryDetail;
