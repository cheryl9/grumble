const postManagementRepository = require('../../repositories/admin/postManagementRepository');

/**
 * Post Management Controller
 * Handles admin post moderation API requests
 */

const getPosts = async (req, res, next) => {
  try {
    const { page, limit, visibility, search, fromDate, toDate, sortBy, sortOrder } = req.query;

    const filters = {
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 20,
      visibility: visibility || 'all',
      search: search || '',
      fromDate,
      toDate,
      sortBy: sortBy || 'created_at',
      sortOrder: sortOrder || 'DESC'
    };

    const result = await postManagementRepository.getPosts(filters);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getPostDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await postManagementRepository.getPostById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const [comments, reports] = await Promise.all([
      postManagementRepository.getPostComments(id),
      postManagementRepository.getPostReports(id)
    ]);

    res.json({
      success: true,
      data: {
        post,
        comments,
        reports
      }
    });
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.admin.id;

    const result = await postManagementRepository.deletePost(id, adminId, reason || '');

    res.json({
      success: true,
      message: 'Post deleted successfully',
      data: result
    });
  } catch (error) {
    if (error.message === 'Post not found or already deleted') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.admin.id;

    const result = await postManagementRepository.deleteComment(id, adminId, reason || '');

    res.json({
      success: true,
      message: 'Comment deleted successfully',
      data: result
    });
  } catch (error) {
    if (error.message === 'Comment not found or already deleted') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

module.exports = {
  getPosts,
  getPostDetails,
  deletePost,
  deleteComment
};
