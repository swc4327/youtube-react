const { Schema } = require("mongoose");
const mongoose = require("mongoose");

const subscriberSchema = mongoose.Schema(
  {
    userTo: { //subscribeNumber, 상대방
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    userFrom: { //나
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
); 

const Subscriber = mongoose.model("Subscriber", subscriberSchema);

module.exports = { Subscriber };
