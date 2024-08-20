const { MessageRepository } = require("../repository/index.repository");
const { ServiceError, DatabaseError } = require("../error/custom.error");
const { responseCodes } = require("../utils/import.util");

const { StatusCodes } = responseCodes;

class ChatService {
  constructor() {
    this.messageRepository = MessageRepository.getInstance();
  }

  static getInstance() {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  async sendMessage(senderId, recipientId, content) {
    try {
      const messageData = { sender: senderId, recipient: recipientId, content };
      const message = await this.messageRepository.create(messageData);
      return message;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new ServiceError(
          "Failed to send message",
          error.explanation,
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }
      throw new ServiceError(
        "Send message failed",
        "An error occurred while sending the message",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getConversation(user1Id, user2Id, limit = 50, skip = 0) {
    try {
      const messages = await this.messageRepository.findByUsers(
        user1Id,
        user2Id,
        limit,
        skip
      );
      return messages;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new ServiceError(
          "Failed to retrieve conversation",
          error.explanation,
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }
      throw new ServiceError(
        "Get conversation failed",
        "An error occurred while retrieving the conversation",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async markMessageAsRead(messageId) {
    try {
      const message = await this.messageRepository.markAsRead(messageId);
      if (!message) {
        throw new ServiceError(
          "Message not found",
          "The specified message does not exist",
          StatusCodes.NOT_FOUND
        );
      }
      return message;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new ServiceError(
          "Failed to mark message as read",
          error.explanation,
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }
      if (error instanceof ServiceError) {
        throw error;
      }
      throw new ServiceError(
        "Mark as read failed",
        "An error occurred while marking the message as read",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

module.exports = ChatService;
