const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema({
  employer: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  skillsRequired: [String],
  location: { type: String, default: 'Remote' },
  duration: { type: String },
  pay: {
    type: { type: String, enum: ['range', 'fixed', 'hourly'] },
    amount: String // e.g., "$800-1200", "$500", "$15/hour"
  },
  status: { type: String, enum: ['open', 'in-progress', 'closed'], default: 'open' },
  applications: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    message: { type: String },
    appliedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'shortlisted', 'hired', 'declined'], default: 'pending' },
  }],

  company: { type: String, default: null },

  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  featured: { type: Boolean, default: false },
  urgent: { type: Boolean, default: false },
  collegeSpecific: { type: Boolean, default: false },
  colleges: [String], // e.g., ['Stanford University', 'MIT']
  gigReelUrl: { type: String, default: '' }, // Cloudinary video URL
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'comment' }],
  verified: { type: Boolean, default: false },
  rejected: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('gig', gigSchema);
