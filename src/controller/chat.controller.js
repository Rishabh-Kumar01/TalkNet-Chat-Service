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
      console.log(req.body);
      const { sender, recipient, content } = req.body;
      const recipientType = "User";
      // const sender = "66c262e0cbc913ffa846991c" || req.user.userId;
      const message = await this.chatService.sendMessage(
        sender,
        recipient,
        content,
        recipientType
      );
      res.status(StatusCodes.CREATED).json({
        message: "Message sent successfully",
        success: true,
        data: message,
      });
    } catch (error) {
      next(error);
    }
  }

  async getConversation(req, res, next) {
    try {
      const { senderId, recipientId } = req.params;
      const { limit, skip } = req.query;
      const messages = await this.chatService.getConversation(
        recipientId,
        senderId,
        limit,
        skip
      );
      res.status(StatusCodes.OK).json({
        message: "Conversation retrieved successfully",
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
        message: "Message marked as read",
        success: true,
        data: message,
      });
    } catch (error) {
      next(error);
    }
  }

  async sendGroupMessage(req, res, next) {
    try {
      const { groupId, content } = req.body;
      const senderId = req.user.id;
      const message = await this.chatService.sendGroupMessage(
        senderId,
        groupId,
        content
      );
      res.status(StatusCodes.CREATED).json({
        message: "Group message sent successfully",
        success: true,
        data: message,
      });
    } catch (error) {
      next(error);
    }
  }

  async createGroup(req, res, next) {
    try {
      const { name, memberIds } = req.body;
      const creatorId = req.user.id;
      const group = await this.chatService.createGroup(
        creatorId,
        name,
        memberIds
      );
      res.status(StatusCodes.CREATED).json({
        message: "Group created successfully",
        success: true,
        data: group,
      });
    } catch (error) {
      next(error);
    }
  }

  async addGroupMember(req, res, next) {
    try {
      const { groupId, userId } = req.body;
      const group = await this.chatService.addGroupMember(groupId, userId);
      res.status(StatusCodes.OK).json({
        message: "Member added successfully",
        success: true,
        data: group,
      });
    } catch (error) {
      next(error);
    }
  }

  async removeGroupMember(req, res, next) {
    try {
      const { groupId, userId } = req.body;
      const group = await this.chatService.removeGroupMember(groupId, userId);
      res.status(StatusCodes.OK).json({
        message: "Member removed successfully",
        success: true,
        data: group,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ChatController;
