const express = require("express"); // Access
const socket = require("socket.io");

const app = express(); //Initialized and server ready

app.use(express.static("public"));

let port = process.env.PORT || 5000;
let server = app.listen(port, () => {
    console.log("Listening to port" + port);
})

let io = socket(server);

io.on("connection", (socket) => {
    console.log("Made socket connection");
    // Received data
    socket.on("beginPath", (data) => {
        // data -> data from frontend
        // Now transfer data to all connected computers
        io.sockets.emit("beginPath", data);
    })
    socket.on("drawStroke", (data) => {
        io.sockets.emit("drawStroke", data);
    })
    socket.on("undo", (data) => {
        io.sockets.emit("undo", data);
    })
    socket.on("redo", (data) => {
        io.sockets.emit("redo", data);
    })
    socket.on("backgroundCanvas", (data) => {
        io.sockets.emit("backgroundCanvas", data);
    })
})