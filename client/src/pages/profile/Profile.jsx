import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Link } from "react-router-dom";
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

/* ─── Legal footer links ─── */
const LEGAL_LINKS = [
  { id: "privacy",  label: "Privacy Policy"        },
  { id: "terms",    label: "Terms & Conditions"    },
  { id: "customer", label: "Customer Service"      },
  { id: "legal",    label: "Legal & Privacy"       },
  { id: "refund",   label: "Refund & Cancellation" },
  { id: "fssai",    label: "FSSAI License"          },
];

const MODAL_CONTENT = {
  privacy: {
    title: "Privacy Policy",
    text: `Welcome to Cakefarm. The protection and security of your personal information is one of Cakefarm's top priorities. This Privacy Policy outlines our practices regarding the information collected from users of this website. Please note that our Privacy Policy is subject to change without prior notice, and we encourage you to review this page regularly.

Consent and Agreement
By accessing or using this website, you agree to accept the terms of this Privacy Policy as well as our Terms of Use. You expressly consent to our collection, storage, use, and disclosure of your personal information as described in this document. This policy applies to all users, whether you are simply browsing the website or making a transaction as a registered user.

Personal Information Collected
"Personal Information" refers to any data that identifies or can be used to identify, contact, or locate you. This includes, but is not limited to: your name, address, phone number, email address, financial profiles, and credit card information. By accepting this Privacy Policy, you authorize Cakefarm to collect, store, and use any information that you provide on our website.

Cookies
Cookies are small pieces of data saved by your browser onto your device. They are used to record various aspects of your visit and assist Cakefarm in providing you with an uninterrupted, seamless service. Cakefarm does not use cookies to save your Personal Information for outside use.

Children's Privacy
No services available on this website are directed towards children. Cakefarm does not knowingly collect Personal Information from children or intentionally sell its products to children.

Use and Sharing of Information
Cakefarm owns all the information collected via the website and its applications. We handle your data responsibly:

Service & Improvement: We use your information to fulfill orders, contact you regarding your purchases, monitor and improve website performance, and analyze visitor demographics and geographical locations.

Third-Party Partners: Some of your information may be shared with trusted third parties, such as courier companies, credit card processing companies, and vendors, strictly to enable them to perform their duties and fulfill your order requirements.

Security: We do not allow any unauthorized persons or organizations to use the information Cakefarm collects from you. However, Cakefarm is not responsible for any information collected, shared, or used by other third-party websites due to your own browser settings.

Legal Compliance: We reserve the right to share your personal information to comply with subpoenas, court orders, or other legal processes. Your Personal Information may be disclosed pursuant to these legal requirements without prior notice to you.

Aggregated Data: We may share collective, non-identifying information (such as overall demographics and website usage statistics) with sponsors, advertisers, or other third parties. When this type of data is shared, these parties do not have access to your specific Personal Information.

Policy Changes
By using this website, you signify your agreement to the terms of this Privacy Policy. Cakefarm reserves the right, at our sole discretion, to change, modify, add, or delete portions of this policy at any time.

Contact Us
If you have any questions or concerns about this Privacy Policy, please feel free to contact us through our website or write to us directly at orders@cakefarm.in.`,
  },
  terms: {
    title: "Terms & Conditions",
    text: `The following terms and conditions (the "Terms and Conditions") govern your use of this website or application provided to you by Cakefarm, and any content, features, or functionality made available from or through this website, including any subdomains thereof (the "Website"). The Website is made available by Cakefarm ("we," "us," or "our"). We may change these Terms and Conditions from time to time, at any time without notice to you, by posting such changes on the Website.

BY USING THE WEBSITE, YOU ACCEPT AND AGREE TO THESE TERMS AND CONDITIONS AS APPLIED TO YOUR USE OF THE WEBSITE. If you do not agree to these Terms and Conditions, you may not access or otherwise use the Website.

1. Proprietary Rights
As between you and us, we own, solely and exclusively, all rights, title, and interest in and to the Website. This includes all content (such as photographs, illustrations, graphics, video, copy, text, software, etc.), code, data, the look and feel, design, and organization of the Website, including but not limited to any copyrights, trademark rights, and other intellectual property. Your use of the Website does not grant you ownership of any content, code, data, or materials you may access on or through the Website.

2. Limited License & Prohibited Use
You may access and view the content on the Website on your computer or other device for your personal, non-commercial use only. Any commercial or promotional distribution, publishing, or exploitation of the Website, or any content or materials on the Website, is strictly prohibited unless you have received express prior written permission from Cakefarm. You may not download, post, display, publish, copy, reproduce, distribute, transmit, modify, perform, broadcast, transfer, create derivative works from, sell, or otherwise exploit any content available through the Website.

3. Trademarks
The trademarks, logos, service marks, and trade names (collectively the "Trademarks") displayed on the Website are registered and unregistered Trademarks of Cakefarm and others. They may not be used in connection with products and/or services that are not related to, associated with, or sponsored by Cakefarm in any manner that is likely to cause customer confusion.

4. User Information & Submitted Materials
In the course of your use of the Website, you may be asked to provide certain personalized information to us ("User Information"). Our policies regarding this data are set forth in our Privacy Policy.

Unless specifically requested, we do not solicit nor do we wish to receive any confidential, secret, or proprietary information or other material from you through the Website or by e-mail. Any creative works, ideas, suggestions, concepts, or other materials submitted to us ("Submitted Materials") will be deemed not to be confidential. By submitting materials to us, you grant Cakefarm a royalty-free, unrestricted, worldwide, perpetual, irrevocable, non-exclusive right and license to use, copy, reproduce, modify, adapt, publish, and distribute those materials for any purpose.

5. Prohibited User Conduct
While using the Website, you warrant and agree that you shall not:

Impersonate any person or entity or misrepresent your affiliation.

Engage in spidering, "screen scraping," "database scraping," or any automated means of obtaining lists of users or other information from the Website.

Use the Website in any manner that could interrupt, damage, disable, overburden, or impair the Website or its services.

Attempt to gain unauthorized access to our computer systems.

Use the Website in violation of our or any third party's intellectual property or other proprietary or legal rights.

6. Orders for Products and Services
We make certain products (such as cakes and bakery items) available to visitors of the Website. If you order any products, you represent and warrant that you are 18 years old or older. You agree to pay in full the prices for any purchases you make, including all applicable taxes, either by credit/debit card concurrent with your online order or by other payment means acceptable to us. If payment is not received by us from your payment provider, you agree to pay all amounts due upon demand.

7. Third-Party Websites
You may be able to link from the Website to third-party websites. You acknowledge and agree that Cakefarm has no responsibility for the information, content, products, services, or materials provided by linked sites. Links to third-party sites do not constitute an endorsement or sponsorship by us.

8. Copyright Infringement Claims
We respect the intellectual property rights of others. If you believe that your work has been copied in a way that constitutes copyright infringement, please forward your claim, a description of the copyrighted work, your contact information, and a statement of good faith to our team at:\nEmail: orders@cakefarm.in

9. Disclaimer of Warranties
THE WEBSITE, INCLUDING ALL SERVICES, FEATURES, CONTENT, AND MATERIALS, ARE PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES, INCLUDING ANY WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE WEBSITE WILL BE TIMELY, SECURE, UNINTERRUPTED, OR ERROR-FREE. ANY PRODUCTS OR SERVICES ORDERED VIA THE WEBSITE ARE PROVIDED "AS IS."

10. Limitation of Liability
IN NO EVENT SHALL CAKEFARM, ITS AFFILIATES, DIRECTORS, OFFICERS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY DIRECT, INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES ARISING FROM, OR DIRECTLY OR INDIRECTLY RELATED TO, THE USE OF, OR THE INABILITY TO USE, THE WEBSITE OR ITS CONTENT, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. IN NO EVENT SHALL OUR TOTAL AGGREGATE LIABILITY TO YOU FOR ALL DAMAGES, LOSSES, AND CAUSES OF ACTION EXCEED THE AMOUNT PAID BY YOU TO US FOR YOUR PURCHASE OF PRODUCTS VIA THE WEBSITE.

11. Applicable Laws and Miscellaneous
We control and operate the Website from our offices in Kerala, India. We do not represent that materials on the Website are appropriate or available for use in other locations. These Terms and Conditions shall be governed by the laws of Kerala, India. You agree that any cause of action that may arise under these Terms and Conditions shall be commenced and heard in the appropriate courts located within Kerala, India.

12. Changes and Termination
We reserve the right, at our sole discretion, to change, modify, add, or remove any portion of these Terms and Conditions at any time. Your continued use of the Website after any changes are posted will be considered acceptance of those changes. We may also terminate, change, suspend, or discontinue any aspect of the Website or restrict your access at any time without notice or liability.`,
  },
  customer: {
    title: "Customer Service",
    text: `1. Cancellation & Refund Policy

Cancellation Window: You may cancel your order up to 24 hours before the scheduled delivery or event time for a partial refund.

Late Cancellations: Cancellations made within 24 hours of the scheduled time, or after preparation of your order has already started, may not be eligible for a refund.

Custom Orders: Custom cakes or bulk orders may require a non-refundable advance payment.

Refund Processing: If eligible, refunds will be processed to your original payment method within 7 business days.

How to Cancel: To request a cancellation, please contact us at infocakefarmtcr@gmail.com or call us at +91 80899 89966.

2. Shipping & Delivery Policy

Delivery Area: We provide delivery across Thrissur and nearby areas.

Time Slots: Deliveries are made according to the time slot selected during your booking.

Event Setup: Large orders or event catering may include on-site setup and service (if agreed upon in advance).

Receiving Orders: Please ensure someone is present to receive the order at the scheduled delivery time to maintain the quality and freshness of our baked goods.

Delays: We will promptly notify you in case of any unexpected delays due to traffic, weather, or other unforeseen issues.

3. Customer Support
Feel free to reach out to us for any inquiries, orders, or collaborations. Our team at Cake Farm is always happy to assist you and resolve any issues as quickly and fairly as possible. We are committed to providing excellent customer service and ensuring your experience with us is delightful. 😊

You can visit us at our store or contact us via phone or email using the details below:

Contact Us

Address: Cake Farm, Palakkad Road, Kizhakkumpattukara, Thrissur, Kerala - 680005, India

Email: infocakefarmtcr@gmail.com

Phone (Mobile): +91 80899 89966 / +91 90377 21734

Phone (Landline): +91 487 2421242`,
  },
  legal: {
    title: "Legal & Privacy",
    text: `Last updated: February 24, 2026

1. Legal Disclaimer
Cakefarm provides bakery and cake delivery services subject to availability, location, and agreement. We reserve the right to modify or cancel services without prior notice in case of unforeseen circumstances, including but not limited to weather, traffic, or supply issues.

All content on this website is for informational purposes only and does not constitute a legally binding offer unless explicitly stated. Cakefarm is not responsible for errors or omissions on the website.

2. Limitation of Liability
While we strive to provide accurate and timely service, Cakefarm is not liable for any direct, indirect, or incidental damages resulting from the use of our website or services. This includes, but is not limited to, late deliveries, service interruptions, or technical failures.

3. Intellectual Property
All text, images, graphics, and branding on this website are the intellectual property of Cakefarm and may not be reused or reproduced without express written permission.

4. Privacy Commitment
Your privacy is important to us. We collect only the information necessary to process your orders and improve our service. Personal details such as your name, address, and contact number are stored securely and are not shared with third parties, except as strictly needed to fulfill your request (such as providing your address to our delivery personnel).

5. Data Use

We may use anonymized data to analyze and improve our services.

Cookies may be used for site functionality and to enhance your browsing experience. You can disable them at any time via your browser settings.

We never sell your personal data to external parties.

6. Legal Jurisdiction
All disputes are subject to the exclusive jurisdiction of the courts in Thrissur, Kerala.

7. Contact Information
If you have any legal or privacy-related concerns, please reach out to us at:

Email: infocakefarmtcr@gmail.com

Phone: +91 80899 89966 / +91 487 2421242

Address: Cake Farm, Palakkad Road, Kizhakkumpattukara, Thrissur, Kerala - 680005, India`,
  },
  refund: {
    title: "Refund & Cancellation Policy",
    text: `Order Cancellations
At Cake Farm, we understand that plans can change. You may cancel your order up to 24 hours before your scheduled delivery or event time to receive a partial or full refund, depending on the nature of the order.

To request a cancellation, please immediately contact our support team at infocakefarmtcr@gmail.com or call us at +91 80899 89966.

Late Cancellations & Non-Refundable Items
Because our cakes and bakery items are made fresh to order, cancellations made within 24 hours of the scheduled time, or after the preparation of your order has already begun, are generally not eligible for a refund.

Additionally, custom-designed cakes, large event catering, or bulk orders may require a non-refundable advance payment to cover the specialized ingredients and preparation time.

Refund Processing
If your cancellation is eligible for a refund, the amount will be processed and credited back to your original payment method within 7 business days. Please note that your bank or credit card company may take additional time to officially post the refund to your account.

Quality Guarantee
We take immense pride in our baking. If you receive an order that is incorrect, damaged, or falls below our quality standards, please contact us within 2 hours of delivery with a photo of the item. We will work with you to provide a suitable resolution, which may include a replacement or a refund.`,
  },
  fssai: {
    title: "FSSAI License & Food Safety",
    pdfUrl: "/fssai-license.pdf",
    text: `We are committed to the highest standards of food safety and hygiene. Cake Farm operates under the official registration of our parent company, ensuring that all our bakery products, sweets, and savouries meet stringent quality regulations.

License Details

License Number: 11326008000035

Registered Office Name: MARIYAS AGRO FOOD PRODUCTS

Registered Address: 7/250, 250 A, THAMARIYUR BUILDING, KOLAZHY P O, Thrissur, Kerala-680010

Authorized Premises Address: 7/250, 250 A, THAMARIYUR BUILDING, KOLAZHY P O, Thrissur Circle, Thrissur, Kerala-680010

Category of License: State License

Kind of Business: Manufacturer - General Manufacturing and Trade/Retail - Retailer

License Valid Upto: 11-01-2027

Approved Food Categories
07 — Bakery products
18 — Indian Sweets and Indian Snacks & Savouries products
15 — Ready-to-eat savouries

This license is granted under and is subject to the provisions of the FSS Act, 2006.`,
  },
};

