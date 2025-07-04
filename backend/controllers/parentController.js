const User = require('../models/user');
const Tour = require('../models/Tour');
const Booking = require('../models/Booking');
const School = require('../models/School');

// 🔐 Get parent profile
const getParentProfile = async (req, res) => {
    try {
        const parent = await User.findById(req.user._id).select('-password');
        if (!parent) return res.status(404).json({ message: 'Parent not found' });
        res.json(parent);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// 📆 Get all available tours
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

// ✅ Get all tours for a specific school
const getToursForSchool = async (req, res) => {
  try {
    const { schoolId } = req.query;

    if (!schoolId) {
      return res.status(400).json({ message: 'Missing schoolId in query' });
    }

    const tours = await Tour.find({ schoolId, isActive: true }).sort({ date: 1 });

    // Always return an array even if empty
    return res.status(200).json(tours);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tours', error: error.message });
  }
};




// 🧾 Get parent’s bookings
const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ parentId: req.user._id })
            .populate('tourId', 'title date')
            .populate('schoolId', 'name location.city')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ✅ Book a tour (prevent overbooking)
const bookTour = async (req, res) => {
  try {
    const { tourId, schoolId } = req.body;

    const tour = await Tour.findById(tourId);
    if (!tour) return res.status(404).json({ message: 'Tour not found' });

    if (tour.currentBookings >= tour.maxCapacity) {
      return res.status(400).json({ message: 'Tour is fully booked' });
    }

    const existingBooking = await Booking.findOne({
      parentId: req.user._id,
      tourId,
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'You have already booked this tour' });
    }

    const booking = new Booking({
      tourId,
      schoolId,
      parentId: req.user._id
    });
    await booking.save();

    // Increment current bookings
    tour.currentBookings += 1;
    await tour.save();

    res.status(201).json({ message: 'Tour booked successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Booking failed', error: error.message });
  }
};

// ❌ Cancel a booking
const cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const booking = await Booking.findOneAndDelete({
            _id: bookingId,
            parentId: req.user._id
        });

        if (!booking) return res.status(404).json({ message: 'Booking not found or already cancelled' });

        res.json({ message: 'Booking cancelled', booking });
    } catch (error) {
        res.status(500).json({ message: 'Cancel failed', error: error.message });
    }
};

// 🌍 Public: Get all verified schools (with filters)
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

    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }

    if (schoolType) {
      filter.schoolType = schoolType;
    }

    if (location) {
      filter['location.city'] = { $regex: location, $options: 'i' };
    }

    if (minFee || maxFee) {
      filter['fees.tuition.minAmount'] = {};
      if (minFee) filter['fees.tuition.minAmount'].$gte = parseFloat(minFee);
      if (maxFee) filter['fees.tuition.minAmount'].$lte = parseFloat(maxFee);
    }

    if (overallRating) {
      filter['ratings.overall'] = { $gte: parseFloat(overallRating) };
    }
    if (academicRating) {
      filter['ratings.academic'] = { $gte: parseFloat(academicRating) };
    }
    if (facilitiesRating) {
      filter['ratings.facilities'] = { $gte: parseFloat(facilitiesRating) };
    }
    if (teachersRating) {
      filter['ratings.teachers'] = { $gte: parseFloat(teachersRating) };
    }
    if (environmentRating) {
      filter['ratings.environment'] = { $gte: parseFloat(environmentRating) };
    }

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


// 🌍 Public: Get school by ID
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

// 🌟 Parent rates a school
const rateSchool = async (req, res) => {
    try {
        const { schoolId } = req.params;
        const { overall, academic, facilities, teachers, environment, comment } = req.body;

        const school = await School.findById(schoolId);
        if (!school) return res.status(404).json({ message: 'School not found' });

        const existingRating = school.ratingsList.find(
            r => r.parentId.toString() === req.user._id.toString()
        );
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

// ✅ Compare schools by ID (2 at a time)
const compareSchools = async (req, res) => {
  try {
    const { school1, school2 } = req.query;
    if (!school1 || !school2) {
      return res.status(400).json({ message: 'Please provide two school IDs to compare' });
    }

    const schools = await School.find({
      _id: { $in: [school1, school2] }
    }).select('name location ratings fees schoolType');

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
    cancelBooking,
    getAllSchools,
    getSchoolById,
    rateSchool,
    compareSchools
};
