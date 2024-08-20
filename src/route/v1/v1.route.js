const { express } = require("../../utils/import.util");
const ChatController = require("../../controller/chat.controller");

const router = express.Router();
const chatController = ChatController.getInstance();

router.post("/messages", chatController.sendMessage.bind(chatController));
router.get(
  "/conversations/:userId",
  chatController.getConversation.bind(chatController)
);
router.patch(
  "/messages/:messageId/read",
  chatController.markAsRead.bind(chatController)
);

router.post(
  "/groups/messages",
  chatController.sendGroupMessage.bind(chatController)
);
router.post("/groups", chatController.createGroup.bind(chatController));
router.post(
  "/groups/members",
  chatController.addGroupMember.bind(chatController)
);
router.delete(
  "/groups/members",
  chatController.removeGroupMember.bind(chatController)
);

module.exports = router;
