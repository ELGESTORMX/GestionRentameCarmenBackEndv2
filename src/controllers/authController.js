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
  const { usuario, contraseña, rol } = req.body;
  if (!usuario || !contraseña) return res.status(400).json({ message: 'usuario y contraseña requeridos' });
  try {
    const existing = await User.findOne({ usuario });
    if (existing) return res.status(400).json({ message: 'Usuario ya existe' });
    const hash = bcrypt.hashSync(contraseña, 8);
    const u = new User({ usuario, contraseñaHash: hash, rol: rol || 'user' });
    await u.save();
    return res.json({ data: { usuario: u.usuario, rol: u.rol } });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Login con logs de depuración y fallback case-insensitive
exports.login = async (req, res) => {
  const { usuario, contraseña } = req.body;
  console.log('[auth.login] intento de login para usuario:', usuario);
  if (!usuario || !contraseña) return res.status(400).json({ message: 'usuario y contraseña requeridos' });
  try {
    // Buscar en users
    let user = await User.findOne({ usuario });
    let userType = 'user';
    // Si no existe, buscar en administradores (v1)
    if (!user) {
      try {
        const Admins = mongoose.connection.modelNames().includes('Admins')
          ? mongoose.model('Admins')
          : require('../../ejemplos version 1/rentameBackDefinitivo/models/Admins.js').default;
        user = await Admins.findOne({ usuario });
        userType = 'admin';
      } catch (e) {
        // Si no existe el modelo, ignorar
      }
    }
    if (!user) {
      console.log('[auth.login] usuario no encontrado en users ni administradores');
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    // Compatibilidad: aceptar contraseña en texto plano o bcrypt
    let valid = false;
    if (user.contraseña) {
      // Si la contraseña almacenada parece un hash bcrypt
      if (user.contraseña.startsWith('$2a$') || user.contraseña.startsWith('$2b$')) {
        valid = require('bcryptjs').compareSync(contraseña, user.contraseña);
        console.log('[auth.login] comparación bcrypt:', valid);
      } else {
        valid = contraseña === user.contraseña;
        console.log('[auth.login] comparación directa:', valid);
      }
    } else if (user.contraseñaHash) {
      valid = require('bcryptjs').compareSync(contraseña, user.contraseñaHash);
      console.log('[auth.login] comparación bcrypt (contraseñaHash):', valid);
    }
    if (!valid) return res.status(401).json({ message: 'Credenciales inválidas' });
    const token = jwt.sign({ id: user._id, usuario: user.usuario, rol: user.rol }, JWT_SECRET, { expiresIn: '8h' });
    const refresh = await createRefreshTokenForUser(user);
    return res.json({ response: { token, usuario: user.usuario, rol: user.rol, refresh } });
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
