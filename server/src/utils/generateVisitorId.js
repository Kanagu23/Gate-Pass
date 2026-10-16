
const Counter = require("../models/Counter");

const generateVisitorId = async () => {
  let counter;

  try {
    counter = await Counter.findOneAndUpdate(
      { _id: "visitorId" },
      { $inc: { seq: 1 } },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );
  } catch (error) {
    // Handle a race when the counter is first created.
    if (error.code !== 11000) {
      throw error;
    }

    counter = await Counter.findOneAndUpdate(
      { _id: "visitorId" },
      { $inc: { seq: 1 } },
      { new: true }
    );
  }

  return `VIS-${String(counter.seq).padStart(6, "0")}`;
};

module.exports = generateVisitorId;
