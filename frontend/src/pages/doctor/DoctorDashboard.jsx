import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import styles from "./DoctorDashboard.module.css";

export default function DoctorDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("queue");
  const [doctorName] = useState(localStorage.getItem("userName"));

  const [scans, setScans] = useState([]);
  const [reports, setReports] = useState([]);

  const [loading, setLoading] = useState(true);

  // DIRECT ANALYSIS STATES
  const [directPatientName, setDirectPatientName] = useState("");
  const [directFile, setDirectFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [portalReports, setPortalReports] = useState([]);
  const [directReports, setDirectReports] = useState([]);
  const [showProfile, setShowProfile] = useState(false);

  const [profileImage, setProfileImage] = useState("");

  const [speciality, setSpeciality] = useState("");

  const [contactNumber, setContactNumber] = useState("");

  const [weeklySchedule, setWeeklySchedule] = useState([]);
  const [profileFile, setProfileFile] = useState(null);

  useEffect(() => {
    if (localStorage.getItem("userRole") !== "doctor") {
      navigate("/login", { replace: true });
      return;
    }

    fetchData();
    fetchProfile();
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);

    try {
      const res = await axios.get(
        `http://localhost:8000/api/doctor/data/${localStorage.getItem("userName")}`,
      );
      const allReports = res.data.reports || [];

      setPortalReports(allReports.filter((r) => r.doctorId !== "Direct"));

      setDirectReports(allReports.filter((r) => r.doctorId === "Direct"));

      setReports(allReports);
      setScans(res.data.scans || []);
      setReports(res.data.reports || []);
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setLoading(false);
    }
  };
  const fetchProfile = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/doctor/profile/${doctorName}`,
      );

      const doctor = res.data;

      setProfileImage(doctor.profileImage || "");

      setSpeciality(doctor.speciality || doctor.specialization || "");

      setContactNumber(doctor.contactNumber || doctor.phone || "");

      setWeeklySchedule(doctor.weeklySchedule || []);
    } catch (err) {
      console.error(err);
    }
  };
  const downloadReport = (data) => {
    try {
      const doc = new jsPDF();

      doc.setFont("helvetica", "bold");

      doc.text("HAIR FOLLICLE ANALYSIS REPORT", 105, 20, { align: "center" });

      autoTable(doc, {
        startY: 35,
        theme: "grid",

        headStyles: {
          fillColor: [15, 23, 42],
        },

        head: [["Metric", "Details"]],

        body: [
          ["Patient Name", data.patientName],
          ["Assigned Doctor", `Dr. ${doctorName}`],
          ["AI Analysis Result", data.baldnessStage],
          ["Clinical Status", "Verified & Processed"],
          [
            "Report Date",
            new Date(data.date || Date.now()).toLocaleDateString(),
          ],
        ],
      });

      doc.save(`${data.patientName}_Clinical_Report.pdf`);
    } catch (err) {
      console.error("PDF Error:", err);

      Swal.fire("Error", "PDF Generation Failed.", "error");
    }
  };
  const saveProfile = async () => {
    try {
      let uploadedImagePath = profileImage;

      // IMAGE UPLOAD
      if (profileFile) {
        const formData = new FormData();

        formData.append("file", profileFile);

        const uploadRes = await axios.post(
          "http://localhost:8000/api/doctor/upload-profile-image",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        );

        uploadedImagePath = uploadRes.data.imagePath;
      }

      // PROFILE SAVE
      await axios.put("http://localhost:8000/api/doctor/update-profile", {
        doctorName,
        speciality,
        contactNumber,
        weeklySchedule,
        profileImage: uploadedImagePath,
      });

      Swal.fire("Saved", "Profile Updated Successfully", "success");

      fetchProfile();
    } catch (err) {
      console.log(err);

      Swal.fire("Error", "Could not save profile", "error");
    }
  };
  const handleAnalyse = async (scan) => {
    const confirm = await Swal.fire({
      title: "Analyze Image?",
      text: `Run AI follicle detection on ${scan.patientName}'s scan?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Analyze",
      confirmButtonColor: "#38bdf8",
    });

    if (confirm.isConfirmed) {
      Swal.fire({
        title: "AI Processing...",
        text: "Detecting follicle density...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      try {
        await axios.put(
          `http://localhost:8000/api/doctor/process-scan/${scan.id}`,
        );

        Swal.fire("Success", "Analysis Complete & Report Generated", "success");

        fetchData();
      } catch (err) {
        const status = err.response?.status;

        const detail = err.response?.data?.detail || "Processing failed.";

        if (status === 503) {
          Swal.fire("Model Offline", detail, "warning");
        } else {
          Swal.fire("Error", "Could not connect to analysis server.", "error");
        }
      }
    }
  };

  const handleDirectAnalysis = async (e) => {
    e.preventDefault();

    if (!directFile || !directPatientName) {
      return Swal.fire(
        "Required",
        "Please provide a name and upload an image.",
        "warning",
      );
    }

    setIsProcessing(true);

    const formData = new FormData();

    formData.append("doctorName", doctorName);
    formData.append("patientName", directPatientName);
    formData.append("image", directFile);

    try {
      await axios.post(
        "http://localhost:8000/api/doctor/direct-analysis",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      Swal.fire("Success", "Direct analysis complete.", "success");

      setDirectPatientName("");
      setDirectFile(null);

      document.getElementById("directFileInput").value = null;

      fetchData();
    } catch (err) {
      const status = err.response?.status;

      const detail = err.response?.data?.detail || "Analysis Failed.";

      if (status === 503) {
        Swal.fire("Model Offline", detail, "warning");
      } else {
        Swal.fire("Analysis Failed", "Could not process the image.", "error");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();

    navigate("/", { replace: true });
  };

  return (
    <div className={styles.dashboardWrapper}>
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          HFD<span>AI</span>
        </div>

        <div className={styles.doctorBadge}>Clinical Portal</div>

        <nav className={styles.nav}>
          <button
            className={
              activeTab === "queue" ? styles.navItemActive : styles.navItem
            }
            onClick={() => setActiveTab("queue")}
          >
            👥 Patient Queue & Reports
          </button>

          <button
            className={
              activeTab === "direct" ? styles.navItemActive : styles.navItem
            }
            onClick={() => setActiveTab("direct")}
          >
            ⚡ Direct Fast Analysis
          </button>
        </nav>

        <button onClick={handleLogout} className={styles.logoutBtn}>
          Logout Securely
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1>Welcome To The Doctor Dashboad</h1>
          <p>Review patient scans and run AI diagnostics.</p>
        </header>
        <div className={styles.profileSection}>
          <div className={styles.profileLeft}>
            <div className={styles.profileImageWrapper}>
              {profileImage ? (
                <img
                  src={`http://localhost:8000${profileImage}`}
                  alt="Doctor"
                  className={styles.profileImage}
                />
              ) : (
                <div className={styles.defaultAvatar}>
                  {doctorName?.charAt(0).toUpperCase()}
                </div>
              )}

              <button className={styles.editImageBtn}>✎</button>
            </div>

            <div className={styles.profileInfo}>
              <h2>Dr. {doctorName}</h2>

              <p>{speciality || "Hair Specialist"}</p>

              <div className={styles.profileMeta}>
                <div className={styles.metaItem}>
                  📞 {contactNumber || "Not Added"}
                </div>

                <div className={styles.metaItem}>
                  🗓 {weeklySchedule.length} Days Available
                </div>
              </div>
            </div>
          </div>

          <button
            className={styles.editProfileBtn}
            onClick={() => setShowProfile(!showProfile)}
          >
            Edit Profile
          </button>
        </div>

        {showProfile && (
          <div className={styles.profileModal}>
            <div className={styles.profileGrid}>
              <div className={styles.profileInputGroup}>
                <label>Speciality</label>

                <input
                  type="text"
                  className={styles.profileInput}
                  value={speciality}
                  onChange={(e) => setSpeciality(e.target.value)}
                />
              </div>

              <div className={styles.profileInputGroup}>
                <label>Contact Number</label>

                <input
                  type="text"
                  className={styles.profileInput}
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                />
              </div>

              <div className={styles.profileInputGroup}>
                <label>Upload Profile Image</label>

                <input
                  type="file"
                  accept="image/*"
                  className={styles.profileInput}
                  onChange={(e) => {
                    const file = e.target.files[0];

                    if (file) {
                      setProfileFile(file);

                      setProfileImage(URL.createObjectURL(file));
                    }
                  }}
                />
              </div>
            </div>

            <div className={styles.scheduleWrapper}>
              <h3 className={styles.scheduleTitle}>Weekly Availability</h3>

              <div className={styles.scheduleGrid}>
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => (
                  <div key={day} className={styles.scheduleCard}>
                    <label className={styles.scheduleLabel}>
                      <input
                        type="checkbox"
                        checked={weeklySchedule.includes(day)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setWeeklySchedule([...weeklySchedule, day]);
                          } else {
                            setWeeklySchedule(
                              weeklySchedule.filter((d) => d !== day),
                            );
                          }
                        }}
                      />

                      <span>{day}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <button className={styles.saveProfileBtn} onClick={saveProfile}>
              Save Profile
            </button>
          </div>
        )}
        <div className={styles.dashboardCards}>
          <div className={`${styles.statsCard} ${styles.cardBlue}`}>
            <p className={styles.cardLabel}>Online Patients</p>

            <h1 className={styles.cardValue}>{portalReports.length}</h1>
          </div>

          <div className={`${styles.statsCard} ${styles.cardGreen}`}>
            <p className={styles.cardLabel}>Direct Analysis</p>

            <h1 className={styles.cardValue}>{directReports.length}</h1>
          </div>

          <div className={`${styles.statsCard} ${styles.cardDark}`}>
            <p className={styles.cardLabel}>Total Reports</p>

            <h1 className={styles.cardValue}>{reports.length}</h1>
          </div>
        </div>

        {/* ========================= */}
        {/* QUEUE TAB */}
        {/* ========================= */}

        {activeTab === "queue" ? (
          <div className={styles.sectionsContainer}>
            {/* PENDING SCANS */}
            <section className={styles.contentCard}>
              <h2 className={styles.sectionTitle}>
                📸 Incoming Patient Scans (Pending)
              </h2>

              {loading ? (
                <p className={styles.loadingText}>Syncing queue...</p>
              ) : scans.length > 0 ? (
                <div className={styles.tableResponsive}>
                  <table className={styles.userTable}>
                    <thead>
                      <tr>
                        <th>Patient Name</th>
                        <th>Date Submitted</th>
                        <th>Raw Image</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {scans.map((s, i) => (
                        <tr key={i}>
                          <td>{s.patientName}</td>

                          <td>{new Date(s.date).toLocaleDateString()}</td>

                          <td>
                            <a
                              href={`http://localhost:8000${s.imagePath}`}
                              target="_blank"
                              rel="noreferrer"
                              className={styles.reviewLink}
                            >
                              View Scan ↗
                            </a>
                          </td>

                          <td>
                            <button
                              onClick={() => handleAnalyse(s)}
                              className={styles.actionBtn}
                            >
                              Analyze Now
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  No pending scans at the moment.
                </div>
              )}
            </section>

            {/* PATIENT PORTAL REPORTS */}
            <section
              className={styles.contentCard}
              style={{ marginTop: "30px" }}
            >
              <h2 className={styles.sectionTitle} style={{ color: "#10b981" }}>
                📄 Generated Clinical Reports
              </h2>

              {reports.filter((r) => r.doctorId !== "Direct").length > 0 ? (
                <div className={styles.tableResponsive}>
                  <table className={styles.userTable}>
                    <thead>
                      <tr>
                        <th>Patient Name</th>
                        <th>Analysis Date</th>
                        <th>AI Result</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {reports
                        .filter((r) => r.doctorId !== "Direct")
                        .map((r, i) => (
                          <tr key={i}>
                            <td>{r.patientName}</td>

                            <td>
                              {r?.date
                                ? new Date(r.date).toLocaleDateString()
                                : new Date().toLocaleDateString()}
                            </td>

                            <td>
                              <span className={styles.statusBadge}>
                                {r.baldnessStage}
                              </span>
                            </td>

                            <td>
                              <button
                                onClick={() => downloadReport(r)}
                                className={styles.downloadBtn}
                              >
                                Download PDF
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  No reports generated yet.
                </div>
              )}
            </section>
          </div>
        ) : (
          /* ========================= */
          /* DIRECT ANALYSIS TAB */
          /* ========================= */

          <div className={styles.sectionsContainer}>
            {/* DIRECT FORM */}
            <section className={styles.contentCard}>
              <h2 className={styles.sectionTitle}>⚡ Direct Fast Analysis</h2>

              <p
                style={{
                  color: "#64748b",
                  marginBottom: "20px",
                }}
              >
                Upload an image directly from your clinic for instant AI
                analysis.
              </p>

              <form
                onSubmit={handleDirectAnalysis}
                className={styles.directFormContainer}
              >
                <div className={styles.inputGroup}>
                  <label>Patient Name / ID</label>

                  <input
                    type="text"
                    className={styles.inputField}
                    placeholder=""
                    value={directPatientName}
                    onChange={(e) => setDirectPatientName(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Scalp Image</label>

                  <input
                    type="file"
                    id="directFileInput"
                    className={styles.inputField}
                    accept=".jpg, .jpeg, .png"
                    onChange={(e) => setDirectFile(e.target.files[0])}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className={styles.processBtn}
                  disabled={isProcessing}
                >
                  {isProcessing
                    ? "🤖 AI is Analyzing..."
                    : "Run Analysis & Generate Report"}
                </button>
              </form>
            </section>

            {/* DIRECT HISTORY */}
            <section
              className={styles.contentCard}
              style={{ marginTop: "30px" }}
            >
              <h2 className={styles.sectionTitle}>
                ⚡ Direct Analysis History
              </h2>

              {reports.filter((r) => r.doctorId === "Direct").length > 0 ? (
                <div className={styles.tableResponsive}>
                  <table className={styles.userTable}>
                    <thead>
                      <tr>
                        <th>Patient Name</th>
                        <th>Analysis Date</th>
                        <th>AI Result</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {reports
                        .filter((r) => r.doctorId === "Direct")
                        .map((r, i) => (
                          <tr key={i}>
                            <td>{r.patientName}</td>

                            <td>
                              {r?.date
                                ? new Date(r.date).toLocaleDateString()
                                : new Date().toLocaleDateString()}
                            </td>

                            <td>
                              <span className={styles.statusBadge}>
                                {r.baldnessStage}
                              </span>
                            </td>

                            <td>
                              <button
                                onClick={() => downloadReport(r)}
                                className={styles.downloadBtn}
                              >
                                Download PDF
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  No direct analysis history.
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
