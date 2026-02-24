import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MODAL_CONTENT, renderModalContent } from "../profile/Profile";
import "./legal.scss";

export default function LegalPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const content  = MODAL_CONTENT[id];

  if (!content) {
    return (
      <div className="lp-error">
        <p>This page doesn't exist.</p>
        <button className="lp-back-btn" onClick={() => navigate(-1)}>
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="lp-page">
      {/* ── Top bar ── */}
      <div className="lp-topbar">
        <button className="lp-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            width="18"
            height="18"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
      </div>

      {/* ── Content ── */}
      <div className="lp-content">
        <h1 className="lp-title">{content.title}</h1>
        {/* Reuse the same content renderer + class names from the modal */}
        <div className="pl-modal__body lp-body">
          {renderModalContent(content.text)}
        </div>
      </div>
    </div>
  );
}
