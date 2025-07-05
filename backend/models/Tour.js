const mongoose = require('mongoose');

function arrayLimit(val) {
  return val.length <= 3;
}

const tourSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'schools', required: true },
  date: { type: Date, required: true },
  timeSlots: {
    type: [
      {
        startTime: { type: String, required: true },
        endTime: { type: String, required: true }
      }
    ],
    validate: [arrayLimit, '{PATH} exceeds the limit of 3'],
    required: true
  },
  maxCapacity: { type: Number, required: true, min: 1 },
  currentBookings: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  tourType: {
    type: String,
    enum: ['Virtual', 'Physical', 'Hybrid'],
    default: 'Physical'
  },
  meetingPoint: { type: String, default: 'Main Reception' },
  duration: { type: Number, default: 90 },
  highlights: [String],
  requirements: [String],
  notes: String
}, {
  timestamps: true
});

tourSchema.index({ schoolId: 1, date: 1 });
tourSchema.index({ isActive: 1 });

tourSchema.virtual('availableSpots').get(function () {
  return this.maxCapacity - this.currentBookings;
});

tourSchema.methods.isFull = function () {
  return this.currentBookings >= this.maxCapacity;
};

tourSchema.methods.isUpcoming = function () {
  return new Date(this.date) > new Date();
};

module.exports = mongoose.models.Tour || mongoose.model('tours', tourSchema);
