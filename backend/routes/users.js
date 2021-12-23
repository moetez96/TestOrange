const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
var multer = require("multer");
var excelToJson = require("convert-excel-to-json");
const path = require("path");
const readXlsxFile = require("read-excel-file/node");

const rounds = 10;
const jwt = require("jsonwebtoken");
const tokenSecret = "moetez123";

const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "storage");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: fileStorageEngine });

router.post("/login", (req, res) => {
  console.log(req.body);
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user)
        res.status(404).json({ error: "no user with that email found" });
      else {
        bcrypt.compare(req.body.password, user.password, (error, match) => {
          if (error) res.status(500).json(error);
          else if (match) {
            res.setHeader("Access-Control-Allow-Origin", "*");
            const generatedToken = jwt.sign({ data: user }, tokenSecret, {
              expiresIn: "24h",
            });
            res.status(200).json({ token: generatedToken, user });
          } else res.status(403).json({ error: "passwords do not match" });
        });
      }
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

router.post("/signup", (req, res) => {
  console.log(req.body);
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        bcrypt.hash(req.body.password, rounds, (error, hash) => {
          if (error) res.status(500).json(error);
          else {
            const newUser = User({
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              email: req.body.email,
              password: hash,
              direction: req.body.direction,
            });

            newUser
              .save()
              .then((user) => {
                res.setHeader("Access-Control-Allow-Origin", "*");
                const generatedToken = jwt.sign({ data: user }, tokenSecret, {
                  expiresIn: "24h",
                });
                res.json({ token: generatedToken });
              })
              .catch((error) => {
                res.status(500).json(error);
              });
          }
        });
      } else {
        res.status(404).json({ error: "email already exist" });
      }
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

router.get("/all", (req, res) => {
  User.find()
    .then((data) => res.send(data))
    .catch((error) => error.status(500).json(error));
});

router.post("/upload", upload.single("file"), (req, res) => {
  console.log(req.file);
  res.send(req.file.filename);

  readXlsxFile("./storage/" + req.file.filename, { User }).then(
    ({ rows, errors }) => {
      console.log(rows);
      console.log(errors);
    }
  );

  /*const excelData = excelToJson({
    sourceFile: "./storage/" + req.file.filename,
    sheets: [
      {
        name: "users",
        header: {
          rows: 1,
        },
        columnToKey: {
          A: "firstName",
          B: "lastName",
          C: "email",
          D: "password",
        },
      },
    ],
  });
  console.log(excelData);*/
});

module.exports = router;
