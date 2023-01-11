const Player = require("../player/models");
const path = require("path");
const fs = require("fs");
const config = require("../../config");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = {
  signUp: async (req, res) => {
    try {
      const payload = req.body;
      if (req.file) {
        let tmpPath = req.file.path;
        let originalExtension =
          req.file.originalname.split(".")[
            req.file.originalname.split(".").length - 1
          ];
        let fileName = req.file.filename + "." + originalExtension;
        let targetPath = path.resolve(
          config.rootPath,
          `public/uploads/${fileName}`
        );

        const src = fs.createReadStream(tmpPath);
        const dest = fs.createWriteStream(targetPath);

        src.pipe(dest);
        src.on("end", async () => {
          try {
            const player = new Player({ ...payload, avatar: fileName });

            await player.save();
            delete player._doc.password;

            res.status(201).json({
              status: true,
              message: "success",
              data: player,
            });
          } catch (err) {
            if (err && err.name == "ValidationError") {
              res.status(422).json({
                status: false,
                message: err.message,
                fields: err.errors,
              });
            }
          }
        });
      } else {
        let player = new Player(payload);

        await player.save();

        delete player._doc.password;
        res.status(201).json({
          status: true,
          message: "success",
          data: player,
        });
      }
    } catch (err) {
      if (err && err.name == "ValidationError") {
        res.status(422).json({
          status: false,
          message: err.message,
          fields: err.errors,
        });
      }
    }
  },

  signIn: (req, res, next) => {
    const { email, password } = req.body;

    Player.findOne({
      email: email,
    })
      .then((player) => {
        if (player) {
          const checkPassword = bcrypt.compareSync(password, player.password);
          if (checkPassword) {
            const token = jwt.sign(
              {
                player: {
                  id: player.id,
                  username: player.username,
                  email: player.email,
                  nama: player.nama,
                  phoneNumber: player.phoneNumber,
                  avatar: player.avatar,
                },
              },
              config.jwtKey
            );

            res.status(200).json({
              status: true,
              message: "success",
              data: {
                token: token,
              },
            });
          } else {
            res.status(403).json({
              status: false,
              message: "Password yang anda masukkan salah",
            });
          }
        } else {
          res.status(403).json({
            status: false,
            message: "Email tidak ditemukan",
          });
        }
      })
      .catch((err) => {
        res.status(500).json({
          status: false,
          message: err.message || "Internal server error",
        });
      });
  },
};
