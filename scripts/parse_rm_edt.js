const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const candidates = [
  path.join(__dirname, '..', 'RM-EDT.xlsx'),
  path.join(__dirname, '..', 'archivos', 'RM-EDT.xlsx'),
  path.join(__dirname, '..', 'archivos', 'RM-EDT.xls')
];

let filePath = null;
for (const p of candidates) {
  if (fs.existsSync(p)) { filePath = p; break; }
}
if (!filePath) {
  console.error('ERROR: No se encontró RM-EDT.xlsx en la ruta esperada. Rutas probadas:', candidates);
  process.exit(2);
}

const workbook = xlsx.readFile(filePath);
const sheets = workbook.SheetNames;

function detectSkuHeader(headers) {
  const skuCandidates = headers.filter(h => !!h && /\b(sku|cod|codigo|codigo|ref|referencia|id|clave)\b/i.test(String(h)));
  return skuCandidates.length ? skuCandidates[0] : null;
}

function suggestMapping(header) {
  if (!header) return null;
  const h = String(header).toLowerCase().trim();
  if (/nombre|producto|equipo|articulo/.test(h)) return 'nombre';
  if (/categoria/.test(h)) return 'categoria';
  if (/subcategoria/.test(h)) return 'subcategoria';
  if (/descripcion|detalle|detalles/.test(h)) return 'descripcion';
  if (/precio|monto|costo|valor/.test(h)) return 'precio';
  if (/tipo/.test(h)) return 'tipo';
  if (/uso/.test(h)) return 'uso';
  if (/tamano|tama[oó]o|size/.test(h)) return 'tamano';
  if (/peso/.test(h)) return 'peso';
  if (/stock|cantidad|existencia/.test(h)) return 'disponibilidad.stock';
  if (/sku|codigo|cod|referencia|ref|id|clave/.test(h)) return 'disponibilidad.sku';
  if (/qr/.test(h)) return 'disponibilidad.qr';
  if (/fecha/.test(h)) return 'fecha_adquisicion';
  if (/vida|vida_util/.test(h)) return 'vida_util_meses';
  if (/ubicacion|lugar/.test(h)) return 'ubicacion';
  return null;
}

const report = { filePath, sheets: [] };

for (const sheetName of sheets) {
  const sheet = workbook.Sheets[sheetName];
  const rowsHeader = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null });
  const headers = (rowsHeader[0] || []).map(h => (h === null ? null : String(h).trim()));
  const json = xlsx.utils.sheet_to_json(sheet, { defval: null });
  const skuHeader = detectSkuHeader(headers);

  let skuStats = null;
  if (skuHeader) {
    const key = skuHeader;
    const values = json.map(r => r[key]).filter(v => v !== null && v !== undefined && String(v).trim() !== '');
    const unique = Array.from(new Set(values.map(v => String(v).trim()))).length;
    skuStats = { header: key, nonEmpty: values.length, rows: json.length, unique, uniquenessRatio: values.length ? +(unique / values.length).toFixed(3) : 0 };
  }

  const mapping = {};
  for (const h of headers) {
    mapping[h || ''] = suggestMapping(h);
  }

  // preview: map first 10 rows
  function convertRow(r) {
    const out = {};
    for (const h of headers) {
      const mapped = suggestMapping(h);
      const raw = r[h];
      if (!mapped) {
        // keep in _raw
        out._raw = out._raw || {};
        out._raw[h] = raw;
        continue;
      }
      // nested path support
      if (mapped.includes('.')) {
        const parts = mapped.split('.');
        let cur = out;
        for (let i = 0; i < parts.length - 1; i++) {
          cur[parts[i]] = cur[parts[i]] || {};
          cur = cur[parts[i]];
        }
        cur[parts[parts.length - 1]] = raw;
      } else {
        out[mapped] = raw;
      }
    }
    return out;
  }

  const preview = json.slice(0, 10).map(convertRow);

  report.sheets.push({ sheetName, headers, mapping, skuStats, previewCount: preview.length, preview });
}

console.log(JSON.stringify(report, null, 2));
