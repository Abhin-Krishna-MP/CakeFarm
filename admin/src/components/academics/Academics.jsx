import React, { useEffect, useState } from "react";
import "./academics.scss";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../../features/academics/academicsAction";
import { MdDeleteOutline } from "../../constants";

export default function Academics() {
  const dispatch = useDispatch();
  const token = useSelector((s) => s.auth.token);
  const { departments, isLoading } = useSelector((s) => s.academics);

  const [selectedId, setSelectedId] = useState(null);
  const [newDeptName, setNewDeptName] = useState("");
  const [showAddDept, setShowAddDept] = useState(false);

  // items input state
  const [newSemester, setNewSemester] = useState("");
  const [newBatch, setNewBatch] = useState("");

  useEffect(() => {
    dispatch(fetchDepartments(token));
  }, [dispatch, token]);

  const selected = departments?.find((d) => d._id === selectedId) || null;

  /* ── Department CRUD ── */
  const handleAddDept = () => {
    if (!newDeptName.trim()) return;
    dispatch(createDepartment(token, newDeptName.trim()));
    setNewDeptName("");
    setShowAddDept(false);
  };

  const handleDeleteDept = (id) => {
    if (!window.confirm("Delete this department? This cannot be undone.")) return;
    dispatch(deleteDepartment(token, id));
    if (selectedId === id) setSelectedId(null);
  };

  /* ── Semester helpers ── */
  const handleAddSemester = () => {
    if (!newSemester.trim() || !selected) return;
    if (selected.semesters.includes(newSemester.trim())) return;
    dispatch(updateDepartment(token, selected._id, {
      semesters: [...selected.semesters, newSemester.trim()],
    }));
    setNewSemester("");
  };

  const handleDeleteSemester = (sem) => {
    if (!selected) return;
    dispatch(updateDepartment(token, selected._id, {
      semesters: selected.semesters.filter((s) => s !== sem),
    }));
  };

  /* ── Batch helpers ── */
  const handleAddBatch = () => {
    if (!newBatch.trim() || !selected) return;
    if (selected.batches.includes(newBatch.trim())) return;
    dispatch(updateDepartment(token, selected._id, {
      batches: [...selected.batches, newBatch.trim()],
    }));
    setNewBatch("");
  };

  const handleDeleteBatch = (batch) => {
    if (!selected) return;
    dispatch(updateDepartment(token, selected._id, {
      batches: selected.batches.filter((b) => b !== batch),
    }));
  };

  return (
    <div className="academics">
      <div className="academics-wrapper">
        {/* ── LEFT: Department list ── */}
        <div className="dept-panel">
          <div className="dept-panel-head">
            <p className="panel-title">Departments</p>
            <button
              className="add-btn"
              onClick={() => setShowAddDept((v) => !v)}
            >
              + Add
            </button>
          </div>

          {showAddDept && (
            <div className="inline-add">
              <input
                type="text"
                placeholder="Department name"
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddDept()}
                autoFocus
              />
              <button className="confirm-btn" onClick={handleAddDept}>
                Add
              </button>
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowAddDept(false);
                  setNewDeptName("");
                }}
              >
                ✕
              </button>
            </div>
          )}

          {isLoading && <p className="loading-text">Loading…</p>}

          <ul className="dept-list">
            {(departments || []).map((dept) => (
              <li
                key={dept._id}
                className={`dept-item${selectedId === dept._id ? " active" : ""}`}
              >
                <span
                  className="dept-name"
                  onClick={() => setSelectedId(dept._id)}
                >
                  {dept.name}
                </span>
                <button
                  className="delete-dept-btn"
                  onClick={() => handleDeleteDept(dept._id)}
                  title="Delete department"
                >
                  <MdDeleteOutline />
                </button>
              </li>
            ))}
            {!isLoading && (!departments || departments.length === 0) && (
              <p className="empty-text">No departments yet. Add one to get started.</p>
            )}
          </ul>
        </div>

        {/* ── RIGHT: Department details ── */}
        <div className="detail-panel">
          {!selected ? (
            <div className="no-selection">
              <span>👆</span>
              <p>Select a department to manage its semesters and batches.</p>
            </div>
          ) : (
            <>
              <div className="detail-head">
                <p className="detail-dept-name">{selected.name}</p>
              </div>

              {/* Semesters */}
              <div className="section-card">
                <p className="section-title">Semesters</p>
                <div className="tag-list">
                  {selected.semesters.map((sem) => (
                    <span className="tag" key={sem}>
                      {sem}
                      <button
                        className="tag-del"
                        onClick={() => handleDeleteSemester(sem)}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  {selected.semesters.length === 0 && (
                    <span className="empty-tag">No semesters added yet.</span>
                  )}
                </div>
                <div className="inline-add">
                  <input
                    type="text"
                    placeholder="e.g. Semester 1"
                    value={newSemester}
                    onChange={(e) => setNewSemester(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddSemester()}
                  />
                  <button className="confirm-btn" onClick={handleAddSemester}>
                    Add
                  </button>
                </div>
              </div>

              {/* Batches / Divisions */}
              <div className="section-card">
                <p className="section-title">Batches / Divisions</p>
                <div className="tag-list">
                  {selected.batches.map((batch) => (
                    <span className="tag" key={batch}>
                      {batch}
                      <button
                        className="tag-del"
                        onClick={() => handleDeleteBatch(batch)}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  {selected.batches.length === 0 && (
                    <span className="empty-tag">No batches added yet.</span>
                  )}
                </div>
                <div className="inline-add">
                  <input
                    type="text"
                    placeholder="e.g. A  or  2024-28"
                    value={newBatch}
                    onChange={(e) => setNewBatch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddBatch()}
                  />
                  <button className="confirm-btn" onClick={handleAddBatch}>
                    Add
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
