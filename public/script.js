const socket = io("http://localhost:8003/", {
  transports: ["websocket"],
  // query: {
  //     token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NmMyNjJlMGNiYzkxM2ZmYTg0Njk5MWMiLCJlbWFpbCI6InJpc2hhYmgxdGVvdGlhQGdtYWlsLmNvbSIsInVzZXJuYW1lIjoicmlzaGFiaDF0ZW90aWEiLCJpYXQiOjE3MjQyMjMwNzMsImV4cCI6MTcyNDMwOTQ3M30.c4KqfwVlOFyPgeGoKGzVyM7PcDr-k2grfzYnm7PCFG0'
  // }
});

const chatContainer = document.getElementById("chat-container");
const statusDiv = document.getElementById("status");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");
const senderInput = document.getElementById("sender-input");
const receiverInput = document.getElementById("receiver-input");
const joinRoomBtn = document.getElementById("join-room");
const messageSendBtn = document.getElementById("sent-message-btn");

function updateStatus(message) {
  statusDiv.textContent = message;
}

function joinRoom() {
  const sender = senderInput.value;
  if (!sender) {
    return alert("Please enter the sender");
  }
  socket.emit("register_user", sender);

  const recipient = receiverInput.value;
  if (!recipient) {
    return alert("Please enter the recipient");
  }

  const roomId = [sender, recipient].sort().join("_");

  socket.emit("join_room", roomId);
  joinRoomBtn.disabled = true;
  messageSendBtn.disabled = false;

  fetchMessages(sender, recipient);
}

function addMessage(sender, content) {
  const messageDiv = document.createElement("div");
  messageDiv.className = "message";
  messageDiv.innerHTML = `<span class="sender">${sender}:</span> ${content}`;
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

socket.on("connect", () => {
  updateStatus("Connected to server");
});

socket.on("connect_error", (error) => {
  updateStatus("Connection error: " + error.message);
});

socket.on("disconnect", (reason) => {
  updateStatus("Disconnected: " + reason);
});

socket.on("new_message", (data) => {
  console.log(data.message, "new message");
  const user = data.message.sender === senderInput.value ? "You" : "Other";
  addMessage(user, data.message.content);
});

messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage();
});

joinRoomBtn.addEventListener("click", joinRoom);

function sendMessage() {
  const sender = senderInput.value;
  const recipient = receiverInput.value;
  const content = messageInput.value;
  // const conversationId = conversationId.value;

  if (!sender || !recipient || !content) {
    updateStatus("Please fill all fields");
    return;
  }

  fetch("http://localhost:8003/api/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender,
      recipient,
      content,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data, "send Message api response");
      if (data.success) {
        // addMessage("You", content);
        messageInput.value = "";
      } else {
        updateStatus("Failed to send message");
      }
    })
    .catch((error) => {
      updateStatus("Error sending message: " + error.message);
    });
}

function fetchMessages(sender, recipient) {
  fetch(`http://localhost:8003/api/v1/conversations/${sender}/${recipient}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        chatContainer.innerHTML = ""; // Clear existing messages
        data.data.forEach((message) => {
          const sender =
            message.sender === "66c262e0cbc913ffa846991c" ? "You" : "Other";
          addMessage(sender, message.content);
        });
      } else {
        updateStatus("Failed to fetch messages");
      }
    })
    .catch((error) => {
      updateStatus("Error fetching messages: " + error.message);
    });
}
