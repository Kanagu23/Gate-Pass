const mongoose = require("mongoose");
const QRCode = require("qrcode");
const Visitor = require("../models/Visitor");
const User = require("../models/Users");
const generateVisitorId = require("../utils/generateVisitorId");
const { encryptPassToken ,decryptPassToken} = require("../utils/passEncryption");
const { generatePassToken, hashPassToken } = require("../utils/passToken");
const {
  hasPermission,
} = require("../middleware/permission.middleware");

const {
  PERMISSIONS,
} = require("../constants/permissions");

const { isDivision } = require("../config/divisions");
const validPhoto = (photo) => !photo || (typeof photo === "string" && /^data:image\/jpeg;base64,[a-zA-Z0-9+/=]+$/.test(photo) && photo.length <= 350000);
const cap = (value) => typeof value === "string" ? value.trim().toUpperCase() : "";
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
      idProofType,
      country, state, pinCode, visitingDivision,
    } = req.body;

    // Only gate employees and admins can register visitors.
   
const canRegister =
  ["SYSTEM_ADMIN", "ADMIN", "GATE_EMPLOYEE"].includes(req.user.role) ||
  hasPermission(req.user, PERMISSIONS.VISITOR_REGISTER);

if (!canRegister) {
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

    if (!validPhoto(profilePhoto) || !["AADHAAR", "PASSPORT", "DRIVING_LICENCE", "VOTER_ID", "OTHER"].includes(idProofType) ||
      typeof country !== "string" || !country.trim() || typeof state !== "string" || !state.trim() ||
      typeof pinCode !== "string" || !/^[A-Za-z0-9 -]{3,12}$/.test(pinCode.trim())) {
      return res.status(400).json({ success: false, message: "Valid ID type, country, state, postal code, and JPEG photo are required" });
    }
    // Aadhaar should not be collected as a full number; accept only last four digits.
    if (idProofType === "AADHAAR" && idProofNo && !/^\d{4}$/.test(idProofNo.trim())) {
      return res.status(400).json({ success: false, message: "Enter only the last four Aadhaar digits" });
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
    }).select("_id name employeeId department division email phone role");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Active visiting employee or director not found",
      });
    }

    const targetDivision = visitingDivision || employee.division;
    if (!isDivision(targetDivision) || employee.division !== targetDivision) {
      return res.status(400).json({ success: false, message: "Visiting division must match the selected employee" });
    }
    if (req.user.division && !isDivision(req.user.division)) {
      return res.status(403).json({ success: false, message: "Invalid registering division" });
    }
    // Use the existing Counter model through the visitor ID generator.
    const visitorId = await generateVisitorId();

    const visitor = await Visitor.create({
      visitorId,
      name: cap(name),
      idProofType,
      country: cap(country), state: cap(state), pinCode: pinCode.trim(),
      registeringDivision: req.user.division || targetDivision,
      visitingDivision: targetDivision,
      mobile: mobile.trim(),
      email: email?.trim().toLowerCase(),
      address: cap(address),
      organization: cap(organization),
      idProofNo: idProofNo?.trim(),
      profilePhoto: profilePhoto?.trim(),
      visitingPurpose,
      remarks: cap(remarks),
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
  const encryptedToken = encryptPassToken(token);
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
          qrTokenEncrypted: encryptedToken,
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
  const { rejectionReason } = req.body || {};

  // Validate visitor ID
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid visitor ID",
    });
  }

  // Rejection reason is mandatory
  if (
    typeof rejectionReason !== "string" ||
    !rejectionReason.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: "Rejection reason is required",
    });
  }

  const reason = rejectionReason.trim();

  // Match the Visitor schema's maximum length
  if (reason.length > 500) {
    return res.status(400).json({
      success: false,
      message: "Rejection reason cannot exceed 500 characters",
    });
  }

  // Only the assigned Employee or Director can reject
  // a visitor whose request is still pending.
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
        rejectionReason: reason,
      },
    },
    {
      new: true,
      runValidators: true,
    }
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
      rejectionReason: visitor.rejectionReason,
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
      ...(req.user.role !== "SYSTEM_ADMIN" && req.user.division ? { visitingDivision: req.user.division } : {}),
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

