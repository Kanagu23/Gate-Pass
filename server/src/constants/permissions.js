
const PERMISSIONS = Object.freeze({
  VISITOR_REGISTER: "visitor.register",
  VISITOR_VIEW: "visitor.view",
  VISITOR_APPROVE: "visitor.approve",
  VISITOR_CHECKOUT: "visitor.checkout",

  USER_VIEW: "user.view",
  USER_CREATE: "user.create",
  USER_MANAGE: "user.manage",

  DEPARTMENT_VIEW: "department.view",
  DEPARTMENT_MANAGE: "department.manage",

  REPORT_VIEW: "report.view",
  REPORT_EXPORT: "report.export",
});

const PERMISSION_VALUES = Object.freeze(
  Object.values(PERMISSIONS)
);

module.exports = {
  PERMISSIONS,
  PERMISSION_VALUES,
};
