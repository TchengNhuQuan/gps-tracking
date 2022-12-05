//var socket = io("https://trackinggps069274.herokuapp.com");//kết nối server
$(document).ready(function () {
  $("#register").show();
  $("#main").hide();
});
var socket = io.connect("https://gps-tracking.onrender.com/");
var connected = false;
// Map initialization
var map = L.map("map").setView([14.0860746, 100.608406], 6);
//osm layer
var osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  id: "mapbox/streets-v11",
  maxZoom: 18,
  tileSize: 512,
  zoomOffset: -1,
  accessToken:
    "pk.eyJ1IjoiZGF0cmFuMDY5Mjc0IiwiYSI6ImNrdno5ZjlkYTBtcXkyeG5vNWk5Ym92anEifQ.iM98qKMYAEVl6N8aj5iiLA",
});
map.eachLayer(function (layer) {
  if (layer.options.name === "XXXXX") {
    layer.setLatLng([newLat, newLon]);
  }
});
var usersArray = [],
  myUsername = "";
var lat,
  long,
  status = "unknown";
var mapMarkers = [];
var marker, circle;
osm.addTo(map);
var theMarker = {};
var usersArray = [];
if (!navigator.geolocation) {
  console.log("Your browser doesn't support geolocation feature!");
} else {
  setInterval(() => {
    navigator.geolocation.getCurrentPosition(getPosition);
  }, 5000);
}
function getPosition(position) {
  status = "online";
  lat = position.coords.latitude;
  long = position.coords.longitude;
  var accuracy = position.coords.accuracy;
  var mymarker = L.marker([lat, long]);
  var data = { name: myUsername, marker: mymarker, stt: "online" };
  if (myUsername != "") {
    socket.emit("client-send-location-data", data);
    console.log(
      "Your coordinate is: Lat: " +
        lat +
        " Long: " +
        long +
        " Accuracy: " +
        accuracy
    );
    console.log("ban vua gui vi tri cua minh");
    updateLocationByName(data);
    // console.log("Cap nhat o client");
    // console.log(usersArray)
  }
}
socket.on("client-dang-ki-that-bai", function () {
  alert("Tên đăng kí không hợp lệ !");
});
socket.on("client-dang-ki-thanh-cong", function (data) {
  var name = $("#name").val();
  console.log("Đăng kí thành công với tên " + name);
  myUsername = name;
  usersArray = data;
  console.log("Lan dau nhan danh sach client");
  console.log(usersArray);
  $("#objects").html("");
  usersArray.forEach((user) => {
    $("#objects").append(
      "<div class='client' style='border-bottom:1px solid black;'>" +
        user.name +
        " status: " +
        user.stt +
        "</div>"
    );
  });
  updateLocations(usersArray);
  document.getElementById("username").value = name;
  $("#register").hide();
  $("#main").show();
});
socket.on("sever-send-data", function (data) {
  // console.log("position change: "+data.name+"trang thai "+data.stt);
  updateLocationByName(data);
  // console.log("Co client vua gui");
  console.log(usersArray);
});
socket.on("close", function (name) {
  console.log("client: " + name + " out!!!!!");
  removeCloseClient(name);
});
function updateLocationByName(data) {
  var index = indexOf(usersArray, data.name);
  if (index >= 0) {
    usersArray[index].marker = data.marker;
    if (usersArray[index].stt == "unknown") {
      console.log(
        data.name + " sua trang thai tu " + data.stt + " thanh online"
      );
      usersArray[index].stt = "online";
      var clientList = document.querySelectorAll(".client");
      for (var i = 0; i < clientList.length; i++) {
        if (clientList[i].innerText == data.name + " status: unknown") {
          clientList[i].innerText = data.name + " status: online";
        }
      }
    }
    if (mapMarkers[index] != undefined) this.map.removeLayer(mapMarkers[index]);
    var Marker = L.marker([data.marker._latlng.lat, data.marker._latlng.lng])
      .addTo(map)
      .bindPopup(`<b>Hello!</b><br>I'm ${data.name}.`)
      .openPopup();
    this.mapMarkers[index] = Marker;
  } else {
    usersArray.push(data);
    var Marker = L.marker([
      data.marker._latlng.lat,
      data.marker._latlng.lng,
    ]).addTo(map);
    this.mapMarkers.push(Marker);
    $("#objects").append(
      "<div class='client'>" + data.name + " status: " + data.stt + "</div>"
    );
  }
}
function removeCloseClient(name) {
  var index = indexOf(usersArray, name);
  if (index >= 0) {
    usersArray.splice(index, 1);
    this.map.removeLayer(mapMarkers[index]);
    mapMarkers.splice(index, 1);
    var clientList = document.querySelectorAll(".client");
    for (var i = 0; i < clientList.length; i++) {
      // alert(clientList[i].innerText==name+" status: unknown")
      // alert(clientList[i].innerText==name+" status: online")
      if (
        clientList[i].innerText == name + " status: unknown" ||
        clientList[i].innerText == name + " status: online"
      ) {
        clientList[i].remove();
        break;
      }
    }
  }
}
// $(document).on('click', '.client', function () {
//     var name=event.target.innerText;
//     alert(name);
//     var index=indexOf(usersArray,name);
//     map.setView([mapMarkers[i]._latlng.lat, mapMarkers[i]._latlng.lng], 13);
// });
// $('.client').click(function(){

//     //
//     // alert(name);
//     // var index=indexOf(usersArray,)
//     // map.setView([14.0860746, 100.608406], 6);
// });
map.on("click", function (e) {
  lat = e.latlng.lat;
  lon = e.latlng.lng;
  console.log("You clicked the map at LAT: " + lat + " and LONG: " + lon);
  if (theMarker != undefined) {
    map.removeLayer(theMarker);
  }
  theMarker = L.marker([lat, lon])
    .addTo(map)
    .bindPopup(`Lat: ${lat}\nLong: ${lon} `)
    .openPopup();
});

function updateLocations(data) {
  console.log("KET_QUA_DANG_KI_THANH_CONG");
  for (var i = 0; i < mapMarkers.length; i++) {
    this.map.removeLayer(mapMarkers[i]);
  }
  mapMarkers = [];
  for (var i = 0; i < data.length; i++)
    if (usersArray[i].stt == "online") {
      var Marker;
      if (usersArray[i].stt == "online") {
        Marker = L.marker([
          data[i].marker._latlng.lat,
          data[i].marker._latlng.lng,
        ])
          .addTo(map)
          .bindPopup(`<b>Hello world!</b><br>I am ${usersArray[i].name}.`)
          .openPopup();
        this.mapMarkers.push(Marker);
      }
    }
}

$("#logout").click(function () {
  socket.emit("close");
  $("#main").hide();
  $("#register").show();
  myUsername = "";
  document.getElementById("username").value = "";
  usersArray = [];
  status = "unknown";
});
$("#submit").click(function () {
  if (myUsername.length == 0) {
    var name = $("#name").val();
    if (lat == undefined && long == undefined) {
      // alert("unknown");
      marker = L.marker([0, 0]);
      status = "unknown";
    } else {
      // alert("know");
      marker = L.marker([lat, long]);
      status = "online";
    }
    // console.log("toi vua bam ten la "+name);
    var data = {
      name: name,
      marker: marker,
      stt: status,
    };
    usersArray.push(data);
    socket.emit("client-send-useName", data);
  }
});
function indexOf(usersArray, name) {
  for (var i = 0; i < usersArray.length; i++) {
    if (usersArray[i].name == name) return i;
  }
  return -1;
}
