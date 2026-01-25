module.exports = {
  schule: {
    id: "schule",
    name: "Schule Musterstadt",
    address: "Musterstraße 1, 12345 Musterstadt",
    floors: {
      EG: {
        name: "Erdgeschoss",
        detectors: {
          "EG-01": {
            name: "Flur Eingang",
            type: "Rauchmelder",
            route: "BMZ → Eingang → Flur"
          }
        }
      }
    }
  }
};
