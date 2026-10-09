const authService = require("../services/auth.service");

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 8 * 60 * 60 * 1000,
    path: "/",
  };
}

function showLogin(req, res) {
  return res.render("auth/login", { error: null });
}

async function loginPage(req, res) {
  const result = await authService.login(req.body.email, req.body.password);
  if (!result || result.user.role !== "admin") {
    return res.status(401).render("auth/login", {
      error: "Correo o contraseña incorrectos, o la cuenta no es administradora.",
    });
  }
  res.cookie("adminToken", result.token, cookieOptions());
  return res.redirect(303, "/admin/orders");
}

async function loginApi(req, res) {
  const result = await authService.login(req.body.email, req.body.password);
  if (!result) return res.status(401).json({ error: "Correo o contraseña incorrectos" });
  if (result.user.role !== "admin") {
    return res.status(403).json({ error: "Se requieren permisos de administrador" });
  }
  return res.json(result);
}

function logout(req, res) {
  res.clearCookie("adminToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
  return res.redirect("/admin/login");
}

function currentUser(req, res) {
  return res.json({ data: req.user });
}

module.exports = { showLogin, loginPage, loginApi, logout, currentUser };
