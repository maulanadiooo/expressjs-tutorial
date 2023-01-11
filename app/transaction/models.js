const mongoose = require("mongoose");

let transactionSchema = mongoose.Schema(
  {
    historyVoucherTopup: {
      gameName: {
        type: String,
        require: [true, "Nama game harus diisi"],
      },
      category: {
        type: String,
        require: [true, "Kategori game harus diisi"],
      },
      thumbnail: {
        type: String,
      },
      coinName: {
        type: String,
        require: [true, "Nama koin wajib diisi"],
      },
      coinQuantity: {
        type: String,
        require: [true, "Jummlah koin wajib diisi"],
      },
      price: {
        type: Number,
        require: [true, "Harga tidak boleh kosong"],
      },
    },
    historyPayment: {
      name: {
        type: String,
        require: [true, "Nama game harus diisi"],
      },
      type: {
        type: String,
        require: [true, "Tipe pembayaran harus diisi"],
      },
      bankName: {
        type: String,
        require: [true, "Nama bank harus diisi"],
      },
      noRekening: {
        type: String,
        require: [true, "Nomor Rekening harus diisi"],
      },
    },
    name: {
      type: String,
      require: [true, "Nama harus diisi"],
      maxlength: [255, "Panjang nama hanya 3 sampai 255 karakter"],
      minlength: [3, "Panjang nama hanya 3 sampai 255 karakter"],
    },
    accountUser: {
      type: String,
      require: [true, "Nama akun harus diisi"],
      maxlength: [255, "Panjang nama hanya 3 sampai 255 karakter"],
      minlength: [3, "Panjang nama hanya 3 sampai 255 karakter"],
    },
    tax: {
      type: Number,
      default: 0,
    },
    value: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
    },
    historyUser: {
      name: {
        type: String,
        require: [true, "Nama player harus diisi"],
      },
      phoneNumber: {
        type: Number,
        require: [true, "No Hp harus diisi"],
        maxlength: [13, "Panjang nama hanya 9 sampai 13 karakter"],
        minlength: [9, "Panjang nama hanya 9 sampai 13 karakter"],
      },
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
