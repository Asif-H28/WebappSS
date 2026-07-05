import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import EduSparkLogo from '../../assets/Tution Logo 2.png';
import './Clients.css';

const ClientsIndex = () => {
  const navigate = useNavigate();

  return (
    <div className="clients-page app">
      <header className="clients-header">
        <div className="container--wide header-inner">
          <button onClick={() => navigate(-1)} className="btn btn-ghost back-btn">
            <ArrowLeft size={20} /> Back
          </button>
          <h1 className="header-title">Our Valued Clients</h1>
        </div>
      </header>

      <main className="clients-main container--wide">
        <div className="clients-grid">
          <div className="client-card">
            <div className="client-card-image-wrap">
              <img src={EduSparkLogo} alt="EduSpark Tuition Classes" className="client-logo" />
            </div>
            <div className="client-card-content">
              <h2>EduSpark Tuition Classes</h2>
              <p>
                Providing comprehensive coaching for PU students (PCMB), JEE, NEET, KCET. Expert faculty, personalized attention, and regular progress tracking.
              </p>
              <Link 
                to="/clients/eduspark-tuition-classes"
                className="btn btn-primary submit-btn mt-auto client-link-btn"
              >
                View Application Form <ExternalLink size={16} />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientsIndex;
