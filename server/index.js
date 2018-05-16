// server/app.js
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const serveStatic = require("serve-static");
const session = require("express-session");
const resumeCanvas = require("./resumeCanvas");
const url = require("url");
const cookieParser = require("cookie-parser");
const Twitter = require("twitter");
const twitterPost = require("./twitterPost");

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

// Serve static assets
app.use("/", serveStatic(path.join(__dirname, "..")));

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
    if (req.user) res.status(200).send(req.user);
    res.status(200).send("No User");
  } catch (err) {
    console.error("Error loading locations!", err);
    res.status(500).send("Internal server error");
  }
});

app.post("/api/", async (req, res) => {
  try {
    const canvas = await resumeCanvas(req.body.text);
    res.setHeader("Content-Type", "image/png");
    canvas.pngStream().pipe(res);
  } catch (err) {
    console.error("Error loading locations!", err);
    res.status(500).send("Internal server error");
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

app.post("/tweet/", async (req, res) => {
  const client = new Twitter({
    consumer_key: TWITTER_CONSUMER_KEY,
    consumer_secret: TWITTER_CONSUMER_SECRET,
    access_token_key: req.user.token,
    access_token_secret: req.user.tokenSecret
  });
  const canvas = await resumeCanvas(req.body.text);
  const imgString = canvas.toDataURL().split(",")[1];
  const result = await twitterPost(client, imgString, req.body.content);
  res.status(200).send(result);
});

module.exports = app;
