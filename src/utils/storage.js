const path = require('path');
const fs = require('fs');
// ...línea eliminada: supabaseClient ya no se usa en backend...

const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

async function storeFile(buffer, filename, mimeType = 'application/octet-stream') {
  // ...código de supabaseClient eliminado...
  const safeName = `${Date.now()}_${filename}`.replace(/[^a-zA-Z0-9._-]/g, '_');
  const outPath = path.join(uploadsDir, safeName);
  fs.writeFileSync(outPath, buffer);
  return `/uploads/${safeName}`;
}

module.exports = { storeFile };
