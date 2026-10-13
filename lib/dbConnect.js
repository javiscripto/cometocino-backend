const mongoose = require("mongoose");

mongoose.set("bufferCommands", false);

const cacheKey = Symbol.for("api-cometocino.mongoose");
const cache = globalThis[cacheKey] || {
  connection: null,
  promise: null,
};
globalThis[cacheKey] = cache;

async function dbConnect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("La variable MONGODB_URI es obligatoria");
  }

  if (mongoose.connection.readyState === 1) {
    cache.connection = mongoose.connection;
    return cache.connection;
  }

  if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) {
    cache.connection = null;
    cache.promise = null;
  }

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10_000,
        connectTimeoutMS: 10_000,
        socketTimeoutMS: 30_000,
      })
      .then((connection) => {
        cache.connection = connection.connection;
        return cache.connection;
      })
      .catch((error) => {
        cache.connection = null;
        cache.promise = null;
        throw error;
      });
  }

  return cache.promise;
}

module.exports = dbConnect;
