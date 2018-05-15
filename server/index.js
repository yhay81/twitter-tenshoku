// server/app.js
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const serveStatic = require("serve-static");
const session = require("express-session");
const resumeFactory = require("./resumeFactory");
const url = require("url");
const cookieParser = require("cookie-parser");
const Twitter = require("twitter");
const fs = require("fs");
const Canvas = require("canvas");

require("dotenv").config();

const passport = require("passport");
const { Strategy } = require("passport-twitter");

const TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY;
const TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;
const BASE_URL = process.env.BASE_URL || "http://localhost:9000";

const app = express();
const PORT = process.env.PORT || 9000;

app.listen(PORT);

// Setup logger
app.use(
  morgan(
    ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'
  )
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: "typing-cat",
    resave: false,
    saveUninitialized: true,
    httpOnly: false,
    secure: false,
    maxage: 1000 * 60 * 30
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, callback) => {
  callback(null, user);
});

passport.deserializeUser((obj, callback) => {
  callback(null, obj);
});

// passport-twitterの初期化
passport.use(
  new Strategy(
    {
      consumerKey: TWITTER_CONSUMER_KEY,
      consumerSecret: TWITTER_CONSUMER_SECRET,
      callbackURL: url.resolve(BASE_URL, "/auth/twitter/callback")
    },
    (token, tokenSecret, profile, callback) => {
      return callback(null, { token, tokenSecret, profile });
    }
  )
);

app.get("/auth/twitter", passport.authenticate("twitter"));

app.get(
  "/auth/twitter/callback",
  passport.authenticate("twitter", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/");
  }
);

app.get("/user", async (req, res) => {
  try {
    res.send(200, req.user);
  } catch (err) {
    console.error("Error loading locations!", err);
    res.send(500, "Internal server error");
  }
});

app.post("/api/", async (req, res) => {
  try {
    const canvas = await resumeFactory(req.body.text);
    res.setHeader("Content-Type", "image/png");
    canvas.pngStream().pipe(res);
  } catch (err) {
    console.error("Error loading locations!", err);
    res.send(500, "Internal server error");
  }
});

app.get("/", (req, res) => {
  if (res.user) {
    res.cookie("token", res.user.token, { maxAge: 60000, httpOnly: false });
    res.cookie("tokenSecret", res.user.tokenSecret, {
      maxAge: 60000,
      httpOnly: false
    });
  }
  const p = path.resolve(__dirname, "..", "index.html");
  res.sendFile(p);
});

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

app.post("/tweet/", async (req, res) => {
  const client = new Twitter({
    consumer_key: TWITTER_CONSUMER_KEY,
    consumer_secret: TWITTER_CONSUMER_SECRET,
    access_token_key: req.user.token,
    access_token_secret: req.user.tokenSecret
  });
  const base = path.resolve(__dirname, "/tenshoku.png");
  const img = await getImage(base);
  const canvas = draw(img, req.body.text);
  const string = canvas.toDataURL().split(",")[1];
  client.post("statuses/update", {
    Name: "test",
    media_data: string
  });
  client
    .post("statuses/update", {
      Name: "test",
      status: "Test from twitter api"
    })
    .then(tweet => {
      console.log(tweet);
    })
    .catch(error => {
      throw error;
    });
  res.send(200, "OK");
});

// Serve static assets
app.use("/", serveStatic(path.join(__dirname, "..")));

module.exports = app;
