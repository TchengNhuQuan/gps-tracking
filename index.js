var express = require("express");
const { existsSync } = require("fs");
var app = express();
app.use(express.static("public"));
app.use(express.json());
var server = require("http").Server(app);

app.set("view engine", "ejs");
app.set("views", "./view");
server.listen(process.env.PORT || 3000);
app.get("/", function (req, res) {
  res.render("trangchu");
});
var io = require("socket.io")(server);
var usersArray = [];
io.on("connection", function (socket) {
  console.log(socket.id);
  socket.on("disconnect", function () {
    console.log(socket.id + " Đã thoát");
  });
  socket.on("client-send-useName", function (data) {
    if (!checkExsitUser(data.name)) {
      usersArray.push(data); //data gom 2; name va marker
      socket.emit("client-dang-ki-thanh-cong", usersArray);
      io.sockets.emit("sever-send-data", data);
      console.log("dang ki thanh cong " + data.name);
      socket.name = data.name;
    } else {
      socket.emit("client-dang-ki-that-bai");
      console.log("dang ki that bai ten " + data.name);
    }
    console.log("So client: " + usersArray.length);
  });
  socket.on("client-send-location-data", function (data) {
    console.log(data.name + " vua gui trang thai " + data.stt);
    var index = indexOf(usersArray, data.name);
    if (index >= 0) {
      usersArray[index] = data;
      io.sockets.emit("sever-send-data", data);
    }
  });
  socket.on("disconnect", function () {
    console.log(socket.name + " da thoat!");
    var index = indexOf(usersArray, socket.name);
    usersArray.splice(index, 1);
    socket.broadcast.emit("close", socket.name);
    //soket kh con
  });
  socket.on("close", function () {
    console.log(socket.name + " da thoat!");
    var index = indexOf(usersArray, socket.name);
    usersArray.splice(index, 1);
    socket.broadcast.emit("close", socket.name);
  });
});
function checkExsitUser(data) {
  for (var i = 0; i < usersArray.length; i++) {
    if (usersArray[i].name == data) return true;
  }
  return false;
}
function indexOf(usersArray, name) {
  for (var i = 0; i < usersArray.length; i++) {
    if (usersArray[i].name == name) return i;
  }
  return -1;
}
