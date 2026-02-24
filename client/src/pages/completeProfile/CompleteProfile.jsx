import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { signInSuccess } from "../../features/auth/authSlice";
import { fetchDepartments } from "../../features/academics/academicsAction";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCode, FiGlobe, FiCpu, FiZap, FiSettings, FiLayers,
  FiDroplet, FiBook, FiHash, FiBookOpen, FiCalendar, FiGrid,
  FiCheckCircle, FiArrowRight, FiArrowLeft,
} from "react-icons/fi";
import "./completeProfile.scss";
import { logo } from "../../constants/index.js";

// Icon map for departments (fallback icon for unknown departments)
const DEPT_ICONS = {
  "Computer Science":       FiCode,
  "Information Technology": FiGlobe,
  "Electronics":            FiCpu,
  "Electrical":             FiZap,
  "Mechanical":             FiSettings,
  "Civil":                  FiLayers,
  "Chemical":               FiDroplet,
};
const DEFAULT_DEPT_ICON = FiBook;

const STEPS = [
  { id: 1, label: "Register No.", field: "registerNumber" },
  { id: 2, label: "Department",   field: "department"     },
  { id: 3, label: "Semester",     field: "semester"       },
  { id: 4, label: "Division",     field: "division"       },
];

const slideVariants = {
  enter:  (dir) => ({ x: dir > 0 ?  60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (dir) => ({ x: dir > 0 ? -60 :  60, opacity: 0 }),
};

export default function CompleteProfile() {
  const [searchParams] = useSearchParams();
  const navigate        = useNavigate();
  const dispatch        = useDispatch();
  const userId          = searchParams.get("userId");

  const { departments } = useSelector((s) => s.academics);

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  // Derive selected department object to get semesters + batches
  const [step, setStep]         = useState(1);
  const [dir,  setDir]          = useState(1);
  const [formData, setFormData] = useState({
    registerNumber: "",
    department:     "",
    semester:       "",
    division:       "",
  });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const selectedDeptObj = departments?.find((d) => d.name === formData.department) || null;
  const availableSemesters = selectedDeptObj?.semesters || [];
  const availableBatches   = selectedDeptObj?.batches   || [];

  const totalSteps = STEPS.length;
  const progress   = step <= totalSteps ? ((step - 1) / totalSteps) * 100 : 100;

  const go = (nextStep) => {
    setDir(nextStep > step ? 1 : -1);
    setStep(nextStep);
  };

  const canAdvance = () => {
    if (step === 1) return formData.registerNumber.trim().length >= 3;
    if (step === 2) return formData.department !== "";
    if (step === 3) return formData.semester    !== "";
    if (step === 4) return formData.division.trim().length >= 1;
    return true;
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URI}/auth/complete-profile`,
        { userId, ...formData }
      );
      if (response.data.success) {
        const { user, accessToken } = response.data.data;
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", accessToken);
        dispatch(signInSuccess({ data: { user, accessToken } }));
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to complete profile");
      go(1);
    } finally {
      setLoading(false);
    }
  };

  const CheckMark = () => (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6l3 3 5-5" />
    </svg>
  );

  return (
    <div className="cp-page">
      <div className="cp-blob cp-blob--1" aria-hidden />
      <div className="cp-blob cp-blob--2" aria-hidden />
      <div className="cp-blob cp-blob--3" aria-hidden />

      <div className="cp-card">

        {/* Logo */}
        <div className="cp-logo">
          <img src={logo} alt="CampusDine" />
        </div>

        {/* Header */}
        <div className="cp-header">
          <span className="cp-eyebrow">Account Setup</span>
          <h1 className="cp-title">Complete Your Profile</h1>
          <p className="cp-sub">Provide your academic details to get started</p>
        </div>

        {/* Progress bar */}
        <div className="cp-progress-track" aria-label="Setup progress">
          <motion.div
            className="cp-progress-fill"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
          />
        </div>

        {/* Step indicators */}
        <div className="cp-steps">
          {STEPS.map((s) => {
            const isDone   = step > s.id;
            const isActive = step === s.id;
            return (
              <button
                key={s.id}
                className={`cp-step-dot${isActive ? " active" : isDone ? " done" : ""}`}
                onClick={() => isDone && go(s.id)}
                title={s.label}
                aria-label={`Step ${s.id}: ${s.label}`}
              >
                <span className="cp-step-dot-circle">
                  {isDone ? <CheckMark /> : s.id}
                </span>
                <span className="cp-step-label">{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="cp-error"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" width="15" height="15">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step panels */}
        <div className="cp-panel-host">
          <AnimatePresence mode="wait" custom={dir}>

            {/* Step 1 — Register Number */}
            {step === 1 && (
              <motion.div key="s1" className="cp-panel"
                custom={dir} variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.28, ease: "easeInOut" }}
              >
                <div className="cp-field-label">Register Number</div>
                <p className="cp-field-hint">Your official college roll / register number</p>
                <div className="cp-input-wrap">
                  <svg className="cp-input-icon" viewBox="0 0 20 20" fill="none"
                    stroke="currentColor" strokeWidth="1.6">
                    <rect x="4" y="2" width="12" height="16" rx="2" />
                    <path d="M7 7h6M7 10h6M7 13h4" strokeLinecap="round" />
                  </svg>
                  <input
                    autoFocus
                    type="text"
                    className="cp-input"
                    placeholder="e.g. 21CS001"
                    value={formData.registerNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, registerNumber: e.target.value })
                    }
                    onKeyDown={(e) => e.key === "Enter" && canAdvance() && go(2)}
                  />
                  {formData.registerNumber.trim().length >= 3 && (
                    <span className="cp-input-check"><CheckMark /></span>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 2 — Department */}
            {step === 2 && (
              <motion.div key="s2" className="cp-panel"
                custom={dir} variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.28, ease: "easeInOut" }}
              >
                <div className="cp-field-label">Department</div>
                <p className="cp-field-hint">Choose your academic department</p>
                {(!departments || departments.length === 0) ? (
                  <p className="cp-field-hint" style={{ marginTop: "1rem", color: "#a09cb8" }}>
                    No departments available yet. Ask your admin to add departments first.
                  </p>
                ) : (
                  <div className="cp-dept-grid">
                    {departments.map(({ _id, name }) => {
                      const Icon = DEPT_ICONS[name] || DEFAULT_DEPT_ICON;
                      return (
                        <button
                          key={_id}
                          type="button"
                          className={`cp-dept-chip${formData.department === name ? " selected" : ""}`}
                          onClick={() => setFormData({ ...formData, department: name, semester: "", division: "" })}
                        >
                          <span className="cp-dept-icon"><Icon size={19} /></span>
                          <span className="cp-dept-name">{name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3 — Semester */}
            {step === 3 && (
              <motion.div key="s3" className="cp-panel"
                custom={dir} variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.28, ease: "easeInOut" }}
              >
                <div className="cp-field-label">Current Semester</div>
                <p className="cp-field-hint">Select the semester you are currently in</p>
                {availableSemesters.length === 0 ? (
                  <>
                    <p className="cp-field-hint" style={{ marginTop: "0.5rem", color: "#a09cb8" }}>
                      No semesters configured for this department. Type your semester below.
                    </p>
                    <div className="cp-input-wrap" style={{ marginTop: "0.75rem" }}>
                      <svg className="cp-input-icon" viewBox="0 0 20 20" fill="none"
                        stroke="currentColor" strokeWidth="1.6">
                        <rect x="3" y="2" width="14" height="16" rx="2" />
                        <path d="M6 7h8M6 10h8M6 13h5" strokeLinecap="round" />
                      </svg>
                      <input
                        autoFocus
                        type="text"
                        className="cp-input"
                        placeholder="e.g. 4"
                        value={formData.semester}
                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                        onKeyDown={(e) => e.key === "Enter" && canAdvance() && go(4)}
                      />
                      {formData.semester.trim() && (
                        <span className="cp-input-check"><CheckMark /></span>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="cp-sem-grid">
                    {availableSemesters.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`cp-sem-pill${formData.semester === s ? " selected" : ""}`}
                        onClick={() => setFormData({ ...formData, semester: s })}
                      >
                        <span className="cp-sem-num">{s}</span>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 4 — Division */}
            {step === 4 && (
              <motion.div key="s4" className="cp-panel"
                custom={dir} variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.28, ease: "easeInOut" }}
              >
                <div className="cp-field-label">Division / Batch</div>
                <p className="cp-field-hint">Your class division or batch</p>
                {availableBatches.length === 0 ? (
                  <>
                    <p className="cp-field-hint" style={{ marginTop: "0.5rem", color: "#a09cb8" }}>
                      No batches configured for this department. Type your division below.
                    </p>
                    <div className="cp-input-wrap" style={{ marginTop: "0.75rem" }}>
                      <svg className="cp-input-icon" viewBox="0 0 20 20" fill="none"
                        stroke="currentColor" strokeWidth="1.6">
                        <path d="M17 20H3a1 1 0 01-1-1V7l4-4h11a1 1 0 011 1v15a1 1 0 01-1 1z"
                          strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M6 3v4H2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <input
                        autoFocus
                        type="text"
                        className="cp-input cp-input--center"
                        placeholder="A"
                        maxLength={10}
                        value={formData.division}
                        onChange={(e) =>
                          setFormData({ ...formData, division: e.target.value.toUpperCase() })
                        }
                        onKeyDown={(e) => e.key === "Enter" && canAdvance() && go(5)}
                      />
                      {formData.division.trim().length >= 1 && (
                        <span className="cp-input-check"><CheckMark /></span>
                      )}
                    </div>
                    <p className="cp-div-examples">
                      Examples:&nbsp; A &middot; B &middot; C1 &middot; D2
                    </p>
                  </>
                ) : (
                  <div className="cp-sem-grid">
                    {availableBatches.map((b) => (
                      <button
                        key={b}
                        type="button"
                        className={`cp-sem-pill${formData.division === b ? " selected" : ""}`}
                        onClick={() => setFormData({ ...formData, division: b })}
                      >
                        <span className="cp-sem-num">{b}</span>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 5 — Confirm */}
            {step === 5 && (
              <motion.div key="s5" className="cp-panel cp-panel--confirm"
                custom={dir} variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.28, ease: "easeInOut" }}
              >
                <div className="cp-confirm-icon">
                  <FiCheckCircle />
                </div>
                <div className="cp-field-label">Review Your Details</div>
                <p className="cp-field-hint">Confirm everything is correct before submitting</p>
                <div className="cp-summary">
                  {[
                    { Icon: FiHash,     label: "Register No.", val: formData.registerNumber },
                    { Icon: FiBookOpen, label: "Department",   val: formData.department     },
                    { Icon: FiCalendar, label: "Semester",     val: formData.semester       },
                    { Icon: FiGrid,     label: "Division",     val: formData.division       },
                  ].map(({ Icon, label, val }) => (
                    <div key={label} className="cp-summary-row">
                      <span className="cp-summary-icon"><Icon size={14} /></span>
                      <span className="cp-summary-label">{label}</span>
                      <span className="cp-summary-val">{val}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="cp-nav">
          {step > 1 && (
            <button className="cp-btn cp-btn--back" onClick={() => go(step - 1)}>
              <FiArrowLeft size={15} />
              Back
            </button>
          )}

          {step < totalSteps && (
            <button
              className="cp-btn cp-btn--next"
              disabled={!canAdvance()}
              onClick={() => go(step + 1)}
            >
              Continue
              <FiArrowRight size={15} />
            </button>
          )}

          {step === totalSteps && (
            <button
              className="cp-btn cp-btn--next"
              disabled={!canAdvance()}
              onClick={() => go(5)}
            >
              Review
              <FiArrowRight size={15} />
            </button>
          )}

          {step === 5 && (
            <button
              className={`cp-btn cp-btn--submit${loading ? " loading" : ""}`}
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? (
                <><span className="cp-spinner" /> Saving…</>
              ) : (
                <>Complete Profile</>
              )}
            </button>
          )}
        </div>

        {/* Footer count */}
        <p className="cp-counter">
          {step <= totalSteps ? `Step ${step} of ${totalSteps}` : "All steps complete"}
        </p>

      </div>
    </div>
  );
}
