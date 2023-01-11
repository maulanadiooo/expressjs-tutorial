const Transaction = require("../transaction/models");
const Voucher = require("../voucher/models");
const Player = require("../player/models");
const Category = require("../category/models");

module.exports = {
  index: async (req, res) => {
    try {
      const transaction = await Transaction.countDocuments();
      const voucher = await Voucher.countDocuments();
      const player = await Player.countDocuments();
      const category = await Category.countDocuments();
      res.render("admin/dashboard/view_dashboard", {
        name: req.session.user.name,
        title: "Dashboard",
        count: {
          transaction,
          voucher,
          player,
          category,
        },
      });
    } catch (err) {
      console.log(err);
    }
  },
};
