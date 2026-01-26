const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

/* -------------------------------------------------
   STATIC FILES
------------------------------------------------- */
app.use(express.static(path.join(__dirname, "public")));

/* -------------------------------------------------
   ROUTES FOR VIEWS
------------------------------------------------- */
app.get("/bmz", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "bmz.html"))
);

app.get("/fat", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "fat.html"))
);

app.get("/fbf", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "fbf.html"))
);

app.get("/instructor", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "instructor.html"))
);

/* -------------------------------------------------
   OBJECT DATA (robust loading)
------------------------------------------------- */
const objectsPath = path.join(__dirname, "data", "objects.json");
let objects = {};

if (fs.existsSync(objectsPath)) {
  try {
    objects = JSON.parse(fs.readFileSync(objectsPath));
    console.log("✅ Objektdaten geladen");
  } catch (e) {
    console.error("❌ Fehler in objects.json", e);
  }
} else {
  console.warn("⚠️ objects.json fehlt – leere Objektliste");
}

/* -------------------------------------------------
   API
------------------------------------------------- */
app.get("/api/objects", (req, res) => {
  res.json(objects);
});

/* -------------------------------------------------
   LAUFKARTEN (PDF)
------------------------------------------------- */
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

/* -------------------------------------------------
   BMA STATE
------------------------------------------------- */
let bmaState = {
  status: "NORMAL", // NORMAL | ALARM | STOERUNG
  fat: []
};

/* -------------------------------------------------
   SOCKET.IO
------------------------------------------------- */
io.on("connection", socket => {
  console.log("🔌 Client verbunden");

  // Initialstatus senden
  socket.emit("update", bmaState);

  /* ---------- ALARM ---------- */
  socket.on("alarm", alarm => {
    console.log("🔥 Alarm", alarm);

    bmaState.status = "ALARM";

    bmaState.fat.unshift({
      time: new Date().toLocaleTimeString(),
      object: alarm.objectId,
      floor: alarm.floorId,
      detector: alarm.detectorId
    });

    io.emit("update", bmaState);
  });

  /* ---------- RESET ---------- */
  socket.on("reset", () => {
    console.log("🔄 Rückstellung");

    bmaState.status = "NORMAL";
    bmaState.fat = [];

    io.emit("update", bmaState);
  });
});

/* -------------------------------------------------
   START SERVER
------------------------------------------------- */
server.listen(PORT, () => {
  console.log(`🚒 BMA Simulator läuft auf Port ${PORT}`);
});
