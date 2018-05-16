const path = require("path");
const fs = require("fs");
const Canvas = require("canvas");

const getImage = filePath =>
  new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) reject(err);
      const img = new Canvas.Image();
      img.src = data;
      resolve(img);
    });
  });

const draw = (img, text) => {
  const canvas = new Canvas(img.width, img.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, img.width, img.height);
  ctx.font = "bold 60px Meiryo";
  ctx.fillText("Twitter TENSYOKU", 120, 140);
  ctx.fillText(text, 120, 320);
  const imagedata = ctx.getImageData(0, 0, img.width, img.height);
  ctx.putImageData(imagedata, 0, 0);
  return canvas;
};

const resumeCanvas = async text => {
  const img = await getImage(path.resolve(__dirname, "tenshoku.png"));
  const canvas = draw(img, text);
  return canvas;
};

module.exports = resumeCanvas;
