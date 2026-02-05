const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'กรุณากรอกชื่อผู้ใช้'],
    unique: true,
    trim: true,
    minlength: [3, 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร']
  },
  password: {
    type: String,
    required: [true, 'กรุณากรอกรหัสผ่าน'],
    minlength: [6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร']
  },
  role: {
    type: String,
    enum: ['member', 'admin'],
    default: 'member'
  }
}, {
  timestamps: true
});

// Hash password before saving
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

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
