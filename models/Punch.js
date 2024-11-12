// models/Punch.js
const mongoose = require('mongoose');

const punchSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  },
  punchInTime: {
    type: Date,
    required: true
  },
  punchOutTime: {
    type: Date
  },
  date: {
    type: String, // Storing the date in 'YYYY-MM-DD' format for ease of filtering
    required: true
  }
});

module.exports = mongoose.model('Punch', punchSchema);
