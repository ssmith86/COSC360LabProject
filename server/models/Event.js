const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  category: { type: String, default: "" },
  status: { type: String, enum: ["draft", "published", "paused", "cancelled", "archived"], default: "published" },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  imageUrl: { type: String, default: "" },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  location: {
    address: { type: String, default: "" },
    street: { type: String, default: "" },
    city: { type: String, default: "" },
    province: { type: String, default: "" },
    country: { type: String, default: "" },
  },
  createdAt: { type: Date, default: Date.now },
  publishedAt: { type: Date, default: null },
  updatedAt: { type: Date, default: null },
});

// auto set publishedAt when status is "published"
eventSchema.pre("save", function () {
  if (this.status === "published" && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

module.exports = mongoose.model("Event", eventSchema);
