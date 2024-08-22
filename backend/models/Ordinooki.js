const mongoose = require('mongoose');

const OrdinookiSchema = new mongoose.Schema({
  inscriptionId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  stats: {
    HP: Number,
    Attack: Number,
    Defense: Number,
    Speed: Number,
    // Add any other stats as necessary
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

const Ordinooki = mongoose.model('Ordinooki', OrdinookiSchema);

module.exports = Ordinooki;
