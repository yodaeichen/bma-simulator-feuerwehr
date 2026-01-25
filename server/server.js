const path = require("path");
const fs = require("fs");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const objects = require("./data/objects");
const createLaufkarte = require("./laufkarten/templates/din-laufkarte");

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

app.get("/objects.json", (req, res) => res.json(objects));

app.get("/laufkarte/:file", (req, res) => {
  const file = path.join(__dirname, "laufkarten/output", req.params.file);
  if (fs.existsSync(file)) res.sendFile(file);
  else res.status(404).send("Laufkarte nicht vorhanden");
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
