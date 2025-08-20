// Endpoint seguro: devuelve info del usuario autenticado usando el token JWT
exports.me = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'Token requerido' });
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token inválido' });
    const decoded = jwt.verify(token, JWT_SECRET);
    // Buscar en ambas colecciones
    let user = await User.findById(decoded.id).select('-password');
    if (!user) {
      user = await Administrador.findById(decoded.id).select('-contraseña');
      if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
      return res.json({ usuario: user.usuario, _id: user._id, rol: user.rol });
    }
    return res.json({ usuario: user.username, _id: user._id, rol: user.rol });
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};
const User = require('../models/user');
const Administrador = require('../models/administrador');
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

// Login adaptado: busca en ambas colecciones y acepta ambos formatos de campos
exports.login = async (req, res) => {
  const { username, password } = req.body;
  console.log('[auth.login] intento de login para username/usuario:', username);
  if (!username || !password) return res.status(400).json({ message: 'username y password requeridos' });
  try {
    // 1. Buscar en users (username/password)
    let user = await User.findOne({ username });
    let userType = 'user';
    let valid = false;
    if (user) {
      if (user.password) {
        if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
          valid = require('bcryptjs').compareSync(password, user.password);
          console.log(`[auth.login] comparación bcrypt: password enviada='${password}', hash almacenado='${user.password}', resultado=${valid}`);
        } else {
          valid = password === user.password;
          console.log(`[auth.login] comparación directa: enviada='${password}', almacenada='${user.password}', resultado=${valid}`);
        }
      }
      if (valid) {
        const token = jwt.sign({ id: user._id, username: user.username, rol: user.rol }, JWT_SECRET, { expiresIn: '8h' });
        const refresh = await createRefreshTokenForUser(user);
        console.log(`[auth.login] login exitoso para username: ${user.username}, rol: ${user.rol}`);
        return res.json({ response: { token, username: user.username, rol: user.rol, refresh } });
      }
    }
    // 2. Buscar en administradores (usuario/contraseña)
    let admin = await Administrador.findOne({ usuario: username });
    userType = 'administrador';
    valid = false;
    if (admin) {
      if (admin.contraseña) {
        if (admin.contraseña.startsWith('$2a$') || admin.contraseña.startsWith('$2b$')) {
          valid = require('bcryptjs').compareSync(password, admin.contraseña);
          console.log(`[auth.login] comparación bcrypt: password enviada='${password}', hash almacenado='${admin.contraseña}', resultado=${valid}`);
        } else {
          valid = password === admin.contraseña;
          console.log(`[auth.login] comparación directa: enviada='${password}', almacenada='${admin.contraseña}', resultado=${valid}`);
        }
      }
      if (valid) {
        const token = jwt.sign({ id: admin._id, usuario: admin.usuario }, JWT_SECRET, { expiresIn: '8h' });
        console.log(`[auth.login] login exitoso para administrador: ${admin.usuario}`);
        return res.json({ token, usuario: admin.usuario, _id: admin._id });
// Endpoint para obtener info del usuario autenticado por token
exports.me = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'Token requerido' });
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token inválido' });
    const decoded = jwt.verify(token, JWT_SECRET);
    // Buscar en administradores
    const admin = await require('../models/administrador').findById(decoded.id);
    if (!admin) return res.status(404).json({ message: 'Usuario no encontrado' });
    return res.json({ usuario: admin.usuario, _id: admin._id, rol: admin.rol });
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};
      }
    }
    // No encontrado o password incorrecto
    console.log('[auth.login] username/usuario no encontrado o password incorrecto en ninguna colección');
    return res.status(401).json({ message: 'Credenciales inválidas' });
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
