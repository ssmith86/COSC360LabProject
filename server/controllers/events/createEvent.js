const Event = require("../../models/Event");
const SavedEvent = require("../../models/SavedEvent");

module.exports = async (req, res) => {
  const eventData = req.body;
  if (!eventData || !eventData.event_name)
    return res.status(400).json({ message: "Invalid event data received." });

  try {
    const imagePath = req.file ? `/uploads/${req.file.filename}` : "";
    const status = eventData.status || "published";
    const newEvent = await Event.create({
      title: eventData.event_name,
      description: eventData.description,
      category: eventData.category,
      status,
      ownerId: eventData.userId,
      imageUrl: imagePath,
      startDate: eventData.start_date,
      endDate: eventData.end_date,
      location: {
        address: eventData.address,
        street: eventData.street,
        city: eventData.city,
        province: eventData.province,
        country: eventData.country,
      },
      publishedAt: status === "published" ? new Date() : null,
    });
    await SavedEvent.create({
      userId: eventData.userId,
      eventId: newEvent._id,
    });
    res.status(200).json({ message: "Event creation successful." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
