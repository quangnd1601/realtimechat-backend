var express = require('express');
const { checkFriendship } = require('../middlewares/friendMiddleware');
const { createConversation, getConversation, getMessage } = require('../controllers/conversationController');

var router = express.Router();

router.get("/", getConversation)
router.get("/:conversationId/messages",getMessage)

router.post("/",checkFriendship, createConversation)


module.exports = router;