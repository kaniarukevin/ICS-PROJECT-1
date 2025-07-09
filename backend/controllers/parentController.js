const User = require('../models/user');
const Tour = require('../models/Tour');
const Booking = require('../models/Booking');
const School = require('../models/School');

//Get parent profile
const getParentProfile = async (req, res) => {
  try {
    const parent = await User.findById(req.user._id).select('-password');
    if (!parent) return res.status(404).json({ message: 'Parent not found' });
    res.json(parent);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

//Get all available tours
const getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find()
      .populate('schoolId', 'name location.city location.state')
      .sort({ date: 1 });
    res.json(tours);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

//Get all tours for a specific school
const getToursForSchool = async (req, res) => {
  try {
    const { schoolId } = req.query;
    if (!schoolId) return res.status(400).json({ message: 'Missing schoolId in query' });

    const tours = await Tour.find({ schoolId, isActive: true }).sort({ date: 1 });
    res.status(200).json(tours);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tours', error: error.message });
  }
};

//Get parent’s bookings
// Get parent’s bookings with completed status update
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ parentId: req.user._id })
      .populate('tourId', 'title date tourType requirements duration maxGroupSize')
      .populate('schoolId', 'name location.city location.state')
      .sort({ createdAt: -1 });

    const now = new Date();
    const updates = [];

    // Check and update completed bookings
    for (let booking of bookings) {
      const tourDate = new Date(booking.tourId?.date);
      if (
        (booking.status === 'confirmed' || booking.status === 'active') &&
        tourDate < now
      ) {
        booking.status = 'completed';
        updates.push(booking.save());
      }
    }

    // Wait for all updates to finish
    await Promise.all(updates);

    res.json(bookings);
  } catch (error) {
    console.error('Get My Bookings Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


//Book a tour
const bookTour = async (req, res) => {
  try {
    const { tourId, schoolId, numberOfGuests = 1, selectedTimeSlot } = req.body;
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Unauthorized: No user found' });
    }
    if (!tourId || !schoolId || !selectedTimeSlot) {
      return res.status(400).json({ message: 'Missing required fields: tourId, schoolId, selectedTimeSlot' });
    }

    const tour = await Tour.findById(tourId);
    if (!tour) return res.status(404).json({ message: 'Tour not found' });

    const availableSpots = tour.maxCapacity - (tour.currentBookings || 0);
    if (numberOfGuests > availableSpots) {
      return res.status(400).json({ message: 'Not enough available spots' });
    }

    const existingBooking = await Booking.findOne({ parentId: req.user._id, tourId });
    if (existingBooking) {
      return res.status(400).json({ message: 'You have already booked this tour' });
    }

    const booking = new Booking({
      tourId,
      schoolId,
      parentId: req.user._id,
      numberOfGuests,
      selectedTimeSlot,
      status: 'pending'
    });

    await booking.save();

    tour.currentBookings = (tour.currentBookings || 0) + numberOfGuests;
    await tour.save();

    res.status(201).json({ message: 'Booking request sent and awaiting approval', booking });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ message: 'Booking failed', error: error.message });
  }
};

//Cancel booking
const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOne({
      _id: bookingId,
      parentId: req.user._id
    }).populate('tourId');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const tourDate = new Date(booking.tourId.date);
    const now = new Date();

    const diffInDays = (tourDate - now) / (1000 * 60 * 60 * 24);
    if (diffInDays < 2) {
      return res.status(400).json({ message: 'Cancellations must be done at least 2 days before the tour' });
    }

    booking.status = 'cancelled';
    booking.cancelledAt = now;
    await booking.save();

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Cancel failed', error: error.message });
  }
};
const deleteBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Find the booking and ensure it belongs to the authenticated parent
    const booking = await Booking.findOne({
      _id: bookingId,
      parentId: req.user._id
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if the booking is cancelled
    if (booking.status !== 'cancelled') {
      return res.status(400).json({ 
        message: 'Only cancelled bookings can be deleted. Please cancel the booking first.' 
      });
    }

    // Delete the booking
    await Booking.findByIdAndDelete(bookingId);

    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ message: 'Failed to delete booking', error: error.message });
  }
};

