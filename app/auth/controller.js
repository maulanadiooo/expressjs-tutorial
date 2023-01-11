const Player = require("../player/models");
const path = require("path");
const fs = require("fs");
const config = require("../../config");

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
};
