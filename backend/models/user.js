// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true, select: false },
//   role: {
//     type: String,
//     enum: ['parent', 'school_admin', 'system_admin'],
//     required: true
//   },
//   isActive: { type: Boolean, default: true },
//   createdAt: { type: Date, default: Date.now }
// });

// userSchema.pre('save', async function () {
//   if (!this.isModified('password')) return;
//   this.password = await bcrypt.hash(this.password, 10);
// });

// userSchema.methods.matchPassword = function (enteredPassword) {
//   return bcrypt.compare(enteredPassword, this.password);
// };

// module.exports = mongoose.model('User', userSchema);


const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	name: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	role: { 
		type: String, 
		enum: ['parent', 'school_admin', 'system_admin'], 
		required: true 
	},
	schoolId: { 
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'School', 
		required: function() { return this.role === 'school_admin'; }
	},
	isActive: { type: Boolean, default: true },
	createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('users', userSchema);