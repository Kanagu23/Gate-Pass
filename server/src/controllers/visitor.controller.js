const mongoose = require("mongoose");
const QRCode = require("qrcode");
const Visitor = require("../models/Visitor");
const User = require("../models/Users");
const generateVisitorId = require("../utils/generateVisitorId");
const { generatePassToken, hashPassToken } = require("../utils/passToken");

const validPurposes = ["Audit", "Relative", "Suppliers", "Others"];

const registerVisitor = async (req, res) => {
  try {
    const {
      name,
      mobile,
      email,
      address,
      organization,
      idProofNo,
      profilePhoto,
      visitingPurpose,
      remarks,
      visitingEmployee,
      validationHours,
    } = req.body;

    // Only gate employees and admins can register visitors.
    if (!["GATE_EMPLOYEE", "ADMIN"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to register visitors",
      });
    }

    // Validate required fields.
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof mobile !== "string" ||
      !mobile.trim() ||
      typeof visitingPurpose !== "string" ||
      !validPurposes.includes(visitingPurpose) ||
      typeof visitingEmployee !== "string" ||
      !mongoose.isValidObjectId(visitingEmployee)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, mobile, valid visiting purpose, and visiting employee are required",
      });
    }

    // Validate optional text fields.
    const optionalFields = {
      email,
      address,
      organization,
      idProofNo,
      profilePhoto,
      remarks,
    };

    for (const [field, value] of Object.entries(optionalFields)) {
      if (value !== undefined && typeof value !== "string") {
        return res.status(400).json({
          success: false,
          message: `${field} must be a string`,
        });
      }
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    const hours = validationHours === undefined ? 24 : validationHours;

    if (!Number.isInteger(hours) || hours < 1 || hours > 168) {
      return res.status(400).json({
        success: false,
        message: "Validation hours must be between 1 and 168",
      });
    }

    // The selected person must be an active employee or director.
    const employee = await User.findOne({
      _id: visitingEmployee,
      role: { $in: ["EMPLOYEE", "DIRECTOR"] },
      isActive: true,
    }).select("_id name employeeId department email phone role");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Active visiting employee or director not found",
      });
    }

    // Use the existing Counter model through the visitor ID generator.
    const visitorId = await generateVisitorId();

    const visitor = await Visitor.create({
      visitorId,
      name: name.trim(),
      mobile: mobile.trim(),
      email: email?.trim().toLowerCase(),
      address: address?.trim(),
      organization: organization?.trim(),
      idProofNo: idProofNo?.trim(),
      profilePhoto: profilePhoto?.trim(),
      visitingPurpose,
      remarks: remarks?.trim(),
      visitingEmployee: employee._id,
      createdBy: req.user._id,
      validationHours: hours,
      status: "PENDING",
    });

    return res.status(201).json({
      success: true,
      message: "Visitor registered successfully. Approval is pending.",
      visitor: {
        id: visitor._id,
        visitorId: visitor.visitorId,
        name: visitor.name,
        mobile: visitor.mobile,
        visitingPurpose: visitor.visitingPurpose,
        visitingEmployee: {
          id: employee._id,
          employeeId: employee.employeeId,
          name: employee.name,
          department: employee.department,
          email: employee.email,
          phone: employee.phone,
          role: employee.role,
        },
        status: visitor.status,
        validationHours: visitor.validationHours,
        createdAt: visitor.createdAt,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A duplicate value was detected. Please retry.",
      });
    }

    throw error;
  }
};

const getPendingVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.find({
      visitingEmployee: req.user._id,
      status: "PENDING",
    })
      .select("-__v")
      .populate("createdBy", "name employeeId department role")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: visitors.length,
      visitors,
    });
  } catch (error) {
    throw error;
  }
};

const approveVisitor = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid visitor ID",
    });
  }

  const { token, tokenHash } = generatePassToken();
  const approvedAt = new Date();

  // Only approve a pending visitor assigned to this employee.
  const visitor = await Visitor.findOneAndUpdate(
    {
      _id: id,
      visitingEmployee: req.user._id,
      status: "PENDING",
    },
    [
      {
        $set: {
          // Approval and automatic check-in
          status: "CHECKED_IN",
          approvedBy: req.user._id,
          approvedAt,
          inTime: approvedAt,

          // Secure QR pass
          qrTokenHash: tokenHash,
          passIssuedAt: approvedAt,
          passExpiresAt: {
            $dateAdd: {
              startDate: approvedAt,
              unit: "hour",
              amount: "$validationHours",
            },
          },
        },
      },
    ],
    {
      new: true,
      updatePipeline: true,
    },
  );

  if (!visitor) {
    return res.status(409).json({
      success: false,
      message: "Visitor not found, not assigned to you, or already processed",
    });
  }

  // QR contains the random token, not personal information.
  const qrCode = await QRCode.toDataURL(token, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 300,
  });


