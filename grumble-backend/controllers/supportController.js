const supportRepo = require("../repositories/supportRepository");

/**
 * Create a new support report (authenticated users)
 */
const createReport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { category, description, contactEmail } = req.body;

    // Validate input
    if (!category) {
      return res.status(400).json({ error: "Category is required" });
    }
    if (!description || description.trim().length < 20) {
      return res.status(400).json({
        error: "Description must be at least 20 characters",
      });
    }

    const report = await supportRepo.createReport(
      userId,
      category,
      description.trim(),
      contactEmail || null,
    );

    res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      data: report,
    });
  } catch (err) {
    console.error("createReport error:", err);
    res.status(500).json({ error: "Failed to create support report" });
  }
};

/**
 * Get all support reports (admin only)
 */
const getAllReports = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const reports = await supportRepo.getAllReports(limit, offset);
    const totalCount = await supportRepo.getReportCountByStatus();

    res.json({
      success: true,
      data: reports,
      pagination: {
        limit,
        offset,
        total: totalCount,
      },
    });
  } catch (err) {
    console.error("getAllReports error:", err);
    res.status(500).json({ error: "Failed to fetch support reports" });
  }
};

/**
 * Get reports by status (admin only)
 */
const getReportsByStatus = async (req, res, next) => {
  try {
    const { status } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const validStatuses = ["open", "in_progress", "resolved"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const reports = await supportRepo.getReportsByStatus(status, limit, offset);
    const totalCount = await supportRepo.getReportCountByStatus(status);

    res.json({
      success: true,
      data: reports,
      pagination: {
        limit,
        offset,
        total: totalCount,
        status,
      },
    });
  } catch (err) {
    console.error("getReportsByStatus error:", err);
    res.status(500).json({ error: "Failed to fetch reports by status" });
  }
};

/**
 * Get a single report (admin only)
 */
const getReportById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const report = await supportRepo.getReportById(id);

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    res.json({
      success: true,
      data: report,
    });
  } catch (err) {
    console.error("getReportById error:", err);
    res.status(500).json({ error: "Failed to fetch report" });
  }
};

/**
 * Update report status and add admin notes (admin only)
 */
const updateReportStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const validStatuses = ["open", "in_progress", "resolved"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const report = await supportRepo.updateReportStatus(
      id,
      status,
      adminNotes || null,
    );

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    res.json({
      success: true,
      message: "Report updated successfully",
      data: report,
    });
  } catch (err) {
    console.error("updateReportStatus error:", err);
    res.status(500).json({ error: "Failed to update report" });
  }
};

module.exports = {
  createReport,
  getAllReports,
  getReportsByStatus,
  getReportById,
  updateReportStatus,
};
