const jwt = require("jsonwebtoken");
const authService = require("../services/auth.service");

async function requireAdmin(req, res, next) {
  const authorization = req.get("authorization") || "";
  const bearerToken = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;
  const token = bearerToken || req.cookies?.adminToken;

  const isAdminPage = req.originalUrl.startsWith("/admin/");
  if (!token) {
    if (isAdminPage) return res.redirect("/admin/login");
    return res.status(401).json({ error: "Autenticación requerida" });
  }

  try {
    const payload = jwt.verify(token, authService.getJwtSecret());
    const user = await authService.findActiveUserById(payload.sub);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Se requieren permisos de administrador" });
    }
    req.user = user;
    return next();
  } catch (error) {
    if (isAdminPage) return res.redirect("/admin/login");
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

module.exports = requireAdmin;