//Get all verified schools (with filters)
const getAllSchools = async (req, res) => {
  try {
    const {
      name,
      schoolType,
      location,
      minFee,
      maxFee,
      overallRating,
      academicRating,
      facilitiesRating,
      teachersRating,
      environmentRating,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
    } = req.query;

    const filter = { isVerified: true };

    if (name) filter.name = { $regex: name, $options: 'i' };
    if (schoolType) filter.schoolType = schoolType;
    if (location) {
      filter.$or = [
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.state': { $regex: location, $options: 'i' } }
      ];
    }

    // // Fee filtering (strict bounding logic)
if (minFee && maxFee) {
  filter['fees.tuition.minAmount'] = { $gte: parseFloat(minFee) };
  filter['fees.tuition.maxAmount'] = { $lte: parseFloat(maxFee) };
} else if (minFee) {
  filter['fees.tuition.minAmount'] = { $gte: parseFloat(minFee) };
} else if (maxFee) {
  filter['fees.tuition.maxAmount'] = { $lte: parseFloat(maxFee) };
}



    if (overallRating) filter['ratings.overall'] = { $gte: parseFloat(overallRating) };
    if (academicRating) filter['ratings.academic'] = { $gte: parseFloat(academicRating) };
    if (facilitiesRating) filter['ratings.facilities'] = { $gte: parseFloat(facilitiesRating) };
    if (teachersRating) filter['ratings.teachers'] = { $gte: parseFloat(teachersRating) };
    if (environmentRating) filter['ratings.environment'] = { $gte: parseFloat(environmentRating) };

    const limit = 9;
    const skip = (parseInt(page) - 1) * limit;
    const sortField = sortBy === 'a-z' ? 'name' : sortBy;
    const sortDirection = sortBy === 'a-z' ? 1 : sortOrder === 'asc' ? 1 : -1;

    const schools = await School.find(filter)
      .select('name schoolType location description contact ratings fees')
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(limit);

    const totalCount = await School.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({ schools, totalPages });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch schools', error: err.message });
  }
};

//Get all distinct city/state for location autocomplete
const getAllLocations = async (req, res) => {
  try {
    const schools = await School.find({}, 'location.city location.state');
    const locationsSet = new Set();

    schools.forEach(school => {
      if (school.location?.city) locationsSet.add(school.location.city.toLowerCase());
      if (school.location?.state) locationsSet.add(school.location.state.toLowerCase());
    });

    res.json([...locationsSet]);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch locations', error: err.message });
  }
};

//Get school by ID
const getSchoolById = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const school = await School.findById(schoolId).select('-adminId -__v');
    if (!school) return res.status(404).json({ message: 'School not found' });

    res.json(school);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch school details', error: error.message });
  }
};

//Parent rates a school
const rateSchool = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { overall, academic, facilities, teachers, environment, comment } = req.body;

    const school = await School.findById(schoolId);
    if (!school) return res.status(404).json({ message: 'School not found' });

    const existingRating = school.ratingsList.find(r => r.parentId.toString() === req.user._id.toString());
    if (existingRating) return res.status(400).json({ message: 'You’ve already rated this school.' });

    school.ratingsList.push({
      parentId: req.user._id,
      overall,
      academic,
      facilities,
      teachers,
      environment,
      comment
    });

    const total = school.ratingsList.length;
    const avg = field =>
      school.ratingsList.reduce((sum, rating) => sum + (rating[field] || 0), 0) / total;

    school.ratings = {
      overall: avg('overall'),
      academic: avg('academic'),
      facilities: avg('facilities'),
      teachers: avg('teachers'),
      environment: avg('environment')
    };
    school.averageRating = avg('overall');
    school.totalRatings = total;

    await school.save();
    res.json({ message: 'Rating submitted successfully', school });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit rating', error: error.message });
  }
};

//Compare schools
const compareSchools = async (req, res) => {
  try {
    const { school1, school2 } = req.query;
    if (!school1 || !school2) {
      return res.status(400).json({ message: 'Please provide two school IDs to compare' });
    }

    const schools = await School.find({ _id: { $in: [school1, school2] } })
      .select('name location ratings fees schoolType');

    if (schools.length !== 2) {
      return res.status(404).json({ message: 'One or both schools not found' });
    }

    res.json({ schools });
  } catch (error) {
    res.status(500).json({ message: 'Failed to compare schools', error: error.message });
  }
};

module.exports = {
  getParentProfile,
  getAllTours,
  getToursForSchool,
  getMyBookings,
  bookTour,
  deleteBooking,
  cancelBooking,
  getAllSchools,
  getAllLocations, // 
  getSchoolById,
  rateSchool,
  compareSchools
};
