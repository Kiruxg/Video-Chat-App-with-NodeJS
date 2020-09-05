const express = require("express");
const { v4: uuidv4 } = require("uuid");
const app = express();
const server = require("http").Server(app); //server for socketio
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer"); //realtime browser communication
const peerServer = ExpressPeerServer(server, {
  debug: true,
});
app.set("view engine", "ejs"); //look in views folder
app.use(express.static("public"));

app.use("/peerjs", peerServer);
//endpoints
app.get("/", (req, res) => {
  //   res.status(200).send("hello world");
  res.redirect(`/${uuidv4()}`); //random id generator
});
app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});
io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);
    console.log("joined room");

    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message);
    });
  });
});
server.listen(3030);
