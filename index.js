const express = require("express");
const httpServer = require("http").createServer();
const { v4 : randomId} = require("uuid");

const port = process.env.PORT || 3001;

const app = express();

const io = require("socket.io")(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

io.on("connection", socket => {
    socket.emit("roomLink", socket.id);

    socket.on('join-room', (roomId)=>{
        socket.join(roomId)
        socket.to(roomId).emit("user-connected", socket.id);
    })

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });



httpServer.listen(port, () => console.log(`Listening on port ${port}`));
  
