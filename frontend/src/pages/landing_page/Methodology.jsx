import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Methodology.module.css';

// --- STANDARD ASSET IMPORTS ---
// (Adjust the relative paths if your assets folder is located elsewhere)
import PS from '../../assets/PS.png';
import PL from '../../assets/PL.png';
import SS from '../../assets/SS.png';
import IU from '../../assets/IU.png';
import RA from '../../assets/RA.png';
import DS from '../../assets/DS.png';
import AP from '../../assets/AP.png';
import DP from '../../assets/DP.png';
import DA from '../../assets/DA.png';

export default function Methodology() {
  const navigate = useNavigate();

  // Ensure page loads at the top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={styles.pageWrapper}>
      <section className={styles.methodologySection}>
        <div className={styles.header}>
          <h2 className={styles.mainTitle}>System Methodology</h2>
          <p className={styles.subTitle}>
            A refined, step-by-step operational guide for Patients and Clinical Staff.
          </p>
        </div>

        <div className={styles.container}>
          
          {/* --- PATIENT SECTION --- */}
          <div className={styles.roleBadgePatient}>Patient Workflow</div>
          
          <div className={styles.workflowGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepInfo}>
                <h3>1. Secure Signup</h3>
                <p>Create your account. Passwords are enforced with high-level security protocols to ensure your medical data remains private.</p>
              </div>
              <div className={styles.stepVisual}>
                <img src={PS} alt="Patient Signup" />
              </div>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepInfo}>
                <h3>2. Portal Login</h3>
                <p>Authenticate into the patient portal to securely access your private dashboard and historical scan data.</p>
              </div>
              <div className={styles.stepVisual}>
                <img src={PL} alt="Patient Login" />
              </div>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepInfo}>
                <h3>3. Specialist Routing</h3>
                <p>Select a verified clinical specialist from our database to review your specific case and provide tailored feedback.</p>
              </div>
              <div className={styles.stepVisual}>
                <img src={SS} alt="Select Specialist" />
              </div>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepInfo}>
                <h3>4. Data Ingestion</h3>
                <p>Upload a high-resolution image of the scalp. Our system pre-processes the image for optimal AI diagnostic accuracy.</p>
              </div>
              <div className={styles.stepVisual}>
                <img src={IU} alt="Upload Image" />
              </div>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepInfo}>
                <h3>5. Clinical Review</h3>
                <p>Access the generated AI analysis, view your Norwood Scale classification, and download the doctor's final clinical report.</p>
              </div>
              <div className={styles.stepVisual}>
                <img src={RA} alt="Report Analysis" />
              </div>
            </div>
          </div>

          {/* --- DOCTOR SECTION --- */}
          <div className={styles.roleBadgeDoctor}>Clinical Workflow</div>
          
          <div className={styles.workflowGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepInfo}>
                <h3>1. Credential Submission</h3>
                <p>Register as a practitioner by uploading your official medical credentials and degree for administrative review.</p>
              </div>
              <div className={styles.stepVisual}>
                <img src={DS} alt="Doctor Signup" />
              </div>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepInfo}>
                <h3>2. System Verification</h3>
                <p>Administrators manually review your submitted credentials and authorize your account for secure clinical access.</p>
              </div>
              <div className={styles.stepVisual}>
                <img src={AP} alt="Admin Approval" />
              </div>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepInfo}>
                <h3>3. Dashboard Access</h3>
                <p>Login to view your comprehensive queue of patients, process pending scans, and generate finalized PDF reports.</p>
              </div>
              <div className={styles.stepVisual}>
                <img src={DP} alt="Dashboard" />
              </div>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepInfo}>
                <h3>4. Direct AI Analysis</h3>
                <p>Bypass the patient queue to process local, in-clinic images instantly via the direct analysis tool on your dashboard.</p>
              </div>
              <div className={styles.stepVisual}>
                <img src={DA} alt="Direct Analysis" />
              </div>
            </div>
          </div>

          {/* --- BOTTOM ACTION --- */}
          <div className={styles.bottomAction}>
            <button onClick={() => navigate('/')} className={styles.backBtn}>
              ← Return to Home
            </button>
          </div>

        </div>
      </section>
    </div>
  );
}