const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const HAS_ROUND = 12;

let playerSchema = mongoose.Schema(
  {
    email: {
      type: String,
      require: [true, "Email harus diisi"],
    },
    password: {
      type: String,
      require: [true, "Password harus diisi"],
    },
    name: {
      type: String,
      require: [true, "Nama harus diisi"],
      minlength: [5, "Username allow 5 - 20 karakter"],
      maxlength: [30, "Name allow 5 - 20 karakter"],
    },
    username: {
      type: String,
      require: [true, "Nama harus diisi"],
      minlength: [5, "Username allow 5 - 20 karakter"],
      maxlength: [20, "Username allow 5 - 20 karakter"],
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    status: {
      type: Boolean,
      default: true,
    },
    phoneNumber: {
      type: String,
      require: [true, "Nomor telpon harus diisi"],
    },
    avatar: {
      type: String,
    },
  },
  { timestamps: true }
);

playerSchema.path("email").validate(
  async function (value) {
    try {
      const count = await this.model("Player").countDocuments({ email: value });
      return !count;
    } catch (err) {
      throw err;
    }
  },
  (attr) => `${attr.value} sudah terdaftar`
);

playerSchema.path("username").validate(
  async function (value) {
    try {
      const count = await this.model("Player").countDocuments({
        username: value,
      });
      return !count;
    } catch (err) {
      throw err;
    }
  },
  (attr) => `${attr.value} sudah terdaftar`
);

playerSchema.pre("save", function (next) {
  this.password = bcrypt.hashSync(this.password, HAS_ROUND);
  next();
});

module.exports = mongoose.model("Player", playerSchema);
