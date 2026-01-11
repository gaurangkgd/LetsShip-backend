const {
  getAllCouriers,
  getCourierById,
  updateCourierLocation,
} = require('../services/courierService');

function getAllCouriersHandler(req, res) {
  try {
    const couriers = getAllCouriers();
    return res.status(200).json({ couriers });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function getCourierHandler(req, res) {
  try {
    const courierId = req.params.id;
    const courier = getCourierById(courierId);

    if (!courier) return res.status(404).json({ error: 'Courier not found' });
    return res.status(200).json({ courier });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function updateCourierLocationHandler(req, res) {
  try {
    const courierId = req.params.id;
    const { location } = req.body;

    if (!location || typeof location.x !== 'number' || typeof location.y !== 'number') {
      return res.status(400).json({ error: 'Location must include numeric x and y' });
    }

    try {
      const updated = updateCourierLocation(courierId, location);
      return res.status(200).json({ courier: updated });
    } catch (e) {
      if (e.message === 'Courier not found') return res.status(404).json({ error: e.message });
      return res.status(500).json({ error: 'Internal server error' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getAllCouriersHandler,
  getCourierHandler,
  updateCourierLocationHandler,
};

