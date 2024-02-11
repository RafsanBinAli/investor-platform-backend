const { Server } = require("socket.io");

const initializeSocket = (server) => {
  const connectedUsers = {};
  const notificationCounts = {};
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type", "Accept", "Authorization"],
      credentials: true,
    },
  });

  // Middleware to handle headers for each connection
  io.use((socket, next) => {
    socket.handshake.headers["Access-Control-Allow-Headers"] =
      "Content-Type, Authorization";
    socket.handshake.headers["Access-Control-Allow-Origin"] =
      socket.handshake.headers.origin;
    socket.handshake.headers["Access-Control-Allow-Credentials"] = true;
    next();
  });

  // Connection event
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    // Handle authentication
    socket.on("authenticate", (username) => {
      connectedUsers[username] = socket;
      console.log(`${username} authenticated`);
      
    });

    socket.on("clientMessage", ({ sender, receiver, content }) => {
      console.log(`Received message from ${sender} to ${receiver}: ${content}`);
      

      // Relay the message to the intended recipient if online
      const recipientSocket = connectedUsers[receiver];
      if (recipientSocket) {
        recipientSocket.emit("serverMessage", { sender, content });
        console.log(`Relayed message to ${receiver}`);
      } else {
        console.log(`Recipient ${receiver} is not online`);
      }
    });

   

    // Disconnect event
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
      // Clean up disconnected user
      const disconnectedUser = Object.keys(connectedUsers).find(
        (key) => connectedUsers[key].id === socket.id
      );
      if (disconnectedUser) {
        delete connectedUsers[disconnectedUser];
        console.log(`${disconnectedUser} disconnected`);
      }
    });
  });

  return io;
};

module.exports = initializeSocket;
