const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
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
 
};

module.exports = connectDB;
