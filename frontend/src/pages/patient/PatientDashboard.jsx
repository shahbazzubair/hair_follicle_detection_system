import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import styles from "./PatientDashboard.module.css";

export default function PatientDashboard() {
  const navigate = useNavigate();

  const [userName] = useState(localStorage.getItem("userName"));
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDoctorName, setSelectedDoctorName] = useState("");
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [myScans, setMyScans] = useState([]);
  const [myReports, setMyReports] = useState([]);

  useEffect(() => {
    if (!userName) {
      navigate("/login", { replace: true });
      return;
    }
    fetchPatientData();
  }, [userName, navigate]);

  const fetchPatientData = async () => {
    setDataLoading(true);
    try {
      const docRes = await axios.get("http://localhost:8000/api/doctor/all-doctors");
      setDoctors(docRes.data);

      const dataRes = await axios.get(`http://localhost:8000/api/patient/data/${userName}`);
      setMyScans(dataRes.data.scans || []);
      setMyReports(dataRes.data.reports || []);
    } catch (err) {
      console.error(err);
    } finally {
      setDataLoading(false);
    }
  };

  const downloadPDF = (report) => {
    try {
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.text("HAIR FOLLICLE ANALYSIS REPORT", 105, 20, { align: "center" });

      autoTable(doc, {
        startY: 40,
        head: [["Metric", "Details"]],
        body: [
          ["Patient Name", userName],
          ["Doctor", `Dr. ${report.doctorName}`],
          ["AI Result", report.baldnessStage],
          ["Clinical Status", "Processed"],
          ["Date", new Date(report.date).toLocaleDateString()],
        ],
      });

      doc.save(`${userName}_Report.pdf`);
    } catch (err) {
      Swal.fire("Error", "PDF generation failed.", "error");
    }
  };

  const handleDownloadForScan = (scanId) => {
    const report = myReports.find((r) => r.scanId === scanId);
    if (report) {
      downloadPDF(report);
    } else {
      Swal.fire("Pending", "Report not generated yet.", "info");
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!selectedDoctor) {
      Swal.fire("Required", "Please select a doctor first.", "warning");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("patientName", userName);
    formData.append("doctorId", selectedDoctor);
    formData.append("image", file);

    try {
      await axios.post("http://localhost:8000/api/patient/upload-scan", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire("Success", `Scan sent to Dr. ${selectedDoctorName}`, "success");
      fetchPatientData();
    } catch (err) {
      Swal.fire("Error", "Upload failed.", "error");
    } finally {
      setLoading(false);
      e.target.value = null; // reset input
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  // Get the most recent scan to display in the 3rd box
  const sortedScans = [...myScans].sort((a, b) => new Date(b.date) - new Date(a.date));
  const recentScan = sortedScans.length > 0 ? sortedScans[0] : null;

  return (
    <div className={styles.dashboardWrapper}>
      {/* HEADER */}
      <header className={styles.dashboardHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.logoText}>
            HFD<span>AI</span>
          </h1>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.userProfile}>
            <div className={styles.avatar}>
              {userName?.charAt(0).toUpperCase()}
            </div>
            <div className={styles.userMeta}>
              <span className={styles.actualName}>{userName}</span>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className={styles.mainContent}>
        <div className={styles.welcomeHero}>
          <h2>Welcome, {userName}</h2>
          <p>Upload scalp scans and select your preferred doctor.</p>
        </div>

        {/* --- 3-COLUMN GRID --- */}
        <div className={styles.topGrid}>
          
          {/* BOX 1: DOCTOR SELECTION */}
          <section className={styles.dashboardCard}>
            <h3>👨‍⚕️ Choose Specialist</h3>
            <div className={styles.doctorListContainer}>
              <div className={styles.doctorDropdown}>
                {doctors.map((doc, idx) => (
                  <div
                    key={idx}
                    className={`${styles.doctorOption} ${
                      selectedDoctor === doc.id ? styles.activeDoctorOption : ""
                    }`}
                    onClick={() => {
                      setSelectedDoctor(doc.id);
                      setSelectedDoctorName(doc.fullName);
                    }}
                  >
                    <div
                      className={styles.doctorImageWrapper}
                      onClick={(e) => {
                        e.stopPropagation();
                        Swal.fire({
                          title: `Dr. ${doc.fullName}`,
                          html: `
                            <p><b>Speciality:</b> ${doc.speciality || "Hair Specialist"}</p>
                            <p><b>Contact:</b> ${doc.contactNumber || "Not Added"}</p>
                            <p><b>Available Days:</b> ${doc.weeklySchedule?.join(", ") || "No Schedule"}</p>
                          `,
                          imageUrl: doc.profileImage ? `http://localhost:8000${doc.profileImage}` : "",
                          imageWidth: 120,
                          confirmButtonColor: "#2563eb",
                        });
                      }}
                    >
                      {doc.profileImage ? (
                        <img
                          src={`http://localhost:8000${doc.profileImage}`}
                          alt={doc.fullName}
                          className={styles.doctorMiniImage}
                        />
                      ) : (
                        <div className={styles.defaultMiniAvatar}>
                          {doc.fullName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className={styles.doctorInfo}>
                      <h4>Dr. {doc.fullName}</h4>
                      <p>{doc.speciality || "Hair Specialist"}</p>
                    </div>

                    {selectedDoctor === doc.id && (
                      <div className={styles.selectedBadge}>✓</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* BOX 2: UPLOAD */}
          <section className={`${styles.dashboardCard} ${selectedDoctor ? styles.featuredCard : ''}`}>
            <h3>📸 Upload New Scan</h3>
            <div
              className={`${styles.uploadZone} ${!selectedDoctor ? styles.uploadZoneDisabled : ''}`}
              onClick={() => {
                if (!selectedDoctor || loading) return;
                document.getElementById("fileUpload").click();
              }}
            >
              <span className={styles.uploadIconLarge}>
                {!selectedDoctor ? "🔒" : loading ? "⏳" : "📤"}
              </span>

              <p>
                {!selectedDoctor 
                  ? "Select a doctor first to unlock" 
                  : loading 
                    ? "Uploading..." 
                    : `Send to Dr. ${selectedDoctorName}`}
              </p>

              <input
                type="file"
                id="fileUpload"
                hidden
                accept=".jpg,.jpeg,.png"
                onChange={handleUpload}
                disabled={!selectedDoctor || loading}
              />
            </div>
          </section>

          {/* BOX 3: RECENT SCAN */}
          <section className={styles.dashboardCard}>
            <h3>⏱️ Recent Scan</h3>
            {dataLoading ? (
              <div className={styles.emptyRecent}>Loading...</div>
            ) : recentScan ? (
              <div className={styles.recentScanWrapper}>
                <img
                  src={`http://localhost:8000${recentScan.imagePath}`}
                  alt="Recent Scan"
                  className={styles.recentScanImg}
                />
                <div className={styles.recentScanInfo}>
                  <p><strong>Dr. {recentScan.doctorName}</strong></p>
                  <span className={recentScan.status === "Processed" ? styles.statusProcessed : styles.statusPending}>
                    {recentScan.status}
                  </span>
                </div>
              </div>
            ) : (
              <div className={styles.emptyRecent}>
                <p>No recent scans available.</p>
              </div>
            )}
          </section>

        </div>

        {/* HISTORY SECTION */}
        <section className={styles.gallerySection}>
          <h2 className={styles.sectionTitle}>My Scan History</h2>

          {dataLoading ? (
            <div className={styles.loadingState}>Loading records...</div>
          ) : myScans.length > 0 ? (
            <div className={styles.scansGrid}>
              {myScans.map((s, idx) => (
                <div key={idx} className={styles.scanCard}>
                  <img
                    src={`http://localhost:8000${s.imagePath}`}
                    alt="Scan"
                    className={styles.scanImage}
                  />
                  <div className={styles.scanDetails}>
                    <p><strong>Dr. {s.doctorName}</strong></p>
                    <span className={s.status === "Processed" ? styles.statusProcessed : styles.statusPending}>
                      {s.status}
                    </span>
                    {s.status === "Processed" && (
                      <button
                        onClick={() => handleDownloadForScan(s.id)}
                        className={styles.miniDownloadBtn}
                      >
                        Download Report
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyGallery}>No scans uploaded yet.</div>
          )}
        </section>
      </main>
    </div>
  );
}