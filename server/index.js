// server/app.js
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const serveStatic = require("serve-static");
const session = require("express-session");
const resumeFactory = require("./resumeFactory");

const passport = require("passport");
const TwitterStrategy = require("passport-twitter");
let {
  TWITTER_CONSUMER_KEY,
  TWITTER_CONSUMER_SECRET,
  BASE_URL
} = require("./config");

TWITTER_CONSUMER_KEY = TWITTER_CONSUMER_KEY || process.env.TWITTER_CONSUMER_KEY;
TWITTER_CONSUMER_SECRET =
  TWITTER_CONSUMER_SECRET || process.env.TWITTER_CONSUMER_SECRET;
BASE_URL = BASE_URL || process.env.BASE_URL || "http://localhost:9000";

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
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true
  })
);

// Serve static assets
app.use("/", serveStatic(path.join(__dirname, "..")));

app.use(passport.initialize());
app.use(passport.session());

// passport-twitterの初期化
passport.use(
  new TwitterStrategy(
    {
      consumerKey: TWITTER_CONSUMER_KEY, //TwitterのconsumerKey
      consumerSecret: TWITTER_CONSUMER_SECRET, //TwitterのconsumerSecret
      callbackURL: BASE_URL + "/auth/twitter/callback" //認証成功時の戻り先URL
    },
    (token, tokenSecret, profile, cb) => {
      cb(profile);
    }
  )
);

app.get("/auth/twitter", passport.authenticate("twitter"));

app.get(
  "/auth/twitter/callback",
  passport.authenticate("twitter", {
    failureRedirect: "/"
  }),
  (req, res) => {
    res.redirect("/");
  }
);

app.post("/api/", async (req, res) => {
  try {
    const canvas = await resumeFactory(req.body.text);
    res.setHeader("Content-Type", "image/png");
    canvas.pngStream().pipe(res);
    // res.status(200).send(JSON.stringify(canvas));
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
