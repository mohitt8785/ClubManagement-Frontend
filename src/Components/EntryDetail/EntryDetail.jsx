import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import "./EntryDetail.css";

const API_URL = "http://localhost:5000/api/entries";

export default function EntryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchEntry();
  }, [id]);

  const fetchEntry = async () => {
    try {
      console.log("📡 Fetching entry:", id);
      const res = await axios.get(`${API_URL}/${id}`);
      console.log("✅ Entry loaded:", res.data.data);
      setEntry(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error("❌ Error loading entry:", err);
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!entry) return;

    console.log("📄 Generating 2-page PDF for SR No:", entry.srNo);

    const doc = new jsPDF();

    // ─────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────

    const loadImage = (url) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      });

    let y = 50;
    const leftX = 15;
    const labelX = leftX + 5;
    const valueX = 60;
    const colWidth = 120;

    const checkPageBreak = () => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
    };

    const section = (title) => {
      checkPageBreak();
      doc.setFillColor(240, 240, 240);
      doc.rect(leftX, y, colWidth, 7, "F");
      doc.setFont(undefined, "bold");
      doc.setFontSize(11);
      doc.setTextColor(0);
      doc.text(title, labelX, y + 5);
      y += 14;
    };

    const line = (label, val) => {
      checkPageBreak();

      doc.setFont(undefined, "bold");
      doc.setFontSize(10);
      doc.text(label, labelX, y);

      doc.setFont(undefined, "normal");
      doc.setFontSize(12);
      const lines = doc.splitTextToSize(
        String(val || "—"),
        colWidth - valueX + leftX
      );
      doc.text(lines, valueX, y);

      y += lines.length * 6 + 2;
    };

    // ─────────────────────────────────────────
    // PAGE 1
    // ─────────────────────────────────────────

    // Header
    doc.setFillColor(201, 168, 76);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(7, 7, 13);
    doc.setFont(undefined, "bold");
    doc.setFontSize(24);
    doc.text("JAGUAR CLUB", 105, 18, { align: "center" });
    doc.setFont(undefined, "normal");
    doc.setFontSize(10);
    doc.text("Guest Entry Record", 105, 28, { align: "center" });
    doc.setFontSize(9);
    doc.text(
      `SR #${entry.srNo}  •  Table ${entry.tableNo}  •  ${entry.category}`,
      105,
      35,
      { align: "center" }
    );

    // Live Photo
    try {
      if (entry.livePhotoUrl) {
        const img = await loadImage(entry.livePhotoUrl);
        const x = 145, yImg = 55, size = 50;

        doc.addImage(img, "JPEG", x, yImg, size, size);
        doc.setDrawColor(201, 168, 76);
        doc.setLineWidth(2);
        doc.rect(x, yImg, size, size);

        doc.setFontSize(7);
        doc.setTextColor(120);
        doc.text(`${entry.name} ${entry.surname}`, x + size / 2, yImg + size + 5, { align: "center" });
      }
    } catch (e) {
      console.error("Photo load error", e);
    }

    doc.setTextColor(0);

    // Content
    section("PERSONAL INFORMATION");
    line("Name:", `${entry.name} ${entry.surname}`);
    line("Contact:", entry.contactNo);
    if (entry.email) line("Email:", entry.email);
    if (entry.dob) line("DOB:", entry.dob);
    y += 3;

    section("ENTRY DETAILS");
    line("Time:", entry.entryTime);
    line("Date:", new Date(entry.createdAt).toLocaleDateString("en-IN"));
    line("Table:", entry.tableNo);
    line("Category:", entry.category);
    y += 3;

    section("PAYMENT");
    line("Mode:", entry.paymentMode);
    line("DS Amount:", `INR ${entry.dsAmount || 0}`);
    line("RS Amount:", `INR ${entry.rsAmount || 0}`);

    doc.setFont(undefined, "bold");
    doc.setFontSize(11);
    doc.text("Total:", labelX, y);
    doc.setTextColor(201, 168, 76);
    doc.text(`INR ${entry.totalAmount || 0}`, valueX, y);
    doc.setTextColor(0);
    y += 8;

    if (entry.withCover > 0) line("With Cover:", `INR ${entry.withCover}`);
    if (entry.withoutCover > 0) line("Without Cover:", `INR ${entry.withoutCover}`);
    y += 3;

    if (entry.reffBy || entry.refMemberNo) {
      section("REFERENCE");
      if (entry.reffBy) line("Referred By:", entry.reffBy);
      if (entry.refMemberNo) line("Member No:", entry.refMemberNo);
    }

    if (entry.remarks) {
      section("REMARKS");
      doc.setFontSize(10);
      const remarks = doc.splitTextToSize(entry.remarks, colWidth - 10);
      doc.text(remarks, labelX, y);
    }

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(120);
    doc.text("Page 1 of 2 • Jaguar Club Entry Management", 105, 285, { align: "center" });
    doc.setDrawColor(201, 168, 76);
    doc.rect(10, 10, 190, 277);

    // ─────────────────────────────────────────
    // PAGE 2 – ID PROOFS
    // ─────────────────────────────────────────

    if (entry.idFrontUrl || entry.idBackUrl) {
      doc.addPage();

      doc.setFillColor(201, 168, 76);
      doc.rect(0, 0, 210, 35, "F");
      doc.setTextColor(7, 7, 13);
      doc.setFont(undefined, "bold");
      doc.setFontSize(20);
      doc.text("ID PROOF", 105, 18, { align: "center" });
      doc.setFont(undefined, "normal");
      doc.setFontSize(9);
      doc.text(
        `SR #${entry.srNo} • ${entry.name} ${entry.surname}`,
        105,
        27,
        { align: "center" }
      );

      let pageY = 50;

      const renderIdImage = async (title, url) => {
        const img = await loadImage(url);
        doc.setFont(undefined, "bold");
        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.text(title, 105, pageY, { align: "center" });
        pageY += 8;

        const maxW = 170, maxH = 100;
        const ratio = img.width / img.height;
        let w = maxW, h = maxW / ratio;
        if (h > maxH) {
          h = maxH;
          w = maxH * ratio;
        }

        const x = (210 - w) / 2;
        doc.addImage(img, "JPEG", x, pageY, w, h);
        doc.setDrawColor(201, 168, 76);
        doc.rect(x, pageY, w, h);

        pageY += h + 20;
      };

      try {
        if (entry.idFrontUrl) await renderIdImage("ID FRONT SIDE", entry.idFrontUrl);
        if (entry.idBackUrl) await renderIdImage("ID BACK SIDE", entry.idBackUrl);
      } catch (e) {
        console.error("ID image error", e);
      }

      doc.setFontSize(7);
      doc.setTextColor(120);
      doc.text(
        `Page 2 of 2 • Generated: ${new Date().toLocaleString("en-IN")}`,
        105,
        285,
        { align: "center" }
      );
      doc.setDrawColor(201, 168, 76);
      doc.rect(10, 10, 190, 277);
    }

    doc.save(`JaguarClub_SR${entry.srNo}_${entry.name}.pdf`);
    console.log("✅ PDF generated successfully");
  };
  const handleClose = () => {
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content" style={{ padding: "60px", textAlign: "center" }}>
          <p style={{ color: "#C9A84C" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="modal-overlay">
        <div className="modal-content" style={{ padding: "60px", textAlign: "center" }}>
          <p style={{ color: "#E05252" }}>Entry not found</p>
          <button onClick={handleClose} className="btn-close" style={{ marginTop: "20px" }}>
            ← Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>

        <div className="modal-header">
          <div>
            <h2>Entry Details</h2>
            <span className="sr-badge">SR #{entry.srNo}</span>
          </div>
          <button onClick={handleClose} className="close-btn">✕</button>
        </div>

        <div className="modal-body">
          <div className="detail-main-grid">

            <div className="info-column">
              <h3 className="column-heading">ℹ️ Information</h3>

              <DetailSection title="Personal Information">
                <DetailRow label="Full Name" value={`${entry.name} ${entry.surname}`} />
                <DetailRow label="Contact" value={entry.contactNo} />
                {entry.email && <DetailRow label="Email" value={entry.email} />}
                {entry.dob && <DetailRow label="Date of Birth" value={entry.dob} />}
              </DetailSection>

              <DetailSection title="Entry Details">
                <DetailRow label="Entry Time" value={entry.entryTime} />
                <DetailRow label="Entry Date" value={new Date(entry.createdAt).toLocaleDateString("en-IN")} />
                <DetailRow label="Table No" value={`Table ${entry.tableNo}`} />
                <DetailRow label="Category">
                  <span className={`category-badge ${entry.category.toLowerCase()}`}>{entry.category}</span>
                </DetailRow>
                {entry.additional && <DetailRow label="Additional" value="✓ Yes" />}
              </DetailSection>

              <DetailSection title="Payment">
                <DetailRow label="Mode" value={entry.paymentMode} />
                <DetailRow label="DS Amount" value={`₹ ${entry.dsAmount || 0}`} />
                <DetailRow label="RS Amount" value={`₹ ${entry.rsAmount || 0}`} />
                <DetailRow label="Total" value={`₹ ${entry.totalAmount || 0}`} highlight />
                {entry.withCover > 0 && <DetailRow label="With Cover" value={`₹ ${entry.withCover}`} />}
                {entry.withoutCover > 0 && <DetailRow label="Without Cover" value={`₹ ${entry.withoutCover}`} />}
              </DetailSection>

              {(entry.reffBy || entry.refMemberNo) && (
                <DetailSection title="Reference">
                  {entry.reffBy && <DetailRow label="Referred By" value={entry.reffBy} />}
                  {entry.refMemberNo && <DetailRow label="Ref Member No" value={entry.refMemberNo} />}
                </DetailSection>
              )}

              {entry.remarks && (
                <DetailSection title="Remarks">
                  <p className="remarks-text">{entry.remarks}</p>
                </DetailSection>
              )}

              <DetailSection title="System Info">
                <DetailRow label="Created" value={new Date(entry.createdAt).toLocaleString("en-IN")} />
                <DetailRow label="Updated" value={new Date(entry.updatedAt).toLocaleString("en-IN")} />
              </DetailSection>
            </div>

            <div className="photos-column">
              <h3 className="column-heading">📸 Photos</h3>

              <div className="photos-stack">
                {entry.livePhotoUrl && (
                  <div className="photo-card">
                    <label className="photo-card-label">Live Photo</label>
                    <img src={entry.livePhotoUrl} alt="Live" className="photo-card-img live" />
                  </div>
                )}
                {entry.idFrontUrl && (
                  <div className="photo-card">
                    <label className="photo-card-label">ID Front</label>
                    <img src={entry.idFrontUrl} alt="ID Front" className="photo-card-img id-card" />
                  </div>
                )}
                {entry.idBackUrl && (
                  <div className="photo-card">
                    <label className="photo-card-label">ID Back</label>
                    <img src={entry.idBackUrl} alt="ID Back" className="photo-card-img id-card" />
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        <div className="modal-footer">
          <button onClick={handleDownloadPDF} className="btn-download">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="13" height="13" style={{ marginRight: 6, verticalAlign: 'middle' }}>
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download PDF
          </button>
          <button onClick={handleClose} className="btn-close">Close</button>
        </div>

      </div>
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <div className="detail-section">
      <h3 className="section-heading">{title}</h3>
      <div className="section-content">{children}</div>
    </div>
  );
}

function DetailRow({ label, value, children, highlight }) {
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className={`detail-value${highlight ? " highlight" : ""}`}>{children || value}</span>
    </div>
  );
}