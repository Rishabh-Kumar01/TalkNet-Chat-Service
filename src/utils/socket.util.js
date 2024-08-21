const { socketIo, jwt } = require("../utils/import.util");
const { JWT_SECRET, CORS_ORIGIN } = require("../config/server.config");
const { AuthenticationError } = require("../error/custom.error");

const createSocketUtil = () => {
  let io = null;
  const userSocketMap = new Map();

  const initialize = (server) => {
    io = socketIo(server, {
      cors: {
        origin: CORS_ORIGIN,
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    // io.use((socket, next) => {
    //   console.log("Socket middleware executing for socket:", socket.id);
    //   if (socket.handshake.query && socket.handshake.query.token) {
    //     jwt.verify(socket.handshake.query.token, JWT_SECRET, (err, decoded) => {
    //       if (err) {
    //         console.error("JWT verification error:", err);
    //         return next(
    //           new AuthenticationError("Authentication error", "Invalid token")
    //         );
    //       }
    //       console.log("JWT verified successfully for socket:", socket.id);
    //       socket.decoded = decoded;
    //       next();
    //     });
    //   } else {
    //     console.log("No token provided for socket:", socket.id);
    //     next(
    //       new AuthenticationError("Authentication error", "No token provided")
    //     );
    //   }
    // });

    // io.on("connection", (socket) => {
    //   console.log("New client connected:", socket.id);
    //   if (socket.decoded && socket.decoded.userId) {
    //     connectedUsers.set(socket.decoded.userId, socket.id);
    //     console.log("User mapped:", socket.decoded.userId, "->", socket.id);
    //   } else {
    //     console.log("Warning: Connected socket has no decoded user ID");
    //   }

    //   socket.on("disconnect", () => {
    //     console.log("Client disconnected:", socket.id);
    //     if (socket.decoded && socket.decoded.userId) {
    //       connectedUsers.delete(socket.decoded.userId);
    //       console.log("User unmapped:", socket.decoded.userId);
    //     }
    //   });

    //   socket.on("stop_typing", (data) => {
    //     const recipientSocketId = connectedUsers.get(data.recipientId);
    //     if (recipientSocketId) {
    //       io.to(recipientSocketId).emit("user_stop_typing", {
    //         userId: socket.decoded.userId,
    //       });
    //     }
    //   });

    //   socket.on("join_chat", (chatId) => {
    //     socket.join(chatId);
    //     console.log(`User ${socket.decoded.userId} joined chat ${chatId}`);
    //   });

    //   socket.on("leave_chat", (chatId) => {
    //     socket.leave(chatId);
    //     console.log(`User ${socket.decoded.userId} left chat ${chatId}`);
    //   });
    // });

    io.on("connection", (socket) => {
      console.log("Socket IO connected:", socket.id);

      socket.on("register_user", (userId) => {
        userSocketMap.set(userId, socket.id);
        console.log("User registered:", userId, "->", socket.id);
      });

      socket.on("join_room", (roomId) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
      });

      socket.on("leave_room", (roomId) => {
        socket.leave(roomId);
        console.log(`Socket ${socket.id} left room ${roomId}`);
      });

      socket.on("disconnect", () => {
        console.log("Socket IO disconnected:", socket.id);
        // Remove user from userSocketMap
        for (const [userId, socketId] of userSocketMap.entries()) {
          if (socketId === socket.id) {
            userSocketMap.delete(userId);
            break;
          }
        }
      });
    });
  };

  const sendMessage = (roomId, data) => {
    console.log("Sending message to room:", roomId, data);
    io.to(roomId).emit("new_message", data);
  };

  const notifyGroupMessage = (groupId, message, excludeUserId) => {
    io.to(groupId)
      .except(connectedUsers.get(excludeUserId))
      .emit("new_group_message", message);
  };

  return {
    initialize,
    sendMessage,
    notifyGroupMessage,
  };
};

// Create a single instance
const socketUtil = createSocketUtil();

module.exports = socketUtil;