return res.status(200).json({
  success: true,
  message: "Visitor approved and checked in successfully",
  visitor: {
    id: visitor._id,
    visitorId: visitor.visitorId,
    name: visitor.name,
    status: visitor.status,
    approvedAt: visitor.approvedAt,
    inTime: visitor.inTime,
    passExpiresAt: visitor.passExpiresAt,
    qrCode,
  },
});

};

const rejectVisitor = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid visitor ID",
    });
  }

  // Only the assigned employee/director can reject
  // a visitor whose status is still PENDING.
  const visitor = await Visitor.findOneAndUpdate(
    {
      _id: id,
      visitingEmployee: req.user._id,
      status: "PENDING",
    },
    {
      $set: {
        status: "REJECTED",
        rejectedAt: new Date(),
      },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!visitor) {
    return res.status(404).json({
      success: false,
      message:
        "Pending visitor not found, not assigned to you, or already processed",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Visitor rejected successfully",
    visitor: {
      id: visitor._id,
      visitorId: visitor.visitorId,
      name: visitor.name,
      status: visitor.status,
      rejectedAt: visitor.rejectedAt,
    },
  });
};

const checkInVisitor = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid visitor ID",
    });
  }

  const visitor = await Visitor.findOneAndUpdate(
    {
      _id: id,
      status: "APPROVED",
    },
    {
      $set: {
        status: "CHECKED_IN",
        inTime: new Date(),
      },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!visitor) {
    return res.status(409).json({
      success: false,
      message: "Visitor not found or not eligible for check-in",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Visitor checked in successfully",
    visitor: {
      id: visitor._id,
      visitorId: visitor.visitorId,
      name: visitor.name,
      status: visitor.status,
      inTime: visitor.inTime,
    },
  });
};

const checkOutVisitor = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid visitor ID",
    });
  }

  const visitor = await Visitor.findOneAndUpdate(
    {
      _id: id,
      status: "CHECKED_IN",
      inTime: { $ne: null },
      outTime: null,
    },
    {
      $set: {
        status: "CHECKED_OUT",
        outTime: new Date(),
      },
      $inc: {
        visitCount: 1,
      },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!visitor) {
    return res.status(409).json({
      success: false,
      message: "Visitor not found or not eligible for check-out",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Visitor checked out successfully",
    visitor: {
      id: visitor._id,
      visitorId: visitor.visitorId,
      name: visitor.name,
      status: visitor.status,
      inTime: visitor.inTime,
      outTime: visitor.outTime,
      visitCount: visitor.visitCount,
    },
  });
};

const verifyVisitorPass = async (req, res) => {
  const { token } = req.body || {};

  // Validate the QR token format.
  if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) {
    return res.status(400).json({
      success: false,
      message: "Invalid QR token format",
    });
  }

  // Hash the token before searching MongoDB.
  const tokenHash = hashPassToken(token);

  const visitor = await Visitor.findOne({
    qrTokenHash: tokenHash,
  })
    .select("+qrTokenHash")
    .populate(
      "visitingEmployee",
      "employeeId name department phone email role",
    );

  if (!visitor) {
    return res.status(404).json({
      success: false,
      message: "Visitor pass not found",
    });
  }

  // Only approved or currently checked-in passes
  // are eligible for verification.
  if (!["APPROVED", "CHECKED_IN"].includes(visitor.status)) {
    return res.status(403).json({
      success: false,
      message: "Visitor pass is not active",
    });
  }

  if (!visitor.passExpiresAt || visitor.passExpiresAt.getTime() <= Date.now()) {
    return res.status(403).json({
      success: false,
      message: "Visitor pass has expired",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Visitor pass verified successfully",
    visitor: {
      id: visitor._id,
      visitorId: visitor.visitorId,
      name: visitor.name,
      organization: visitor.organization,
      visitingPurpose: visitor.visitingPurpose,
      visitingEmployee: visitor.visitingEmployee,
      status: visitor.status,
      passIssuedAt: visitor.passIssuedAt,
      passExpiresAt: visitor.passExpiresAt,
      inTime: visitor.inTime,
      outTime: visitor.outTime,
    },
  });
};

module.exports = {
  registerVisitor,
  getPendingVisitors,
  approveVisitor,
  rejectVisitor,
  checkInVisitor,
  checkOutVisitor,
  verifyVisitorPass,
};
