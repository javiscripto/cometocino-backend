// Ajusta estos intervalos al horario real de atención.
// Los días usan las abreviaturas inglesas que entrega Intl.DateTimeFormat.
const weeklyHours = {
  Mon: [{ open: "15:00", close: "22:00" }],
  Tue: [{ open: "15:00", close: "22:00" }],
  Wed: [{ open: "15:00", close: "22:00" }],
  Thu: [{ open: "15:00", close: "22:00" }],
  Fri: [{ open: "15:00", close: "23:00" }],
  Sat: [{ open: "15:00", close: "23:00" }],
  Sun: [{ open: "15:00", close: "21:00" }],
};

module.exports = weeklyHours;
