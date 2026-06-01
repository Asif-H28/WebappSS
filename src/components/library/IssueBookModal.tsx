import React, { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  useGetClassroomListQuery,
  useGetStudentNamesByClassQuery,
  useIssueBookMutation
} from '../../store/apiSlice.ts';
import styles from './Library.module.css';

interface IssueBookModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const IssueBookModal: React.FC<IssueBookModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    bookName: '',
    author: '',
    classId: '',
    className: '',
    studentId: '',
    studentName: '',
    issuedDate: new Date().toISOString().split('T')[0],
    expectedReturnDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  // Try to get orgId from localStorage, assuming user details are stored there
  const userStr = localStorage.getItem('webUser');
  const user = userStr ? JSON.parse(userStr) : null;
  const orgId = user?.orgId || localStorage.getItem('orgId') || 'GLOBAL';

  const { data: classesData, isLoading: isLoadingClasses } = useGetClassroomListQuery(orgId);
  const { data: studentsData, isLoading: isLoadingStudents } = useGetStudentNamesByClassQuery(formData.classId, {
    skip: !formData.classId,
  });

  const [issueBook, { isLoading }] = useIssueBookMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.bookName || !formData.classId || !formData.studentId) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Formatting payload matching curl expected format
    const payload = {
      bookName: formData.bookName,
      author: formData.author,
      classId: formData.classId,
      className: formData.className,
      studentId: formData.studentId,
      studentName: formData.studentName,
      issuedDate: new Date(formData.issuedDate).toISOString(),
      expectedReturnDate: new Date(formData.expectedReturnDate).toISOString(),
    };

    try {
      await issueBook(payload).unwrap();
      toast.success('Book issued successfully');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to issue book');
    }
  };

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    setFormData({
      ...formData,
      classId: e.target.value,
      className: selectedOption.text,
      studentId: '', // Reset student when class changes
      studentName: ''
    });
  };

  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    setFormData({
      ...formData,
      studentId: e.target.value,
      studentName: selectedOption.text,
    });
  };

  const extractArray = (data: any) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.classes)) return data.classes;
    if (Array.isArray(data.classrooms)) return data.classrooms;
    if (Array.isArray(data.students)) return data.students;
    if (Array.isArray(data.data)) return data.data;
    return [];
  };

  const classes = extractArray(classesData);
  const students = extractArray(studentsData);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Issue New Book</h2>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <form id="issueBookForm" onSubmit={handleSubmit}>
            <div className={styles.formSection}>
              <h3>Book Details</h3>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label>Book Name *</label>
                  <input
                    type="text"
                    required
                    className={styles.inputField}
                    value={formData.bookName}
                    onChange={(e) => setFormData({ ...formData, bookName: e.target.value })}
                    placeholder="Enter book name"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Author</label>
                  <input
                    type="text"
                    className={styles.inputField}
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="Enter author name"
                  />
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h3>Student Details</h3>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label>Class *</label>
                  <select
                    required
                    className={styles.inputField}
                    value={formData.classId}
                    onChange={handleClassChange}
                  >
                    <option value="">-- Select Class --</option>
                    {isLoadingClasses ? (
                      <option disabled>Loading classes...</option>
                    ) : (
                      classes.map((c: any) => (
                        <option key={c._id || c.classId} value={c._id || c.classId}>
                          {c.className} {c.section}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label>Student *</label>
                  <select
                    required
                    className={styles.inputField}
                    value={formData.studentId}
                    onChange={handleStudentChange}
                    disabled={!formData.classId}
                  >
                    <option value="">-- Select Student --</option>
                    {isLoadingStudents ? (
                      <option disabled>Loading students...</option>
                    ) : (
                      students.map((s: any) => (
                        <option key={s._id || s.studentId} value={s._id || s.studentId}>
                          {s.fullName || s.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h3>Issue Timeline</h3>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label>Issue Date *</label>
                  <input
                    type="date"
                    required
                    className={styles.inputField}
                    value={formData.issuedDate}
                    onChange={(e) => setFormData({ ...formData, issuedDate: e.target.value })}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Expected Return Date *</label>
                  <input
                    type="date"
                    required
                    className={styles.inputField}
                    value={formData.expectedReturnDate}
                    onChange={(e) => setFormData({ ...formData, expectedReturnDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            style={{ padding: '0.625rem 1.25rem', border: '1px solid var(--color-border)' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="issueBookForm"
            className={styles.primaryBtn}
            disabled={isLoading}
          >
            {isLoading ? 'Issuing...' : 'Issue Book'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IssueBookModal;
