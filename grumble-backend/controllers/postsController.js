const postsRepo = require('../repositories/postsRepository');

async function getFeed(req, res) {
  try {
    const userId = req.user.id;
    const tab    = req.query.tab    || 'foryou';
    const limit  = parseInt(req.query.limit)  || 20;
    const offset = parseInt(req.query.offset) || 0;

    const posts = await postsRepo.getFeedPosts(userId, tab, limit, offset);
    res.json(posts);
  } catch (err) {
    console.error('getFeed error:', err);
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
}

async function getPost(req, res) {
  try {
    const userId = req.user.id;
    const postId = parseInt(req.params.id);

    const post = await postsRepo.getPostById(postId, userId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comments = await postsRepo.getCommentsByPostId(postId);
    res.json({ ...post, comments });
  } catch (err) {
    console.error('getPost error:', err);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
}

async function createPost(req, res) {
  try {
    const userId = req.user.id;
    const { foodPlaceId, locationName, rating, imageUrl, description, visibility } = req.body;

    // At least a location name or a food place must be provided
    if (!locationName && !foodPlaceId) {
      return res.status(400).json({ error: 'Either locationName or foodPlaceId is required' });
    }

    const post = await postsRepo.createPost({
      userId,
      foodPlaceId,
      locationName,
      rating,
      imageUrl,
      description,
      visibility,
    });

    res.status(201).json(post);
  } catch (err) {
    console.error('createPost error:', err);
    res.status(500).json({ error: 'Failed to create post' });
  }
}

async function toggleLike(req, res) {
  try {
    const userId = req.user.id;
    const postId = parseInt(req.params.id);

    // Confirm post exists
    const post = await postsRepo.getPostById(postId, userId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const result = await postsRepo.toggleLike(postId, userId);
    res.json(result); // { liked: true } or { liked: false }
  } catch (err) {
    console.error('toggleLike error:', err);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
}

async function addComment(req, res) {
  try {
    const userId  = req.user.id;
    const postId  = parseInt(req.params.id);
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content cannot be empty' });
    }

    // Confirm post exists
    const post = await postsRepo.getPostById(postId, userId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = await postsRepo.createComment(postId, userId, content.trim());
    res.status(201).json(comment);
  } catch (err) {
    console.error('addComment error:', err);
    res.status(500).json({ error: 'Failed to add comment' });
  }
}

async function toggleSave(req, res) {
  try {
    const userId = req.user.id;
    const postId = parseInt(req.params.id);
 
    const post = await postsRepo.getPostById(postId, userId);
    if (!post) return res.status(404).json({ error: 'Post not found' });
 
    const result = await postsRepo.toggleSave(postId, userId);
    res.json(result); // { saved: true } or { saved: false }
  } catch (err) {
    console.error('toggleSave error:', err);
    res.status(500).json({ error: 'Failed to toggle save' });
  }
}

async function getSaved(req, res) {
  try {
    const userId = req.user.id;
    const limit  = parseInt(req.query.limit)  || 20;
    const offset = parseInt(req.query.offset) || 0;
 
    const posts = await postsRepo.getSavedPosts(userId, limit, offset);
    res.json(posts);
  } catch (err) {
    console.error('getSaved error:', err);
    res.status(500).json({ error: 'Failed to fetch saved posts' });
  }
}

module.exports = {
  getFeed,
  getPost,
  createPost,
  toggleLike,
  addComment,
  toggleSave,
  getSaved,
};