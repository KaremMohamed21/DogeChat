const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const path = require("path");

// GLOBAL DECLARATIONs
let activeSockets = [];

// Serve Static Files
app.use(express.static(path.join(__dirname, "public")));

// Handle Socket Connection
io.on("connection", (socket) => {
  console.log("Socket connected.");

  // Check if this socket is connected and active
  // if its then do nothing
  // if it's not then
  const existingSocket = activeSockets.find((existingSocket) => existingSocket === socket.id);

  if (!existingSocket) {
    // 1) Push the socket to the active sockets array
    activeSockets.push(socket.id);

    // 2) emit list of connected user to this socket
    socket.emit("update-user-list", {
      users: activeSockets.filter((existingSocket) => existingSocket !== socket.id)
    });

    // 3) emit this new user to all active users
    socket.broadcast.emit("update-user-list", {
      users: [socket.id]
    });
  }

  // ON socket call-user
  socket.on("call-user", (data) => {
    socket.to(data.to).emit("call-made", {
      offer: data.offer,
      socket: socket.id
    });
  });

  // ON socket make-answer
  socket.on("make-answer", (data) => {
    socket.to(data.to).emit("answer-made", {
      socket: socket.id,
      answer: data.answer
    });
  });

  // ON socket Disconnection
  socket.on("disconnect", () => {
    console.log("socket disconnected!!!");

    activeSockets = activeSockets.filter((existingSocket) => existingSocket !== socket.id);

    socket.broadcast.emit("remove-user", {
      socketId: socket.id
    });
  });
});

// Handle HTTP Requests
app.get("/", (req, res) => {
  res.send(`<h1>Hello World</h1>`);
});

// Start Server Listening
server.listen(process.env.PORT || 3000, () => {
  console.log("server running");
});
