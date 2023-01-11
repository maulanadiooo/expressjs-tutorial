const Player = require("./models");
const Voucher = require("../voucher/models");
const Category = require("../category/models");

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
      const voucher = await Voucher.findOne({ _id: id })
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
          data: voucher,
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
};
