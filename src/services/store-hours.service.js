const StoreSettings = require("../models/store-settings.model");
const defaultWeeklyHours = require("../config/store-hours");

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_LABELS = {
  Mon: "Lunes",
  Tue: "Martes",
  Wed: "Miércoles",
  Thu: "Jueves",
  Fri: "Viernes",
  Sat: "Sábado",
  Sun: "Domingo",
};
const timeZone = process.env.STORE_TIME_ZONE || "America/Santiago";

function toMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function normalizeWeeklyHours(weeklyHours) {
  return DAYS.map((day) => ({
    day,
    intervals: (weeklyHours[day] || []).map(({ open, close }) => ({ open, close })),
  }));
}

async function getSettings() {
  let settings = await StoreSettings.findOne({ key: "default" });
  if (!settings) {
    settings = await StoreSettings.create({
      key: "default",
      weeklyHours: normalizeWeeklyHours(defaultWeeklyHours),
    });
  }
  return settings;
}

async function getWeeklyHours() {
  const settings = await getSettings();
  return Object.fromEntries(
    settings.weeklyHours.map(({ day, intervals }) => [day, intervals]),
  );
}

function parseAndValidateWeeklyHours(input) {
  if (!input || typeof input !== "object") {
    const error = new Error("Debes indicar el horario semanal");
    error.status = 400;
    throw error;
  }

  const weeklyHours = {};
  for (const day of DAYS) {
    const rawIntervals = input[day] || [];
    const list = Array.isArray(rawIntervals) ? rawIntervals : [rawIntervals];
    const intervals = list
      .filter((item) => item && (item.open || item.close))
      .map(({ open, close }) => ({
        open: String(open || "").trim(),
        close: String(close || "").trim(),
      }));

    for (const interval of intervals) {
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(interval.open) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(interval.close)) {
        const error = new Error(`Completa una hora válida de apertura y cierre para ${DAY_LABELS[day]}`);
        error.status = 400;
        throw error;
      }
      if (toMinutes(interval.open) >= toMinutes(interval.close)) {
        const error = new Error(`La hora de cierre debe ser posterior a la apertura para ${DAY_LABELS[day]}`);
        error.status = 400;
        throw error;
      }
    }

    intervals.sort((a, b) => toMinutes(a.open) - toMinutes(b.open));
    for (let index = 1; index < intervals.length; index += 1) {
      if (toMinutes(intervals[index].open) < toMinutes(intervals[index - 1].close)) {
        const error = new Error(`Los horarios de ${DAY_LABELS[day]} no pueden superponerse`);
        error.status = 400;
        throw error;
      }
    }
    weeklyHours[day] = intervals;
  }
  return weeklyHours;
}

async function updateWeeklyHours(input) {
  const weeklyHours = parseAndValidateWeeklyHours(input);
  return StoreSettings.findOneAndUpdate(
    { key: "default" },
    { $set: { weeklyHours: normalizeWeeklyHours(weeklyHours) } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );
}

async function getStoreStatus(now = new Date()) {
  const weeklyHours = await getWeeklyHours();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  const day = values.weekday;
  const localTime = `${values.hour}:${values.minute}`;
  const currentMinutes = toMinutes(localTime);
  const intervals = weeklyHours[day] || [];
  const acceptingOrders = intervals.some(
    ({ open, close }) => currentMinutes >= toMinutes(open) && currentMinutes < toMinutes(close),
  );

  return {
    acceptingOrders,
    timeZone,
    checkedAt: now.toISOString(),
    localTime,
    today: { day, intervals },
    message: acceptingOrders
      ? "Estamos recibiendo pedidos."
      : "En este momento no estamos recibiendo pedidos; abrimos pronto.",
  };
}

module.exports = { DAYS, DAY_LABELS, getWeeklyHours, updateWeeklyHours, getStoreStatus };
