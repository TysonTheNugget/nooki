const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the Ordinooki schema (embedded within the User schema)
const OrdinookiSchema = new mongoose.Schema({
  inscriptionId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  stats: {
    HP: Number,
    Attack: Number,
    Defense: Number,
    Speed: Number,
    // Add any other stats as necessary
  },
});

// Define the User schema
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  twitterHandle: {
    type: String,
  },
  deployedOrdinooki: OrdinookiSchema, // Embedded Ordinooki schema to store deployed Ordinooki
});

// Hash the password before saving the user
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare input password with hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
