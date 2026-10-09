const weeklyHours = require("../config/store-hours");

const timeZone = process.env.STORE_TIME_ZONE || "America/Santiago";

function toMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function getStoreStatus(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );

  const day = values.weekday;
  const localTime = `${values.hour}:${values.minute}`;
  const currentMinutes = toMinutes(localTime);
  const intervals = weeklyHours[day] || [];
  const acceptingOrders = intervals.some(
    ({ open, close }) =>
      currentMinutes >= toMinutes(open) && currentMinutes < toMinutes(close),
  );

  return {
    acceptingOrders,
    timeZone,
    checkedAt: now.toISOString(),
    localTime,
    today: { day, intervals },
    message: acceptingOrders
      ? "Estamos recibiendo pedidos."
      : "En este momento no estamos recibiendo pedidos! abrimos pronto",
  };
}

module.exports = { getStoreStatus };
