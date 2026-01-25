const PDFDocument = require("pdfkit");
const fs = require("fs");

module.exports = function(data, filePath) {
  const doc = new PDFDocument({ size: "A4", margin: 40 });
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(16).text("Feuerwehr Laufkarte", { align: "center" });
  doc.moveDown();
  doc.fontSize(12)
    .text("Objekt: " + data.object)
    .text("Adresse: " + data.address)
    .text("Etage: " + data.floor)
    .text("Melder: " + data.detector)
    .text("Art: " + data.type);

  doc.moveDown();
  doc.text("Laufweg:");
  doc.text(data.route);

  doc.end();
};
