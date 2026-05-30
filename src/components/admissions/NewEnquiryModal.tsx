import React, { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCreateAdmissionMutation } from '../../store/apiSlice.ts';
import styles from './Admission.module.css';

interface NewEnquiryModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const NewEnquiryModal: React.FC<NewEnquiryModalProps> = ({ onClose, onSuccess }) => {
  const [createAdmission, { isLoading }] = useCreateAdmissionMutation();

  const [formData, setFormData] = useState({
    student: {
      fullName: '',
      dateOfBirth: '',
      gender: 'Male',
    },
    guardian: {
      name: '',
      phoneNumber: '',
      email: '',
      relationship: 'Father',
    },
    academic: {
      classAppliedFor: '',
      academicYear: '2026-2027',
    },
    metadata: {
      source: 'website',
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.student.fullName) newErrors.fullName = 'Full Name is required';
    if (!formData.guardian.name) newErrors.guardianName = 'Guardian Name is required';
    if (!formData.guardian.phoneNumber) newErrors.guardianPhone = 'Phone number is required';
    if (!formData.academic.classAppliedFor) newErrors.classAppliedFor = 'Class applied for is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await createAdmission(formData).unwrap();
      toast.success('Enquiry submitted successfully!');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to submit enquiry');
    }
  };

  const handleNestedChange = (section: keyof typeof formData, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value,
      },
    }));
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>New Enquiry</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <form id="enquiryForm" onSubmit={handleSubmit}>
            {/* Student Info */}
            <div className={styles.formSection}>
              <h3>Student Info</h3>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label>Full Name *</label>
                  <input
                    type="text"
                    className={styles.inputField}
                    value={formData.student.fullName}
                    onChange={(e) => handleNestedChange('student', 'fullName', e.target.value)}
                  />
                  {errors.fullName && <span className={styles.errorText}>{errors.fullName}</span>}
                </div>
                <div className={styles.inputGroup}>
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    className={styles.inputField}
                    value={formData.student.dateOfBirth}
                    onChange={(e) => handleNestedChange('student', 'dateOfBirth', e.target.value)}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Gender</label>
                  <select
                    className={styles.inputField}
                    value={formData.student.gender}
                    onChange={(e) => handleNestedChange('student', 'gender', e.target.value)}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Guardian Info */}
            <div className={styles.formSection}>
              <h3>Guardian Info</h3>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label>Guardian Name *</label>
                  <input
                    type="text"
                    className={styles.inputField}
                    value={formData.guardian.name}
                    onChange={(e) => handleNestedChange('guardian', 'name', e.target.value)}
                  />
                  {errors.guardianName && <span className={styles.errorText}>{errors.guardianName}</span>}
                </div>
                <div className={styles.inputGroup}>
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    className={styles.inputField}
                    value={formData.guardian.phoneNumber}
                    onChange={(e) => handleNestedChange('guardian', 'phoneNumber', e.target.value)}
                  />
                  {errors.guardianPhone && <span className={styles.errorText}>{errors.guardianPhone}</span>}
                </div>
                <div className={styles.inputGroup}>
                  <label>Email Address</label>
                  <input
                    type="email"
                    className={styles.inputField}
                    value={formData.guardian.email}
                    onChange={(e) => handleNestedChange('guardian', 'email', e.target.value)}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Relationship</label>
                  <select
                    className={styles.inputField}
                    value={formData.guardian.relationship}
                    onChange={(e) => handleNestedChange('guardian', 'relationship', e.target.value)}
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Academic Info */}
            <div className={styles.formSection}>
              <h3>Academic Info</h3>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label>Class Applied For *</label>
                  <input
                    type="text"
                    className={styles.inputField}
                    placeholder="e.g. Grade 1"
                    value={formData.academic.classAppliedFor}
                    onChange={(e) => handleNestedChange('academic', 'classAppliedFor', e.target.value)}
                  />
                  {errors.classAppliedFor && <span className={styles.errorText}>{errors.classAppliedFor}</span>}
                </div>
                <div className={styles.inputGroup}>
                  <label>Academic Year</label>
                  <input
                    type="text"
                    className={styles.inputField}
                    value={formData.academic.academicYear}
                    onChange={(e) => handleNestedChange('academic', 'academicYear', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Source Info */}
            <div className={styles.formSection}>
              <h3>Enquiry Source</h3>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label>Source</label>
                  <select
                    className={styles.inputField}
                    value={formData.metadata.source}
                    onChange={(e) => handleNestedChange('metadata', 'source', e.target.value)}
                  >
                    <option value="walk-in">Walk-in</option>
                    <option value="phone">Phone</option>
                    <option value="website">Website</option>
                    <option value="referral">Referral</option>
                  </select>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.backBtn} onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button type="submit" form="enquiryForm" className={styles.newEnquiryBtn} disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit Enquiry'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewEnquiryModal;
