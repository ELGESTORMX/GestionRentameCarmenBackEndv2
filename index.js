// Lanzador mínimo del servidor — delega toda la lógica a src/app.js
require('dotenv').config();

try {
  const appEntry = require('./src/app');
  if (appEntry && typeof appEntry.start === 'function') {
    appEntry.start();
  } else {
    console.error('src/app no exporta start(). Revisa src/app.js');
    process.exit(1);
  }
} catch (e) {
  console.error('Error al iniciar la aplicación desde src/app:', e.message || e);
  process.exit(1);
}
