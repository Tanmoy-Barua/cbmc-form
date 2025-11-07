import React, { useState } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY"
];

export default function FormPage() {
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    memberType: "", name: "", email: "",
    address: "", city: "", state: "", zip: "",
    agree: false,
    applicantSignature: "", applicantDate: "", applicantPrintName: "",
    recommender1: { signature: "", date: "", printName: "" },
    recommender2: { signature: "", date: "", printName: "" },
    secretary: { signature: "", date: "", printName: "" },
    president: { signature: "", date: "", printName: "" },
    effectiveDate: "", votingDate: "", electionDate: ""
  });

  const onChange = (e, group = null) => {
    const { name, value, type, checked } = e.target;
    if (group) {
      setForm(prev => ({ ...prev, [group]: { ...prev[group], [name]: value }}));
    } else {
      setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus("");

    if (!form.memberType || !form.name || !form.email) {
      setStatus("Please fill in all required fields.");
      return;
    }
    if (!form.agree) {
      setStatus("Please agree to the CBMC By Laws to continue.");
      document.getElementById("agree")?.focus();
      return;
    }

    const payload = {
      ...form,
      agree: true,
      created_at: serverTimestamp(),
      // guard nested objects
      recommender1: form.recommender1 || { signature:"", date:"", printName:"" },
      recommender2: form.recommender2 || { signature:"", date:"", printName:"" },
      secretary:    form.secretary    || { signature:"", date:"", printName:"" },
      president:    form.president    || { signature:"", date:"", printName:"" },
    };

    try {
      await addDoc(collection(db, "applications"), payload);
      setStatus("Saved to database ✓");
    } catch (err) {
      console.error(err);
      setStatus("Error saving to database.");
    }
  };

  return (
    <div className="container" style={{maxWidth: 850}}>
      <header className="text-center my-4">
        <h1 className="fw-bold mb-1">California Buddhist Meditation Center (CBMC)</h1>
        <h5 className="text-secondary mb-1">Los Angeles, CA</h5>
        <p className="text-secondary mb-0">Established: 3<sup>rd</sup> March 2018</p>
      </header>

      <form onSubmit={onSubmit} noValidate className="text-start">
        <hr />
        {/* Member Type */}
        <div className="mb-3">
          <label htmlFor="memberType" className="form-label fw-semibold">
            Type of Member <span className="text-danger">*</span>
          </label>
          <select id="memberType" name="memberType" className="form-select p-3"
                  value={form.memberType} onChange={onChange} required>
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
          <input id="name" name="name" className="form-control p-3" value={form.name}
                 onChange={onChange} placeholder="Ada Lovelace" required />
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label fw-semibold">
            Email <span className="text-danger">*</span>
          </label>
          <input id="email" name="email" type="email" className="form-control p-3"
                 value={form.email} onChange={onChange} placeholder="ada@example.com" required />
        </div>

        {/* Address */}
        <h5 className="mt-4 mb-3 text-secondary">Address</h5>
        <div className="mb-3">
          <label htmlFor="address" className="form-label fw-semibold">Street Address</label>
          <input id="address" name="address" className="form-control p-3"
                 value={form.address} onChange={onChange} placeholder="123 Main Street" />
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="city" className="form-label fw-semibold">City</label>
            <input id="city" name="city" className="form-control p-3"
                   value={form.city} onChange={onChange} />
          </div>
          <div className="col-md-3 mb-3">
            <label htmlFor="state" className="form-label fw-semibold">State</label>
            <select id="state" name="state" className="form-select p-3"
                    value={form.state} onChange={onChange}>
              <option value="">—</option>
              {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="col-md-3 mb-3">
            <label htmlFor="zip" className="form-label fw-semibold">ZIP</label>
            <input id="zip" name="zip" className="form-control p-3"
                   value={form.zip} onChange={onChange} />
          </div>
        </div>

        {/* Applicant Confirmation */}
        <h5 className="mt-5 mb-3 text-secondary">Applicant Confirmation</h5>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label fw-semibold">Signature</label>
            <input className="form-control p-3" name="applicantSignature"
                   value={form.applicantSignature} onChange={onChange} placeholder="Signature" />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold">Date</label>
            <input type="date" className="form-control p-3" name="applicantDate"
                   value={form.applicantDate} onChange={onChange} />
          </div>
          <div className="col-12">
            <label className="form-label fw-semibold">Print Name</label>
            <input className="form-control p-3" name="applicantPrintName"
                   value={form.applicantPrintName} onChange={onChange} placeholder="Print Name" />
          </div>
        </div>

        {/* Recommendation */}
        <h5 className="mt-5 mb-3 text-secondary">Recommendation of 2 (Two) Founder Members</h5>
        <div className="row">
          {[1,2].map(i => (
            <div key={i} className="col-md-6 mb-3">
              <label className="fw-semibold">Recommender {i}</label>
              <input className="form-control my-2" name="signature" placeholder="Signature"
                     value={form[`recommender${i}`].signature}
                     onChange={(e)=>onChange(e, `recommender${i}`)} />
              <input type="date" className="form-control my-2" name="date"
                     value={form[`recommender${i}`].date}
                     onChange={(e)=>onChange(e, `recommender${i}`)} />
              <input className="form-control my-2" name="printName" placeholder="Print Name"
                     value={form[`recommender${i}`].printName}
                     onChange={(e)=>onChange(e, `recommender${i}`)} />
            </div>
          ))}
        </div>

        {/* Executive Committee */}
        <h5 className="mt-4 mb-3 text-secondary">Approval of Executive Committee</h5>
        <div className="row">
          {["secretary","president"].map(role => (
            <div key={role} className="col-md-6 mb-3">
              <label className="fw-semibold text-capitalize">{role}</label>
              <input className="form-control my-2" name="signature" placeholder="Signature"
                     value={form[role].signature} onChange={(e)=>onChange(e, role)} />
              <input type="date" className="form-control my-2" name="date"
                     value={form[role].date} onChange={(e)=>onChange(e, role)} />
              <input className="form-control my-2" name="printName" placeholder="Print Name"
                     value={form[role].printName} onChange={(e)=>onChange(e, role)} />
            </div>
          ))}
        </div>

        {/* Dates */}
        <h5 className="mt-4 mb-3 text-secondary">Membership Dates</h5>
        <div className="mb-3">
          <label className="form-label fw-semibold">Membership Effective Date</label>
          <input type="date" name="effectiveDate" className="form-control p-3"
                 value={form.effectiveDate} onChange={onChange} />
        </div>
        <div className="mb-3">
          <label className="form-label fw-semibold">Voting Right Date (After 1 Year of Effective Date)</label>
          <input type="date" name="votingDate" className="form-control p-3"
                 value={form.votingDate} onChange={onChange} />
        </div>
        <div className="mb-3">
          <label className="form-label fw-semibold">Election Right Date (After 2 Years of Effective Date)</label>
          <input type="date" name="electionDate" className="form-control p-3"
                 value={form.electionDate} onChange={onChange} />
        </div>

        {/* Agreement */}
        <div className="form-check my-4">
          <input className="form-check-input" type="checkbox" id="agree" name="agree"
                 checked={form.agree} onChange={onChange} required />
          <label className="form-check-label" htmlFor="agree">
            I hereby apply for CBMC membership and agree to abide by the By Laws of the California Buddhist Meditation Center, Los Angeles, California.
          </label>
        </div>

        <div className="d-flex align-items-center gap-3">
          <button type="submit" className="btn btn-primary px-4">
            <i className="bi bi-send me-2"></i>Submit
          </button>
          <span className="text-secondary small">{status}</span>
        </div>
      </form>
    </div>
  );
}
