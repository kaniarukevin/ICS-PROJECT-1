const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Log environment variables
console.log('🔍 Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI from env:', process.env.MONGODB_URI);

// Connect to MongoDB with explicit database name
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://cglynnskip:D1hLPAludvPW2SFW@amsdb.1zdlc.mongodb.net/SchoolTouringDatabase';
console.log('🔗 Attempting to connect to:', mongoURI);

mongoose.connect(mongoURI)
	.then(() => {
		console.log('✅ Connected to MongoDB');
		console.log('📊 Database name:', mongoose.connection.db.databaseName);
		console.log('📊 Connection state:', mongoose.connection.readyState);
		
		// List collections immediately after connection
		setTimeout(async () => {
			try {
				const collections = await mongoose.connection.db.listCollections().toArray();
				console.log('📁 Available collections:', collections.map(c => c.name));
				
				// Check schools collection specifically
				const schoolsCount = await mongoose.connection.db.collection('schools').countDocuments();
				console.log('🏫 Schools in database:', schoolsCount);
				
				if (schoolsCount > 0) {
					const sampleSchool = await mongoose.connection.db.collection('schools').findOne();
					console.log('📋 Sample school structure:', Object.keys(sampleSchool));
				}
			} catch (error) {
				console.error('❌ Error checking collections:', error);
			}
		}, 1000);
	})
	.catch(err => {
		console.error('❌ MongoDB connection error:', err);
	});

// Import routes
const authRoutes = require('./routes/authRoutes');
const schoolAdminRoutes = require('./routes/schoolAdmin');
const systemAdminRoutes = require('./routes/systemAdmin');

// Use routes with logging
console.log('🛣️ Setting up routes...');

app.use('/api/auth', authRoutes);
console.log('✅ Auth routes mounted at /api/auth');

app.use('/api/school-admin', schoolAdminRoutes);
console.log('✅ School admin routes mounted at /api/school-admin');

app.use('/api/system-admin', systemAdminRoutes);
console.log('✅ System admin routes mounted at /api/system-admin');

// Enhanced debug route
app.get('/debug/collections', async (req, res) => {
	try {
		const db = mongoose.connection.db;
		console.log('🔍 Debug endpoint called');
		console.log('📊 Database name:', db.databaseName);
		
		const collections = await db.listCollections().toArray();
		console.log('📁 Collections found:', collections.map(c => c.name));
		
		// Check each collection document count
		const collectionStats = {};
		for (const collection of collections) {
			const count = await db.collection(collection.name).countDocuments();
			collectionStats[collection.name] = count;
			console.log(`📊 Collection ${collection.name}: ${count} documents`);
		}
		
		// Try to find schools in different possible collection names
		const possibleSchoolCollections = ['schools', 'Schools', 'school'];
		const schoolData = {};
		
		for (const collName of possibleSchoolCollections) {
			try {
				const count = await db.collection(collName).countDocuments();
				if (count > 0) {
					const sample = await db.collection(collName).findOne();
					schoolData[collName] = { count, sampleKeys: Object.keys(sample) };
					console.log(`🏫 Found ${count} schools in collection "${collName}"`);
				}
			} catch (err) {
				console.log(`❌ Collection "${collName}" not found`);
			}
		}
		
		// Test mongoose model directly
		let mongooseModelTest = null;
		try {
			const School = require('./models/School');
			const mongooseCount = await School.countDocuments();
			console.log(`🏫 Mongoose School model count: ${mongooseCount}`);
			mongooseModelTest = { count: mongooseCount };
		} catch (err) {
			console.error('❌ Mongoose model test failed:', err.message);
			mongooseModelTest = { error: err.message };
		}
		
		const response = {
			database: db.databaseName,
			mongooseConnectionState: mongoose.connection.readyState,
			collections: collectionStats,
			schoolData,
			mongooseModels: Object.keys(mongoose.models),
			mongooseModelTest,
			connectionString: mongoURI
		};
		
		console.log('📤 Sending debug response');
		res.json(response);
	} catch (error) {
		console.error('❌ Debug error:', error);
		res.status(500).json({ 
			error: error.message,
			stack: error.stack 
		});
	}
});

// Test School model directly
app.get('/debug/schools', async (req, res) => {
	try {
		console.log('🏫 Testing School model directly...');
		const School = require('./models/School');
		
		// Try different queries
		const allSchools = await School.find({});
		console.log(`📊 School.find({}): ${allSchools.length} schools`);
		
		const countSchools = await School.countDocuments();
		console.log(`📊 School.countDocuments(): ${countSchools} schools`);
		
		// Try raw collection access
		const rawCount = await mongoose.connection.db.collection('schools').countDocuments();
		console.log(`📊 Raw collection count: ${rawCount} schools`);
		
		res.json({
			mongooseFind: allSchools.length,
			mongooseCount: countSchools,
			rawCollectionCount: rawCount,
			sampleSchool: allSchools[0] || null
		});
	} catch (error) {
		console.error('❌ School model test error:', error);
		res.status(500).json({ error: error.message });
	}
});

// Test system admin routes
app.get('/debug/system-admin', (req, res) => {
	res.json({
		message: 'System admin routes are available',
		routes: [
			'/api/system-admin/dashboard',
			'/api/system-admin/schools',
			'/api/system-admin/users',
			'/api/system-admin/reports',
			'/api/system-admin/health'
		],
		note: 'These routes require authentication and system_admin role'
	});
});

// Basic route
app.get('/', (req, res) => {
	res.json({ 
		message: 'School Tour Booking API is running!',
		version: '1.0.0',
		database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
		databaseName: mongoose.connection.db?.databaseName,
		endpoints: {
			auth: '/api/auth',
			schoolAdmin: '/api/school-admin',
			systemAdmin: '/api/system-admin',
			debug: '/debug/collections',
			testSchools: '/debug/schools',
			testSystemAdmin: '/debug/system-admin'
		}
	});
});

// Health check route
app.get('/health', (req, res) => {
	res.json({ 
		status: 'OK', 
		timestamp: new Date().toISOString(),
		database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
		databaseName: mongoose.connection.db?.databaseName
	});
});

// 404 handler
app.use('*', (req, res) => {
	console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
	res.status(404).json({ 
		message: 'Route not found',
		path: req.originalUrl,
		method: req.method
	});
});

// Error handling middleware
app.use((err, req, res, next) => {
	console.error('❌ Global error handler:', err.stack);
	res.status(500).json({ 
		message: 'Something went wrong!',
		error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
	});
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`🚀 Server running on port ${PORT}`);
	console.log(`📍 API URL: http://localhost:${PORT}`);
	console.log(`💊 Health Check: http://localhost:${PORT}/health`);
	console.log(`🔍 Debug Collections: http://localhost:${PORT}/debug/collections`);
	console.log(`🏫 Test Schools: http://localhost:${PORT}/debug/schools`);
	console.log(`🔐 Test System Admin: http://localhost:${PORT}/debug/system-admin`);
	console.log('');
	console.log('📋 Available API endpoints:');
	console.log('  🔐 /api/auth/login');
	console.log('  🔐 /api/auth/register');
	console.log('  📊 /api/system-admin/dashboard');
	console.log('  🏫 /api/system-admin/schools');
	console.log('  👥 /api/system-admin/users');
	console.log('  📈 /api/system-admin/reports');
	console.log('');
});