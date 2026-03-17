const faqRepository = require('../../repositories/admin/faqRepository');

/**
 * Get all FAQs with filtering and pagination
 * Query params: page, limit, category, active, search, sortBy, sortOrder
 */
async function getFAQs(req, res, next) {
  try {
    const { page = 1, limit = 20, category, active, search, sortBy = 'display_order', sortOrder = 'ASC' } = req.query;

    const filters = {
      page: parseInt(page),
      limit: parseInt(limit),
      category: category || 'all',
      active: active || 'true',
      search: search || '',
      sortBy,
      sortOrder,
    };

    const result = await faqRepository.getFAQs(filters);

    res.json({
      data: result.data,
      pagination: result.pagination,
      success: true,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get FAQ by ID
 */
async function getFAQById(req, res, next) {
  try {
    const { id } = req.params;

    const faq = await faqRepository.getFAQById(id);

    if (!faq) {
      return res.status(404).json({ 
        success: false, 
        message: 'FAQ not found' 
      });
    }

    res.json({
      data: faq,
      success: true,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create new FAQ
 * Body: { question, answer, category, display_order, is_active }
 */
async function createFAQ(req, res, next) {
  try {
    const { question, answer, category, display_order = 0, is_active = true } = req.body;

    // Validation
    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: 'Question and answer are required',
      });
    }

    const newFAQ = await faqRepository.createFAQ(
      { question, answer, category, display_order, is_active },
      req.admin.id
    );

    res.status(201).json({
      data: newFAQ,
      success: true,
      message: 'FAQ created successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update FAQ
 * Body: { question, answer, category, is_active, display_order }
 */
async function updateFAQ(req, res, next) {
  try {
    const { id } = req.params;
    const { question, answer, category, is_active, display_order } = req.body;

    // Check if FAQ exists
    const existing = await faqRepository.getFAQById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found',
      });
    }

    const updatedFAQ = await faqRepository.updateFAQ(id, {
      question,
      answer,
      category,
      is_active,
      display_order,
    });

    res.json({
      data: updatedFAQ,
      success: true,
      message: 'FAQ updated successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete FAQ
 */
async function deleteFAQ(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await faqRepository.getFAQById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found',
      });
    }

    await faqRepository.deleteFAQ(id, req.admin.id);

    res.json({
      success: true,
      message: 'FAQ deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Toggle FAQ active status
 * Body: { is_active }
 */
async function toggleFAQStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (is_active === undefined) {
      return res.status(400).json({
        success: false,
        message: 'is_active field is required',
      });
    }

    const updated = await faqRepository.toggleFAQStatus(id, is_active, req.admin.id);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found',
      });
    }

    res.json({
      data: updated,
      success: true,
      message: `FAQ ${is_active ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Reorder FAQs
 * Body: { orders: [{ id, display_order }, ...] }
 */
async function reorderFAQs(req, res, next) {
  try {
    const { orders } = req.body;

    if (!Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'orders array is required',
      });
    }

    await faqRepository.reorderFAQs(orders, req.admin.id);

    res.json({
      success: true,
      message: 'FAQs reordered successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get FAQ categories
 */
async function getFAQCategories(req, res, next) {
  try {
    const categories = await faqRepository.getFAQCategories();

    res.json({
      data: categories,
      success: true,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getFAQs,
  getFAQById,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  toggleFAQStatus,
  reorderFAQs,
  getFAQCategories,
};
