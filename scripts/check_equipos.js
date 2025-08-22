require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

const db = process.env.LINK_DB;
if (!db) {
  console.error('ERROR: no se encontró LINK_DB en .env');
  process.exit(2);
}

async function run() {
  try {
    await mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true });
    // Cargar el modelo
    const Equipo = require(path.join(__dirname, '..', 'src', 'models', 'equipo'));
    console.log('Modelo Equipo -> collection name:', Equipo.collection.name);
    const total = await Equipo.countDocuments({});
    console.log('Total documentos en colección:', total);
    const estados = await Equipo.distinct('estado');
    console.log('Distinct estados:', estados);
    const sample = await Equipo.find({}).limit(5).lean();
    console.log('Sample docs (5):', sample);
    // contar activos
    const activos = await Equipo.countDocuments({ estado: 'activo' });
    console.log('Documentos con estado:"activo":', activos);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error al comprobar colección:', err.message);
    process.exit(1);
  }
}

run();
