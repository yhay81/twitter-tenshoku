// server/app.js
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const serveStatic = require("serve-static");
const resumeFactory = require("./resumeFactory");
const app = express();
const PORT = process.env.PORT || 9000;

app.listen(PORT);

// Setup logger
app.use(
  morgan(
    ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'
  )
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static assets
app.use("/", serveStatic(path.join(__dirname, "..")));

app.post("/api/", async (req, res) => {
  try {
    await resumeFactory(req.body.text);
    res.send("Okay");
  } catch (err) {
    console.error("Error loading locations!", err);
    res.send(500, "Internal server error");
  }
});

// Always return the main index.html, so react-router render the route in the client
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "..", "index.html"));
});

module.exports = app;
