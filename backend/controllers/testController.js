const mongoose = require('mongoose');

// Simple test to check database connection
const testDatabase = async (req, res) => {
	try {
		const db = mongoose.connection.db;
		console.log('🔍 Database name:', db.databaseName);
		
		// Check collections
		const collections = await db.listCollections().toArray();
		console.log('📋 Collections:', collections.map(c => c.name));
		
		// Check schools collection specifically
		const schoolsCount = await db.collection('schools').countDocuments();
		console.log('🏫 Schools count:', schoolsCount);
		
		// Get a sample school
		const sampleSchool = await db.collection('schools').findOne();
		console.log('📄 Sample school:', sampleSchool ? sampleSchool.name : 'None found');
		
		res.json({
			database: db.databaseName,
			collections: collections.map(c => c.name),
			schoolsCount,
			sampleSchoolName: sampleSchool ? sampleSchool.name : 'None found',
			connected: mongoose.connection.readyState === 1
		});
	} catch (error) {
		console.error('❌ Test error:', error);
		res.status(500).json({ error: error.message });
	}
};

module.exports = { testDatabase };