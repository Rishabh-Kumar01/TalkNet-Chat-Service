const { Message } = require("../model/index.model");
const { DatabaseError } = require("../error/custom.error");

class MessageRepository {
  constructor() {
    if (!MessageRepository.instance) {
      MessageRepository.instance = this;
    }
    return MessageRepository.instance;
  }

  static getInstance() {
    if (!MessageRepository.instance) {
      MessageRepository.instance = new MessageRepository();
    }
    return MessageRepository.instance;
  }

  async create(messageData) {
    try {
      const message = new Message(messageData);
      return await message.save();
    } catch (error) {
      throw new DatabaseError(error);
    }
  }

  async findByUsers(user1Id, user2Id, limit = 50, skip = 0) {
    try {
      return await Message.find({
        $or: [
          { sender: user1Id, recipient: user2Id },
          { sender: user2Id, recipient: user1Id },
        ],
      })
        .sort({ timestamp: -1 })
        .limit(limit)
        .skip(skip);
    } catch (error) {
      throw new DatabaseError(error);
    }
  }

  async markAsRead(messageId) {
    try {
      return await Message.findByIdAndUpdate(
        messageId,
        { read: true },
        { new: true }
      );
    } catch (error) {
      throw new DatabaseError(error);
    }
  }

  async findGroupMessages(groupId, limit = 50, skip = 0) {
    try {
      return await Message.find({ recipient: groupId, recipientType: "Group" })
        .sort({ timestamp: -1 })
        .limit(limit)
        .skip(skip)
        .populate("sender", "username");
    } catch (error) {
      throw new DatabaseError(error);
    }
  }

  async markAsReadForUser(messageId, userId) {
    try {
      return await Message.findByIdAndUpdate(
        messageId,
        { $addToSet: { read: userId } },
        { new: true }
      );
    } catch (error) {
      throw new DatabaseError(error);
    }
  }
}

module.exports = MessageRepository;
