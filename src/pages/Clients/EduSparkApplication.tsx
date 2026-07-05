import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import EduSparkLogo from '../../assets/Tution Logo 2.png';
import './Clients.css';

const EduSparkApplication = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    preferredTuition: '',
    studentName: '',
    dateOfBirth: '',
    classOrGrade: '',
    boardOrSyllabus: '',
    schoolOrCollegeName: '',
    mediumOfStudy: '',
    parentOrGuardianName: '',
    contactNumber: '',
    address: '',
  });

  const [preferredTimeOptions, setPreferredTimeOptions] = useState({
    Morning: false,
    Evening: false,
    Both: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setPreferredTimeOptions(prev => ({ ...prev, [name]: checked }));
  };

  const handleClear = () => {
    setFormData({
      preferredTuition: '',
      studentName: '',
      dateOfBirth: '',
      classOrGrade: '',
      boardOrSyllabus: '',
      schoolOrCollegeName: '',
      mediumOfStudy: '',
      parentOrGuardianName: '',
      contactNumber: '',
      address: '',
    });
    setPreferredTimeOptions({
      Morning: false,
      Evening: false,
      Both: false,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.preferredTuition || !formData.studentName || !formData.dateOfBirth || 
        !formData.classOrGrade || !formData.boardOrSyllabus || !formData.schoolOrCollegeName ||
        !formData.mediumOfStudy || !formData.parentOrGuardianName || !formData.contactNumber ||
        !formData.address) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const selectedTimes = Object.keys(preferredTimeOptions).filter(key => preferredTimeOptions[key as keyof typeof preferredTimeOptions]);
    if (selectedTimes.length === 0) {
      toast.error('Please select preferred time.');
      return;
    }

    // Prepare date
    let dobISO = '';
    try {
      dobISO = new Date(formData.dateOfBirth).toISOString();
    } catch (e) {
      toast.error('Invalid date format.');
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('Submitting application...');

    try {
      const payload = {
        orgId: "ORG_X4R5WY",
        ...formData,
        dateOfBirth: dobISO,
        preferredTime: selectedTimes.join(', ')
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/tuition-applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message || 'Tuition application submitted successfully', { id: loadingToast });
        handleClear();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to submit application', { id: loadingToast });
      }
    } catch (error) {
      toast.error('An error occurred. Please check your connection.', { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="clients-page app">
      <header className="clients-header">
        <div className="container--wide header-inner">
          <button onClick={() => navigate(-1)} className="btn btn-ghost back-btn">
            <ArrowLeft size={20} /> Back
          </button>
          <h1 className="header-title">Application Form</h1>
        </div>
      </header>

      <main className="clients-main container">
        <div className="form-container">
          <div className="form-card">
            <div className="form-header">
              <img src={EduSparkLogo} alt="EduSpark Tuition Classes" />
              <h1>EduSpark Tuition Classes</h1>
              <p>Submit a new application. We will contact you soon.</p>
            </div>

            <form onSubmit={handleSubmit}>
              
              {/* Preferred Tuition */}
              <div className="form-group">
                <label className="form-label">Preferred Tuition <span className="required">*</span></label>
                <div className="form-radio-group">
                  <label className="form-radio-label">
                    <input 
                      type="radio" 
                      name="preferredTuition" 
                      value="Home Tuition" 
                      checked={formData.preferredTuition === 'Home Tuition'}
                      onChange={handleInputChange} 
                      required
                    />
                    Home Tuition
                  </label>
                  <label className="form-radio-label">
                    <input 
                      type="radio" 
                      name="preferredTuition" 
                      value="Tuition Centre" 
                      checked={formData.preferredTuition === 'Tuition Centre'}
                      onChange={handleInputChange} 
                      required
                    />
                    Tuition Centre
                  </label>
                </div>
              </div>

              {/* Student's Name */}
              <div className="form-group">
                <label className="form-label">Student's Name <span className="required">*</span></label>
                <input 
                  type="text" 
                  name="studentName" 
                  className="form-input" 
                  placeholder="Your answer" 
                  value={formData.studentName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Date of Birth */}
              <div className="form-group">
                <label className="form-label">Date of Birth <span className="required">*</span></label>
                <input 
                  type="date" 
                  name="dateOfBirth" 
                  className="form-input" 
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Class/Grade */}
              <div className="form-group">
                <label className="form-label">Class/Grade <span className="required">*</span></label>
                <input 
                  type="text" 
                  name="classOrGrade" 
                  className="form-input" 
                  placeholder="Your answer" 
                  value={formData.classOrGrade}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Board/Syllabus */}
              <div className="form-group">
                <label className="form-label">Board/Syllabus <span className="required">*</span></label>
                <div className="form-radio-group">
                  {['State', 'CBSE', 'ICSE', 'IGCSE'].map(board => (
                    <label key={board} className="form-radio-label">
                      <input 
                        type="radio" 
                        name="boardOrSyllabus" 
                        value={board} 
                        checked={formData.boardOrSyllabus === board}
                        onChange={handleInputChange}
                        required
                      />
                      {board}
                    </label>
                  ))}
                </div>
              </div>

              {/* School/College Name */}
              <div className="form-group">
                <label className="form-label">School/College Name <span className="required">*</span></label>
                <input 
                  type="text" 
                  name="schoolOrCollegeName" 
                  className="form-input" 
                  placeholder="Your answer" 
                  value={formData.schoolOrCollegeName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Medium of Study */}
              <div className="form-group">
                <label className="form-label">Medium of Study <span className="required">*</span></label>
                <div className="form-radio-group">
                  {['Kannada', 'English', 'Hindi/Urdu'].map(medium => (
                    <label key={medium} className="form-radio-label">
                      <input 
                        type="radio" 
                        name="mediumOfStudy" 
                        value={medium} 
                        checked={formData.mediumOfStudy === medium}
                        onChange={handleInputChange}
                        required
                      />
                      {medium}
                    </label>
                  ))}
                </div>
              </div>

              {/* Parent/Guardian Name */}
              <div className="form-group">
                <label className="form-label">Parent/Guardian Name <span className="required">*</span></label>
                <input 
                  type="text" 
                  name="parentOrGuardianName" 
                  className="form-input" 
                  placeholder="Your answer" 
                  value={formData.parentOrGuardianName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Contact Number */}
              <div className="form-group">
                <label className="form-label">Contact Number <span className="required">*</span></label>
                <input 
                  type="text" 
                  name="contactNumber" 
                  className="form-input" 
                  placeholder="Your answer" 
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Address */}
              <div className="form-group">
                <label className="form-label">Address <span className="required">*</span></label>
                <input 
                  type="text" 
                  name="address" 
                  className="form-input" 
                  placeholder="Your answer" 
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Preferred Time */}
              <div className="form-group">
                <label className="form-label">Preferred Time <span className="required">*</span></label>
                <div className="form-checkbox-group">
                  {['Morning', 'Evening', 'Both'].map(time => (
                    <label key={time} className="form-checkbox-label">
                      <input 
                        type="checkbox" 
                        name={time}
                        checked={preferredTimeOptions[time as keyof typeof preferredTimeOptions]}
                        onChange={handleCheckboxChange}
                      />
                      {time}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  style={{ backgroundColor: '#5d5fef', color: '#fff', padding: '10px 24px' }}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
                <button type="button" className="btn clear-btn" onClick={handleClear}>
                  Clear form
                </button>
              </div>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EduSparkApplication;
