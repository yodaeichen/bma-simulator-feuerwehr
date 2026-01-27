const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let status = "NORMAL";
let fat = []; // FAT-Einträge

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/instructor", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "instructor.html"));
});

io.on("connection", socket => {
  console.log("🔌 Client connected");

  // Initialzustand senden
  socket.emit("update", { status, fat });

  socket.on("alarm", data => {
    console.log("🔥 Alarm empfangen");

    status = "ALARM";

    const entry = {
      time: new Date().toLocaleTimeString("de-DE"),
      floor: data?.floor || "EG",
      detector: data?.detector || "Handmelder"
    };

    fat.unshift(entry); // neuester Eintrag oben
    io.emit("update", { status, fat });
  });

  socket.on("reset", () => {
    console.log("✅ Rückgestellt");
    status = "NORMAL";
    fat = [];
    io.emit("update", { status, fat });
  });
});

server.listen(3000, () => {
  console.log("🚒 BMA Simulator läuft auf Port 3000");
});
