const Payment = require("./models");
const Bank = require("../bank/models");

module.exports = {
  index: async (req, res) => {
    try {
      const alertMessage = req.flash("alertMessage");
      const alertStatus = req.flash("alertStatus");

      const alert = { message: alertMessage, status: alertStatus };
      const payment = await Payment.find().populate("banks");
      res.render("admin/payment/view_payment", {
        payment,
        alert,
        name: req.session.user.name,
        title: "Jenis Pembayaran",
      });
    } catch (err) {
      req.flash("alertMessage", `${err.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/payment");
    }
  },
  viewCreate: async (req, res) => {
    try {
      const banks = await Bank.find();
      res.render("admin/payment/create", {
        banks,
        name: req.session.user.name,
        title: "Tambah Jenis Pembayaran",
      });
    } catch (err) {
      req.flash("alertMessage", `${err.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/payment");
    }
  },

  actionCreate: async (req, res) => {
    try {
      const { banks, type } = req.body;
      let payment = await Payment({
        banks,
        type,
      });
      await payment.save();
      req.flash("alertMessage", "Berhasil tambah jenis pembayaran");
      req.flash("alertStatus", "success");
      res.redirect("/payment");
    } catch (err) {
      req.flash("alertMessage", `${err.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/payment");
    }
  },

  viewEdit: async (req, res) => {
    try {
      const banks = await Bank.find();
      const { id } = req.params;
      const payment = await Payment.findOne({ _id: id }).populate("banks");
      if (payment) {
        res.render("admin/payment/edit", {
          payment,
          banks,
          name: req.session.user.name,
          title: "Ubah Jenis Pembayaran",
        });
      } else {
        res.render("admin/payment");
      }
    } catch (err) {
      req.flash("alertMessage", `${err.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/payment");
    }
  },

  actionEdit: async (req, res) => {
    try {
      const { id } = req.params;
      const { type, banks } = req.body;

      const payment = await Payment.findOneAndUpdate(
        {
          _id: id,
        },
        { type, banks }
      );

      if (payment) {
        req.flash("alertMessage", "Berhasil ubah payment");
        req.flash("alertStatus", "success");
        res.redirect("/payment");
      } else {
        req.flash("alertMessage", "Gagal ubah payment");
        req.flash("alertStatus", "danger");
        res.render("/payment");
      }
    } catch (err) {
      req.flash("alertMessage", `${err.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/payment");
    }
  },

  actionDelete: async (req, res) => {
    try {
      const { id } = req.params;
      const payment = await Payment.findOneAndRemove({ _id: id });
      req.flash("alertMessage", "Berhasil hapus payment");
      req.flash("alertStatus", "success");
      res.redirect("/payment");
    } catch (err) {
      req.flash("alertMessage", `${err.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/payment");
    }
  },

  actionUpdateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const paymentStatus = await Payment.findOne({ _id: id });
      await Payment.findOneAndUpdate(
        {
          _id: id,
        },
        {
          status: !paymentStatus.status,
        }
      );
      req.flash("alertMessage", "Berhasil ubah jenis pembayaran");
      req.flash("alertStatus", "success");
      res.redirect("/payment");
    } catch (err) {
      req.flash("alertMessage", `${err.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/payment");
    }
  },
};
