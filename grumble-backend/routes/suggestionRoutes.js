const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { requireSuggestionRoomMember } = require('../middleware/membershipGuard');
const foodSuggestionController = require('../controllers/foodSuggestionController');

router.use(authMiddleware);

router.post(
  '/:suggestionId/react',
  requireSuggestionRoomMember,
  foodSuggestionController.reactToSuggestion,
);
router.delete(
  '/:suggestionId/react',
  requireSuggestionRoomMember,
  foodSuggestionController.removeReactionFromSuggestion,
);

module.exports = router;
