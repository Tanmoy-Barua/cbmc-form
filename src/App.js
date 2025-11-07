import React, { useState, useEffect } from "react";

/* ===== Firestore imports ===== */
import { db } from "./lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY"
];

export default function App() {
  /* =========================
     AUTO THEME BY LOCAL TIME
     Light: 07:00–18:59
     Dark : 19:00–06:59
  ==========================*/
  useEffect(() => {
    const applyTimeTheme = () => {
      const hour = new Date().getHours();
      const theme = hour >= 7 && hour <= 18 ? "light" : "dark";
      document.documentElement.setAttribute("data-bs-theme", theme);
    };
    applyTimeTheme();
    const timer = setInterval(applyTimeTheme, 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  // ===== FORM STATE =====
  const [form, setForm] = useState({
    memberType: "",
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    agree: false,
    applicantSignature: "",
    applicantDate: "",
    applicantPrintName: "",
    recommender1: { signature: "", date: "", printName: "" },
    recommender2: { signature: "", date: "", printName: "" },
    secretary: { signature: "", date: "", printName: "" },
    president: { signature: "", date: "", printName: "" },
    effectiveDate: "",
    votingDate: "",
    electionDate: ""
  });

  const [submitted, setSubmitted] = useState([]);
  const [status, setStatus] = useState("");

  const onChange = (e, group = null) => {
    const { name, value, type, checked } = e.target;
    if (group) {
      setForm(prev => ({ ...prev, [group]: { ...prev[group], [name]: value }}));
    } else {
      setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    }
  };

  /* ========= Firestore: live load ========= */
  useEffect(() => {
    const q = query(
      collection(db, "applications"),
      orderBy("created_at", "desc"),
      limit(50)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setSubmitted(rows);
      },
      (err) => {
        console.error(err);
        setStatus("Could not load live updates.");
      }
    );
    return () => unsub();
  }, []);

  /* ========= Firestore: submit (checkbox required) ========= */
  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus("");

    if (!form.memberType || !form.name || !form.email) {
      setStatus("Please fill in all required fields.");
      return;
    }

    // Require the agreement checkbox
    if (!form.agree) {
      setStatus("Please agree to the CBMC By Laws to continue.");
      document.getElementById("agree")?.focus();
      return;
    }

    const payload = {
      ...form,
      agree: true, // guaranteed by the check above
      recommender1: form.recommender1 || { signature: "", date: "", printName: "" },
      recommender2: form.recommender2 || { signature: "", date: "", printName: "" },
      secretary:    form.secretary    || { signature: "", date: "", printName: "" },
      president:    form.president    || { signature: "", date: "", printName: "" },
      created_at: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "applications"), payload);
      setStatus("Saved to database ✓"); // list auto-refreshes via onSnapshot
      // Optionally reset the form here if you want
      // setForm({ ...initialState });
    } catch (err) {
      console.error(err);
      setStatus("Error saving to database.");
    }
  };

  /* Helper: safely render Firestore Timestamp or ISO string */
  const formatCreatedAt = (value) => {
    if (!value) return "…";
    const d = value.toDate ? value.toDate() : new Date(value);
    return d.toLocaleString();
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-body text-body">
      <div className="container" style={{ maxWidth: "850px" }}>
        {/* Header */}
        <header className="mb-4 position-relative">
          <div className="d-flex justify-content-center align-items-center text-center">
            <div className="flex-grow-1">
              <h1 className="fw-bold mb-1">California Buddhist Meditation Center (CBMC)</h1>
              <h5 className="text-secondary mb-1">Los Angeles, CA</h5>
              <p className="text-secondary mb-0">
                Established: 3<sup>rd</sup> March 2018
              </p>
            </div>
          </div>
        </header>

        {/* FORM */}
        <form onSubmit={onSubmit} noValidate className="text-start">
          <hr />
          {/* Member Type */}
          <div className="mb-3">
            <label htmlFor="memberType" className="form-label fw-semibold">
              Type of Member <span className="text-danger">*</span>
            </label>
            <select
              id="memberType"
              name="memberType"
              className="form-select p-3"
              value={form.memberType}
              onChange={onChange}
              required
            >
              <option value="">Select...</option>
              <option value="founder">Founder Member</option>
              <option value="general">General Member</option>
              <option value="honorary">Honorary Member</option>
            </select>
          </div>

          {/* Name, Email */}
          <div className="mb-3">
            <label htmlFor="name" className="form-label fw-semibold">
              Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-control p-3"
              placeholder="Ada Lovelace"
              value={form.name}
              onChange={onChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-semibold">
              Email <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control p-3"
              placeholder="ada@example.com"
              value={form.email}
              onChange={onChange}
              required
            />
          </div>

          {/* Address */}
          <h5 className="mt-4 mb-3 text-secondary">Address</h5>
          <div className="mb-3">
            <label htmlFor="address" className="form-label fw-semibold">
              Street Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              className="form-control p-3"
              placeholder="123 Main Street"
              value={form.address}
              onChange={onChange}
            />
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="city" className="form-label fw-semibold">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                className="form-control p-3"
                value={form.city}
                onChange={onChange}
              />
            </div>
            <div className="col-md-3 mb-3">
              <label htmlFor="state" className="form-label fw-semibold">
                State
              </label>
              <select
                id="state"
                name="state"
                className="form-select p-3"
                value={form.state}
                onChange={onChange}
              >
                <option value="">—</option>
                {US_STATES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3 mb-3">
              <label htmlFor="zip" className="form-label fw-semibold">
                ZIP
              </label>
              <input
                type="text"
                id="zip"
                name="zip"
                className="form-control p-3"
                value={form.zip}
                onChange={onChange}
              />
            </div>
          </div>

          {/* Applicant Confirmation */}
          <h5 className="mt-5 mb-3 text-secondary">Applicant Confirmation</h5>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Signature</label>
              <input
                type="text"
                className="form-control p-3"
                name="applicantSignature"
                placeholder="Signature"
                value={form.applicantSignature}
                onChange={onChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Date</label>
              <input
                type="date"
                className="form-control p-3"
                name="applicantDate"
                value={form.applicantDate}
                onChange={onChange}
              />
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold">Print Name</label>
              <input
                type="text"
                className="form-control p-3"
                name="applicantPrintName"
                placeholder="Print Name"
                value={form.applicantPrintName}
                onChange={onChange}
              />
            </div>
          </div>

          {/* Recommendation Section */}
          <h5 className="mt-5 mb-3 text-secondary">
            Recommendation of 2 (Two) Founder Members
          </h5>
          <div className="row">
            {[1, 2].map((i) => (
              <div key={i} className="col-md-6 mb-3">
                <label className="fw-semibold">Recommender {i}</label>
                <input
                  type="text"
                  className="form-control my-2"
                  name="signature"
                  placeholder="Signature"
                  value={form[`recommender${i}`].signature}
                  onChange={(e) => onChange(e, `recommender${i}`)}
                />
                <input
                  type="date"
                  className="form-control my-2"
                  name="date"
                  value={form[`recommender${i}`].date}
                  onChange={(e) => onChange(e, `recommender${i}`)}
                />
                <input
                  type="text"
                  className="form-control my-2"
                  name="printName"
                  placeholder="Print Name"
                  value={form[`recommender${i}`].printName}
                  onChange={(e) => onChange(e, `recommender${i}`)}
                />
              </div>
            ))}
          </div>

          {/* Executive Committee */}
          <h5 className="mt-4 mb-3 text-secondary">
            Approval of Executive Committee
          </h5>
          <div className="row">
            {["secretary", "president"].map((role) => (
              <div key={role} className="col-md-6 mb-3">
                <label className="fw-semibold text-capitalize">{role}</label>
                <input
                  type="text"
                  className="form-control my-2"
                  name="signature"
                  placeholder="Signature"
                  value={form[role].signature}
                  onChange={(e) => onChange(e, role)}
                />
                <input
                  type="date"
                  className="form-control my-2"
                  name="date"
                  value={form[role].date}
                  onChange={(e) => onChange(e, role)}
                />
                <input
                  type="text"
                  className="form-control my-2"
                  name="printName"
                  placeholder="Print Name"
                  value={form[role].printName}
                  onChange={(e) => onChange(e, role)}
                />
              </div>
            ))}
          </div>

          {/* Dates Section */}
          <h5 className="mt-4 mb-3 text-secondary">Membership Dates</h5>
          <div className="mb-3">
            <label className="form-label fw-semibold">Membership Effective Date</label>
            <input
              type="date"
              name="effectiveDate"
              className="form-control p-3"
              value={form.effectiveDate}
              onChange={onChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              Voting Right Date (After 1 Year of Effective Date)
            </label>
            <input
              type="date"
              name="votingDate"
              className="form-control p-3"
              value={form.votingDate}
              onChange={onChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              Election Right Date (After 2 Years of Effective Date)
            </label>
            <input
              type="date"
              name="electionDate"
              className="form-control p-3"
              value={form.electionDate}
              onChange={onChange}
            />
          </div>

          {/* Agreement (required) */}
          <div className="form-check my-4">
            <input
              className="form-check-input"
              type="checkbox"
              id="agree"
              name="agree"
              checked={form.agree}
              onChange={onChange}
              required
            />
            <label className="form-check-label" htmlFor="agree">
              I hereby apply for CBMC membership and agree to abide by the By
              Laws of the California Buddhist Meditation Center, Los Angeles,
              California.
            </label>
          </div>

          <div className="d-flex align-items-center gap-3">
            <button type="submit" className="btn btn-primary px-4">
              <i className="bi bi-send me-2"></i>Submit
            </button>
            <span className="text-secondary small">{status}</span>
          </div>
        </form>

        {/* Submissions List */}
        <section className="mt-5 text-start">
          <h2 className="h5 mb-3 text-center">Latest Submissions</h2>
          {!submitted.length && (
            <p className="text-secondary text-center">No submissions yet.</p>
          )}
          <div className="vstack gap-2">
            {submitted.map((entry) => (
              <div key={entry.id} className="border rounded-3 p-3 bg-light-subtle">
                <div className="fw-semibold">
                  {entry.name}{" "}
                  <span className="text-secondary">&lt;{entry.email}&gt;</span>
                </div>
                {entry.memberType && (
                  <div className="text-secondary small">
                    Member Type: {entry.memberType}
                  </div>
                )}
                {(entry.address || entry.city) && (
                  <div className="text-secondary small mt-1">
                    {entry.address}, {entry.city} {entry.state} {entry.zip}
                  </div>
                )}
                {(entry.applicantSignature || entry.applicantPrintName) && (
                  <div className="text-secondary small mt-1">
                    Applicant: {entry.applicantPrintName || "N/A"} | Signature:{" "}
                    {entry.applicantSignature || "—"} | Date: {entry.applicantDate || "—"}
                  </div>
                )}
                <div className="text-secondary small mt-1">
                  Effective Date: {entry.effectiveDate || "N/A"} | Voting: {entry.votingDate || "N/A"} | Election: {entry.electionDate || "N/A"}
                </div>
                <div className="text-secondary small mt-1">
                  Recommenders: {entry.recommender1?.printName || "—"}, {entry.recommender2?.printName || "—"}
                </div>
                <div className="text-secondary small mt-1">
                  Approved by: Sec. {entry.secretary?.printName || "—"}, Pres. {entry.president?.printName || "—"}
                </div>
                <div className="text-secondary small mt-1">
                  Submitted: {formatCreatedAt(entry.created_at)}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
