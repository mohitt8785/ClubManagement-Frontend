import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./EntryForm.css";

const API_URL = "http://localhost:5000/api/entries";

const initialState = {
  name: "", 
  surname: "", 
  contactNo: "", 
  email: "",
  dob: "", 
  entryTime: "", 
  reffBy: "", 
  refMemberNo: "",
  paymentMode: "UPI", 
  dsAmount: "", 
  rsAmount: "", 
  totalAmount: "",
  withCover: "", 
  withoutCover: "", 
  category: "Normal",
  livePhoto: null,    // Client live photo
  idFront: null,      // ID proof front
  idBack: null,       // ID proof back 
  remarks: "", 
  tableNo: "",
};

export default function EntryForm({ onEntryAdded }) {
  const [form, setForm] = useState(initialState);
  const [livePhotoPreview, setLivePhotoPreview] = useState(null);
  const [idFrontPreview, setIdFrontPreview] = useState(null);
  const [idBackPreview, setIdBackPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [srNo, setSrNo] = useState(null);


  // Webcam states
  const [showWebcam, setShowWebcam] = useState(null); // 'live', 'idFront', 'idBack'
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleAmountChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    const ds = parseFloat(updated.dsAmount) || 0;
    const rs = parseFloat(updated.rsAmount) || 0;
    updated.totalAmount = (ds + rs).toString();
    setForm(updated);
  };

  // ✅ Start Webcam
  const startWebcam = async (type) => {
    console.log("📹 Starting webcam for:", type);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: type === 'live' ? 'user' : 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      console.log("✅ Webcam stream obtained successfully");
      setStream(mediaStream);
      setShowWebcam(type);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          console.log("✅ Video stream attached to video element");
        }
      }, 100);
    } catch (err) {
      console.error('❌ Camera error:', err);
      alert('Camera access denied or not available. Please allow camera permissions.');
    }
  };

  // ✅ Stop Webcam
  const stopWebcam = () => {
    console.log("⏹️ Stopping webcam...");
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      console.log("✅ Webcam stopped");
    }
    setShowWebcam(null);
  };

  // ✅ Capture Photo (Passport Size)
  const capturePhoto = () => {
    if (!videoRef.current) {
      console.error("❌ Video ref not available");
      return;
    }

    console.log("📸 Capturing photo for:", showWebcam);
    const canvas = document.createElement('canvas');
    const video = videoRef.current;

    // Passport size: 35mm x 45mm
    const passportWidth = 350;
    const passportHeight = 450;

    canvas.width = passportWidth;
    canvas.height = passportHeight;
    const ctx = canvas.getContext('2d');

    // Calculate scaling
    const scale = Math.min(passportWidth / video.videoWidth, passportHeight / video.videoHeight);
    const scaledWidth = video.videoWidth * scale;
    const scaledHeight = video.videoHeight * scale;
    const x = (passportWidth - scaledWidth) / 2;
    const y = (passportHeight - scaledHeight) / 2;

    console.log("🎨 Canvas dimensions:", passportWidth, "x", passportHeight);
    console.log("🎨 Video scaled to:", scaledWidth, "x", scaledHeight);

    // Black background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, passportWidth, passportHeight);
    ctx.drawImage(video, x, y, scaledWidth, scaledHeight);

    canvas.toBlob((blob) => {
      const file = new File([blob], `${showWebcam}_photo.jpg`, { type: 'image/jpeg' });
      console.log("✅ Photo captured:", file.name, file.size, "bytes");

      if (showWebcam === 'live') {
        setForm(prev => ({ ...prev, livePhoto: file }));
        setLivePhotoPreview(URL.createObjectURL(file));
        console.log("✅ Live photo saved to form");
      } else if (showWebcam === 'idFront') {
        setForm(prev => ({ ...prev, idFront: file }));
        setIdFrontPreview(URL.createObjectURL(file));
        console.log("✅ ID Front saved to form");
      } else if (showWebcam === 'idBack') {
        setForm(prev => ({ ...prev, idBack: file }));
        setIdBackPreview(URL.createObjectURL(file));
        console.log("✅ ID Back saved to form");
      }

      stopWebcam();
    }, 'image/jpeg', 0.9);
  };

  const removePhoto = (type) => {
    if (type === 'live') {
      setForm(prev => ({ ...prev, livePhoto: null }));
      setLivePhotoPreview(null);
    } else if (type === 'idFront') {
      setForm(prev => ({ ...prev, idFront: null }));
      setIdFrontPreview(null);
    } else if (type === 'idBack') {
      setForm(prev => ({ ...prev, idBack: null }));
      setIdBackPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("📤 Form submission started...");

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const numericFields = new Set(["dsAmount", "rsAmount", "totalAmount", "withCover", "withoutCover"]);
      const formData = new FormData();

      console.log("📋 Form data before processing:", form);

      Object.keys(form).forEach(key => {
        if (key === "livePhoto" && form[key]) {
          console.log("📸 Adding livePhoto:", form[key].name, form[key].size, "bytes");
          formData.append("livePhoto", form[key]);
        } else if (key === "idFront" && form[key]) {
          console.log("🪪 Adding idFront:", form[key].name, form[key].size, "bytes");
          formData.append("idFront", form[key]);
        } else if (key === "idBack" && form[key]) {
          console.log("🪪 Adding idBack:", form[key].name, form[key].size, "bytes");
          formData.append("idBack", form[key]);
        } else if (numericFields.has(key)) {
          formData.append(key, form[key] === "" ? "0" : form[key]);
        } else {
          formData.append(key, form[key]);
        }
      });

      console.log("🌐 Sending POST request to:", API_URL);

      const res = await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      console.log("✅ Server response:", res.data);

      if (res.data.success) {
        console.log("🎉 Entry created successfully! SR No:", res.data.data.srNo);
        setSrNo(res.data.data.srNo);
        setMessage({ type: "success", text: res.data.message });
        setForm(initialState);
        setLivePhotoPreview(null);
        setIdFrontPreview(null);
        setIdBackPreview(null);

        console.log("📞 Calling onEntryAdded callback...");
        if (onEntryAdded) onEntryAdded();
      }
    } catch (error) {
      console.error("❌ Form submission error:", error);
      console.error("❌ Error response:", error.response?.data);

      const data = error.response?.data;
      const fieldErrors = data?.errors;
      const errorMsg = fieldErrors?.length
        ? `${data.message}: ${fieldErrors.map(e => `${e.field} — ${e.message}`).join(", ")}`
        : data?.message || "Server error";

      console.error("❌ Error message shown to user:", errorMsg);
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setLoading(false);
      console.log("📤 Form submission completed");
    }
  };

  const handleReset = () => {
    setForm(initialState);
    setLivePhotoPreview(null);
    setIdFrontPreview(null);
    setIdBackPreview(null);
    setMessage({ type: "", text: "" });
    setSrNo(null);
    stopWebcam();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="entry-form-wrapper">
      <div className="form-header">
        <div className="members-badge">★ MEMBERS ONLY</div>
        <h1 className="form-title">Club Entry Form</h1>
        <div className="title-line" />
      </div>

      <div className="form-container">
        <div className="sr-row">
          <label className="sr-label">SR. NO.</label>
          <div className="sr-display">{srNo || "—"}</div>
          <div className="sr-auto">Auto-Generated On Save</div>
        </div>

        {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">

            {/* ══ LEFT COLUMN ══ */}
            <div className="form-grid-col">

              <Section number="1" title="Personal Information">
                <div className="form-row">
                  <Input label="Name" name="name" value={form.name} onChange={handleChange} placeholder="First Name" required />
                  <Input label="Surname" name="surname" value={form.surname} onChange={handleChange} placeholder="Last Name" required />
                </div>
              </Section>

              <Section number="2" title="Contact Details">
                <div className="form-row">
                  <Input label="Contact No." name="contactNo" value={form.contactNo} onChange={handleChange} placeholder="+91 00000 00000" required maxLength={10} />
                  <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="example@email.com" />
                </div>
                <div className="form-row" style={{ marginTop: 0 }}>
                  <Input label="Date of Birth" name="dob" type="date" value={form.dob} onChange={handleChange} />
                  <Input label="Entry Time" name="entryTime" type="time" value={form.entryTime} onChange={handleChange} required />
                </div>
              </Section>

              <Section number="3" title="Reference">
                <div className="form-row">
                  <Input label="Referred By" name="reffBy" value={form.reffBy} onChange={handleChange} placeholder="Referrer Name" />
                  <Input label="Ref. Member No." name="refMemberNo" value={form.refMemberNo} onChange={handleChange} placeholder="Member ID" />
                </div>
              </Section>

              <Section number="7" title="Remarks">
                <div className="input-group">
                  <label className="input-label">Notes / Special Instructions</label>
                  <textarea name="remarks" value={form.remarks} onChange={handleChange} placeholder="Enter any remarks or special instructions..." className="textarea-input" />
                </div>
              </Section>

            </div>

            {/* ══ RIGHT COLUMN ══ */}
            <div className="form-grid-col">

              <Section number="5" title="Payment">
                <div className="payment-methods">
                  <PaymentButton icon="📱" label="UPI" active={form.paymentMode === "UPI"} onClick={() => setForm({ ...form, paymentMode: "UPI" })} />
                  <PaymentButton icon="💵" label="Cash" active={form.paymentMode === "Cash"} onClick={() => setForm({ ...form, paymentMode: "Cash" })} />
                  <PaymentButton icon="💳" label="Card" active={form.paymentMode === "CC"} onClick={() => setForm({ ...form, paymentMode: "CC" })} />
                </div>

                <div className="amount-grid">
                  <AmountInput label="DS Amount" name="dsAmount" value={form.dsAmount} onChange={handleAmountChange} />
                  <AmountInput label="RS Amount" name="rsAmount" value={form.rsAmount} onChange={handleAmountChange} />
                  <AmountInput label="Total" name="totalAmount" value={form.totalAmount} readOnly highlight />
                </div>

                <div className="cover-row">
                  <AmountInput label="With Cover" name="withCover" value={form.withCover} onChange={handleChange} />
                  <AmountInput label="Without Cover" name="withoutCover" value={form.withoutCover} onChange={handleChange} />
                </div>
              </Section>

              <Section number="6" title="Member Category & Photos">
                <div className="category-buttons">
                  <CategoryButton label="Normal" active={form.category === "Normal"} onClick={() => setForm({ ...form, category: "Normal" })} color="normal" />
                  <CategoryButton label="VIP" active={form.category === "VIP"} onClick={() => setForm({ ...form, category: "VIP" })} color="vip" />
                  <CategoryButton label="VVIP" active={form.category === "VVIP"} onClick={() => setForm({ ...form, category: "VVIP" })} color="vvip" />
                </div>

                {/* 📸 CLIENT LIVE PHOTO */}
                <div className="photo-capture-item">
                  <label className="photo-capture-label">
                    <span className="photo-icon">📸</span>
                    Client Live Photo (Passport Size)
                  </label>
                  {livePhotoPreview ? (
                    <div className="photo-preview-box">
                      <img src={livePhotoPreview} alt="Live" className="preview-img" />
                      <button type="button" onClick={() => removePhoto('live')} className="remove-btn">✕ Remove</button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => startWebcam('live')} className="camera-capture-btn">
                      📹 Open Camera
                    </button>
                  )}
                </div>

                {/* 🪪 ID PROOF (Front & Back) */}
                <div className="photo-capture-item">
                  <label className="photo-capture-label">
                    <span className="photo-icon">🪪</span>
                    ID Proof (Aadhar / PAN Card)
                  </label>

                  {/* ID Front */}
                  <div className="id-card-row">
                    <label className="id-side-label">Front Side</label>
                    {idFrontPreview ? (
                      <div className="photo-preview-box">
                        <img src={idFrontPreview} alt="ID Front" className="preview-img-id" />
                        <button type="button" onClick={() => removePhoto('idFront')} className="remove-btn-small">✕</button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => startWebcam('idFront')} className="camera-capture-btn-small">
                        📷 Capture Front
                      </button>
                    )}
                  </div>

                  {/* ID Back */}
                  <div className="id-card-row">
                    <label className="id-side-label">Back Side</label>
                    {idBackPreview ? (
                      <div className="photo-preview-box">
                        <img src={idBackPreview} alt="ID Back" className="preview-img-id" />
                        <button type="button" onClick={() => removePhoto('idBack')} className="remove-btn-small">✕</button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => startWebcam('idBack')} className="camera-capture-btn-small">
                        📷 Capture Back
                      </button>
                    )}
                  </div>
                </div>

                {/* <div className="extra-options" style={{ marginTop: 12 }}>
                  <label className="checkbox-option">
                    <input type="checkbox" name="additional" checked={form.additional} onChange={handleChange} />
                    <span>➕ Additional (ADDi)</span>
                  </label>
                </div> */}
              </Section>

              <Section number="8" title="Table Assignment">
                <div style={{ maxWidth: 160 }}>
                  <Input label="Table No." name="tableNo" type="number" value={form.tableNo} onChange={handleChange} placeholder="e.g. 12" min="1" required />
                </div>
              </Section>

            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleReset} className="btn-secondary">Reset</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Saving…" : "Save Entry ★"}
            </button>
          </div>
        </form>
      </div>

      <div className="form-footer">Club Entry Management System · ★</div>

      {/* 📹 CAMERA MODAL */}
      {showWebcam && (
        <div className="webcam-modal-overlay" onClick={stopWebcam}>
          <div className="webcam-modal" onClick={(e) => e.stopPropagation()}>
            <div className="webcam-header">
              <h3>📸 {showWebcam === 'live' ? 'Client Live Photo' : showWebcam === 'idFront' ? 'ID Front Side' : 'ID Back Side'}</h3>
              <button onClick={stopWebcam} className="webcam-close">✕</button>
            </div>
            <div className="webcam-body">
              <video ref={videoRef} autoPlay playsInline className="webcam-video" />
            </div>
            <div className="webcam-footer">
              <button onClick={stopWebcam} className="btn-cancel">Cancel</button>
              <button onClick={capturePhoto} className="btn-capture">📷 Capture Photo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Components
function Section({ number, title, children }) {
  return (
    <div className="form-section">
      <div className="section-header">
        <span className="section-number">{number}</span>
        <span className="section-title">{title}</span>
      </div>
      {children}
    </div>
  );
}

function Input({ label, required, ...props }) {
  return (
    <div className="input-group">
      <label className="input-label">{label} {required && <span className="required">*</span>}</label>
      <input className="text-input" {...props} />
    </div>
  );
}

function AmountInput({ label, highlight, ...props }) {
  return (
    <div className="amount-box">
      <label className="amount-label">{label}</label>
      <input className={`amount-value${highlight ? " highlight" : ""}`} placeholder="₹ 0" type="number" {...props} />
    </div>
  );
}

function PaymentButton({ icon, label, active, onClick }) {
  return (
    <button type="button" className={`payment-btn${active ? " active" : ""}`} onClick={onClick}>
      <span className="payment-icon">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function CategoryButton({ label, active, onClick, color = "normal" }) {
  return (
    <button type="button" className={`category-btn${active ? " active" : ""} ${color}`} onClick={onClick}>
      {label}
    </button>
  );
}