import React, { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

export default function SubmissionsPage() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "applications"),
      orderBy("created_at", "desc"),
      limit(100)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setRows(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setStatus("");
      },
      (err) => {
        console.error(err);
        setStatus("Could not load submissions.");
      }
    );
    return () => unsub();
  }, []);

  const formatCreatedAt = (v) => {
    if (!v) return "…";
    const d = v.toDate ? v.toDate() : new Date(v);
    return d.toLocaleString();
  };

  return (
    <div className="container py-4" style={{maxWidth: 900}}>
      <h2 className="h4 text-center mb-4">Latest Submissions</h2>
      {status && <div className="alert alert-warning">{status}</div>}
      {!rows.length ? (
        <p className="text-secondary text-center">No submissions yet.</p>
      ) : (
        <div className="vstack gap-2">
          {rows.map((entry) => (
            <div key={entry.id} className="border rounded-3 p-3 bg-light-subtle">
              <div className="fw-semibold">
                {entry.name} <span className="text-secondary">&lt;{entry.email}&gt;</span>
              </div>
              {entry.memberType && (
                <div className="text-secondary small">Member Type: {entry.memberType}</div>
              )}
              {(entry.address || entry.city) && (
                <div className="text-secondary small mt-1">
                  {entry.address}, {entry.city} {entry.state} {entry.zip}
                </div>
              )}
              {(entry.applicantSignature || entry.applicantPrintName) && (
                <div className="text-secondary small mt-1">
                  Applicant: {entry.applicantPrintName || "N/A"} | Signature: {entry.applicantSignature || "—"} | Date: {entry.applicantDate || "—"}
                </div>
              )}
              <div className="text-secondary small mt-1">
                Effective: {entry.effectiveDate || "N/A"} | Voting: {entry.votingDate || "N/A"} | Election: {entry.electionDate || "N/A"}
              </div>
              <div className="text-secondary small mt-1">
                Recommenders: {entry?.recommender1?.printName || "—"}, {entry?.recommender2?.printName || "—"}
              </div>
              <div className="text-secondary small mt-1">
                Approved by: Sec. {entry?.secretary?.printName || "—"}, Pres. {entry?.president?.printName || "—"}
              </div>
              <div className="text-secondary small mt-1">Submitted: {formatCreatedAt(entry.created_at)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
