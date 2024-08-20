const {
  MessageRepository,
  GroupRepository,
} = require("../repository/index.repository");
const { ServiceError, DatabaseError } = require("../error/custom.error");
const { responseCodes } = require("../utils/import.util");
const SocketUtil = require("../utils/socket.util");

const { StatusCodes } = responseCodes;

class ChatService {
  constructor() {
    this.messageRepository = MessageRepository.getInstance();
    this.groupRepository = GroupRepository.getInstance();
    this.socketUtil = SocketUtil.getInstance();
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

  async sendGroupMessage(senderId, groupId, content) {
    try {
      const group = await this.groupRepository.findById(groupId);
      if (!group) {
        throw new ServiceError(
          "Group not found",
          "The specified group does not exist",
          StatusCodes.NOT_FOUND
        );
      }
      if (!group.members.includes(senderId)) {
        throw new ServiceError(
          "Not a member",
          "User is not a member of this group",
          StatusCodes.FORBIDDEN
        );
      }
      const messageData = {
        sender: senderId,
        recipient: groupId,
        recipientType: "Group",
        content,
      };
      const message = await this.messageRepository.create(messageData);

      // Notify all group members
      group.members.forEach((memberId) => {
        if (memberId.toString() !== senderId.toString()) {
          this.socketUtil.sendMessage(memberId.toString(), {
            type: "new_group_message",
            message,
          });
        }
      });

      return message;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new ServiceError(
          "Failed to send group message",
          error.explanation,
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }
      if (error instanceof ServiceError) {
        throw error;
      }
      throw new ServiceError(
        "Send group message failed",
        "An error occurred while sending the group message",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async createGroup(creatorId, name, memberIds) {
    try {
      const groupData = {
        name,
        creator: creatorId,
        members: [creatorId, ...memberIds],
      };
      const group = await this.groupRepository.create(groupData);
      return group;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new ServiceError(
          "Failed to create group",
          error.explanation,
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }
      throw new ServiceError(
        "Create group failed",
        "An error occurred while creating the group",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async addGroupMember(groupId, userId) {
    try {
      const group = await this.groupRepository.addMember(groupId, userId);
      if (!group) {
        throw new ServiceError(
          "Group not found",
          "The specified group does not exist",
          StatusCodes.NOT_FOUND
        );
      }
      return group;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new ServiceError(
          "Failed to add group member",
          error.explanation,
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }
      if (error instanceof ServiceError) {
        throw error;
      }
      throw new ServiceError(
        "Add group member failed",
        "An error occurred while adding the group member",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async removeGroupMember(groupId, userId) {
    try {
      const group = await this.groupRepository.removeMember(groupId, userId);
      if (!group) {
        throw new ServiceError(
          "Group not found",
          "The specified group does not exist",
          StatusCodes.NOT_FOUND
        );
      }
      return group;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new ServiceError(
          "Failed to remove group member",
          error.explanation,
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }
      if (error instanceof ServiceError) {
        throw error;
      }
      throw new ServiceError(
        "Remove group member failed",
        "An error occurred while removing the group member",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}

module.exports = ChatService;