function renderModalContent(text) {
  return text.split(/\n\n+/).map((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return null;
    const lines = trimmed.split("\n").map((l) => l.trim()).filter(Boolean);

    // "Key: Value" list item (e.g. "Service & Improvement: ...")
    if (lines.length === 1) {
      const m = trimmed.match(/^([^:\n]{3,40}): (.+)/s);
      if (m) {
        return (
          <div className="pl-modal__list-item" key={i}>
            <strong>{m[1]}:</strong> {m[2]}
          </div>
        );
      }
    }

    // Section heading + paragraph
    const firstIsHeading = lines[0].length < 60 && !/[.,;:"]/.test(lines[0]);
    if (firstIsHeading && lines.length > 1) {
      return (
        <React.Fragment key={i}>
          <h3 className="pl-modal__section-title">{lines[0]}</h3>
          <p className="pl-modal__para">{lines.slice(1).join(" ")}</p>
        </React.Fragment>
      );
    }
    if (firstIsHeading && lines.length === 1) {
      return <h3 className="pl-modal__section-title" key={i}>{lines[0]}</h3>;
    }

    return <p className="pl-modal__para" key={i}>{trimmed}</p>;
  });
}

/* Named exports so LegalPage.jsx can reuse the same content & renderer */
export { MODAL_CONTENT, renderModalContent };

function LegalModal({ content, id, onClose }) {
  return ReactDOM.createPortal(
    <div className="pl-overlay" onClick={onClose}>
      <div className="pl-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pl-modal__header">
          <h2 className="pl-modal__title">{content.title}</h2>
          <div className="pl-modal__header-actions">
            <Link
              to={`/legal/${id}`}
              className="pl-modal__expand"
              onClick={onClose}
              title="View full page"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6m0 0v6m0-6L10 14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <button className="pl-modal__close" onClick={onClose} aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
        <div className="pl-modal__body">
          {renderModalContent(content.text)}
          {content.pdfUrl && (
            <div className="pl-modal__pdf-section">
              <h3 className="pl-modal__section-title">Official License Document</h3>
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
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

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
  const [toast,       setToast]       = useState(null);
  const [activeModal, setActiveModal] = useState(null);

  // Close legal modal on Escape
  useEffect(() => {
    if (!activeModal) return;
    const onKey = (e) => { if (e.key === "Escape") setActiveModal(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeModal]);

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

        {/* ─── Legal footer links ─── */}
        <div className="profile-links">
          {LEGAL_LINKS.map((link) => (
            <button
              key={link.id}
              className="profile-link-btn"
              onClick={() => setActiveModal(link.id)}
            >
              {link.label}
            </button>
          ))}
        </div>

      </div>

      {/* ─── Legal modal ─── */}
      {activeModal && (
        <LegalModal
          content={MODAL_CONTENT[activeModal]}
          id={activeModal}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}

