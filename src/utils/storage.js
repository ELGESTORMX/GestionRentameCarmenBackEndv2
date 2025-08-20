const path = require('path');
const fs = require('fs');
const { supabaseClient } = require('./supabase');

const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

async function storeFile(buffer, filename, mimeType = 'application/octet-stream') {
  if (supabaseClient) {
    try {
      const bucket = process.env.SUPABASE_BUCKET || 'uploads';
      const safeNamePart = String(filename || 'file').replace(/[^a-zA-Z0-9._-]/g, '_');
      const key = `${Date.now()}_${safeNamePart}`;
      const { data, error } = await supabaseClient.storage.from(bucket).upload(key, buffer, { contentType: mimeType, upsert: false });
      if (error) throw error;
      // Algunas versiones retornan publicUrl
      const { data: urlData, error: urlError } = await supabaseClient.storage.from(bucket).getPublicUrl(key);
      if (urlError) throw urlError;
      const publicUrl = (urlData && (urlData.publicUrl || urlData.publicURL || urlData.publicURL)) || null;
      if (publicUrl) return publicUrl;
      if (process.env.SUPABASE_URL) {
        const supaUrl = process.env.SUPABASE_URL.replace(/\/$/, '');
        return `${supaUrl}/storage/v1/object/public/${bucket}/${encodeURIComponent(key)}`;
      }
    } catch (e) {
      console.error('Supabase upload error:', e.message || e);
      // fallback
    }
  }
  const safeName = `${Date.now()}_${filename}`.replace(/[^a-zA-Z0-9._-]/g, '_');
  const outPath = path.join(uploadsDir, safeName);
  fs.writeFileSync(outPath, buffer);
  return `/uploads/${safeName}`;
}

module.exports = { storeFile };
