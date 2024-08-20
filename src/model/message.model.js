const { mongoose } = require("../utils/import.util");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "recipientType",
      required: true,
    },
    recipientType: { type: String, required: true, enum: ["User", "Group"] },
    content: { type: String, required: true },
    read: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", messageSchema);
