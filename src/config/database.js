const mongoose = require("mongoose");

async function connectDatabase() {
  const { MONGODB_URI } = process.env;

  if (!MONGODB_URI) {
    throw new Error("La variable MONGODB_URI es obligatoria");
  }

  await mongoose.connect(MONGODB_URI);
  console.log("db connected");
}

module.exports = connectDatabase;
