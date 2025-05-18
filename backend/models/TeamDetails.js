const mongoose = require('mongoose');

const teamDetailsSchema = new mongoose.Schema({
  team_name: {
    type: String,
    required: true
  },
  team_member1: {
    type: String,
    required: true
  },
  team_member2: {
    type: String
  },
  team_member3: {
    type: String
  },
  points: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('team_details', teamDetailsSchema);
