import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./EntryForm.css";

const API_URL = `${import.meta.env.VITE_API_URL}/entries`;

const initialState = {
  name: "",
  surname: "",
  contactNo: "",
  email: "",
  dob: "",
  entryTime: new Date().toTimeString().slice(0, 5),
  reffBy: "",
  pax: "",
  paxCounts: { Pax: 0, "Stag Male": 0, "Stag Female": 0, Couple: 0 },
  cashAmount: "",
  upiAmount: "",
  cardAmount: "",
  totalAmount: "",
  withCover: "",
  withoutCover: "",
  category: "Normal",
  livePhoto: null,
  idFront: null,
  idBack: null,
  remarks: "",
  tableNo: "",
};

function calcAge(dob) {
  if (!dob) return null;
  const today = new Date(),
    birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age >= 0 ? age : null;
}

function formatDOB(dob) {
  if (!dob) return "";
  const [y, m, d] = dob.split("-");
  return `${d}/${m}/${y}`;
}

export default function EntryForm({ onEntryAdded }) {
  const [form, setForm] = useState(initialState);
  const [livePhotoPreview, setLivePhotoPreview] = useState(null);
  const [idFrontPreview, setIdFrontPreview] = useState(null);
  const [idBackPreview, setIdBackPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [srNo, setSrNo] = useState(null);
  const [showWebcam, setShowWebcam] = useState(null);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);

  const age = calcAge(form.dob);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleAmountChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    updated.totalAmount = (
      (parseFloat(updated.cashAmount) || 0) +
      (parseFloat(updated.upiAmount) || 0) +
      (parseFloat(updated.cardAmount) || 0)
    ).toString();
    setForm(updated);
  };

  const startWebcam = async (type) => {
    try {
      const ms = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: type === "live" ? "user" : "environment",
          width: { ideal: 800 },
          height: { ideal: 800 },
        },
      });
      setStream(ms);
      setShowWebcam(type);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = ms;
      }, 100);
    } catch {
      alert("Camera access denied or not available.");
    }
  };

  const stopWebcam = () => {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    setStream(null);
    setShowWebcam(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    const v = videoRef.current;

    // ✅ SAME SIZE FOR ALL PHOTOS: 400x400 square
    canvas.width = 400;
    canvas.height = 400;

    const ctx = canvas.getContext("2d");
    const scale = Math.min(400 / v.videoWidth, 400 / v.videoHeight);
    const sw = v.videoWidth * scale,
      sh = v.videoHeight * scale;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 400, 400);
    ctx.drawImage(v, (400 - sw) / 2, (400 - sh) / 2, sw, sh);

    canvas.toBlob(
      (blob) => {
        const file = new File([blob], `${showWebcam}_photo.jpg`, {
          type: "image/jpeg",
        });
        if (showWebcam === "live") {
          setForm((p) => ({ ...p, livePhoto: file }));
          setLivePhotoPreview(URL.createObjectURL(file));
        } else if (showWebcam === "idFront") {
          setForm((p) => ({ ...p, idFront: file }));
          setIdFrontPreview(URL.createObjectURL(file));
        } else if (showWebcam === "idBack") {
          setForm((p) => ({ ...p, idBack: file }));
          setIdBackPreview(URL.createObjectURL(file));
        }
        stopWebcam();
      },
      "image/jpeg",
      0.9,
    );
  };

  const removePhoto = (type) => {
    if (type === "live") {
      setForm((p) => ({ ...p, livePhoto: null }));
      setLivePhotoPreview(null);
    } else if (type === "idFront") {
      setForm((p) => ({ ...p, idFront: null }));
      setIdFrontPreview(null);
    } else if (type === "idBack") {
      setForm((p) => ({ ...p, idBack: null }));
      setIdBackPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        if (["livePhoto", "idFront", "idBack"].includes(key)) {
          if (form[key]) formData.append(key, form[key]);
        } else if (key === "tableNo") {
          if (form[key] !== "" && form[key] != null)
            formData.append("tableNo", Number(form[key]));
        }
        else if (key === "pax") {

          if (form[key]) formData.append(key, form[key]);
        }



        else if (
          [
            "cashAmount",
            "upiAmount",
            "cardAmount",
            "totalAmount",
            "withCover",
            "withoutCover",
          ].includes(key)
        ) {
          formData.append(key, form[key] === "" ? "0" : form[key]);
        } else if (key === "paxCounts") {
          formData.append("paxCounts", JSON.stringify(form.paxCounts));
        } else {
          formData.append(key, form[key] ?? "");
        }
      });

      const res = await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        setSrNo(res.data.data.srNo);
        setMessage({ type: "success", text: res.data.message });
        setForm(initialState);
        setLivePhotoPreview(null);
        setIdFrontPreview(null);
        setIdBackPreview(null);
        if (onEntryAdded) onEntryAdded();
      }
    } catch (error) {
      const data = error.response?.data;
      const fieldErrors = data?.errors;
      setMessage({
        type: "error",
        text: fieldErrors?.length
          ? `${data.message}: ${fieldErrors.map((e) => `${e.field} — ${e.message}`).join(", ")}`
          : data?.message || "Server error",
      });
    } finally {
      setLoading(false);
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

  useEffect(
    () => () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    },
    [stream],
  );

  const paxOptions = [
    { key: "Pax", icon: "👥", label: "Pax", cls: "pax" },
    { key: "Stag Male", icon: "👨", label: "Stag Male", cls: "stag-male" },
    {
      key: "Stag Female",
      icon: "👩",
      label: "Stag Female",
      cls: "stag-female",
    },
    { key: "Couple", icon: "💑", label: "Couple", cls: "couple" },
  ];

  return (
    <div className="ef-wrapper">
      <div className="ef-header">
        {/* <div className="ef-badge">★ MEMBERS ONLY ★</div> */}
        <h1 className="ef-title">Entry Form</h1>
        <div className="ef-title-line" />
      </div>

      <div className="ef-card">
        <div className="ef-sr-row">
          <span className="ef-sr-label">SR. NO.</span>
          <div className="ef-sr-box">{srNo || "—"}</div>
          <span className="ef-sr-auto">Auto-Generated On Save</span>
        </div>

        {message.text && (
          <div className={`ef-msg ef-msg--${message.type}`}>{message.text}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="ef-body">
            {/* ══ FORM SECTIONS (left) ══ */}
            <div className="ef-col ef-col--sections">
              <div className="ef-row2">
                <Sec n="1" t="Personal Information">
                  <div className="ef-row2">
                    <Inp
                      label="Name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="First Name"
                      required
                    />
                    <Inp
                      label="Surname"
                      name="surname"
                      value={form.surname}
                      onChange={handleChange}
                      placeholder="Last Name"
                      required
                    />
                  </div>
                </Sec>

                <Sec n="2" t="Contact Details">
                  <div className="ef-row2">
                    <Inp
                      label="Contact No."
                      name="contactNo"
                      value={form.contactNo}
                      onChange={handleChange}
                      placeholder="+91 00000 00000"
                      required
                      maxLength={10}
                    />
                    <Inp
                      label="Email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="example@email.com"
                    />
                  </div>
                  <div className="ef-row2">
                    <div className="ef-field">
                      <label className="ef-label">
                        Date of Birth
                        {/* {age !== null && (
                          <span className="ef-age-inline"> · {age} yrs</span>
                        )} */}
                      </label>
                      <div className="ef-dob-wrap">
                        <input
                          className="ef-input"
                          name="dob"
                          type="date"
                          value={form.dob}
                          onChange={handleChange}
                          style={{
                            paddingRight: age !== null ? "35px" : "12px",
                          }}
                        />
                        {age !== null && (
                          <span className="ef-age-pill">{age}</span>
                        )}
                      </div>
                      {form.dob && (
                        <span className="ef-dob-hint">
                          {formatDOB(form.dob)} · Age {age}
                        </span>
                      )}
                    </div>


                    <div className="ef-field">
                      <label className="ef-label">Entry Time <span className="ef-req">*</span></label>
                      <div className="ef-time-input-wrap">
                        {/* Hidden actual time input (24-hour format) */}
                        <input
                          className="ef-time-input-hidden"
                          name="entryTime"
                          type="time"
                          value={form.entryTime}
                          onChange={handleChange}
                          required
                          id="entryTimeInput"
                        />

                        {/* Custom display (12-hour format) */}
                        <div
                          className="ef-time-display"
                          onClick={() => document.getElementById('entryTimeInput').showPicker()}
                        >
                          {form.entryTime ? (() => {
                            const [h, m] = form.entryTime.split(":");
                            const hour = parseInt(h);
                            let h12 = hour % 12;
                            if (h12 === 0) h12 = 12;
                            const ampm = hour >= 12 ? "PM" : "AM";
                            return `${h12}:${m} ${ampm}`;
                          })() : "Select Time"}
                        </div>
                      </div>
                    </div>
                  </div>
                </Sec>
              </div>

              <div className="ef-row2">
                <Sec n="3" t="Reference">
                  <Inp
                    label="Referred By"
                    name="reffBy"
                    value={form.reffBy}
                    onChange={handleChange}
                    placeholder="Referrer Name"
                  />
                </Sec>

                <Sec n="4" t="Pax Type">
                  <div className="ef-pax-grid">
                    {paxOptions.map((p) => {
                      const isSelected = form.paxCounts[p.key] > 0;

                      return (
                        <div
                          key={p.key}
                          className={`ef-pax-btn${isSelected ? ` ef-pax--${p.cls}` : ""}`}
                          onClick={() => {
                            setForm((f) => ({
                              ...f,
                              paxCounts: {
                                ...f.paxCounts,
                                [p.key]: f.paxCounts[p.key] === 0 ? 1 : f.paxCounts[p.key],
                              },
                            }));
                          }}
                        >
                          <span className="ef-pax-emoji">{p.icon}</span>
                          <span className="ef-pax-lbl">{p.label}</span>

                          {isSelected && (
                            <div
                              className="ef-pax-num-wrap"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                className="ef-pax-dec"
                                onClick={() =>
                                  setForm((f) => ({
                                    ...f,
                                    paxCounts: {
                                      ...f.paxCounts,
                                      [p.key]: Math.max(0, f.paxCounts[p.key] - 1),
                                    },
                                  }))
                                }
                              >
                                −
                              </button>

                              <span className="ef-pax-count">
                                {form.paxCounts[p.key]}
                              </span>

                              <button
                                type="button"
                                className="ef-pax-inc"
                                onClick={() =>
                                  setForm((f) => ({
                                    ...f,
                                    paxCounts: {
                                      ...f.paxCounts,
                                      [p.key]: f.paxCounts[p.key] + 1,
                                    },
                                  }))
                                }
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="ef-pax-summary">
                    <span className="ef-pax-summary-item">
                      <span className="ef-pax-summary-icon"></span>
                      <span className="ef-pax-summary-label">Pax:</span>
                      <span className="ef-pax-summary-value">{form.paxCounts["Pax"]}</span>
                    </span>

                    {/* <span className="ef-pax-summary-divider">|</span> */}

                    <span className="ef-pax-summary-item">
                      <span className="ef-pax-summary-icon"></span>
                      <span className="ef-pax-summary-label">Male:</span>
                      <span className="ef-pax-summary-value">{form.paxCounts["Stag Male"]}</span>
                    </span>

                    {/* <span className="ef-pax-summary-divider">|</span> */}

                    <span className="ef-pax-summary-item">
                      <span className="ef-pax-summary-icon"></span>
                      <span className="ef-pax-summary-label">Female:</span>
                      <span className="ef-pax-summary-value">{form.paxCounts["Stag Female"]}</span>
                    </span>

                    {/* <span className="ef-pax-summary-divider">|</span> */}

                    <span className="ef-pax-summary-item">
                      <span className="ef-pax-summary-icon"></span>
                      <span className="ef-pax-summary-label">Couple:</span>
                      <span className="ef-pax-summary-value">{form.paxCounts["Couple"]}</span>
                    </span>
                  </div>
                  {/* ✅ NEW: TOTAL PEOPLE COUNTER */}
                  <div className="ef-pax-total">
                    <span className="ef-pax-total-icon">👤</span>
                    <span className="ef-pax-total-label">Total People:</span>
                    <span className="ef-pax-total-value">
                      {
                        form.paxCounts["Pax"] +
                        form.paxCounts["Stag Male"] +
                        form.paxCounts["Stag Female"] +
                        (form.paxCounts["Couple"] * 2)  // ✅ Couple × 2 = people
                      }
                    </span>
                  </div>


                </Sec>
              </div>

              <Sec n="5" t="Payment" req>
                <div className="ef-pay-grid">
                  <div className="ef-pay-card ef-pay--cash">
                    <div className="ef-pay-top">
                      <span className="ef-pay-emoji">💵</span>
                      <span className="ef-pay-name">Cash</span>
                    </div>
                    <div className="ef-pay-inp-wrap">
                      <span className="ef-pay-sym">₹</span>
                      <input
                        className="ef-pay-inp"
                        name="cashAmount"
                        type="number"
                        value={form.cashAmount}
                        onChange={handleAmountChange}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="ef-pay-card ef-pay--upi">
                    <div className="ef-pay-top">
                      <span className="ef-pay-emoji">📱</span>
                      <span className="ef-pay-name">UPI</span>
                    </div>
                    <div className="ef-pay-inp-wrap">
                      <span className="ef-pay-sym">₹</span>
                      <input
                        className="ef-pay-inp"
                        name="upiAmount"
                        type="number"
                        value={form.upiAmount}
                        onChange={handleAmountChange}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="ef-pay-card ef-pay--card">
                    <div className="ef-pay-top">
                      <span className="ef-pay-emoji">💳</span>
                      <span className="ef-pay-name">Card</span>
                    </div>
                    <div className="ef-pay-inp-wrap">
                      <span className="ef-pay-sym">₹</span>
                      <input
                        className="ef-pay-inp"
                        name="cardAmount"
                        type="number"
                        value={form.cardAmount}
                        onChange={handleAmountChange}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
                <div className="ef-total">
                  <div className="ef-total-l">
                    <span className="ef-total-star">★</span>
                    <span className="ef-total-lbl">Total Amount</span>
                  </div>
                  <div className="ef-total-r">
                    <span className="ef-total-sym">₹</span>
                    <span className="ef-total-val">
                      {(parseFloat(form.totalAmount) || 0).toLocaleString(
                        "en-IN",
                      )}
                    </span>
                  </div>
                </div>
                <div className="ef-cover-grid">
                  <div className="ef-cover-card">
                    <label className="ef-cover-lbl">With Cover</label>
                    <input
                      className="ef-cover-inp"
                      name="withCover"
                      type="number"
                      value={form.withCover}
                      onChange={handleChange}
                      placeholder="0"
                    />
                  </div>
                  <div className="ef-cover-card">
                    <label className="ef-cover-lbl">Without Cover</label>
                    <input
                      className="ef-cover-inp"
                      name="withoutCover"
                      type="number"
                      value={form.withoutCover}
                      onChange={handleChange}
                      placeholder="0"
                    />
                  </div>
                </div>
              </Sec>

              <div className="ef-row2">
                <Sec n="6" t="Member Category">
                  <div className="ef-cat-grid">
                    {[
                      ["Normal", "normal", "⭐"],
                      ["VIP", "vip", "💎"],
                      ["VVIP", "vvip", "👑"],
                    ].map(([cat, cls, icon]) => (
                      <button
                        key={cat}
                        type="button"
                        className={`ef-cat-btn ef-cat--${cls}${form.category === cat ? " ef-cat--active" : ""}`}
                        onClick={() => setForm({ ...form, category: cat })}
                      >
                        <span className="ef-cat-icon">{icon}</span>
                        <span>{cat}</span>
                      </button>
                    ))}
                  </div>
                </Sec>

                <Sec n="7" t="Table & Remarks">
                  <div className="ef-table-row">
                    <div className="ef-field" style={{ flex: 1 }}>
                      <label className="ef-label">Table No.</label>
                      <input
                        className="ef-input"
                        name="tableNo"
                        type="number"
                        value={form.tableNo}
                        onChange={handleChange}
                        placeholder="e.g. 12"
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          letterSpacing: 2,
                        }}
                      />
                    </div>
                  </div>
                  <div className="ef-field" style={{ marginTop: 12 }}>
                    <label className="ef-label">Remarks</label>
                    <textarea
                      className="ef-textarea"
                      name="remarks"
                      value={form.remarks}
                      onChange={handleChange}
                      placeholder="Enter any remarks or special instructions..."
                      style={{ minHeight: 70 }}
                    />
                  </div>
                </Sec>
              </div>
            </div>

            {/* ══ PHOTO PANEL (right, sticky) - ALL SAME SIZE ══ */}
            <div className="ef-col ef-col--photo">
              {/* ✅ LIVE PHOTO - 400x400 */}
              <PhotoBox
                title="📸 Client Live"
                preview={livePhotoPreview}
                onCapture={() => startWebcam("live")}
                onRetake={() => startWebcam("live")}
                onRemove={() => removePhoto("live")}
              />

              {/* ✅ ID FRONT - 400x400 */}
              <PhotoBox
                title="🪪 ID Front"
                preview={idFrontPreview}
                onCapture={() => startWebcam("idFront")}
                onRetake={() => startWebcam("idFront")}
                onRemove={() => removePhoto("idFront")}
              />

              {/* ✅ ID BACK - 400x400 */}
              <PhotoBox
                title="🪪 ID Back"
                preview={idBackPreview}
                onCapture={() => startWebcam("idBack")}
                onRetake={() => startWebcam("idBack")}
                onRemove={() => removePhoto("idBack")}
              />
            </div>
          </div>

          <div className="ef-actions">
            <button
              type="button"
              onClick={handleReset}
              className="ef-btn-reset"
            >
              Reset
            </button>
            <button type="submit" disabled={loading} className="ef-btn-save">
              {loading ? "Saving…" : "Save Entry ★"}
            </button>
          </div>
        </form>
      </div>

      <div className="ef-footer">Jaguar Club · Entry Management System · ★</div>

      {/* WEBCAM MODAL */}
      {showWebcam && (
        <div className="ef-webcam-overlay" onClick={stopWebcam}>
          <div className="ef-webcam-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ef-webcam-head">
              <h3>
                📸{" "}
                {showWebcam === "live"
                  ? "Client Live Photo"
                  : showWebcam === "idFront"
                    ? "ID — Front Side"
                    : "ID — Back Side"}
              </h3>
              <button
                type="button"
                onClick={stopWebcam}
                className="ef-webcam-close"
              >
                ✕
              </button>
            </div>
            <div className="ef-webcam-body">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="ef-webcam-video"
              />
            </div>
            <div className="ef-webcam-foot">
              <button
                type="button"
                onClick={stopWebcam}
                className="ef-wbtn ef-wbtn--cancel"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={capturePhoto}
                className="ef-wbtn ef-wbtn--capture"
              >
                📷 Capture Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ✅ REUSABLE PHOTO BOX COMPONENT - ALL SAME SIZE
function PhotoBox({ title, preview, onCapture, onRetake, onRemove }) {
  return (
    <div className="ef-photo-box">
      <div className="ef-photo-box-head">{title}</div>
      <div
        className={`ef-photo-square ${preview ? "captured" : ""}`}
        onClick={!preview ? onCapture : undefined}
      >
        {preview ? (
          <>
            <img src={preview} alt={title} className="ef-photo-img" />
            <div className="ef-photo-badge">✓</div>
          </>
        ) : (
          <div className="ef-photo-empty">
            <div className="ef-photo-cam-icon">📷</div>
            <p className="ef-photo-tap">Tap to Capture</p>
          </div>
        )}
      </div>
      {preview ? (
        <div className="ef-photo-btns">
          <button type="button" className="ef-photo-retake" onClick={onRetake}>
            🔄 Retake
          </button>
          <button type="button" className="ef-photo-del" onClick={onRemove}>
            ✕
          </button>
        </div>
      ) : (
        <button type="button" className="ef-photo-cap-btn" onClick={onCapture}>
          📹 Open Camera
        </button>
      )}
    </div>
  );
}

function Sec({ n, t, req, children }) {
  return (
    <div className="ef-section">
      <div className="ef-sec-head">
        <span className="ef-sec-num">{n}</span>
        <span className="ef-sec-title">
          {t}
          {req && <span className="ef-req"> *</span>}
        </span>
      </div>
      {children}
    </div>
  );
}

function Inp({ label, required, ...props }) {
  return (
    <div className="ef-field">
      <label className="ef-label">
        {label}
        {required && <span className="ef-req"> *</span>}
      </label>
      <input className="ef-input" required={required} {...props} />
    </div>
  );
}
