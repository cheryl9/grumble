const express = require("express");
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const friendsController = require('../controllers/friendsController');

// All friend routes require authentication
router.use(authMiddleware);

// List accepted friends
router.get('/', friendsController.listFriends);

// List pending incoming friend requests
router.get('/requests', friendsController.listRequests);

// List sent (outgoing) pending requests
router.get('/sent', friendsController.listSentRequests);

// Search users by username
router.get('/search', friendsController.searchUsers);

// Send a friend request
router.post('/request', friendsController.sendRequest);

// Accept a friend request
router.post('/accept/:id', friendsController.acceptRequest);

// Decline a friend request
router.post('/decline/:id', friendsController.declineRequest);

// Remove an existing friend
router.delete('/:id', friendsController.removeFriend);

module.exports = router;
