const dbConnect = require("../../lib/dbConnect");

async function connectDatabase() {
  await dbConnect();
  console.log("db connected");
}

module.exports = connectDatabase;
