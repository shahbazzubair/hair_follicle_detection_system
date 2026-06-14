import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import styles from "./AdminDashboard.module.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("doctors");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "admin") {
      navigate("/admin", { replace: true });
      return;
    }
    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/api/admin/users");
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Fetch error:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (userId, action, status = null) => {
    const confirmText =
      action === "delete" ? "Delete this user?" : `Verify this doctor?`;
    const result = await Swal.fire({
      title: "Confirm Action",
      text: confirmText,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: action === "delete" ? "#ef4444" : "#2563eb",
    });

    if (result.isConfirmed) {
      try {
        if (action === "delete") {
          await axios.delete(`http://localhost:8000/api/admin/delete-user/${userId}`);
        } else {
          await axios.put(`http://localhost:8000/api/admin/verify-doctor/${userId}`, { status });
        }
        Swal.fire("Success!", "Action completed.", "success");
        fetchUsers();
      } catch (err) {
        Swal.fire("Error", "Action failed.", "error");
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  const stats = {
    total: users.length,
    patients: users.filter((u) => u.role === "patient").length,
    pending: users.filter((u) => u.role === "doctor" && u.status === "Pending").length,
    verified: users.filter((u) => u.role === "doctor" && u.status === "Approved").length,
  };

  const filteredUsers = users.filter(
    (user) => user && (activeTab === "doctors" ? user.role === "doctor" : user.role === "patient")
  );

  return (
    <div className={styles.adminContainer}>
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>HFD Admin</div>
        <nav className={styles.nav}>
          <div className={styles.navItemActive}>
            👥 Management
          </div>
        </nav>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h2>User Management</h2>
          <div className={styles.adminProfile}>
            Admin: {localStorage.getItem("userName") || "System Administrator"}
          </div>
        </header>

        {/* STATS */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span>Total Patients</span>
            <h3>{stats.patients}</h3>
          </div>
          <div className={styles.statCard}>
            <span>Pending Approvals</span>
            <h3 style={{ color: "#f59e0b" }}>{stats.pending}</h3>
          </div>
          <div className={styles.statCard}>
            <span>Verified Doctors</span>
            <h3 style={{ color: "#16a34a" }}>{stats.verified}</h3>
          </div>
        </div>

        {/* DATA TABLE */}
        {loading ? (
          <div className={styles.loader}>Syncing with Database...</div>
        ) : (
          <>
            <div className={styles.tabContainer}>
              <button
                className={activeTab === "doctors" ? styles.activeTabBtn : styles.tabBtn}
                onClick={() => setActiveTab("doctors")}
              >
                Doctors
              </button>
              <button
                className={activeTab === "patients" ? styles.activeTabBtn : styles.tabBtn}
                onClick={() => setActiveTab("patients")}
              >
                Patients
              </button>
            </div>

            <section className={styles.tableSection}>
              <table className={styles.userTable}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Details</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td>{user.fullName || "N/A"}</td>
                        <td>{user.email || "N/A"}</td>
                        <td>{user.phone || "N/A"}</td>
                        <td>
                          {user.role === "doctor" ? (
                            <div>
                              <strong>Spec:</strong> {user.specialization || "General"}
                              <br />
                              {user.degree_path ? (
                                <a
                                  href={`http://localhost:8000${user.degree_path}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.degreeLink}
                                >
                                  View Degree 📄
                                </a>
                              ) : (
                                <span className={styles.noImage}>No Degree</span>
                              )}
                            </div>
                          ) : (
                            "Standard Patient"
                          )}
                        </td>
                        <td>
                          <span
                            className={
                              user.status === "Approved"
                                ? styles.statusVerified
                                : styles.statusPending
                            }
                          >
                            {user.status || "Active"}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actionGroup}>
                            {user.role === "doctor" && user.status === "Pending" && (
                              <>
                                <button
                                  onClick={() => handleAction(user.id, "verify", "Approved")}
                                  className={styles.approveBtn}
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleAction(user.id, "verify", "Rejected")}
                                  className={styles.deleteBtn}
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className={styles.emptyTable}>
                        No records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
          </>
        )}
      </main>
    </div>
  );
}