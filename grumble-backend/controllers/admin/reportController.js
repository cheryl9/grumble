const reportRepository = require('../../repositories/admin/reportRepository');

/**
 * Report Controller
 * Handles report review and moderation API requests
 */

const getReports = async (req, res, next) => {
  try {
    const { page, limit, status, reason, sortOrder } = req.query;

    const filters = {
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 20,
      status: status || 'all',
      reason: reason || '',
      sortOrder: sortOrder || 'DESC'
    };

    const result = await reportRepository.getReports(filters);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getReportDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const report = await reportRepository.getReportById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

const reviewReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const result = await reportRepository.updateReportStatus(
      id,
      'reviewing',
      notes || '',
      req.admin.id
    );

    res.json({
      success: true,
      message: 'Report marked as reviewing',
      data: result
    });
  } catch (error) {
    if (error.message === 'Report not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const resolveReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const result = await reportRepository.updateReportStatus(
      id,
      'resolved',
      notes || '',
      req.admin.id
    );

    res.json({
      success: true,
      message: 'Report resolved',
      data: result
    });
  } catch (error) {
    if (error.message === 'Report not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const dismissReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const result = await reportRepository.updateReportStatus(
      id,
      'dismissed',
      notes || '',
      req.admin.id
    );

    res.json({
      success: true,
      message: 'Report dismissed',
      data: result
    });
  } catch (error) {
    if (error.message === 'Report not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

module.exports = {
  getReports,
  getReportDetails,
  reviewReport,
  resolveReport,
  dismissReport
};
