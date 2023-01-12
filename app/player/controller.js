const Player = require("./models");
const Voucher = require("../voucher/models");
const Category = require("../category/models");
const Nominal = require("../nominal/models");
const Payment = require("../payment/models");
const Bank = require("../bank/models");
const Transaction = require("../transaction/models");
const path = require("path");
const fs = require("fs");
const config = require("../../config");

module.exports = {
  landingPage: async (req, res) => {
    try {
      const voucher = await Voucher.find()
        .select("_id status name category thumbnail")
        .populate("category");
      res.status(200).json({
        status: true,
        message: "success",
        data: voucher,
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: err.message || "Internal server error",
      });
    }
  },
  detailPage: async (req, res) => {
    try {
      const { id } = req.params;
      const payments = await Payment.find({}).populate("banks");
      let voucher = await Voucher.findOne({ _id: id })
        // .select("_id status name category thumbnail")
        .populate("category")
        .populate("nominals")
        .populate("user", "_id name phoneNumber");
      if (!voucher) {
        res.status(404, {
          status: false,
          message: "Data tidak ditemukan",
        });
      } else {
        res.status(200).json({
          status: true,
          message: "success",
          data: {
            voucher,
            payments,
          },
        });
      }
    } catch (err) {
      res.status(500).json({
        status: false,
        message: err.message || "Internal server error",
      });
    }
  },
  category: async (req, res) => {
    try {
      const category = await Category.find();
      res.status(200).json({
        status: true,
        message: "success",
        data: category,
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: err.message || "Internal server error",
      });
    }
  },

  checkout: async (req, res) => {
    try {
      const { accountUser, name, nominal, voucher, payment, bank } = req.body;
      const resVoucher = await Voucher.findOne({
        _id: voucher,
      })
        .select("name category id thumbnail user")
        .populate("category")
        .populate("user");
      if (!resVoucher) {
        return res.status(404).json({
          status: false,
          message: "Voucher tidak ditemukan",
        });
      }

      const resNominal = await Nominal.findOne({
        _id: nominal,
      });
      if (!resNominal) {
        return res.status(404).json({
          status: false,
          message: "Nominal tidak ditemukan",
        });
      }

      const resPayment = await Payment.findOne({
        _id: payment,
      });
      if (!resPayment) {
        return res.status(404).json({
          status: false,
          message: "Payment tidak ditemukan",
        });
      }
      console.log("resPayment");
      console.log(resPayment);
      const resBank = await Bank.findOne({
        _id: bank,
      });
      if (!resBank) {
        return res.status(404).json({
          status: false,
          message: "Bank tidak ditemukan",
        });
      }
      let tax = (10 / 100) * resNominal._doc.price;
      let value = resNominal._doc.price - tax;
      const payload = {
        historyVoucherTopup: {
          gameName: resVoucher._doc.name,
          category: resVoucher._doc.category
            ? resVoucher._doc.category.name
            : "",
          thumbnail: resVoucher._doc.thumbnail,
          coinName: resNominal._doc.coinName,
          coinQuantity: resNominal._doc.coinQuantity,
          price: resNominal._doc.price,
        },
        historyPayment: {
          name: resBank._doc.name,
          type: resPayment._doc.type,
          bankName: resBank._doc.bankName,
          noRekening: resBank._doc.noRekening,
        },
        name: name,
        accountUser: accountUser,
        tax: tax,
        value: value,
        player: req.player._id,
        historyUser: {
          name: resVoucher._doc.user?.name,
          phoneNumber: resVoucher._doc.user?.phoneNumber,
        },
        category: resVoucher._doc.category?._id,
        user: resVoucher._doc.user?._id,
      };
      const transaction = new Transaction(payload);
      await transaction.save();
      res.status(201).json({
        data: transaction,
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: err.message || "Internal server error",
      });
    }
  },

  history: async (req, res) => {
    try {
      const { status = "" } = req.query;

      let criteria = {};
      if (status.length) {
        criteria = {
          ...criteria,
          status: { $regex: `${status}`, $options: "i" },
        };
      }

      if (req.player._id) {
        criteria = {
          ...criteria,
          player: req.player._id,
        };
      }

      const history = await Transaction.find(criteria);

      let total = await Transaction.aggregate([
        { $match: criteria },
        {
          $group: {
            _id: null,
            value: { $sum: "$value" },
          },
        },
      ]);
      res.status(200).json({
        status: true,
        message: "success",
        data: {
          history: history,
          total: total.length ? total[0].value : 0,
        },
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: err.message || "Internal server error",
      });
    }
  },

  historyDetail: async (req, res) => {
    try {
      const { id } = req.params;

      const history = await Transaction.findOne({
        _id: id,
      });

      if (!history)
        return res.status(404).json({
          status: false,
          messge: "History tidak ditemukan",
        });

      res.status(200).json({
        status: true,
        message: "success",
        data: history,
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: err.message || "Internal server error",
      });
    }
  },

  dashboard: async (req, res) => {
    try {
      const count = await Transaction.aggregate([
        { $match: { player: req.player._id } },
        {
          $group: {
            _id: "$category",
            value: { $sum: "$value" },
          },
        },
      ]);
      const category = await Category.find({});

      category.forEach((cat) => {
        count.forEach((ct) => {
          if (ct._id.toString() === cat._id.toString()) {
            ct.name = cat.name;
          }
        });
      });
      const history = await Transaction.find({
        player: req.player._id,
      })
        .populate("category")
        .sort({
          updatedAt: -1,
        });
      res.status(200).json({
        status: true,
        message: "success",
        data: {
          history,
          count,
        },
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: err.message || "Internal server error",
      });
    }
  },

  profile: async (req, res) => {
    try {
      const player = await Player.findOne({
        _id: req.player._id,
      }).select("id username email name avatar phoneNumber");
      if (!player)
        return res.status(404).json({
          status: false,
          message: "User tidak ditemukan",
        });

      res.status(200).json({
        status: true,
        message: "success",
        data: player,
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: err.message || "Internal server error",
      });
    }
  },

  updateProfile: async (req, res, next) => {
    try {
      const { name = "", phoneNumber = "" } = req.body;

      let payload = {};

      if (name.length) payload.name = name;
      if (phoneNumber.length) payload.phoneNumber = phoneNumber;

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
          let player = await Player.findOne({ _id: req.player._id });
          let currentImage = `${config.rootPath}/public/uploads/${player.avatar}`;

          if (fs.existsSync(currentImage)) {
            fs.unlinkSync(currentImage);
          }

          player = await Player.findOneAndUpdate(
            {
              _id: req.player._id,
            },
            {
              ...payload,
              avatar: fileName,
            },
            { new: true, runValidators: true }
          );
          res.status(201).json({
            status: true,
            message: "success",
            data: {
              id: player.id,
              name: player.name,
              phoneNumber: player.phoneNumber,
              avatar: player.avatar,
            },
          });
        });
      } else {
        const player = await Player.findOneAndUpdate(
          {
            _id: req.player._id,
          },
          payload,
          { new: true, runValidators: true }
        );

        res.status(201).json({
          status: true,
          message: "success",
          data: {
            id: player.id,
            name: player.name,
            phoneNumber: player.phoneNumber,
            avatar: player.avatar,
          },
        });
      }
    } catch (err) {
      res.status(500).json({
        status: false,
        message: err.message || "Internal server error",
      });
    }
  },
};
