const Usuario = require('../models/usuario');
const Administrador = require('../models/administrador');
const RefreshToken = require('../models/refreshToken');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.SECRET_KEY || 'dev_secret_key';

// Endpoint seguro: devuelve info del usuario autenticado usando el token JWT
exports.me = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'Token requerido' });
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token inválido' });
    const decoded = jwt.verify(token, JWT_SECRET);
    // Buscar en ambas colecciones
    let user = await Usuario.findById(decoded.id).select('-contraseña');
    if (!user) {
      user = await Administrador.findById(decoded.id).select('-contraseña');
      if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
      return res.json({ usuario: user.usuario, _id: user._id, rol: user.rol });
    }
    return res.json({ usuario: user.usuario, _id: user._id, rol: user.rol });
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

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
  // aceptar ambos formatos: usuario/contraseña o username/password
  const usuario = req.body.usuario || req.body.username;
  const contraseña = req.body.contraseña || req.body.password;
  if (!usuario || !contraseña) return res.status(400).json({ message: 'usuario y contraseña requeridos' });
  try {
    const existing = await Usuario.findOne({ usuario });
    if (existing) return res.status(400).json({ message: 'Usuario ya existe' });
    const hash = bcrypt.hashSync(contraseña, 8);
    const u = new Usuario({ usuario, contraseña: hash, rol: req.body.rol || 2 });
    await u.save();
    return res.json({ data: { usuario: u.usuario, rol: u.rol } });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Login adaptado: busca en ambas colecciones y acepta ambos formatos de campos
exports.login = async (req, res) => {
  // aceptar ambos formatos: usuario/contraseña o username/password
  const usuario = req.body.usuario || req.body.username;
  const contraseña = req.body.contraseña || req.body.password;
  console.log('[auth.login] intento de login para usuario:', usuario);
  if (!usuario || !contraseña) return res.status(400).json({ message: 'usuario y contraseña requeridos' });
  try {
    // 1. Buscar en usuarios (usuario/contraseña)
    let user = await Usuario.findOne({ usuario });
    let valid = false;
    if (user) {
      if (user.contraseña) {
        if (user.contraseña.startsWith('$2a$') || user.contraseña.startsWith('$2b$')) {
          valid = bcrypt.compareSync(contraseña, user.contraseña);
          console.log(`[auth.login] comparación bcrypt usuario: resultado=${valid}`);
        } else {
          valid = contraseña === user.contraseña;
          console.log(`[auth.login] comparación directa usuario: resultado=${valid}`);
        }
      }
      if (valid) {
        const token = jwt.sign({ id: user._id, usuario: user.usuario, rol: user.rol }, JWT_SECRET, { expiresIn: '8h' });
        const refresh = await createRefreshTokenForUser(user);
        console.log(`[auth.login] login exitoso para usuario: ${user.usuario}, rol: ${user.rol}`);
        return res.json({ token, usuario: user.usuario, rol: user.rol, refresh });
      }
    }

    // 2. Buscar en administradores (usuario/contraseña)
    let admin = await Administrador.findOne({ usuario });
    valid = false;
    if (admin) {
      if (admin.contraseña) {
        if (admin.contraseña.startsWith('$2a$') || admin.contraseña.startsWith('$2b$')) {
          valid = bcrypt.compareSync(contraseña, admin.contraseña);
          console.log(`[auth.login] comparación bcrypt administrador: resultado=${valid}`);
        } else {
          valid = contraseña === admin.contraseña;
          console.log(`[auth.login] comparación directa administrador: resultado=${valid}`);
        }
      }
      if (valid) {
        const rol = admin.rol || 1;
        const token = jwt.sign({ id: admin._id, usuario: admin.usuario, rol }, JWT_SECRET, { expiresIn: '8h' });
        // crear refresh también para administradores para homogeneizar la respuesta
        const refresh = await createRefreshTokenForUser(admin);
        console.log(`[auth.login] login exitoso para administrador: ${admin.usuario}`);
        return res.json({ token, usuario: admin.usuario, rol, refresh });
      }
    }

    return res.status(401).json({ message: 'Credenciales inválidas' });
  } catch (err) {
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
    const user = await Usuario.findById(rt.user);
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