const checkOutByQR = async (req, res) => {
  const { qrToken: token } = req.body || {};

  // Validate the scanned QR token.
  if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) {
    return res.status(400).json({
      success: false,
      message: "Invalid QR token format",
    });
  }

  const tokenHash = hashPassToken(token);
  const now = new Date();

  // Atomically complete the visitor's exit.
  const visitor = await Visitor.findOneAndUpdate(
    {
      qrTokenHash: tokenHash,
      status: "CHECKED_IN",
      ...(req.user.role !== "SYSTEM_ADMIN" && req.user.division ? { visitingDivision: req.user.division } : {}),
      inTime: { $ne: null },
      outTime: null,
      ...(req.user.role !== "SYSTEM_ADMIN" && req.user.division ? { visitingDivision: req.user.division } : {}),
    },
    {
      $set: {
        status: "CHECKED_OUT",
        outTime: now,
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
      message: "QR pass is invalid or visitor has already checked out",
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


const getVisitorPass = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid visitor ID",
      });
    }

    // Enforce assigned-division access.
    const isSystemAdmin = req.user.role === "SYSTEM_ADMIN";

    if (!isSystemAdmin && !req.user.division) {
      return res.status(403).json({
        success: false,
        message: "No division assigned to this account.",
      });
    }

    const filter = {
      _id: id,
      ...(!isSystemAdmin
        ? { visitingDivision: req.user.division }
        : {}),
    };

    const visitor = await Visitor.findOne(filter)
      .select("+qrTokenEncrypted")
      .populate(
        "visitingEmployee",
        "employeeId name department division phone email role profilePhoto signature"
      );

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found or access denied.",
      });
    }

    // Never generate passes for unapproved, unissued requests.
    const wasIssued = Boolean(
      visitor.passIssuedAt ||
      (visitor.inTime &&
        ["CHECKED_IN", "CHECKED_OUT"].includes(visitor.status))
    );

    if (!wasIssued) {
      return res.status(403).json({
        success: false,
        message: "No visitor pass has been issued.",
      });
    }

    const expired =
      !visitor.passExpiresAt ||
      visitor.passExpiresAt.getTime() <= Date.now();

    const isActive =
      visitor.status === "CHECKED_IN" &&
      !expired;

    let qrCode = null;

    // Only release the real checkout credential
    // when the pass is currently active.
    if (isActive && visitor.qrTokenEncrypted) {
      const token = decryptPassToken(
        visitor.qrTokenEncrypted
      );

      qrCode = await QRCode.toDataURL(token, {
        errorCorrectionLevel: "M",
        margin: 2,
        width: 300,
      });
    }

    // Do not cache sensitive visitor information.
    res.set("Cache-Control", "no-store");

    return res.status(200).json({
      success: true,
      message: isActive
        ? "Active visitor pass retrieved."
        : "Historical visitor pass retrieved.",

      visitor: {
        id: visitor._id,
        visitorId: visitor.visitorId,
        name: visitor.name,
        mobile: visitor.mobile,
        email: visitor.email,
        organization: visitor.organization,
        profilePhoto: visitor.profilePhoto,

        address: visitor.address,
        country: visitor.country,
        state: visitor.state,
        pinCode: visitor.pinCode,

        idProofType: visitor.idProofType,
        idProofMasked: visitor.idProofNo
          ? `****${visitor.idProofNo
              .replace(/\D/g, "")
              .slice(-4)}`
          : null,

        visitingPurpose: visitor.visitingPurpose,
        remarks: visitor.remarks,
        registeringDivision: visitor.registeringDivision,
        visitingDivision: visitor.visitingDivision,

        visitingEmployee: visitor.visitingEmployee,

        approvedAt: visitor.approvedAt,
        approvedBy: visitor.approvedBy,

        status: visitor.status,
        inTime: visitor.inTime,
        outTime: visitor.outTime,
        validationHours: visitor.validationHours,
        passIssuedAt: visitor.passIssuedAt,
        passExpiresAt: visitor.passExpiresAt,

        // UI and PDF use these flags.
        isPassActive: isActive,
        passExpired: expired,

        // Archived passes contain no checkout token.
        qrCode,
      },
    });
  } catch (error) {
    console.error("Retrieve visitor pass error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve visitor pass.",
    });
  }
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
    ...(req.user.role !== "SYSTEM_ADMIN" && req.user.division ? { visitingDivision: req.user.division } : {}),
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

const getVisitors = async (req, res) => {
  const allowedStatuses = [
    "PENDING",
    "APPROVED",
    "REJECTED",
    "CHECKED_IN",
    "CHECKED_OUT",
  ];

  const { status } = req.query;

  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid visitor status",
    });
  }

 
const filter = status ? { status } : {};
// Preserve existing Employee/Director assigned-visitor filtering below.
if (req.user.role !== "SYSTEM_ADMIN" && req.user.division) filter.visitingDivision = req.user.division;

const isFrontDesk = [
  "SYSTEM_ADMIN",
  "ADMIN",
  "GATE_EMPLOYEE",
].includes(req.user.role);
// Employees and Directors can only view visitors
// assigned to them, even with visitor.view permission.
if (!isFrontDesk) {
  filter.visitingEmployee = req.user._id;
}


  const visitors = await Visitor.find(filter)
    .select(
  "visitorId name mobile organization visitingPurpose " +
  "visitingEmployee status inTime outTime " +
  "passIssuedAt passExpiresAt createdAt visitingDivision registeringDivision " +
  (["ADMIN", "SYSTEM_ADMIN"].includes(req.user.role)
    ? "rejectionReason rejectedAt "
    : "")
)
    .populate(
      "visitingEmployee",
      "employeeId name department"
    )
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return res.status(200).json({
    success: true,
    count: visitors.length,
    visitors,
  });
};


