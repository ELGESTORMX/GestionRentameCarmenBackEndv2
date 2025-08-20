const User = require('../models/user');
const RefreshToken = require('../models/refreshToken');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.SECRET_KEY || 'dev_secret_key';

async function createRefreshTokenForUser(user) {
  const refreshToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const rt = new RefreshToken({ token: refreshToken, user: user._id, expiresAt });
  await rt.save();
  return refreshToken;
}

async function revokeRefreshToken(tokenStr, replacedBy = null) {
  const rt = await RefreshToken.findOne({ token: tokenStr });
  if (!rt) return false;
  rt.revoked = true;
  if (replacedBy) rt.replacedByToken = replacedBy;
  await rt.save();
  return true;
}

async function validateRefreshToken(tokenStr) {
  if (!tokenStr) return null;
  const rt = await RefreshToken.findOne({ token: tokenStr });
  if (!rt) return null;
  if (rt.revoked) return null;
  if (rt.expiresAt < new Date()) return null;
  return rt;
}

exports.register = async (req, res) => {
  const { username, password, rol } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'username y password requeridos' });
  try {
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ message: 'Usuario ya existe' });
    const hash = bcrypt.hashSync(password, 8);
    const u = new User({ username, password: hash, rol: rol || 'user' });
    await u.save();
    return res.json({ data: { username: u.username, rol: u.rol } });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Login actualizado para usar username y password, pero acepta ambos formatos para compatibilidad
exports.login = async (req, res) => {
  const { username, password } = req.body;
  console.log('[auth.login] intento de login para username:', username);
  if (!username || !password) return res.status(400).json({ message: 'username y password requeridos' });
  try {
    // Buscar en users por username
    let user = await User.findOne({ username });
    let userType = 'user';
    // Si no existe, buscar en administradores (v1) por username
    if (!user) {
      try {
        const Admins = mongoose.connection.modelNames().includes('Admins')
          ? mongoose.model('Admins')
          : require('../../ejemplos version 1/rentameBackDefinitivo/models/Admins.js').default;
        user = await Admins.findOne({ username });
        userType = 'admin';
      } catch (e) {
        // Si no existe el modelo, ignorar
      }
    }
    if (!user) {
      console.log('[auth.login] username no encontrado en users ni administradores');
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    console.log(`[auth.login] username encontrado: ${user.username}, colección: ${userType}`);
    // Compatibilidad: aceptar password en texto plano o bcrypt
    let valid = false;
    if (user.password) {
      if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        valid = require('bcryptjs').compareSync(password, user.password);
        console.log(`[auth.login] comparación bcrypt: password enviada='${password}', hash almacenado='${user.password}', resultado=${valid}`);
      } else {
        valid = password === user.password;
        console.log(`[auth.login] comparación directa: enviada='${password}', almacenada='${user.password}', resultado=${valid}`);
      }
    }
    if (!valid) {
      console.log('[auth.login] password incorrecto para username:', user.username);
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    const token = jwt.sign({ id: user._id, username: user.username, rol: user.rol }, JWT_SECRET, { expiresIn: '8h' });
    const refresh = await createRefreshTokenForUser(user);
    console.log(`[auth.login] login exitoso para username: ${user.username}, rol: ${user.rol}`);
    return res.json({ response: { token, username: user.username, rol: user.rol, refresh } });
  } catch (err) {
    console.error('[auth.login] error:', err);
    return res.status(500).json({ message: err.message });
  }
};

exports.refresh = async (req, res) => {
  const { refresh } = req.body;
  if (!refresh) return res.status(400).json({ message: 'Refresh token requerido' });
  try {
    let decoded;
    try { decoded = jwt.verify(refresh, JWT_SECRET); } catch (e) { return res.status(401).json({ message: 'Refresh inválido' }); }
    const rt = await validateRefreshToken(refresh);
    if (!rt) return res.status(401).json({ message: 'Refresh inválido o revocado' });
    const user = await User.findById(rt.user);
    if (!user) return res.status(401).json({ message: 'Usuario no encontrado' });
    const newRefresh = await createRefreshTokenForUser(user);
    await revokeRefreshToken(refresh, newRefresh);
    const accessToken = jwt.sign({ id: user._id, usuario: user.usuario, rol: user.rol }, JWT_SECRET, { expiresIn: '8h' });
    return res.json({ token: accessToken, refresh: newRefresh });
  } catch (err) {
    return res.status(401).json({ message: 'Refresh inválido' });
  }
};

exports.logout = async (req, res) => {
  const { refresh } = req.body || {};
  try {
    if (refresh) {
      const ok = await revokeRefreshToken(refresh);
      if (!ok) return res.status(404).json({ message: 'Refresh token no encontrado' });
      return res.json({ message: 'Refresh token revocado' });
    }
    const auth = req.headers.authorization;
    if (!auth) return res.status(400).json({ message: 'Refresh token o Authorization header requerido' });
    const token = auth.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = decoded.id;
      await RefreshToken.updateMany({ user: userId, revoked: false }, { $set: { revoked: true } });
      return res.json({ message: 'Todos los refresh tokens del usuario han sido revocados' });
    } catch (e) {
      return res.status(401).json({ message: 'Token de acceso inválido' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = exports;
