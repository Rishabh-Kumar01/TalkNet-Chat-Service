const ChatService = require("../service/chat.service");
const { responseCodes } = require("../utils/import.util");

const { StatusCodes } = responseCodes;

class ChatController {
  constructor() {
    this.chatService = ChatService.getInstance();
  }

  static getInstance() {
    if (!ChatController.instance) {
      ChatController.instance = new ChatController();
    }
    return ChatController.instance;
  }

  async sendMessage(req, res, next) {
    try {
      const { recipientId, content } = req.body;
      const senderId = req.user.userId; 
      const message = await this.chatService.sendMessage(
        senderId,
        recipientId,
        content
      );
      res.status(StatusCodes.CREATED).json({
        success: true,
        data: message,
      });
    } catch (error) {
      next(error);
    }
  }

  async getConversation(req, res, next) {
    try {
      const { userId } = req.params;
      const currentUserId = req.user.userId;
      const { limit, skip } = req.query;
      const messages = await this.chatService.getConversation(
        currentUserId,
        userId,
        limit,
        skip
      );
      res.status(StatusCodes.OK).json({
        success: true,
        data: messages,
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const { messageId } = req.params;
      const message = await this.chatService.markMessageAsRead(messageId);
      res.status(StatusCodes.OK).json({
        success: true,
        data: message,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ChatController;
