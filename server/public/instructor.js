const socket = io();
let objects = {};

fetch("/objects.json")
  .then(r => r.json())
  .then(data => {
    objects = data;
    init();
  });

function init() {
  const o = document.getElementById("object");
  for (let id in objects) {
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = objects[id].name;
    o.appendChild(opt);
  }
  updateFloors();
}

function updateFloors() {
  const obj = object.value;
  floor.innerHTML = "";
  for (let f in objects[obj].floors) {
    const o = document.createElement("option");
    o.value = f;
    o.textContent = objects[obj].floors[f].name;
    floor.appendChild(o);
  }
  updateDetectors();
}

function updateDetectors() {
  const obj = object.value;
  const f = floor.value;
  detector.innerHTML = "";
  for (let d in objects[obj].floors[f].detectors) {
    const o = document.createElement("option");
    o.value = d;
    o.textContent = d;
    detector.appendChild(o);
  }
}

object.onchange = updateFloors;
floor.onchange = updateDetectors;

function alarm() {
  socket.emit("alarm", {
    objectId: object.value,
    floorId: floor.value,
    detectorId: detector.value
  });
}

function reset() {
  socket.emit("reset");
}
