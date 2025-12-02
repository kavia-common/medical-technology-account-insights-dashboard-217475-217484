//
// CSV export utilities with UTF-8 BOM and browser download trigger.
// Supports providing headers order; otherwise, inferred from union of object keys.
//

/**
 * Convert an array of objects into CSV string.
 *
 * @param {Array<Object>} rows - Data rows as array of plain objects.
 * @param {Object} options
 *  - headers: Array<string> explicit column order/selection
 *  - delimiter: string delimiter (default ",")
 *  - includeHeader: boolean include header row (default true)
 *  - replacer: function(value, key) -> string custom value formatter
 * @returns {string} CSV text (no BOM)
 */
// PUBLIC_INTERFACE
export function toCsv(rows, { headers, delimiter = ",", includeHeader = true, replacer } = {}) {
  const data = Array.isArray(rows) ? rows : [];
  const cols = headers && headers.length ? headers : inferHeaders(data);
  const escape = (val) => {
    let v = val;
    if (replacer) v = replacer(val);
    if (v === null || v === undefined) v = "";
    v = String(v);
    const needsQuotes = /[",\n\r]/.test(v) || v.includes(delimiter);
    const escaped = v.replaceAll('"', '""');
    return needsQuotes ? `"${escaped}"` : escaped;
  };

  const lines = [];
  if (includeHeader) {
    lines.push(cols.map(escape).join(delimiter));
  }
  for (const row of data) {
    const line = cols.map((c) => escape(row?.[c]));
    lines.push(line.join(delimiter));
  }
  return lines.join("\r\n");
}

/**
 * Trigger a CSV file download in the browser, adding UTF-8 BOM to aid Excel.
 *
 * @param {string} csv - CSV content (without BOM)
 * @param {string} filename - Suggested filename (e.g., "report.csv")
 */
// PUBLIC_INTERFACE
export function downloadCsv(csv, filename = "export.csv") {
  const BOM = "\uFEFF"; // UTF-8 BOM
  const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Convenience: Build CSV from objects then immediately download it.
 *
 * @param {Array<Object>} rows
 * @param {Object} options - same as toCsv options, plus filename
 *  - filename: string
 */
// PUBLIC_INTERFACE
export function exportCsv(rows, { filename = "export.csv", ...opts } = {}) {
  const csv = toCsv(rows, opts);
  downloadCsv(csv, filename);
}

function inferHeaders(rows) {
  const set = new Set();
  for (const r of rows) {
    if (r && typeof r === "object") {
      Object.keys(r).forEach((k) => set.add(k));
    }
  }
  return Array.from(set);
}

export default {
  toCsv,
  downloadCsv,
  exportCsv
};
