const express = require("express");
const cors = require("cors");
var http = require("http");
var fs = require("fs");
const colors = require("colors");
const dotenv = require("dotenv").config();
const connectDB = require("./config/db");
const config = require("./config.json");
const session = require("express-session");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo")(session);

const PORT = process.env.PORT;

const tls = {
  cert: fs.readFileSync(config.tls.cert),
  key: fs.readFileSync(config.tls.key),
};

console.log("----------------------------------");
console.log("|  Auth Microservice is running  |");
console.log("----------------------------------");
console.log("Environment: ", process.env.NODE_ENV);
console.log("Client: ", process.env.CLIENT);
console.log("Running on port:", PORT);

/* ------------------------ Connect to Mongo Database ----------------------- */
connectDB();

/* ----------------------- Configure Express Server ----------------------- */
const app = express();
app.use(
  cors({
    origin: process.env.CLIENT,
    credentials: true,
  })
);

app.use(express.json());

//configure sessions
app.set("trust proxy", 1); // trust first pro

const sessionStore = new MongoStore({
  mongooseConnection: mongoose.connection,
  collection: "sessions",
});

app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 },
  })
);

http.createServer(app).listen(PORT, function () {
  console.log(`HTTP Server running on port ${PORT}`.yellow.bold);
});

/* -------------------------------------------------------------------------- */
/*                               Api ROUTES                                   */
/* -------------------------------------------------------------------------- */

app.get("/", function (req, res) {
  res.send("Successfully hit the authentication api!");
});

const authRouter = require("./routes/auth");
app.use("/auth", authRouter);

module.exports = {
  app,
};
