const { getStoreStatus } = require("../services/store-hours.service");

function getStatus(req, res) {
  res.set("Cache-Control", "no-store");
  return res.json({ data: getStoreStatus() });
}

module.exports = { getStatus };
