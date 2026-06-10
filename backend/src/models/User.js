const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema({

  name: {
      type: String,
      required: true
  },

  email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
  },

  password: {
      type: String,
      required: true
  },

  role: {
      type: String,
      enum: [
          'super_admin',
          'admin',
          'executive'
      ],
      default: 'executive'
  },

  isActive: {
      type: Boolean,
      default: true
  },

  phone: {
      type: String,
      trim: true
  },

  avatar: {
      type: String,
      default: null
  },

  createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
  },

  managedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
  },

  lastLogin: {
      type: Date
  },

  availabilityStatus: {
      type: String,
      enum: [
          'available',
          'busy',
          'offline'
      ],
      default: 'available'
  }

}, {
    timestamps: true
});


// Hash password before save
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
UserSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', UserSchema);