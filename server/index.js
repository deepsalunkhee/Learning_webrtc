// api/socket-server.js

const { Server } = require("socket.io");
const express = require("express");
const http = require("http"); // Import the http module

const app = express();
const port = process.env.PORT || 8000; // Use environment port or default to 8000

const startServer = () => {
  // Create an http server using the Express app
  const server = http.createServer(app);

  // Initialize Socket.IO server with the http server
  const io = new Server(server, {
    cors: true,
  });

  const emailToSocketIdMap = new Map();
  const socketidToEmailMap = new Map();

  io.on("connection", (socket) => {
    console.log(`Socket Connected`, socket.id);
    socket.on("room:join", (data) => {
      const { email, room } = data;
      emailToSocketIdMap.set(email, socket.id);
      socketidToEmailMap.set(socket.id, email);
      io.to(room).emit("user:joined", { email, id: socket.id });
      socket.join(room);
      io.to(socket.id).emit("room:join", data);
    });
  
    socket.on("user:call", ({ to, offer }) => {
      io.to(to).emit("incomming:call", { from: socket.id, offer });
    });
  
    socket.on("call:accepted", ({ to, ans }) => {
      io.to(to).emit("call:accepted", { from: socket.id, ans });
    });
  
    socket.on("peer:nego:needed", ({ to, offer }) => {
      console.log("peer:nego:needed", offer);
      io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
    });
  
    socket.on("peer:nego:done", ({ to, ans }) => {
      console.log("peer:nego:done", ans);
      io.to(to).emit("peer:nego:final", { from: socket.id, ans });
    });
  });
  // Start listening for incoming connections on the http server

  app.get("/",(req,res)=>{
    res.send("Server is running")
  })
  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

startServer();
