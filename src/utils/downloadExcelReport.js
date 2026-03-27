import api from "./api.js";

/**
 * @param {object} opts
 * @param {"daily"|"weekly"|"monthly"} opts.period
 * @param {string} [opts.date] - YYYY-MM-DD for daily & weekly
 * @param {number} [opts.year]
 * @param {number} [opts.month] - 1–12
 */
export async function downloadExcelReport({ period, date, year, month }) {
  const params = new URLSearchParams({ period });
  if (period === "daily" || period === "weekly") {
    if (!date) throw new Error("date is required");
    params.set("date", date);
  }
  if (period === "monthly") {
    if (year == null || month == null) throw new Error("year and month are required");
    params.set("year", String(year));
    params.set("month", String(month));
  }

  let res;
  try {
    res = await api.get(`/reports/export/excel?${params.toString()}`, {
      responseType: "blob",
    });
  } catch (err) {
    const data = err.response?.data;
    if (data instanceof Blob) {
      const text = await data.text();
      let msg = err.response?.statusText || "Export failed";
      try {
        const j = JSON.parse(text);
        if (j.message) msg = j.message;
      } catch {
        /* ignore */
      }
      throw new Error(msg);
    }
    throw err;
  }

  const ctype = res.headers["content-type"] || "";
  if (ctype.includes("application/json")) {
    const text = await res.data.text();
    let msg = "Export failed";
    try {
      const j = JSON.parse(text);
      if (j.message) msg = j.message;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }

  let filename = `JaguarClub_${period}_report.xlsx`;
  const cd = res.headers["content-disposition"];
  if (cd) {
    const m = /filename\*?=(?:UTF-8'')?["']?([^"';]+)/i.exec(cd);
    if (m?.[1]) filename = decodeURIComponent(m[1].replace(/['"]/g, "").trim());
  }

  const blob = new Blob([res.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
