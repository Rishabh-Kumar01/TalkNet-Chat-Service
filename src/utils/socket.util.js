const { socketIo, jwt } = require("../utils/import.util");
const { JWT_SECRET } = require("../config/server.config");
const { AuthenticationError } = require("../error/custom.error");

class SocketUtil {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map();
  }

  static getInstance() {
    if (!SocketUtil.instance) {
      SocketUtil.instance = new SocketUtil();
    }
    return SocketUtil.instance;
  }

  initialize(server) {
    this.io = socketIo(server);

    this.io.use((socket, next) => {
      if (socket.handshake.query && socket.handshake.query.token) {
        jwt.verify(socket.handshake.query.token, JWT_SECRET, (err, decoded) => {
          if (err)
            return next(
              new AuthenticationError("Authentication error", "Invalid token")
            );
          socket.decoded = decoded;
          next();
        });
      } else {
        next(
          new AuthenticationError("Authentication error", "No token provided")
        );
      }
    });

    this.io.on("connection", (socket) => {
      console.log("New client connected");
      this.connectedUsers.set(socket.decoded.id, socket.id);

      socket.on("disconnect", () => {
        console.log("Client disconnected");
        this.connectedUsers.delete(socket.decoded.id);
      });

      socket.on("typing", (data) => {
        const recipientSocketId = this.connectedUsers.get(data.recipientId);
        if (recipientSocketId) {
          this.io
            .to(recipientSocketId)
            .emit("user_typing", { userId: socket.decoded.id });
        }
      });

      socket.on("stop_typing", (data) => {
        const recipientSocketId = this.connectedUsers.get(data.recipientId);
        if (recipientSocketId) {
          this.io
            .to(recipientSocketId)
            .emit("user_stop_typing", { userId: socket.decoded.id });
        }
      });
    });
  }

  sendMessage(recipientId, message) {
    const recipientSocketId = this.connectedUsers.get(recipientId);
    if (recipientSocketId) {
      this.io.to(recipientSocketId).emit("new_message", message);
    }
  }

  notifyGroupMessage(groupId, message, excludeUserId) {
    this.io
      .to(groupId)
      .except(this.connectedUsers.get(excludeUserId))
      .emit("new_group_message", message);
  }
}

module.exports = SocketUtil;
