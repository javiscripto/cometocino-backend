const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const TOKEN_TTL = "8h";

function getJwtSecret() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET debe estar configurado con al menos 32 caracteres");
  }
  return process.env.JWT_SECRET;
}

async function login(email, password) {
  if (!email || !password) return null;
  const user = await User.findOne({ email: String(email).trim().toLowerCase() }).select("+passwordHash");
  if (!user || !user.active || !(await bcrypt.compare(password, user.passwordHash))) return null;

  const token = jwt.sign({ sub: user.id }, getJwtSecret(), { expiresIn: TOKEN_TTL });
  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

async function findActiveUserById(id) {
  return User.findOne({ _id: id, active: true }).select("name email role active");
}

async function ensureAdminFromEnvironment() {
  getJwtSecret();
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error("Configura ADMIN_EMAIL y ADMIN_PASSWORD para crear la cuenta administradora inicial");
  }
  if (ADMIN_PASSWORD.length < 12) {
    throw new Error("ADMIN_PASSWORD debe tener al menos 12 caracteres");
  }

  const email = ADMIN_EMAIL.trim().toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== "admin") {
      existing.role = "admin";
      await existing.save();
    }
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await User.create({
    name: process.env.ADMIN_NAME || "Administrador",
    email,
    passwordHash,
    role: "admin",
  });
  console.log(`Cuenta administradora inicial creada: ${email}`);
}

module.exports = { login, findActiveUserById, ensureAdminFromEnvironment, getJwtSecret };
