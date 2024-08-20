const { Group } = require("../model/index.model");
const { DatabaseError } = require("../error/custom.error");

class GroupRepository {
  constructor() {
    if (!GroupRepository.instance) {
      GroupRepository.instance = this;
    }
    return GroupRepository.instance;
  }

  static getInstance() {
    if (!GroupRepository.instance) {
      GroupRepository.instance = new GroupRepository();
    }
    return GroupRepository.instance;
  }

  async create(groupData) {
    try {
      const group = new Group(groupData);
      return await group.save();
    } catch (error) {
      throw new DatabaseError(error);
    }
  }

  async findById(groupId) {
    try {
      return await Group.findById(groupId).populate("members", "username");
    } catch (error) {
      throw new DatabaseError(error);
    }
  }

  async addMember(groupId, userId) {
    try {
      return await Group.findByIdAndUpdate(
        groupId,
        { $addToSet: { members: userId } },
        { new: true }
      ).populate("members", "username");
    } catch (error) {
      throw new DatabaseError(error);
    }
  }

  async removeMember(groupId, userId) {
    try {
      return await Group.findByIdAndUpdate(
        groupId,
        { $pull: { members: userId } },
        { new: true }
      ).populate("members", "username");
    } catch (error) {
      throw new DatabaseError(error);
    }
  }
}

module.exports = GroupRepository;
