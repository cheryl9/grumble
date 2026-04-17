const postsRepo = require("../repositories/postsRepository");

async function getFeed(req, res) {
  try {
    const userId = req.user.id;
    const tab = req.query.tab || "foryou";
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const posts = await postsRepo.getFeedPosts(userId, tab, limit, offset);
    res.json(posts);
  } catch (err) {
    console.error("getFeed error:", err);
    res.status(500).json({ error: "Failed to fetch feed" });
  }
}

async function getPost(req, res) {
  try {
    const userId = req.user.id;
    const postId = parseInt(req.params.id);

    const post = await postsRepo.getPostById(postId, userId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const comments = await postsRepo.getCommentsByPostId(postId);
    res.json({ ...post, comments });
  } catch (err) {
    console.error("getPost error:", err);
    res.status(500).json({ error: "Failed to fetch post" });
  }
}

async function createPost(req, res) {
  try {
    const userId = req.user.id;
    const {
      foodPlaceId,
      locationName,
      rating,
      imageUrl,
      description,
      visibility,
      postal_code,
    } = req.body;

    // At least a location name or a food place must be provided
    if (!locationName && !foodPlaceId) {
      return res
        .status(400)
        .json({ error: "Either locationName or foodPlaceId is required" });
    }

    const post = await postsRepo.createPost({
      userId,
      foodPlaceId,
      locationName,
      rating,
      imageUrl,
      description,
      visibility,
      postal_code,
    });

    res.status(201).json(post);
  } catch (err) {
    console.error("createPost error:", err);
    res.status(500).json({ error: "Failed to create post" });
  }
}

async function editPost(req, res) {
  try {
    const userId = req.user.id;
    const postId = parseInt(req.params.id, 10);
    const { locationName, rating, imageUrl, description, visibility } = req.body;

    const hasEditableField = [locationName, rating, imageUrl, description, visibility]
      .some((value) => value !== undefined);

    if (!hasEditableField) {
      return res.status(400).json({ error: 'No fields provided to update' });
    }

    if (rating !== undefined) {
      const numericRating = Number(rating);
      if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
        return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
      }
    }

    if (visibility !== undefined) {
      const allowedVisibility = ['public', 'friends', 'private'];
      if (!allowedVisibility.includes(visibility)) {
        return res.status(400).json({ error: 'Invalid visibility value' });
      }
    }

    const owner = await postsRepo.getPostOwner(postId);
    if (!owner || owner.is_deleted) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (owner.user_id !== userId) {
      return res.status(403).json({ error: 'You can only edit your own posts' });
    }

    const updatedPost = await postsRepo.updatePost(postId, {
      locationName,
      rating,
      imageUrl,
      description,
      visibility,
    });

    res.json(updatedPost);
  } catch (err) {
    console.error('editPost error:', err);
    res.status(500).json({ error: 'Failed to edit post' });
  }
}

async function deletePost(req, res) {
  try {
    const userId = req.user.id;
    const postId = parseInt(req.params.id, 10);

    const owner = await postsRepo.getPostOwner(postId);
    if (!owner || owner.is_deleted) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (owner.user_id !== userId) {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }

    await postsRepo.softDeletePost(postId);
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (err) {
    console.error('deletePost error:', err);
    res.status(500).json({ error: 'Failed to delete post' });
  }
}

async function toggleLike(req, res) {
  try {
    const userId = req.user.id;
    const postId = parseInt(req.params.id);

    // Confirm post exists
    const post = await postsRepo.getPostById(postId, userId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const result = await postsRepo.toggleLike(postId, userId);
    res.json(result); // { liked: true } or { liked: false }
  } catch (err) {
    console.error("toggleLike error:", err);
    res.status(500).json({ error: "Failed to toggle like" });
  }
}

async function addComment(req, res) {
  try {
    const userId = req.user.id;
    const postId = parseInt(req.params.id);
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Comment content cannot be empty" });
    }

    // Confirm post exists
    const post = await postsRepo.getPostById(postId, userId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const comment = await postsRepo.createComment(
      postId,
      userId,
      content.trim(),
    );
    res.status(201).json(comment);
  } catch (err) {
    console.error("addComment error:", err);
    res.status(500).json({ error: "Failed to add comment" });
  }
}

async function toggleSave(req, res) {
  try {
    const userId = req.user.id;
    const postId = parseInt(req.params.id);

    const post = await postsRepo.getPostById(postId, userId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const result = await postsRepo.toggleSave(postId, userId);
    res.json(result); // { saved: true } or { saved: false }
  } catch (err) {
    console.error("toggleSave error:", err);
    res.status(500).json({ error: "Failed to toggle save" });
  }
}

async function getSaved(req, res) {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const posts = await postsRepo.getSavedPosts(userId, limit, offset);
    res.json(posts);
  } catch (err) {
    console.error("getSaved error:", err);
    res.status(500).json({ error: "Failed to fetch saved posts" });
  }
}

async function reportPost(req, res) {
  try {
    const reporterId = req.user.id;
    const postId = parseInt(req.params.id, 10);
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'Report reason is required' });
    }

    const post = await postsRepo.getPostById(postId, reporterId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const report = await postsRepo.createReport(postId, reporterId, reason.trim());
    res.status(201).json(report);
  } catch (err) {
    console.error('reportPost error:', err);
    res.status(500).json({ error: 'Failed to report post' });
  }
}

module.exports = {
  getFeed,
  getPost,
  createPost,
  editPost,
  deletePost,
  toggleLike,
  addComment,
  toggleSave,
  getSaved,
  reportPost,
};
