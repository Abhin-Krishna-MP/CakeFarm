import React, { useEffect, useState } from "react";
import "./profile.scss";
import { BiImageAdd, BsBoxArrowInLeft } from "../../constants";
import Navbar from "../../components/navbar/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { updateUserDetails, updateUserProfile, logout } from "../../features/auth/authAction";
import { fetchDepartments } from "../../features/academics/academicsAction";

const resolveAvatar = (avatar) => {
  if (!avatar) return `${import.meta.env.VITE_API_BASE_IMAGE_URI}/assets/images/users/noProfile.png`;
  if (avatar.startsWith("http")) return avatar;
  return `${import.meta.env.VITE_API_BASE_IMAGE_URI}/assets/images/users/${avatar}`;
};

export default function Profile() {
  const user  = useSelector((s) => s.auth.userData);
  const token = useSelector((s) => s.auth.token);
  const { departments } = useSelector((s) => s.academics);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  // Find the department object matching the user's department
  const userDeptObj = departments?.find((d) => d.name === user?.department) || null;

  /* ── State ── */
  const [imageFile, setImageFile]   = useState(null);
  const [editSection, setEditSection] = useState(null); // 'account' | 'academic'

  const [accountForm, setAccountForm] = useState({ username: user?.username || "" });
  const [academicForm, setAcademicForm] = useState({
    semester:       user?.semester       || "",
    division:       user?.division       || "",
  });
  const [toast, setToast] = useState(null);

  /* ── Helpers ── */
  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3200);
  };

  const cancelEdit = (section) => {
    if (section === "account")  setAccountForm({ username: user?.username || "" });
    if (section === "academic") setAcademicForm({
      semester: user?.semester || "",
      division: user?.division || "",
    });
    setEditSection(null);
  };

  /* ── Save handlers ── */
  const handleAvatarUpload = () => {
    dispatch(updateUserProfile(imageFile, token));
    setImageFile(null);
    showToast("success", "Profile photo updated!");
  };

  const handleSaveAccount = () => {
    const cred = {};
    if (accountForm.username.trim() && accountForm.username.trim() !== user?.username)
      cred.username = accountForm.username.trim();
    if (!Object.keys(cred).length) { setEditSection(null); return; }
    dispatch(updateUserDetails(cred, token));
    showToast("success", "Account info saved!");
    setEditSection(null);
  };

  const handleSaveAcademic = () => {
    const cred = {};
    ["semester", "division"].forEach((k) => {
      if (academicForm[k] !== (user?.[k] || "")) cred[k] = academicForm[k];
    });
    if (!Object.keys(cred).length) { setEditSection(null); return; }
    dispatch(updateUserDetails(cred, token));
    showToast("success", "Academic details saved!");
    setEditSection(null);
  };

  /* ── Sub-components ── */
  const EditBtn = ({ section, label = "Edit" }) => (
    <button className="card-edit-btn" onClick={() => setEditSection(section)}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
      {label}
    </button>
  );

  const CardActions = ({ section, onSave }) => (
    <div className="card-actions">
      <button className="card-cancel-btn" onClick={() => cancelEdit(section)}>Cancel</button>
      <button className="card-save-btn"   onClick={onSave}>Save</button>
    </div>
  );

  const avatarSrc = imageFile ? URL.createObjectURL(imageFile) : resolveAvatar(user?.avatar);
  const academicComplete = user?.registerNumber && user?.department && user?.semester && user?.division;

  return (
    <div className="profile">
      <Navbar />
      <div className="profile-wrapper">

        {/* ─── Toast ─── */}
        <AnimatePresence>
          {toast && (
            <motion.div
              className={`profile-toast ${toast.type}`}
              initial={{ opacity: 0, y: -14, scale: 0.95 }}
              animate={{ opacity: 1, y: 0,  scale: 1 }}
              exit={{    opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {toast.type === "success"
                ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M20 6 9 17l-5-5"/></svg>
                : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="14" height="14"><path d="M18 6 6 18M6 6l12 12"/></svg>}
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Hero / Avatar ─── */}
        <div className="profile-hero">
          <div className="profile-avatar-wrap">
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="fileInput" id="fileInput" />
            <label htmlFor="fileInput" className="fileLabel">
              <img
                src={avatarSrc}
                alt={user?.username}
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = resolveAvatar(null); }}
              />
              <span className="avatar-overlay"><BiImageAdd /></span>
            </label>
          </div>

          <div className="profile-hero-info">
            <h2 className="profile-name">{user?.username}</h2>
            <p className="profile-email">{user?.email}</p>
            {!academicComplete && (
              <span className="incomplete-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="10" height="10"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                Complete your academic details
              </span>
            )}
          </div>

          <AnimatePresence>
            {imageFile && (
              <motion.button
                className="avatar-save-btn"
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{    opacity: 0, scale: 0.88 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAvatarUpload}
              >
                Save Photo
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* ─── Account Info ─── */}
        <div className={`profile-card${editSection === "account" ? " editing" : ""}`}>
          <div className="card-header">
            <div className="card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Account
            </div>
            {editSection === "account"
              ? <CardActions section="account" onSave={handleSaveAccount} />
              : <EditBtn section="account" />}
          </div>

          <div className="card-fields">
            {/* Username */}
            <div className="pf-field">
              <label className="pf-label">Username</label>
              {editSection === "account"
                ? <input className="pf-input" type="text" value={accountForm.username} onChange={(e) => setAccountForm({ username: e.target.value })} placeholder="Enter username" />
                : <p className="pf-value">{user?.username || "—"}</p>}
            </div>

            {/* Email — locked */}
            <div className="pf-field">
              <label className="pf-label">
                Email
                <span className="locked-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="9" height="9"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  locked
                </span>
              </label>
              <p className="pf-value muted">{user?.email || "—"}</p>
            </div>
          </div>
        </div>

        {/* ─── Academic Details ─── */}
        <div className={`profile-card${editSection === "academic" ? " editing" : ""}`}>
          <div className="card-header">
            <div className="card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              Academic Details
            </div>
            {editSection === "academic"
              ? <CardActions section="academic" onSave={handleSaveAcademic} />
              : <EditBtn section="academic" />}
          </div>

          <div className="card-fields card-fields-grid">
            {/* Register Number — locked */}
            <div className="pf-field">
              <label className="pf-label">
                Register No.
                <span className="locked-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="9" height="9"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  locked
                </span>
              </label>
              <p className="pf-value muted">{user?.registerNumber || "—"}</p>
            </div>

            {/* Department — locked */}
            <div className="pf-field">
              <label className="pf-label">
                Department
                <span className="locked-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="9" height="9"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  locked
                </span>
              </label>
              <p className="pf-value muted">{user?.department || "—"}</p>
            </div>

            {/* Semester — editable via dropdown */}
            <div className="pf-field">
              <label className="pf-label">Semester</label>
              {editSection === "academic" ? (
                <select
                  className="pf-input"
                  value={academicForm.semester}
                  onChange={(e) => setAcademicForm({ ...academicForm, semester: e.target.value })}
                >
                  <option value="">-- Select Semester --</option>
                  {(userDeptObj?.semesters || []).map((sem) => (
                    <option key={sem} value={sem}>{sem}</option>
                  ))}
                  {/* If user has a saved value not in the list, keep it selectable */}
                  {user?.semester && !(userDeptObj?.semesters || []).includes(user.semester) && (
                    <option value={user.semester}>{user.semester}</option>
                  )}
                </select>
              ) : (
                <p className={`pf-value${!user?.semester ? " empty" : ""}`}>{user?.semester || "Not set"}</p>
              )}
            </div>

            {/* Division / Batch — editable via dropdown */}
            <div className="pf-field">
              <label className="pf-label">Division / Batch</label>
              {editSection === "academic" ? (
                <select
                  className="pf-input"
                  value={academicForm.division}
                  onChange={(e) => setAcademicForm({ ...academicForm, division: e.target.value })}
                >
                  <option value="">-- Select Batch --</option>
                  {(userDeptObj?.batches || []).map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                  {user?.division && !(userDeptObj?.batches || []).includes(user.division) && (
                    <option value={user.division}>{user.division}</option>
                  )}
                </select>
              ) : (
                <p className={`pf-value${!user?.division ? " empty" : ""}`}>{user?.division || "Not set"}</p>
              )}
            </div>
          </div>
        </div>

        {/* ─── Logout ─── */}
        <div className="profile-logout">
          <motion.button onClick={() => dispatch(logout())} whileTap={{ scale: 0.97 }}>
            <BsBoxArrowInLeft className="icon" />
            Sign Out
          </motion.button>
        </div>

      </div>
    </div>
  );
}

