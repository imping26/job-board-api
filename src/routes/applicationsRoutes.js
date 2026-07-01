const express = require("express");
const router = express.Router();
const {
  getMyApplications,
  updateApplicationStatus,
  acceptApplication,
} = require("../controllers/applicationsController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");
const {
  updateApplicationStatusRules,
} = require("../middleware/validationRules");

// Jobseeker 查看自己的申请
router.get(
  "/mine",
  authMiddleware,
  roleMiddleware("JOBSEEKER"),
  getMyApplications,
);

router.patch(
  "/:id/accept",
  authMiddleware,
  roleMiddleware("EMPLOYER"),
  acceptApplication,
);

// Employer 更新申请状态
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("EMPLOYER"),
  updateApplicationStatusRules,
  validate,
  updateApplicationStatus,
);

module.exports = router;
