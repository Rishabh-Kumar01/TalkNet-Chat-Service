const { mongoose } = require("../utils/import.util");
const { DB_URL } = require("./server.config");

const connect = async () => {
  try {
    await mongoose.connect(DB_URL);
    console.log("CONNECTED TO DATABASE");
  } catch (error) {
    console.log("DATABASE CONNECTION ERROR", error);
    throw error; // Re-throwing the error for the caller to handle if needed
  }
};

module.exports = { connect };
