const mongoose = require("mongoose");
const visitorSchema = new mongoose.Schema(
  {
    visitorId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    idProofType: { type: String, enum: ["AADHAAR", "PASSPORT", "DRIVING_LICENCE", "VOTER_ID", "OTHER", ""], default: "" },
    country: { type: String, trim: true, uppercase: true, default: "INDIA" },
    state: { type: String, trim: true, uppercase: true, default: "" },
    pinCode: { type: String, trim: true, default: "" },
    registeringDivision: { type: String, trim: true, default: "" },
    visitingDivision: { type: String, trim: true, default: "" },
    address: {
      type: String,
      trim: true,
    },
    organization: {
      type: String,
      trim: true,
    },
    idProofNo: {
      type: String,
      trim: true,
    },
    profilePhoto: {
      type: String,
      trim: true,
    },
    visitingPurpose: {
      type: String,
      required: true,
      enum: ["Audit", "Relative", "Suppliers", "Others"],
    },
    remarks: {
      type: String,
      trim: true,
    },
    visitingEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "CHECKED_IN", "CHECKED_OUT"],
      default: "PENDING",
      required: true,
    },
    inTime: {
      type: Date,
      default: null,
    },
    outTime: {
      type: Date,
      default: null,
    },
    validationHours: {
      type: Number,
      default: 24,
      min: 1,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
    
rejectionReason: {
  type: String,
  trim: true,
  maxlength: 500,
  default: null,
},

    visitCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    qrTokenHash: {
      type: String,
      default: null,
      select: false,
    },
    qrTokenEncrypted: {
  type: String,
  default: null,
  select: false,
},
    passIssuedAt: {
      type: Date,
      default: null,
    },
    passExpiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Visitor", visitorSchema);
