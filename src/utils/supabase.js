let supabaseClient = null;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.SUPABASE_ANON_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

try {
  if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
    const { createClient } = require('@supabase/supabase-js');
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    console.log('Supabase client inicializado en backend');
  }
} catch (e) {
  console.warn('No se pudo inicializar @supabase/supabase-js en backend (no instalado o falta key). Subidas usarán almacenamiento local.');
}

module.exports = { supabaseClient };