const getVisitorHistory = async (req, res) => {
  const allowedStatuses = [
    "PENDING",
    "APPROVED",
    "REJECTED",
    "CHECKED_IN",
    "CHECKED_OUT",
  ];

  const { status } = req.query;

  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid visitor status",
    });
  }

  // Always restrict history to the signed-in employee.
  const filter = {
    visitingEmployee: req.user._id,
  };

  if (status) {
    filter.status = status;
  }

  const visitors = await Visitor.find(filter)
   
.select(
  "visitorId name mobile organization " +
  "visitingPurpose remarks status " +
  "createdBy approvedAt rejectedAt rejectionReason " +
  "inTime outTime createdAt"
)

    .populate(
      "createdBy",
      "name employeeId department role"
    )
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return res.status(200).json({
    success: true,
    count: visitors.length,
    visitors,
  });
};



const correctVisitorTime = async (req, res) => {
  try {
    const { id } = req.params;
    const { inTime, outTime, reason } = req.body || {};

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid visitor ID",
      });
    }

    if (
      typeof reason !== "string" ||
      reason.trim().length < 10 ||
      reason.trim().length > 500
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide a correction reason (10–500 characters).",
      });
    }

    const parseTime = (value) => {
      if (value === null) return null;

      if (
        typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)
      ) {
        return undefined;
      }

      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? undefined : date;
    };

    const newInTime = parseTime(inTime);
    const newOutTime = parseTime(outTime);

    if (
      newInTime === undefined ||
      newOutTime === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide valid ISO timestamps with a timezone.",
      });
    }

    const filter = {
      _id: id,
      ...(req.user.role === "ADMIN"
        ? { visitingDivision: req.user.division }
        : {}),
    };

    if (req.user.role === "ADMIN" && !req.user.division) {
      return res.status(403).json({
        success: false,
        message: "Your account has no assigned division.",
      });
    }

    const visitor = await Visitor.findOne(filter);

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found or access denied.",
      });
    }

    if (!["CHECKED_IN", "CHECKED_OUT"].includes(visitor.status)) {
      return res.status(409).json({
        success: false,
        message: "Only checked-in or checked-out visits can be corrected.",
      });
    }

    if (
      !newInTime ||
      (visitor.status === "CHECKED_IN" && newOutTime !== null) ||
      (visitor.status === "CHECKED_OUT" && !newOutTime)
    ) {
      return res.status(400).json({
        success: false,
        message: "Times must be consistent with visitor status.",
      });
    }

    if (
      newOutTime &&
      newOutTime.getTime() < newInTime.getTime()
    ) {
      return res.status(400).json({
        success: false,
        message: "OUT time cannot be earlier than IN time.",
      });
    }

    const now = Date.now();

    if (
      newInTime.getTime() > now ||
      (newOutTime && newOutTime.getTime() > now)
    ) {
      return res.status(400).json({
        success: false,
        message: "Visit times cannot be in the future.",
      });
    }

    if (
      visitor.inTime?.getTime() === newInTime.getTime() &&
      (visitor.outTime?.getTime() ?? null) ===
        (newOutTime?.getTime() ?? null)
    ) {
      return res.status(400).json({
        success: false,
        message: "No time changes were provided.",
      });
    }

    const updatedVisitor = await Visitor.findOneAndUpdate(
      {
        ...filter,
        status: visitor.status,
        inTime: visitor.inTime,
        outTime: visitor.outTime,
      },
      {
        $set: {
          inTime: newInTime,
          outTime: newOutTime,
        },
        $push: {
          timeCorrections: {
            previousInTime: visitor.inTime,
            previousOutTime: visitor.outTime,
            newInTime,
            newOutTime,
            reason: reason.trim(),
            correctedBy: req.user._id,
            correctedAt: new Date(),
          },
        },
      },
      {
        new: true,
        runValidators: true,
        projection: {
          visitorId: 1,
          name: 1,
          status: 1,
          inTime: 1,
          outTime: 1,
        },
      }
    );

    if (!updatedVisitor) {
      return res.status(409).json({
        success: false,
        message: "Visitor was updated by another request. Refresh and retry.",
      });
    }

    return res.json({
      success: true,
      message: "Visitor times corrected successfully.",
      visitor: updatedVisitor,
    });
  } catch (error) {
    console.error("Visitor time correction error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to correct visitor times.",
    });
  }
};


module.exports = {
  registerVisitor,
  getPendingVisitors,
  approveVisitor,
  rejectVisitor,
  checkInVisitor,
  checkOutVisitor,
  checkOutByQR,
  verifyVisitorPass,
  getVisitorPass,
  getVisitors,
  getVisitorHistory,
  correctVisitorTime
  
};
