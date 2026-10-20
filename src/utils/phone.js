function normalizePhone(phone) {
  let digits = String(phone || "").replace(/\D/g, "");
  if (digits.startsWith("56")) digits = digits.slice(2);
  if (digits.length === 9) return `56${digits}`;
  return digits;
}

module.exports = { normalizePhone };
