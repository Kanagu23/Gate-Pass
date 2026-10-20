const mongoose = require("mongoose");
const { DIVISIONS } = require("../config/divisions");
const divisionSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, enum: DIVISIONS.map((item) => item.code) },
  name: { type: String, required: true, trim: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
module.exports = mongoose.model("Division", divisionSchema);
