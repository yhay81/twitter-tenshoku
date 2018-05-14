// server/app.js
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const serveStatic = require("serve-static");
const resumeFactory = require("./resumeFactory");
const app = express();
const PORT = process.env.PORT || 9000;

app.listen(PORT);

console.log("Server started on port " + PORT + __dirname);

// Setup logger
app.use(
  morgan(
    ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'
  )
);

// Serve static assets
app.use("/", serveStatic(path.join(__dirname, "..")));

app.post("/api/", async (req, res) => {
  // const data = {
  //   quiz: req.body.quiz,
  //   correctAnswer: req.body.correct_answer,
  //   wrongAnswer1: req.body.wrong_answer1,
  //   wrongAnswer2: req.body.wrong_answer2,
  //   wrongAnswer3: req.body.wrong_answer3,
  //   genreName: req.body.genre_name,
  //   author: req.body.author,
  //   password: req.body.password
  // };
  try {
    await resumeFactory(req.body.text);
    res.send("Done!!");
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
