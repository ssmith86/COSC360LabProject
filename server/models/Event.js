const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  owner: {
    name: { type: String, default: "Unknown" },
    id: { type: String, default: "" },
  },
  event: {
    name: { type: String, required: true },
    start_date: { type: String, required: true },
    end_date: { type: String, required: true },
    image: { type: String, default: "" },
    location: {
      address: { type: mongoose.Schema.Types.Mixed, default: "" },
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      province: { type: String, default: "" },
      country: { type: String, default: "" },
    },
    category: { type: String, default: "" },
  },
  description: { type: String, default: "" },
});

module.exports = mongoose.model("Event", eventSchema);
