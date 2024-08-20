const { express } = require("../../utils/import.util");
const ChatController = require("../../controllers/chat.controller");
const authMiddleware = require("../../middlewares/auth.middleware");

const router = express.Router();
const chatController = ChatController.getInstance();

router.post(
  "/messages",
  authMiddleware.authenticate,
  chatController.sendMessage.bind(chatController)
);
router.get(
  "/conversations/:userId",
  authMiddleware.authenticate,
  chatController.getConversation.bind(chatController)
);
router.patch(
  "/messages/:messageId/read",
  authMiddleware.authenticate,
  chatController.markAsRead.bind(chatController)
);

module.exports = router;
