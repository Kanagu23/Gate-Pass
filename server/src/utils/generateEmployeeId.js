
const Counter = require("../models/Counter");

async function generateEmployeeId() {
  let counter;

  try {
    counter = await Counter.findOneAndUpdate(
      { _id: "employeeId" },
      { $inc: { seq: 1 } },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );
  } catch (error) {
    // Concurrent first-time upserts can race on the counter's _id.
    if (error.code !== 11000) throw error;

    counter = await Counter.findOneAndUpdate(
      { _id: "employeeId" },
      { $inc: { seq: 1 } },
      { new: true }
    );
  }

  return `EMP${String(counter.seq).padStart(4, "0")}`;
}

module.exports = generateEmployeeId;
