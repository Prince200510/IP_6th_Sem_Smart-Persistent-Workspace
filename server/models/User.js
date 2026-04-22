const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, trim: true },
  city: { type: String, trim: true },
  country: { type: String, trim: true }
});

module.exports = mongoose.model('User', UserSchema);
