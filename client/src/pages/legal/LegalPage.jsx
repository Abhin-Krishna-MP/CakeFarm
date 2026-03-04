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
          {content.pdfUrl && (
            <div className="lp-pdf-section">
              <h3 className="pl-modal__section-title lp-pdf-title">Official License Document</h3>
              <a
                href={content.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pl-modal__pdf-card"
              >
                <div className="pl-modal__pdf-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="16" y1="13" x2="8" y2="13" strokeLinecap="round"/>
                    <line x1="16" y1="17" x2="8" y2="17" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="pl-modal__pdf-info">
                  <span className="pl-modal__pdf-name">FSSAI License Certificate</span>
                  <span className="pl-modal__pdf-desc">State License · Valid until 11-01-2027</span>
                </div>
                <span className="pl-modal__pdf-btn">View ↗</span>
              </a>
              <div className="lp-pdf-embed-wrap">
                <iframe
                  src={content.pdfUrl}
                  className="lp-pdf-embed"
                  title="FSSAI License Certificate"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
