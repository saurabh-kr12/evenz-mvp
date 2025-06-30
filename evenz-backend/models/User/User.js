// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    sparse: true, // Allows null but enforces uniqueness when present
    validate: {
      validator: function(v) {
        return v === null || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  contact: {
    type: String,
    trim: true,
    sparse: true, // Allows null but enforces uniqueness when present
    validate: {
      validator: function(v) {
        return v === null || /^\+?[1-9]\d{9,14}$/.test(v);
      },
      message: 'Please enter a valid phone number'
    }
  },
  password: {
    type: String,
    required: true
  },
  otpData: {
    otp: String,
    purpose: String, // 'registration', 'email-update', 'contact-update', etc.
    expiresAt: Date,
    identifier: String // Email or contact where OTP was sent
  }
}, { timestamps: true });

// Ensure user has at least email or contact
userSchema.pre('save', function(next) {
  if (!this.email && !this.contact) {
    return next(new Error('User must have either email or contact'));
  }
  next();
});

// Pre-save middleware to hash the password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

// models/User.js
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const userSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   phone: {
//     type: String,
//     required: true,
//     unique: true,
//     validate: {
//       validator: function(v) {
//         return /^\+?[1-9]\d{9,14}$/.test(v);
//       },
//       message: 'Please enter a valid phone number'
//     }
//   },
//   password: {
//     type: String,
//     required: true,
//     minlength: 6
//   },
//   isPhoneVerified: {
//     type: Boolean,
//     default: false
//   },
//   role: {
//     type: String,
//     enum: ['user', 'vendor', 'admin'],
//     default: 'user'
//   },
//   profile: {
//     avatar: String,
//     dateOfBirth: Date,
//     gender: {
//       type: String,
//       enum: ['male', 'female', 'other']
//     },
//     location: {
//       city: String,
//       state: String,
//       country: String
//     }
//   }
// }, {
//   timestamps: true
// });

// // Hash password before saving
// userSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
  
//   try {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// // Compare password method
// userSchema.methods.comparePassword = async function(candidatePassword) {
//   return bcrypt.compare(candidatePassword, this.password);
// };

// // Remove password from JSON output
// userSchema.methods.toJSON = function() {
//   const user = this.toObject();
//   delete user.password;
//   return user;
// };

// module.exports = mongoose.model('User', userSchema);