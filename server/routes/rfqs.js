const express = require('express');
const router = express.Router();
const RFQ = require('../models/RFQ');

// GET /api/rfqs
router.get('/', async (req, res) => {
  try {
    const items = await RFQ.find().sort({ createdAt: -1 }).limit(100);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch RFQs' });
  }
});

// POST /api/rfqs
router.post('/', async (req, res) => {
  try {
    const doc = new RFQ(req.body);
    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ error: 'Invalid RFQ data' });
  }
});

module.exports = router;
