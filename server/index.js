// server/app.js
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const serveStatic = require("serve-static");
const session = require("express-session");
const resumeFactory = require("./resumeFactory");
const url = require("url");

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
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: "typing-cat",
    resave: true,
    saveUninitialized: true
  })
);

// Serve static assets
app.use("/", serveStatic(path.join(__dirname, "..")));

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
      return callback(null, profile);
    }
  )
);

app.get("/auth/twitter", passport.authenticate("twitter"));

app.get(
  "/auth/twitter/callback",
  passport.authenticate("twitter", { failureRedirect: "/fail" }),
  (req, res) => {
    const { oauth_token, oauth_verifier } = req.query;
    res.redirect("/");
  }
);

app.get("/fail", async (req, res) => {
  try {
    res.send(200, "auth fail");
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

// Always return the main index.html, so react-router render the route in the client
app.get("*", (req, res) => {
  console.log("/", req.session.passport);
  res.sendFile(path.resolve(__dirname, "..", "index.html"));
});

module.exports = app;
