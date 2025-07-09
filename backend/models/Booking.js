const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tourId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'tours',
    required: true
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'schools',
    required: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  numberOfGuests: {
    type: Number,
    default: 1,
    min: 1
  },
  selectedTimeSlot: {
    type: {
      startTime: { type: String, required: true },
      endTime: { type: String, required: true }
    },
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  adminNotes: String,
  confirmedAt: Date,
  cancelledAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.Booking || mongoose.model('bookings', bookingSchema);
