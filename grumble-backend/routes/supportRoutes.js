const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminAuthMiddleware = require("../middleware/adminAuthMiddleware");
const supportController = require("../controllers/supportController");

/**
 * Support Routes
 * Users can submit reports, admins can manage them
 */

// User: Submit a support report
router.post("/report", authMiddleware, supportController.createReport);

// Admin: Get all support reports
router.get(
  "/",
  adminAuthMiddleware,
  supportController.getAllReports
);

// Admin: Get reports by status
router.get(
  "/status/:status",
  adminAuthMiddleware,
  supportController.getReportsByStatus
);

// Admin: Get a single report
router.get(
  "/:id",
  adminAuthMiddleware,
  supportController.getReportById
);

// Admin: Update report status and add notes
router.patch(
  "/:id",
  adminAuthMiddleware,
  supportController.updateReportStatus
);

module.exports = router;
