const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const messageSchema = new Schema({
  recipients: [String],
  senderUsername: String,
  body: String,
  timestamp: { type: Date, default: Date.now() },
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
