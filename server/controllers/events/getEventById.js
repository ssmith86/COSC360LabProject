const Event = require("../../models/Event");

module.exports = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId).populate(
      "ownerId",
      "userName",
    );
    if (!event)
      return res.status(404).json({ message: "Event not found in database." });
    const eventObject = event.toObject();
    const ownerDoc = eventObject.ownerId;
    const owner = ownerDoc
      ? { id: ownerDoc._id.toString(), userName: ownerDoc.userName || "" }
      : null;
    res.status(200).json({ ...eventObject, owner });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
