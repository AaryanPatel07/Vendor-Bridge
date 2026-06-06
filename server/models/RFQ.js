const mongoose = require('mongoose');

const RFQSchema = new mongoose.Schema({
  title: { type: String, required: true },
  deadline: { type: Date },
  status: { type: String, enum: ['open', 'closed', 'cancelled'], default: 'open' },
  createdAt: { type: Date, default: Date.now },
  metadata: { type: Object, default: {} },
});

module.exports = mongoose.model('RFQ', RFQSchema);
