const path = require("path");
const express = require("express");
const http = require("http");
const sockerio = require("socket.io");
const Filter = require("bad-words");
const app = express();
const { generateMessage, generateLocation } = require("./utils/message");
const {
  addUser,
  removeUser,
  getUser,
  getUsersinRoom,
  users,
} = require("./utils/users");

const server = http.createServer(app);
const io = sockerio(server);

const publicDirectoryPath = path.join(__dirname, "../public");
app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  console.log("new web socket connection");

  socket.on("join", (options, callBack) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return callBack(error);
    }
    socket.join(user.room);
    socket.emit(
      "message",
      generateMessage(
        "Admin",
        `Welcome, ${user.username} to ${user.room} room.`
      )
    );
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("Admin", `${user.username} has joined!`)
      );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersinRoom(user.room),
    });

    callBack();
  });

  socket.on("sendMessage", (message, callBack) => {
    const { room, username } = getUser(socket.id);
    const filter = new Filter();
    let msg;
    if (filter.isProfane(message)) {
      msg = filter.clean(message);
    } else {
      msg = message;
    }
    io.to(room).emit("message", generateMessage(username, msg));
    callBack();
  });

  socket.on("sendLocation", (coords, callBack) => {
    const { username, room } = getUser(socket.id);
    const { latitude, longitude } = coords;
    io.to(room).emit(
      "location",
      generateLocation(
        username,
        `https://google.com/maps?q=${latitude},${longitude}`
      )
    );

    callBack();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} has left!`)
      );

      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersinRoom(user.room),
      });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("server started");
});
