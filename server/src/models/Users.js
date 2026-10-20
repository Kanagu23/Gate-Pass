
const mongoose = require("mongoose");
const {
  PERMISSION_VALUES,
} = require("../constants/permissions");
const userSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      trim: true,
      uppercase: true,
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    division: { type: String, trim: true, default: "" },
    profilePhoto: { type: String, default: "" },
    department: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["SYSTEM_ADMIN", "ADMIN", "DIVISION_HR", "GATE_EMPLOYEE", "EMPLOYEE", "DIRECTOR"],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    permissions: {
  type: [
    {
      type: String,
      enum: PERMISSION_VALUES,
    },
  ],
  default: [],
},
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
