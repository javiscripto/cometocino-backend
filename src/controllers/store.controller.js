const storeHoursService = require("../services/store-hours.service");

async function getStatus(req, res) {
  res.set("Cache-Control", "no-store");
  return res.json({ data: await storeHoursService.getStoreStatus() });
}

async function getAdminHours(req, res) {
  const weeklyHours = await storeHoursService.getWeeklyHours();
  return res.json({ data: { weeklyHours } });
}

async function updateAdminHours(req, res) {
  const settings = await storeHoursService.updateWeeklyHours(req.body.weeklyHours);
  return res.json({ data: settings });
}

async function showHoursPage(req, res) {
  const weeklyHours = await storeHoursService.getWeeklyHours();
  return res.render("store/hours", {
    weeklyHours,
    days: storeHoursService.DAYS,
    dayLabels: storeHoursService.DAY_LABELS,
    updated: req.query.updated === "1",
    error: req.query.error || null,
  });
}

async function submitHoursPage(req, res) {
  try {
    await storeHoursService.updateWeeklyHours(req.body.weeklyHours);
    return res.redirect(303, "/admin/store-hours?updated=1");
  } catch (error) {
    const weeklyHours = req.body.weeklyHours || await storeHoursService.getWeeklyHours();
    return res.status(400).render("store/hours", {
      weeklyHours,
      days: storeHoursService.DAYS,
      dayLabels: storeHoursService.DAY_LABELS,
      updated: false,
      error: error.message,
    });
  }
}

module.exports = { getStatus, getAdminHours, updateAdminHours, showHoursPage, submitHoursPage };
