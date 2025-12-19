const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  activeDomain: { type: String, default: "https://dvstream.vercel.app" },
  telegramChatId: { type: String, default: "-1003399034609" }, // Your Channel ID
  telegramBotToken: {
    type: String,
    default: "7553378095:AAHbPklxAn9GGC2PcLjgUdVcANVOlw6_U7I",
  }, // Your Bot Token
});

module.exports = mongoose.model("Settings", settingsSchema);
