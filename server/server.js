const fs = require("fs");
const path = require("path");

const objectsPath = path.join(__dirname, "data", "objects.js");
let objects = JSON.parse(fs.readFileSync(objectsPath));

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 3000;

let status = "NORMAL";
let fat = [];

function broadcast() {
  io.emit("update", { status, fat });
}

app.use(express.static(path.join(__dirname, "public")));
app.get("/bmz", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "bmz.html"));
});

app.get("/fbf", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "fbf.html"));
});

app.get("/fat", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "fat.html"));
});

app.get("/instructor", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "instructor.html"));
});
app.get("/api/objects", (req, res) => {
  res.json(objects);
});

app.get("/objects.json", (req, res) => res.json(objects));

app.get("/laufkarte/:object/:floor/:detector", (req, res) => {
  const { object, floor, detector } = req.params;

  const file = path.join(
    __dirname,
    "laufkarten",
    object,
    floor,
    `${detector}.pdf`
  );

  if (!fs.existsSync(file)) {
    return res.status(404).send("Laufkarte nicht gefunden");
  }

  res.sendFile(file);
});

io.on("connection", socket => {
  socket.emit("update", { status, fat });

  socket.on("alarm", data => {
    const object = objects[data.objectId];
    const floor = object?.floors[data.floorId];
    const detector = floor?.detectors[data.detectorId];
    if (!detector) return;

    status = "ALARM";

    const filename = `${object.id}-${data.floorId}-${data.detectorId}.pdf`;
    const outPath = path.join(__dirname, "laufkarten/output", filename);

    createLaufkarte({
      object: object.name,
      address: object.address,
      floor: floor.name,
      detector: `${data.detectorId} – ${detector.name}`,
      type: detector.type,
      route: detector.route
    }, outPath);
  fat.push({
  time: new Date().toLocaleTimeString(),
  object: alarm.objectId,
  floor: alarm.floorId,
  detector: alarm.detectorId
});

    fat.unshift({
      time: new Date().toLocaleTimeString("de-DE"),
      object: object.name,
      floor: floor.name,
      detector: detector.name,
      laufkarte: filename
    });

    broadcast();
  });

  socket.on("reset", () => {
    status = "NORMAL";
    fat = [];
    broadcast();
  });
});

server.listen(PORT, () =>
  console.log("BMA Simulator läuft auf Port", PORT)
);
