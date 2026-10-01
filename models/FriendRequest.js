const mongoose = require("mongoose");

const friendRequestSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      maxlength: 300

    },
  },
  {
    timestamps: true,
  }
);

// Tránh gửi nhiều lời mời kết bạn trùng lặp giữa cùng 2 người khi đang pending
friendRequestSchema.index({ from: 1, to: 1 }, { unique: true });

friendRequestSchema.index({from: 1});

friendRequestSchema.index({to:1});


module.exports = mongoose.model("FriendRequest", friendRequestSchema);