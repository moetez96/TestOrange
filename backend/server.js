const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./config/db.js");
var usersRouter = require("./routes/users");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/auth", usersRouter);

mongoose.Promise = global.Promise;
mongoose
  .connect(db.url, { useNewUrlParser: true })
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err.message);
  });

const port = 5000;

app.listen(port, () => {
  console.log("server started at 5000");
});
