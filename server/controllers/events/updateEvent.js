const Event = require("../../models/Event");

module.exports = async (req, res) => {
  const body = req.body;
  if (!body || Object.keys(body).length === 0)
    return res.status(400).json({ message: "No update data provided by user" });

  const updatedData = {
    title: body.title,
    startDate: body.startDate,
    endDate: body.endDate,
    "location.address": body["location.address"],
    "location.street": body["location.street"],
    "location.city": body["location.city"],
    "location.province": body["location.province"],
    "location.country": body["location.country"],
    category: body.category,
    description: body.description,
    updatedAt: new Date(),
  };
  if (req.file) updatedData.imageUrl = `/uploads/${req.file.filename}`;

  try {
    const event = await Event.findByIdAndUpdate(
      req.params.eventId,
      { $set: updatedData },
      { new: true },
    );
    if (!event) return res.status(404).json({ message: "Event not found." });
    res.status(200).json({ message: "Event updated successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
